import { describe, expect, it } from 'vitest';
import packsJson from './data/packs.json';
import yearJson from './data/year.json';
import { buildContent, LocalJsonSource } from './source.ts';

describe('contenu « Quelle année ? »', async () => {
  const content = await new LocalJsonSource().load();

  it('tous les items passent la validation', () => {
    expect(content.rejected).toEqual([]);
    expect(content.year).toHaveLength(yearJson.length);
    expect(content.packs).toHaveLength(8);
  });

  it('ids uniques et sans doublon de texte', () => {
    const ids = content.year.map((i) => i.id);
    expect(new Set(ids).size).toBe(ids.length);
    const texts = content.year.map((i) => i.text.toLowerCase());
    expect(new Set(texts).size).toBe(texts.length);
  });

  it('au moins 30 items pour l’étape 2, difficultés réparties', () => {
    expect(content.year.length).toBeGreaterThanOrEqual(30);
    const share = (d: number) =>
      content.year.filter((i) => i.difficulty === d).length / content.year.length;
    expect(share(1)).toBeGreaterThanOrEqual(0.3);
    expect(share(2)).toBeGreaterThanOrEqual(0.3);
    expect(share(3)).toBeGreaterThanOrEqual(0.1);
  });

  it('écarte les items invalides ou rattachés à un pack inconnu, sans planter', () => {
    const broken = buildContent(packsJson, [
      yearJson[0],
      { ...yearJson[1], year: 3000 },
      { ...yearJson[2], centuryHint: '18' },
      { ...yearJson[3], packs: ['inconnu'] },
      null,
    ]);
    expect(broken.year).toHaveLength(1);
    expect(broken.rejected.map((r) => r.id)).toEqual(['yr-0002', 'yr-0003', 'yr-0004', '?']);
    expect(buildContent(packsJson, 'pas un tableau').year).toEqual([]);
  });
});
