import type { RoundItem } from '../../types.ts';
import type { RoundOptions, RoundSummary } from '../closest/machine.ts';

/**
 * Machine à états d'une manche de Bac Éclair (GAME_DESIGN §7.1).
 * hidden → countdown → running → (timeout) → resolved → (tour suivant).
 * La lettre est tirée par l'app et inscrite dans l'événement FLIP (fait enregistré, §6.2).
 * Tout événement invalide dans l'état courant renvoie l'état inchangé (même référence).
 */

export type BacPhase = 'hidden' | 'countdown' | 'running' | 'timeout' | 'resolved';
export type BacWinner = 'A' | 'B' | 'both' | 'none';

export type BacAction =
  | { readonly type: 'FLIP'; readonly letter: string }
  | { readonly type: 'COUNTDOWN_DONE' }
  | { readonly type: 'BUZZ'; readonly who: 'A' | 'B' | 'both' }
  | { readonly type: 'TIMER_EXPIRED' }
  | { readonly type: 'NOBODY' }
  | { readonly type: 'CONTESTED' }
  | { readonly type: 'NEXT' };

export interface BacResult {
  readonly item: RoundItem;
  readonly letter: string;
  readonly winner: BacWinner;
  readonly points: { readonly A: number; readonly B: number };
  /** Vrai si le tour a été clos sans point après trop de rejeux (GAME_DESIGN §7.2). */
  readonly voided: boolean;
}

export interface BacRoundState {
  readonly kind: 'bac';
  readonly items: readonly RoundItem[];
  readonly index: number;
  readonly phase: BacPhase;
  /** Lettre du tour en cours (null tant que la carte n'est pas retournée). */
  readonly letter: string | null;
  /** Lettres déjà tirées pour ce tour et le précédent : jamais deux fois de suite (§7.3). */
  readonly usedLetters: readonly string[];
  readonly replays: number;
  readonly results: readonly BacResult[];
  readonly multiplier: number;
  readonly together: 'replay' | 'both';
  readonly done: boolean;
}

/** Au 3e rejeu consécutif, le tour est clos sans point (🎲 D3). */
export const MAX_REPLAYS = 3;

export interface BacOptions extends RoundOptions {
  readonly together: 'replay' | 'both';
}

export function initBacRound(items: readonly RoundItem[], options: BacOptions): BacRoundState {
  return {
    kind: 'bac',
    items,
    index: 0,
    phase: 'hidden',
    letter: null,
    usedLetters: [],
    replays: 0,
    results: [],
    multiplier: options.multiplier,
    together: options.together,
    done: false,
  };
}

const isLetter = (value: string) => /^[A-Z]$/.test(value);

function resolve(state: BacRoundState, winner: BacWinner, voided = false): BacRoundState {
  const m = state.multiplier;
  const points = {
    A: winner === 'A' || winner === 'both' ? m : 0,
    B: winner === 'B' || winner === 'both' ? m : 0,
  };
  const result: BacResult = {
    item: state.items[state.index] as RoundItem,
    letter: state.letter as string,
    winner,
    points,
    voided,
  };
  return { ...state, phase: 'resolved', results: [...state.results, result] };
}

/** Rejoue le tour : même catégorie, nouvelle lettre ; au-delà du plafond, tour clos sans point. */
function replay(state: BacRoundState): BacRoundState {
  const replays = state.replays + 1;
  if (replays >= MAX_REPLAYS) return resolve({ ...state, replays }, 'none', true);
  return { ...state, phase: 'hidden', letter: null, replays };
}

export function reduceBac(state: BacRoundState, action: BacAction): BacRoundState {
  if (state.done) return state;
  switch (action.type) {
    case 'FLIP':
      if (
        state.phase !== 'hidden' ||
        !isLetter(action.letter) ||
        state.usedLetters.includes(action.letter)
      ) {
        return state;
      }
      return {
        ...state,
        phase: 'countdown',
        letter: action.letter,
        usedLetters: [...state.usedLetters, action.letter],
      };
    case 'COUNTDOWN_DONE':
      return state.phase === 'countdown' ? { ...state, phase: 'running' } : state;
    case 'TIMER_EXPIRED':
      return state.phase === 'running' ? { ...state, phase: 'timeout' } : state;
    case 'BUZZ':
      if (action.who === 'both') {
        if (state.phase !== 'running') return state;
        return state.together === 'both' ? resolve(state, 'both') : replay(state);
      }
      return state.phase === 'running' || state.phase === 'timeout'
        ? resolve(state, action.who)
        : state;
    case 'NOBODY':
      return state.phase === 'timeout' ? resolve(state, 'none') : state;
    case 'CONTESTED': {
      const last = state.results[state.results.length - 1];
      if (state.phase !== 'resolved' || !last || last.winner === 'none') return state;
      return replay({ ...state, results: state.results.slice(0, -1) });
    }
    case 'NEXT': {
      if (state.phase !== 'resolved') return state;
      if (state.index + 1 >= state.items.length) return { ...state, done: true };
      return {
        ...state,
        index: state.index + 1,
        phase: 'hidden',
        letter: null,
        usedLetters: [state.letter as string],
        replays: 0,
      };
    }
  }
}

/** Passer : nouvelle catégorie, nouvelle lettre, même tour, aucun point (GAME_DESIGN §7.4). */
export function skipBac(state: BacRoundState, replacement: RoundItem): BacRoundState {
  if (state.done || state.phase === 'resolved') return state;
  const items = state.items.map((item, i) => (i === state.index ? replacement : item));
  return { ...state, items, phase: 'hidden', letter: null, replays: 0 };
}

/** Reprise après fermeture : un tour chronométré reprend au décompte, même lettre (§10.3). */
export function restartBac(state: BacRoundState): BacRoundState {
  return state.phase === 'running' ? { ...state, phase: 'countdown' } : state;
}

export function summarizeBac(state: BacRoundState): RoundSummary {
  const sum = (p: 'A' | 'B') => state.results.reduce((acc, r) => acc + r.points[p], 0);
  return { points: { A: sum('A'), B: sum('B') }, exacts: { A: 0, B: 0 } };
}

/** Gagnant d'une mort subite au Bac Éclair : seul un mot gagnant unique départage. */
export function bacDecider(state: BacRoundState): 'A' | 'B' | null {
  const winner = state.results[0]?.winner;
  return winner === 'A' || winner === 'B' ? winner : null;
}
