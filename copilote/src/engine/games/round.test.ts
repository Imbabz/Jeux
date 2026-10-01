import { describe, expect, it } from 'vitest';
import { drawEstim } from './estim/draw.ts';
import { mulberry32 } from '../rng.ts';
import { item } from '../test/fixtures.ts';
import {
  initRound,
  reduceRound,
  roundItem,
  skipRound,
  suddenDeathWinner,
  summarizeRound,
} from './round.ts';

const settings = { multiplier: 1, exactBonus: true, together: 'replay' as const };

describe('interface commune des mini-jeux', () => {
  it('crée la bonne machine selon le jeu', () => {
    expect(initRound('bac', [item(1)], settings).kind).toBe('bac');
    expect(initRound('estim', [item(1)], settings).kind).toBe('estim');
    expect(roundItem(initRound('year', [item(4)], settings)).id).toBe('yr-0004');
  });

  it('ignore une action destinée à un autre jeu', () => {
    const bac = initRound('bac', [item(1)], settings);
    expect(reduceRound(bac, 'year', { type: 'READ' })).toBe(bac);
    expect(reduceRound(bac, 'bac', { type: 'FLIP', letter: 'A' }).kind).toBe('bac');
    expect(skipRound(bac, item(5)).items[0]?.id).toBe('yr-0005');
    expect(skipRound(initRound('year', [item(1)], settings), item(6)).items[0]?.id).toBe('yr-0006');
  });

  it('départage la mort subite des jeux au plus proche', () => {
    let estim = initRound('estim', [item(1, 100)], settings);
    for (const action of [
      { type: 'READ' },
      { type: 'THINK_DONE' },
      { type: 'COUNTDOWN_DONE' },
      { type: 'INPUT', player: 'A', value: 90 },
      { type: 'INPUT', player: 'B', value: 300 },
      { type: 'REVEAL' },
    ] as const) {
      estim = reduceRound(estim, 'estim', action);
    }
    expect(suddenDeathWinner(estim)).toBe('A');
    expect(suddenDeathWinner(initRound('year', [item(1)], settings))).toBeNull();
    expect(summarizeRound(estim).points).toEqual({ A: 1, B: 0 });
  });

  it('drawEstim renvoie la réponse numérique', () => {
    const pool = [{ id: 'est-0001', packs: ['general'], difficulty: 1 as const, answer: 206 }];
    const ctx = {
      packs: ['general'],
      flagged: new Set<string>(),
      seen: new Map(),
      avoidSeen: true,
      used: new Set<string>(),
    };
    expect(drawEstim(pool, [1], ctx, mulberry32(1))).toEqual([{ id: 'est-0001', answer: 206 }]);
  });
});
