/**
 * Bips générés à la volée (aucun fichier audio) — GAME_DESIGN §10.1.
 *
 * Pourquoi des éléments <audio> plutôt que WebAudio : sur iPhone, un AudioContext est suspendu
 * dès que l'app n'est plus dans un geste (minuteur), après une veille, ou quand une autre app
 * (musique de la voiture) reprend la main ; les bips déclenchés par le chrono se perdaient.
 * Un élément <audio> « débloqué » une fois par un tap peut ensuite être rejoué par le chrono.
 *
 * En voiture, la liaison Bluetooth/CarPlay se met en veille entre deux sons et rogne le début
 * du suivant : chaque bip commence par un court silence, et le son est fort et assez long.
 * La session audio est déclarée « transient » : la musique est baissée le temps du bip
 * au lieu d'être coupée.
 */

export type BeepKind = 'tick' | 'go' | 'alert' | 'end';

interface Tone {
  readonly freq: number;
  readonly ms: number;
  /** Nombre de répétitions du son (bips doubles pour l'alerte). */
  readonly repeat?: number;
}

const TONES: Record<BeepKind, Tone> = {
  tick: { freq: 660, ms: 140 },
  go: { freq: 990, ms: 320 },
  alert: { freq: 880, ms: 110, repeat: 2 },
  end: { freq: 440, ms: 700 },
};

const RATE = 22050;
/** Silence de tête : le temps que la liaison Bluetooth se réveille. */
const LEAD_MS = 180;

/** Encode un bip en WAV PCM 16 bits mono (fonction pure, testée). */
export function renderBeepWav(
  { freq, ms, repeat = 1 }: Tone,
  leadMs = LEAD_MS,
): Uint8Array<ArrayBuffer> {
  const gapMs = 70;
  const lead = Math.round((RATE * leadMs) / 1000);
  const tone = Math.round((RATE * ms) / 1000);
  const gap = Math.round((RATE * gapMs) / 1000);
  const total = lead + repeat * tone + (repeat - 1) * gap;
  const buffer = new ArrayBuffer(44 + total * 2);
  const view = new DataView(buffer);
  const text = (offset: number, s: string) => {
    for (let i = 0; i < s.length; i++) view.setUint8(offset + i, s.charCodeAt(i));
  };
  text(0, 'RIFF');
  view.setUint32(4, 36 + total * 2, true);
  text(8, 'WAVE');
  text(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, RATE, true);
  view.setUint32(28, RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, 'data');
  view.setUint32(40, total * 2, true);
  const fade = Math.round(RATE * 0.008);
  for (let r = 0; r < repeat; r++) {
    const start = lead + r * (tone + gap);
    for (let i = 0; i < tone; i++) {
      const envelope = Math.min(1, i / fade, (tone - i) / fade);
      const sample = Math.sin((2 * Math.PI * freq * i) / RATE) * 0.85 * envelope;
      view.setInt16(44 + (start + i) * 2, Math.round(sample * 32767), true);
    }
  }
  return new Uint8Array(buffer);
}

let enabled = true;
let players: Record<BeepKind, HTMLAudioElement> | null = null;
let unlocked = false;
let listening = false;

function setSessionType() {
  const nav = navigator as Navigator & { audioSession?: { type: string } };
  if (!nav.audioSession) return;
  try {
    nav.audioSession.type = 'transient';
  } catch {
    nav.audioSession.type = 'playback';
  }
}

function getPlayers(): Record<BeepKind, HTMLAudioElement> | null {
  if (players) return players;
  if (typeof Audio === 'undefined' || typeof URL.createObjectURL !== 'function') return null;
  setSessionType();
  const make = (kind: BeepKind) => {
    const blob = new Blob([renderBeepWav(TONES[kind])], { type: 'audio/wav' });
    const el = new Audio(URL.createObjectURL(blob));
    el.preload = 'auto';
    return el;
  };
  players = { tick: make('tick'), go: make('go'), alert: make('alert'), end: make('end') };
  return players;
}

export const sound = {
  setEnabled(value: boolean) {
    enabled = value;
  },
  /** À appeler dans un gestionnaire de tap : débloque chaque son pour iOS. */
  unlock() {
    const all = getPlayers();
    if (!all || unlocked) return;
    for (const el of Object.values(all)) {
      el.muted = true;
      el.play()
        .then(() => {
          el.pause();
          el.currentTime = 0;
          el.muted = false;
          unlocked = true;
        })
        .catch(() => {
          el.muted = false;
        });
    }
  },
  /** Débloque l'audio au premier tap, n'importe où dans l'app (à appeler une fois au démarrage). */
  listen() {
    if (listening) return;
    listening = true;
    const wake = () => {
      if (enabled && !unlocked) sound.unlock();
    };
    for (const type of ['pointerdown', 'touchend', 'click'] as const) {
      document.addEventListener(type, wake, { capture: true, passive: true });
    }
  },
  beep(kind: BeepKind) {
    if (!enabled) return;
    const el = getPlayers()?.[kind];
    if (!el) return;
    el.currentTime = 0;
    void el.play().catch(() => undefined);
  },
};
