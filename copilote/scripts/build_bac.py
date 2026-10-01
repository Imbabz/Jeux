"""Génère src/content/data/bac.json depuis bac_items.ITEMS et les listes de mots de bac_words/.
En alternance, chaque carte demande plusieurs mots : une lettre n'est jouable que si sa liste
compte au moins MIN_WORDS mots, et une catégorie n'est gardée que si elle offre MIN_LETTERS lettres."""
import json, pathlib, sys, unicodedata, re
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from bac_items import ITEMS
from bac_words import load
from fact_check import apply
from bac_review import REMOVED, RENAMED

COMMON = 'ABCDEFGHIJLMNOPRSTUV'
MIN_WORDS = 3
MIN_LETTERS = 8

def initials(word):
    """Initiale(s) acceptée(s) : celle du mot, ou celle qui suit un article (« La Rochelle » → L ou R)."""
    out = {unicodedata.normalize('NFD', word[0])[0].upper()}
    rest = re.sub(r"^(le |la |les |l'|l’|the )", '', word, flags=re.I)
    out.add(unicodedata.normalize('NFD', rest[0])[0].upper())
    if word[:1].lower() == 'œ':
        out.add('O')
    return out

out = [{"id": f"bac-{i + 1:04d}", "packs": packs, "label": label, "difficulty": d, "excludedLetters": ex}
       for i, (packs, label, d, ex) in enumerate(ITEMS)]
out = apply(out)
hand = load()
generated = json.load(open(pathlib.Path(__file__).parent / 'dictionary' / 'generated.json'))
genders = generated.get('_genders', {})


def plain(word):
    return ''.join(c for c in unicodedata.normalize('NFD', word.lower()) if unicodedata.category(c) != 'Mn')


def merged(item_id):
    """Fusionne la liste relue à la main et la liste extraite des ressources (sans doublon)."""
    letters = {}
    for letter, entries in generated.get(item_id, {}).items():
        letters.setdefault(letter, {})
        for word, note in entries:
            letters[letter].setdefault(plain(word), [word, note])
    for letter, ws in hand.get(item_id, {}).items():
        letters.setdefault(letter, {})
        for word in ws:
            letters[letter].setdefault(plain(word), [word, genders.get(word, '')])
    removed = {plain(w) for w in REMOVED.get(item_id, [])}
    renamed = {plain(a): b for a, b in RENAMED.get(item_id, {}).items()}
    found = set()
    for letter, entries in list(letters.items()):
        for key in list(entries):
            if key in removed:
                found.add(key)
                del entries[key]
            elif key in renamed:
                found.add(key)
                word, note = entries.pop(key)
                new = renamed[key]
                # Reste sous la même lettre si l'initiale le permet, sinon passe sous la sienne.
                target = letter if letter in initials(new) else min(initials(new))
                letters.setdefault(target, {}).setdefault(plain(new), [new, note])
    stale = (removed | set(renamed)) - found
    if stale:
        raise SystemExit(f"{item_id} : relecture obsolète, mots introuvables {sorted(stale)}")
    return {l: sorted(e.values(), key=lambda x: plain(x[0])) for l, e in letters.items()}


kept, dropped, dictionary = [], [], {}
for item in out:
    lists = merged(item['id'])
    for letter, entries in lists.items():
        wrong = [w for w, _ in entries if letter not in initials(w)]
        if wrong:
            raise SystemExit(f"{item['id']} {letter} : initiale incorrecte pour {wrong}")
    excluded = set(item['excludedLetters'])
    excluded |= {l for l in COMMON if len(lists.get(l, [])) < MIN_WORDS}
    item['excludedLetters'] = sorted(excluded)
    playable = [l for l in COMMON if l not in excluded]
    if len(playable) >= MIN_LETTERS:
        kept.append(item)
        dictionary[item['id']] = {l: e for l, e in sorted(lists.items()) if l not in excluded}
    else:
        dropped.append(item)
data = pathlib.Path(__file__).parent.parent / 'src/content/data'
with open(data / 'bac.json', 'w') as f:
    f.write('[\n' + ',\n'.join('  ' + json.dumps(x, ensure_ascii=False) for x in kept) + '\n]\n')
with open(data / 'bac-dictionary.json', 'w') as f:
    json.dump(dictionary, f, ensure_ascii=False, separators=(',', ':'))
from collections import Counter
print(len(kept), Counter(x['difficulty'] for x in kept), Counter(p for x in kept for p in x['packs']))
print('Entrées du dictionnaire :', sum(len(e) for d in dictionary.values() for e in d.values()))
print('Catégories écartées (pas assez de lettres riches) :', [(x['id'], x['label']) for x in dropped])
