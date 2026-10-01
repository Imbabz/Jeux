import type { PlayerId, RoundItem } from '../../types.ts';
import type { RoundOptions, RoundSummary } from '../closest/machine.ts';

/**
 * Machine à états d'une manche de Bac Éclair en alternance (GAME_DESIGN §7.1).
 * hidden → announce → turn ⇄ (mot validé) → (timeout) → resolved → (tour suivant).
 * Le copilote lit « Un animal… en B ! » sans chrono, puis lance : chacun son tour dit un mot,
 * avec un chrono court par mot. Celui qui sèche, se répète ou dit un mot refusé perd le tour.
 * La lettre est tirée par l'app et inscrite dans l'événement FLIP (fait enregistré, §6.2).
 * Tout événement invalide dans l'état courant renvoie l'état inchangé (même référence).
 */

export type BacPhase = 'hidden' | 'announce' | 'turn' | 'timeout' | 'resolved';

export type BacAction =
  | { readonly type: 'FLIP'; readonly letter: string }
  | { readonly type: 'START' }
  | { readonly type: 'WORD' }
  | { readonly type: 'TIMER_EXPIRED' }
  | { readonly type: 'MISS' }
  | { readonly type: 'NEXT' };

export interface BacResult {
  readonly item: RoundItem;
  readonly letter: string;
  readonly winner: PlayerId;
  readonly points: { readonly A: number; readonly B: number };
  /** Nombre de mots validés pendant l'échange. */
  readonly words: number;
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
  /** Joueur qui ouvre la première carte de la manche ; on alterne ensuite à chaque carte. */
  readonly first: PlayerId;
  /** Joueur qui doit donner le prochain mot. */
  readonly speaker: PlayerId;
  /** Mots validés dans l'échange en cours. */
  readonly words: number;
  readonly results: readonly BacResult[];
  readonly multiplier: number;
  readonly done: boolean;
}

export interface BacOptions extends RoundOptions {
  readonly first: PlayerId;
}

const other = (p: PlayerId): PlayerId => (p === 'A' ? 'B' : 'A');

/** Qui ouvre la carte n° `index` : on alterne pour que chacun commence autant de fois. */
export function starterFor(first: PlayerId, index: number): PlayerId {
  return index % 2 === 0 ? first : other(first);
}

export function initBacRound(items: readonly RoundItem[], options: BacOptions): BacRoundState {
  return {
    kind: 'bac',
    items,
    index: 0,
    phase: 'hidden',
    letter: null,
    usedLetters: [],
    first: options.first,
    speaker: options.first,
    words: 0,
    results: [],
    multiplier: options.multiplier,
    done: false,
  };
}

const isLetter = (value: string) => /^[A-Z]$/.test(value);

/** Le joueur qui parle a séché : l'autre remporte la carte. */
function miss(state: BacRoundState): BacRoundState {
  const winner = other(state.speaker);
  const m = state.multiplier;
  const result: BacResult = {
    item: state.items[state.index] as RoundItem,
    letter: state.letter as string,
    winner,
    points: { A: winner === 'A' ? m : 0, B: winner === 'B' ? m : 0 },
    words: state.words,
  };
  return { ...state, phase: 'resolved', results: [...state.results, result] };
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
        phase: 'announce',
        letter: action.letter,
        usedLetters: [...state.usedLetters, action.letter],
      };
    case 'START':
      return state.phase === 'announce' ? { ...state, phase: 'turn' } : state;
    case 'WORD':
      // Un mot dit pile au buzzer peut encore être validé par le copilote.
      return state.phase === 'turn' || state.phase === 'timeout'
        ? { ...state, phase: 'turn', speaker: other(state.speaker), words: state.words + 1 }
        : state;
    case 'TIMER_EXPIRED':
      return state.phase === 'turn' ? { ...state, phase: 'timeout' } : state;
    case 'MISS':
      return state.phase === 'turn' || state.phase === 'timeout' ? miss(state) : state;
    case 'NEXT': {
      if (state.phase !== 'resolved') return state;
      if (state.index + 1 >= state.items.length) return { ...state, done: true };
      const index = state.index + 1;
      return {
        ...state,
        index,
        phase: 'hidden',
        letter: null,
        usedLetters: [state.letter as string],
        speaker: starterFor(state.first, index),
        words: 0,
      };
    }
  }
}

/** Passer : nouvelle catégorie, nouvelle lettre, même carte, aucun point (GAME_DESIGN §7.4). */
export function skipBac(state: BacRoundState, replacement: RoundItem): BacRoundState {
  if (state.done || state.phase === 'resolved') return state;
  const items = state.items.map((item, i) => (i === state.index ? replacement : item));
  return {
    ...state,
    items,
    phase: 'hidden',
    letter: null,
    speaker: starterFor(state.first, state.index),
    words: 0,
  };
}

/** Reprise après fermeture : un échange chronométré repart de l'annonce, même joueur (§10.3). */
export function restartBac(state: BacRoundState): BacRoundState {
  return state.phase === 'turn' ? { ...state, phase: 'announce' } : state;
}

export function summarizeBac(state: BacRoundState): RoundSummary {
  const sum = (p: 'A' | 'B') => state.results.reduce((acc, r) => acc + r.points[p], 0);
  return { points: { A: sum('A'), B: sum('B') }, exacts: { A: 0, B: 0 } };
}

/** Gagnant d'une mort subite au Bac Éclair : le gagnant de l'unique carte. */
export function bacDecider(state: BacRoundState): PlayerId | null {
  return state.results[0]?.winner ?? null;
}
