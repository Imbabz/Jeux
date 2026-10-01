import { describe, expect, it } from 'vitest';
import { item } from '../../test/fixtures.ts';
import {
  bacDecider,
  initBacRound,
  MAX_REPLAYS,
  reduceBac,
  restartBac,
  skipBac,
  summarizeBac,
  type BacAction,
  type BacRoundState,
} from './machine.ts';

const opts = { multiplier: 1, exactBonus: true, together: 'replay' as const };
const run = (state: BacRoundState, actions: BacAction[]) => actions.reduce(reduceBac, state);
const toRunning = (letter = 'B'): BacAction[] => [
  { type: 'FLIP', letter },
  { type: 'COUNTDOWN_DONE' },
];

describe('Bac Éclair — machine', () => {
  const start = initBacRound([item(1), item(2)], opts);

  it('suit hidden → countdown → running → resolved → tour suivant → fin', () => {
    const running = run(start, toRunning());
    expect(running).toMatchObject({ phase: 'running', letter: 'B' });
    const resolved = reduceBac(running, { type: 'BUZZ', who: 'A' });
    expect(resolved.phase).toBe('resolved');
    expect(resolved.results[0]).toMatchObject({
      winner: 'A',
      points: { A: 1, B: 0 },
      letter: 'B',
      voided: false,
    });
    const next = reduceBac(resolved, { type: 'NEXT' });
    expect(next).toMatchObject({
      index: 1,
      phase: 'hidden',
      letter: null,
      usedLetters: ['B'],
      replays: 0,
    });
    // Jamais deux fois la même lettre d'affilée.
    expect(reduceBac(next, { type: 'FLIP', letter: 'B' })).toBe(next);
    const done = run(next, [...toRunning('C'), { type: 'BUZZ', who: 'B' }, { type: 'NEXT' }]);
    expect(done.done).toBe(true);
    expect(summarizeBac(done)).toEqual({ points: { A: 1, B: 1 }, exacts: { A: 0, B: 0 } });
    expect(reduceBac(done, { type: 'NEXT' })).toBe(done);
  });

  it('chrono écoulé : un mot dit pile au buzzer, ou personne', () => {
    const timeout = run(start, [...toRunning(), { type: 'TIMER_EXPIRED' }]);
    expect(timeout.phase).toBe('timeout');
    expect(reduceBac(timeout, { type: 'BUZZ', who: 'B' }).results[0]?.winner).toBe('B');
    const nobody = reduceBac(timeout, { type: 'NOBODY' });
    expect(nobody.results[0]).toMatchObject({ winner: 'none', points: { A: 0, B: 0 } });
    expect(reduceBac(timeout, { type: 'BUZZ', who: 'both' })).toBe(timeout);
  });

  it('« Ensemble ! » rejoue avec une nouvelle lettre (mode par défaut)', () => {
    const replayed = run(start, [...toRunning(), { type: 'BUZZ', who: 'both' }]);
    expect(replayed).toMatchObject({
      phase: 'hidden',
      letter: null,
      replays: 1,
      usedLetters: ['B'],
    });
    expect(reduceBac(replayed, { type: 'FLIP', letter: 'B' })).toBe(replayed);
    expect(reduceBac(replayed, { type: 'FLIP', letter: 'D' }).letter).toBe('D');
  });

  it('« Ensemble ! » donne un point chacun en mode « both », doublé si besoin', () => {
    const both = run(initBacRound([item(1)], { ...opts, together: 'both', multiplier: 2 }), [
      ...toRunning(),
      { type: 'BUZZ', who: 'both' },
    ]);
    expect(both.results[0]).toMatchObject({ winner: 'both', points: { A: 2, B: 2 } });
  });

  it('Contesté annule le point et rejoue ; au 3e rejeu, le tour est clos sans point', () => {
    let state = run(start, [...toRunning('B'), { type: 'BUZZ', who: 'A' }, { type: 'CONTESTED' }]);
    expect(state).toMatchObject({ phase: 'hidden', replays: 1, results: [] });
    state = run(state, [...toRunning('C'), { type: 'BUZZ', who: 'both' }]);
    expect(state.replays).toBe(2);
    state = run(state, [...toRunning('D'), { type: 'BUZZ', who: 'B' }, { type: 'CONTESTED' }]);
    expect(state.replays).toBe(MAX_REPLAYS);
    expect(state.phase).toBe('resolved');
    expect(state.results[0]).toMatchObject({
      winner: 'none',
      voided: true,
      points: { A: 0, B: 0 },
    });
    // Rien à contester quand personne n'a marqué.
    expect(reduceBac(state, { type: 'CONTESTED' })).toBe(state);
  });

  it('ignore les événements invalides', () => {
    const invalid: BacAction[] = [
      { type: 'COUNTDOWN_DONE' },
      { type: 'TIMER_EXPIRED' },
      { type: 'BUZZ', who: 'A' },
      { type: 'BUZZ', who: 'both' },
      { type: 'NOBODY' },
      { type: 'CONTESTED' },
      { type: 'NEXT' },
      { type: 'FLIP', letter: 'b' },
      { type: 'FLIP', letter: 'AB' },
    ];
    for (const action of invalid) expect(reduceBac(start, action)).toBe(start);
    const countdown = reduceBac(start, { type: 'FLIP', letter: 'B' });
    expect(reduceBac(countdown, { type: 'BUZZ', who: 'A' })).toBe(countdown);
    expect(reduceBac(countdown, { type: 'FLIP', letter: 'C' })).toBe(countdown);
  });

  it('Passer change la catégorie tant que le tour n’est pas résolu', () => {
    const running = run(start, toRunning());
    const skipped = skipBac(running, item(9));
    expect(skipped).toMatchObject({ phase: 'hidden', letter: null, replays: 0 });
    expect(skipped.items[0]?.id).toBe('yr-0009');
    const resolved = reduceBac(running, { type: 'BUZZ', who: 'A' });
    expect(skipBac(resolved, item(9))).toBe(resolved);
    const done = run(initBacRound([item(1)], opts), [...toRunning(), { type: 'NOBODY' }]);
    expect(skipBac({ ...done, done: true }, item(9)).done).toBe(true);
  });

  it('reprise : un tour en cours repart du décompte avec la même lettre', () => {
    const running = run(start, toRunning('M'));
    expect(restartBac(running)).toMatchObject({ phase: 'countdown', letter: 'M' });
    expect(restartBac(start)).toBe(start);
  });

  it('départage de mort subite', () => {
    const won = run(initBacRound([item(1)], opts), [...toRunning(), { type: 'BUZZ', who: 'B' }]);
    expect(bacDecider(won)).toBe('B');
    expect(bacDecider(start)).toBeNull();
  });
});
