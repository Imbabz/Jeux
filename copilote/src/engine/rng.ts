/**
 * Hasard déterministe. Toute la partie dérive d'une seed uint32 ; chaque usage reçoit
 * sa propre sous-graine `hashSeed(seed, manche, question, sel)` pour rester indépendant.
 */

export type Rng = () => number;

/** Sels distinguant les usages du hasard (GAME_DESIGN §6.2). */
export const SALT = {
  rotation: 1,
  items: 2,
  skip: 3,
  suddenDeath: 4,
  letter: 5,
} as const;

/** PRNG mulberry32 : rapide, 32 bits, suffisant pour un jeu. Renvoie un flottant dans [0, 1[. */
export function mulberry32(seed: number): Rng {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Mélange plusieurs entiers en une sous-graine uint32 (variante de murmur3 fmix). */
export function hashSeed(...parts: readonly number[]): number {
  let h = 0x9e3779b9;
  for (const part of parts) {
    h = Math.imul(h ^ (part >>> 0), 0x85ebca6b);
    h = (h << 13) | (h >>> 19);
    h = Math.imul(h, 0xc2b2ae35) >>> 0;
  }
  h ^= h >>> 16;
  h = Math.imul(h, 0x85ebca6b);
  h ^= h >>> 13;
  return h >>> 0;
}

export function createRng(...parts: readonly number[]): Rng {
  return mulberry32(hashSeed(...parts));
}

/** Entier uniforme dans [0, n[. */
export function randomInt(rng: Rng, n: number): number {
  return Math.floor(rng() * n);
}

/** Mélange de Fisher-Yates, sans modifier le tableau d'origine. */
export function shuffle<T>(items: readonly T[], rng: Rng): T[] {
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = randomInt(rng, i + 1);
    [out[i], out[j]] = [out[j] as T, out[i] as T];
  }
  return out;
}
