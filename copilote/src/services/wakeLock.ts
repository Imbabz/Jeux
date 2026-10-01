import { logger } from './logger.ts';

/**
 * Garde l'écran allumé pendant la partie et réacquiert le verrou au retour au premier plan.
 * Repli silencieux si l'API est absente ou refusée (GAME_DESIGN §15, cas 16).
 */

let sentinel: WakeLockSentinel | null = null;
let wanted = false;

async function request() {
  if (!wanted || sentinel || !('wakeLock' in navigator) || document.visibilityState !== 'visible')
    return;
  try {
    sentinel = await navigator.wakeLock.request('screen');
    sentinel.addEventListener('release', () => {
      sentinel = null;
    });
  } catch (error) {
    logger.warn('Wake Lock indisponible', String(error));
  }
}

function onVisibilityChange() {
  void request();
}

export const wakeLock = {
  acquire() {
    if (wanted) return;
    wanted = true;
    document.addEventListener('visibilitychange', onVisibilityChange);
    void request();
  },
  release() {
    wanted = false;
    document.removeEventListener('visibilitychange', onVisibilityChange);
    void sentinel?.release().catch(() => undefined);
    sentinel = null;
  },
};
