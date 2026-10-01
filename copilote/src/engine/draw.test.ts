import { describe, expect, it } from 'vitest';
import { availableItems, drawItems, type DrawContext, type DrawableItem } from './draw.ts';
import { drawYear, type YearItem } from './games/year/draw.ts';
import { mulberry32 } from './rng.ts';
import type { Difficulty } from './types.ts';

const mk = (n: number, difficulty: Difficulty, packs = ['general']): DrawableItem => ({
  id: `it-${n}`,
  packs,
  difficulty,
});

const ctx = (over: Partial<DrawContext> = {}): DrawContext => ({
  packs: ['general'],
  flagged: new Set(),
  seen: new Map(),
  avoidSeen: true,
  used: new Set(),
  ...over,
});

describe('availableItems', () => {
  it('filtre par pack et exclut les signalés', () => {
    const pool = [mk(1, 1), mk(2, 1, ['pop']), mk(3, 1, ['pop', 'general']), mk(4, 1)];
    expect(availableItems(pool, ['general'], new Set(['it-4'])).map((i) => i.id)).toEqual([
      'it-1',
      'it-3',
    ]);
  });
});

describe('drawItems', () => {
  const pool = [mk(1, 1), mk(2, 1), mk(3, 2), mk(4, 2), mk(5, 3), mk(6, 3)];

  it('tire un item par cible, à la bonne difficulté, sans doublon', () => {
    const out = drawItems(pool, [1, 2, 3], ctx(), mulberry32(1));
    expect(out.map((i) => i.difficulty)).toEqual([1, 2, 3]);
    expect(new Set(out.map((i) => i.id)).size).toBe(3);
  });

  it('est déterministe à graine égale', () => {
    expect(drawItems(pool, [1, 2, 3], ctx(), mulberry32(9))).toEqual(
      drawItems(pool, [1, 2, 3], ctx(), mulberry32(9)),
    );
  });

  it('se replie sur la difficulté la plus proche, la plus basse à égalité', () => {
    const only13 = [mk(1, 1), mk(5, 3)];
    expect(drawItems(only13, [2], ctx(), mulberry32(1)).map((i) => i.id)).toEqual(['it-1']);
    const only3 = [mk(5, 3), mk(6, 3)];
    expect(drawItems(only3, [1, 1], ctx(), mulberry32(1)).map((i) => i.difficulty)).toEqual([3, 3]);
  });

  it('exclut les items déjà tirés dans la partie, signalés ou hors packs', () => {
    const out = drawItems(
      [...pool, mk(7, 1, ['pop'])],
      [1, 1, 1],
      ctx({ used: new Set(['it-1']), flagged: new Set(['it-2']) }),
      mulberry32(1),
    );
    expect(out.map((i) => i.id)).not.toContain('it-1');
    expect(out.map((i) => i.id)).not.toContain('it-2');
    expect(out.map((i) => i.id)).not.toContain('it-7');
  });

  it('évite les vus, puis recycle les plus anciens s’il en manque', () => {
    const seen = new Map([
      ['it-1', 5],
      ['it-2', 1],
      ['it-3', 3],
      ['it-4', 9],
    ]);
    const out = drawItems(pool, [1, 1, 1, 1], ctx({ seen }), mulberry32(1)).map((i) => i.id);
    expect(out).toHaveLength(4);
    expect(out).toEqual(expect.arrayContaining(['it-5', 'it-6', 'it-2', 'it-3']));
  });

  it('ignore les vus quand « Ne pas reposer » est désactivé', () => {
    const seen = new Map(pool.map((i, n) => [i.id, n] as const));
    expect(drawItems(pool, [1, 2], ctx({ seen, avoidSeen: false }), mulberry32(1))).toHaveLength(2);
  });

  it('renvoie moins d’items quand le contenu est épuisé', () => {
    expect(drawItems([mk(1, 1)], [1, 2, 3], ctx(), mulberry32(1))).toHaveLength(1);
    expect(drawItems([], [1], ctx(), mulberry32(1))).toEqual([]);
  });
});

describe('drawYear', () => {
  it('transforme les items en RoundItem avec la réponse', () => {
    const pool: YearItem[] = [{ id: 'yr-0001', packs: ['general'], difficulty: 1, year: 1989 }];
    expect(drawYear(pool, [1], ctx(), mulberry32(1))).toEqual([{ id: 'yr-0001', answer: 1989 }]);
  });
});
