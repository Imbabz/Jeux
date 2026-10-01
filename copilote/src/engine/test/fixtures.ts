import type { MatchEventBody } from '../events.ts';
import type { ClosestAction } from '../games/closest/machine.ts';
import type { MatchConfig, RoundItem } from '../types.ts';

export const baseConfig: MatchConfig = {
  players: { A: { name: 'Léa', driver: true }, B: { name: 'Tom', driver: false } },
  games: ['year'],
  packs: ['general'],
  difficulty: 'mixed',
  rounds: 3,
  questionsPerRound: 3,
  rules: { exactBonus: true, doubleFinalRound: true, bacTogether: 'replay', rareLetters: false },
};

export const item = (n: number, answer = 1900 + n): RoundItem => ({
  id: `yr-${String(n).padStart(4, '0')}`,
  answer,
});

export const year = (action: ClosestAction): MatchEventBody => ({ type: 'year', action });

/** Joue une question complète de « Quelle année ? » avec les saisies données. */
export function playQuestion(a: number | null, b: number | null): MatchEventBody[] {
  return [
    year({ type: 'READ' }),
    year({ type: 'THINK_DONE' }),
    year({ type: 'COUNTDOWN_DONE' }),
    year({ type: 'INPUT', player: 'A', value: a }),
    year({ type: 'INPUT', player: 'B', value: b }),
    year({ type: 'REVEAL' }),
    year({ type: 'NEXT' }),
  ];
}
