# Copilote : Game Design

> Document de référence des règles et du moteur. Tout ce qui est décrit ici est codé dans `src/engine` (logique pure) et seulement **affiché** par `src/ui`.
>
> **Légende** : ✅ décision validée · 🎲 réglage par défaut, à revoir en jouant · 💡 proposition hors cahier des charges.

## Journal des décisions

| # | Sujet | Décision |
|---|---|---|
| D0 | **Voix de synthèse** | ✅ **Supprimée.** C'est le **copilote** (le passager) qui lit tout à voix haute. L'app est le paquet de cartes, le chrono, les bips et le tableau des scores. |
| D1 | Les événements portent les items tirés et leurs réponses (§6.2) | ✅ |
| D2 | Annuler retire aussi les saisies (§6.4) | ✅ |
| D3 | Plafond de 3 rejeux par tour de Bac Éclair (§7.2) | 🎲 réglage par défaut, à revoir en jouant |
| D4 | Années comprises entre 1000 et 2025 en v1 (§8.2) | ✅ |
| D5 | Courbes de difficulté pour Q = 3 et Q = 7 (§4.3) | ✅ |
| D6 | Seuil de 10 lettres pour les catégories Écosse et Belgique du Bac Éclair (CONTENT_GUIDE §6) | 🎲 réglage par défaut, à revoir en jouant |
| D7 | Texte secondaire `#646874`, pour le contraste AA (DESIGN §1.1) | ✅ |
| A | Le score est mis en évidence après chaque point, pour que le copilote l'annonce | ✅ adapté sans voix (§17) |
| B | Les deux propositions sont affichées en grand avant la révélation | ✅ adapté sans voix (§17) |
| C | Temps de grâce pour le conducteur au Bac Éclair | 🎲 non en v1, à revoir en jouant |

---

## 1. Intention

**Copilote transforme un trajet en voiture en jeu de quiz.** Il réunit deux joueurs autour d'un seul téléphone, sans que le conducteur ne regarde jamais l'écran. Le **copilote** tient le téléphone : il lit les cartes à voix haute, arbitre… et joue. L'app tire les cartes, chronomètre, bipe, compte les points et garde les réponses secrètes jusqu'au bon moment.

| Pilier | Ce que ça implique |
|---|---|
| **Un écran fait pour être lu à voix haute** | Une seule information principale à la fois, en grand, formulée pour se dire telle quelle. Les signaux de rythme (décompte, fin de chrono) passent par des **bips** que le conducteur entend. |
| **Équité sans soupçon** | Le copilote joue aussi. Il ne doit donc pas avoir d'avance : la réponse reste cachée avant « Révéler », et les annonces sont simultanées (« 3, 2, 1, annoncez ! »). |
| **Rythme de route** | Les tours sont courts, la durée de partie prévisible, et il n'y a aucune saisie longue. Une règle s'explique en une phrase. |

---

## 2. Rôles

| Rôle | Qui | Fait | Ne fait jamais |
|---|---|---|---|
| **Copilote** (arbitre-joueur) | Le passager | Lit les cartes à voix haute, joue, tape les résultats et les saisies, gère pause et annulation | Voir une réponse avant les autres : c'est impossible par construction |
| **Joueur** | Le conducteur | Écoute, répond à voix haute, conteste à voix haute | Regarder l'écran |
| **Maître du jeu silencieux** | L'app | Tire les cartes, chronomètre, bipe, calcule, cache puis révèle | Afficher une réponse avant le tap sur « Révéler » |

La case « conducteur » de la configuration n'a **aucun effet sur les règles**. Elle personnalise seulement quelques textes (« Léa, les yeux sur la route ! »).

---

## 3. Boucle de jeu

```
Accueil ──► Configuration ──► [Lancer] (déverrouille les bips sur iOS)
                                   │
                                   ▼
                              OUVERTURE ─ « Léa contre Tom » (+ palmarès de la paire, étape 4)
                                   │
             ┌─────────────────────▼─────────────────────┐
             │ ROUND_INTRO ─ « Manche 3 : Quelle année ? »│
             │     │                                      │
             │     ▼                                      │
             │ PLAYING ─ Q tours du jeu de la manche      │◄── × N manches
             │     │                                      │
             │     ▼                                      │
             │ ROUND_RECAP ─ points de la manche + jeton  │
             └─────────────────────┬─────────────────────┘
                                   │ dernière manche : points ×2 (annoncé à l'écran)
                                   ▼
                     scores égaux ? ──oui──► MORT SUBITE (1 question, répétée tant qu'il y a égalité)
                                   │non                    │
                                   ▼                        ▼
                               FIN DE PARTIE ◄──────────────┘
                     vainqueur · récap par jeu · jetons · palmarès
                          [Revanche] (même config, nouvelle seed) · [Accueil]
```

**Le score décide du vainqueur. Les jetons sont la lecture visuelle des manches gagnées.**

---

## 4. Format et rotation

### 4.1 Préréglages

| Préréglage | Manches | Questions par manche | Durée estimée (§13) |
|---|---|---|---|
| Express | 3 | 3 | ~7-8 min |
| **Classique** (défaut) | 6 | 5 | ~22-25 min |
| Longue route | 9 | 5 | ~33-40 min |
| Personnalisé | 3 / 6 / 9 | 3 / 5 / 7 | variable |

### 4.2 Rotation des jeux

Soit `G` les jeux activés (k = |G|) et N le nombre de manches. L'ordre des manches se construit ainsi :

1. On découpe la partie en blocs de k manches.
2. Chaque bloc est une **permutation** de G, mélangée par le PRNG (`seed`, numéro du bloc).
3. Si le premier jeu d'un bloc est le dernier du bloc précédent, on l'échange avec le deuxième jeu du bloc (sauf si k = 1).
4. Le dernier bloc, s'il est incomplet, prend les premiers jeux de sa permutation.

Résultat : chaque jeu apparaît ⌊N/k⌋ ou ⌈N/k⌉ fois, et jamais deux manches d'affilée, sauf s'il est seul. L'ordre est fixé au lancement et visible en debug. Le jeu de la dernière manche (doublée) est laissé au hasard, pour la variété.

### 4.3 Courbe de difficulté ✅

| Q | Mixte | Facile | Difficile |
|---|---|---|---|
| 3 | 1 · 2 · 3 | 1 · 1 · 2 | 2 · 2 · 3 |
| 5 | 1 · 1 · 2 · 2 · 3 | 1 · 1 · 1 · 2 · 2 | 2 · 2 · 2 · 3 · 3 |
| 7 | 1 · 1 · 2 · 2 · 2 · 3 · 3 | 1 · 1 · 1 · 1 · 2 · 2 · 2 | 2 · 2 · 2 · 2 · 3 · 3 · 3 |

**Repli** : si aucun item n'est disponible à la difficulté cible, on prend la plus proche, en préférant la plus basse en cas d'égalité de distance. S'il n'y a plus rien du tout, on recycle (§11.3).

---

## 5. Scoring

### 5.1 Table complète

- `b` = bonus réponse exacte (paramètre, défaut **on**).
- `m` = multiplicateur de manche : ×2 en dernière manche si « Dernière manche double » est **on**, ×1 sinon.

| Jeu | Situation | Points A | Points B |
|---|---|---|---|
| Bac Éclair | A tape en premier (mot valable) | 1·m | 0 |
| Bac Éclair | « Ensemble ! », mode *rejoué* (défaut) | — | — (tour rejoué) |
| Bac Éclair | « Ensemble ! », mode *1 pt chacun* | 1·m | 1·m |
| Bac Éclair | Personne (après le chrono) | 0 | 0 |
| Année / Estim. | A plus proche, pas exact | 1·m | 0 |
| Année / Estim. | A exact, B non | (b ? 2 : 1)·m | 0 |
| Année / Estim. | Même écart, aucun exact | 1·m | 1·m |
| Année / Estim. | Les deux exacts | (b ? 2 : 1)·m | (b ? 2 : 1)·m |
| Année / Estim. | A seul a répondu | (exact && b ? 2 : 1)·m | 0 |
| Année / Estim. | Personne n'a répondu | 0 | 0 |

### 5.2 Mesure de l'écart

- **Quelle année ?** : `écart = |p − r|`. Une réponse est exacte quand l'écart vaut 0.
- **Estimation** : `écart = max(p, r) / min(p, r)`, un ratio toujours ≥ 1. Une réponse est exacte quand ce ratio est ≤ 1,01.
  - On ne compare jamais deux ratios flottants. Les valeurs sont converties en **entiers exacts** (`bigint`, en centièmes), puis on compare des produits croisés : A est plus proche ⇔ `max(a,r)·min(b,r) < max(b,r)·min(a,r)`. L'exactitude se teste par `100·max ≤ 101·min`.
  - Ainsi, « ×2 contre ×2 » (r = 100, A = 50, B = 200) donne bien une égalité.

### 5.3 Paramètres figés à la partie

Ces paramètres sont **copiés dans `config` au lancement** et ne changent plus jusqu'à la fin :
- bonus exact ;
- dernière manche double ;
- comportement d'« Ensemble ! » ;
- lettres rares ;
- difficulté ;
- format.

C'est indispensable : rejouer les événements avec d'autres règles donnerait un autre score.

Les durées de chrono, les bips, les vibrations et l'auto-avance restent modifiables en cours de partie : ce sont des effets, pas des règles.

---

## 6. Modèle : event sourcing

### 6.1 Entrées et dérivation

```ts
type MatchRecord = {
  schemaVersion: 1;
  matchId: string;
  config: MatchConfig; // joueurs, jeux, packs, difficulté, format, règles figées (§5.3)
  seed: number; // uint32
  events: MatchEvent[];
};

state = events.reduce(reduceMatch, initialMatchState(config, seed));
```

`reduceMatch` est une **fonction pure** : pas de `Date`, pas de hasard non seedé, pas d'accès au stockage ni au DOM. ESLint l'interdit dans `src/engine`.

### 6.2 Les tirages sont des faits enregistrés ✅

Le tirage (`draw.ts`) est **déterministe**. Il dépend de la seed, de la manche, du contenu, des items vus et des items signalés. Comme les vus et le contenu évoluent entre deux parties, la couche applicative appelle `prepareRound(...)` au début de chaque manche, et **inscrit le résultat dans l'événement**, réponse comprise :

```ts
{ type: 'ROUND_STARTED', round: 2, game: 'year',
  items: [{ id: 'yr-0012', answer: 1989 }, { id: 'yr-0007', answer: 1969 }, ...] }
```

Le reducer ne tire et ne consulte rien : il lit des faits. Trois conséquences :
- un export rejoué donne **exactement** le même état, même après une mise à jour du contenu ;
- l'UI n'a jamais besoin de connaître une règle pour calculer un score ;
- le tirage reste testable seul, et déterministe à seed égale.

Le PRNG est `mulberry32`. La sous-graine vaut `hash(seed, manche, question, sel)`, où le sel distingue les usages (rotation, items, lettre, rejeu n°k…).

### 6.3 Catalogue des événements

Chaque événement porte `at: number`, l'horodatage fourni par l'app. Le journal l'utilise ; le reducer ne le lit **jamais**.

**Partie**

| Événement | Origine | Effet |
|---|---|---|
| `OPENING_DONE` | tap | ouverture → première `ROUND_INTRO` |
| `ROUND_STARTED { round, game, items }` | tap ou délai sur le RoundIntro | crée l'état du mini-jeu |
| `ROUND_RECAP_DONE` | tap « Continuer » | manche suivante, mort subite ou fin |
| `SUDDEN_DEATH_STARTED { game, item }` | tap sur l'écran de mort subite | question de départage |
| `ITEM_SKIPPED { replacement }` | copilote (Passer) | item remplacé, 0 point |
| `TURN_RESTARTED` | app (reprise après fermeture) | un tour chronométré repart du début (§10.3) |
| `MATCH_ABANDONED` | copilote (Menu, confirmé) | fin sans vainqueur, palmarès inchangé |
| `DEBUG_*` | debug | voir §12 |

**Mini-jeux** : préfixés `year/`, `estim/` et `bac/`, et détaillés aux §7 à §9.

### 6.4 Annuler ✅

Chaque événement appartient à une catégorie :
- **décision** : un choix du copilote qui produit un résultat. Exemples : `year/INPUT`, `year/REVEAL`, `bac/BUZZ`, `bac/NOBODY`, `bac/CONTESTED`, `ITEM_SKIPPED`, `DEBUG_*`.
- **navigation** : tout le reste (`…/READ`, `…/THINK_DONE`, `…/NEXT`, `ROUND_STARTED`, `ROUND_RECAP_DONE`…).

**Annuler retire la dernière décision ET tous les événements qui la suivent, puis recalcule l'état.**

Exemples :
- Après la révélation, Annuler ramène à « prêt à révéler ». Un deuxième Annuler retire la saisie de B, pour corriger une faute de frappe ; un troisième retire celle de A.
- Depuis l'intro de la manche suivante, Annuler ramène avant la révélation de la dernière question. Le récap disparaît, le jeton est repris, et les scores sont recalculés.
- Quand il n'y a plus de décision à annuler, le bouton est inactif.

---

## 7. Jeu 1 : Bac Éclair *(étape 3)*

> **Une lettre, une catégorie : le premier qui donne un mot valable marque.**

### 7.1 Machine à états (un tour)

```
hidden ──FLIP──► countdown ──COUNTDOWN_DONE──► running
                                                  │
                     ┌──────────BUZZ(A|B)─────────┤
                     │      BUZZ(both)──► (rejoué | 1 pt chacun)
                     │                            │ TIMER_EXPIRED
                     ▼                            ▼
                 resolved ◄──BUZZ(A|B) / NOBODY── timeout
                     │
                     ├─CONTESTED (≤ 3 s)──► hidden (même catégorie, nouvelle lettre)
                     └─NEXT──► tour suivant | fin de manche
```

| État | Le copilote… | Écran | Sorties |
|---|---|---|---|
| `hidden` | annonce « Attention… » | LetterCard **face cachée** (dos rouge) : « Touchez pour retourner » | `FLIP` |
| `countdown` | lit la catégorie et la lettre : « Un animal… en B ! » | La carte se retourne : catégorie et lettre géante. Le décompte « 3 · 2 · 1 » s'affiche avec un bip court par temps, puis un bip aigu sur « top ». Les boutons joueurs sont **inactifs** : un mot dit avant « top » ne compte pas. | `COUNTDOWN_DONE` |
| `running` | joue, et tape le gagnant | L'anneau se vide (15 s par défaut) et passe en alerte à 5 s, avec un bip court ; bip long à 0. Boutons **[Joueur A] [Joueur B] [Ensemble !]** | `BUZZ`, `TIMER_EXPIRED` |
| `timeout` | tranche un mot dit pile au buzzer | Anneau vide. Boutons **[Joueur A] [Joueur B] [Personne]** | `BUZZ(A\|B)`, `NOBODY` |
| `resolved` | annonce « Point pour Léa, 4 à 2 ! » | Bandeau du gagnant et **score en grand** (proposition A). **[Contesté]** reste visible 3 s, puis **[Suivant]** | `CONTESTED`, `NEXT` |

> 🎲 **Avance du copilote** : le copilote découvre la lettre à peine une seconde avant le conducteur, le temps de la lire. Le décompte de 3 s compense en grande partie. On verra en jouant.

### 7.2 Règles de résolution

- **Premier tap gagnant.** Les taps suivants sont ignorés : un événement invalide dans l'état courant est ignoré, sans planter.
- **« Ensemble ! »** :
  - mode *rejoué* (défaut) : retour en `hidden`, avec la même catégorie et une nouvelle lettre ;
  - mode *1 pt chacun* : `resolved`, avec +1 pour chacun.
- **Contesté** (règle d'or n° 3) : le point est annulé, et on revient en `hidden` avec la même catégorie et une nouvelle lettre.
- 🎲 **Plafond de rejeux** : au 3e rejeu consécutif d'un même tour, le tour est annulé sans point et remplacé par une nouvelle catégorie.
- **Auto-avance** : `NEXT` part automatiquement `max(3 s, délai d'auto-avance)` après la résolution. Cela laisse toujours les 3 s de contestation.

### 7.3 Tirage

- **Catégories** : Q catégories distinctes, selon la courbe de difficulté (§4.3).
- **Lettre** : pondérée par la fréquence des initiales en français (annexe A). Sont exclues :
  - K, Q, W, X, Y et Z, sauf si les lettres rares sont activées ;
  - les `excludedLetters` de la catégorie ;
  - la lettre du tour précédent, rejeux compris.
- La lettre est tirée avec la sous-graine `(seed, manche, question, n° de rejeu)` et inscrite dans l'événement.

### 7.4 Passer

« Passer » remplace la catégorie par une autre, avec une nouvelle lettre. Le tour reste le même et ne rapporte aucun point.

---

## 8. Jeu 2 : Quelle année ? *(étape 2)*

> **Un événement : chacun annonce une année, le plus proche marque.**

### 8.1 Machine à états (une question)

```
read ──READ──► think ──THINK_DONE──► countdown ──COUNTDOWN_DONE──► inputA ──INPUT──► inputB ──INPUT──► ready ──REVEAL──► revealed ──NEXT──►
```

| État | Le copilote… | Écran | Sorties |
|---|---|---|---|
| `read` | lit à voix haute « Histoire : la chute du mur de Berlin. » | QuestionCard **recto** : bandeau bleu, catégorie, énoncé en grand. **Jamais l'année.** Bouton **[C'est lu ▶]** | `READ` |
| `think` | réfléchit en silence (il joue aussi) | Énoncé et jauge de réflexion (10 s par défaut). « Prêts ? » : un tap sur la carte passe | `THINK_DONE` (chrono ou tap) |
| `countdown` | crie « Annoncez ! » au signal | « 3 · 2 · 1 » géant, un bip par temps, puis un bip aigu et **« Annoncez ! »** | `COUNTDOWN_DONE` |
| `inputA` | saisit l'année annoncée par A | Numpad encadré jaune « Léa a dit… », pré-rempli avec `centuryHint` (« 19 _ _ ») · **[Pas de réponse]** | `INPUT { player: 'A', value \| null }` |
| `inputB` | idem pour B | Numpad encadré violet « Tom a dit… » | `INPUT { player: 'B', … }` |
| `ready` | relit les deux propositions : « Léa dit 1990, Tom dit 1985… » (proposition B) | Recto, plus les **deux propositions en grand** dans leurs couleurs, et un gros bouton **[Révéler]** | `REVEAL` |
| `revealed` | lit « C'était en 1989 ! », le gagnant et l'anecdote | **Flip** de la carte. Verso : l'année en 56 px, la réglette, les écarts, le gagnant, « +2 exact ! », le **score en grand**, puis l'anecdote. **[Suivant]** · [Signaler] | `NEXT` |

### 8.2 Saisie

- Le numpad accepte 4 chiffres maximum. Il propose un effacement, **[Valider]** et **[Pas de réponse]**.
- `centuryHint` pré-remplit les 2 premiers chiffres, qui restent modifiables comme les autres.
- [Valider] reste inactif tant qu'il n'y a pas 4 chiffres.
- ✅ Les années vont de **1000 à 2025** en v1, sans « av. J.-C. ».
- L'ordre de saisie, A puis B, n'influence rien : les annonces ont été simultanées.

### 8.3 Révélation

1. Flip 3D de la carte (500 ms), puis l'année défile jusqu'à la bonne réponse (600 ms).
2. La réglette affiche une graduation centrée sur la réponse, un pion par joueur, et l'écart (« 3 ans »).
3. « +1 » ou « +2 » monte au-dessus de la pastille du gagnant, et le score se met à jour.
4. Un **écart énorme** déclenche une petite phrase de l'animateur (§17, étape 4) : au moins 50 ans d'écart en Année, ou un ratio d'au moins ×10 en Estimation.

---

## 9. Jeu 3 : Estimation *(étape 3)*

> **Une question chiffrée : chacun annonce un nombre, le plus proche (en proportion) marque.**

La machine à états est **identique** à celle de Quelle année ? Les différences :

| Aspect | Estimation |
|---|---|
| Carte recto | Énoncé, et **pastille d'unité** visible en permanence |
| Numpad | Chiffres et **virgule**, avec des multiplicateurs **[mille] [million] [milliard]** en pastilles exclusives. L'aperçu se formate en direct (« 6,5 millions »). Au plus 2 décimales. [Valider] est inactif si la valeur vaut 0. |
| Révélation | La réponse formatée (« ≈ 6,7 millions »), le ratio de chacun (« ×1,3 » ou « exact ! ») et une réglette en **échelle logarithmique** de ÷100 à ×100, avec une flèche au-delà |
| Mesure | Ratio, avec produits croisés (§5.2) |

---

## 10. Effets, chronos et reprise

### 10.1 Bips et vibrations

Ce sont les seuls signaux sonores : des bips WebAudio générés, sans aucun fichier audio.

| Signal | Son | Vibration |
|---|---|---|
| Décompte « 3, 2, 1 » | bip court à 660 Hz, 120 ms | 20 ms |
| « Top ! » / « Annoncez ! » | bip aigu à 990 Hz, 300 ms | 60 ms |
| Alerte des 5 dernières secondes (Bac) | bip court à 880 Hz | — |
| Fin du chrono | bip long et grave à 440 Hz, 600 ms | 120 ms |

L'audio est déverrouillé par le tap sur « Lancer », comme l'exige iOS.

### 10.2 Chronos

- Les chronos (réflexion, Bac, contestation, auto-avance) sont des **effets** gérés par l'app. Seule leur **fin** devient un événement (`THINK_DONE`, `TIMER_EXPIRED`…).
- **Pause** : fige le chrono et voile l'écran. Elle n'est pas journalisée.
- **Passage en arrière-plan** (appel, GPS, verrouillage) : pause automatique.
- **Chronos ×5** (debug) : toutes les durées sont divisées par 5.

### 10.3 Reprise après fermeture

1. On recharge `{ config, seed, events }` et on recalcule l'état.
2. Si l'état courant est **chronométré** (`think`, `countdown`, ou `running` au Bac), on ajoute `TURN_RESTARTED`. Le tour repart de sa première étape (`read` ou `hidden`) **avec le même item**.
3. Les états sans chrono (saisies, `ready`, `revealed`) reprennent tels quels : les saisies déjà faites sont conservées.

### 10.4 Fin de partie et palmarès *(étape 4)*

- Le palmarès est mis à jour **à l'entrée** dans l'état `finished`, avec une écriture indexée par `matchId` : elle est donc idempotente.
- Annuler depuis l'écran de fin retire cette entrée.
- « Revanche » et « Accueil » archivent la partie.

---

## 11. Packs, contenu disponible et recyclage

### 11.1 Éligibilité d'un item

Un item est éligible si les quatre conditions suivantes sont réunies :
1. il appartient à au moins un pack sélectionné ;
2. il n'est pas signalé ;
3. il n'a pas déjà été tiré **dans cette partie** ;
4. il n'est pas vu, si « Ne pas reposer » est actif.

### 11.2 Vus

`seen` associe à chaque `itemId` un **numéro d'ordre** croissant, qui correspond à sa dernière apparition. Un item est marqué vu quand sa carte est **lue** (`READ` ou `FLIP`) ou **passée**.

### 11.3 Recyclage

Si le nombre d'items éligibles est inférieur au besoin (Q × nombre de manches de ce jeu), on réintègre les **vus les plus anciens** jusqu'à couvrir le besoin.

Si le total d'items du jeu dans les packs sélectionnés est **inférieur à 10**, le jeu est désactivé pour la partie, avec un avertissement. Si tous les jeux sont désactivés, « Lancer » est inactif et la raison est affichée.

---

## 12. Debug et événements de debug *(étape 5)*

Les actions de debug qui modifient la partie sont des **événements** et des **décisions** au sens d'Annuler :
- `DEBUG_FORCE_NEXT_GAME { game }` ;
- `DEBUG_SET_SCORE { A, B }` ;
- `DEBUG_SKIP_ROUND` ;
- `DEBUG_JUMP { to: 'finalRound' | 'end' }`.

« Relancer avec une seed », import, chronos ×5 et vidage des données restent **hors** du journal : ce sont des actions sur l'app, pas sur la partie.

---

## 13. Durées estimées

Hypothèses : réflexion de 10 s, Bac de 15 s.

| Séquence | Détail | Durée |
|---|---|---|
| Tour Bac Éclair | retournement et lecture 3 s + décompte 3 s + course ~7 s + résolution 3 s + ~2 s de rejeux amortis | **~18-20 s** |
| Question Année / Estimation | lecture 6 s + réflexion 10 s + décompte 3 s + saisies 2 × 5 s + relecture des propositions, révélation et anecdote ~13 s + transition 2 s | **~44 s** |
| Habillage de manche | intro 4 s + récap 6 s | ~10 s |
| Ouverture et fin de partie | | ~40 s |

| Format | Calcul (3 jeux) | Brut | Avec les rires et les débats (+15 %) |
|---|---|---|---|
| Express (3 × 3) | 3 Bac + 6 × 44 s + 3 × 10 s + 40 s | ~6 min 35 | **~7-8 min** ✅ |
| Classique (6 × 5) | 10 Bac + 20 × 44 s + 6 × 10 s + 40 s | ~19 min 40 | **~22-25 min** ✅ |
| Longue route (9 × 5) | 15 Bac + 30 × 44 s + 9 × 10 s + 40 s | ~29 min 10 | **~33-40 min** ✅ |

**Tension et rattrapage** : en Classique, une manche distribue 5 à 7 points, et la dernière manche, doublée, en distribue 10 à 14. Un retard de 4 à 5 points reste donc rattrapable jusqu'au bout.

---

## 14. Mort subite

- **Déclenchement** : scores égaux après la dernière manche.
- **Jeu** : Estimation, ou Quelle année ? si Estimation est désactivée. Si les deux sont désactivés, Bac Éclair : le premier mot valable gagne.
- **Flow** : celui du jeu, précédé d'un écran « Mort subite : le plus proche gagne la partie ».
- **Résolution** : le plus proche gagne la partie. La mort subite **n'ajoute pas de points** : le score final reste « 9 à 9 », avec la mention « victoire en mort subite ».
- **Égalité, ou personne n'a répondu** : nouvel écran de mort subite et nouvelle question.
- **Un seul joueur a répondu** : il gagne.

---

## 15. Cas limites

| # | Cas | Traitement |
|---|---|---|
| 1 | Deux taps quasi simultanés | Le premier événement change l'état ; le second, invalide dans le nouvel état, est ignoré. |
| 2 | Tap au moment où le chrono expire | L'ordre d'arrivée décide. En Bac, l'état `timeout` permet toujours d'attribuer le point. |
| 3 | Tap pendant le décompte | Boutons inactifs : un mot dit avant « top » ne compte pas. |
| 4 | Annuler au-delà d'une fin de manche | Le récap disparaît, le jeton est repris, les scores sont recalculés. |
| 5 | Annuler après la fin de partie | Retour avant la dernière décision ; l'entrée du palmarès est retirée. |
| 6 | Passer pendant la mort subite | Autorisé : nouvelle question. |
| 7 | Les deux joueurs « Pas de réponse » | 0 point ; en mort subite, nouvelle question. |
| 8 | Valeur 0 en Estimation | [Valider] inactif. |
| 9 | Prénoms vides | « Joueur 1 » et « Joueur 2 ». |
| 10 | Prénoms identiques | Refusé, avec le message « Deux prénoms différents, sinon on s'emmêle ! » |
| 11 | Paramètres modifiés en cours de partie | Les règles restent figées (§5.3) ; les effets s'appliquent au tour suivant. |
| 12 | Plus d'item à proposer après des « Passer » en rafale | Recyclage des plus anciens vus, puis de tout item non tiré dans la partie. Si rien ne reste, Passer est inactif. |
| 13 | Item signalé en cours de partie | Il est joué jusqu'au bout, puis exclu des parties suivantes. |
| 14 | Audio bloqué (iOS, mode silencieux) | Le jeu continue sans bips ; le décompte reste visible en grand. |
| 15 | App en arrière-plan | Pause automatique ; au retour, le Wake Lock est réacquis. |
| 16 | Wake Lock refusé ou indisponible | Repli silencieux, avec une ligne dans le journal. |
| 17 | `currentMatch` corrompu | La validation zod échoue : retour à l'accueil sans partie en cours, et l'erreur est journalisée. |
| 18 | Égalité de manche à 0-0 | Un jeton chacun, comme pour toute égalité. |
| 19 | Jeton de la manche doublée | Il va au gagnant de la manche ; le doublement ne change rien à ce calcul. |
| 20 | Événement invalide (rejeu, import) | Ignoré par le reducer : l'état est inchangé, rien ne plante. |

---

## 16. Règles affichées (écran Règles)

**Les règles d'or**
1. On répond à voix haute. Pour les années et les estimations, on annonce **en même temps**, au signal « 3, 2, 1, annoncez ! ».
2. Ce qui est dit est dit : pas de changement de réponse après l'annonce.
3. En cas de doute ou de désaccord sur un mot, **le tour est rejoué**.

**Le copilote** lit les cartes à voix haute et tape les résultats. Il joue aussi : l'app ne lui montre jamais la réponse avant les autres.

**En une phrase par jeu**
- ⚡ **Bac Éclair** : une catégorie, une lettre ; le premier mot valable marque.
- ⌛ **Quelle année ?** : un événement ; le plus proche de l'année marque, et la bonne année pile vaut double.
- ⚖ **Estimation** : un chiffre à deviner ; le plus proche en proportion marque, et dans le mille vaut double.

**Et aussi** : la dernière manche vaut double. En cas d'égalité finale, une mort subite départage.

---

## 17. Propositions adaptées (sans voix)

| Id | Proposition | Mise en œuvre |
|---|---|---|
| ✅ **A** | Score après chaque point | Les écrans `resolved` et `revealed` affichent le **nouveau score en grand** (« Léa 4 – 2 Tom »), formulé pour être lu tel quel. |
| ✅ **B** | Propositions avant la révélation | L'état `ready` affiche les deux propositions en grand. Le copilote les relit, puis tape « Révéler ». |
| 🎲 **C** | Temps de grâce conducteur | Pas en v1 ; à revoir en jouant. |
| **Animateur** | Personnalité du jeu (§13 du brief) | Les pools de répliques de `host.json` deviennent des **bulles de texte** courtes, affichées aux moments clés (ouverture, intro de manche, réponse exacte, écart énorme, égalité, prise de tête, manche finale, mort subite, victoire). Le copilote peut les lire. Elles arrivent à l'étape 4. |

---

## Annexe A : pondération des lettres (Bac Éclair)

Les poids sont approximatifs, tirés de la fréquence des initiales en français puis lissés pour que le jeu reste varié.

| Lettre | Poids | Lettre | Poids | Lettre | Poids |
|---|---|---|---|---|---|
| A | 8 | J | 3 | S | 9 |
| B | 7 | L | 6 | T | 7 |
| C | 10 | M | 8 | U | 2 |
| D | 6 | N | 3 | V | 4 |
| E | 5 | O | 3 | *K Q W X Y Z* | *1 (si lettres rares activées)* |
| F | 5 | P | 9 | | |
| G | 5 | R | 6 | | |
| H | 3 | I | 2 | | |

Une catégorie doit autoriser au moins **15 lettres** (lettres rares exclues). Le seuil descend à 10 pour les catégories exclusivement Écosse ou Belgique (🎲 D6).
