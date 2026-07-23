# Farland MJ — Compagnon de jeu de rôle

Application web pour **maîtriser des aventures du Monde de Farland** (cadre de
campagne gratuit compatible D&D 5e — [farlandworld.com](http://farlandworld.com)).

Elle est pensée pour **jouer à deux, y compris en voiture** : une personne fait le
Maître du Jeu (MJ), lit les passages à voix haute et décrit le monde ; l'autre
incarne le héros. Tout tient dans une seule main sur téléphone.

## À quoi ça sert

- 📖 **Aventure** — Lecteur de scénarios pas à pas. Chaque scène affiche d'abord le
  **texte à lire à voix haute** (encadré bleu), puis les **notes secrètes du MJ**
  (mécaniques, DD, tactiques, butin), et propose les **choix / suites possibles**.
  Navigation par boutons + menu « Scènes » pour sauter n'importe où. La progression
  est mémorisée automatiquement.
- 🎲 **Dés** — d20 avec modificateur et avantage/désavantage, tous les dés
  (d4→d100), lancers personnalisés (`2d6+3`…), détection des 20/1 naturels, et
  historique des jets.
- 🛡️ **Persos** — Fiches prêtes à jouer (5 pré-tirées, saveur Farland). Touchez une
  caractéristique ou une attaque pour **lancer directement le d20 correspondant**.
  Création de personnages personnalisés (sauvegardés dans le navigateur).
- 👹 **Bestiaire** — Toutes les créatures et PNJ des aventures, avec recherche et
  filtres. Stat blocks complets ; les créatures « Monster Manual » sont fournies
  via le SRD 5.1 pour rendre l'app autonome.
- 🌍 **Univers** — Le lore de Farland : les 7 Seigneurs du Péché, les royaumes de
  Daven et Zeland, le panthéon (dieux bons/neutres/mauvais), les peuples, les
  langues, et la particularité de la **monnaie à l'étalon argent**.

## Aventures incluses

1. **Ce qui se cache à l'intérieur** — Royaume de Daven, village d'Eichen
   (personnages niveau 2). Disparitions, culte de Grlarshh et Reine Vargouille.
2. **Les Tours de la Nuit** — Royaume de Zeland, la Plaine des Batailles
   (personnages niveau 1). Un nécromancien et un hobgobelin profanent les
   Tours de l'Attente.

## Utilisation

Aucune installation, aucune dépendance, **100 % hors-ligne** une fois chargée.

- **En local** : ouvrez `index.html`. Pour activer le mode hors-ligne complet
  (service worker) et l'installation « appli », servez le dossier via HTTP :
  ```bash
  cd jeu
  python3 -m http.server 8000    # puis http://localhost:8000
  ```
- **Sur téléphone (recommandé pour la voiture)** : hébergez le dossier `jeu/`
  sur n'importe quel hébergement statique (GitHub Pages, Netlify…), ouvrez-le
  dans le navigateur, puis « Ajouter à l'écran d'accueil ». L'application se
  lance ensuite en plein écran et fonctionne **sans réseau**.

## Structure

```
jeu/
├── index.html              Coquille + onglets + enregistrement du service worker
├── manifest.webmanifest    Métadonnées PWA (installation, icône, thème)
├── sw.js                   Service worker (cache hors-ligne, cache-first)
├── css/style.css           Thème sombre, mobile-first, grosses cibles tactiles
├── icons/                  Icônes SVG (normale + maskable)
└── js/
    ├── dice.js             Moteur de dés (d20, avantage, expressions NdX±M)
    ├── app.js              Routeur d'onglets + rendu de toutes les vues
    └── data/
        ├── lore.js         Univers de Farland
        ├── bestiary.js     Créatures & PNJ (Farland + SRD 5.1)
        ├── scenarios.js    Les 2 aventures en scènes navigables
        └── characters.js   Fiches pré-tirées
```

## Étendre le jeu

- **Nouvelle aventure** : ajoutez un objet dans `js/data/scenarios.js` (mêmes
  champs `scenes[]` : `lecture[]`, `mj[]`, `monstres[]`, `tresor[]`, `choix[]`).
- **Nouveau monstre** : ajoutez une entrée dans `js/data/bestiary.js` et
  référencez son `id` dans une scène.
- Pensez à ajouter les nouveaux fichiers à la liste `ASSETS` de `sw.js`.

## Crédits & licence du contenu

Les aventures et l'univers proviennent du **World of Farland** (S. Baker,
Martin McKenzie, Don Knight ; © 2015, farlandworld.com), un cadre gratuit et
non commercial. Les statistiques de créatures génériques utilisent le **SRD 5.1**
(OGL / Creative Commons). *Dungeons & Dragons* et *D&D 5e* sont des propriétés
de Wizards of the Coast. Ce projet est un outil de table non commercial, résumant
et mettant en forme ce contenu pour l'usage d'un MJ.
