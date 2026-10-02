import { registerSW } from 'virtual:pwa-register';
import { APP_BUILD } from './ui/version.ts';

/**
 * Mise à jour automatique à l'ouverture.
 *
 * L'app installée tourne depuis le cache du service worker : sans rien faire, elle affiche
 * l'ancienne version et ne bascule qu'au rechargement suivant. À chaque ouverture (et à chaque
 * retour au premier plan, car l'iPhone réveille souvent l'app sans la recharger), on lit
 * version.json sur le réseau. S'il annonce un autre build, on affiche « Mise à jour… »,
 * on installe le nouveau service worker et on recharge. Une partie en cours est sauvegardée :
 * elle se reprend après le rechargement. Hors ligne, rien ne change.
 */

const OVERLAY_ID = 'copilote-update';
/** Au-delà, on force : caches vidés et service worker désinscrit, puis rechargement. */
const FORCE_AFTER_MS = 8000;
/** Garde-fou contre une boucle de rechargements si version.json et le cache restent en désaccord. */
const TRIED_KEY = 'copilote:update-tried';

let registration: ServiceWorkerRegistration | undefined;
let updating = false;

function showOverlay() {
  if (document.getElementById(OVERLAY_ID)) return;
  const el = document.createElement('div');
  el.id = OVERLAY_ID;
  el.setAttribute('role', 'status');
  el.textContent = 'Mise à jour…';
  el.style.cssText =
    'position:fixed;inset:0;z-index:9999;display:flex;align-items:center;justify-content:center;' +
    'background:#F7F1E5;color:#1F2430;font:700 20px system-ui,sans-serif';
  document.body.appendChild(el);
}

async function latestBuild(): Promise<string | null> {
  try {
    const res = await fetch(`/version.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return null;
    const data = (await res.json()) as { build?: unknown };
    return typeof data.build === 'string' ? data.build : null;
  } catch {
    return null;
  }
}

async function forceReload() {
  try {
    const regs = await navigator.serviceWorker.getRegistrations();
    await Promise.all(regs.map((r) => r.unregister()));
    const keys = await caches.keys();
    await Promise.all(keys.map((k) => caches.delete(k)));
  } finally {
    window.location.reload();
  }
}

async function checkForUpdate() {
  if (updating || !navigator.onLine) return;
  const build = await latestBuild();
  if (!build || build === APP_BUILD) {
    sessionStorage.removeItem(TRIED_KEY);
    return;
  }
  // Déjà tenté pour ce build pendant cette session : on n'insiste pas (évite une boucle).
  if (sessionStorage.getItem(TRIED_KEY) === build) return;
  sessionStorage.setItem(TRIED_KEY, build);
  updating = true;
  showOverlay();
  // Le nouveau service worker prend la main tout seul (autoUpdate) ; on recharge dès qu'il l'a.
  navigator.serviceWorker.addEventListener('controllerchange', () => window.location.reload(), {
    once: true,
  });
  window.setTimeout(() => void forceReload(), FORCE_AFTER_MS);
  try {
    await registration?.update();
  } catch {
    void forceReload();
  }
}

export function setupPwa() {
  if (!('serviceWorker' in navigator)) return;
  registerSW({
    immediate: true,
    onRegisteredSW(_url, reg) {
      registration = reg;
      void checkForUpdate();
    },
  });
  document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'visible') void checkForUpdate();
  });
  window.setInterval(() => void checkForUpdate(), 30 * 60 * 1000);
}
