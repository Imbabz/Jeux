import type { ClosestAction } from './games/closest/machine.ts';
import type { GameId, RoundItem } from './types.ts';

/** Événements d'une partie (GAME_DESIGN §6.3). `at` est un horodatage que le reducer ne lit jamais. */
export type MatchEventBody =
  | { readonly type: 'OPENING_DONE' }
  | {
      readonly type: 'ROUND_STARTED';
      readonly round: number;
      readonly game: GameId;
      readonly items: readonly RoundItem[];
    }
  | { readonly type: 'ROUND_RECAP_DONE' }
  | { readonly type: 'SUDDEN_DEATH_STARTED'; readonly game: GameId; readonly item: RoundItem }
  | { readonly type: 'ITEM_SKIPPED'; readonly replacement: RoundItem }
  | { readonly type: 'TURN_RESTARTED' }
  | { readonly type: 'MATCH_ABANDONED' }
  | { readonly type: 'year'; readonly action: ClosestAction }
  | { readonly type: 'estim'; readonly action: ClosestAction };

export type MatchEvent = MatchEventBody & { readonly at: number };

/**
 * Une « décision » est un choix du copilote qui produit un résultat (GAME_DESIGN §6.4).
 * Annuler retire la dernière décision et tout ce qui la suit.
 */
export function isDecision(event: MatchEventBody): boolean {
  switch (event.type) {
    case 'ITEM_SKIPPED':
      return true;
    case 'year':
    case 'estim':
      return event.action.type === 'INPUT' || event.action.type === 'REVEAL';
    default:
      return false;
  }
}

export function canUndo(events: readonly MatchEventBody[]): boolean {
  return events.some(isDecision);
}

export function undoLastDecision<E extends MatchEventBody>(events: readonly E[]): E[] {
  const index = events.findLastIndex(isDecision);
  return index < 0 ? [...events] : events.slice(0, index);
}

/** Libellé court pour le journal et le debug : « year/INPUT », « ROUND_STARTED »… */
export function eventLabel(event: MatchEventBody): string {
  return event.type === 'year' || event.type === 'estim'
    ? `${event.type}/${event.action.type}`
    : event.type;
}
