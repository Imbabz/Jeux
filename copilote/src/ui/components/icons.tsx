import type { SVGProps } from 'react';
import type { GameId } from '../../engine/index.ts';

/** Icônes géométriques maison : trait 2,5 px, coins arrondis, grille 24 px (DESIGN §2). */

type IconProps = SVGProps<SVGSVGElement> & { size?: number };

function Svg({ size = 24, children, ...rest }: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.5}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...rest}
    >
      {children}
    </svg>
  );
}

export const BoltIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M18.5 5.5A9 9 0 1 0 21 12" />
    <path d="M13 6.5 9 13h4l-1.5 5L16 11h-4l1-4.5Z" />
  </Svg>
);

export const HourglassIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M6 3h12M6 21h12" />
    <path d="M8 3v3c0 2.2 1.6 3.8 4 6-2.4 2.2-4 3.8-4 6v3M16 3v3c0 2.2-1.6 3.8-4 6 2.4 2.2 4 3.8 4 6v3" />
    <path d="M10 18.5h4" />
  </Svg>
);

export const BalanceIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 4v16M8.5 20h7M4.5 7h15" />
    <path d="M4.5 7 2 13a2.6 2.6 0 0 0 5 0L4.5 7ZM19.5 7 17 13a2.6 2.6 0 0 0 5 0l-2.5-6Z" />
  </Svg>
);

export function GameIcon({ game, ...rest }: IconProps & { game: GameId }) {
  if (game === 'bac') return <BoltIcon {...rest} />;
  if (game === 'year') return <HourglassIcon {...rest} />;
  return <BalanceIcon {...rest} />;
}

export const UndoIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 14 4 9l5-5" />
    <path d="M4 9h10.5a5.5 5.5 0 0 1 0 11H11" />
  </Svg>
);

export const PauseIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 5v14M15 5v14" />
  </Svg>
);

export const PlayIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M7 4.5v15l12-7.5-12-7.5Z" />
  </Svg>
);

export const MenuIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M12 6h.01M12 12h.01M12 18h.01" strokeWidth={3.5} />
  </Svg>
);

export const FlagIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
  </Svg>
);

export const SkipIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 6 6 6-6 6M13 6l6 6-6 6" />
  </Svg>
);

export const CheckIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </Svg>
);

export const BackspaceIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M9 5h11v14H9l-6-7 6-7Z" />
    <path d="m12.5 9.5 5 5M17.5 9.5l-5 5" />
  </Svg>
);

export const ArrowLeftIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Svg>
);

export const CarIcon = (p: IconProps) => (
  <Svg {...p}>
    <path d="M4 16v-4l2-5h12l2 5v4H4Z" />
    <path d="M4 12h16M7 19v-3M17 19v-3" />
  </Svg>
);
