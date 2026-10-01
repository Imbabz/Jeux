import { useMemo, useState, type ReactNode } from 'react';
import { actions, useSession } from '../../app/session.ts';
import type { Content } from '../../content/index.ts';
import {
  canAdjust,
  currentRoundPoints,
  exactCount,
  isFinalRound,
  leader,
  pointsByGame,
  tokens,
  totals,
  type GameId,
  type MatchState,
  type PerPlayer,
} from '../../engine/index.ts';
import { ActionBar } from '../components/ActionBar.tsx';
import { Button, GhostButton, Initial } from '../components/Button.tsx';
import { Card } from '../components/Card.tsx';
import { GameIcon, PlayIcon, UndoIcon } from '../components/icons.tsx';
import { ConfirmDialog, Overlay, Sheet } from '../components/Overlay.tsx';
import { ScoreBar } from '../components/ScoreBar.tsx';
import { SettingsPanel } from '../components/SettingsPanel.tsx';
import { Token, TokenRow } from '../components/Token.tsx';
import { plural, scoreLine } from '../format.ts';
import { GAME_THEME, PLAYER_THEME } from '../theme/games.ts';
import { estimAnswerLabel } from '../format.ts';
import { BacRound } from './BacRound.tsx';
import { ClosestRound, type CardView } from './ClosestRound.tsx';

/** Écran de partie : choisit la vue selon la phase de la partie (GAME_DESIGN §3). */
export function MatchScreen() {
  const { match, content, paused, settings } = useSession();
  const [menu, setMenu] = useState<'main' | 'scores' | 'settings' | null>(null);
  const [confirmAbandon, setConfirmAbandon] = useState(false);
  const index = useMemo(() => buildIndex(content), [content]);
  if (!match || !content) return null;

  const names: PerPlayer<string> = {
    A: match.config.players.A.name,
    B: match.config.players.B.name,
  };
  const score = totals(match);
  const tok = tokens(match);

  const overlays = (
    <>
      {paused ? (
        <Overlay>
          <Card className="flex flex-col items-center gap-4 p-6">
            <h2 className="font-display text-xl font-black">Pause</h2>
            <p className="text-center text-sm text-ink-soft">
              Le chrono est figé. On reprend quand vous voulez.
            </p>
            <Button size="lg" block icon={<PlayIcon />} onClick={() => actions.setPaused(false)}>
              Reprendre
            </Button>
          </Card>
        </Overlay>
      ) : null}
      {menu === 'main' ? (
        <Sheet title="Menu" onClose={() => setMenu(null)}>
          <Button
            variant="card"
            block
            onClick={() => {
              setMenu(null);
              actions.setPaused(false);
            }}
          >
            Reprendre la partie
          </Button>
          {canAdjust(match) ? (
            <Button variant="card" block onClick={() => setMenu('scores')}>
              Ajuster les scores
            </Button>
          ) : null}
          <Button variant="card" block onClick={() => setMenu('settings')}>
            Réglages
          </Button>
          <Button
            variant="card"
            block
            className="text-bac"
            onClick={() => {
              setMenu(null);
              setConfirmAbandon(true);
            }}
          >
            Abandonner la partie
          </Button>
        </Sheet>
      ) : null}
      {menu === 'scores' ? (
        <Sheet title="Ajuster les scores" onClose={() => setMenu(null)}>
          <p className="px-1 text-sm text-ink-soft">
            Pour un point marqué hors jeu ou une erreur de saisie. « Annuler » retire le dernier
            ajustement.
          </p>
          {(['A', 'B'] as const).map((p) => (
            <div key={p} className="flex items-center gap-3 rounded-key bg-card p-2">
              <Initial player={p} name={names[p]} />
              <span className="min-w-0 flex-1 truncate font-bold">{names[p]}</span>
              <Button
                variant="card"
                className="w-14 px-0"
                aria-label={`Retirer un point à ${names[p]}`}
                onClick={() => actions.adjustScore(p, -1)}
              >
                −1
              </Button>
              <span className="w-10 text-center font-display text-xl font-black tabular-nums">
                {score[p]}
              </span>
              <Button
                variant={p === 'A' ? 'playerA' : 'playerB'}
                className="w-14 px-0"
                aria-label={`Ajouter un point à ${names[p]}`}
                onClick={() => actions.adjustScore(p, 1)}
              >
                +1
              </Button>
            </div>
          ))}
          <Button block onClick={() => setMenu(null)}>
            Terminé
          </Button>
        </Sheet>
      ) : null}
      {menu === 'settings' ? (
        <Sheet title="Réglages" onClose={() => setMenu(null)}>
          <SettingsPanel />
          <Button block className="sticky bottom-0" onClick={() => setMenu(null)}>
            Terminé
          </Button>
        </Sheet>
      ) : null}
      {confirmAbandon ? (
        <ConfirmDialog
          title="Abandonner la partie ?"
          body="Le score ne sera pas compté au palmarès."
          confirmLabel="Abandonner"
          destructive
          onCancel={() => setConfirmAbandon(false)}
          onConfirm={() => {
            setConfirmAbandon(false);
            actions.abandon();
          }}
        />
      ) : null}
    </>
  );

  const openMenu = () => {
    actions.setPaused(false);
    setMenu('main');
  };

  const shell = (children: ReactNode, badge: 'double' | 'sudden' | null = null) => (
    <div className="mx-auto flex h-dvh max-w-md flex-col">
      <ScoreBar
        players={{
          A: { name: names.A, score: score.A, tokens: tok.A },
          B: { name: names.B, score: score.B, tokens: tok.B },
        }}
        center={
          match.phase === 'suddenDeath' || match.phase === 'suddenDeathIntro'
            ? 'Égalité'
            : `Manche ${match.roundIndex + 1}/${match.config.rounds}`
        }
        badge={badge}
        leader={leader(match)}
      />
      <main className="flex min-h-0 flex-1 flex-col px-4 py-3">{children}</main>
      <ActionBar
        canUndo={actions.canUndo()}
        onUndo={actions.undo}
        onPause={() => actions.setPaused(true)}
        onMenu={openMenu}
      />
      {overlays}
    </div>
  );

  switch (match.phase) {
    case 'opening':
      return shell(<Opening names={names} drivers={match} />);
    case 'roundIntro':
      return (
        <>
          <RoundIntro match={match} names={names} score={score} />
          {overlays}
        </>
      );
    case 'playing':
    case 'suddenDeath': {
      const suddenDeath = match.phase === 'suddenDeath';
      const round = match.current;
      if (!round) return null;
      const itemId = round.items[round.index]?.id ?? '';
      const bacItem = round.kind === 'bac' ? index.bac.get(itemId) : undefined;
      const body =
        round.kind === 'bac' ? (
          <BacRound
            round={round}
            label={bacItem?.label ?? itemId}
            words={(round.letter && bacItem?.words[round.letter]) || []}
            names={names}
            totals={score}
            paused={paused}
            wordSeconds={settings.bacWordSeconds}
            suddenDeath={suddenDeath}
          />
        ) : (
          <ClosestRound
            round={round}
            view={cardView(index, round.kind, itemId)}
            names={names}
            totals={score}
            paused={paused}
            thinkSeconds={settings.thinkSeconds}
            suddenDeath={suddenDeath}
          />
        );
      return shell(
        body,
        suddenDeath
          ? 'sudden'
          : isFinalRound(match) && match.config.rules.doubleFinalRound
            ? 'double'
            : null,
      );
    }
    case 'roundRecap':
      return shell(<RoundRecap match={match} names={names} score={score} />);
    case 'suddenDeathIntro':
      return shell(<SuddenDeathIntro attempts={match.suddenDeathAttempts} />, 'sudden');
    case 'finished':
      return <Finished match={match} names={names} score={score} />;
    case 'abandoned':
      return null;
  }
}

function Opening({ names, drivers }: { names: PerPlayer<string>; drivers: MatchState }) {
  const driver = drivers.config.players.A.driver
    ? names.A
    : drivers.config.players.B.driver
      ? names.B
      : null;
  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="flex flex-1 flex-col items-center justify-center gap-5 p-6 text-center">
        <div className="flex items-center gap-4">
          <Initial player="A" name={names.A} size="lg" />
          <span className="font-display text-lg font-bold text-ink-soft">contre</span>
          <Initial player="B" name={names.B} size="lg" />
        </div>
        <h2 className="font-display text-xl font-black text-balance">
          {names.A} contre {names.B}
        </h2>
        <p className="text-md text-ink-soft text-balance">
          Le copilote lit les cartes à voix haute. Pour les années et les estimations, on annonce en
          même temps au signal.
        </p>
        {driver ? <p className="text-sm font-semibold">{driver}, les yeux sur la route !</p> : null}
      </Card>
      <Button
        size="lg"
        block
        icon={<PlayIcon />}
        onClick={() => actions.dispatch({ type: 'OPENING_DONE' })}
      >
        C’est parti !
      </Button>
    </div>
  );
}

function RoundIntro({
  match,
  names,
  score,
}: {
  match: MatchState;
  names: PerPlayer<string>;
  score: PerPlayer<number>;
}) {
  const game = match.plan[match.roundIndex] as GameId;
  const theme = GAME_THEME[game];
  const final = isFinalRound(match);
  return (
    <div className={`pt-safe pb-safe flex h-dvh flex-col items-center px-6 text-white ${theme.bg}`}>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 text-center animate-fade-in">
        <GameIcon game={game} size={88} strokeWidth={1.8} />
        <p className="text-md font-bold tracking-widest uppercase">
          Manche {match.roundIndex + 1} sur {match.config.rounds}
        </p>
        <h1 className="font-display text-2xl font-black">{theme.name}</h1>
        <p className="max-w-xs text-md font-semibold text-balance">{theme.rule}</p>
        <p className="font-display text-lg font-bold tabular-nums">{scoreLine(names, score)}</p>
        {final && match.config.rules.doubleFinalRound ? (
          <p className="rounded-chip bg-ink px-4 py-2 text-md font-bold">Points doublés !</p>
        ) : null}
      </div>
      <div className="flex w-full max-w-md flex-col gap-2 pb-4">
        <Button size="lg" block variant="card" onClick={actions.startRound}>
          Première question
        </Button>
        {actions.canUndo() ? (
          <GhostButton
            icon={<UndoIcon size={20} />}
            tone="inverse"
            className="self-center"
            onClick={actions.undo}
          >
            Annuler le dernier résultat
          </GhostButton>
        ) : null}
      </div>
    </div>
  );
}

function RoundRecap({
  match,
  names,
  score,
}: {
  match: MatchState;
  names: PerPlayer<string>;
  score: PerPlayer<number>;
}) {
  const record = match.rounds[match.rounds.length - 1];
  if (!record) return null;
  const points = currentRoundPoints(match);
  const last = match.roundIndex + 1 >= match.config.rounds;
  return (
    <div className="flex h-full flex-col gap-4">
      <div className="flex flex-1 flex-col items-center justify-center gap-5 text-center">
        <h2 className="font-display text-xl font-bold">Fin de la manche {record.round + 1}</h2>
        <div className="flex w-full gap-3">
          {(['A', 'B'] as const).map((p) => {
            const won = record.winner === p || record.winner === 'tie';
            return (
              <Card
                key={p}
                className={`flex flex-1 flex-col items-center gap-2 p-4 ${won ? `ring-4 ${PLAYER_THEME[p].ring}` : ''}`}
              >
                <Initial player={p} name={names[p]} />
                <span className="text-sm font-bold">{names[p]}</span>
                <span className="font-display text-2xl font-black tabular-nums">+{points[p]}</span>
                {won ? <Token game={record.game} className="animate-pop" /> : <Token empty />}
              </Card>
            );
          })}
        </div>
        <p className="text-md font-bold">
          {record.winner === 'tie'
            ? 'Égalité : un jeton chacun !'
            : `${names[record.winner]} remporte la manche`}
        </p>
        <p className="font-display text-lg font-bold tabular-nums">
          Total : {scoreLine(names, score)}
        </p>
      </div>
      <Button size="lg" block onClick={() => actions.dispatch({ type: 'ROUND_RECAP_DONE' })}>
        {last ? 'Résultat final' : 'Manche suivante'}
      </Button>
    </div>
  );
}

function SuddenDeathIntro({ attempts }: { attempts: number }) {
  return (
    <div className="flex h-full flex-col gap-4">
      <Card className="flex flex-1 flex-col items-center justify-center gap-4 bg-ink p-6 text-center text-white">
        <h2 className="font-display text-2xl font-black text-bac">Mort subite</h2>
        <p className="text-md font-semibold text-balance">
          {attempts === 0
            ? 'Égalité parfaite ! Une question, le plus proche gagne la partie.'
            : 'Toujours à égalité… Encore une !'}
        </p>
      </Card>
      <Button size="lg" block onClick={actions.startSuddenDeath}>
        Question décisive
      </Button>
    </div>
  );
}

function Finished({
  match,
  names,
  score,
}: {
  match: MatchState;
  names: PerPlayer<string>;
  score: PerPlayer<number>;
}) {
  const winner = match.winner ?? 'A';
  const loser = winner === 'A' ? 'B' : 'A';
  const tok = tokens(match);
  const byGame = pointsByGame(match);
  const exacts = exactCount(match);
  const title = `${names[winner]} gagne\u00a0!`;
  return (
    <main className="pt-safe pb-safe mx-auto flex h-dvh max-w-md flex-col gap-3 px-4 py-3">
      <div className="flex flex-col items-center pt-2 text-center">
        <h1
          className={`animate-pop font-display font-black text-balance ${title.length > 9 ? 'text-xl' : 'text-2xl'}`}
        >
          {title}
        </h1>
        <p className="font-display text-xl font-bold tabular-nums">
          {score[winner]} – {score[loser]}
        </p>
        {match.wonBySuddenDeath ? (
          <p className="text-sm font-semibold text-bac">en mort subite</p>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 items-end justify-center gap-3 border-b-4 border-line-deep">
        {([winner, loser] as const).map((p, i) => (
          <div
            key={p}
            className={`flex w-36 flex-col items-center gap-1.5 rounded-t-card px-3 pt-3 pb-2 shadow-card ${PLAYER_THEME[p].bg} ${PLAYER_THEME[p].text} ${i === 0 ? 'h-full max-h-56' : 'h-4/5 max-h-44'}`}
          >
            <Initial player={p} name={names[p]} inverted />
            <span className="max-w-full truncate text-md font-bold">{names[p]}</span>
            <TokenRow games={tok[p]} size="md" />
            <span className="mt-auto font-display text-xl font-black">{i + 1}</span>
          </div>
        ))}
      </div>
      <Card className="flex flex-col gap-1 p-3">
        {(Object.keys(byGame) as GameId[]).map((g) => {
          const pts = byGame[g] as PerPlayer<number>;
          return (
            <p key={g} className="flex items-center gap-2 text-sm">
              <span className={GAME_THEME[g].text}>
                <GameIcon game={g} size={18} />
              </span>
              <span className="font-semibold">{GAME_THEME[g].name}</span>
              <span className="ml-auto font-bold tabular-nums">{scoreLine(names, pts)}</span>
            </p>
          );
        })}
        <p className="text-xs text-ink-soft">
          Réponses pile : {names.A} {exacts.A} · {names.B} {exacts.B} ·{' '}
          {plural(match.rounds.length, 'manche jouée', 'manches jouées')}
        </p>
      </Card>
      <div className="flex gap-3">
        <Button size="lg" variant="card" className="flex-1" onClick={actions.leaveFinishedMatch}>
          Accueil
        </Button>
        <Button size="lg" className="flex-1" onClick={actions.rematch}>
          Revanche
        </Button>
      </div>
      {actions.canUndo() ? (
        <GhostButton
          icon={<UndoIcon size={20} />}
          className="-my-1 self-center"
          onClick={actions.undo}
        >
          Annuler le dernier résultat
        </GhostButton>
      ) : null}
    </main>
  );
}

interface ContentIndex {
  readonly year: ReadonlyMap<string, Content['year'][number]>;
  readonly estim: ReadonlyMap<string, Content['estim'][number]>;
  readonly bac: ReadonlyMap<string, Content['bac'][number]>;
}

function buildIndex(content: Content | null): ContentIndex {
  return {
    year: new Map((content?.year ?? []).map((i) => [i.id, i])),
    estim: new Map((content?.estim ?? []).map((i) => [i.id, i])),
    bac: new Map((content?.bac ?? []).map((i) => [i.id, i])),
  };
}

/** Ce que la carte affiche pour un item « au plus proche ». */
function cardView(index: ContentIndex, kind: 'year' | 'estim', id: string): CardView {
  if (kind === 'year') {
    const item = index.year.get(id);
    if (!item)
      return { chip: '?', text: `Question introuvable : ${id}`, context: '', answerLabel: '?' };
    return {
      chip: item.category,
      text: item.text,
      context: item.context,
      prefill: item.centuryHint,
      answerLabel: String(item.year),
      ...(item.hint ? { hint: item.hint } : {}),
    };
  }
  const item = index.estim.get(id);
  if (!item)
    return { chip: '?', text: `Question introuvable : ${id}`, context: '', answerLabel: '?' };
  return {
    chip: item.unit,
    text: item.question,
    context: item.referenceYear ? `${item.context} (Valeur ${item.referenceYear}.)` : item.context,
    unit: item.unit,
    answerLabel:
      item.answerLabel ??
      estimAnswerLabel(item.answer, item.unit, item.referenceYear !== undefined),
    ...(item.hint ? { hint: item.hint } : {}),
  };
}
