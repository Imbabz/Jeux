"""Génère src/content/data/bac.json depuis bac_items.ITEMS."""
import json, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from bac_items import ITEMS
out = [{"id": f"bac-{i + 1:04d}", "packs": packs, "label": label, "difficulty": d, "excludedLetters": ex}
       for i, (packs, label, d, ex) in enumerate(ITEMS)]
path = pathlib.Path(__file__).parent.parent / 'src/content/data/bac.json'
with open(path, 'w') as f:
    f.write('[\n' + ',\n'.join('  ' + json.dumps(x, ensure_ascii=False) for x in out) + '\n]\n')
from collections import Counter
print(len(out), Counter(x['difficulty'] for x in out), Counter(p for x in out for p in x['packs']))
