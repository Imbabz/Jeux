import { APP_VERSION } from './version.ts';

const GAME_TOKENS = [
  { id: 'bac', label: 'Bac Éclair', className: 'bg-bac' },
  { id: 'year', label: 'Quelle année ?', className: 'bg-year' },
  { id: 'estim', label: 'Estimation', className: 'bg-estim' },
] as const;

/** Écran provisoire de l'étape 1 : vérifie tokens, polices et déploiement. */
export function App() {
  return (
    <main className="mx-auto flex min-h-full max-w-md flex-col items-center justify-center gap-8 px-4 py-12">
      <div className="flex gap-3" aria-hidden="true">
        {GAME_TOKENS.map((token) => (
          <span
            key={token.id}
            title={token.label}
            className={`size-7 rounded-full border-2 border-white shadow-token ${token.className}`}
          />
        ))}
      </div>
      <h1 className="font-display text-2xl font-black tracking-tight">Copilote</h1>
      <div className="flex flex-col items-center gap-2 text-center">
        <p className="text-md text-ink-soft">Le quiz oral à deux pour la route.</p>
        <p className="text-xs font-semibold tracking-wide text-ink-soft uppercase">
          En construction · étape 1
        </p>
      </div>
      <p className="text-xs text-ink-soft tabular-nums">v{APP_VERSION}</p>
    </main>
  );
}
