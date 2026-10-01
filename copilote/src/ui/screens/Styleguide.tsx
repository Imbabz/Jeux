import { useState, type ReactNode } from 'react';
import { ActionBar } from '../components/ActionBar.tsx';
import { Button, GhostButton, Initial, PlayerButton } from '../components/Button.tsx';
import { Card, CategoryChip, FlipCard, GameBanner } from '../components/Card.tsx';
import {
  ArrowLeftIcon,
  BackspaceIcon,
  BalanceIcon,
  BoltIcon,
  CarIcon,
  CheckIcon,
  FlagIcon,
  HourglassIcon,
  MenuIcon,
  PauseIcon,
  PlayIcon,
  SkipIcon,
  UndoIcon,
} from '../components/icons.tsx';
import { YearNumpad } from '../components/Numpad.tsx';
import { ConfirmDialog } from '../components/Overlay.tsx';
import { YearRuler } from '../components/RevealRuler.tsx';
import { ScoreBar } from '../components/ScoreBar.tsx';
import { Segmented } from '../components/Segmented.tsx';
import { Token, TokenRow } from '../components/Token.tsx';

/** /styleguide : tous les tokens et tous les composants, dans tous leurs états (DESIGN §3). */

const COLORS: [string, string, string][] = [
  ['table', 'bg-table', '#F7F1E5'],
  ['card', 'bg-card', '#FFFDF8'],
  ['ink', 'bg-ink', '#1E2230'],
  ['ink-soft', 'bg-ink-soft', '#646874'],
  ['line', 'bg-line', '#E4DCCB'],
  ['neutral', 'bg-neutral', '#B9B2A3'],
  ['bac', 'bg-bac', '#E5484D'],
  ['year', 'bg-year', '#2F6FEB'],
  ['estim', 'bg-estim', '#16A36A'],
  ['player-a', 'bg-player-a', '#F2B705'],
  ['player-b', 'bg-player-b', '#7B4FD6'],
];

const TYPE: [string, string, string][] = [
  ['text-xs · 14', 'text-xs', 'Méta, version, labels'],
  ['text-sm · 16', 'text-sm', 'Texte courant'],
  ['text-md · 20', 'text-md font-bold', 'Boutons, bandeaux'],
  ['text-lg · 26', 'text-lg font-display font-bold', 'La chute du mur de Berlin'],
  ['text-xl · 36', 'text-xl font-display font-black', 'Score 12'],
  ['text-2xl · 56', 'text-2xl font-display font-black', '1989'],
  ['text-giant · 150', 'text-giant font-display font-black', 'B'],
];

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="border-b border-line pb-1 font-display text-lg font-bold">{title}</h2>
      {children}
    </section>
  );
}

function State({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="flex flex-col gap-1">
      <span className="font-mono text-xs text-ink-soft">{label}</span>
      {children}
    </div>
  );
}

const names = { A: 'Léa', B: 'Tom' };
const front = (
  <Card className="flex h-full flex-col">
    <GameBanner game="year" right="2/5" />
    <div className="flex flex-1 flex-col items-center justify-center gap-4 px-5 text-center">
      <CategoryChip>Histoire</CategoryChip>
      <p className="font-display text-lg font-bold">La chute du mur de Berlin</p>
    </div>
  </Card>
);
const back = (
  <Card className="flex h-full flex-col">
    <GameBanner game="year" right="2/5" />
    <div className="flex flex-1 flex-col items-center justify-center gap-2 px-4">
      <p className="font-display text-2xl font-black">1989</p>
      <YearRuler answer={1989} proposals={{ A: 1987, B: 1975 }} names={names} />
    </div>
  </Card>
);

export function Styleguide() {
  const [flipped, setFlipped] = useState(false);
  const [segment, setSegment] = useState<'easy' | 'mixed' | 'hard'>('mixed');
  const [dialog, setDialog] = useState(false);
  return (
    <main className="mx-auto flex max-w-md flex-col gap-8 px-4 py-6">
      <header className="flex items-center gap-3">
        <a
          href="/"
          aria-label="Retour"
          className="flex size-12 items-center justify-center rounded-chip active:bg-line"
        >
          <ArrowLeftIcon />
        </a>
        <h1 className="font-display text-xl font-black">Styleguide</h1>
      </header>

      <Section title="Couleurs">
        <div className="grid grid-cols-3 gap-3">
          {COLORS.map(([name, cls, hex]) => (
            <div key={name} className="flex flex-col gap-1">
              <span className={`h-12 rounded-key border border-ink/10 ${cls}`} />
              <span className="text-xs font-bold">{name}</span>
              <span className="font-mono text-xs text-ink-soft">{hex}</span>
            </div>
          ))}
        </div>
      </Section>

      <Section title="Typographie">
        {TYPE.map(([label, cls, sample]) => (
          <State key={label} label={label}>
            <span className={`${cls} leading-none`}>{sample}</span>
          </State>
        ))}
      </Section>

      <Section title="Icônes">
        <div className="flex flex-wrap gap-4 text-ink">
          <span className="text-bac">
            <BoltIcon size={32} />
          </span>
          <span className="text-year">
            <HourglassIcon size={32} />
          </span>
          <span className="text-estim">
            <BalanceIcon size={32} />
          </span>
          {[
            UndoIcon,
            PauseIcon,
            PlayIcon,
            MenuIcon,
            FlagIcon,
            SkipIcon,
            CheckIcon,
            BackspaceIcon,
            CarIcon,
          ].map((I, i) => (
            <I key={i} size={28} />
          ))}
        </div>
      </Section>

      <Section title="Boutons">
        <State label="primary · repos / désactivé">
          <div className="flex gap-2">
            <Button className="flex-1">Révéler</Button>
            <Button className="flex-1" disabled>
              Révéler
            </Button>
          </div>
        </State>
        <State label="PlayerButton · A / B / gagnant">
          <div className="grid grid-cols-2 gap-2">
            <PlayerButton player="A" name="Léa" size="xl" />
            <PlayerButton player="B" name="Tom" size="xl" />
            <PlayerButton player="A" name="Léa" winner />
            <PlayerButton player="B" name="Tom" disabled />
          </div>
        </State>
        <State label="neutral · card · year">
          <div className="flex flex-col gap-2">
            <Button variant="neutral" block>
              Pas de réponse
            </Button>
            <Button variant="card" block>
              Nouvelle partie
            </Button>
            <Button variant="year" size="xl" block>
              Révéler
            </Button>
          </div>
        </State>
        <State label="GhostButton · repos / désactivé">
          <div className="flex gap-2">
            <GhostButton icon={<SkipIcon size={20} />}>Passer</GhostButton>
            <GhostButton icon={<FlagIcon size={20} />}>Signaler</GhostButton>
            <GhostButton icon={<SkipIcon size={20} />} disabled>
              Passer
            </GhostButton>
          </div>
        </State>
        <State label="Initiales">
          <div className="flex gap-2">
            <Initial player="A" name="Léa" size="sm" />
            <Initial player="B" name="Tom" />
            <Initial player="A" name="Léa" size="lg" />
            <Initial player="B" name="Tom" size="lg" inverted />
          </div>
        </State>
      </Section>

      <Section title="Jetons">
        <div className="flex items-center gap-3">
          <Token game="bac" size="lg" />
          <Token game="year" />
          <Token game="estim" />
          <Token empty />
          <TokenRow games={['bac', 'year', 'estim', 'year']} />
        </div>
      </Section>

      <Section title="ScoreBar">
        <Card className="overflow-hidden">
          <ScoreBar
            players={{
              A: { name: 'Léa', score: 12, tokens: ['year', 'bac'] },
              B: { name: 'Tom', score: 9, tokens: ['estim'] },
            }}
            center="Manche 3/6"
            leader="A"
          />
        </Card>
        <Card className="overflow-hidden">
          <ScoreBar
            players={{
              A: { name: 'Léa', score: 14, tokens: [] },
              B: { name: 'Tom', score: 14, tokens: [] },
            }}
            center="Manche 6/6"
            badge="double"
          />
        </Card>
        <Card className="overflow-hidden">
          <ScoreBar
            players={{
              A: { name: 'Léa', score: 9, tokens: [] },
              B: { name: 'Tom', score: 9, tokens: [] },
            }}
            center="Égalité"
            badge="sudden"
          />
        </Card>
      </Section>

      <Section title="QuestionCard · recto / verso (touchez)">
        <button type="button" className="h-80 text-left" onClick={() => setFlipped((f) => !f)}>
          <FlipCard flipped={flipped} front={front} back={back} className="h-full" />
        </button>
      </Section>

      <Section title="RevealRuler">
        <State label="deux pions">
          <Card className="p-3">
            <YearRuler answer={1989} proposals={{ A: 1990, B: 1950 }} names={names} />
          </Card>
        </State>
        <State label="exact + pas de réponse">
          <Card className="p-3">
            <YearRuler answer={1903} proposals={{ A: 1903, B: null }} names={names} />
          </Card>
        </State>
        <State label="propositions identiques">
          <Card className="p-3">
            <YearRuler answer={1789} proposals={{ A: 1792, B: 1792 }} names={names} />
          </Card>
        </State>
      </Section>

      <Section title="Numpad">
        <div className="h-[460px]">
          <YearNumpad player="A" name="Léa" prefill="19" onSubmit={() => undefined} />
        </div>
        <div className="h-[460px]">
          <YearNumpad player="B" name="Tom" prefill="1969" onSubmit={() => undefined} />
        </div>
      </Section>

      <Section title="Contrôles">
        <Segmented
          label="Difficulté"
          value={segment}
          onChange={setSegment}
          options={[
            { value: 'easy', label: 'Facile' },
            { value: 'mixed', label: 'Mixte' },
            { value: 'hard', label: 'Difficile', disabled: true },
          ]}
        />
        <Button variant="card" onClick={() => setDialog(true)}>
          Ouvrir un ConfirmDialog
        </Button>
        {dialog ? (
          <ConfirmDialog
            title="Abandonner la partie ?"
            body="Le score ne sera pas compté au palmarès."
            confirmLabel="Abandonner"
            destructive
            onCancel={() => setDialog(false)}
            onConfirm={() => setDialog(false)}
          />
        ) : null}
      </Section>

      <Section title="ActionBar">
        <Card className="overflow-hidden">
          <ActionBar
            canUndo
            onUndo={() => undefined}
            onPause={() => undefined}
            onMenu={() => undefined}
          />
        </Card>
        <Card className="overflow-hidden">
          <ActionBar
            canUndo={false}
            onUndo={() => undefined}
            onPause={() => undefined}
            onMenu={() => undefined}
          />
        </Card>
      </Section>
    </main>
  );
}
