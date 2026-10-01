import { describe, expect, it } from 'vitest';
import { createRng, hashSeed, mulberry32, randomInt, shuffle } from './rng.ts';

describe('rng', () => {
  it('mulberry32 est déterministe et reste dans [0, 1[', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    const values = Array.from({ length: 1000 }, () => a());
    expect(values).toEqual(Array.from({ length: 1000 }, () => b()));
    expect(values.every((v) => v >= 0 && v < 1)).toBe(true);
    expect(new Set(values).size).toBeGreaterThan(990);
  });

  it('hashSeed distingue l’ordre et les valeurs des parties', () => {
    expect(hashSeed(1, 2, 3)).toBe(hashSeed(1, 2, 3));
    expect(hashSeed(1, 2, 3)).not.toBe(hashSeed(3, 2, 1));
    expect(hashSeed(1, 2)).not.toBe(hashSeed(1, 3));
    expect(hashSeed(-1)).toBeGreaterThanOrEqual(0);
  });

  it('createRng(seed, …) dérive des flux indépendants', () => {
    expect(createRng(7, 1)()).toBe(createRng(7, 1)());
    expect(createRng(7, 1)()).not.toBe(createRng(7, 2)());
  });

  it('randomInt couvre toute la plage', () => {
    const rng = mulberry32(1);
    const seen = new Set(Array.from({ length: 200 }, () => randomInt(rng, 5)));
    expect([...seen].sort()).toEqual([0, 1, 2, 3, 4]);
  });

  it('shuffle permute sans modifier l’original, de façon déterministe', () => {
    const input = [1, 2, 3, 4, 5, 6, 7, 8];
    const out = shuffle(input, mulberry32(3));
    expect(input).toEqual([1, 2, 3, 4, 5, 6, 7, 8]);
    expect([...out].sort()).toEqual(input);
    expect(out).toEqual(shuffle(input, mulberry32(3)));
    expect(shuffle([], mulberry32(3))).toEqual([]);
  });
});
