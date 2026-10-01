import { describe, expect, it } from 'vitest';
import { scoreYear } from '../year/scoring.ts';
import { compareProposals, gapOf, isExact, scoreClosest } from './scoring.ts';

const on = { exactBonus: true, multiplier: 1 };

describe('Quelle année ? — scoring', () => {
  it('le plus proche marque 1 point', () => {
    const o = scoreYear(1989, { A: 1990, B: 1980 }, on);
    expect(o).toEqual({
      winner: 'A',
      points: { A: 1, B: 0 },
      exact: { A: false, B: false },
      gap: { A: 1, B: 9 },
    });
    expect(scoreYear(1989, { A: 1950, B: 1988 }, on).winner).toBe('B');
  });

  it('une réponse exacte vaut 2 points (1 sans bonus)', () => {
    expect(scoreYear(1989, { A: 1989, B: 1990 }, on).points).toEqual({ A: 2, B: 0 });
    expect(scoreYear(1989, { A: 1989, B: 1990 }, { ...on, exactBonus: false }).points).toEqual({
      A: 1,
      B: 0,
    });
  });

  it('égalité d’écart : 1 point chacun ; deux exacts : 2 chacun', () => {
    const tie = scoreYear(1989, { A: 1987, B: 1991 }, on);
    expect(tie.winner).toBe('tie');
    expect(tie.points).toEqual({ A: 1, B: 1 });
    expect(scoreYear(1989, { A: 1989, B: 1989 }, on).points).toEqual({ A: 2, B: 2 });
  });

  it('un seul répondant marque, personne : 0', () => {
    expect(scoreYear(1989, { A: null, B: 1700 }, on)).toMatchObject({
      winner: 'B',
      points: { A: 0, B: 1 },
    });
    expect(scoreYear(1989, { A: 1989, B: null }, on)).toMatchObject({
      winner: 'A',
      points: { A: 2, B: 0 },
      gap: { A: 0, B: null },
    });
    expect(scoreYear(1989, { A: null, B: null }, on)).toMatchObject({
      winner: 'none',
      points: { A: 0, B: 0 },
    });
  });

  it('applique le multiplicateur de dernière manche', () => {
    expect(scoreYear(1989, { A: 1989, B: 1987 }, { ...on, multiplier: 2 }).points).toEqual({
      A: 4,
      B: 0,
    });
    expect(scoreYear(1989, { A: 1988, B: 1990 }, { ...on, multiplier: 2 }).points).toEqual({
      A: 2,
      B: 2,
    });
  });
});

describe('Estimation — ratio en entiers exacts', () => {
  it('compare par ratio : ×2 contre ×2 est une égalité', () => {
    expect(compareProposals('estim', 50, 200, 100)).toBe(0);
    expect(scoreClosest('estim', 100, { A: 50, B: 200 }, on).winner).toBe('tie');
  });

  it('le plus proche en proportion gagne, pas en valeur absolue', () => {
    // 50 est à ×2 de 100 (écart absolu 50) ; 190 est à ×1,9 (écart absolu 90) : B gagne.
    expect(compareProposals('estim', 50, 190, 100)).toBeGreaterThan(0);
    expect(compareProposals('estim', 60, 180, 100)).toBeLessThan(0);
    expect(compareProposals('estim', 30, 150, 100)).toBeGreaterThan(0);
    expect(scoreClosest('estim', 100, { A: 30, B: 150 }, on).winner).toBe('B');
  });

  it('exact = ratio ≤ 1,01, borne incluse', () => {
    expect(isExact('estim', 101, 100)).toBe(true);
    expect(isExact('estim', 100, 101)).toBe(true);
    expect(isExact('estim', 98.9, 100)).toBe(false);
    expect(isExact('estim', 101.01, 100)).toBe(false);
    expect(isExact('estim', 99.01, 100)).toBe(true);
    expect(isExact('estim', 6_700_000, 6_700_000)).toBe(true);
    expect(isExact('year', 1989, 1989)).toBe(true);
    expect(isExact('year', 1988, 1989)).toBe(false);
  });

  it('gère décimales et très grands nombres sans erreur d’arrondi', () => {
    expect(compareProposals('estim', 0.5, 2, 1)).toBe(0);
    expect(compareProposals('estim', 4_000_000_000, 16_000_000_000, 8_000_000_000)).toBe(0);
    expect(scoreClosest('estim', 8e9, { A: 8.05e9, B: 4e9 }, on)).toMatchObject({
      winner: 'A',
      exact: { A: true, B: false },
      points: { A: 2, B: 0 },
    });
  });

  it('expose l’écart affichable', () => {
    expect(gapOf('estim', 50, 100)).toBe(2);
    expect(gapOf('estim', 200, 100)).toBe(2);
    expect(gapOf('year', 1980, 1989)).toBe(9);
    expect(compareProposals('year', 1980, 1990, 1989)).toBeGreaterThan(0);
  });
});
