import { bacDictionarySchema, type BacDictionary } from './schemas.ts';

/**
 * Chargement paresseux du dictionnaire du Bac Éclair (≈ 15 000 entrées) : un fichier séparé,
 * importé à la première carte retournée, pour ne pas alourdir le démarrage de l'app.
 * Le service worker le précache comme le reste : il reste disponible hors ligne.
 */
let pending: Promise<BacDictionary> | null = null;

export function loadBacDictionary(): Promise<BacDictionary> {
  pending ??= import('./data/bac-dictionary.json').then((m) =>
    bacDictionarySchema.parse(m.default),
  );
  return pending;
}
