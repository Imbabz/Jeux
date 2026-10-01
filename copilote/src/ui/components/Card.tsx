import type { ReactNode } from 'react';
import type { GameId } from '../../engine/index.ts';
import { GAME_THEME } from '../theme/games.ts';
import { GameIcon } from './icons.tsx';

/** Carte blanche : rayon 20, liseré encre 10 %, ombre douce (DESIGN §1.5). */
export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return (
    <div className={`rounded-card border border-ink/10 bg-card shadow-card ${className}`}>
      {children}
    </div>
  );
}

/** Bandeau supérieur de 56 px à la couleur du jeu, avec icône et nom en blanc (≥ 20 px gras). */
export function GameBanner({ game, right }: { game: GameId; right?: ReactNode }) {
  const theme = GAME_THEME[game];
  return (
    <div
      className={`flex h-14 shrink-0 items-center gap-2 rounded-t-card px-4 text-white ${theme.bg}`}
    >
      <GameIcon game={game} size={26} />
      <span className="text-md font-bold uppercase tracking-wide">{theme.name}</span>
      {right ? <span className="ml-auto text-md font-bold">{right}</span> : null}
    </div>
  );
}

export function CategoryChip({ children }: { children: ReactNode }) {
  return (
    <span className="inline-flex items-center rounded-chip border border-line bg-table px-3 py-1 text-xs font-semibold uppercase tracking-wide text-ink-soft">
      {children}
    </span>
  );
}

/**
 * Carte question avec retournement 3D : recto = question, verso = réponse (DESIGN §3.3).
 * Le verso n'est rendu qu'une fois la carte retournée : la réponse n'existe pas dans le DOM avant.
 */
export function FlipCard({
  flipped,
  front,
  back,
  className = '',
}: {
  flipped: boolean;
  front: ReactNode;
  back: ReactNode;
  className?: string;
}) {
  return (
    <div className={`flip-scene relative ${className}`}>
      <div className="flip-card relative h-full w-full" data-flipped={flipped}>
        <div className="flip-face absolute inset-0">{front}</div>
        <div className="flip-face flip-back absolute inset-0">{flipped ? back : null}</div>
      </div>
    </div>
  );
}
