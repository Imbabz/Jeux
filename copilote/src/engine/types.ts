/** Types partagés du moteur. Aucune dépendance : ce fichier ne contient que des types et des constantes. */

export type PlayerId = 'A' | 'B';
export const PLAYERS: readonly PlayerId[] = ['A', 'B'];

export type PerPlayer<T> = { readonly A: T; readonly B: T };

export type GameId = 'bac' | 'year' | 'estim';
export const GAME_IDS: readonly GameId[] = ['bac', 'year', 'estim'];

export type Difficulty = 1 | 2 | 3;
export type DifficultyMode = 'easy' | 'mixed' | 'hard';
export type RoundCount = 3 | 6 | 9;
export type QuestionCount = 3 | 5 | 7;

export interface PlayerConfig {
  readonly name: string;
  readonly driver: boolean;
}

/** Règles figées au lancement de la partie (GAME_DESIGN §5.3). */
export interface MatchRules {
  readonly exactBonus: boolean;
  readonly doubleFinalRound: boolean;
  readonly rareLetters: boolean;
}

export interface MatchConfig {
  readonly players: PerPlayer<PlayerConfig>;
  /** Jeux effectivement jouables pour cette partie (au moins un). */
  readonly games: readonly GameId[];
  readonly packs: readonly string[];
  readonly difficulty: DifficultyMode;
  readonly rounds: RoundCount;
  readonly questionsPerRound: QuestionCount;
  readonly rules: MatchRules;
}

/** Item tiré et inscrit dans le journal : son id et la réponse attendue (GAME_DESIGN §6.2). */
export interface RoundItem {
  readonly id: string;
  readonly answer: number;
}
