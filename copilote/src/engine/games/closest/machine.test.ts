import { describe, expect, it } from 'vitest';
import { item } from '../../test/fixtures.ts';
import {
  currentItem,
  initClosestRound,
  needsRestartClosest,
  reduceClosest,
  restartClosest,
  skipClosest,
  summarizeClosest,
  type ClosestAction,
  type ClosestRoundState,
} from './machine.ts';

const opts = { multiplier: 1, exactBonus: true };
const run = (state: ClosestRoundState, actions: ClosestAction[]) =>
  actions.reduce(reduceClosest, state);
const toReady: ClosestAction[] = [
  { type: 'READ' },
  { type: 'THINK_DONE' },
  { type: 'COUNTDOWN_DONE' },
  { type: 'INPUT', player: 'A', value: 1990 },
  { type: 'INPUT', player: 'B', value: null },
];

describe('machine « au plus proche »', () => {
  const start = initClosestRound('year', [item(89, 1989), item(69, 1969)], opts);

  it('suit le flow complet read → … → revealed → question suivante → fin', () => {
    expect(start.phase).toBe('read');
    expect(currentItem(start).id).toBe('yr-0089');
    const ready = run(start, toReady);
    expect(ready.phase).toBe('ready');
    expect(ready.inputs).toEqual({ A: 1990, B: null });
    const revealed = reduceClosest(ready, { type: 'REVEAL' });
    expect(revealed.phase).toBe('revealed');
    expect(revealed.results[0]?.outcome.points).toEqual({ A: 1, B: 0 });
    const second = reduceClosest(revealed, { type: 'NEXT' });
    expect(second).toMatchObject({ index: 1, phase: 'read', inputs: {} });
    const done = run(second, [...toReady, { type: 'REVEAL' }, { type: 'NEXT' }]);
    expect(done.done).toBe(true);
    expect(summarizeClosest(done)).toEqual({ points: { A: 2, B: 0 }, exacts: { A: 0, B: 0 } });
    expect(reduceClosest(done, { type: 'READ' })).toBe(done);
  });

  it('ignore tout événement invalide dans l’état courant (même référence)', () => {
    const invalidEverywhere: ClosestAction[] = [
      { type: 'THINK_DONE' },
      { type: 'COUNTDOWN_DONE' },
      { type: 'INPUT', player: 'A', value: 1900 },
      { type: 'REVEAL' },
      { type: 'NEXT' },
    ];
    for (const action of invalidEverywhere) expect(reduceClosest(start, action)).toBe(start);
    const think = reduceClosest(start, { type: 'READ' });
    expect(reduceClosest(think, { type: 'READ' })).toBe(think);
    const inputA = run(start, toReady.slice(0, 3));
    expect(reduceClosest(inputA, { type: 'INPUT', player: 'B', value: 1900 })).toBe(inputA);
    expect(reduceClosest(inputA, { type: 'INPUT', player: 'A', value: 0 })).toBe(inputA);
    expect(reduceClosest(inputA, { type: 'INPUT', player: 'A', value: -5 })).toBe(inputA);
    expect(reduceClosest(inputA, { type: 'INPUT', player: 'A', value: Number.NaN })).toBe(inputA);
    const inputB = reduceClosest(inputA, { type: 'INPUT', player: 'A', value: 1900 });
    expect(reduceClosest(inputB, { type: 'INPUT', player: 'A', value: 1900 })).toBe(inputB);
  });

  it('Passer remplace l’item courant, sauf une fois révélé', () => {
    const think = reduceClosest(start, { type: 'READ' });
    const skipped = skipClosest(think, item(1, 1901));
    expect(skipped).toMatchObject({ phase: 'read', inputs: {} });
    expect(currentItem(skipped).id).toBe('yr-0001');
    expect(skipped.items[1]?.id).toBe('yr-0069');
    const revealed = run(start, [...toReady, { type: 'REVEAL' }]);
    expect(skipClosest(revealed, item(1))).toBe(revealed);
    const done = initClosestRound('year', [item(1)], opts);
    const finished = run(done, [...toReady, { type: 'REVEAL' }, { type: 'NEXT' }]);
    expect(skipClosest(finished, item(2))).toBe(finished);
  });

  it('une reprise relance les états chronométrés depuis la lecture', () => {
    const think = reduceClosest(start, { type: 'READ' });
    const countdown = reduceClosest(think, { type: 'THINK_DONE' });
    expect(restartClosest(think).phase).toBe('read');
    expect(restartClosest(countdown).phase).toBe('read');
    expect(needsRestartClosest(countdown)).toBe(true);
    const inputA = reduceClosest(countdown, { type: 'COUNTDOWN_DONE' });
    expect(restartClosest(inputA)).toBe(inputA);
    expect(needsRestartClosest(start)).toBe(false);
  });

  it('compte les réponses exactes', () => {
    const exact = run(initClosestRound('year', [item(89, 1989)], opts), [
      { type: 'READ' },
      { type: 'THINK_DONE' },
      { type: 'COUNTDOWN_DONE' },
      { type: 'INPUT', player: 'A', value: 1989 },
      { type: 'INPUT', player: 'B', value: 1989 },
      { type: 'REVEAL' },
    ]);
    expect(summarizeClosest(exact)).toEqual({ points: { A: 2, B: 2 }, exacts: { A: 1, B: 1 } });
  });
});
