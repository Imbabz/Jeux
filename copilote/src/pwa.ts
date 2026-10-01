import { registerSW } from 'virtual:pwa-register';

/**
 * Service worker : l'app tourne hors ligne, mais doit aussi se mettre à jour.
 * Sur iPhone, une app installée revient souvent de veille sans recharger la page : on vérifie
 * donc s'il existe une nouvelle version à chaque retour au premier plan (et toutes les 30 min).
 * Une nouvelle version s'installe et recharge l'app automatiquement (registerType « autoUpdate »).
 */
export function setupPwa() {
  if (!('serviceWorker' in navigator)) return;
  registerSW({
    immediate: true,
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      const check = () => {
        if (navigator.onLine) void registration.update().catch(() => undefined);
      };
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') check();
      });
      window.setInterval(check, 30 * 60 * 1000);
    },
  });
}
