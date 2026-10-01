import { describe, expect, it } from 'vitest';
import { GAME_IDS, PLAYERS } from './types.ts';

describe('constantes', () => {
  it('liste les joueurs et les jeux', () => {
    expect(PLAYERS).toEqual(['A', 'B']);
    expect(GAME_IDS).toEqual(['bac', 'year', 'estim']);
  });
});
