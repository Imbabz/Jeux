/** Vibrations courtes (Android ; iOS les ignore silencieusement). */
let enabled = true;

export const haptics = {
  setEnabled(value: boolean) {
    enabled = value;
  },
  pulse(ms: number) {
    if (!enabled || typeof navigator.vibrate !== 'function') return;
    try {
      navigator.vibrate(ms);
    } catch {
      // Certains navigateurs lèvent une erreur hors geste utilisateur : sans conséquence.
    }
  },
};
