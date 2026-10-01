import { z } from 'zod';

/** Schémas zod de l'état persisté (GAME_DESIGN §6.1). Chaque objet porte un `schemaVersion`. */

const playerId = z.enum(['A', 'B']);
const gameId = z.enum(['bac', 'year', 'estim']);
const roundItem = z.object({ id: z.string().min(1), answer: z.number() });

const closestAction = z.discriminatedUnion('type', [
  z.object({ type: z.literal('READ') }),
  z.object({ type: z.literal('THINK_DONE') }),
  z.object({ type: z.literal('COUNTDOWN_DONE') }),
  z.object({ type: z.literal('INPUT'), player: playerId, value: z.number().nullable() }),
  z.object({ type: z.literal('REVEAL') }),
  z.object({ type: z.literal('NEXT') }),
]);

const bacAction = z.discriminatedUnion('type', [
  z.object({ type: z.literal('FLIP'), letter: z.string().regex(/^[A-Z]$/) }),
  z.object({ type: z.literal('START') }),
  z.object({ type: z.literal('WORD') }),
  z.object({ type: z.literal('TIMER_EXPIRED') }),
  z.object({ type: z.literal('MISS') }),
  z.object({ type: z.literal('NEXT') }),
]);

const at = z.number();

export const matchEventSchema = z.discriminatedUnion('type', [
  z.object({ type: z.literal('OPENING_DONE'), at }),
  z.object({
    type: z.literal('ROUND_STARTED'),
    round: z.number().int().nonnegative(),
    game: gameId,
    items: z.array(roundItem),
    at,
  }),
  z.object({ type: z.literal('ROUND_RECAP_DONE'), at }),
  z.object({ type: z.literal('SUDDEN_DEATH_STARTED'), game: gameId, item: roundItem, at }),
  z.object({ type: z.literal('ITEM_SKIPPED'), replacement: roundItem, at }),
  z.object({ type: z.literal('TURN_RESTARTED'), at }),
  z.object({
    type: z.literal('SCORE_ADJUSTED'),
    player: playerId,
    delta: z.number().int(),
    at,
  }),
  z.object({ type: z.literal('MATCH_ABANDONED'), at }),
  z.object({ type: z.literal('year'), action: closestAction, at }),
  z.object({ type: z.literal('estim'), action: closestAction, at }),
  z.object({ type: z.literal('bac'), action: bacAction, at }),
]);

const playerConfig = z.object({ name: z.string(), driver: z.boolean() });

export const matchConfigSchema = z.object({
  players: z.object({ A: playerConfig, B: playerConfig }),
  games: z.array(gameId).min(1),
  packs: z.array(z.string()).min(1),
  difficulty: z.enum(['easy', 'mixed', 'hard']),
  rounds: z.union([z.literal(3), z.literal(6), z.literal(9)]),
  questionsPerRound: z.union([z.literal(3), z.literal(5), z.literal(7)]),
  rules: z.object({
    exactBonus: z.boolean(),
    doubleFinalRound: z.boolean(),
    rareLetters: z.boolean(),
  }),
});

export const matchRecordSchema = z.object({
  schemaVersion: z.literal(1),
  matchId: z.string().min(1),
  config: matchConfigSchema,
  seed: z.number().int().nonnegative(),
  events: z.array(matchEventSchema),
});
export type MatchRecord = z.infer<typeof matchRecordSchema>;

export const seenSchema = z.object({
  schemaVersion: z.literal(1),
  seq: z.number().int().nonnegative(),
  items: z.record(z.string(), z.number().int().nonnegative()),
});
export type SeenStore = z.infer<typeof seenSchema>;

export const settingsSchema = z.object({
  schemaVersion: z.literal(1),
  thinkSeconds: z.union([z.literal(0), z.literal(5), z.literal(10), z.literal(15)]),
  /** Bac Éclair : temps laissé à chaque joueur pour donner son mot. */
  bacWordSeconds: z.union([z.literal(4), z.literal(6), z.literal(8), z.literal(10)]).default(6),
  sound: z.boolean(),
  haptics: z.boolean(),
  avoidSeen: z.boolean(),
  exactBonus: z.boolean(),
  doubleFinalRound: z.boolean(),
  lastSetup: z
    .object({
      names: z.tuple([z.string(), z.string()]),
      games: z.array(z.enum(['bac', 'year', 'estim'])).default(['bac', 'year', 'estim']),
      driver: z.enum(['A', 'B', 'none']),
      packs: z.array(z.string()),
      difficulty: z.enum(['easy', 'mixed', 'hard']),
      rounds: z.union([z.literal(3), z.literal(6), z.literal(9)]),
      questionsPerRound: z.union([z.literal(3), z.literal(5), z.literal(7)]),
    })
    .nullable(),
});
export type Settings = z.infer<typeof settingsSchema>;

export const DEFAULT_SETTINGS: Settings = {
  schemaVersion: 1,
  thinkSeconds: 10,
  bacWordSeconds: 6,
  sound: true,
  haptics: true,
  avoidSeen: true,
  exactBonus: true,
  doubleFinalRound: true,
  lastSetup: null,
};
