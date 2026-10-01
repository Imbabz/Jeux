import { useSession } from '../app/session.ts';
import { Home } from './screens/Home.tsx';
import { MatchScreen } from './screens/MatchScreen.tsx';
import { Setup } from './screens/Setup.tsx';
import { Styleguide } from './screens/Styleguide.tsx';

/** Routage minimal : `/styleguide` pour le design system, sinon l'écran courant de la session. */
export function App() {
  const { screen, content } = useSession();
  if (window.location.pathname.replace(/\/$/, '') === '/styleguide') return <Styleguide />;
  if (!content) {
    return (
      <div className="flex h-dvh items-center justify-center" aria-busy="true">
        <span className="font-display text-lg font-bold text-ink-soft">Copilote…</span>
      </div>
    );
  }
  if (screen === 'setup') return <Setup />;
  if (screen === 'match') return <MatchScreen />;
  return <Home />;
}
