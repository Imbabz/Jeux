import { describe, expect, it } from 'vitest';
import { mulberry32 } from '../../rng.ts';
import {
  allowedLetters,
  drawBac,
  drawLetter,
  LETTER_WEIGHTS,
  RARE_LETTERS,
  type BacItem,
} from './draw.ts';

describe('tirage des lettres', () => {
  it('exclut les lettres rares par défaut et les lettres interdites', () => {
    expect(allowedLetters([], false)).toHaveLength(20);
    expect(allowedLetters([], true)).toHaveLength(26);
    expect(allowedLetters(['W', 'X', 'A'], true)).not.toContain('A');
    for (const rare of RARE_LETTERS) expect(allowedLetters([], false)).not.toContain(rare);
  });

  it('respecte les exclusions et les lettres déjà utilisées, de façon déterministe', () => {
    const rng = mulberry32(5);
    for (let i = 0; i < 500; i++) {
      const letter = drawLetter(['E', 'I'], ['B'], false, rng);
      expect(letter).not.toBeNull();
      expect(['E', 'I', 'B', ...RARE_LETTERS]).not.toContain(letter);
    }
    expect(drawLetter([], [], false, mulberry32(9))).toBe(drawLetter([], [], false, mulberry32(9)));
  });

  it('pondère par la fréquence des initiales', () => {
    const rng = mulberry32(1);
    const counts: Record<string, number> = {};
    for (let i = 0; i < 20000; i++) {
      const l = drawLetter([], [], true, rng) as string;
      counts[l] = (counts[l] ?? 0) + 1;
    }
    expect(counts.C).toBeGreaterThan((counts.U ?? 0) * 3);
    expect(counts.X ?? 0).toBeGreaterThan(0);
    expect(Object.keys(counts)).toHaveLength(26);
    expect(LETTER_WEIGHTS.C).toBe(10);
  });

  it('renvoie null quand plus aucune lettre n’est possible', () => {
    expect(drawLetter(Object.keys(LETTER_WEIGHTS), [], false, mulberry32(1))).toBeNull();
  });
});

describe('drawBac', () => {
  it('produit des RoundItem sans réponse numérique', () => {
    const pool: BacItem[] = [
      { id: 'bac-0001', packs: ['general'], difficulty: 1, excludedLetters: [] },
    ];
    const ctx = {
      packs: ['general'],
      flagged: new Set<string>(),
      seen: new Map(),
      avoidSeen: true,
      used: new Set<string>(),
    };
    expect(drawBac(pool, [1], ctx, mulberry32(1))).toEqual([{ id: 'bac-0001', answer: 0 }]);
  });
});
