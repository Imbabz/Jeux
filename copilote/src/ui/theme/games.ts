import type { GameId, PlayerId } from '../../engine/index.ts';

/** Habillage par jeu (DESIGN §1.2). Classes littérales pour que Tailwind les détecte. */
export const GAME_THEME: Record<
  GameId,
  { name: string; rule: string; bg: string; text: string; border: string; deep: string }
> = {
  bac: {
    name: 'Bac Éclair',
    rule: 'Une catégorie, une lettre : le premier mot valable marque.',
    bg: 'bg-bac',
    text: 'text-bac',
    border: 'border-bac',
    deep: '[--btn-deep:var(--color-bac-deep)]',
  },
  year: {
    name: 'Quelle année ?',
    rule: 'Un événement : le plus proche de l’année marque, pile la bonne vaut double.',
    bg: 'bg-year',
    text: 'text-year',
    border: 'border-year',
    deep: '[--btn-deep:var(--color-year-deep)]',
  },
  estim: {
    name: 'Estimation',
    rule: 'Un chiffre à deviner : le plus proche en proportion marque.',
    bg: 'bg-estim',
    text: 'text-estim',
    border: 'border-estim',
    deep: '[--btn-deep:var(--color-estim-deep)]',
  },
};

/** Habillage par joueur (DESIGN §1.3). */
export const PLAYER_THEME: Record<
  PlayerId,
  { bg: string; text: string; border: string; ring: string; fill: string; deep: string }
> = {
  A: {
    bg: 'bg-player-a',
    text: 'text-on-player-a',
    border: 'border-player-a',
    ring: 'ring-player-a',
    fill: 'var(--color-player-a)',
    deep: '[--btn-deep:var(--color-player-a-deep)]',
  },
  B: {
    bg: 'bg-player-b',
    text: 'text-on-player-b',
    border: 'border-player-b',
    ring: 'ring-player-b',
    fill: 'var(--color-player-b)',
    deep: '[--btn-deep:var(--color-player-b-deep)]',
  },
};

export const initialOf = (name: string) => (name.trim()[0] ?? '?').toUpperCase();
