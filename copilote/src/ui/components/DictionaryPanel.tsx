import { useMemo, useRef, useState } from 'react';
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

/** « n.f. · insecte » → nature « n.f. » et sous-classe « insecte » (l'une ou l'autre peut manquer). */
function splitNote(note: string): { nature: string; kind: string } {
  const [first = '', second] = note.split(' · ');
  const isNature = /^(n\.|n\.m\.|n\.f\.|v\.|adj\.)$/.test(first);
  if (second !== undefined) return { nature: first, kind: second };
  return isNature ? { nature: first, kind: '' } : { nature: '', kind: first };
}

/**
 * Dictionnaire du Bac Éclair (DESIGN §3.3) : présenté comme un vrai dictionnaire —
 * rubriques alphabétiques (« BA », « BE »…) avec un index pour y sauter, mot vedette en
 * gras, nature en italique, sous-classe en petit (« abeille n.f. — insecte »), filtre par
 * sous-classe et recherche sans accents. Indicatif : le copilote reste juge.
 */
export function DictionaryPanel({
  entries,
  letter,
}: {
  entries: readonly DictionaryEntry[] | null;
  letter: string;
}) {
  const [query, setQuery] = useState('');
  const [kind, setKind] = useState<string | null>(null);
  const scroller = useRef<HTMLDivElement>(null);

  const parsed = useMemo(
    () => (entries ?? []).map(([word, note]) => ({ word, ...splitNote(note) })),
    [entries],
  );
  // Sous-classes présentes, de la plus fréquente à la plus rare (filtre seulement s'il y en a 2+).
  const kinds = useMemo(() => {
    const counts = new Map<string, number>();
    for (const e of parsed) if (e.kind) counts.set(e.kind, (counts.get(e.kind) ?? 0) + 1);
    return [...counts.entries()].sort((a, b) => b[1] - a[1]).map(([k]) => k);
  }, [parsed]);
  const filtered = useMemo(() => {
    const q = plain(query.trim());
    return parsed.filter((e) => (!kind || e.kind === kind) && (!q || plain(e.word).includes(q)));
  }, [parsed, query, kind]);
  const groups = useMemo(() => {
    const out: { rubric: string; entries: typeof filtered }[] = [];
    for (const entry of filtered) {
      const r = rubric(entry.word);
      const last = out[out.length - 1];
      if (last && last.rubric === r) last.entries.push(entry);
      else out.push({ rubric: r, entries: [entry] });
    }
    // Comme les mots repères d'un dictionnaire : les petites rubriques voisines sont regroupées
    // (« IG – IL ») pour qu'aucune section ne tienne sur une seule ligne.
    const merged: { rubric: string; entries: typeof filtered }[] = [];
    for (const g of out) {
      const last = merged[merged.length - 1];
      if (last && last.entries.length < 8) {
        const first = last.rubric.split(' – ')[0] ?? last.rubric;
        last.rubric = `${first} – ${g.rubric}`;
        last.entries.push(...g.entries);
      } else merged.push({ rubric: g.rubric, entries: [...g.entries] });
    }
    return merged;
  }, [filtered]);

  // Rubriques et index seulement quand la liste est longue : sinon, une simple grille alphabétique.
  const grouped = filtered.length >= 30;
  const shown = grouped ? groups : [{ rubric: '', entries: filtered }];

  const jump = (r: string) => {
    const target = scroller.current?.querySelector<HTMLElement>(`[data-rubric="${CSS.escape(r)}"]`);
    if (target && scroller.current) scroller.current.scrollTop = target.offsetTop;
  };
  const chip = (active: boolean) =>
    `shrink-0 rounded-chip border px-3 py-1 text-xs font-bold ${
      active ? 'border-ink bg-ink text-white' : 'border-line bg-card text-ink-soft'
    }`;

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-card bg-card text-ink shadow-card">
      <div className="flex flex-col gap-1.5 border-b border-line px-3 pt-2 pb-1.5">
        <div className="flex items-center gap-2">
          <div className="relative min-w-0 flex-1">
            <input
              type="search"
              aria-label="Chercher dans le dictionnaire"
              placeholder={`Chercher en ${letter}…`}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="min-h-10 w-full rounded-key border border-line bg-table px-3 text-md placeholder:text-ink-soft/70"
            />
          </div>
          <span className="shrink-0 text-xs font-semibold text-ink-soft tabular-nums">
            {entries ? `${filtered.length} mot${filtered.length > 1 ? 's' : ''}` : '…'}
          </span>
        </div>
        {kinds.length > 1 ? (
          <div className="-mx-3 flex gap-1.5 overflow-x-auto px-3" aria-label="Filtrer par famille">
            <button type="button" className={chip(kind === null)} onClick={() => setKind(null)}>
              Tous
            </button>
            {kinds.map((k) => (
              <button
                key={k}
                type="button"
                aria-pressed={kind === k}
                className={chip(kind === k)}
                onClick={() => setKind(kind === k ? null : k)}
              >
                {k}
              </button>
            ))}
          </div>
        ) : null}
        {grouped && groups.length > 3 ? (
          <div className="-mx-3 flex gap-1 overflow-x-auto px-3" aria-label="Index alphabétique">
            {groups.map((g) => (
              <button
                key={g.rubric}
                type="button"
                onClick={() => jump(g.rubric)}
                className="min-h-8 shrink-0 rounded-key px-2 font-display text-sm font-black tracking-wider text-bac active:bg-line"
              >
                {g.rubric}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <div
        ref={scroller}
        className="relative min-h-0 flex-1 overflow-y-auto px-4 pb-3"
        aria-label="Dictionnaire"
      >
        {!entries ? (
          <p className="py-4 text-sm text-ink-soft">Chargement du dictionnaire…</p>
        ) : filtered.length === 0 ? (
          <p className="py-4 text-sm text-ink-soft">
            {query
              ? 'Absent du dictionnaire : au copilote de juger.'
              : 'Pas de liste pour cette lettre.'}
          </p>
        ) : (
          shown.map((g) => (
            <section key={g.rubric || 'tout'} data-rubric={g.rubric}>
              {g.rubric ? (
                <h3 className="sticky top-0 z-10 -mx-4 flex items-center gap-2 bg-card/95 px-4 pt-2 pb-1 backdrop-blur-sm">
                  <span className="font-display text-sm font-black tracking-widest text-bac">
                    {g.rubric}
                  </span>
                  <span className="h-px flex-1 bg-bac/40" />
                </h3>
              ) : null}
              <dl className="grid grid-cols-2 gap-x-3 pb-1">
                {g.entries.map((e) => (
                  <div key={e.word} className="min-w-0 py-1 leading-tight">
                    <dt className="inline font-display text-md font-bold break-words">{e.word}</dt>
                    {e.nature ? (
                      <dd className="inline pl-1 text-xs text-ink-soft italic">{e.nature}</dd>
                    ) : null}
                    {e.kind && !kind ? (
                      <dd className="truncate text-xs font-semibold text-ink-soft">{e.kind}</dd>
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
