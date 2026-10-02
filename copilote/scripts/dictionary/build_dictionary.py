"""Construit les listes du dictionnaire du Bac Éclair à partir des ressources de fetch_sources.sh.
Sortie : generated.json = {id de catégorie: {lettre: [[mot, note], …]}}, où la note est
« n.f. · insecte » (genre d'après Lexique, sous-classe d'après WordNet).
Les mots écartés à la relecture sont listés dans review.py (BLOCKLIST)."""
import collections, json, pathlib, re, sys, unicodedata
sys.path.insert(0, str(pathlib.Path(__file__).parent))
import sources as S
from categories import WORDNET
from review import ALLOWLIST, BLOCKLIST, DOMESTIC, GLOBAL_JUNK, KIND_OVERRIDES

HERE = pathlib.Path(__file__).parent
COMMON = 'ABCDEFGHIJLMNOPRSTUV'


def initial(word):
    first = {'œ': 'o', 'Œ': 'O', 'æ': 'a', 'Æ': 'A'}.get(word[0], word[0])
    return unicodedata.normalize('NFD', first)[0].upper()


def gender(lex, word):
    e = lex.get(word, 'NOM')
    if not e:
        return ''
    return {'m': 'n.m.', 'f': 'n.f.'}.get(e['genre'], 'n.')


def note(lex, word, label):
    g = gender(lex, word)
    return f'{g} · {label}' if g else label


def wordnet_lists(lex, wolf):
    out = {}
    for cat, cfg in WORDNET.items():
        excluded = set()
        for root in cfg.get('exclude_roots', []):
            for syn in wolf.closure(root):
                excluded |= wolf.lemmas(syn)
        found = {}
        for label, roots in cfg['classes']:
            for root in roots:
                for syn in wolf.closure(root, instances=not cfg.get('no_instances')):
                    for w in wolf.lemmas(syn):
                        if w in found or w in excluded or w != w.lower():
                            continue
                        e = lex.get(w, 'NOM')
                        if not e or e['freq'] < cfg['min_freq']:
                            continue
                        found[w] = label
        block = BLOCKLIST.get(cat, set()) | GLOBAL_JUNK
        found = {w: KIND_OVERRIDES.get(w, label) for w, label in found.items()}
        allow = ALLOWLIST.get(cat)
        if allow is not None:
            # Liste relue : les mots validés absents de WordNet sont ajoutés avec la sous-classe par défaut.
            default = cfg['classes'][-1][0]
            found = {w: found.get(w, default) for w in allow}
        out[cat] = {w: note(lex, w, label) for w, label in found.items() if w not in block}
    # « Un animal sauvage » : les animaux de la liste relue, hors animaux domestiques ou d'élevage,
    # et seulement mammifères, oiseaux, reptiles et amphibiens (ce qu'on attend dans le jeu).
    tame = set(DOMESTIC)
    for root in ['dog.n.01', 'domestic_cat.n.01', 'domestic_animal.n.01', 'livestock.n.01', 'poultry.n.02',
                 'domestic_fowl.n.01', 'young_mammal.n.01', 'young_bird.n.01', 'dinosaur.n.01', 'pterosaur.n.01',
                 'mammoth.n.01', 'mastodon.n.01', 'aurochs.n.02', 'archaeopteryx.n.01', 'dodo.n.02']:
        for syn in wolf.closure(root):
            tame |= wolf.lemmas(syn)
    out['bac-0092'] = {w: n for w, n in out['bac-0001'].items()
                       if w not in tame and n.split(' · ')[-1] in {'mammifère', 'oiseau', 'reptile', 'amphibien'}}
    return out


# Codes ISO de territoires, dépendances et régions qui ne sont pas des pays souverains.
TERRITORIES = set('''AS AI AQ AW AX BL BM BQ BV CC CK CW CX EH FK FO GF GG GI GL GP GS GU HK HM IM IO JE KY MF
MO MP MQ MS NC NF NU PF PM PN PR RE SH SJ SX TC TF TK UM VG VI WF YT'''.split())


def dataset_lists(lex):
    """Catégories alimentées par des jeux de données (communes, pays, prénoms, Lexique)."""
    import names
    out = {}
    # Villes de France : communes de plus de 10 000 habitants, avec leur département.
    out['bac-0007'] = {nom: dep for nom, pop, dep in S.communes() if pop >= 10000}
    # Pays : noms officiels en français (ISO 3166).
    out['bac-0002'] = {name: 'pays' for code, name in S.countries().items() if code not in TERRITORIES}
    # Prénoms et noms de famille les plus portés en France.
    out['bac-0003'] = {n: 'prénom' for n in names.top(S.first_names(), 1200)}
    out['bac-0042'] = {n: 'nom de famille' for n in names.top(S.last_names(), 1500)}
    # Verbes et adjectifs courants (Lexique : fréquence ≥ 10 par million de mots).
    out['bac-0040'] = {w: 'v.' for w in lex.lemmas('VER', 10) if w.islower() and ' ' not in w}
    out['bac-0041'] = {w: 'adj.' for w in lex.lemmas('ADJ', 10) if w.islower() and ' ' not in w}
    return out


def by_letter(words):
    letters = collections.defaultdict(list)
    for w, note in sorted(words.items(), key=lambda kv: S.strip_accents(kv[0]).lower()):
        letters[initial(w)].append([w, note])
    return dict(letters)


def main():
    lex = S.Lexique()
    wolf = S.Wolf()
    lists = {**wordnet_lists(lex, wolf), **dataset_lists(lex)}
    result = {cat: by_letter(ws) for cat, ws in lists.items()}
    # Genre des mots des listes rédigées à la main (bac_words/), pour les afficher comme au dictionnaire.
    sys.path.insert(0, str(HERE.parent))
    from bac_words import load
    hand = {w for letters in load().values() for ws in letters.values() for w in ws}
    result['_genders'] = {w: gender(lex, w) for w in sorted(hand) if gender(lex, w)}
    with open(HERE / 'generated.json', 'w') as f:
        json.dump(result, f, ensure_ascii=False, indent=0, sort_keys=True)
    for cat, letters in sorted(result.items()):
        if not cat.startswith('_'):
            print(cat, sum(len(v) for v in letters.values()))


if __name__ == '__main__':
    main()
