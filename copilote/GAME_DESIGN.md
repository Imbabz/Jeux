# Copilote : Game Design

> Document de référence des règles et du moteur. Tout ce qui est décrit ici sera codé dans `src/engine` (logique pure) et seulement **affiché** par `src/ui`.
> Les points marqués **⚖️ À VALIDER** sont des choix que je propose et que tu dois trancher. Les points marqués **💡 PROPOSITION** sont des ajouts hors cahier des charges : rien ne sera codé sans ton accord.

---

## 1. Intention

**Copilote transforme un trajet en voiture en plateau de jeu sonore.** Deux joueurs, un seul téléphone, aucun regard du conducteur vers l'écran. L'application est l'animateur : elle lit, rythme, chronomètre, compte les points et commente.

Trois piliers guident chaque décision :

| Pilier | Ce que ça implique |
|---|---|
| **Les oreilles d'abord** | Tout ce qui compte pour le conducteur passe par la voix : la question, le décompte, le résultat et le score. L'écran sert l'arbitre, pas le jeu. |
| **Équité sans soupçon** | L'arbitre joue aussi. Il ne doit donc jamais avoir d'avance : la réponse reste cachée avant « Révéler », la lettre s'affiche seulement après la voix, et les annonces sont simultanées. |
| **Rythme de route** | Des tours courts, une durée de partie prévisible, et aucune saisie longue. Une règle s'explique en une phrase. |

---

## 2. Rôles

| Rôle | Qui | Fait | Ne fait jamais |
|---|---|---|---|
| **Animateur** | L'app | Lit, chronomètre, bipe, calcule, commente | Révéler une réponse avant le tap sur « Révéler » |
| **Arbitre-joueur** | Le passager | Joue, tape les résultats et les saisies, gère pause et annulation | Regarder une réponse avant les autres (impossible par construction) |
| **Joueur** | Le conducteur | Écoute, répond à voix haute, conteste à voix haute | Regarder l'écran |

La case « conducteur » de la configuration n'a **aucun effet sur les règles**. Elle sert seulement à l'animateur (« À toi de garder les yeux sur la route, Léa ! »).

---

## 3. Boucle de jeu

```
Accueil ──► Configuration ──► [Lancer] (déverrouille la voix iOS)
                                   │
                                   ▼
                              OUVERTURE ─ voix : accueil + palmarès de la paire
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
                                   │ dernière manche : points ×2 (annoncé)
                                   ▼
                     scores égaux ? ──oui──► MORT SUBITE (1 question, répétée tant que égalité)
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

Soit `G` les jeux activés (k = |G|) et N le nombre de manches.

1. On découpe la partie en blocs de k manches.
2. Chaque bloc est une **permutation** de G, mélangée par le PRNG (`seed`, bloc).
3. Si le premier jeu d'un bloc est égal au dernier du bloc précédent, on l'échange avec le deuxième jeu du bloc (impossible quand k = 1).
4. Le dernier bloc, éventuellement incomplet, prend les premiers jeux de sa permutation.

Ce qui en découle :
- Chaque jeu apparaît ⌊N/k⌋ ou ⌈N/k⌉ fois.
- Le même jeu ne revient jamais deux manches d'affilée, sauf s'il est seul activé.
- Avec 3 jeux en Classique, chaque jeu a exactement 2 manches.

L'ordre est déterminé dès le lancement et visible dans l'overlay debug.

> **⚖️ À VALIDER (mineur)** : le jeu de la dernière manche, qui vaut double, est laissé au hasard. On pourrait forcer Quelle année ? ou Estimation, plus « juges de paix » que le Bac Éclair. Ma recommandation est de garder le hasard, pour la variété.

### 4.3 Courbe de difficulté

Les difficultés cibles par tour, selon Q et le mode :

| Q | Mixte | Facile | Difficile |
|---|---|---|---|
| 3 | 1 · 2 · 3 | 1 · 1 · 2 | 2 · 2 · 3 |
| 5 | 1 · 1 · 2 · 2 · 3 | 1 · 1 · 1 · 2 · 2 | 2 · 2 · 2 · 3 · 3 |
| 7 | 1 · 1 · 2 · 2 · 2 · 3 · 3 | 1 · 1 · 1 · 1 · 2 · 2 · 2 | 2 · 2 · 2 · 2 · 3 · 3 · 3 |

**Repli** : s'il n'y a plus d'item disponible à la difficulté cible, on prend la difficulté **la plus proche**, en préférant la plus basse en cas d'égalité de distance. Si plus rien n'est disponible du tout, on recycle (§11.3).

> **⚖️ À VALIDER** : les lignes Q = 3 et Q = 7 ne figuraient pas dans le brief. Celles-ci sont ma proposition.

---

## 5. Scoring

### 5.1 Table complète

`b` = bonus exact (paramètre, défaut **on**). `m` = multiplicateur de manche (×2 en dernière manche si le paramètre « Dernière manche double » est **on**, sinon ×1).

| Jeu | Situation | Points A | Points B |
|---|---|---|---|
| Bac Éclair | A tape en premier (mot valable) | 1·m | 0 |
| Bac Éclair | « Ensemble ! », mode *rejoué* (défaut) | — | — (tour rejoué) |
| Bac Éclair | « Ensemble ! », mode *1 pt chacun* | 1·m | 1·m |
| Bac Éclair | Personne (après le temps imparti) | 0 | 0 |
| Année / Estim. | A plus proche, pas exact | 1·m | 0 |
| Année / Estim. | A exact, B non | (b ? 2 : 1)·m | 0 |
| Année / Estim. | Égalité d'écart, aucun exact | 1·m | 1·m |
| Année / Estim. | Les deux exacts | (b ? 2 : 1)·m | (b ? 2 : 1)·m |
| Année / Estim. | A seul a répondu | (exact && b ? 2 : 1)·m | 0 |
| Année / Estim. | Personne n'a répondu | 0 | 0 |

### 5.2 Mesure de l'écart

- **Quelle année ?** : `écart = |p − r|`. Une réponse est exacte quand l'écart vaut 0.
- **Estimation** : `écart = max(p, r) / min(p, r)`, un ratio ≥ 1. Une réponse est exacte quand le ratio est ≤ 1,01.
  - **Comparaison sans erreur d'arrondi** : on ne compare jamais deux ratios flottants. On compare les produits croisés : A est plus proche que B ⇔ `max(a,r)·min(b,r) < max(b,r)·min(a,r)`. On teste l'exactitude par `100·max(p,r) ≤ 101·min(p,r)`. Ainsi, « ×2 contre ×2 » (r = 100, A = 50, B = 200) est bien une égalité.
  - Les saisies sont des décimaux à au plus 2 décimales, multipliés par 10³, 10⁶ ou 10⁹. Elles sont converties en entiers exacts (`bigint` si la valeur dépasse 2⁵³) avant comparaison.

### 5.3 Paramètres figés à la partie

Ces paramètres sont **copiés dans `config` au lancement** et ne changent plus jusqu'à la fin de la partie :
- bonus exact ;
- dernière manche double ;
- comportement d'« Ensemble ! » ;
- lettres rares ;
- difficulté ;
- format.

Sans ce gel, rejouer les événements avec d'autres paramètres donnerait un autre score : l'event sourcing exige des entrées immuables.

Les durées de chrono, la voix, les bips et l'auto-avance restent modifiables en cours de partie. Ce sont des effets, pas des règles.

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

`reduceMatch` est une **fonction pure** : pas de `Date`, pas de hasard non seedé, pas d'accès au stockage ni au DOM. Une règle ESLint l'interdit dans `src/engine`.

### 6.2 Les tirages sont des faits enregistrés

Le tirage (`draw.ts`) est **déterministe**. Il prend en entrée la seed, le numéro de manche et de question, le contenu, l'ensemble des items vus et les items signalés. Mais l'ensemble des vus change entre deux parties, et le contenu peut évoluer d'une version à l'autre.

**Choix proposé** : quand une manche commence, la couche applicative appelle `prepareRound(...)` et **inscrit le résultat dans l'événement** :

```ts
{ type: 'ROUND_STARTED', round: 3, game: 'year', items: ['yr-0412', 'yr-0087', ...] }
```

Le reducer ne tire donc jamais rien : il lit des faits. Ce choix garantit trois propriétés :
- un export rejoué donne **exactement** le même état, même après une mise à jour du contenu ou un reset des vus ;
- `reduce` reste trivialement pur ;
- le tirage reste testable seul, et déterministe à seed égale.

Le PRNG est `mulberry32`. La sous-graine vaut `hash(seed, round, question, salt)`, où `salt` distingue les usages (lettre, catégorie, rejeu n°k…).

> **⚖️ À VALIDER** : c'est une légère évolution du brief, qui disait « état dérivé de `{ config, seed, events }` ». C'est toujours vrai, mais les événements portent les ids tirés.

### 6.3 Catalogue des événements

Chaque événement porte `at: number` (horodatage fourni par l'UI). Le journal l'utilise ; le reducer ne le lit **jamais**.

**Partie**

| Événement | Origine | Effet |
|---|---|---|
| `OPENING_DONE` | auto (voix finie ou tap) | ouverture → première `ROUND_INTRO` |
| `ROUND_STARTED { round, game, items }` | auto (fin du RoundIntro) | crée l'état du mini-jeu |
| `ROUND_RECAP_DONE` | tap « Continuer » ou auto | manche suivante, mort subite ou fin |
| `SUDDEN_DEATH_STARTED { game, item }` | auto | question de départage |
| `ITEM_SKIPPED { replacement }` | arbitre (Passer) | item remplacé, marqué vu, 0 point |
| `ITEM_FLAGGED { itemId }` | arbitre (Signaler) | aucun effet sur le score (exclusion persistée à part) |
| `TURN_RESTARTED` | auto (reprise après fermeture) | le tour courant repart de `announce` (§10.3) |
| `MATCH_ABANDONED` | arbitre (Menu, confirmé) | fin sans vainqueur, palmarès inchangé |
| `DEBUG_*` | debug | voir §12 |

**Mini-jeux** : préfixés `bac/`, `year/` et `estim/`, et détaillés aux §7 à §9.

### 6.4 Catégories d'événements et Annuler

Chaque type d'événement appartient à une catégorie :

- **décision** : un choix de l'arbitre qui produit un résultat. Exemples : `bac/BUZZ`, `bac/NOBODY`, `year/INPUT`, `year/REVEAL`, `bac/CONTESTED`, `ITEM_SKIPPED`.
- **auto** : une transition provoquée par la voix ou par un chrono. Exemples : `bac/ANNOUNCE_DONE`, `bac/TIMER_EXPIRED`, `ROUND_STARTED`.
- **méta** : `ITEM_FLAGGED`. Il n'a pas d'effet de jeu, et Annuler ne le retire pas.

**Annuler = retirer la dernière décision ET tous les événements qui la suivent, puis recalculer.**

Exemples :
- Après la révélation d'une question d'année, Annuler retire `REVEAL` et l'écran revient à « prêt à révéler ». Un deuxième Annuler retire la saisie de B, pour corriger une faute de frappe. Un troisième retire celle de A.
- Après la dernière question d'une manche, Annuler fait revenir avant la fin de manche. Le récap disparaît, le jeton est repris, et les scores se recalculent.
- En Bac Éclair, Annuler après « Point pour Léa » revient en `running`. Le chrono **repart du début** du tour : comme décrit au §10.3, les durées écoulées ne sont pas dans l'état. La lettre et la catégorie restent les mêmes.

> **⚖️ À VALIDER** : le brief dit « défait la dernière action de score ». J'étends Annuler aux **saisies**, ce qui permet de corriger une saisie erronée avant la révélation. Les autres règles restent identiques.

Annuler est sans limite de profondeur, mais il ne franchit pas l'ouverture : la toute première décision est le plancher. Il reste disponible depuis l'écran de fin de partie (§10.4).

---

## 7. Jeu 1 : Bac Éclair

> **Une lettre, une catégorie : le premier qui donne un mot valable marque.**

### 7.1 Machine à états (un tour)

```
announce ──ANNOUNCE_DONE──► countdown ──COUNTDOWN_DONE──► running
                                                            │
                     ┌───────────────BUZZ(A|B)──────────────┤
                     │          BUZZ(both)──► (rejoué | 1 pt chacun)
                     │                                      │ TIMER_EXPIRED
                     ▼                                      ▼
                 resolved ◄────────BUZZ(A|B) / NOBODY──── timeout
                     │
                     ├─CONTESTED (≤ 3 s)──► announce (même catégorie, nouvelle lettre)
                     └─NEXT──► tour suivant | fin de manche
```

| État | Voix | Écran | Arbitre | Sorties |
|---|---|---|---|---|
| `announce` | « Un animal… en B ! » (spokenLabel + lettre) | La LetterCard est **retournée** (dos rouge) avec un VoiceIndicator. La lettre et la catégorie s'affichent **à la fin de la phrase** (`onend`). | Rien à faire (Passer et Pause restent disponibles). | `ANNOUNCE_DONE` sur `onend`, ou après le délai de secours (§10.1) |
| `countdown` | « 3, 2, 1, top ! » + bip à chaque temps | La lettre est visible et un gros chiffre se superpose à l'anneau | Rien. Les boutons joueurs sont **inactifs** : un mot dit avant « top » ne compte pas. | `COUNTDOWN_DONE` |
| `running` | silence ; bip court à 5 s, bip long à 0 | L'anneau se vide (15 s par défaut) et passe au rouge vif sur les 5 dernières secondes | **[Joueur A] [Joueur B] [Ensemble !]** | `BUZZ`, `TIMER_EXPIRED` |
| `timeout` | « Temps écoulé ! » | Anneau vide, lettre grisée | **[Joueur A] [Joueur B] [Personne]**, pour un mot dit pile au buzzer | `BUZZ(A\|B)`, `NOBODY` |
| `resolved` | « Point pour Léa ! » (ou « Personne ? Dommage. ») | « +1 » au-dessus de la pastille du gagnant et score mis à jour | **[Contesté]** visible 3 s, puis **[Suivant]** | `CONTESTED`, `NEXT` (auto ou tap) |

### 7.2 Règles de résolution

- **Premier tap gagnant.** Une fois le tour résolu, les taps suivants sont ignorés (« événement invalide → ignoré sans planter »).
- **« Ensemble ! »** :
  - En mode *rejoué* (défaut), on revient en `announce` avec la **même catégorie** et une **nouvelle lettre**. La voix dit : « Ex æquo ! On rejoue, nouvelle lettre… ».
  - En mode *1 pt chacun*, on passe directement en `resolved` avec +1 pour les deux.
- **Contesté** (règle d'or n° 3) : le point est annulé et on revient en `announce`, avec la même catégorie et une nouvelle lettre. Le tour ne compte pas en plus : il est rejoué.
- **⚖️ À VALIDER : plafond de rejeux.** Au **3e** rejeu consécutif d'un même tour, qu'il vienne d'« Ensemble ! » ou de « Contesté », le tour est **annulé sans point** et remplacé par une nouvelle catégorie. Cela évite une boucle infinie entre deux joueurs qui se contestent tout.
- **Auto-avance** : la fenêtre de contestation (3 s) et l'auto-avance ne se cumulent pas. `NEXT` part automatiquement à `max(3 s, délai d'auto-avance)` après la résolution. Si l'auto-avance est désactivée, [Suivant] apparaît dès la fin des 3 s.

### 7.3 Tirage (`bac/draw.ts`)

- **Catégories de la manche** : Q catégories distinctes tirées selon la courbe de difficulté (§4.3), parmi les packs sélectionnés. Une catégorie n'apparaît jamais deux fois dans la même manche.
- **Lettre de chaque tour** : tirage pondéré par la fréquence des initiales en français (table en annexe A). Trois filtres s'appliquent :
  - K, Q, W, X, Y et Z sont exclues, sauf si le paramètre « lettres rares » est activé ;
  - les `excludedLetters` de la catégorie sont exclues ;
  - la lettre du tour précédent est exclue, ce qui vaut aussi pour un rejeu.
- La lettre est **tirée au moment du tour**, avec la sous-graine `(seed, round, question, replayIndex)`, et inscrite dans l'événement `bac/TURN_PREPARED { letter }`.

### 7.4 Passer

« Passer » remplace la catégorie par une nouvelle, avec une nouvelle lettre. Le tour reste le même, sans point, et la catégorie écartée est marquée vue.

---

## 8. Jeu 2 : Quelle année ?

> **Un événement : chacun annonce une année, le plus proche marque.**

### 8.1 Machine à états (une question)

```
announce ─► think ─► countdown ─► inputA ─► inputB ─► ready ─REVEAL─► revealed ─NEXT─►
           (tap = passer)                (Pas de réponse possible)
```

| État | Voix | Écran | Arbitre | Sorties |
|---|---|---|---|---|
| `announce` | « Histoire : la chute du mur de Berlin. » (`category` + `spokenText`) | QuestionCard **recto** : bandeau bleu, pastille de catégorie, énoncé. **Jamais l'année.** | — | `ANNOUNCE_DONE` |
| `think` | silence | Énoncé + barre de réflexion (10 s par défaut) | Tap n'importe où = « On est prêts » | `THINK_DONE` (chrono ou tap) |
| `countdown` | « 3, 2, 1, annoncez ! » + bips | Gros « 3 · 2 · 1 » | — | `COUNTDOWN_DONE` |
| `inputA` | « Léa, je t'écoute… » (court, une seule fois) | Numpad encadré jaune « Au tour de Léa », pré-rempli avec `centuryHint` (« 19 _ _ ») | Saisit l'année annoncée par A, ou **[Pas de réponse]** | `INPUT { player: 'A', value \| null }` |
| `inputB` | — | Numpad encadré violet « Au tour de Tom » | Idem pour B | `INPUT { player: 'B', … }` |
| `ready` | — | Recto + les deux propositions en pions colorés + gros bouton **[Révéler]** | Tap Révéler | `REVEAL` |
| `revealed` | 💡 *(voir B)* « C'était en 1989 ! » puis le `context` | **Flip** de la carte. Verso : l'année en 56 px, RevealRuler, écarts, gagnant et points (« +2 exact ! ») | **[Suivant]** · [Signaler] | `NEXT` |

### 8.2 Saisie

- Le numpad propose 4 chiffres maximum, un effacement, **[Valider]** et **[Pas de réponse]**.
- Les deux premiers chiffres viennent de `centuryHint`, sont pré-remplis et restent modifiables : l'effacement les retire comme n'importe quel chiffre.
- [Valider] reste inactif tant que la saisie n'a pas 4 chiffres.
- **⚖️ À VALIDER : plage d'années.** En v1, toutes les années du contenu sont comprises entre **1000 et 2025**, sans « avant J.-C. ». C'est plus simple à l'oral (« mille neuf cent… »), au pavé et pour `centuryHint`. L'Antiquité pourra venir plus tard avec un bouton « av. J.-C. ».
- L'ordre de saisie (A puis B) n'influence rien : les annonces ont été simultanées.

### 8.3 Révélation

1. Flip 3D de la carte (500 ms). Un compteur d'année défile de la proposition la plus basse jusqu'à la bonne réponse (600 ms).
2. Voix : « C'était en 1989 ! », puis la réaction de l'animateur (pool *exact*, *écart énorme* ou *égalité*), puis le `context`.
3. RevealRuler : une graduation centrée sur la réponse, un pion par joueur, et l'écart affiché (« 3 ans »).
4. « +1 » ou « +2 » s'élève au-dessus de la pastille du gagnant.

« Écart énorme » (déclenche le pool) : un écart d'au moins 50 ans en Quelle année ?, ou un ratio d'au moins ×10 en Estimation.

---

## 9. Jeu 3 : Estimation

> **Une question chiffrée : chacun annonce un nombre, le plus proche (en proportion) marque.**

La machine à états est **identique** à celle de Quelle année ? (`announce → think → countdown → inputA → inputB → ready → revealed`), avec ces différences :

| Aspect | Estimation |
|---|---|
| Voix d'annonce | `spokenQuestion`, puis l'unité (« …en mètres ? ») |
| Carte recto | Énoncé + **pastille d'unité** visible en permanence |
| Numpad | Chiffres, **virgule**, et multiplicateurs **[mille] [million] [milliard]** en pastilles exclusives. L'aperçu est formaté en français en direct (« 6,5 millions »). Au plus 2 décimales. [Valider] est inactif si la valeur vaut 0. |
| Révélation (voix) | `spokenAnswer` (« Environ 6,7 millions ! »), puis la réaction, puis `context` |
| Révélation (écran) | La réponse en Fraunces 56 px, formatée, et un ratio par joueur (« ×1,3 », « exact ! »). RevealRuler en **échelle logarithmique** centrée sur la réponse, de ÷100 à ×100, avec écrêtage visuel (flèche) au-delà. |
| Mesure | Ratio, avec produits croisés (§5.2) |

---

## 10. Effets, voix, chronos et reprise

### 10.1 Voix et délai de secours

- Chaque état déclare une **réplique** (clé de pool + variables). La couche `voice` gère la file. Tout changement d'état **annule** la file en cours (`speechSynthesis.cancel()`).
- **Délai de secours** : iOS oublie parfois `onend`. Chaque réplique arme donc un minuteur de `max(1,5 s, 90 ms × nb de caractères ÷ débit)`. Le premier des deux, `onend` ou le minuteur, déclenche la transition. C'est crucial pour la lettre du Bac Éclair.
- **Voix indisponible ou en échec** : on bascule en mode texte, avec un toast discret (« Voix indisponible, l'arbitre lit à voix haute »). Les états `announce` s'affichent alors immédiatement et un bouton **[Lu ✓]** remplace l'attente de `onend`.

### 10.2 Chronos

- Les chronos (réflexion, Bac, contestation, auto-avance) sont des **effets** gérés par l'UI. Seule leur **expiration** devient un événement (`TIMER_EXPIRED`, `THINK_DONE`…).
- **Pause** : coupe la voix et fige le chrono. Elle n'est pas journalisée, car elle ne change aucune règle. À la reprise, la réplique de l'état courant est relue et le chrono reprend où il était.
- **Passage en arrière-plan** (appel, GPS, verrouillage) : pause automatique sur `visibilitychange`.
- **Chronos ×5** (debug) : toutes les durées sont divisées par 5.

### 10.3 Reprise après fermeture

Le temps écoulé ne fait pas partie de l'état. À la réouverture :

1. On recharge `{ config, seed, events }`.
2. On recalcule l'état.
3. Si un tour était en cours (n'importe quel état avant `resolved` ou `revealed`), on ajoute `TURN_RESTARTED`. Le tour repart de `announce` avec **le même item et la même lettre**. Les saisies déjà faites sont conservées, ce qui évite à l'arbitre de les retaper. Toute partie interrompue reprend donc proprement, au pire en réentendant la question.

### 10.4 Fin de partie et palmarès

- Le palmarès est mis à jour **à l'entrée** dans l'état `finished`, avec une écriture indexée par `matchId` : c'est donc idempotent.
- Si l'arbitre fait Annuler depuis l'écran de fin, l'entrée `matchId` est retirée du palmarès.
- « Revanche » et « Accueil » archivent la partie : `currentMatch` est vidé.

---

## 11. Packs, contenu disponible et recyclage

### 11.1 Éligibilité d'un item

Un item est éligible si les quatre conditions suivantes sont réunies :
1. il appartient à au moins un pack sélectionné ;
2. il n'est pas signalé ;
3. il n'a pas déjà été tiré **dans cette partie** ;
4. il n'est pas vu, si le paramètre « Ne pas reposer » est actif.

### 11.2 Vus

`seen` associe à chaque `itemId` le **numéro d'ordre** de la dernière apparition : un compteur global croissant, plus robuste qu'une date. Un item est marqué vu quand sa question est **posée** (`ANNOUNCE_DONE`) ou **passée**.

### 11.3 Recyclage

Si le nombre d'items éligibles est inférieur au besoin (Q × nombre de manches de ce jeu, plus une marge de 3 pour les « Passer » et la mort subite), on réintègre les items **vus les plus anciens** jusqu'à couvrir le besoin.

Si le total des items du jeu dans les packs sélectionnés, vus compris, est **inférieur à 10**, le jeu est désactivé pour la partie. La configuration affiche alors : « Bac Éclair désactivé : pas assez de catégories dans ces packs ». Si tous les jeux sont désactivés, le bouton « Lancer » est inactif et un message en donne la raison.

---

## 12. Debug et événements de debug

Les actions de debug qui modifient la partie sont des **événements**, pour que l'export rejoue exactement ce qui s'est passé :
- `DEBUG_FORCE_NEXT_GAME { game }` ;
- `DEBUG_FORCE_ITEM { itemId }` ;
- `DEBUG_SKIP_QUESTION` et `DEBUG_SKIP_ROUND` ;
- `DEBUG_SET_SCORE { A, B }` ;
- `DEBUG_JUMP { to: 'finalRound' | 'end' }`.

Ce sont des **décisions** au sens d'Annuler.

« Relancer avec une seed », import, chronos ×5, test de la voix et vidage des données restent **hors** du journal : ce sont des actions sur l'application, pas sur la partie.

---

## 13. Durées estimées

Hypothèses : débit de voix de 0,95, réflexion de 10 s, Bac à 15 s, auto-avance activée.

| Séquence | Détail | Durée |
|---|---|---|
| Tour Bac Éclair | annonce 3 s + décompte 3 s + course ~7 s (moyenne, max 15) + résolution 3 s + ~2 s de rejeux amortis | **~18-20 s** |
| Question Année / Estimation | annonce 6 s + réflexion 10 s + décompte 3 s + saisies 2 × 5 s + révélation et contexte ~12 s + transition 2 s | **~43-45 s** |
| Habillage de manche | RoundIntro 5 s + récap 6 s | ~11 s |
| Ouverture + fin de partie | voix + écrans | ~45 s |

| Format | Calcul (3 jeux activés) | Brut | Avec les rires et les débats (+15 %) |
|---|---|---|---|
| Express (3 × 3) | 3 Bac + 6 × 44 s + 3 × 11 s + 45 s | ~6 min 40 | **~7-8 min** ✅ |
| Classique (6 × 5) | 10 Bac + 20 × 44 s + 6 × 11 s + 45 s | ~19 min 50 | **~22-25 min** ✅ |
| Longue route (9 × 5) | 15 Bac + 30 × 44 s + 9 × 11 s + 45 s | ~29 min 30 | **~33-40 min** ✅ |

**Tension et rattrapage.** En Classique, une manche distribue environ 5 à 7 points. La dernière manche, doublée, en distribue 10 à 14. Un retard de 4 à 5 points reste donc rattrapable jusqu'au bout, sans rendre les 5 premières manches inutiles.

---

## 14. Mort subite

- Elle se déclenche si les scores sont égaux après la dernière manche.
- **Jeu** : Estimation, ou Quelle année ? si Estimation est désactivée. Si les deux sont désactivés, c'est un tour de Bac Éclair, où le premier mot valable gagne.
- **Flow** : le même que le jeu, précédé d'un écran dédié et du pool vocal *mort subite*.
- **Résolution** : le plus proche gagne la partie. La mort subite **n'ajoute pas de points** au score : le score final reste « 9 à 9 », avec la mention « victoire en mort subite ».
- **Nouvelle égalité, ou personne n'a répondu** : la voix annonce « Toujours rien ! Encore une ! » et une nouvelle question est tirée.
- **Un seul joueur a répondu** : il gagne.

---

## 15. Cas limites

| # | Cas | Traitement |
|---|---|---|
| 1 | Deux taps quasi simultanés (A puis B en 50 ms) | Le premier événement fait passer en `resolved`. Le second est invalide dans cet état et est ignoré. |
| 2 | Tap au moment exact où le chrono expire | L'ordre d'arrivée décide. Si `TIMER_EXPIRED` arrive d'abord, l'état `timeout` permet toujours d'attribuer le point. |
| 3 | Tap pendant `announce` ou `countdown` | Les boutons joueurs sont inactifs. Un mot dit avant « top » ne compte pas : les règles le disent. |
| 4 | Annuler au-delà d'une fin de manche | Le récap disparaît, le jeton est repris, les scores sont recalculés (§6.4). |
| 5 | Annuler après la fin de partie | L'état revient avant la dernière décision et l'entrée du palmarès est retirée (§10.4). |
| 6 | Passer pendant la mort subite | Autorisé : nouvelle question. |
| 7 | Les deux joueurs « Pas de réponse » | 0 point ; en mort subite, une autre question. |
| 8 | Valeur 0 en Estimation | [Valider] est inactif. |
| 9 | Prénoms vides | Valeurs par défaut « Joueur 1 » et « Joueur 2 ». |
| 10 | Prénoms identiques | Refusé : « Deux prénoms différents, sinon l'animateur s'emmêle ! » |
| 11 | Changement de paramètres en cours de partie | Les règles restent figées (§5.3) ; les effets s'appliquent dès l'état suivant. |
| 12 | Plus d'items éligibles en cours de partie (Passer en rafale) | Recyclage des plus anciens vus, puis de n'importe quel item non tiré dans cette partie. Si vraiment rien ne reste, le bouton Passer est inactif. |
| 13 | Item signalé en cours de partie | Il reste joué jusqu'au bout du tour et sera exclu des parties suivantes. |
| 14 | Voix qui ne charge pas (`voiceschanged` jamais reçu) | Délai de secours de 1,5 s, puis voix par défaut du navigateur ; si aucune voix, mode texte. |
| 15 | `onend` jamais reçu (iOS) | Délai de secours (§10.1). |
| 16 | App en arrière-plan | Pause automatique ; au retour, Wake Lock réacquis et réplique relue. |
| 17 | Wake Lock refusé ou indisponible (iOS < 18.4 en PWA) | Repli silencieux, entrée dans le journal, aucun message à l'utilisateur. |
| 18 | `currentMatch` corrompu | La validation zod échoue : retour à l'accueil sans partie en cours, et l'erreur est journalisée. |
| 19 | Import d'un export invalide | Message d'erreur dans l'écran debug ; la partie en cours n'est pas touchée. |
| 20 | Égalité de manche 0-0 (tout passé) | Un jeton chacun, comme pour toute égalité. |
| 21 | Score de manche doublée et jeton | Le jeton va au gagnant de la manche ; le doublement ne change rien à ce calcul. |

---

## 16. Règles affichées (écran Règles)

**Les règles d'or**
1. On répond à voix haute. Pour les années et les estimations, on annonce **en même temps** au signal « 3, 2, 1, annoncez ! ».
2. Ce qui est dit est dit : pas de changement de réponse après l'annonce.
3. En cas de doute ou de désaccord sur un mot, **le tour est rejoué**.

**En une phrase par jeu**
- ⚡ **Bac Éclair** : une catégorie, une lettre ; le premier mot valable marque.
- ⌛ **Quelle année ?** : un événement ; le plus proche de l'année marque, et pile la bonne année vaut double.
- ⚖ **Estimation** : un chiffre à deviner ; le plus proche en proportion marque, et dans le mille vaut double.

**Et aussi** : la dernière manche vaut double. En cas d'égalité finale, une mort subite départage.

---

## 17. Propositions d'amélioration (hors périmètre, à accepter ou refuser)

| Id | Proposition | Pourquoi | Coût |
|---|---|---|---|
| 💡 **A** | **Score à la voix après chaque point** : « Point pour Léa… 3 à 2 ! » (variante courte : seulement quand l'écart change de signe ou toutes les 2 questions) | Le conducteur ne voit jamais l'écran. Aujourd'hui, il n'entend le score qu'aux intros de manche. | Faible |
| 💡 **B** | **Relire les propositions avant la révélation** : « Léa dit 1990, Tom dit 1985… c'était en 1989 ! » | Suspense ; le conducteur vérifie la saisie de l'arbitre sans regarder. Coûte environ 3 s par question. | Faible |
| 💡 **C** | **Temps de grâce conducteur** au Bac Éclair : le bouton du conducteur reste valable 1 s après le tap de l'arbitre-joueur sur son propre bouton. Désactivé par défaut. | Le conducteur pense en conduisant, alors que l'arbitre a le doigt sur l'écran. | Moyen : complexifie la règle, ce que je ne recommande pas en v1. |

Ma recommandation : **A et B oui**, **C non** en v1. On pourra la tester plus tard si le Bac Éclair se révèle déséquilibré à l'usage.

---

## Annexe A : pondération des lettres (Bac Éclair)

Le poids approximatif de chaque initiale est tiré de la fréquence des initiales de noms communs et de noms propres en français, puis lissé pour que le jeu reste varié : une lettre fréquente n'écrase pas les autres.

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

Une catégorie doit compter au moins **15 lettres autorisées** (lettres rares exclues), sauf l'exception des packs Écosse et Belgique proposée dans `CONTENT_GUIDE.md` §6.
