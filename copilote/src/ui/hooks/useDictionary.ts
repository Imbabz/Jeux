import { useEffect, useState } from 'react';
import {
  loadBacDictionary,
  type BacDictionary,
  type DictionaryEntry,
} from '../../content/index.ts';
import { logger } from '../../services/index.ts';

let loaded: BacDictionary | null = null;

/** Entrées du dictionnaire pour une catégorie et une lettre ; `null` tant que le fichier charge. */
export function useBacEntries(
  itemId: string,
  letter: string | null,
): readonly DictionaryEntry[] | null {
  const [dictionary, setDictionary] = useState<BacDictionary | null>(loaded);
  useEffect(() => {
    if (dictionary) return;
    let alive = true;
    loadBacDictionary()
      .then((d) => {
        loaded = d;
        if (alive) setDictionary(d);
      })
      .catch((error: unknown) => logger.warn('Dictionnaire indisponible', error));
    return () => {
      alive = false;
    };
  }, [dictionary]);
  if (!dictionary) return null;
  return letter ? (dictionary[itemId]?.[letter] ?? []) : [];
}
