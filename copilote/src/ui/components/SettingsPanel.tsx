import { useState } from 'react';
import { actions, useSession } from '../../app/session.ts';
import { BAC_SECONDS_MAX, BAC_SECONDS_MIN, type Settings } from '../../app/schemas.ts';
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
      <BacSecondsField />
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

/**
 * Temps par mot du Bac Éclair, saisi librement (en secondes).
 * La valeur est enregistrée dès qu'elle est valide ; hors bornes, le champ le signale.
 */
export function BacSecondsField() {
  const { settings } = useSession();
  const [text, setText] = useState(String(settings.bacWordSeconds));
  const value = Number(text);
  const valid = /^\d+$/.test(text) && value >= BAC_SECONDS_MIN && value <= BAC_SECONDS_MAX;
  const save = (n: number) => {
    const clamped = Math.min(BAC_SECONDS_MAX, Math.max(BAC_SECONDS_MIN, n));
    setText(String(clamped));
    actions.saveSettings({ bacWordSeconds: clamped });
  };
  const step =
    'flex size-12 shrink-0 items-center justify-center rounded-key border border-line bg-card font-display text-xl font-black active:bg-line disabled:opacity-35';
  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center gap-2">
        <button
          type="button"
          aria-label="Une seconde de moins"
          className={step}
          disabled={settings.bacWordSeconds <= BAC_SECONDS_MIN}
          onClick={() => save(settings.bacWordSeconds - 1)}
        >
          −
        </button>
        <input
          aria-label="Temps par mot, en secondes"
          type="text"
          inputMode="numeric"
          pattern="[0-9]*"
          enterKeyHint="done"
          value={text}
          // Tout le contenu est sélectionné au toucher : le chiffre tapé remplace l'ancien.
          onFocus={(e) => e.currentTarget.select()}
          onPointerUp={(e) => e.currentTarget.select()}
          onChange={(e) => {
            const next = e.target.value.replace(/\D/g, '').slice(0, 2);
            setText(next);
            const n = Number(next);
            if (next !== '' && n >= BAC_SECONDS_MIN && n <= BAC_SECONDS_MAX) {
              actions.saveSettings({ bacWordSeconds: n });
            }
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') e.currentTarget.blur();
          }}
          onBlur={() => {
            if (!valid) setText(String(settings.bacWordSeconds));
          }}
          className={`min-h-12 w-16 min-w-0 rounded-key border bg-table text-center font-display text-xl font-black tabular-nums ${
            valid ? 'border-line' : 'border-bac'
          }`}
        />
        <button
          type="button"
          aria-label="Une seconde de plus"
          className={step}
          disabled={settings.bacWordSeconds >= BAC_SECONDS_MAX}
          onClick={() => save(settings.bacWordSeconds + 1)}
        >
          +
        </button>
        <span className="text-md font-semibold">s par mot</span>
      </div>
      {valid ? null : (
        <span className="text-xs font-semibold text-bac">
          Entre {BAC_SECONDS_MIN} et {BAC_SECONDS_MAX} secondes.
        </span>
      )}
    </div>
  );
}
