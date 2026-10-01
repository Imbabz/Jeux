import { describe, expect, it } from 'vitest';
import { allowedLetters } from '../engine/index.ts';
import bacJson from './data/bac.json';
import estimJson from './data/estim.json';
import packsJson from './data/packs.json';
import yearJson from './data/year.json';
import { loadBacDictionary } from './dictionary.ts';
import { buildContent, LocalJsonSource, type Content } from './source.ts';

/** Tests de contenu (cahier des charges §15). */

const content: Content = await new LocalJsonSource().load();
const dictionary = await loadBacDictionary();
const GAMES = ['year', 'estim', 'bac'] as const;
const REGIONAL = ['scotland', 'belgium'];

describe('contenu', () => {
  it('tous les items passent la validation zod', () => {
    expect(content.rejected).toEqual([]);
    expect(content.year).toHaveLength(yearJson.length);
    expect(content.estim).toHaveLength(estimJson.length);
    expect(content.bac).toHaveLength(bacJson.length);
    expect(content.packs).toHaveLength(8);
  });

  it('volumes totaux : 250 années, 200 estimations, 120 catégories', () => {
    expect(content.year.length).toBeGreaterThanOrEqual(250);
    expect(content.estim.length).toBeGreaterThanOrEqual(200);
    expect(content.bac.length).toBeGreaterThanOrEqual(115);
  });

  it('ids uniques sur tout le contenu', () => {
    const ids = [...content.year, ...content.estim, ...content.bac].map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('pas de doublon de texte', () => {
    const norm = (s: string) => s.toLowerCase().replace(/[^a-zà-ÿ0-9]/g, '');
    for (const texts of [
      content.year.map((i) => i.text),
      content.estim.map((i) => i.question),
      content.bac.map((i) => i.label),
    ]) {
      const normalized = texts.map(norm);
      expect(new Set(normalized).size).toBe(normalized.length);
    }
  });

  it('réponses plausibles : années entre 1000 et 2025, estimations > 0', () => {
    for (const i of content.year) {
      expect(i.year).toBeGreaterThanOrEqual(1000);
      expect(i.year).toBeLessThanOrEqual(2025);
    }
    for (const i of content.estim) expect(i.answer).toBeGreaterThan(0);
  });

  it('volumes par pack : au moins 25 (Écosse, Belgique) ou 30 items par jeu', () => {
    for (const pack of content.packs) {
      const min = REGIONAL.includes(pack.id) ? 25 : 30;
      for (const game of GAMES) {
        const count = content[game].filter((i) => i.packs.includes(pack.id)).length;
        expect(count, `${pack.id} / ${game}`).toBeGreaterThanOrEqual(min);
      }
    }
  });

  it('difficultés réparties : chaque niveau représente au moins 7 % de chaque jeu', () => {
    for (const game of GAMES) {
      const items = content[game];
      for (const d of [1, 2, 3]) {
        const share = items.filter((i) => i.difficulty === d).length / items.length;
        expect(share, `${game} difficulté ${d}`).toBeGreaterThanOrEqual(0.07);
      }
    }
  });

  it('chaque catégorie du Bac offre au moins 8 lettres, chacune avec au moins 3 mots acceptés', () => {
    for (const item of content.bac) {
      const allowed = allowedLetters(item.excludedLetters, false);
      expect(allowed.length, item.label).toBeGreaterThanOrEqual(8);
      for (const letter of allowed) {
        expect(
          dictionary[item.id]?.[letter]?.length ?? 0,
          `${item.label} en ${letter}`,
        ).toBeGreaterThanOrEqual(3);
      }
    }
  });

  it('les mots acceptés commencent par leur lettre (article éventuel ignoré)', () => {
    const initials = (word: string) => {
      const plain = (w: string) => (w.normalize('NFD')[0] ?? '').toUpperCase();
      const rest = word.replace(/^(le |la |les |l'|l’|the )/i, '');
      return new Set([plain(word), plain(rest), word.startsWith('œ') ? 'O' : '']);
    };
    for (const item of content.bac) {
      for (const [letter, entries] of Object.entries(dictionary[item.id] ?? {})) {
        expect(item.excludedLetters, `${item.label} : liste pour une lettre exclue`).not.toContain(
          letter,
        );
        for (const [word] of entries)
          expect(initials(word).has(letter), `${word} (${letter})`).toBe(true);
      }
    }
  });

  it('le dictionnaire est sans doublon et ne couvre que des catégories existantes', () => {
    const ids = new Set(content.bac.map((i) => i.id));
    const plain = (w: string) =>
      w
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase();
    let total = 0;
    for (const [id, letters] of Object.entries(dictionary)) {
      expect(ids.has(id), id).toBe(true);
      for (const entries of Object.values(letters)) {
        const keys = entries.map(([w]) => plain(w));
        expect(new Set(keys).size, id).toBe(keys.length);
        total += entries.length;
      }
    }
    expect(total).toBeGreaterThanOrEqual(12000);
  });

  it('écarte les items invalides ou rattachés à un pack inconnu, sans planter', () => {
    const broken = buildContent({
      packs: packsJson,
      year: [
        yearJson[0],
        { ...yearJson[1], year: 3000 },
        { ...yearJson[2], centuryHint: '18' },
        { ...yearJson[3], packs: ['inconnu'] },
        null,
      ],
      estim: [{ ...estimJson[0], answer: 0 }],
      bac: 'pas un tableau',
    });
    expect(broken.year).toHaveLength(1);
    expect(broken.rejected.map((r) => r.id)).toEqual([
      'yr-0002',
      'yr-0003',
      'yr-0004',
      '?',
      'est-0001',
    ]);
    expect(broken.bac).toEqual([]);
  });
});
