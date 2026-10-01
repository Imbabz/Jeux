import { actions, useSession } from '../../app/session.ts';
import type { Settings } from '../../app/schemas.ts';
import { Button } from './Button.tsx';
import { Segmented } from './Segmented.tsx';

/** Réglages de l'app (accueil et menu de partie) : son, vibrations, chronos. */
export function SettingsPanel() {
  const { settings } = useSession();
  const toggle = (key: 'sound' | 'haptics', label: string) => (
    <label className="flex min-h-12 items-center justify-between gap-3 text-sm font-semibold">
      {label}
      <input
        type="checkbox"
        className="size-6 accent-ink"
        checked={settings[key]}
        onChange={(e) => actions.saveSettings({ [key]: e.target.checked })}
      />
    </label>
  );
  return (
    <div className="flex flex-col gap-2">
      {toggle('sound', 'Bips')}
      <Button variant="card" block onClick={actions.testSound} disabled={!settings.sound}>
        Tester le son
      </Button>
      <p className="text-xs text-ink-soft">
        Pas de son ? Montez le volume et vérifiez le bouton silencieux de l’iPhone.
      </p>
      {toggle('haptics', 'Vibrations')}
      <p className="pt-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
        Bac Éclair : temps par mot
      </p>
      <Segmented
        label="Temps par mot"
        value={settings.bacWordSeconds}
        onChange={(v: Settings['bacWordSeconds']) => actions.saveSettings({ bacWordSeconds: v })}
        options={([4, 6, 8, 10] as const).map((n) => ({ value: n, label: `${n} s` }))}
      />
      <p className="pt-2 text-xs font-bold uppercase tracking-wide text-ink-soft">
        Temps de réflexion (Année, Estimation)
      </p>
      <Segmented
        label="Temps de réflexion"
        value={settings.thinkSeconds}
        onChange={(v: Settings['thinkSeconds']) => actions.saveSettings({ thinkSeconds: v })}
        options={([0, 5, 10, 15] as const).map((n) => ({
          value: n,
          label: n === 0 ? 'Aucun' : `${n} s`,
        }))}
      />
    </div>
  );
}
