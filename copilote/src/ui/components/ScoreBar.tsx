import type { GameId, PlayerId } from '../../engine/index.ts';
import { Initial } from './Button.tsx';
import { TokenRow } from './Token.tsx';

interface PlayerScore {
  name: string;
  score: number;
  tokens: readonly GameId[];
}

/**
 * Barre de score (DESIGN §3.2) : pastilles joueurs, scores en Fraunces, jetons, manche au centre.
 * Le menu est dans l'ActionBar : à 375 px, la barre garde ainsi la place des prénoms.
 */
export function ScoreBar({
  players,
  center,
  badge,
  leader,
}: {
  players: Record<PlayerId, PlayerScore>;
  center: string;
  badge?: 'double' | 'sudden' | null;
  leader?: PlayerId | null;
}) {
  const side = (id: PlayerId) => {
    const p = players[id];
    return (
      <div
        className={`flex min-w-0 flex-1 items-center gap-2 ${id === 'B' ? 'flex-row-reverse text-right' : ''}`}
      >
        <Initial player={id} name={p.name} />
        <div className="flex min-w-0 flex-col">
          <span
            className={`truncate text-xs ${leader === id ? 'font-bold text-ink' : 'font-semibold text-ink-soft'}`}
          >
            {p.name}
          </span>
          <TokenRow games={p.tokens} />
        </div>
        <span
          key={p.score}
          aria-label={`Score de ${p.name} : ${p.score}`}
          className="animate-bump font-display text-xl font-black tabular-nums"
        >
          {p.score}
        </span>
      </div>
    );
  };
  return (
    <header className="pt-safe shrink-0 bg-table/90">
      <div className="flex h-18 items-center gap-2 px-4">
        {side('A')}
        <div className="flex shrink-0 flex-col items-center px-1">
          <span className="text-xs font-semibold whitespace-nowrap text-ink-soft">{center}</span>
          {badge === 'double' ? (
            <span className="mt-0.5 rounded-chip bg-ink px-2 text-xs font-bold text-white">×2</span>
          ) : badge === 'sudden' ? (
            <span className="mt-0.5 text-xs font-bold text-bac">Mort subite</span>
          ) : null}
        </div>
        {side('B')}
      </div>
    </header>
  );
}
