"""Régénère src/content/data/year.json : 30 items d'origine + year_extra.ITEMS, difficultés de year_levels."""
import json, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from year_extra import ITEMS
from year_levels import D1, D2

path = pathlib.Path(__file__).parent.parent / 'src/content/data/year.json'
base = json.load(open(path))[:30]
for i, (packs, cat, text, year, _d, ctx) in enumerate(ITEMS):
    d = 1 if i in D1 else 2 if i in D2 else 3
    base.append({"id": f"yr-{31 + i:04d}", "packs": packs, "category": cat, "text": text, "year": year,
                 "centuryHint": str(year)[:2], "difficulty": d, "context": ctx})
with open(path, 'w') as f:
    f.write('[\n' + ',\n'.join('  ' + json.dumps(x, ensure_ascii=False) for x in base) + '\n]\n')
from collections import Counter
print(len(base), Counter(x['difficulty'] for x in base), Counter(p for x in base for p in x['packs']))
