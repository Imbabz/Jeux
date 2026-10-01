import { MenuIcon, PauseIcon, UndoIcon } from './icons.tsx';

/** Actions toujours disponibles, toujours au même endroit (DESIGN §3.1). */
export function ActionBar({
  canUndo,
  onUndo,
  onPause,
  onMenu,
}: {
  canUndo: boolean;
  onUndo: () => void;
  onPause: () => void;
  onMenu: () => void;
}) {
  const item =
    'flex min-h-16 flex-1 flex-col items-center justify-center gap-0.5 text-xs font-semibold text-ink-soft active:bg-line disabled:opacity-35';
  return (
    <nav
      className="pb-safe shrink-0 border-t border-line bg-table/90"
      aria-label="Actions de partie"
    >
      <div className="flex">
        <button type="button" className={item} onClick={onUndo} disabled={!canUndo}>
          <UndoIcon />
          Annuler
        </button>
        <button type="button" className={item} onClick={onPause}>
          <PauseIcon />
          Pause
        </button>
        <button type="button" className={item} onClick={onMenu}>
          <MenuIcon />
          Menu
        </button>
      </div>
    </nav>
  );
}
