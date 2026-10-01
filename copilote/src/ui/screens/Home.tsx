import { useState } from 'react';
import { actions, useSession } from '../../app/session.ts';
import { replay, totals } from '../../engine/index.ts';
import { Button } from '../components/Button.tsx';
import { PlayIcon } from '../components/icons.tsx';
import { Sheet } from '../components/Overlay.tsx';
import { SettingsPanel } from '../components/SettingsPanel.tsx';
import { Token } from '../components/Token.tsx';
import { scoreLine } from '../format.ts';
import { APP_VERSION } from '../version.ts';

export function Home() {
  const { record } = useSession();
  const [settingsOpen, setSettingsOpen] = useState(false);
  const resumable = record ? replay(record.config, record.seed, record.events) : null;
  const names = record
    ? { A: record.config.players.A.name, B: record.config.players.B.name }
    : null;

  return (
    <main className="pt-safe pb-safe mx-auto flex min-h-full max-w-md flex-col px-4">
      <div className="flex flex-1 flex-col items-center justify-center gap-4 py-10">
        <div className="flex gap-3">
          <Token game="bac" />
          <Token game="year" />
          <Token game="estim" />
        </div>
        <h1 className="font-display text-2xl font-black tracking-tight">Copilote</h1>
        <p className="text-center text-md text-ink-soft">Le quiz oral à deux pour la route.</p>
      </div>
      <div className="flex flex-col gap-3 pb-6">
        {resumable && names ? (
          <Button size="lg" block icon={<PlayIcon />} onClick={actions.resumeMatch}>
            <span className="flex flex-col items-start leading-tight">
              <span>Reprendre la partie</span>
              <span className="text-xs font-semibold opacity-75">
                {scoreLine(names, totals(resumable))} · manche {resumable.roundIndex + 1}/
                {resumable.config.rounds}
              </span>
            </span>
          </Button>
        ) : null}
        <Button size="lg" block variant={resumable ? 'card' : 'primary'} onClick={actions.goSetup}>
          {resumable ? 'Nouvelle partie' : 'Jouer'}
        </Button>
        <Button block variant="card" onClick={() => setSettingsOpen(true)}>
          Réglages
        </Button>
        <p className="pt-4 text-center text-xs text-ink-soft tabular-nums">v{APP_VERSION}</p>
      </div>
      {settingsOpen ? (
        <Sheet title="Réglages" onClose={() => setSettingsOpen(false)}>
          <SettingsPanel />
          <Button block className="sticky bottom-0" onClick={() => setSettingsOpen(false)}>
            Terminé
          </Button>
        </Sheet>
      ) : null}
    </main>
  );
}
