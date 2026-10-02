import type { BacAction } from './games/bac/machine.ts';
import type { ClosestAction } from './games/closest/machine.ts';
import type { GameId, PlayerId, RoundItem } from './types.ts';

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
  | { readonly type: 'SCORE_ADJUSTED'; readonly player: PlayerId; readonly delta: number }
  | { readonly type: 'MATCH_ABANDONED' }
  | { readonly type: 'year'; readonly action: ClosestAction }
  | { readonly type: 'estim'; readonly action: ClosestAction }
  | { readonly type: 'bac'; readonly action: BacAction };

export type MatchEvent = MatchEventBody & { readonly at: number };

/**
 * Une « décision » est un choix du copilote qui produit un résultat (GAME_DESIGN §6.4).
 * Annuler retire la dernière décision et tout ce qui la suit.
 */
export function isDecision(event: MatchEventBody): boolean {
  switch (event.type) {
    case 'ITEM_SKIPPED':
    case 'SCORE_ADJUSTED':
      return true;
    case 'year':
    case 'estim':
      return event.action.type === 'INPUT' || event.action.type === 'REVEAL';
    case 'bac':
      return event.action.type === 'WORD' || event.action.type === 'MISS';
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
  return 'action' in event ? `${event.type}/${event.action.type}` : event.type;
}
