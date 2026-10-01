import { describe, expect, it } from 'vitest';
import {
  canUndo,
  eventLabel,
  isDecision,
  undoLastDecision,
  type MatchEvent,
  type MatchEventBody,
} from './events.ts';
import { replay, tokens, totals } from './match.ts';
import { baseConfig, item, playQuestion, year } from './test/fixtures.ts';

const roundEvents = (round: number, base: number): MatchEventBody[] => [
  {
    type: 'ROUND_STARTED',
    round,
    game: 'year',
    items: [item(base), item(base + 1), item(base + 2)],
  },
  ...playQuestion(1900 + base, 1950),
  ...playQuestion(1901 + base, 1950),
  ...playQuestion(1902 + base, 1950),
];

describe('décisions et Annuler', () => {
  it('classe les événements', () => {
    expect(isDecision(year({ type: 'INPUT', player: 'A', value: 1 }))).toBe(true);
    expect(isDecision(year({ type: 'REVEAL' }))).toBe(true);
    expect(isDecision({ type: 'estim', action: { type: 'READ' } })).toBe(false);
    expect(isDecision({ type: 'ITEM_SKIPPED', replacement: item(1) })).toBe(true);
    expect(isDecision({ type: 'ROUND_RECAP_DONE' })).toBe(false);
  });

  it('retire la dernière décision et tout ce qui suit', () => {
    const events = [{ type: 'OPENING_DONE' } as const, ...roundEvents(0, 1).slice(0, 8)];
    // … INPUT A, INPUT B, REVEAL, NEXT → retire REVEAL et NEXT.
    const undone = undoLastDecision(events);
    expect(undone).toHaveLength(events.length - 2);
    expect(replay(baseConfig, 1, undone).current?.phase).toBe('ready');
    const twice = undoLastDecision(undone);
    expect(replay(baseConfig, 1, twice).current?.phase).toBe('inputB');
  });

  it('défait au-delà d’une fin de manche : récap, jeton et score recalculés', () => {
    const events: MatchEventBody[] = [
      { type: 'OPENING_DONE' },
      ...roundEvents(0, 1),
      { type: 'ROUND_RECAP_DONE' },
    ];
    const before = replay(baseConfig, 1, events);
    expect(before.phase).toBe('roundIntro');
    expect(tokens(before).A).toEqual(['year']);
    const after = replay(baseConfig, 1, undoLastDecision(events));
    expect(after.phase).toBe('playing');
    expect(after.current?.phase).toBe('ready');
    expect(tokens(after).A).toEqual([]);
    expect(totals(after)).toEqual({ A: 4, B: 0 });
  });

  it('sans décision, ne retire rien', () => {
    const events: MatchEventBody[] = [{ type: 'OPENING_DONE' }];
    expect(canUndo(events)).toBe(false);
    expect(undoLastDecision(events)).toEqual(events);
    expect(canUndo([...events, year({ type: 'REVEAL' })])).toBe(true);
  });

  it('libellés du journal', () => {
    expect(eventLabel(year({ type: 'INPUT', player: 'A', value: 1 }))).toBe('year/INPUT');
    expect(eventLabel({ type: 'estim', action: { type: 'NEXT' } })).toBe('estim/NEXT');
    expect(eventLabel({ type: 'OPENING_DONE' })).toBe('OPENING_DONE');
  });
});

describe('export / import', () => {
  it('rejouer un export JSON donne un état identique', () => {
    const bodies: MatchEventBody[] = [{ type: 'OPENING_DONE' }, ...roundEvents(0, 1)];
    const events = bodies.map((e, i): MatchEvent => ({ ...e, at: 1000 + i }));
    const record = { config: baseConfig, seed: 42, events };
    const imported = JSON.parse(JSON.stringify(record)) as typeof record;
    expect(replay(imported.config, imported.seed, imported.events)).toEqual(
      replay(baseConfig, 42, events),
    );
  });
});
