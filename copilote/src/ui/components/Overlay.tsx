import type { ReactNode } from 'react';
import { Button } from './Button.tsx';

/** Voile plein écran + carte centrée : pause, dialogues de confirmation (DESIGN §3.7). */
export function Overlay({
  children,
  onBackdrop,
}: {
  children: ReactNode;
  onBackdrop?: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-40 flex items-end justify-center bg-veil p-4 animate-fade-in sm:items-center"
      onClick={onBackdrop}
    >
      <div className="w-full max-w-sm animate-pop" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  );
}

export function ConfirmDialog({
  title,
  body,
  confirmLabel,
  destructive = false,
  onConfirm,
  onCancel,
}: {
  title: string;
  body?: string;
  confirmLabel: string;
  destructive?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <Overlay onBackdrop={onCancel}>
      <div
        role="alertdialog"
        aria-label={title}
        className="flex flex-col gap-4 rounded-card bg-card p-5 shadow-card"
      >
        <h2 className="font-display text-lg font-bold">{title}</h2>
        {body ? <p className="text-sm text-ink-soft">{body}</p> : null}
        <div className="flex gap-3">
          <Button variant="card" className="flex-1" onClick={onCancel}>
            Annuler
          </Button>
          <Button
            variant="primary"
            className={`flex-1 ${destructive ? 'bg-bac [--btn-deep:var(--color-bac-deep)]' : ''}`}
            onClick={onConfirm}
          >
            {confirmLabel}
          </Button>
        </div>
      </div>
    </Overlay>
  );
}

/** Panneau de menu qui monte du bas (DESIGN §4.15). */
export function Sheet({
  title,
  children,
  onClose,
}: {
  title: string;
  children: ReactNode;
  onClose: () => void;
}) {
  return (
    <Overlay onBackdrop={onClose}>
      <div
        role="dialog"
        aria-label={title}
        className="flex flex-col gap-3 rounded-card bg-table p-4 shadow-sheet"
      >
        <h2 className="px-1 font-display text-lg font-bold">{title}</h2>
        {children}
      </div>
    </Overlay>
  );
}
