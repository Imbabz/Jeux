import { useState } from 'react';
import type { PlayerId } from '../../engine/index.ts';
import { haptics } from '../../services/index.ts';
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
