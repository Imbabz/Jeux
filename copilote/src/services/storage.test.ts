import { beforeEach, describe, expect, it } from 'vitest';
import { z } from 'zod';
import { storage } from './storage.ts';

const schema = z.object({ schemaVersion: z.literal(1), value: z.number() });
const fallback = { schemaVersion: 1 as const, value: 0 };

describe('storage', () => {
  beforeEach(() => localStorage.clear());

  it('écrit et relit sous le préfixe copilote:', () => {
    storage.write('settings', { schemaVersion: 1, value: 42 });
    expect(localStorage.getItem('copilote:settings')).toBe('{"schemaVersion":1,"value":42}');
    expect(storage.read('settings', schema, fallback)).toEqual({ schemaVersion: 1, value: 42 });
  });

  it('revient à la valeur par défaut si absent, corrompu ou invalide', () => {
    expect(storage.read('settings', schema, fallback)).toBe(fallback);
    localStorage.setItem('copilote:settings', '{pas du json');
    expect(storage.read('settings', schema, fallback)).toBe(fallback);
    localStorage.setItem('copilote:settings', '{"schemaVersion":2,"value":"x"}');
    expect(storage.read('settings', schema, fallback)).toBe(fallback);
  });

  it('supprime une clé', () => {
    storage.write('seen', fallback);
    storage.remove('seen');
    expect(localStorage.getItem('copilote:seen')).toBeNull();
  });
});
