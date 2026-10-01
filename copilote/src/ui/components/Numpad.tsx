import { useState } from 'react';
import type { PlayerId } from '../../engine/index.ts';
import { haptics } from '../../services/index.ts';
import { formatQuantity, parseEstimInput, withUnit } from '../format.ts';
import { PLAYER_THEME } from '../theme/games.ts';
import { Button } from './Button.tsx';
import { BackspaceIcon, CheckIcon } from './icons.tsx';

/**
 * Pavé de saisie d'une année (DESIGN §3.5) : 4 chiffres, pré-remplis par l'indice de siècle.
 * Le composant ne connaît aucune règle de score : il renvoie une valeur ou `null` (pas de réponse).
 */
export function YearNumpad({
  player,
  name,
  prefill,
  onSubmit,
}: {
  player: PlayerId;
  name: string;
  prefill: string;
  onSubmit: (value: number | null) => void;
}) {
  const [digits, setDigits] = useState(prefill.slice(0, 4));
  const [shake, setShake] = useState(0);
  const valid = digits.length === 4 && Number(digits) >= 1000;
  const theme = PLAYER_THEME[player];

  const press = (d: string) => {
    haptics.pulse(8);
    setDigits((cur) => (cur.length < 4 ? cur + d : cur));
  };
  const erase = () => setDigits((cur) => cur.slice(0, -1));
  const submit = () => {
    if (valid) onSubmit(Number(digits));
    else setShake((n) => n + 1);
  };

  const key =
    'btn-physical flex h-14 items-center justify-center rounded-key border border-line bg-card font-display text-xl font-bold text-ink [--btn-deep:var(--color-line-deep)]';

  return (
    <div className="flex h-full flex-col gap-3">
      <div className={`rounded-card border-l-[6px] bg-card p-3 shadow-card ${theme.border}`}>
        <p className="text-sm font-semibold text-ink-soft">
          <span className="font-bold text-ink">{name}</span> a dit…
        </p>
        <div
          key={shake}
          aria-live="polite"
          aria-label={`Saisie : ${digits || 'vide'}`}
          className={`mt-1 flex justify-center gap-2 font-display text-2xl font-black tabular-nums ${shake ? 'animate-shake' : ''}`}
        >
          {Array.from({ length: 4 }, (_, i) => (
            <span
              key={i}
              className={`w-10 text-center ${digits[i] ? 'text-ink' : 'text-line-deep'}`}
            >
              {digits[i] ?? '_'}
            </span>
          ))}
        </div>
      </div>
      <div className="grid flex-1 grid-cols-3 content-center gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((d) => (
          <button key={d} type="button" className={key} onClick={() => press(d)}>
            {d}
          </button>
        ))}
        <button type="button" aria-label="Effacer" className={key} onClick={erase}>
          <BackspaceIcon />
        </button>
        <button type="button" className={key} onClick={() => press('0')}>
          0
        </button>
        <button
          type="button"
          aria-label="Valider"
          aria-disabled={!valid}
          className={`btn-physical flex h-14 items-center justify-center rounded-key ${valid ? 'bg-ink text-white [--btn-deep:var(--color-ink-deep)]' : 'border border-line bg-table text-line-deep'}`}
          onClick={submit}
        >
          <CheckIcon size={28} />
        </button>
      </div>
      <Button variant="neutral" block onClick={() => onSubmit(null)}>
        Pas de réponse
      </Button>
    </div>
  );
}

const MULTIPLIERS = [
  { value: 1e3, label: 'mille' },
  { value: 1e6, label: 'million' },
  { value: 1e9, label: 'milliard' },
] as const;

/**
 * Pavé d'Estimation (DESIGN §3.5) : chiffres, virgule, multiplicateurs exclusifs [mille] [million] [milliard].
 * L'aperçu est formaté en français en direct. Valider est inactif tant que la valeur vaut 0.
 */
export function EstimNumpad({
  player,
  name,
  unit,
  onSubmit,
}: {
  player: PlayerId;
  name: string;
  unit: string;
  onSubmit: (value: number | null) => void;
}) {
  const [digits, setDigits] = useState('');
  const [multiplier, setMultiplier] = useState(1);
  const [shake, setShake] = useState(0);
  const value = parseEstimInput(digits, multiplier);
  const valid = value > 0;
  const theme = PLAYER_THEME[player];

  const press = (d: string) => {
    haptics.pulse(8);
    setDigits((cur) => {
      const [int = '', dec] = cur.split(',');
      if (d === ',') return cur.includes(',') || cur === '' ? cur : `${cur},`;
      if (dec !== undefined) return dec.length < 2 ? cur + d : cur;
      if (int.length >= 9) return cur;
      return cur === '0' ? d : cur + d;
    });
  };
  const erase = () => setDigits((cur) => cur.slice(0, -1));
  const submit = () => {
    if (valid) onSubmit(value);
    else setShake((n) => n + 1);
  };

  const key =
    'btn-physical flex h-12 items-center justify-center rounded-key border border-line bg-card font-display text-xl font-bold text-ink [--btn-deep:var(--color-line-deep)]';
  const preview = digits === '' ? '—' : withUnit(formatQuantity(value), unit);
  const typed = digits === '' ? '0' : digits;
  const mult = MULTIPLIERS.find((m) => m.value === multiplier);

  return (
    <div className="flex h-full flex-col gap-2">
      <div className={`rounded-card border-l-[6px] bg-card px-3 py-2 shadow-card ${theme.border}`}>
        <p className="text-sm font-semibold text-ink-soft">
          <span className="font-bold text-ink">{name}</span> a dit…
        </p>
        <p
          key={shake}
          aria-live="polite"
          className={`truncate text-center font-display text-xl font-black tabular-nums ${shake ? 'animate-shake' : ''} ${digits ? 'text-ink' : 'text-line-deep'}`}
        >
          {typed}
          {mult ? ` ${mult.label}${value >= 2 * multiplier && multiplier > 1e3 ? 's' : ''}` : ''}
        </p>
        <p className="truncate text-center text-xs font-semibold text-ink-soft">{preview}</p>
      </div>
      <div className="flex gap-2" role="radiogroup" aria-label="Multiplicateur">
        {MULTIPLIERS.map((m) => {
          const active = multiplier === m.value;
          return (
            <button
              key={m.value}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => setMultiplier(active ? 1 : m.value)}
              className={`min-h-11 flex-1 rounded-chip border text-sm font-bold ${active ? 'border-ink bg-ink text-white' : 'border-line bg-card text-ink'}`}
            >
              {m.label}
            </button>
          );
        })}
      </div>
      <div className="grid flex-1 grid-cols-3 content-center gap-2">
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', ','].map((d) => (
          <button
            key={d}
            type="button"
            className={key}
            onClick={() => press(d)}
            aria-label={d === ',' ? 'Virgule' : d}
          >
            {d}
          </button>
        ))}
        <button type="button" className={key} onClick={() => press('0')}>
          0
        </button>
        <button type="button" aria-label="Effacer" className={key} onClick={erase}>
          <BackspaceIcon />
        </button>
      </div>
      <div className="flex gap-2">
        <Button variant="neutral" className="flex-1" onClick={() => onSubmit(null)}>
          Pas de réponse
        </Button>
        <button
          type="button"
          aria-label="Valider"
          aria-disabled={!valid}
          className={`btn-physical flex min-h-16 w-24 items-center justify-center rounded-button ${valid ? 'bg-ink text-white [--btn-deep:var(--color-ink-deep)]' : 'border border-line bg-table text-line-deep'}`}
          onClick={submit}
        >
          <CheckIcon size={30} />
        </button>
      </div>
    </div>
  );
}
