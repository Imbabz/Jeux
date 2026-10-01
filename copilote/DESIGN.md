# Copilote : Design System et écrans

> **Intention** : l'esthétique d'un grand jeu de quiz de plateau, soigné, coloré et chaleureux. On manipule de vraies **cartes** et de vrais **jetons**. Chaque jeu a sa couleur, la question est une carte, et la révélation est un retournement.
> **Règle n° 1 : une information principale par écran.** Il n'y a pas de voix de synthèse : c'est le **copilote** qui lit l'écran à voix haute. Chaque texte important est donc écrit pour être dit tel quel, en grand, sans abréviation. Aucun élément de marque existant n'est utilisé (pas de camembert, de plateau ni de logo connu).

Source de vérité des tokens : `src/ui/theme/tokens.css` (bloc `@theme` de Tailwind v4, qui génère les utilitaires `bg-bac`, `text-ink-soft`, `font-display`, `shadow-card`…). **Aucune couleur, taille ou durée en dur dans les écrans.**

---

## 1. Tokens

### 1.1 Couleurs : table et encre

| Token | Valeur | Usage |
|---|---|---|
| `table` | `#F7F1E5` | Fond de l'app, avec un grain papier (bruit SVG à 3 %) |
| `card` | `#FFFDF8` | Cartes, touches du numpad, dialogues |
| `ink` | `#1E2230` | Texte, contours, repère de la bonne réponse |
| `ink-soft` | `#646874` ⚠️ | Texte secondaire |
| `line` | `#E4DCCB` | Bordures et séparateurs |
| `neutral` / `neutral-deep` | `#B9B2A3` / `#948C7B` | « Personne », « Pas de réponse » (fond et relief) |

> ⚠️ **Écart au brief** : le brief demandait `#6B6F7B`. Cette valeur ne donne que **4,46:1** sur la table, sous le seuil AA de 4,5:1 pour le texte courant. Je l'ai très légèrement assombrie en `#646874`, qui donne **4,95:1**. La différence est invisible à l'œil.

### 1.2 Couleurs : jeux

| Jeu | Token | Valeur | Relief (`-deep`) | Blanc dessus |
|---|---|---|---|---|
| Bac Éclair | `bac` | `#E5484D` | `#B8373B` | 3,9:1 → **texte ≥ 20 px gras uniquement** |
| Quelle année ? | `year` | `#2F6FEB` | `#2458BD` | 4,6:1 → AA tout texte |
| Estimation | `estim` | `#16A36A` | `#108253` | 3,2:1 → **texte ≥ 20 px gras uniquement** |

**Règle d'accessibilité** : sur `bac` et `estim`, le texte blanc n'est autorisé qu'en taille « grand texte » au sens WCAG (≥ 18,66 px gras ou ≥ 24 px). Le bandeau de carte (20 px, 700), la lettre géante et le titre du RoundIntro respectent cette règle. Aucun petit texte blanc n'est posé sur ces couleurs.

### 1.3 Couleurs : joueurs

| Joueur | Token | Valeur | Relief | Texte dessus | Contraste |
|---|---|---|---|---|---|
| A | `player-a` | `#F2B705` (moutarde) | `#C29204` | `ink` | 8,7:1 |
| B | `player-b` | `#7B4FD6` (violet) | `#5F3CAB` | blanc | 5,3:1 |

Les joueurs ne sont **jamais** distingués par la couleur seule : leur initiale figure toujours dans la pastille, et leur prénom sur les boutons.

### 1.4 Typographie

Polices auto-hébergées via `@fontsource-variable` et précachées pour le hors-ligne :
- **Display** : Fraunces, graisses 700 à 900. Titres, lettre, années, grands nombres, scores et vainqueur.
- **Interface** : Inter, graisses 500 à 700. Chiffres tabulaires (`tabular-nums`) pour les scores et les chronos.

| Token | Taille | Interligne | Usage |
|---|---|---|---|
| `text-xs` | 14 | 20 | Méta, version, labels de pastille |
| `text-sm` | 16 | 24 | Texte courant, boutons secondaires |
| `text-md` | 20 | 28 | Bandeau de carte, boutons principaux, contexte |
| `text-lg` | 26 | 34 | **Énoncés des questions** (Fraunces 700) |
| `text-xl` | 36 | 40 | Titres d'écran, score dans la ScoreBar |
| `text-2xl` | 56 | 60 | **Années et réponses**, chiffre du numpad affiché |
| `text-giant` | 150 | 1 | **Lettre du Bac Éclair**, chiffre du décompte |

Option « Grand texte » (Paramètres) : `text-sm`, `text-md` et `text-lg` passent à 18, 22 et 30 px. Les tailles display ne changent pas, pour préserver la mise en page sans scroll.

### 1.5 Matière

| Token | Valeur | Usage |
|---|---|---|
| `radius-card` | 20 px | Cartes, dialogues |
| `radius-button` | 16 px | Boutons physiques, touches |
| `shadow-card` | `0 8px 24px rgb(30 34 48 / .12)` | Cartes |
| `shadow-token` | `0 2px 4px rgb(30 34 48 / .18)` | Jetons, pions |
| Bordure de carte | 1 px `ink` à 10 % | Cartes |
| Relief de bouton | 4 px en bas, couleur `-deep` | Boutons physiques |

**Grille** : pas de 4 px, marges latérales de 16 px, espacement vertical par défaut de 16 ou 24 px. Zone tactile minimale de **64 px** pendant une manche, 48 px hors manche. Les marges respectent les `safe-area-inset-*`.

### 1.6 Mouvement

| Token | Valeur |
|---|---|
| `ease-out-soft` | `cubic-bezier(.22, 1, .36, 1)` |
| `duration-fast` | 180 ms (appui, apparition) |
| `duration-base` | 250 ms (transitions d'écran) |
| `duration-flip` | 500 ms (retournement de carte) |

| Animation | Description | Réduite (`prefers-reduced-motion`) |
|---|---|---|
| Appui bouton | `translateY(4px)` et relief → 0 | identique (instantané) |
| Flip de carte | `rotateY(180deg)` 500 ms, perspective 1200 px | fondu enchaîné de 150 ms |
| Jeton qui vole | de la carte vers la ScoreBar du gagnant, 400 ms en arc, puis rebond `scale(1.15 → 1)` | apparition directe |
| « +1 » flottant | monte de 24 px et s'efface en 700 ms | affiché 700 ms, sans mouvement |
| Compteur de réponse | défile jusqu'à la valeur en 600 ms | valeur directe |
| Confettis | **fin de partie uniquement**, 1,5 s, couleurs des jeux | aucun |

---

## 2. Icônes

Ce sont des SVG maison géométriques, avec un trait de 2,5 px, des coins et des terminaisons arrondis, sur une grille de 24 px. La couleur est `currentColor`.

| Icône | Dessin |
|---|---|
| **Bac Éclair** | Éclair en zigzag à 3 segments, dans un cercle ouvert |
| **Quelle année ?** | Sablier : deux triangles opposés, un trait de sable |
| **Estimation** | Balance : fléau horizontal, pivot triangulaire, deux plateaux en arc |
| Interface | annuler (flèche courbe), pause, menu (3 points), drapeau (signaler), passer (double chevron) |

---

## 3. Composants

Chaque composant est présenté dans `/styleguide`, dans **tous** ses états.

### 3.1 ScreenShell

Le cadre commun de tous les écrans de jeu, à hauteur fixe de `100dvh`, sans scroll.

```
┌──────────────── 375 ─────────────────┐
│ ScoreBar                       72 px │
├──────────────────────────────────────┤
│                                      │
│          Zone carte (flex-1)         │
│          ≈ 451 px sur 667            │
│                                      │
├──────────────────────────────────────┤
│ Zone d'actions (boutons du jeu)      │ ≈ 80-160 px selon l'état
├──────────────────────────────────────┤
│ ActionBar  ↶ annuler · ⏸ pause · ⋮ menu │ 64 px + safe-area
└──────────────────────────────────────┘
```

Annuler, Pause et Menu sont **toujours au même endroit**, dans l'ActionBar en bas. Passer et Signaler sont des GhostButtons situés **dans** la zone carte, en bas de la carte.

### 3.2 ScoreBar

```
┌──────────────────────────────────────┐
│ (L) Léa  12      Manche 3/6     (T) Tom  9   ⋮ │
│     ●●○              ×2              ●       │
└──────────────────────────────────────┘
```

- **Pastille joueur** : cercle de 36 px à la couleur du joueur avec l'initiale (Inter 700), le prénom (Inter 600, 16 px, tronqué à 10 caractères) et le score (Fraunces 900, 36 px, tabulaire).
- **Jetons** : alignés sous chaque joueur (mini-jetons de 14 px dans la barre, 28 px ailleurs).
- **Centre** : « Manche 3/6 » (14 px, `ink-soft`), et un badge **×2** en dernière manche (pastille `ink`, texte blanc).
- Le **menu** est dans l'ActionBar, en bas à droite : à 375 px, la ScoreBar garde ainsi la place des prénoms.

| État | Rendu |
|---|---|
| normal | comme ci-dessus |
| score qui change | le chiffre fait un rebond `scale(1.2)` sur 180 ms et un « +1 » s'élève |
| meneur | prénom en 700, couleur `ink` |
| dernière manche | badge ×2 visible |
| mort subite | le centre affiche « Mort subite » en `bac` |

### 3.3 Cartes

**QuestionCard** (Année, Estimation)

```
╭──────────────────────────────────╮
│▓▓ ⌛ QUELLE ANNÉE ? ▓▓▓▓▓▓▓▓▓▓▓▓▓▓│  bandeau 56 px, couleur du jeu
│                                  │
│          ( Histoire )            │  PackChip / pastille catégorie
│                                  │
│     La chute du mur de Berlin    │  Fraunces 700, 26 px, centré
│                                  │
│                                  │
│   ⤼ Passer              ⚑        │  GhostButtons
╰──────────────────────────────────╯
```

- Recto : énoncé. Verso : réponse en 56 px, RevealRuler, puis le contexte en 16 px `ink-soft`, en italique.
- États : `recto`, `flipping`, `verso`, `disabled` (opacité .5 en pause) et `skeleton` (chargement : barres `line` animées).

**LetterCard** (Bac Éclair)

```
╭──────────────────────────────────╮
│ ⚡ BAC ÉCLAIR                     │  (carte entièrement rouge)
│                                  │
│           UN ANIMAL              │  Inter 700, 20 px, blanc, majuscules
│          ╭────────╮              │
│        ╱            ╲            │  anneau de chrono, trait 10 px
│       │      B       │           │  Fraunces 900, 150 px, blanc
│        ╲            ╱            │
│          ╰────────╯              │
╰──────────────────────────────────╯
```

| État | Rendu |
|---|---|
| `hidden` | dos de carte rouge à motif d'éclairs ton sur ton, avec « Touchez pour retourner » |
| `countdown` | lettre visible, chiffre « 3/2/1 » en surimpression |
| `running` | anneau blanc qui se vide dans le sens horaire |
| `alert` (≤ 5 s) | anneau `ink`, battement léger de la lettre (scale 1 → 1.04, 1 Hz) |
| `timeout` | lettre à 60 % d'opacité, anneau vide |
| `resolved` | lettre en place, bandeau du gagnant en bas de carte (« Point pour Léa ») |

### 3.4 Boutons

**PlayerButton** : un bouton physique à la couleur du joueur.

```
┌──────────────────┐
│  (L)  Léa        │  64-88 px de haut, relief 4 px -deep
└▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄▄┘
```

| État | Rendu |
|---|---|
| repos | fond plein, relief en bas |
| pressé | translateY(4px), relief à 0, et une vibration de 15 ms |
| désactivé | fond `line`, texte `ink-soft`, sans relief, `aria-disabled` |
| gagnant | anneau `ink` de 3 px et coche |

- **PrimaryButton** : fond `ink`, texte blanc, relief noir. Utilisé pour « Lancer », « Révéler », « Valider » et « Suivant ».
- **NeutralButton** : fond `neutral`, texte `ink`, relief `neutral-deep`. Utilisé pour « Personne » et « Pas de réponse ».
- **GhostButton** : sans fond, texte `ink-soft` avec une icône, zone tactile ≥ 48 px. Utilisé pour Passer, Signaler et Contesté. Contesté a un style ghost à bordure `bac`, avec un compte à rebours circulaire de 3 s.

Tous les boutons sont en Inter 700, 20 px, avec un rayon de 16 px.

### 3.5 Numpad

```
┌──────────────────────────────────┐
│ ▌Léa a dit…                      │  bord gauche 6 px player-a
│ ┌──────────────────────────────┐ │
│ │          1 9 _ _             │ │  Fraunces 900, 56 px
│ └──────────────────────────────┘ │
├──────────────────────────────────┤
│ ┌────┐ ┌────┐ ┌────┐             │
│ │ 1  │ │ 2  │ │ 3  │             │  touches-cartes blanches 64 px
│ └▄▄▄▄┘ └▄▄▄▄┘ └▄▄▄▄┘             │  relief line, chiffres Fraunces
│ ┌────┐ ┌────┐ ┌────┐             │
│ │ 4  │ │ 5  │ │ 6  │             │
│ ┌────┐ ┌────┐ ┌────┐             │
│ │ 7  │ │ 8  │ │ 9  │             │
│ ┌────┐ ┌────┐ ┌────┐             │
│ │ ⌫  │ │ 0  │ │ ✓  │             │  ✓ = Valider (ink)
│ [ Pas de réponse ]               │  NeutralButton
└──────────────────────────────────┘
```

- **Variante Estimation** : la touche « , » remplace une case vide. Une ligne de pastilles **[mille] [million] [milliard]** (exclusives, 48 px) apparaît au-dessus du pavé. L'aperçu est formaté en direct (« 6,5 millions ») et l'unité est rappelée en `ink-soft`.
- **États** : vide (curseur clignotant), en saisie, invalide (secousse de 180 ms, valeur `bac` ; par exemple 0 en Estimation ou moins de 4 chiffres pour une année), valide (✓ actif).

### 3.6 RevealRuler

```
        Tom            Léa
         ▼              ▼                  pions 20 px couleurs joueurs
 ───┼────┼────┼────┼────┃────┼────┼────┼──
  1970      1980      1989      2000
                        ▲
                     ┃ 1989 (repère ink + compteur animé)
       Tom : 9 ans       Léa : 2 ans ✓
```

- **Quelle année ?** : échelle linéaire, fenêtre de ±max(écarts, 10) ans autour de la réponse.
- **Estimation** : échelle **logarithmique** de ÷100 à ×100, avec des graduations ×2, ×10 et ×100. Au-delà, le pion est écrêté au bord, avec une flèche ◀ ou ▶.
- **États** : un pion, deux pions, pions superposés (égalité exacte : décalage vertical de 8 px), « Pas de réponse » (pion fantôme en pointillés à gauche, avec la mention).

### 3.7 Autres composants

| Composant | Description | États |
|---|---|---|
| **TokenChip** (jeton) | Pastille ronde de 28 px à la couleur du jeu, liseré blanc de 2 px, `shadow-token` | normal, mini (14 px), qui vole, vide (contour pointillé `line`) |
| **RoundIntro** | Plein écran à la couleur du jeu, icône géante (120 px, blanche), « Manche 3 » (Inter 700, 20 px), nom du jeu (Fraunces 900, 56 px, blanc) | normal, dernière manche (bandeau « Points doublés ! » en `ink`), mort subite |
| **GameTile** | Carte blanche avec bandeau de couleur, icône, nom et « 42 questions » | activée (coche, bordure de la couleur du jeu), désactivée par l'utilisateur, indisponible (grisée + raison) |
| **PackChip** | Pilule blanche avec emoji, nom et compteurs (« ⚡30 ⌛42 ⚖35 ») | sélectionnée (fond `ink`, texte blanc), non sélectionnée, vide (compteurs à 0, grisée) |
| **SegmentedControl** | 3 options (Facile / Mixte / Difficile ; préréglages) | sélectionné, repos, désactivé |
| **Toggle** | Interrupteur de 52 × 32 px | on (`ink`), off (`line`), désactivé |
| **Toast** | Carte blanche en bas, au-dessus de l'ActionBar, icône et une ligne de texte, 3 s | info, erreur (bordure gauche `bac`) |
| **ConfirmDialog** | Carte centrée sur un voile `ink` à 40 %, titre Fraunces, deux boutons | normal, destructif (bouton `bac`) |
| **Sheet** (menu) | Panneau qui monte du bas, cartes de menu empilées | ouvert, fermé |

---

## 4. Écrans

Tous les schémas représentent **375 × 667**. Une ligne ASCII fait environ 16 px.

### 4.1 Accueil

```
┌──────────────────────────────────────┐
│                                      │
│              ● ● ●                   │  3 jetons décoratifs (bac/year/estim)
│                                      │
│            Copilote                  │  Fraunces 900, 56 px
│   Le quiz oral à deux pour la route  │  Inter 500, 20 px, ink-soft
│                                      │
│  ┌────────────────────────────────┐  │
│  │  ▶  Reprendre la partie        │  │  PrimaryButton (si partie en cours)
│  │     Léa 12 – 9 Tom · manche 4  │  │
│  └────────────────────────────────┘  │
│  ┌────────────────────────────────┐  │
│  │           Jouer                │  │  PrimaryButton (ou secondaire si Reprendre)
│  └────────────────────────────────┘  │
│  ┌──────────┐┌──────────┐┌─────────┐ │
│  │ Palmarès ││  Règles  ││Réglages │ │  cartes blanches 64 px
│  └──────────┘└──────────┘└─────────┘ │
│                                      │
│               v0.2.0                 │  14 px, 5 taps → debug
└──────────────────────────────────────┘
```

**États** : sans partie en cours (« Jouer » principal) ; avec partie en cours ; mode debug (badge « DEBUG » `ink` en haut à droite).

### 4.2 Configuration

L'écran défile (il est hors manche). Le bouton « Lancer » est collé en bas.

```
┌──────────────────────────────────────┐
│ ←  Nouvelle partie                   │
│ ╭ Joueurs ───────────────────────╮   │
│ │ (L) [ Léa         ] 🚗 conduit │   │  input + case conducteur
│ │ (T) [ Tom         ] 🚗         │   │
│ ╰────────────────────────────────╯   │
│ ╭ Jeux ──────────────────────────╮   │
│ │ [⚡ Bac ✓][⌛ Année ✓][⚖ Estim ✓]│   │  GameTiles
│ ╰────────────────────────────────╯   │
│ ╭ Packs ─────────────────────────╮   │
│ │ (🌍 Général ⚡40 ⌛60 ⚖50) (🏴 Écosse…) │  PackChips, retour à la ligne
│ ╰────────────────────────────────╯   │
│ ╭ Difficulté ────────────────────╮   │
│ │ [ Facile | ▓Mixte▓ | Difficile ]│   │
│ ╰────────────────────────────────╯   │
│ ╭ Format ────────────────────────╮   │
│ │ [Express|▓Classique▓|Longue]   │   │
│ │ 6 manches × 5 questions · ~25 min │
│ ╰────────────────────────────────╯   │
│ ┌────────────────────────────────┐   │
│ │            Lancer ▶            │   │  PrimaryButton collé en bas
│ └────────────────────────────────┘   │
└──────────────────────────────────────┘
```

**États** :
- prénoms vides : placeholder « Joueur 1 » ;
- prénoms identiques : message d'erreur sous les champs ;
- jeu indisponible : GameTile grisée avec « pas assez de questions dans ces packs » ;
- aucun pack ou aucun jeu : « Lancer » inactif, avec la raison ;

### 4.3 Ouverture

C'est une carte « titre » centrée : « Léa contre Tom », le palmarès de la paire (« Au général : Léa 4 – 3 Tom ») et un bouton « C'est parti ! ».

### 4.4 RoundIntro

```
┌──────────────────────────────────────┐
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
│▓▓▓▓▓▓▓▓▓▓▓▓▓  (icône ⌛ 120 px) ▓▓▓▓▓▓│  plein écran year
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓ MANCHE 3 ▓▓▓▓▓▓▓▓▓▓▓▓▓│  Inter 700 20 px blanc
│▓▓▓▓▓▓▓▓▓▓▓ Quelle année ? ▓▓▓▓▓▓▓▓▓▓▓│  Fraunces 900 56 px blanc
│▓▓▓▓▓▓▓▓▓▓▓ Léa 12 – 9 Tom ▓▓▓▓▓▓▓▓▓▓▓│  Inter 600 20 px blanc
│▓▓▓▓▓▓▓▓▓▓ [ POINTS DOUBLÉS ] ▓▓▓▓▓▓▓▓│  (dernière manche seulement)
│▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓▓│
└──────────────────────────────────────┘
```

Le copilote lit l'écran ; un tap lance la manche. Il n'y a pas d'avance automatique : l'intro attend que la lecture soit finie.

### 4.5 Bac Éclair

```
countdown / running                     timeout                      resolved
┌──────────────────────────┐ ┌──────────────────────────┐ ┌──────────────────────────┐
│ (L)Léa 3   M2/6   (T)Tom 2│ │ (L)Léa 3   M2/6   (T)Tom 2│ │ (L)Léa 4 +1 M2/6 (T)Tom 2 │
│ ╭──────────────────────╮ │ │ ╭──────────────────────╮ │ │ ╭──────────────────────╮ │
│ │⚡ BAC ÉCLAIR          │ │ │ │      UN ANIMAL       │ │ │ │      UN ANIMAL       │ │
│ │     UN ANIMAL        │ │ │ │       ( B )          │ │ │ │        B             │ │
│ │    ╭──────╮          │ │ │ │   Temps écoulé !     │ │ │ │ ▓ Point pour Léa ▓   │ │
│ │   (   B    ) ◔ 9 s   │ │ │ ╰──────────────────────╯ │ │ ╰──────────────────────╯ │
│ │    ╰──────╯          │ │ │                          │ │ (◔ Contesté)  [Suivant] │
│ │ ⤼ Passer         ⚑   │ │ │ [(L) Léa ][(T) Tom ]     │ │                          │
│ ╰──────────────────────╯ │ │ [      Personne       ]  │ │                          │
│ [(L) Léa  ][(T) Tom   ]  │ │                          │ │                          │
│ [     Ensemble !      ]  │ │                          │ │                          │
│      ↶          ⏸        │ │      ↶          ⏸        │ │      ↶          ⏸        │
└──────────────────────────┘ └──────────────────────────┘ └──────────────────────────┘
```

- Les **PlayerButtons font 88 px** de haut, côte à côte (2 × 165 px avec un espace de 12 px). « Ensemble ! » est un NeutralButton de 64 px, pleine largeur.
- En `announce` et `countdown`, les trois boutons sont visibles mais **désactivés**, ce qui évite un saut de mise en page.
- **Budget vertical** : ScoreBar 72 + carte 340 + boutons 88 + 12 + 64 + ActionBar 64, soit 640 ≤ 667. ✅

### 4.6 Quelle année ? et Estimation : question

C'est la QuestionCard recto, aussi haute que possible. L'énoncé est en Fraunces 700, 26 px, pour que le copilote le lise d'un coup d'œil.

- `read` : un PrimaryButton **[C'est lu ▶]** de 72 px sous la carte.
- `think` : une jauge fine à la couleur du jeu se vide sous l'énoncé. La carte affiche « Prêts ? Touchez pour lancer le décompte ».
- `countdown` : le chiffre géant « 3 · 2 · 1 » (150 px) se superpose à la carte, puis « Annoncez ! » (Fraunces 900, 56 px) apparaît pendant 600 ms.

### 4.7 Saisie (A puis B)

C'est la carte Numpad (§3.5), qui remplace la zone carte. Un petit rappel de l'énoncé apparaît en haut (16 px, `ink-soft`, une ligne tronquée).
- **Budget** : ScoreBar 72 + rappel 28 + affichage 96 + 4 × 64 + 3 × 8 + Pas de réponse 56 + ActionBar 64 = 596. ✅
- **Variante Estimation** : la ligne de multiplicateurs (48) s'ajoute et les touches passent à 56 px, soit 4 × 56 + 48 + … = 620. ✅

### 4.8 Révélation

```
┌──────────────────────────────────────┐
│ (L) Léa 14 +2      M3/6      (T) Tom 9│
│ ╭──────────────────────────────────╮ │
│ │▓▓ ⌛ QUELLE ANNÉE ? ▓▓▓▓▓▓▓▓▓▓▓▓▓▓│ │  verso
│ │   La chute du mur de Berlin      │ │  rappel 16 px
│ │             1989                 │ │  Fraunces 900 56 px
│ │  ──┼───┼──Tom▼──┼──Léa▼┃───┼──    │ │  RevealRuler
│ │   Tom : 9 ans     Léa : exact ✓  │ │
│ │  « Le mur est tombé presque par  │ │  contexte 16 px italique
│ │    accident… »                   │ │
│ │                            ⚑     │ │
│ ╰──────────────────────────────────╯ │
│ ┌──────────────────────────────────┐ │
│ │            Suivant ▶             │ │
│ └──────────────────────────────────┘ │
│        ↶               ⏸             │
└──────────────────────────────────────┘
```

L'état `ready` (avant le tap) montre le recto en version compacte, puis les **deux propositions en grand** : deux cartouches aux couleurs des joueurs, avec le prénom et l'année en Fraunces 900, 36 px. Le copilote les relit avant de toucher le PrimaryButton **[Révéler]** de 72 px.

Après la révélation, la ScoreBar met à jour le score avec un rebond, et une ligne « Léa 14 – 9 Tom » en Fraunces 700, 26 px, apparaît sous la réglette, prête à être lue.

### 4.9 Fin de manche

```
┌──────────────────────────────────────┐
│           Fin de la manche 3         │  Fraunces 700 36 px
│  ╭────────────────╮╭────────────────╮│
│  │ (L) Léa        ││ (T) Tom        ││
│  │      +4        ││      +2        ││  Fraunces 900 56 px
│  ╰────────────────╯╰────────────────╯│
│        Léa remporte la manche        │
│                 ⌛                    │  jeton bleu qui vole vers Léa
│        Total : Léa 14 – 9 Tom        │
│  ┌────────────────────────────────┐  │
│  │          Continuer ▶           │  │
│  └────────────────────────────────┘  │
└──────────────────────────────────────┘
```

**Égalité** : deux jetons s'envolent, un vers chaque joueur.

### 4.10 Mort subite (intro)

Comme le RoundIntro, mais sur un fond `ink`. Le texte « Mort subite » est en Fraunces 900, 56 px, en `bac`, et le sous-titre dit « Le plus proche gagne la partie ».

### 4.11 Fin de partie

```
┌──────────────────────────────────────┐
│ ✦  ✧   ✦  confettis 1,5 s   ✧  ✦     │
│            Léa gagne !               │  Fraunces 900 56 px
│               21 – 15                │
│        ┌──────────┐                  │
│        │  (L) Léa │                  │  marche haute player-a
│        │  ●●●●    │┌──────────┐      │  jetons gagnés
│        │          ││ (T) Tom  │      │  marche basse player-b
│        │    1     ││ ●●   2   │      │
│        └──────────┘└──────────┘      │
│  ⚡ Bac  Léa 6 – 4   ⌛ Année 8 – 6    │  récap par jeu (3 lignes)
│  ⚖ Estim 7 – 5                        │
│  Palmarès : Léa 5 – 3 Tom · série 2  │
│  [  Revanche  ]   [  Accueil  ]      │
└──────────────────────────────────────┘
```

**États** : victoire normale ; victoire en mort subite (mention « en mort subite ») ; abandon (pas d'écran de fin, retour à l'accueil).

### 4.12 Palmarès

C'est une liste de cartes, une par paire de prénoms : les deux pastilles, les victoires « 5 – 3 », la série en cours, la meilleure série, les réponses exactes et les jetons par jeu (3 colonnes de jetons). Un bouton « Réinitialiser » ouvre un ConfirmDialog destructif.

**État vide** : une illustration de 3 jetons en pointillés et le texte « Aucune partie terminée pour l'instant. La route est longue ! »

### 4.13 Règles

Les cartes suivantes défilent :
- une carte « Règles d'or » (fond `ink`, texte blanc) ;
- une carte par jeu (bandeau de couleur, la règle en une phrase, un exemple) ;
- une carte « Scoring » sous forme de tableau simplifié ;
- une carte « Dernière manche et mort subite ».

### 4.14 Paramètres

Une liste groupée en cartes : Sons et vibrations, Chronos, Déroulement, Bac Éclair, Règles de score, Questions vues, Affichage. Chaque ligne fait 56 px et porte un Toggle ou un SegmentedControl. Le bouton « Tester les bips » joue la séquence du décompte.

**États** : audio bloqué (message « Activez le son du téléphone pour entendre les bips »).

### 4.15 Menu en jeu (Sheet)

Il propose Reprendre, Règles, Paramètres, et Abandonner la partie (destructif, avec ConfirmDialog). **Ouvrir le menu met le jeu en pause.**

### 4.16 Debug

Le style est volontairement **neutre et technique** : fond blanc, police système monospace 13 px, aucune ombre, sections repliables. On y trouve :
- l'overlay flottant (seed, manche, jeu, état, scores, jetons, nombre d'événements, item et réponse) ;
- les actions ;
- les données ;
- les statistiques de contenu (tableau jeu × pack × difficulté) ;
- le journal ;
- l'export et l'import.

### 4.17 Erreur (ErrorBoundary)

C'est une carte centrée : « Oups, la carte s'est envolée. », un PrimaryButton « Reprendre » et un GhostButton « Copier le rapport ».

---

## 5. Exigences de finition (checklist de chaque point d'arrêt)

- [ ] Aucune couleur, taille ni durée en dur hors des tokens (vérification par grep sur `#[0-9a-f]{3,6}` et `px` dans `src/ui/screens`).
- [ ] Aucun scroll pendant une manche à 375 × 667 (test Playwright : `scrollHeight ≤ innerHeight`).
- [ ] Zones tactiles ≥ 64 px en manche.
- [ ] Contraste AA (§1.2 et §1.3).
- [ ] États vide, chargement, erreur et désactivé présents dans `/styleguide`.
- [ ] Captures Playwright 375 × 667 relues : alignements, espacements, hiérarchie, cohérence.
- [ ] `prefers-reduced-motion` respecté.
