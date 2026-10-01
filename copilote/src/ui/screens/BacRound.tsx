import { useMemo, useState, type ReactNode } from 'react';
import { actions } from '../../app/session.ts';
import type { BacAction, BacResult, BacRoundState, PerPlayer } from '../../engine/index.ts';
import { haptics, sound } from '../../services/index.ts';
import { Button, GhostButton } from '../components/Button.tsx';
import { BoltIcon, CheckIcon, SkipIcon } from '../components/icons.tsx';
import { useTimeline } from '../hooks/useClock.ts';
import { plural, scoreLine } from '../format.ts';
import { PLAYER_THEME } from '../theme/games.ts';

/**
 * Déroulé d'une carte de Bac Éclair en alternance (GAME_DESIGN §7.1).
 * Le copilote retourne la carte, lit « Un animal… en B ! » à son rythme, puis lance l'échange :
 * chacun son tour donne un mot, avec un chrono court par mot. Celui qui sèche perd la carte.
 */

interface Props {
  round: BacRoundState;
  label: string;
  /** Mots acceptés pour la lettre en cours (liste indicative pour le copilote). */
  words: readonly string[];
  names: PerPlayer<string>;
  totals: PerPlayer<number>;
  paused: boolean;
  wordSeconds: number;
  suddenDeath: boolean;
}

const send = (action: BacAction) => actions.dispatch({ type: 'bac', action });
const other = (p: 'A' | 'B') => (p === 'A' ? 'B' : 'A');

function verdict(result: BacResult, names: PerPlayer<string>): string {
  const loser = names[other(result.winner)];
  const after = result.words > 0 ? ` après ${plural(result.words, 'mot', 'mots')}` : '';
  return `${loser} sèche${after} : point pour ${names[result.winner]} !`;
}

export function BacRound(props: Props) {
  const { round } = props;
  // La liste reste ouverte d'un mot à l'autre ; elle se referme à chaque nouvelle carte.
  const [list, setList] = useState({ index: round.index, open: false });
  const showList = list.index === round.index && list.open;
  const toggleList = () => setList({ index: round.index, open: !showList });
  // Chaque état est remonté (key) : le chrono repart de zéro à chaque nouveau mot.
  return (
    <BacPhase
      key={`${round.index}-${round.phase}-${round.words}`}
      {...props}
      showList={showList}
      toggleList={toggleList}
    />
  );
}

function BacPhase({
  round,
  label,
  words,
  names,
  totals,
  paused,
  wordSeconds,
  suddenDeath,
  showList,
  toggleList,
}: Props & { showList: boolean; toggleList: () => void }) {
  const phase = round.phase;
  const turnMs = wordSeconds * 1000;
  const steps = useMemo(() => {
    if (phase !== 'turn') return [];
    return [
      { at: Math.max(0, turnMs - 2000), run: () => sound.beep('alert') },
      { at: Math.max(0, turnMs - 1000), run: () => sound.beep('alert') },
      {
        at: turnMs,
        run: () => {
          sound.beep('end');
          haptics.pulse(120);
          send({ type: 'TIMER_EXPIRED' });
        },
      },
    ];
  }, [phase, turnMs]);
  const elapsed = useTimeline(!paused && phase === 'turn', steps);

  const last = round.results[round.results.length - 1];
  const remaining = phase === 'turn' ? Math.max(0, turnMs - elapsed) : 0;
  const questionLabel = suddenDeath ? 'Décisive' : `${round.index + 1}/${round.items.length}`;
  const canSkip = phase === 'hidden' || phase === 'announce' ? actions.canSkip() : false;
  const isLast = round.index + 1 >= round.items.length;
  const speaker = round.speaker;
  const speakerTheme = PLAYER_THEME[speaker];

  let buttons: ReactNode;
  if (phase === 'hidden') {
    buttons = (
      <Button size="xl" block variant="bac" onClick={actions.flipBac}>
        Retourner la carte
      </Button>
    );
  } else if (phase === 'announce') {
    buttons = (
      <Button
        size="xl"
        block
        variant={speaker === 'A' ? 'playerA' : 'playerB'}
        onClick={() => {
          sound.beep('go');
          send({ type: 'START' });
        }}
      >
        À {names[speaker]} de commencer
      </Button>
    );
  } else if (phase === 'resolved') {
    buttons = (
      <Button size="lg" block onClick={() => send({ type: 'NEXT' })}>
        {suddenDeath ? 'Voir le résultat' : isLast ? 'Fin de la manche' : 'Carte suivante'}
      </Button>
    );
  } else {
    buttons = (
      <div className="grid grid-cols-2 gap-3">
        <Button size="xl" variant="neutral" onClick={() => send({ type: 'MISS' })}>
          ✗ Raté
        </Button>
        <Button
          size="xl"
          variant={speaker === 'A' ? 'playerA' : 'playerB'}
          icon={<CheckIcon size={24} />}
          onClick={() => send({ type: 'WORD' })}
        >
          Validé
        </Button>
      </div>
    );
  }

  const status: ReactNode =
    phase === 'resolved' && last ? (
      <div className="flex flex-col items-center gap-0.5 rounded-key bg-white/15 px-3 py-2 text-center">
        <span className="text-md font-bold">{verdict(last, names)}</span>
        {suddenDeath ? null : (
          <span className="text-sm font-semibold">{scoreLine(names, totals)}</span>
        )}
      </div>
    ) : phase === 'turn' || phase === 'timeout' ? (
      <div
        className={`flex items-center gap-2 rounded-chip px-4 py-2 text-md font-bold ${speakerTheme.bg} ${speakerTheme.text}`}
      >
        {phase === 'timeout' ? `Temps écoulé pour ${names[speaker]} !` : `À ${names[speaker]} !`}
        {round.words > 0 ? (
          <span className="text-sm font-semibold opacity-80">
            · {plural(round.words, 'mot', 'mots')}
          </span>
        ) : null}
      </div>
    ) : canSkip ? (
      <GhostButton icon={<SkipIcon size={20} />} tone="inverse" onClick={actions.skip}>
        Passer
      </GhostButton>
    ) : null;

  return (
    <div className="flex h-full flex-col gap-3">
      <LetterCard
        hidden={phase === 'hidden'}
        label={label}
        letter={round.letter}
        progress={phase === 'turn' ? remaining / turnMs : phase === 'announce' ? 1 : 0}
        alert={phase === 'turn' && remaining <= 2000}
        dimmed={phase === 'timeout'}
        corner={questionLabel}
        onFlip={phase === 'hidden' ? actions.flipBac : undefined}
        words={showList ? words : null}
        onToggleWords={phase === 'hidden' ? undefined : toggleList}
        wordCount={words.length}
        footer={status}
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
  corner,
  onFlip,
  words = null,
  onToggleWords,
  wordCount = 0,
  footer,
}: {
  hidden: boolean;
  label: string;
  letter: string | null;
  progress: number;
  alert: boolean;
  dimmed?: boolean;
  corner?: string;
  onFlip?: (() => void) | undefined;
  /** Liste des mots acceptés à afficher à la place de l'anneau, ou `null`. */
  words?: readonly string[] | null;
  onToggleWords?: (() => void) | undefined;
  wordCount?: number;
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
      ) : words ? (
        <div className="flex min-h-0 flex-1 flex-col gap-2 px-4">
          <p className="text-center text-md font-bold tracking-wide uppercase text-balance">
            {label} · <span className="font-display text-xl font-black">{letter}</span>
          </p>
          <div className="h-1.5 shrink-0 overflow-hidden rounded-chip bg-white/25">
            <div
              className={`h-full ${alert ? 'bg-ink' : 'bg-white'}`}
              style={{ width: `${Math.round(progress * 100)}%` }}
            />
          </div>
          <ul
            className="flex min-h-0 flex-1 flex-wrap content-start gap-1.5 overflow-y-auto pb-1"
            aria-label="Mots acceptés"
          >
            {words.length === 0 ? (
              <li className="text-sm font-semibold opacity-80">
                Pas de liste pour cette lettre : le copilote juge.
              </li>
            ) : (
              words.map((w) => (
                <li key={w} className="rounded-chip bg-white/15 px-2.5 py-1 text-sm font-semibold">
                  {w}
                </li>
              ))
            )}
          </ul>
        </div>
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
          </div>
        </div>
      )}
      <div className="flex min-h-14 flex-col items-center justify-center gap-1 px-3 pb-3">
        {footer}
        {onToggleWords ? (
          <button
            type="button"
            onClick={onToggleWords}
            aria-pressed={words !== null}
            className="min-h-10 rounded-chip px-3 text-sm font-semibold underline underline-offset-4 opacity-90"
          >
            {words ? 'Masquer la liste' : `Mots acceptés (${wordCount})`}
          </button>
        ) : null}
      </div>
    </div>
  );
}
