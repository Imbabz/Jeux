import { useMemo, useState, type ReactNode } from 'react';
import { actions, countItems, isGamePlayable, useSession } from '../../app/session.ts';
import {
  GAME_IDS,
  type DifficultyMode,
  type GameId,
  type MatchConfig,
  type QuestionCount,
  type RoundCount,
} from '../../engine/index.ts';
import { Button, Initial } from '../components/Button.tsx';
import { Card } from '../components/Card.tsx';
import { ArrowLeftIcon, CarIcon, CheckIcon, GameIcon, PlayIcon } from '../components/icons.tsx';
import { Segmented } from '../components/Segmented.tsx';
import { GAME_THEME } from '../theme/games.ts';

const PRESETS = [
  { id: 'express', label: 'Express', rounds: 3, q: 3 },
  { id: 'classic', label: 'Classique', rounds: 6, q: 5 },
  { id: 'long', label: 'Longue', rounds: 9, q: 5 },
] as const;

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card className="flex flex-col gap-3 p-4">
      <h2 className="text-xs font-bold uppercase tracking-wide text-ink-soft">{title}</h2>
      {children}
    </Card>
  );
}

/** Durée estimée (GAME_DESIGN §13) : ~44 s par question, ~10 s d'habillage par manche, 40 s d'ouverture et de fin. */
const estimateMinutes = (rounds: number, q: number) =>
  Math.round(((rounds * (q * 44 + 10) + 40) * 1.15) / 60);

export function Setup() {
  const { content, settings } = useSession();
  const last = settings.lastSetup;
  const [names, setNames] = useState<[string, string]>(last?.names ?? ['', '']);
  const [driver, setDriver] = useState<'A' | 'B' | 'none'>(last?.driver ?? 'none');
  const [packs, setPacks] = useState<string[]>(
    last?.packs ?? content?.packs.map((p) => p.id) ?? [],
  );
  const [difficulty, setDifficulty] = useState<DifficultyMode>(last?.difficulty ?? 'mixed');
  const [rounds, setRounds] = useState<RoundCount>(last?.rounds ?? 6);
  const [q, setQ] = useState<QuestionCount>(last?.questionsPerRound ?? 5);
  const [custom, setCustom] = useState(false);
  const [chosen, setChosen] = useState<GameId[]>(last?.games ?? [...GAME_IDS]);

  // Jeux cochés ET disposant d'assez de questions dans les packs choisis (GAME_DESIGN §11.3).
  const playable = useMemo(
    () =>
      content
        ? GAME_IDS.filter((g) => chosen.includes(g) && isGamePlayable(content, g, packs))
        : [],
    [content, packs, chosen],
  );
  if (!content) return null;

  const trimmed = names.map((n) => n.trim());
  const sameNames = trimmed[0] !== '' && trimmed[0]?.toLowerCase() === trimmed[1]?.toLowerCase();
  const preset = PRESETS.find((p) => p.rounds === rounds && p.q === q);
  const problem = sameNames
    ? 'Deux prénoms différents, sinon on s’emmêle !'
    : packs.length === 0
      ? 'Choisissez au moins un pack.'
      : chosen.length === 0
        ? 'Choisissez au moins un jeu.'
        : playable.length === 0
          ? 'Pas assez de questions dans ces packs.'
          : null;

  const launch = () => {
    const finalNames: [string, string] = [trimmed[0] || 'Joueur 1', trimmed[1] || 'Joueur 2'];
    const config: MatchConfig = {
      players: {
        A: { name: finalNames[0], driver: driver === 'A' },
        B: { name: finalNames[1], driver: driver === 'B' },
      },
      games: playable,
      packs,
      difficulty,
      rounds,
      questionsPerRound: q,
      rules: {
        exactBonus: settings.exactBonus,
        doubleFinalRound: settings.doubleFinalRound,
        rareLetters: false,
      },
    };
    actions.saveSettings({
      lastSetup: {
        names: [trimmed[0] ?? '', trimmed[1] ?? ''],
        games: chosen,
        driver,
        packs,
        difficulty,
        rounds,
        questionsPerRound: q,
      },
    });
    actions.startMatch(config);
  };

  const togglePack = (id: string) =>
    setPacks((cur) => (cur.includes(id) ? cur.filter((p) => p !== id) : [...cur, id]));
  const toggleGame = (id: GameId) =>
    setChosen((cur) => (cur.includes(id) ? cur.filter((g) => g !== id) : [...cur, id]));

  return (
    <main className="pt-safe mx-auto flex min-h-full max-w-md flex-col">
      <header className="flex h-16 items-center gap-2 px-2">
        <button
          type="button"
          aria-label="Retour"
          onClick={actions.goHome}
          className="flex size-12 items-center justify-center rounded-chip active:bg-line"
        >
          <ArrowLeftIcon />
        </button>
        <h1 className="font-display text-lg font-bold">Nouvelle partie</h1>
      </header>

      <div className="flex flex-1 flex-col gap-4 px-4 pb-4">
        <Section title="Joueurs">
          {(['A', 'B'] as const).map((id, i) => (
            <div key={id} className="flex items-center gap-2">
              <Initial player={id} name={names[i] || (i === 0 ? '1' : '2')} />
              <input
                aria-label={`Prénom du joueur ${i + 1}`}
                value={names[i]}
                maxLength={14}
                placeholder={`Joueur ${i + 1}`}
                onChange={(e) =>
                  setNames((cur) => (i === 0 ? [e.target.value, cur[1]] : [cur[0], e.target.value]))
                }
                className="min-h-12 min-w-0 flex-1 rounded-key border border-line bg-table px-3 text-md font-semibold placeholder:text-ink-soft/60"
              />
              <button
                type="button"
                aria-pressed={driver === id}
                onClick={() => setDriver((d) => (d === id ? 'none' : id))}
                className={`flex min-h-12 items-center gap-1 rounded-key border px-3 text-xs font-bold ${
                  driver === id ? 'border-ink bg-ink text-white' : 'border-line text-ink-soft'
                }`}
              >
                <CarIcon size={18} />
                Conduit
              </button>
            </div>
          ))}
          {sameNames ? <p className="text-sm font-semibold text-bac">{problem}</p> : null}
        </Section>

        <Section title="Jeux">
          <div className="grid grid-cols-3 gap-2">
            {GAME_IDS.map((g) => (
              <GameTile
                key={g}
                game={g}
                chosen={chosen.includes(g)}
                playable={isGamePlayable(content, g, packs)}
                count={countItems(content, g, packs)}
                onToggle={() => toggleGame(g)}
              />
            ))}
          </div>
        </Section>

        <Section title="Packs">
          <div className="flex flex-col gap-2">
            {content.packs.map((p) => {
              const on = packs.includes(p.id);
              const [bac, year, estim] = (['bac', 'year', 'estim'] as const).map((g) =>
                countItems(content, g, [p.id]),
              );
              return (
                <button
                  key={p.id}
                  type="button"
                  aria-pressed={on}
                  onClick={() => togglePack(p.id)}
                  className={`flex min-h-12 w-full items-center gap-2 rounded-chip border px-4 text-sm font-semibold ${
                    on ? 'border-ink bg-ink text-white' : 'border-line bg-card text-ink'
                  }`}
                >
                  <span aria-hidden="true">{p.emoji}</span>
                  <span className="truncate">{p.name}</span>
                  <span
                    className={`ml-auto shrink-0 text-xs whitespace-nowrap tabular-nums ${on ? 'text-white/75' : 'text-ink-soft'}`}
                    aria-label={`${bac} catégories, ${year} années, ${estim} estimations`}
                  >
                    ⚡{bac} · ⌛{year} · ⚖{estim}
                  </span>
                </button>
              );
            })}
          </div>
        </Section>

        <Section title="Difficulté">
          <Segmented
            label="Difficulté"
            value={difficulty}
            onChange={setDifficulty}
            options={[
              { value: 'easy', label: 'Facile' },
              { value: 'mixed', label: 'Mixte' },
              { value: 'hard', label: 'Difficile' },
            ]}
          />
        </Section>

        <Section title="Format">
          <Segmented
            label="Format"
            value={custom ? 'custom' : (preset?.id ?? 'custom')}
            onChange={(id) => {
              const p = PRESETS.find((x) => x.id === id);
              if (p) {
                setRounds(p.rounds);
                setQ(p.q);
                setCustom(false);
              } else setCustom(true);
            }}
            options={[
              ...PRESETS.map((p) => ({ value: p.id as string, label: p.label })),
              { value: 'custom', label: 'Perso' },
            ]}
          />
          {custom ? (
            <div className="flex flex-col gap-2">
              <Segmented
                label="Manches"
                value={rounds}
                onChange={setRounds}
                options={[3, 6, 9].map((n) => ({ value: n as RoundCount, label: `${n} manches` }))}
              />
              <Segmented
                label="Questions par manche"
                value={q}
                onChange={setQ}
                options={[3, 5, 7].map((n) => ({
                  value: n as QuestionCount,
                  label: `${n} questions`,
                }))}
              />
            </div>
          ) : null}
          <p className="text-sm text-ink-soft">
            {rounds} manches × {q} questions ·{' '}
            <span className="whitespace-nowrap">environ {estimateMinutes(rounds, q)} min</span>
          </p>
        </Section>
      </div>

      <div className="pb-safe sticky bottom-0 border-t border-line bg-table/95 px-4 pt-3 pb-3">
        {problem && !sameNames ? (
          <p className="pb-2 text-center text-sm font-semibold text-bac">{problem}</p>
        ) : null}
        <Button size="lg" block icon={<PlayIcon />} disabled={problem !== null} onClick={launch}>
          Lancer
        </Button>
      </div>
    </main>
  );
}

function GameTile({
  game,
  chosen,
  playable,
  count,
  onToggle,
}: {
  game: GameId;
  chosen: boolean;
  playable: boolean;
  count: number;
  onToggle: () => void;
}) {
  const theme = GAME_THEME[game];
  const active = chosen && playable;
  return (
    <button
      type="button"
      aria-pressed={chosen}
      onClick={onToggle}
      className={`flex flex-col overflow-hidden rounded-key border-2 bg-card text-left ${active ? theme.border : 'border-line'} ${chosen ? '' : 'opacity-55'}`}
    >
      <div
        className={`flex h-10 w-full items-center justify-between px-2 text-white ${active ? theme.bg : 'bg-neutral'}`}
      >
        <GameIcon game={game} size={20} />
        {active ? <CheckIcon size={18} /> : null}
      </div>
      <div className="flex flex-col p-2">
        <span className="text-xs leading-tight font-bold">{theme.name}</span>
        <span className={`text-xs ${playable ? 'text-ink-soft' : 'font-semibold text-bac'}`}>
          {playable ? `${count} cartes` : 'Pas assez de cartes'}
        </span>
      </div>
    </button>
  );
}
