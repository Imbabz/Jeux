import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { actions } from '../../app/session.ts';
import type { YearContentItem } from '../../content/index.ts';
import {
  currentItem,
  type ClosestAction,
  type ClosestResult,
  type ClosestRoundState,
  type PerPlayer,
  type PlayerId,
} from '../../engine/index.ts';
import { haptics, sound } from '../../services/index.ts';
import { Button, GhostButton } from '../components/Button.tsx';
import { Card, CategoryChip, FlipCard, GameBanner } from '../components/Card.tsx';
import { SkipIcon } from '../components/icons.tsx';
import { YearNumpad } from '../components/Numpad.tsx';
import { YearRuler } from '../components/RevealRuler.tsx';
import { useTimeline } from '../hooks/useClock.ts';
import { scoreLine, yearGapLabel } from '../format.ts';
import { PLAYER_THEME } from '../theme/games.ts';

/**
 * Déroulé d'une question « Quelle année ? » (GAME_DESIGN §8.1).
 * Le copilote lit la carte, l'app chronomètre et bipe ; le verso n'est rendu qu'après « Révéler ».
 */

interface Props {
  round: ClosestRoundState;
  items: ReadonlyMap<string, YearContentItem>;
  names: PerPlayer<string>;
  totals: PerPlayer<number>;
  paused: boolean;
  thinkSeconds: number;
  suddenDeath: boolean;
}

const send = (action: ClosestAction) => actions.dispatch({ type: 'year', action });

export function YearRound(props: Props) {
  const { round, items } = props;
  const item = currentItem(round);
  const data = items.get(item.id);
  // Chaque état est remonté (key) : ses chronos repartent de zéro.
  const key = `${round.index}-${item.id}-${round.phase}`;
  if (!data) return <p className="p-4 text-bac">Question introuvable : {item.id}</p>;

  switch (round.phase) {
    case 'read':
    case 'think':
    case 'countdown':
      return <QuestionPhase key={key} {...props} data={data} />;
    case 'inputA':
    case 'inputB': {
      const player: PlayerId = round.phase === 'inputA' ? 'A' : 'B';
      return (
        <div key={key} className="flex h-full flex-col gap-3">
          <Recall data={data} />
          <YearNumpad
            player={player}
            name={props.names[player]}
            prefill={data.centuryHint}
            onSubmit={(value) => send({ type: 'INPUT', player, value })}
          />
        </div>
      );
    }
    case 'ready':
      return <ReadyPhase key={key} round={round} data={data} names={props.names} />;
    case 'revealed':
      return <RevealedPhase key={key} {...props} data={data} />;
  }
}

function questionLabel(round: ClosestRoundState, suddenDeath: boolean) {
  return suddenDeath ? 'Décisive' : `${round.index + 1}/${round.items.length}`;
}

function QuestionFront({
  round,
  data,
  suddenDeath,
  footer,
}: {
  round: ClosestRoundState;
  data: YearContentItem;
  suddenDeath: boolean;
  footer?: ReactNode;
}) {
  return (
    <Card className="flex h-full flex-col">
      <GameBanner game="year" right={questionLabel(round, suddenDeath)} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
        <CategoryChip>{data.category}</CategoryChip>
        <p className="font-display text-lg font-bold text-balance">{data.text}</p>
      </div>
      {footer ? <div className="flex min-h-14 items-center px-3 pb-2">{footer}</div> : null}
    </Card>
  );
}

function SkipButton({ disabled }: { disabled?: boolean }) {
  return (
    <GhostButton
      icon={<SkipIcon size={20} />}
      onClick={actions.skip}
      disabled={disabled || !actions.canSkip()}
    >
      Passer
    </GhostButton>
  );
}

function QuestionPhase({
  round,
  data,
  paused,
  thinkSeconds,
  suddenDeath,
}: Props & { data: YearContentItem }) {
  const phase = round.phase;
  const thinkMs = thinkSeconds * 1000;
  const steps = useMemo(() => {
    if (phase === 'think') return [{ at: thinkMs, run: () => send({ type: 'THINK_DONE' }) }];
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
          },
        },
        { at: 3700, run: () => send({ type: 'COUNTDOWN_DONE' }) },
      ];
    }
    return [];
  }, [phase, thinkMs]);
  const elapsed = useTimeline(!paused && phase !== 'read', steps);

  const countdownLabel =
    elapsed < 1000 ? '3' : elapsed < 2000 ? '2' : elapsed < 3000 ? '1' : 'Annoncez !';

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="relative min-h-0 flex-1">
        <QuestionFront
          round={round}
          data={data}
          suddenDeath={suddenDeath}
          footer={
            phase === 'think' ? (
              <div className="flex w-full flex-col gap-1 px-1">
                <div className="h-2 overflow-hidden rounded-chip bg-line">
                  <div
                    className="h-full rounded-chip bg-year"
                    style={{
                      width: `${Math.max(0, 100 - (elapsed / Math.max(thinkMs, 1)) * 100)}%`,
                    }}
                  />
                </div>
                <span className="text-center text-xs font-semibold text-ink-soft">Réflexion…</span>
              </div>
            ) : phase === 'read' ? (
              <SkipButton />
            ) : null
          }
        />
        {phase === 'countdown' ? (
          <div
            className="absolute inset-0 flex items-center justify-center rounded-card bg-ink"
            aria-live="assertive"
          >
            <span
              key={countdownLabel}
              className={`animate-pop font-display font-black text-white ${countdownLabel.length > 1 ? 'text-2xl' : 'text-giant'}`}
            >
              {countdownLabel}
            </span>
          </div>
        ) : null}
      </div>
      {phase === 'read' ? (
        <Button size="lg" block onClick={() => send({ type: 'READ' })}>
          C’est lu ▶
        </Button>
      ) : phase === 'think' ? (
        <Button size="lg" block variant="card" onClick={() => send({ type: 'THINK_DONE' })}>
          On est prêts : 3, 2, 1…
        </Button>
      ) : (
        <div className="min-h-18" aria-hidden="true" />
      )}
    </div>
  );
}

function Recall({ data }: { data: YearContentItem }) {
  return (
    <p className="truncate px-1 text-sm text-ink-soft">
      <span className="font-semibold">{data.category} :</span> {data.text}
    </p>
  );
}

function ProposalTag({
  player,
  name,
  value,
}: {
  player: PlayerId;
  name: string;
  value: number | null;
}) {
  const theme = PLAYER_THEME[player];
  return (
    <div
      className={`flex flex-1 flex-col items-center rounded-card py-3 shadow-card ${theme.bg} ${theme.text}`}
    >
      <span className="text-sm font-bold">{name} dit</span>
      <span className="font-display text-xl font-black tabular-nums">{value ?? '—'}</span>
    </div>
  );
}

function ReadyPhase({
  round,
  data,
  names,
}: {
  round: ClosestRoundState;
  data: YearContentItem;
  names: PerPlayer<string>;
}) {
  return (
    <div className="flex h-full flex-col gap-3">
      <Card className="flex flex-1 flex-col">
        <GameBanner game="year" />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
          <CategoryChip>{data.category}</CategoryChip>
          <p className="font-display text-lg font-bold text-balance">{data.text}</p>
        </div>
      </Card>
      <div className="flex gap-3">
        <ProposalTag player="A" name={names.A} value={round.inputs.A ?? null} />
        <ProposalTag player="B" name={names.B} value={round.inputs.B ?? null} />
      </div>
      <Button size="xl" block variant="year" onClick={() => send({ type: 'REVEAL' })}>
        Révéler
      </Button>
    </div>
  );
}

function verdict(result: ClosestResult, names: PerPlayer<string>): string {
  const { winner, points } = result.outcome;
  if (winner === 'none') return 'Personne ne marque';
  if (winner === 'tie')
    return points.A > 1 ? `Égalité : +${points.A} chacun` : 'Égalité : un point chacun';
  const pts = points[winner];
  return `+${pts} pour ${names[winner]}`;
}

function RevealedPhase({
  round,
  data,
  names,
  totals,
  suddenDeath,
}: Props & { data: YearContentItem }) {
  const result = round.results[round.results.length - 1] as ClosestResult;
  const last = round.index + 1 >= round.items.length;
  const { outcome, inputs } = result;
  // Monté recto, retourné à la frame suivante : l'animation de flip se joue.
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setFlipped(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const front = <QuestionFront round={round} data={data} suddenDeath={suddenDeath} />;
  const back = (
    <Card className="flex h-full flex-col overflow-hidden">
      <GameBanner game="year" right={questionLabel(round, suddenDeath)} />
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 px-4 pt-2 pb-3">
        <p className="animate-pop text-center font-display text-2xl font-black tabular-nums">
          {result.item.answer}
        </p>
        <YearRuler answer={result.item.answer} proposals={inputs} names={names} />
        <div className="flex flex-col gap-1">
          {(['A', 'B'] as const).map((p) => (
            <div
              key={p}
              className="flex items-center gap-2 rounded-key bg-table px-3 py-0.5 text-sm"
            >
              <span
                className={`size-3 shrink-0 rounded-chip ${PLAYER_THEME[p].bg}`}
                aria-hidden="true"
              />
              <span className="min-w-0 truncate font-bold">{names[p]}</span>
              <span className="font-bold tabular-nums">{inputs[p] ?? '—'}</span>
              <span
                className={`ml-auto font-semibold whitespace-nowrap ${outcome.exact[p] ? 'text-estim-deep' : 'text-ink-soft'}`}
              >
                {yearGapLabel(outcome.gap[p], outcome.exact[p])}
              </span>
            </div>
          ))}
        </div>
        <p className="text-center text-md font-bold">
          {verdict(result, names)}
          {suddenDeath ? '' : ` · ${scoreLine(names, totals)}`}
        </p>
        <p className="mt-auto text-center text-sm leading-snug text-ink-soft italic text-balance">
          {data.context}
        </p>
      </div>
    </Card>
  );
  return (
    <div className="flex h-full flex-col gap-3">
      <FlipCard flipped={flipped} front={front} back={back} className="min-h-0 flex-1" />
      <Button size="lg" block onClick={() => send({ type: 'NEXT' })}>
        {suddenDeath ? 'Voir le résultat' : last ? 'Fin de la manche' : 'Question suivante'}
      </Button>
    </div>
  );
}
