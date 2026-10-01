import { describe, expect, it } from 'vitest';
import {
  estimAnswerLabel,
  formatNumber,
  formatQuantity,
  parseEstimInput,
  plural,
  ratioLabel,
  scoreLine,
  yearGapLabel,
} from './format.ts';

const nb = (s: string) => s.replace(/\u00a0/g, ' ');

describe('formats', () => {
  it('nombres et grandeurs en français', () => {
    expect(nb(formatNumber(384400))).toBe('384 400');
    expect(formatNumber(2.5)).toBe('2,5');
    expect(nb(formatQuantity(6_700_000))).toBe('6,7 millions');
    expect(nb(formatQuantity(1_500_000))).toBe('1,5 million');
    expect(nb(formatQuantity(1_400_000_000))).toBe('1,4 milliard');
    expect(nb(formatQuantity(8_200_000_000))).toBe('8,2 milliards');
    expect(nb(formatQuantity(42.195))).toBe('42,2');
  });

  it('libellés de réponse et d’écart', () => {
    expect(nb(estimAnswerLabel(11_800_000, 'habitants', true))).toBe('≈ 11,8 millions d’habitants');
    expect(nb(estimAnswerLabel(150_000_000, 'km', false))).toBe('150 millions de km');
    expect(estimAnswerLabel(206, 'os', false)).toBe('206 os');
    expect(ratioLabel(1.34, false)).toBe('×1,3');
    expect(ratioLabel(12.4, false)).toBe('×12');
    expect(ratioLabel(812_500, false)).toBe('plus de ×100');
    expect(ratioLabel(1, true)).toBe('dans le mille !');
    expect(ratioLabel(null, false)).toBe('pas de réponse');
    expect(yearGapLabel(1, false)).toBe('à 1 an');
    expect(yearGapLabel(3, false)).toBe('à 3 ans');
    expect(yearGapLabel(0, true)).toBe('pile !');
    expect(plural(1, 'manche', 'manches')).toBe('1 manche');
    expect(scoreLine({ A: 'Léa', B: 'Tom' }, { A: 3, B: 2 })).toBe('Léa 3 – 2 Tom');
  });

  it('lit la saisie du pavé d’Estimation', () => {
    expect(parseEstimInput('6,5', 1e6)).toBe(6_500_000);
    expect(parseEstimInput('206', 1)).toBe(206);
    expect(parseEstimInput('', 1)).toBe(0);
    expect(parseEstimInput('12,', 1e3)).toBe(12_000);
  });
});
