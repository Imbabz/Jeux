import type { PlayerId, RoundItem } from '../../types.ts';
import { scoreClosest, type Answer, type ClosestKind, type ClosestOutcome } from './scoring.ts';

/**
 * Machine à états d'une manche « au plus proche » (Quelle année ?, Estimation).
 * GAME_DESIGN §8.1 : read → think → countdown → inputA → inputB → ready → revealed → (question suivante).
 * Tout événement invalide dans l'état courant renvoie l'état inchangé (même référence).
 */

export type ClosestPhase =
  'read' | 'think' | 'countdown' | 'inputA' | 'inputB' | 'ready' | 'revealed';

export type ClosestAction =
  | { readonly type: 'READ' }
  | { readonly type: 'THINK_DONE' }
  | { readonly type: 'COUNTDOWN_DONE' }
  | { readonly type: 'INPUT'; readonly player: PlayerId; readonly value: Answer }
  | { readonly type: 'REVEAL' }
  | { readonly type: 'NEXT' };

export interface ClosestResult {
  readonly item: RoundItem;
  readonly inputs: { readonly A: Answer; readonly B: Answer };
  readonly outcome: ClosestOutcome;
}

export interface ClosestRoundState {
  readonly kind: ClosestKind;
  readonly items: readonly RoundItem[];
  readonly index: number;
  readonly phase: ClosestPhase;
  readonly inputs: { readonly A?: Answer; readonly B?: Answer };
  readonly results: readonly ClosestResult[];
  readonly multiplier: number;
  readonly exactBonus: boolean;
  readonly done: boolean;
}

export interface RoundOptions {
  readonly multiplier: number;
  readonly exactBonus: boolean;
}

export function initClosestRound(
  kind: ClosestKind,
  items: readonly RoundItem[],
  options: RoundOptions,
): ClosestRoundState {
  return {
    kind,
    items,
    index: 0,
    phase: 'read',
    inputs: {},
    results: [],
    multiplier: options.multiplier,
    exactBonus: options.exactBonus,
    done: false,
  };
}

export function currentItem(state: ClosestRoundState): RoundItem {
  return state.items[state.index] as RoundItem;
}

const isValidAnswer = (value: Answer) => value === null || (Number.isFinite(value) && value > 0);

export function reduceClosest(state: ClosestRoundState, action: ClosestAction): ClosestRoundState {
  if (state.done) return state;
  switch (action.type) {
    case 'READ':
      return state.phase === 'read' ? { ...state, phase: 'think' } : state;
    case 'THINK_DONE':
      return state.phase === 'think' ? { ...state, phase: 'countdown' } : state;
    case 'COUNTDOWN_DONE':
      return state.phase === 'countdown' ? { ...state, phase: 'inputA' } : state;
    case 'INPUT': {
      const expected = state.phase === 'inputA' ? 'A' : state.phase === 'inputB' ? 'B' : null;
      if (action.player !== expected || !isValidAnswer(action.value)) return state;
      return {
        ...state,
        phase: expected === 'A' ? 'inputB' : 'ready',
        inputs: { ...state.inputs, [expected]: action.value },
      };
    }
    case 'REVEAL': {
      if (state.phase !== 'ready') return state;
      const item = currentItem(state);
      const inputs = { A: state.inputs.A ?? null, B: state.inputs.B ?? null };
      const outcome = scoreClosest(state.kind, item.answer, inputs, state);
      return {
        ...state,
        phase: 'revealed',
        results: [...state.results, { item, inputs, outcome }],
      };
    }
    case 'NEXT': {
      if (state.phase !== 'revealed') return state;
      if (state.index + 1 >= state.items.length) return { ...state, done: true };
      return { ...state, index: state.index + 1, phase: 'read', inputs: {} };
    }
  }
}

/** Passer (GAME_DESIGN §6.3) : remplace l'item courant tant qu'il n'est pas révélé. */
export function skipClosest(state: ClosestRoundState, replacement: RoundItem): ClosestRoundState {
  if (state.done || state.phase === 'revealed') return state;
  const items = state.items.map((item, i) => (i === state.index ? replacement : item));
  return { ...state, items, phase: 'read', inputs: {} };
}

/** Reprise après fermeture (GAME_DESIGN §10.3) : un état chronométré repart de la lecture. */
export function restartClosest(state: ClosestRoundState): ClosestRoundState {
  return state.phase === 'think' || state.phase === 'countdown'
    ? { ...state, phase: 'read' }
    : state;
}

export function needsRestartClosest(state: ClosestRoundState): boolean {
  return restartClosest(state) !== state;
}

export interface RoundSummary {
  readonly points: { readonly A: number; readonly B: number };
  readonly exacts: { readonly A: number; readonly B: number };
}

export function summarizeClosest(state: ClosestRoundState): RoundSummary {
  const sum = (pick: (r: ClosestResult) => number) =>
    state.results.reduce((acc, r) => acc + pick(r), 0);
  return {
    points: { A: sum((r) => r.outcome.points.A), B: sum((r) => r.outcome.points.B) },
    exacts: { A: sum((r) => Number(r.outcome.exact.A)), B: sum((r) => Number(r.outcome.exact.B)) },
  };
}
