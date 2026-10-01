import { useEffect, useMemo, useState, type ReactNode } from 'react';
import { actions } from '../../app/session.ts';
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
import { EstimNumpad, YearNumpad } from '../components/Numpad.tsx';
import { LogRuler, YearRuler } from '../components/RevealRuler.tsx';
import { useTimeline } from '../hooks/useClock.ts';
import { formatQuantity, ratioLabel, scoreLine, yearGapLabel } from '../format.ts';
import { PLAYER_THEME } from '../theme/games.ts';

/**
 * Déroulé d'une question « au plus proche » : Quelle année ? et Estimation (GAME_DESIGN §8 et §9).
 * Le copilote lit la carte, l'app chronomètre et bipe ; le verso n'est rendu qu'après « Révéler ».
 */

/** Ce que l'écran affiche d'un item, quel que soit le jeu. */
export interface CardView {
  readonly chip: string;
  readonly text: string;
  readonly context: string;
  /** Unité (Estimation) ; absente pour les années. */
  readonly unit?: string;
  /** Chiffres pré-remplis du pavé (indice de siècle). */
  readonly prefill?: string;
  /** Réponse telle qu'affichée au verso. */
  readonly answerLabel: string;
  /** Indice facultatif, révélé à la demande. */
  readonly hint?: string;
}

/** Indice de la question : caché par défaut, le copilote le révèle s'il le juge utile. */
interface HintState {
  readonly shown: boolean;
  readonly show: () => void;
}

interface Props {
  round: ClosestRoundState;
  view: CardView;
  names: PerPlayer<string>;
  totals: PerPlayer<number>;
  paused: boolean;
  thinkSeconds: number;
  suddenDeath: boolean;
}

const sendFor = (round: ClosestRoundState) => (action: ClosestAction) =>
  actions.dispatch({ type: round.kind, action });

export function ClosestRound(props: Props) {
  const { round, view } = props;
  const item = currentItem(round);
  const send = sendFor(round);
  const [hintFor, setHintFor] = useState<string | null>(null);
  const hint: HintState = { shown: hintFor === item.id, show: () => setHintFor(item.id) };
  // Chaque état est remonté (key) : ses chronos repartent de zéro.
  const key = `${round.index}-${item.id}-${round.phase}`;

  switch (round.phase) {
    case 'read':
    case 'think':
    case 'countdown':
      return <QuestionPhase key={key} {...props} hint={hint} />;
    case 'inputA':
    case 'inputB': {
      const player: PlayerId = round.phase === 'inputA' ? 'A' : 'B';
      const onSubmit = (value: number | null) => send({ type: 'INPUT', player, value });
      return (
        <div key={key} className="flex h-full flex-col gap-2">
          <Recall view={view} hint={hint} />
          {round.kind === 'estim' ? (
            <EstimNumpad
              player={player}
              name={props.names[player]}
              unit={view.unit ?? ''}
              onSubmit={onSubmit}
            />
          ) : (
            <YearNumpad
              player={player}
              name={props.names[player]}
              prefill={view.prefill ?? ''}
              onSubmit={onSubmit}
            />
          )}
        </div>
      );
    }
    case 'ready':
      return <ReadyPhase key={key} round={round} view={view} names={props.names} hint={hint} />;
    case 'revealed':
      return <RevealedPhase key={key} {...props} />;
  }
}

function questionLabel(round: ClosestRoundState, suddenDeath: boolean) {
  return suddenDeath ? 'Décisive' : `${round.index + 1}/${round.items.length}`;
}

function HintLine({ view, hint }: { view: CardView; hint: HintState }) {
  if (!view.hint) return null;
  return hint.shown ? (
    <p className="rounded-key bg-table px-3 py-2 text-sm font-semibold text-ink">
      Indice : {view.hint}
    </p>
  ) : (
    <GhostButton onClick={hint.show}>Indice</GhostButton>
  );
}

function QuestionFront({
  round,
  view,
  suddenDeath,
  hint,
  footer,
}: {
  round: ClosestRoundState;
  view: CardView;
  suddenDeath: boolean;
  hint: HintState;
  footer?: ReactNode;
}) {
  return (
    <Card className="flex h-full flex-col">
      <GameBanner game={round.kind} right={questionLabel(round, suddenDeath)} />
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
        <CategoryChip>{view.chip}</CategoryChip>
        <p className="font-display text-lg font-bold text-balance">{view.text}</p>
        <HintLine view={view} hint={hint} />
      </div>
      {footer ? <div className="flex min-h-14 items-center px-3 pb-2">{footer}</div> : null}
    </Card>
  );
}

function SkipButton() {
  return (
    <GhostButton icon={<SkipIcon size={20} />} onClick={actions.skip} disabled={!actions.canSkip()}>
      Passer
    </GhostButton>
  );
}

function QuestionPhase({
  round,
  view,
  paused,
  thinkSeconds,
  suddenDeath,
  hint,
}: Props & { hint: HintState }) {
  const phase = round.phase;
  const send = sendFor(round);
  const thinkMs = thinkSeconds * 1000;
  const steps = useMemo(() => {
    const go = (action: ClosestAction) => actions.dispatch({ type: round.kind, action });
    if (phase === 'think') return [{ at: thinkMs, run: () => go({ type: 'THINK_DONE' }) }];
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
        { at: 3700, run: () => go({ type: 'COUNTDOWN_DONE' }) },
      ];
    }
    return [];
  }, [phase, thinkMs, round.kind]);
  const elapsed = useTimeline(!paused && phase !== 'read', steps);
  const countdownLabel =
    elapsed < 1000 ? '3' : elapsed < 2000 ? '2' : elapsed < 3000 ? '1' : 'Annoncez !';
  const bar = round.kind === 'estim' ? 'bg-estim' : 'bg-year';

  return (
    <div className="flex h-full flex-col gap-3">
      <div className="relative min-h-0 flex-1">
        <QuestionFront
          round={round}
          view={view}
          suddenDeath={suddenDeath}
          hint={hint}
          footer={
            phase === 'think' ? (
              <div className="flex w-full flex-col gap-1 px-1">
                <div className="h-2 overflow-hidden rounded-chip bg-line">
                  <div
                    className={`h-full rounded-chip ${bar}`}
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

function Recall({ view, hint }: { view: CardView; hint: HintState }) {
  return (
    <p className="truncate px-1 text-sm text-ink-soft">
      <span className="font-semibold">{view.chip} :</span> {view.text}
      {hint.shown && view.hint ? ` (${view.hint})` : ''}
    </p>
  );
}

function formatProposal(round: ClosestRoundState, value: number | null | undefined) {
  if (value === null || value === undefined) return '—';
  return round.kind === 'estim' ? formatQuantity(value) : String(value);
}

function ProposalTag({ player, name, label }: { player: PlayerId; name: string; label: string }) {
  const theme = PLAYER_THEME[player];
  return (
    <div
      className={`flex min-w-0 flex-1 flex-col items-center rounded-card px-2 py-3 shadow-card ${theme.bg} ${theme.text}`}
    >
      <span className="text-sm font-bold">{name} dit</span>
      <span className="max-w-full truncate font-display text-xl font-black tabular-nums">
        {label}
      </span>
    </div>
  );
}

function ReadyPhase({
  round,
  view,
  names,
  hint,
}: {
  round: ClosestRoundState;
  view: CardView;
  names: PerPlayer<string>;
  hint: HintState;
}) {
  const send = sendFor(round);
  return (
    <div className="flex h-full flex-col gap-3">
      <Card className="flex flex-1 flex-col">
        <GameBanner game={round.kind} />
        <div className="flex flex-1 flex-col items-center justify-center gap-3 px-5 text-center">
          <CategoryChip>{view.chip}</CategoryChip>
          <p className="font-display text-lg font-bold text-balance">{view.text}</p>
          <HintLine view={view} hint={hint} />
        </div>
      </Card>
      <div className="flex gap-3">
        <ProposalTag player="A" name={names.A} label={formatProposal(round, round.inputs.A)} />
        <ProposalTag player="B" name={names.B} label={formatProposal(round, round.inputs.B)} />
      </div>
      <Button size="xl" block variant={round.kind} onClick={() => send({ type: 'REVEAL' })}>
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
  return `+${points[winner]} pour ${names[winner]}`;
}

function RevealedPhase({ round, view, names, totals, suddenDeath }: Props) {
  const send = sendFor(round);
  const result = round.results[round.results.length - 1] as ClosestResult;
  const last = round.index + 1 >= round.items.length;
  const { outcome, inputs } = result;
  // Monté recto, retourné à la frame suivante : l'animation de flip se joue.
  const [flipped, setFlipped] = useState(false);
  useEffect(() => {
    const id = requestAnimationFrame(() => setFlipped(true));
    return () => cancelAnimationFrame(id);
  }, []);
  const estim = round.kind === 'estim';
  const gapText = (p: PlayerId) =>
    estim
      ? ratioLabel(outcome.gap[p], outcome.exact[p])
      : yearGapLabel(outcome.gap[p], outcome.exact[p]);
  const front = (
    <QuestionFront
      round={round}
      view={view}
      suddenDeath={suddenDeath}
      hint={{ shown: false, show: () => undefined }}
    />
  );
  const back = (
    <Card className="flex h-full flex-col overflow-hidden">
      <GameBanner game={round.kind} right={questionLabel(round, suddenDeath)} />
      <div className="flex min-h-0 flex-1 flex-col gap-1.5 px-4 pt-2 pb-3">
        <p
          className={`animate-pop text-center font-display font-black tabular-nums text-balance ${estim ? 'text-xl' : 'text-2xl'}`}
        >
          {view.answerLabel}
        </p>
        {estim ? (
          <LogRuler answer={result.item.answer} proposals={inputs} names={names} />
        ) : (
          <YearRuler answer={result.item.answer} proposals={inputs} names={names} />
        )}
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
              <span className="truncate font-bold tabular-nums">
                {formatProposal(round, inputs[p])}
              </span>
              <span
                className={`ml-auto font-semibold whitespace-nowrap ${outcome.exact[p] ? 'text-estim-deep' : 'text-ink-soft'}`}
              >
                {gapText(p)}
              </span>
            </div>
          ))}
        </div>
        <p className="text-center text-md font-bold">
          {verdict(result, names)}
          {suddenDeath ? '' : ` · ${scoreLine(names, totals)}`}
        </p>
        <p className="mt-auto text-center text-sm leading-snug text-ink-soft italic text-balance">
          {view.context}
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
