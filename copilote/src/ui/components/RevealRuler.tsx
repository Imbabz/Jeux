import type { PlayerId } from '../../engine/index.ts';
import { initialOf, PLAYER_THEME } from '../theme/games.ts';

/**
 * Réglette de révélation (DESIGN §3.6) : la bonne réponse est un repère encre,
 * les propositions sont des pions aux couleurs des joueurs. Échelle linéaire (années).
 */

const STEPS = [1, 2, 5, 10, 20, 25, 50, 100, 200, 250, 500, 1000];
const W = 320;
const PAD = 20;

export function YearRuler({
  answer,
  proposals,
  names,
}: {
  answer: number;
  proposals: Record<PlayerId, number | null>;
  names: Record<PlayerId, string>;
}) {
  const gaps = (['A', 'B'] as const).map((p) =>
    proposals[p] === null ? 0 : Math.abs((proposals[p] as number) - answer),
  );
  const half = Math.max(10, ...gaps) * 1.15;
  const min = answer - half;
  const max = answer + half;
  const x = (v: number) => PAD + ((v - min) / (max - min)) * (W - 2 * PAD);
  const step = STEPS.find((s) => (max - min) / s <= 6) ?? 1000;
  const ticks: number[] = [];
  for (let t = Math.ceil(min / step) * step; t <= max; t += step) ticks.push(t);
  const same = proposals.A !== null && proposals.A === proposals.B;

  return (
    <svg
      viewBox={`0 0 ${W} 84`}
      className="w-full"
      role="img"
      aria-label={`Réglette : réponse ${answer}`}
    >
      <line
        x1={PAD}
        x2={W - PAD}
        y1={52}
        y2={52}
        stroke="var(--color-line-deep)"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {ticks.map((t) => (
        <g key={t}>
          <line
            x1={x(t)}
            x2={x(t)}
            y1={46}
            y2={58}
            stroke="var(--color-line-deep)"
            strokeWidth={2}
          />
          <text
            x={x(t)}
            y={76}
            textAnchor="middle"
            fontSize={12}
            fill="var(--color-ink-soft)"
            fontWeight={600}
          >
            {t}
          </text>
        </g>
      ))}
      <line
        x1={x(answer)}
        x2={x(answer)}
        y1={30}
        y2={64}
        stroke="var(--color-ink)"
        strokeWidth={4}
        strokeLinecap="round"
      />
      {(['A', 'B'] as const).map((p) => {
        const v = proposals[p];
        if (v === null) return null;
        const cy = same && p === 'B' ? 12 : 22;
        return (
          <g key={p}>
            <circle
              cx={x(v)}
              cy={cy}
              r={11}
              fill={PLAYER_THEME[p].fill}
              stroke="var(--color-white)"
              strokeWidth={2}
            />
            <text
              x={x(v)}
              y={cy + 4}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill={p === 'A' ? 'var(--color-on-player-a)' : 'var(--color-on-player-b)'}
            >
              {initialOf(names[p])}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

const LOG_TICKS = [
  { factor: 0.01, label: '÷100' },
  { factor: 0.1, label: '÷10' },
  { factor: 1, label: '' },
  { factor: 10, label: '×10' },
  { factor: 100, label: '×100' },
] as const;

/**
 * Réglette d'Estimation en échelle logarithmique, de ÷100 à ×100 autour de la réponse (DESIGN §3.6).
 * Au-delà, le pion est posé au bord avec une flèche.
 */
export function LogRuler({
  answer,
  proposals,
  names,
}: {
  answer: number;
  proposals: Record<PlayerId, number | null>;
  names: Record<PlayerId, string>;
}) {
  const x = (factor: number) => {
    const t = (Math.log10(factor) + 2) / 4;
    return PAD + Math.min(1, Math.max(0, t)) * (W - 2 * PAD);
  };
  const same = proposals.A !== null && proposals.A === proposals.B;
  return (
    <svg viewBox={`0 0 ${W} 84`} className="w-full" role="img" aria-label="Réglette logarithmique">
      <line
        x1={PAD}
        x2={W - PAD}
        y1={52}
        y2={52}
        stroke="var(--color-line-deep)"
        strokeWidth={2}
        strokeLinecap="round"
      />
      {LOG_TICKS.map((t) => (
        <g key={t.factor}>
          <line
            x1={x(t.factor)}
            x2={x(t.factor)}
            y1={46}
            y2={58}
            stroke="var(--color-line-deep)"
            strokeWidth={2}
          />
          <text
            x={x(t.factor)}
            y={76}
            textAnchor="middle"
            fontSize={12}
            fill="var(--color-ink-soft)"
            fontWeight={600}
          >
            {t.label}
          </text>
        </g>
      ))}
      <line
        x1={x(1)}
        x2={x(1)}
        y1={30}
        y2={64}
        stroke="var(--color-ink)"
        strokeWidth={4}
        strokeLinecap="round"
      />
      {(['A', 'B'] as const).map((p) => {
        const v = proposals[p];
        if (v === null) return null;
        const factor = v / answer;
        const cx = x(factor);
        const cy = same && p === 'B' ? 12 : 22;
        const clipped = factor < 0.01 ? '◀' : factor > 100 ? '▶' : null;
        return (
          <g key={p}>
            <circle
              cx={cx}
              cy={cy}
              r={11}
              fill={PLAYER_THEME[p].fill}
              stroke="var(--color-white)"
              strokeWidth={2}
            />
            <text
              x={cx}
              y={cy + 4}
              textAnchor="middle"
              fontSize={12}
              fontWeight={700}
              fill={p === 'A' ? 'var(--color-on-player-a)' : 'var(--color-on-player-b)'}
            >
              {initialOf(names[p])}
            </text>
            {clipped ? (
              <text
                x={cx + (clipped === '◀' ? -2 : 2)}
                y={cy + 24}
                textAnchor="middle"
                fontSize={10}
                fill="var(--color-ink-soft)"
              >
                {clipped}
              </text>
            ) : null}
          </g>
        );
      })}
    </svg>
  );
}
