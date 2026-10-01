"""Listes de mots acceptés au Bac Éclair, par catégorie puis par lettre.
Chaque module expose WORDS = {id: bloc}, un bloc contenant une ligne « L: mot, mot, … » par lettre.
Ces listes guident le copilote ; elles ne sont pas strictes (il peut valider un autre mot)."""
import importlib, pathlib

def load():
    out = {}
    # w*.py : premier jet ; s*.py : compléments, fusionnés sans doublon.
    files = sorted(pathlib.Path(__file__).parent.glob('[ws]*.py'))
    for f in files:
        mod = importlib.import_module(f'bac_words.{f.stem}')
        for item_id, block in mod.WORDS.items():
            letters = out.setdefault(item_id, {})
            for line in block.strip().splitlines():
                letter, _, words = line.partition(':')
                # Les annotations « (non…) » marquent un mot écarté à la relecture.
                kept = [
                    w.strip() for w in words.split(',') if w.strip() and '(non' not in w and 'refusé' not in w
                ]
                current = letters.setdefault(letter.strip(), [])
                current.extend(w for w in kept if w.lower() not in {c.lower() for c in current})
    return out
