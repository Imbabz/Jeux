import type { GameId } from '../../engine/index.ts';
import { GAME_THEME } from '../theme/games.ts';

/** Jeton : pastille ronde à la couleur du jeu, liseré blanc, ombre légère (DESIGN §3.7). */
export function Token({
  game,
  size = 'md',
  empty = false,
  className = '',
}: {
  game?: GameId;
  size?: 'sm' | 'md' | 'lg';
  empty?: boolean;
  className?: string;
}) {
  const dims = { sm: 'size-3.5 border', md: 'size-7 border-2', lg: 'size-10 border-[3px]' }[size];
  if (empty || !game) {
    return (
      <span
        aria-hidden="true"
        className={`inline-block rounded-chip border-dashed border-line-deep ${dims} ${className}`}
      />
    );
  }
  return (
    <span
      role="img"
      aria-label={`Jeton ${GAME_THEME[game].name}`}
      className={`inline-block rounded-chip border-white shadow-token ${GAME_THEME[game].bg} ${dims} ${className}`}
    />
  );
}

export function TokenRow({ games, size = 'sm' }: { games: readonly GameId[]; size?: 'sm' | 'md' }) {
  return (
    <span className="flex flex-wrap gap-1">
      {games.map((g, i) => (
        <Token key={`${g}-${i}`} game={g} size={size} />
      ))}
    </span>
  );
}
