import { useMemo, useState } from 'react';
import type { DictionaryEntry } from '../../content/index.ts';

/** Forme sans accents ni majuscules, pour chercher « eleve » et trouver « élève ». */
const plain = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();

/** Rubrique de dictionnaire : les deux premières lettres du mot (« BA », « BE »…). */
function rubric(word: string) {
  const letters = plain(word)
    .replace(/^(le |la |les |l'|l’)/, '')
    .replace(/[^a-z]/g, '');
  return letters.slice(0, 2).toUpperCase().padEnd(2, '·');
}

/**
 * Dictionnaire du Bac Éclair (DESIGN §3.3) : entrées classées par ordre alphabétique et par
 * rubrique, mot en gras, nature et sous-classe en italique (« n.f. · insecte »), recherche
 * sans accents. Indicatif : le copilote reste juge.
 */
export function DictionaryPanel({
  entries,
  letter,
}: {
  entries: readonly DictionaryEntry[] | null;
  letter: string;
}) {
  const [query, setQuery] = useState('');
  const filtered = useMemo(() => {
    if (!entries) return [];
    const q = plain(query.trim());
    return q ? entries.filter(([w]) => plain(w).includes(q)) : entries;
  }, [entries, query]);
  const groups = useMemo(() => {
    const out: { rubric: string; entries: DictionaryEntry[] }[] = [];
    for (const entry of filtered) {
      const r = rubric(entry[0]);
      const last = out[out.length - 1];
      if (last && last.rubric === r) last.entries.push(entry);
      else out.push({ rubric: r, entries: [entry] });
    }
    return out;
  }, [filtered]);

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-key bg-table text-ink">
      <div className="flex items-center gap-2 border-b border-line px-3 py-2">
        <input
          type="search"
          aria-label="Chercher dans le dictionnaire"
          placeholder={`Chercher en ${letter}…`}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="min-h-10 min-w-0 flex-1 rounded-key border border-line bg-card px-3 text-md placeholder:text-ink-soft/70"
        />
        <span className="shrink-0 text-xs font-semibold text-ink-soft tabular-nums">
          {entries ? `${filtered.length} entrée${filtered.length > 1 ? 's' : ''}` : '…'}
        </span>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 pb-2" aria-label="Dictionnaire">
        {!entries ? (
          <p className="py-3 text-sm text-ink-soft">Chargement du dictionnaire…</p>
        ) : filtered.length === 0 ? (
          <p className="py-3 text-sm text-ink-soft">
            {query
              ? 'Absent du dictionnaire : au copilote de juger.'
              : 'Pas de liste pour cette lettre.'}
          </p>
        ) : (
          groups.map((g) => (
            <section key={g.rubric}>
              <h3 className="sticky top-0 border-b border-line bg-table pt-2 pb-0.5 font-display text-sm font-black tracking-widest text-bac">
                {g.rubric}
              </h3>
              <dl className="py-1">
                {g.entries.map(([word, note]) => (
                  <div key={word} className="flex items-baseline gap-2 py-0.5 leading-tight">
                    <dt className="font-bold">{word}</dt>
                    {note ? (
                      <dd className="truncate text-xs text-ink-soft italic">{note}</dd>
                    ) : null}
                  </div>
                ))}
              </dl>
            </section>
          ))
        )}
      </div>
    </div>
  );
}
