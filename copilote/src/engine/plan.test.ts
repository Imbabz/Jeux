import { describe, expect, it } from 'vitest';
import { difficultyCurve, planRounds, singleDifficulty } from './plan.ts';
import type { GameId } from './types.ts';

const count = (plan: GameId[], game: GameId) => plan.filter((g) => g === game).length;
const hasConsecutiveRepeat = (plan: GameId[]) => plan.some((g, i) => i > 0 && plan[i - 1] === g);

describe('planRounds', () => {
  it('équilibre 3 jeux sur 6 et 9 manches, sans répétition consécutive', () => {
    for (let seed = 0; seed < 300; seed++) {
      for (const rounds of [6, 9]) {
        const plan = planRounds(['bac', 'year', 'estim'], rounds, seed);
        expect(plan).toHaveLength(rounds);
        for (const g of ['bac', 'year', 'estim'] as const) expect(count(plan, g)).toBe(rounds / 3);
        expect(hasConsecutiveRepeat(plan)).toBe(false);
      }
    }
  });

  it('gère un dernier bloc incomplet et deux jeux', () => {
    for (let seed = 0; seed < 100; seed++) {
      const plan = planRounds(['year', 'estim'], 3, seed);
      expect(plan).toHaveLength(3);
      expect(hasConsecutiveRepeat(plan)).toBe(false);
      expect(Math.abs(count(plan, 'year') - count(plan, 'estim'))).toBe(1);
    }
  });

  it('répète le jeu s’il est seul activé', () => {
    expect(planRounds(['year'], 3, 1)).toEqual(['year', 'year', 'year']);
  });

  it('est déterministe à seed égale', () => {
    expect(planRounds(['bac', 'year', 'estim'], 9, 99)).toEqual(
      planRounds(['bac', 'year', 'estim'], 9, 99),
    );
    const plans = new Set(
      Array.from({ length: 30 }, (_, s) => planRounds(['bac', 'year', 'estim'], 6, s).join()),
    );
    expect(plans.size).toBeGreaterThan(1);
  });
});

describe('courbe de difficulté', () => {
  it('suit les tables de GAME_DESIGN §4.3', () => {
    expect(difficultyCurve(5, 'mixed')).toEqual([1, 1, 2, 2, 3]);
    expect(difficultyCurve(3, 'mixed')).toEqual([1, 2, 3]);
    expect(difficultyCurve(7, 'mixed')).toEqual([1, 1, 2, 2, 2, 3, 3]);
    expect(difficultyCurve(5, 'easy').every((d) => d <= 2)).toBe(true);
    expect(difficultyCurve(7, 'hard').every((d) => d >= 2)).toBe(true);
    for (const q of [3, 5, 7] as const) {
      for (const m of ['easy', 'mixed', 'hard'] as const) {
        const curve = difficultyCurve(q, m);
        expect(curve).toHaveLength(q);
        expect([...curve].sort()).toEqual(curve);
      }
    }
  });

  it('donne une difficulté isolée par mode', () => {
    expect(singleDifficulty('easy')).toBe(1);
    expect(singleDifficulty('mixed')).toBe(2);
    expect(singleDifficulty('hard')).toBe(3);
  });
});
