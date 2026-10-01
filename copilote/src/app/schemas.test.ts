import { describe, expect, it } from 'vitest';
import { matchRecordSchema, type MatchRecord } from './schemas.ts';

const record: MatchRecord = {
  schemaVersion: 1,
  matchId: 'm1',
  seed: 42,
  config: {
    players: { A: { name: 'Léa', driver: true }, B: { name: 'Tom', driver: false } },
    games: ['year'],
    packs: ['general'],
    difficulty: 'mixed',
    rounds: 6,
    questionsPerRound: 5,
    rules: { exactBonus: true, doubleFinalRound: true, bacTogether: 'replay', rareLetters: false },
  },
  events: [
    { type: 'OPENING_DONE', at: 1 },
    {
      type: 'ROUND_STARTED',
      round: 0,
      game: 'year',
      items: [{ id: 'yr-0001', answer: 1989 }],
      at: 2,
    },
    { type: 'year', action: { type: 'INPUT', player: 'A', value: null }, at: 3 },
  ],
};

describe('matchRecordSchema', () => {
  it('valide un enregistrement complet après aller-retour JSON', () => {
    expect(matchRecordSchema.parse(JSON.parse(JSON.stringify(record)))).toEqual(record);
  });

  it('refuse un événement inconnu ou mal formé', () => {
    expect(
      matchRecordSchema.safeParse({ ...record, events: [{ type: 'NOPE', at: 1 }] }).success,
    ).toBe(false);
    expect(
      matchRecordSchema.safeParse({
        ...record,
        events: [{ type: 'year', action: { type: 'INPUT' }, at: 1 }],
      }).success,
    ).toBe(false);
    expect(matchRecordSchema.safeParse({ ...record, schemaVersion: 2 }).success).toBe(false);
  });
});
