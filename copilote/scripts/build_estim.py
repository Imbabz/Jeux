"""Génère src/content/data/estim.json depuis estim_items.ITEMS, avec les niveaux ci-dessous.
1 = la plupart des adultes ont une idée ; 3 = pour experts ou franchement surprenant ; le reste vaut 2."""
import json, pathlib, sys
sys.path.insert(0, str(pathlib.Path(__file__).parent))
from estim_items import ITEMS

D1 = {0, 1, 2, 11, 12, 15, 17, 29, 33, 42, 47, 51, 52, 53, 55, 57, 65, 69, 75, 78, 89, 106, 118, 120, 122, 126,
      132, 133, 138, 144, 145, 150, 152, 157, 158, 159, 161, 162, 163, 164, 167, 172, 178, 182, 189, 190, 194,
      198, 199}
D3 = {5, 8, 13, 21, 28, 31, 43, 48, 58, 60, 63, 72, 76, 80, 81, 83, 84, 85, 87, 94, 97, 100, 103, 110, 111,
      112, 113, 114, 125, 143, 168, 176, 179, 183, 193, 195, 201, 202}

out = []
for i, (packs, question, unit, answer, _d, ctx, ref) in enumerate(ITEMS):
    item = {"id": f"est-{i + 1:04d}", "packs": packs, "question": question, "unit": unit, "answer": answer,
            "difficulty": 1 if i in D1 else 3 if i in D3 else 2, "context": ctx}
    if ref:
        item["referenceYear"] = ref
    out.append(item)
path = pathlib.Path(__file__).parent.parent / 'src/content/data/estim.json'
from fact_check import apply
out = apply(out)
with open(path, 'w') as f:
    f.write('[\n' + ',\n'.join('  ' + json.dumps(x, ensure_ascii=False) for x in out) + '\n]\n')
from collections import Counter
print(len(out), Counter(x['difficulty'] for x in out), Counter(p for x in out for p in x['packs']))
