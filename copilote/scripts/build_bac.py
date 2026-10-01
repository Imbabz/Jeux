"""Génère src/content/data/bac.json depuis bac_items.ITEMS et les listes de mots de bac_words/.
En alternance, chaque carte demande plusieurs mots : une lettre n'est jouable que si sa liste
compte au moins MIN_WORDS mots, et une catégorie n'est gardée que si elle offre MIN_LETTERS lettres."""
import json, pathlib, sys, unicodedata, re
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from bac_items import ITEMS
from bac_words import load
from fact_check import apply

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
words = load()
kept, dropped = [], []
for item in out:
    lists = words.get(item['id'], {})
    for letter, ws in lists.items():
        wrong = [w for w in ws if letter not in initials(w)]
        if wrong:
            raise SystemExit(f"{item['id']} {letter} : initiale incorrecte pour {wrong}")
    excluded = set(item['excludedLetters'])
    excluded |= {l for l in COMMON if len(lists.get(l, [])) < MIN_WORDS}
    item['excludedLetters'] = sorted(excluded)
    item['words'] = {l: sorted(ws, key=str.lower) for l, ws in sorted(lists.items()) if l not in excluded}
    playable = [l for l in COMMON if l not in excluded]
    (kept if len(playable) >= MIN_LETTERS else dropped).append(item)
path = pathlib.Path(__file__).parent.parent / 'src/content/data/bac.json'
with open(path, 'w') as f:
    f.write('[\n' + ',\n'.join('  ' + json.dumps(x, ensure_ascii=False) for x in kept) + '\n]\n')
from collections import Counter
print(len(kept), Counter(x['difficulty'] for x in kept), Counter(p for x in kept for p in x['packs']))
print('Catégories écartées (pas assez de lettres riches) :', [(x['id'], x['label']) for x in dropped])
