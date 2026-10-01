import type { MatchEventBody } from './events.ts';
import type { RoundSummary } from './games/closest/machine.ts';
import {
  initRound,
  reduceRound,
  restartRound,
  roundItem,
  skipRound,
  suddenDeathWinner,
  summarizeRound,
  type GameRoundState,
} from './games/round.ts';
import { planRounds } from './plan.ts';
import type { GameId, MatchConfig, PerPlayer, PlayerId, RoundItem } from './types.ts';

/**
 * Partie complète, dérivée d'un journal d'événements par une fonction pure (GAME_DESIGN §3 et §6).
 * Tout événement invalide dans l'état courant renvoie l'état inchangé (même référence).
 */

export type MatchPhase =
  | 'opening'
  | 'roundIntro'
  | 'playing'
  | 'roundRecap'
  | 'suddenDeathIntro'
  | 'suddenDeath'
  | 'finished'
  | 'abandoned';

export type { GameRoundState } from './games/round.ts';

export interface RoundRecord {
  readonly round: number;
  readonly game: GameId;
  readonly points: PerPlayer<number>;
  readonly exacts: PerPlayer<number>;
  /** Gagnant de la manche : il reçoit le jeton ; en cas d'égalité, chacun en reçoit un. */
  readonly winner: PlayerId | 'tie';
}

export interface MatchState {
  readonly config: MatchConfig;
  readonly seed: number;
  readonly phase: MatchPhase;
  readonly plan: readonly GameId[];
  /** Index (0-based) de la manche en cours ou à venir. */
  readonly roundIndex: number;
  readonly current: GameRoundState | null;
  readonly rounds: readonly RoundRecord[];
  readonly suddenDeathAttempts: number;
  readonly winner: PlayerId | null;
  readonly wonBySuddenDeath: boolean;
  /** Ids des items tirés dans cette partie : jamais reposés (GAME_DESIGN §11.1). */
  readonly usedItemIds: readonly string[];
}

export function initialMatchState(config: MatchConfig, seed: number): MatchState {
  return {
    config,
    seed,
    phase: 'opening',
    plan: planRounds(config.games, config.rounds, seed),
    roundIndex: 0,
    current: null,
    rounds: [],
    suddenDeathAttempts: 0,
    winner: null,
    wonBySuddenDeath: false,
    usedItemIds: [],
  };
}

export function isFinalRound(state: MatchState): boolean {
  return state.roundIndex === state.config.rounds - 1;
}

export function roundMultiplier(state: MatchState): number {
  return isFinalRound(state) && state.config.rules.doubleFinalRound ? 2 : 1;
}

function summarize(round: GameRoundState): RoundSummary {
  return summarizeRound(round);
}

function roundSettings(state: MatchState, multiplier: number) {
  return {
    multiplier,
    exactBonus: state.config.rules.exactBonus,
    together: state.config.rules.bacTogether,
  };
}

/** Score total : manches terminées + manche en cours (la mort subite n'ajoute aucun point). */
export function totals(state: MatchState): PerPlayer<number> {
  const live =
    state.phase === 'playing' && state.current ? summarize(state.current).points : { A: 0, B: 0 };
  return state.rounds.reduce((acc, r) => ({ A: acc.A + r.points.A, B: acc.B + r.points.B }), live);
}

/** Points marqués dans la manche en cours (ou qui vient de se terminer). */
export function currentRoundPoints(state: MatchState): PerPlayer<number> {
  if (state.phase === 'roundRecap')
    return (state.rounds[state.rounds.length - 1] as RoundRecord).points;
  return state.phase === 'playing' && state.current
    ? summarize(state.current).points
    : { A: 0, B: 0 };
}

/** Jetons gagnés, dans l'ordre des manches (GAME_DESIGN §3). */
export function tokens(state: MatchState): PerPlayer<readonly GameId[]> {
  const of = (player: PlayerId) =>
    state.rounds.filter((r) => r.winner === player || r.winner === 'tie').map((r) => r.game);
  return { A: of('A'), B: of('B') };
}

/** Points cumulés par jeu, pour le récap de fin de partie. */
export function pointsByGame(state: MatchState): Partial<Record<GameId, PerPlayer<number>>> {
  const out: Partial<Record<GameId, PerPlayer<number>>> = {};
  for (const r of state.rounds) {
    const prev = out[r.game] ?? { A: 0, B: 0 };
    out[r.game] = { A: prev.A + r.points.A, B: prev.B + r.points.B };
  }
  return out;
}

export function exactCount(state: MatchState): PerPlayer<number> {
  return state.rounds.reduce((acc, r) => ({ A: acc.A + r.exacts.A, B: acc.B + r.exacts.B }), {
    A: 0,
    B: 0,
  });
}

/** Meneur actuel, ou `null` en cas d'égalité. */
export function leader(state: MatchState): PlayerId | null {
  const t = totals(state);
  return t.A === t.B ? null : t.A > t.B ? 'A' : 'B';
}

/** Vrai si l'état courant est chronométré et doit repartir du début après une fermeture (§10.3). */
export function needsRestart(state: MatchState): boolean {
  const inRound = state.phase === 'playing' || state.phase === 'suddenDeath';
  const current = state.current as GameRoundState;
  return inRound && restartRound(current) !== current;
}

/** Item affiché à l'écran, s'il y en a un. */
export function activeItem(state: MatchState): RoundItem | null {
  const inRound = state.phase === 'playing' || state.phase === 'suddenDeath';
  return inRound && state.current ? roundItem(state.current) : null;
}

function finishRound(state: MatchState, round: GameRoundState): MatchState {
  const summary = summarize(round);
  const { A, B } = summary.points;
  const record: RoundRecord = {
    round: state.roundIndex,
    game: round.kind,
    points: summary.points,
    exacts: summary.exacts,
    winner: A === B ? 'tie' : A > B ? 'A' : 'B',
  };
  return { ...state, phase: 'roundRecap', current: round, rounds: [...state.rounds, record] };
}

function finishSuddenDeath(state: MatchState, round: GameRoundState): MatchState {
  const winner = suddenDeathWinner(round);
  if (winner) {
    return { ...state, phase: 'finished', current: round, winner, wonBySuddenDeath: true };
  }
  return {
    ...state,
    phase: 'suddenDeathIntro',
    current: null,
    suddenDeathAttempts: state.suddenDeathAttempts + 1,
  };
}

function afterRecap(state: MatchState): MatchState {
  if (state.roundIndex + 1 < state.config.rounds) {
    return { ...state, phase: 'roundIntro', roundIndex: state.roundIndex + 1, current: null };
  }
  const t = totals(state);
  if (t.A === t.B) return { ...state, phase: 'suddenDeathIntro', current: null };
  return { ...state, phase: 'finished', current: null, winner: t.A > t.B ? 'A' : 'B' };
}

export function reduceMatch(state: MatchState, event: MatchEventBody): MatchState {
  switch (event.type) {
    case 'OPENING_DONE':
      return state.phase === 'opening' ? { ...state, phase: 'roundIntro' } : state;

    case 'ROUND_STARTED': {
      const valid =
        state.phase === 'roundIntro' && event.round === state.roundIndex && event.items.length > 0;
      if (!valid) return state;
      const plan = state.plan.map((g, i) => (i === state.roundIndex ? event.game : g));
      const current = initRound(
        event.game,
        event.items,
        roundSettings(state, roundMultiplier(state)),
      );
      return {
        ...state,
        phase: 'playing',
        plan,
        current,
        usedItemIds: [...state.usedItemIds, ...event.items.map((i) => i.id)],
      };
    }

    case 'ROUND_RECAP_DONE':
      return state.phase === 'roundRecap' ? afterRecap(state) : state;

    case 'SUDDEN_DEATH_STARTED': {
      if (state.phase !== 'suddenDeathIntro') return state;
      const current = initRound(event.game, [event.item], roundSettings(state, 1));
      return {
        ...state,
        phase: 'suddenDeath',
        current,
        usedItemIds: [...state.usedItemIds, event.item.id],
      };
    }

    case 'ITEM_SKIPPED': {
      if ((state.phase !== 'playing' && state.phase !== 'suddenDeath') || !state.current)
        return state;
      const current = skipRound(state.current, event.replacement);
      if (current === state.current) return state;
      return { ...state, current, usedItemIds: [...state.usedItemIds, event.replacement.id] };
    }

    case 'TURN_RESTARTED': {
      if (!needsRestart(state)) return state;
      return { ...state, current: restartRound(state.current as GameRoundState) };
    }

    case 'MATCH_ABANDONED':
      return state.phase === 'finished' || state.phase === 'abandoned'
        ? state
        : { ...state, phase: 'abandoned' };

    case 'year':
    case 'estim':
    case 'bac': {
      const inRound = state.phase === 'playing' || state.phase === 'suddenDeath';
      if (!inRound || !state.current) return state;
      const current = reduceRound(state.current, event.type, event.action);
      if (current === state.current) return state;
      if (!current.done) return { ...state, current };
      return state.phase === 'playing'
        ? finishRound(state, current)
        : finishSuddenDeath(state, current);
    }
  }
}

/** Rejoue un journal complet. */
export function replay(
  config: MatchConfig,
  seed: number,
  events: readonly MatchEventBody[],
): MatchState {
  return events.reduce(reduceMatch, initialMatchState(config, seed));
}
