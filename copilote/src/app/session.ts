import { useSyncExternalStore } from 'react';
import type { Content, YearContentItem } from '../content/index.ts';
import {
  activeItem,
  availableItems,
  canUndo,
  createRng,
  difficultyCurve,
  drawYear,
  eventLabel,
  MIN_ITEMS_PER_GAME,
  needsRestart,
  reduceMatch,
  replay,
  SALT,
  singleDifficulty,
  undoLastDecision,
  type DrawContext,
  type GameId,
  type MatchConfig,
  type MatchEventBody,
  type MatchState,
  type RoundItem,
} from '../engine/index.ts';
import { haptics, logger, sound, storage, wakeLock } from '../services/index.ts';
import {
  DEFAULT_SETTINGS,
  matchRecordSchema,
  seenSchema,
  settingsSchema,
  type MatchRecord,
  type SeenStore,
  type Settings,
} from './schemas.ts';

/**
 * Session de l'application : relie le moteur pur, le contenu et les services (effets de bord).
 * L'UI lit un instantané immuable et appelle des actions ; elle ne contient aucune règle de jeu.
 */

export type Screen = 'home' | 'setup' | 'match';

export interface Snapshot {
  readonly content: Content | null;
  readonly screen: Screen;
  readonly record: MatchRecord | null;
  readonly match: MatchState | null;
  readonly paused: boolean;
  readonly settings: Settings;
}

type Listener = () => void;

const EMPTY_SEEN: SeenStore = { schemaVersion: 1, seq: 0, items: {} };

let snapshot: Snapshot = {
  content: null,
  screen: 'home',
  record: null,
  match: null,
  paused: false,
  settings: DEFAULT_SETTINGS,
};
let seen: SeenStore = EMPTY_SEEN;
const listeners = new Set<Listener>();

function set(patch: Partial<Snapshot>) {
  snapshot = { ...snapshot, ...patch };
  for (const listener of listeners) listener();
}

function persistRecord(record: MatchRecord | null) {
  if (record) storage.write('currentMatch', record);
  else storage.remove('currentMatch');
}

function applySettingsToServices(settings: Settings) {
  sound.setEnabled(settings.sound);
  haptics.setEnabled(settings.haptics);
}

function randomUint32(): number {
  const override = new URLSearchParams(window.location.search).get('seed');
  if (override !== null && /^\d+$/.test(override)) return Number(override) >>> 0;
  return crypto.getRandomValues(new Uint32Array(1))[0] as number;
}

function newMatchId(): string {
  return typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `m-${Date.now()}-${randomUint32()}`;
}

function markSeen(ids: readonly string[]) {
  let seq = seen.seq;
  const items = { ...seen.items };
  for (const id of ids) items[id] = ++seq;
  seen = { schemaVersion: 1, seq, items };
  storage.write('seen', seen);
}

// ── Contenu ───────────────────────────────────────────────────────────────

function poolFor(content: Content, game: GameId): readonly YearContentItem[] {
  return game === 'year' ? content.year : [];
}

/** Nombre d'items du jeu dans les packs sélectionnés (pour la configuration). */
export function countItems(content: Content, game: GameId, packs: readonly string[]): number {
  return availableItems(poolFor(content, game), packs, new Set()).length;
}

/** Un jeu est jouable s'il est implémenté et dispose d'au moins 10 items (GAME_DESIGN §11.3). */
export function isGamePlayable(content: Content, game: GameId, packs: readonly string[]): boolean {
  return game === 'year' && countItems(content, game, packs) >= MIN_ITEMS_PER_GAME;
}

function drawContext(state: MatchState): DrawContext {
  return {
    packs: state.config.packs,
    flagged: new Set(),
    seen: new Map(Object.entries(seen.items)),
    avoidSeen: snapshot.settings.avoidSeen,
    used: new Set(state.usedItemIds),
  };
}

function draw(
  state: MatchState,
  game: GameId,
  targets: readonly number[],
  ...salt: number[]
): RoundItem[] {
  const content = snapshot.content;
  if (!content) return [];
  const rng = createRng(state.seed, ...salt);
  const pool = poolFor(content, game);
  return drawYear(pool, targets as Parameters<typeof drawYear>[1], drawContext(state), rng);
}

// ── Journal de partie ─────────────────────────────────────────────────────

function commit(record: MatchRecord, match: MatchState) {
  persistRecord(record);
  set({ record, match });
}

/** Ajoute un événement s'il est valide dans l'état courant (sinon il est ignoré et journalisé). */
function dispatch(body: MatchEventBody) {
  const { record, match } = snapshot;
  if (!record || !match) return;
  const next = reduceMatch(match, body);
  if (next === match) {
    logger.warn(`Événement ignoré : ${eventLabel(body)}`);
    return;
  }
  // Une carte lue ou passée est marquée « vue » (GAME_DESIGN §11.2).
  if ((body.type === 'year' || body.type === 'estim') && body.action.type === 'READ') {
    const item = activeItem(match);
    if (item) markSeen([item.id]);
  }
  if (body.type === 'ITEM_SKIPPED') {
    const item = activeItem(match);
    if (item) markSeen([item.id]);
  }
  const event = { ...body, at: Date.now() } as MatchRecord['events'][number];
  commit({ ...record, events: [...record.events, event] }, next);
}

// ── Actions ───────────────────────────────────────────────────────────────

export const actions = {
  dispatch,

  goHome() {
    wakeLock.release();
    set({ screen: 'home', paused: false });
  },

  goSetup() {
    set({ screen: 'setup' });
  },

  /** À appeler depuis le tap « Lancer » : débloque l'audio iOS dans le geste utilisateur. */
  startMatch(config: MatchConfig) {
    sound.unlock();
    const seed = randomUint32();
    const record: MatchRecord = {
      schemaVersion: 1,
      matchId: newMatchId(),
      config: config as MatchRecord['config'],
      seed,
      events: [],
    };
    logger.info('Nouvelle partie', { seed, games: config.games });
    wakeLock.acquire();
    commit(record, replay(record.config, seed, []));
    set({ screen: 'match', paused: false });
  },

  resumeMatch() {
    const { record, match } = snapshot;
    if (!record || !match) return;
    sound.unlock();
    wakeLock.acquire();
    set({ screen: 'match', paused: false });
    if (needsRestart(match)) dispatch({ type: 'TURN_RESTARTED' });
  },

  /** Tire les items de la manche à venir et la démarre (GAME_DESIGN §6.2). */
  startRound() {
    const match = snapshot.match;
    if (!match || match.phase !== 'roundIntro') return;
    const game = match.plan[match.roundIndex] as GameId;
    const targets = difficultyCurve(match.config.questionsPerRound, match.config.difficulty);
    const items = draw(match, game, targets, SALT.items, match.roundIndex);
    dispatch({ type: 'ROUND_STARTED', round: match.roundIndex, game, items });
  },

  startSuddenDeath() {
    const match = snapshot.match;
    if (!match || match.phase !== 'suddenDeathIntro') return;
    const game: GameId = match.config.games.includes('estim') ? 'estim' : 'year';
    const [item] = draw(
      match,
      game,
      [singleDifficulty(match.config.difficulty)],
      SALT.suddenDeath,
      match.suddenDeathAttempts,
    );
    if (item) dispatch({ type: 'SUDDEN_DEATH_STARTED', game, item });
  },

  canSkip(): boolean {
    const match = snapshot.match;
    if (!match?.current || match.current.phase === 'revealed') return false;
    return draw(match, match.current.kind, [1], SALT.skip, match.usedItemIds.length).length > 0;
  },

  skip() {
    const match = snapshot.match;
    if (!match?.current) return;
    const target = singleDifficulty(match.config.difficulty);
    const [replacement] = draw(
      match,
      match.current.kind,
      [target],
      SALT.skip,
      match.usedItemIds.length,
    );
    if (replacement) dispatch({ type: 'ITEM_SKIPPED', replacement });
  },

  canUndo(): boolean {
    return snapshot.record ? canUndo(snapshot.record.events) : false;
  },

  undo() {
    const record = snapshot.record;
    if (!record) return;
    const events = undoLastDecision(record.events);
    logger.info('Annuler', { removed: record.events.length - events.length });
    commit({ ...record, events }, replay(record.config, record.seed, events));
  },

  setPaused(paused: boolean) {
    if (snapshot.paused !== paused) set({ paused });
  },

  abandon() {
    dispatch({ type: 'MATCH_ABANDONED' });
    persistRecord(null);
    wakeLock.release();
    set({ record: null, match: null, screen: 'home', paused: false });
  },

  /** Revanche : même configuration, nouvelle seed. */
  rematch() {
    const config = snapshot.record?.config;
    if (config) actions.startMatch(config);
  },

  leaveFinishedMatch() {
    persistRecord(null);
    wakeLock.release();
    set({ record: null, match: null, screen: 'home', paused: false });
  },

  saveSettings(patch: Partial<Settings>) {
    const settings = { ...snapshot.settings, ...patch };
    storage.write('settings', settings);
    applySettingsToServices(settings);
    set({ settings });
  },
};

// ── Démarrage ─────────────────────────────────────────────────────────────

export async function initSession(source: { load(): Promise<Content> }) {
  const settings = storage.read('settings', settingsSchema, DEFAULT_SETTINGS);
  applySettingsToServices(settings);
  seen = storage.read('seen', seenSchema, EMPTY_SEEN);
  const stored = storage.read('currentMatch', matchRecordSchema.nullable(), null);
  let record: MatchRecord | null = null;
  let match: MatchState | null = null;
  if (stored) {
    const state = replay(stored.config, stored.seed, stored.events);
    if (state.phase === 'finished' || state.phase === 'abandoned') persistRecord(null);
    else {
      record = stored;
      match = state;
    }
  }
  const content = await source.load();
  if (content.rejected.length > 0) logger.warn('Items de contenu rejetés', content.rejected);
  set({ settings, record, match, content });

  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden' && snapshot.screen === 'match')
      actions.setPaused(true);
  });
}

// ── Accès React ───────────────────────────────────────────────────────────

function subscribe(listener: Listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function useSession(): Snapshot {
  return useSyncExternalStore(subscribe, () => snapshot);
}

/** Pour les tests : remet la session à zéro. */
export function resetSessionForTests(content: Content | null = null) {
  seen = EMPTY_SEEN;
  snapshot = {
    content,
    screen: 'home',
    record: null,
    match: null,
    paused: false,
    settings: DEFAULT_SETTINGS,
  };
}

export function getSnapshot(): Snapshot {
  return snapshot;
}
