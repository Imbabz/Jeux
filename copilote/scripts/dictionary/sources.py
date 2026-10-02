"""Accès aux ressources téléchargées par fetch_sources.sh (dossier .cache/)."""
import collections, json, pathlib, re, unicodedata

CACHE = pathlib.Path(__file__).parent / '.cache'


def strip_accents(s):
    return ''.join(c for c in unicodedata.normalize('NFD', s) if unicodedata.category(c) != 'Mn')


class Lexique:
    """Lexique 3.83 : pour chaque lemme, sa nature (NOM, VER, ADJ…), son genre et sa fréquence."""

    def __init__(self):
        self.entries = collections.defaultdict(dict)  # lemme → cgram → {genre, freq}
        with open(CACHE / 'Lexique383.txt', encoding='latin-1') as f:
            next(f)
            for line in f:
                c = line.rstrip('\n').split('\t')
                ortho, lemme, cgram, genre = c[0], c[2], c[3], c[4]
                if ortho != lemme:
                    continue
                freq = float(c[6].replace(',', '.')) + float(c[7].replace(',', '.'))
                cur = self.entries[lemme].get(cgram)
                if cur is None or freq > cur['freq']:
                    self.entries[lemme][cgram] = {'genre': genre, 'freq': freq}

    def get(self, word, cgram):
        return self.entries.get(word, {}).get(cgram)

    def lemmas(self, cgram, min_freq):
        return {w: e[cgram]['freq'] for w, e in self.entries.items() if cgram in e and e[cgram]['freq'] >= min_freq}


class Wolf:
    """WordNet Libre du Français aligné sur Princeton WordNet 3.0 (via NLTK)."""

    def __init__(self):
        import nltk
        nltk.data.path.insert(0, str(CACHE))
        from nltk.corpus import wordnet as wn
        self.wn = wn
        self.fr = collections.defaultdict(set)
        with open(CACHE / 'omw-1.4' / 'fra' / 'wn-data-fra.tab', encoding='utf-8') as f:
            for line in f:
                p = line.rstrip('\n').split('\t')
                if len(p) == 3 and p[1] == 'fra:lemma':
                    self.fr[p[0]].add(p[2].replace('_', ' ').strip())

    def lemmas(self, synset):
        return self.fr.get(f'{synset.offset():08d}-{synset.pos()}', set())

    def closure(self, name, instances=True):
        root = self.wn.synset(name)
        rel = (lambda s: s.hyponyms() + s.instance_hyponyms()) if instances else (lambda s: s.hyponyms())
        return [root, *root.closure(rel)]


def communes():
    path = CACHE / 'npm' / '_etalab_decoupage-administratif' / 'package' / 'data'
    deps = {d['code']: d['nom'] for d in json.load(open(path / 'departements.json'))}
    out = []
    for c in json.load(open(path / 'communes.json')):
        if c.get('type') == 'commune-actuelle' and c.get('population'):
            out.append((c['nom'], c['population'], deps.get(c['departement'], '')))
    return out


def countries():
    data = json.load(open(CACHE / 'npm' / 'i18n-iso-countries' / 'package' / 'langs' / 'fr.json'))
    out = {}
    for code, names in data['countries'].items():
        out[code] = names if isinstance(names, str) else names[0]
    return out


def _socialgouv(name):
    s = open(CACHE / 'npm' / '_socialgouv_match-entities' / 'package' / 'dist' / 'index.mjs', encoding='utf-8').read()
    start = s.index(f'// data/{name}.json')
    end = s.index('];', start)
    return [(m.group(1), float(m.group(2))) for m in re.finditer(r'value: "([^"]+)",\s*freq: ([0-9.e-]+)', s[start:end])]


def first_names():
    return _socialgouv('prenoms')


def last_names():
    return _socialgouv('noms')


def job_titles():
    s = open(CACHE / 'npm' / '_datagica_parse-positions' / 'package' / 'lib' / 'positions.js', encoding='utf-8').read()
    out = []
    for m in re.finditer(r'"label": \{\s*"fr": "([^"]+)"', s):
        out.append(m.group(1))
    return out
