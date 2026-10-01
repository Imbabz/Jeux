import type { ButtonHTMLAttributes, ReactNode } from 'react';
import type { PlayerId } from '../../engine/index.ts';
import { haptics } from '../../services/index.ts';
import { initialOf, PLAYER_THEME } from '../theme/games.ts';

/** Boutons « physiques » (DESIGN §3.4) : fond plein, relief bas de 4 px, s'enfoncent au tap. */

type Variant = 'primary' | 'neutral' | 'card' | 'playerA' | 'playerB' | 'year';

const VARIANTS: Record<Variant, string> = {
  primary: 'bg-ink text-white [--btn-deep:var(--color-ink-deep)]',
  neutral: 'bg-neutral text-ink [--btn-deep:var(--color-neutral-deep)]',
  card: 'bg-card text-ink border border-line [--btn-deep:var(--color-line-deep)]',
  playerA: `bg-player-a text-on-player-a ${PLAYER_THEME.A.deep}`,
  playerB: `bg-player-b text-on-player-b ${PLAYER_THEME.B.deep}`,
  year: 'bg-year text-white [--btn-deep:var(--color-year-deep)]',
};

const SIZES = {
  md: 'min-h-16 px-5 text-md',
  lg: 'min-h-18 px-6 text-md',
  xl: 'min-h-22 px-6 text-lg',
} as const;

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: keyof typeof SIZES;
  icon?: ReactNode;
  block?: boolean;
}

export function Button({
  variant = 'primary',
  size = 'md',
  icon,
  block = false,
  className = '',
  children,
  onClick,
  disabled,
  ...rest
}: ButtonProps) {
  const look = disabled ? 'bg-line text-ink-soft border-transparent' : VARIANTS[variant];
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={(e) => {
        haptics.pulse(10);
        onClick?.(e);
      }}
      className={`btn-physical inline-flex select-none items-center justify-center gap-3 rounded-button font-bold ${SIZES[size]} ${look} ${block ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

/** Bouton à la couleur d'un joueur, avec son initiale et son prénom. */
export function PlayerButton({
  player,
  name,
  winner = false,
  className = '',
  ...rest
}: Omit<ButtonProps, 'variant' | 'icon'> & { player: PlayerId; name: string; winner?: boolean }) {
  return (
    <Button
      variant={player === 'A' ? 'playerA' : 'playerB'}
      icon={<Initial player={player} name={name} inverted size="sm" />}
      className={`${winner ? 'ring-4 ring-ink ring-offset-2 ring-offset-table' : ''} ${className}`}
      {...rest}
    >
      <span className="truncate">{name}</span>
    </Button>
  );
}

/** Bouton discret : Passer, Signaler, Pas de réponse secondaire (DESIGN §3.4). */
export function GhostButton({
  icon,
  children,
  className = '',
  ...rest
}: ButtonHTMLAttributes<HTMLButtonElement> & { icon?: ReactNode }) {
  return (
    <button
      type="button"
      className={`inline-flex min-h-12 items-center gap-2 rounded-button px-3 text-sm font-semibold text-ink-soft transition-colors active:bg-line disabled:opacity-40 ${className}`}
      {...rest}
    >
      {icon}
      {children}
    </button>
  );
}

/** Pastille ronde avec l'initiale du joueur. */
export function Initial({
  player,
  name,
  size = 'md',
  inverted = false,
}: {
  player: PlayerId;
  name: string;
  size?: 'sm' | 'md' | 'lg';
  inverted?: boolean;
}) {
  const dims = { sm: 'size-8 text-sm', md: 'size-9 text-sm', lg: 'size-14 text-lg' }[size];
  const theme = PLAYER_THEME[player];
  const colors = inverted ? 'bg-card text-ink' : `${theme.bg} ${theme.text}`;
  return (
    <span
      aria-hidden="true"
      className={`inline-flex shrink-0 items-center justify-center rounded-chip font-bold ${dims} ${colors}`}
    >
      {initialOf(name)}
    </span>
  );
}
