import { describe, expect, it } from 'vitest';
import { renderBeepWav } from './sound.ts';

describe('bips WAV', () => {
  it('produit un WAV PCM mono avec silence de tête puis le son', () => {
    const wav = renderBeepWav({ freq: 440, ms: 100 }, 100);
    const view = new DataView(wav.buffer);
    expect(String.fromCharCode(...wav.slice(0, 4))).toBe('RIFF');
    expect(String.fromCharCode(...wav.slice(8, 12))).toBe('WAVE');
    expect(view.getUint32(24, true)).toBe(22050);
    const samples = (wav.length - 44) / 2;
    expect(samples).toBe(Math.round(22050 * 0.1) * 2);
    // Silence de tête…
    expect(view.getInt16(44 + 100 * 2, true)).toBe(0);
    // …puis un son audible.
    let peak = 0;
    for (let i = samples / 2; i < samples; i++)
      peak = Math.max(peak, view.getInt16(44 + i * 2, true));
    expect(peak).toBeGreaterThan(20000);
  });

  it('répète le son pour les bips doubles', () => {
    const single = renderBeepWav({ freq: 880, ms: 100 }, 0);
    const double = renderBeepWav({ freq: 880, ms: 100, repeat: 2 }, 0);
    expect(double.length).toBeGreaterThan(single.length * 2 - 44);
  });
});
