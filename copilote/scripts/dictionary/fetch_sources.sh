#!/usr/bin/env bash
# Télécharge les ressources lexicales libres utilisées par build_dictionary.py dans .cache/ (non versionné).
# - WOLF (WordNet Libre du Français, CeCILL-C) via Open Multilingual Wordnet 1.4, et Princeton WordNet 3.0
#   (dépôt nltk_data) : la classification (« un merle est un oiseau »).
# - Lexique 3.83 (New & Pallier, CC BY-SA 4.0) via le paquet PyPI pylexique : genre, nature, fréquence.
# - @etalab/decoupage-administratif (Licence Ouverte) : communes de France et populations.
# - i18n-iso-countries (MIT) : noms des pays en français.
# - @socialgouv/match-entities (Apache-2.0) : prénoms de la base INSEE / data.gouv.fr.
# - @datagica/parse-positions : intitulés de métiers en français.
set -euo pipefail
cd "$(dirname "$0")"
mkdir -p .cache && cd .cache
NLTK=https://raw.githubusercontent.com/nltk/nltk_data/gh-pages/packages/corpora
[ -f wordnet.zip ] || curl -sSfLO "$NLTK/wordnet.zip"
[ -f omw-1.4.zip ] || curl -sSfLO "$NLTK/omw-1.4.zip"
[ -d corpora/wordnet ] || (mkdir -p corpora && unzip -q wordnet.zip -d corpora)
[ -d omw-1.4 ] || unzip -q omw-1.4.zip
if [ ! -f Lexique383.txt ]; then
  pip download --no-deps -q pylexique==1.5.1 -d .
  unzip -q -o -j pylexique-1.5.1-py3-none-any.whl 'pylexique/Lexique383/Lexique383.txt'
fi
for pkg in @etalab/decoupage-administratif@6.0.0 i18n-iso-countries@7.14.0 @socialgouv/match-entities@1.1.18 @datagica/parse-positions@0.0.0; do
  dir="npm/$(echo "$pkg" | sed 's/@[^@]*$//; s#[@/]#_#g')"
  if [ ! -d "$dir" ]; then
    mkdir -p "$dir"
    (cd "$dir" && npm pack -q "$pkg" >/dev/null && tar xzf ./*.tgz)
  fi
done
echo "Sources prêtes dans $(pwd)"
