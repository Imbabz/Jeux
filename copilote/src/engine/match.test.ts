import { describe, expect, it } from 'vitest';
import type { MatchEventBody } from './events.ts';
import {
  activeItem,
  currentRoundPoints,
  exactCount,
  initialMatchState,
  isFinalRound,
  leader,
  needsRestart,
  pointsByGame,
  reduceMatch,
  replay,
  roundMultiplier,
  tokens,
  totals,
  type MatchState,
} from './match.ts';
import { baseConfig, item, playQuestion, year } from './test/fixtures.ts';
import type { MatchConfig } from './types.ts';

const started = (round: number, ids: number[]): MatchEventBody => ({
  type: 'ROUND_STARTED',
  round,
  game: 'year',
  items: ids.map((n) => item(n)),
});

/** Manche de 3 questions : réponses de A et B pour chaque question (réponse = 1900 + n). */
function round(
  index: number,
  ids: number[],
  answers: [number | null, number | null][],
): MatchEventBody[] {
  return [
    started(index, ids),
    ...answers.flatMap(([a, b]) => playQuestion(a, b)),
    { type: 'ROUND_RECAP_DONE' },
  ];
}

const run = (events: MatchEventBody[], config: MatchConfig = baseConfig) =>
  replay(config, 7, events);

describe('déroulé d’une partie', () => {
  // Réponse = 1900 + n. Manche 1 : 2-1 (A exact) ; manche 2 : 0-3 ; manche 3 (×2) : 4-6. Total 6-10.
  const full: MatchEventBody[] = [
    { type: 'OPENING_DONE' },
    ...round(
      0,
      [1, 2, 3],
      [
        [1901, 1950],
        [1950, 1903],
        [null, null],
      ],
    ),
    ...round(
      1,
      [4, 5, 6],
      [
        [1950, 1905],
        [1950, 1906],
        [null, 1990],
      ],
    ),
    ...round(
      2,
      [7, 8, 9],
      [
        [1906, 1908],
        [1950, 1909],
        [1950, 1950],
      ],
    ),
  ];

  it('commence par l’ouverture puis l’intro de la première manche', () => {
    const s0 = initialMatchState(baseConfig, 7);
    expect(s0.phase).toBe('opening');
    expect(s0.plan).toEqual(['year', 'year', 'year']);
    expect(reduceMatch(s0, { type: 'OPENING_DONE' }).phase).toBe('roundIntro');
  });

  it('joue une manche, attribue jeton et points, puis passe à la suivante', () => {
    const s = run(full.slice(0, 1 + 1 + 21));
    expect(s.phase).toBe('roundRecap');
    expect(currentRoundPoints(s)).toEqual({ A: 2, B: 1 });
    expect(tokens(s)).toEqual({ A: ['year'], B: [] });
    const next = reduceMatch(s, { type: 'ROUND_RECAP_DONE' });
    expect(next).toMatchObject({ phase: 'roundIntro', roundIndex: 1, current: null });
  });

  it('compte les points en direct pendant une manche', () => {
    const s = run(full.slice(0, 1 + 1 + 6));
    expect(s.phase).toBe('playing');
    expect(totals(s)).toEqual({ A: 2, B: 0 });
    expect(currentRoundPoints(s)).toEqual({ A: 2, B: 0 });
    expect(leader(s)).toBe('A');
    expect(leader(initialMatchState(baseConfig, 1))).toBeNull();
    expect(activeItem(s)?.id).toBe('yr-0001');
  });

  it('double les points de la dernière manche', () => {
    const s = run(full.slice(0, -1));
    expect(isFinalRound(s)).toBe(true);
    expect(roundMultiplier(s)).toBe(2);
    expect(s.rounds[2]?.points).toEqual({ A: 4, B: 6 });
    expect(s.rounds[2]?.winner).toBe('B');
  });

  it('termine la partie sur le meilleur score', () => {
    const s = run(full);
    expect(totals(s)).toEqual({ A: 6, B: 10 });
    expect(s).toMatchObject({ phase: 'finished', winner: 'B', wonBySuddenDeath: false });
    expect(tokens(s)).toEqual({ A: ['year'], B: ['year', 'year'] });
    expect(pointsByGame(s)).toEqual({ year: { A: 6, B: 10 } });
    expect(exactCount(s)).toEqual({ A: 1, B: 0 });
    expect(leader(s)).toBe('B');
    expect(currentRoundPoints(s)).toEqual({ A: 0, B: 0 });
  });

  it('A gagne quand il mène à la fin', () => {
    const events: MatchEventBody[] = [
      { type: 'OPENING_DONE' },
      ...round(
        0,
        [1, 2, 3],
        [
          [1901, 1950],
          [1902, 1950],
          [1903, 1950],
        ],
      ),
      ...round(
        1,
        [4, 5, 6],
        [
          [null, null],
          [null, null],
          [null, null],
        ],
      ),
      ...round(
        2,
        [7, 8, 9],
        [
          [null, null],
          [null, null],
          [null, null],
        ],
      ),
    ];
    expect(run(events)).toMatchObject({ phase: 'finished', winner: 'A' });
  });

  describe('mort subite', () => {
    const tied: MatchEventBody[] = [
      { type: 'OPENING_DONE' },
      ...round(
        0,
        [1, 2, 3],
        [
          [1901, 1950],
          [1950, 1902],
          [null, null],
        ],
      ),
      ...round(
        1,
        [4, 5, 6],
        [
          [null, null],
          [null, null],
          [null, null],
        ],
      ),
      ...round(
        2,
        [7, 8, 9],
        [
          [null, null],
          [null, null],
          [null, null],
        ],
      ),
    ];
    const sd = (n: number): MatchEventBody => ({
      type: 'SUDDEN_DEATH_STARTED',
      game: 'year',
      item: item(n),
    });

    it('se déclenche sur égalité et n’ajoute aucun point', () => {
      const s = run(tied);
      expect(s.phase).toBe('suddenDeathIntro');
      const won = run([...tied, sd(20), ...playQuestion(1915, 1921)]);
      expect(won).toMatchObject({ phase: 'finished', winner: 'B', wonBySuddenDeath: true });
      expect(totals(won)).toEqual({ A: 2, B: 2 });
    });

    it('recommence tant que l’égalité persiste', () => {
      const again = run([...tied, sd(20), ...playQuestion(1918, 1922)]);
      expect(again).toMatchObject({ phase: 'suddenDeathIntro', suddenDeathAttempts: 1 });
      const none = run([...tied, sd(20), ...playQuestion(null, null)]);
      expect(none.phase).toBe('suddenDeathIntro');
      const then = run([
        ...tied,
        sd(20),
        ...playQuestion(null, null),
        sd(21),
        ...playQuestion(1921, null),
      ]);
      expect(then).toMatchObject({ phase: 'finished', winner: 'A' });
      expect(then.usedItemIds).toContain('yr-0021');
    });

    it('n’accepte le démarrage qu’en intro de mort subite et pour un jeu supporté', () => {
      const s = run(tied);
      expect(reduceMatch(s, { type: 'SUDDEN_DEATH_STARTED', game: 'bac', item: item(1) })).toBe(s);
      const playing = run([...tied, sd(20)]);
      expect(reduceMatch(playing, sd(21))).toBe(playing);
      expect(playing.current?.multiplier).toBe(1);
    });
  });

  it('respecte « dernière manche double » désactivé', () => {
    const config = { ...baseConfig, rules: { ...baseConfig.rules, doubleFinalRound: false } };
    const s = run(full.slice(0, -1), config);
    expect(roundMultiplier(s)).toBe(1);
    expect(s.rounds[2]?.points).toEqual({ A: 2, B: 3 });
  });
});

describe('événements de partie', () => {
  const intro = run([{ type: 'OPENING_DONE' }]);
  const playing = reduceMatch(intro, started(0, [1, 2, 3]));

  it('valide ROUND_STARTED : manche, jeu supporté, items non vides', () => {
    expect(reduceMatch(intro, started(1, [1]))).toBe(intro);
    expect(
      reduceMatch(intro, { type: 'ROUND_STARTED', round: 0, game: 'bac', items: [item(1)] }),
    ).toBe(intro);
    expect(reduceMatch(intro, { type: 'ROUND_STARTED', round: 0, game: 'year', items: [] })).toBe(
      intro,
    );
    expect(reduceMatch(playing, started(0, [4]))).toBe(playing);
    expect(playing.usedItemIds).toEqual(['yr-0001', 'yr-0002', 'yr-0003']);
  });

  it('accepte un jeu forcé et l’inscrit dans le plan', () => {
    const forced = reduceMatch(intro, {
      type: 'ROUND_STARTED',
      round: 0,
      game: 'estim',
      items: [item(1, 50)],
    });
    expect(forced.plan[0]).toBe('estim');
    expect(forced.current?.kind).toBe('estim');
    expect(reduceMatch(forced, year({ type: 'READ' }))).toBe(forced);
    expect(reduceMatch(forced, { type: 'estim', action: { type: 'READ' } }).current?.phase).toBe(
      'think',
    );
  });

  it('ignore les événements hors de leur phase', () => {
    const s0 = initialMatchState(baseConfig, 7);
    const invalid: MatchEventBody[] = [
      { type: 'ROUND_RECAP_DONE' },
      { type: 'ITEM_SKIPPED', replacement: item(9) },
      { type: 'TURN_RESTARTED' },
      year({ type: 'READ' }),
      { type: 'SUDDEN_DEATH_STARTED', game: 'year', item: item(1) },
    ];
    for (const e of invalid) expect(reduceMatch(s0, e)).toBe(s0);
    expect(reduceMatch(intro, { type: 'OPENING_DONE' })).toBe(intro);
    expect(reduceMatch(playing, year({ type: 'NEXT' }))).toBe(playing);
  });

  it('Passer remplace l’item et le marque utilisé', () => {
    const skipped = reduceMatch(playing, { type: 'ITEM_SKIPPED', replacement: item(9) });
    expect(activeItem(skipped)?.id).toBe('yr-0009');
    expect(skipped.usedItemIds).toContain('yr-0009');
    const revealed = run([
      { type: 'OPENING_DONE' },
      started(0, [1, 2, 3]),
      ...playQuestion(1901, 1902).slice(0, 6),
    ]);
    expect(reduceMatch(revealed, { type: 'ITEM_SKIPPED', replacement: item(9) })).toBe(revealed);
  });

  it('TURN_RESTARTED relance un état chronométré', () => {
    const think = reduceMatch(playing, year({ type: 'READ' }));
    expect(needsRestart(think)).toBe(true);
    expect(reduceMatch(think, { type: 'TURN_RESTARTED' }).current?.phase).toBe('read');
    expect(needsRestart(playing)).toBe(false);
    expect(needsRestart(intro)).toBe(false);
    expect(reduceMatch(playing, { type: 'TURN_RESTARTED' })).toBe(playing);
  });

  it('abandon possible à tout moment sauf une fois terminée', () => {
    const abandoned = reduceMatch(playing, { type: 'MATCH_ABANDONED' });
    expect(abandoned.phase).toBe('abandoned');
    expect(reduceMatch(abandoned, { type: 'MATCH_ABANDONED' })).toBe(abandoned);
    const finished: MatchState = { ...playing, phase: 'finished' };
    expect(reduceMatch(finished, { type: 'MATCH_ABANDONED' })).toBe(finished);
    expect(activeItem(intro)).toBeNull();
  });
});
