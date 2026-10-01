import { describe, expect, it } from 'vitest';
import { item } from '../../test/fixtures.ts';
import {
  bacDecider,
  initBacRound,
  reduceBac,
  restartBac,
  skipBac,
  starterFor,
  summarizeBac,
  type BacAction,
  type BacRoundState,
} from './machine.ts';

const opts = { multiplier: 1, exactBonus: true, first: 'A' as const };
const run = (state: BacRoundState, actions: BacAction[]) => actions.reduce(reduceBac, state);
const toTurn = (letter = 'B'): BacAction[] => [{ type: 'FLIP', letter }, { type: 'START' }];

describe('Bac Éclair en alternance — machine', () => {
  const start = initBacRound([item(1), item(2)], opts);

  it('suit hidden → announce → turn ⇄ mots → resolved → carte suivante → fin', () => {
    const announce = reduceBac(start, { type: 'FLIP', letter: 'B' });
    expect(announce).toMatchObject({ phase: 'announce', letter: 'B', speaker: 'A' });
    const turn = reduceBac(announce, { type: 'START' });
    expect(turn.phase).toBe('turn');
    // A puis B donnent un mot, A sèche : B remporte la carte.
    const rally = run(turn, [{ type: 'WORD' }, { type: 'WORD' }]);
    expect(rally).toMatchObject({ phase: 'turn', speaker: 'A', words: 2 });
    const resolved = reduceBac(rally, { type: 'MISS' });
    expect(resolved.phase).toBe('resolved');
    expect(resolved.results[0]).toMatchObject({
      winner: 'B',
      points: { A: 0, B: 1 },
      letter: 'B',
      words: 2,
    });
    // La carte suivante est ouverte par l'autre joueur.
    const next = reduceBac(resolved, { type: 'NEXT' });
    expect(next).toMatchObject({
      index: 1,
      phase: 'hidden',
      letter: null,
      usedLetters: ['B'],
      speaker: 'B',
      words: 0,
    });
    // Jamais deux fois la même lettre d'affilée.
    expect(reduceBac(next, { type: 'FLIP', letter: 'B' })).toBe(next);
    const done = run(next, [...toTurn('C'), { type: 'MISS' }, { type: 'NEXT' }]);
    expect(done.done).toBe(true);
    expect(summarizeBac(done)).toEqual({ points: { A: 1, B: 1 }, exacts: { A: 0, B: 0 } });
    expect(reduceBac(done, { type: 'NEXT' })).toBe(done);
  });

  it('chrono écoulé : un mot dit pile au buzzer est encore validable, sinon raté', () => {
    const timeout = run(start, [...toTurn(), { type: 'TIMER_EXPIRED' }]);
    expect(timeout.phase).toBe('timeout');
    expect(reduceBac(timeout, { type: 'WORD' })).toMatchObject({ phase: 'turn', speaker: 'B' });
    expect(reduceBac(timeout, { type: 'MISS' }).results[0]?.winner).toBe('B');
    expect(reduceBac(timeout, { type: 'TIMER_EXPIRED' })).toBe(timeout);
  });

  it('les points sont multipliés en manche finale', () => {
    const doubled = run(initBacRound([item(1)], { ...opts, first: 'B', multiplier: 2 }), [
      ...toTurn(),
      { type: 'MISS' },
    ]);
    expect(doubled.results[0]).toMatchObject({ winner: 'A', points: { A: 2, B: 0 } });
  });

  it('alterne le joueur qui ouvre chaque carte', () => {
    expect([0, 1, 2, 3].map((i) => starterFor('B', i))).toEqual(['B', 'A', 'B', 'A']);
  });

  it('ignore les événements invalides', () => {
    const invalid: BacAction[] = [
      { type: 'START' },
      { type: 'WORD' },
      { type: 'TIMER_EXPIRED' },
      { type: 'MISS' },
      { type: 'NEXT' },
      { type: 'FLIP', letter: 'b' },
      { type: 'FLIP', letter: 'AB' },
    ];
    for (const action of invalid) expect(reduceBac(start, action)).toBe(start);
    const announce = reduceBac(start, { type: 'FLIP', letter: 'B' });
    expect(reduceBac(announce, { type: 'WORD' })).toBe(announce);
    expect(reduceBac(announce, { type: 'MISS' })).toBe(announce);
    expect(reduceBac(announce, { type: 'FLIP', letter: 'C' })).toBe(announce);
  });

  it('Passer change la catégorie tant que la carte n’est pas résolue', () => {
    const turn = run(start, [...toTurn(), { type: 'WORD' }]);
    const skipped = skipBac(turn, item(9));
    expect(skipped).toMatchObject({ phase: 'hidden', letter: null, speaker: 'A', words: 0 });
    expect(skipped.items[0]?.id).toBe('yr-0009');
    const resolved = reduceBac(turn, { type: 'MISS' });
    expect(skipBac(resolved, item(9))).toBe(resolved);
    expect(skipBac({ ...resolved, phase: 'turn', done: true }, item(9)).done).toBe(true);
  });

  it('reprise : un échange en cours repart de l’annonce, même lettre, même joueur', () => {
    const turn = run(start, [...toTurn('M'), { type: 'WORD' }]);
    expect(restartBac(turn)).toMatchObject({ phase: 'announce', letter: 'M', speaker: 'B' });
    expect(restartBac(start)).toBe(start);
  });

  it('départage de mort subite', () => {
    const won = run(initBacRound([item(1)], opts), [...toTurn(), { type: 'MISS' }]);
    expect(bacDecider(won)).toBe('B');
    expect(bacDecider(start)).toBeNull();
  });
});
