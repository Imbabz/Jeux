import { useMemo, type ReactNode } from 'react';
import { actions } from '../../app/session.ts';
import type { BacAction, BacResult, BacRoundState, PerPlayer } from '../../engine/index.ts';
import { haptics, sound } from '../../services/index.ts';
import { Button, GhostButton, PlayerButton } from '../components/Button.tsx';
import { BoltIcon, SkipIcon, UndoIcon } from '../components/icons.tsx';
import { useTimeline } from '../hooks/useClock.ts';
import { scoreLine } from '../format.ts';

/**
 * Déroulé d'un tour de Bac Éclair (GAME_DESIGN §7.1).
 * Le copilote retourne la carte et lit « Un animal… en B ! » pendant le décompte ; l'app chronomètre et bipe.
 */

interface Props {
  round: BacRoundState;
  label: string;
  names: PerPlayer<string>;
  totals: PerPlayer<number>;
  paused: boolean;
  bacSeconds: number;
  suddenDeath: boolean;
}

const send = (action: BacAction) => actions.dispatch({ type: 'bac', action });
const CONTEST_WINDOW = 3000;

function verdict(result: BacResult, names: PerPlayer<string>): string {
  if (result.voided) return 'Trop de rejeux : tour sans point';
  if (result.winner === 'none') return 'Personne ne marque';
  if (result.winner === 'both') return `Ensemble : +${result.points.A} chacun`;
  return `Point pour ${names[result.winner]} !`;
}

export function BacRound(props: Props) {
  const { round } = props;
  // Chaque état est remonté (key) : ses chronos repartent de zéro.
  return <BacPhase key={`${round.index}-${round.replays}-${round.phase}`} {...props} />;
}

function BacPhase({ round, label, names, totals, paused, bacSeconds, suddenDeath }: Props) {
  const phase = round.phase;
  const bacMs = bacSeconds * 1000;
  const steps = useMemo(() => {
    if (phase === 'countdown') {
      const tick = () => {
        sound.beep('tick');
        haptics.pulse(20);
      };
      return [
        { at: 0, run: tick },
        { at: 1000, run: tick },
        { at: 2000, run: tick },
        {
          at: 3000,
          run: () => {
            sound.beep('go');
            haptics.pulse(60);
            send({ type: 'COUNTDOWN_DONE' });
          },
        },
      ];
    }
    if (phase === 'running') {
      return [
        { at: Math.max(0, bacMs - 5000), run: () => sound.beep('alert') },
        {
          at: bacMs,
          run: () => {
            sound.beep('end');
            haptics.pulse(120);
            send({ type: 'TIMER_EXPIRED' });
          },
        },
      ];
    }
    return [];
  }, [phase, bacMs]);
  const timed = phase === 'countdown' || phase === 'running' || phase === 'resolved';
  const elapsed = useTimeline(!paused && timed, steps);

  const last = round.results[round.results.length - 1];
  const remaining =
    phase === 'running' ? Math.max(0, bacMs - elapsed) : phase === 'countdown' ? bacMs : 0;
  const countdown =
    phase === 'countdown' ? String(3 - Math.min(2, Math.floor(elapsed / 1000))) : null;
  const questionLabel = suddenDeath ? 'Décisive' : `${round.index + 1}/${round.items.length}`;
  const canSkip = phase !== 'resolved' && phase !== 'timeout' && actions.canSkip();
  const isLast = round.index + 1 >= round.items.length;

  let buttons: ReactNode;
  if (phase === 'hidden') {
    buttons = (
      <Button
        size="xl"
        block
        className="bg-bac [--btn-deep:var(--color-bac-deep)]"
        onClick={actions.flipBac}
      >
        Retourner la carte
      </Button>
    );
  } else if (phase === 'resolved') {
    const contestable = last && last.winner !== 'none' && elapsed < CONTEST_WINDOW;
    buttons = (
      <div className="flex flex-col gap-2">
        <Button size="lg" block onClick={() => send({ type: 'NEXT' })}>
          {suddenDeath ? 'Voir le résultat' : isLast ? 'Fin de la manche' : 'Tour suivant'}
        </Button>
        <div className="flex min-h-12 justify-center">
          {contestable ? (
            <GhostButton
              icon={<UndoIcon size={20} />}
              tone="danger"
              onClick={() => send({ type: 'CONTESTED' })}
            >
              Contesté ! ({Math.ceil((CONTEST_WINDOW - elapsed) / 1000)})
            </GhostButton>
          ) : null}
        </div>
      </div>
    );
  } else {
    const active = phase === 'running' || phase === 'timeout';
    buttons = (
      <div className="flex flex-col gap-3">
        <div className="grid grid-cols-2 gap-3">
          <PlayerButton
            player="A"
            name={names.A}
            size="xl"
            disabled={!active}
            onClick={() => send({ type: 'BUZZ', who: 'A' })}
          />
          <PlayerButton
            player="B"
            name={names.B}
            size="xl"
            disabled={!active}
            onClick={() => send({ type: 'BUZZ', who: 'B' })}
          />
        </div>
        {phase === 'timeout' ? (
          <Button variant="neutral" block onClick={() => send({ type: 'NOBODY' })}>
            Personne
          </Button>
        ) : (
          <Button
            variant="neutral"
            block
            disabled={!active}
            onClick={() => send({ type: 'BUZZ', who: 'both' })}
          >
            Ensemble !
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col gap-3">
      <LetterCard
        hidden={phase === 'hidden'}
        label={label}
        letter={round.letter}
        progress={phase === 'running' ? remaining / bacMs : phase === 'countdown' ? 1 : 0}
        alert={phase === 'running' && remaining <= 5000}
        dimmed={phase === 'timeout'}
        countdown={countdown}
        corner={questionLabel}
        onFlip={phase === 'hidden' ? actions.flipBac : undefined}
        footer={
          phase === 'resolved' && last ? (
            <div className="flex flex-col items-center gap-0.5 rounded-key bg-white/15 px-3 py-2 text-center">
              <span className="text-md font-bold">{verdict(last, names)}</span>
              {suddenDeath ? null : (
                <span className="text-sm font-semibold">{scoreLine(names, totals)}</span>
              )}
            </div>
          ) : phase === 'timeout' ? (
            <p className="text-center text-md font-bold">
              Temps écoulé ! Un mot dit pile au buzzer ?
            </p>
          ) : canSkip ? (
            <GhostButton icon={<SkipIcon size={20} />} tone="inverse" onClick={actions.skip}>
              Passer
            </GhostButton>
          ) : null
        }
      />
      {buttons}
    </div>
  );
}

/** Carte rouge du Bac Éclair : catégorie, lettre géante et anneau de chrono (DESIGN §3.3). */
export function LetterCard({
  hidden,
  label,
  letter,
  progress,
  alert,
  dimmed = false,
  countdown = null,
  corner,
  onFlip,
  footer,
}: {
  hidden: boolean;
  label: string;
  letter: string | null;
  progress: number;
  alert: boolean;
  dimmed?: boolean;
  countdown?: string | null;
  corner?: string;
  onFlip?: (() => void) | undefined;
  footer?: ReactNode;
}) {
  const R = 84;
  const C = 2 * Math.PI * R;
  return (
    <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-card bg-bac text-white shadow-card">
      <div className="flex h-14 shrink-0 items-center gap-2 px-4">
        <BoltIcon size={26} />
        <span className="text-md font-bold tracking-wide uppercase">Bac Éclair</span>
        {corner ? <span className="ml-auto text-md font-bold">{corner}</span> : null}
      </div>
      {hidden ? (
        <button
          type="button"
          onClick={onFlip}
          className="flex flex-1 flex-col items-center justify-center gap-3 text-center"
          aria-label="Retourner la carte"
        >
          <span className="flex size-32 items-center justify-center rounded-chip border-4 border-dashed border-white/50">
            <BoltIcon size={64} strokeWidth={2} />
          </span>
          <span className="text-md font-bold">Touchez pour retourner</span>
        </button>
      ) : (
        <div
          className={`flex min-h-0 flex-1 flex-col items-center justify-center gap-2 px-4 ${dimmed ? 'opacity-70' : ''}`}
        >
          <p className="text-center text-md font-bold tracking-wide uppercase text-balance">
            {label}
          </p>
          <div className="relative flex items-center justify-center">
            <svg
              width={188}
              height={188}
              viewBox="0 0 188 188"
              className="-rotate-90"
              aria-hidden="true"
            >
              <circle
                cx={94}
                cy={94}
                r={R}
                fill="none"
                stroke="var(--color-white)"
                strokeOpacity={0.25}
                strokeWidth={10}
              />
              <circle
                cx={94}
                cy={94}
                r={R}
                fill="none"
                stroke={alert ? 'var(--color-ink)' : 'var(--color-white)'}
                strokeWidth={10}
                strokeLinecap="round"
                strokeDasharray={C}
                strokeDashoffset={C * (1 - progress)}
              />
            </svg>
            <span
              className={`absolute font-display text-letter font-black leading-none ${alert ? 'animate-bump' : ''}`}
              aria-label={`Lettre ${letter ?? ''}`}
            >
              {letter}
            </span>
            {countdown ? (
              <span
                key={countdown}
                className="absolute -right-3 -bottom-1 flex size-14 animate-pop items-center justify-center rounded-chip bg-ink font-display text-xl font-black"
              >
                {countdown}
              </span>
            ) : null}
          </div>
        </div>
      )}
      <div className="flex min-h-14 items-center justify-center px-3 pb-3">{footer}</div>
    </div>
  );
}
