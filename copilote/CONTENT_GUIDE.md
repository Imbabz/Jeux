# Copilote : charte éditoriale du contenu

> Le contenu est le cœur du jeu. Une question fausse, ambiguë ou imprononçable gâche un tour ; une bonne anecdote fait parler jusqu'à la prochaine aire d'autoroute.
> Ce guide s'applique à tout item ajouté dans `src/content/*.json` et aux répliques de l'animateur (`host.json`).

---

## 1. Les cinq commandements

1. **Exact, ou supprimé.** On n'écrit que des faits établis, dont on est certain. Au moindre doute, on supprime l'item : un item de moins coûte moins qu'une dispute.
2. **Oral d'abord.** Le copilote lit la carte à voix haute : l'énoncé doit se **lire d'un trait** et se comprendre **du premier coup, à l'oreille, en roulant**. Phrases courtes, pas de parenthèses, pas de sigle ambigu, pas de nombre à rallonge.
3. **Surprendre.** Chaque `context` est **une seule phrase** d'anecdote qui donne envie de dire « Ah bon ?! ».
4. **Varier.** Varier les époques, les domaines et les registres (sérieux, insolite, pop). Pas de biais vers un seul pays hors des packs dédiés, et pas plus de 3 items sur un même sujet par pack.
5. **Rester bienveillant.** Ni sujet morbide gratuit, ni moquerie de groupes, ni politique clivante récente. Une catastrophe historique peut figurer si l'item reste factuel et respectueux.

---

## 2. Difficulté

| Niveau | Définition | Cible | Test rapide |
|---|---|---|---|
| **1** | La plupart des adultes ont une idée | ~40 % | « Mes parents auraient une réponse à ±10 ans ou ×2. » |
| **2** | Intuition possible | ~40 % | « Je peux raisonner pour m'approcher. » |
| **3** | Pour les experts, ou franchement surprenant | ~20 % | « Personne autour de moi ne le sait, mais tout le monde voudra connaître la réponse. » |

Au **Bac Éclair**, la difficulté mesure l'**étendue de la catégorie** : 1 = des centaines de mots possibles (« un animal »), 3 = une catégorie étroite (« une ville d'Écosse »).

---

## 3. Packs

| id | Nom | Emoji | Description | Minimum par jeu |
|---|---|---|---|---|
| `general` | Général | 🌍 | Les classiques, pour tout le monde | 30 |
| `scotland` | Écosse | 🦄 | Highlands, whisky, inventeurs et légendes (la licorne est l'animal national) | 25 |
| `belgium` | Belgique | 🇧🇪 | BD, frites, surréalisme et compromis | 25 |
| `pop` | Culture pop | 🎬 | Films, séries, musique, jeux vidéo, BD | 30 |
| `sport` | Sport | ⚽ | Records, compétitions, légendes | 30 |
| `history-science` | Histoire & sciences | 🔭 | Grandes dates, découvertes, inventions | 30 |
| `geo-travel` | Géographie & voyages | 🧭 | Pays, villes, reliefs, distances | 30 |
| `food` | Gastronomie | 🧀 | Plats, produits, chiffres de cuisine | 30 |

- Un item peut appartenir à **plusieurs packs** : Tintin est dans `belgium` et `pop`. Le pack principal est listé **en premier**.
- `general` contient les classiques du Bac Éclair : animal, pays, prénom, métier, objet, fruit ou légume, sport, couleur, instrument, marque…
- 🦄 a été préféré au drapeau écossais 🏴󠁧󠁢󠁳󠁣󠁴󠁿, qui s'affiche mal sur une partie des appareils Android.

**Volumes totaux** : 120 catégories de Bac, 250 événements d'année, 200 questions d'estimation.

---

## 4. Schémas

Les ids sont **stables** et ne sont jamais réutilisés : on supprime un item, on ne le recycle pas. Ils sont préfixés par jeu et numérotés sur 4 chiffres.

### 4.1 Bac Éclair (`bac.json`)

```ts
{
  id: 'bac-0001',
  packs: ['general'],
  label: 'Un animal',         // affiché et lu par le copilote : « Un animal… en B ! »
  difficulty: 1,
  excludedLetters: ['X'],     // lettres quasi impossibles POUR CETTE CATÉGORIE (rares comprises)
}
```

### 4.2 Quelle année ? (`year.json`)

```ts
{
  id: 'yr-0001',
  packs: ['history-science', 'general'],
  category: 'Histoire',                       // lu en premier : « Histoire : … »
  text: 'La chute du mur de Berlin',          // affiché et lu à voix haute par le copilote
  year: 1989,                                 // 1000 ≤ year ≤ 2025 en v1
  centuryHint: '19',                          // = 2 premiers chiffres de year
  difficulty: 1,
  context: '…',                               // une phrase
}
```

### 4.3 Estimation (`estim.json`)

```ts
{
  id: 'est-0001',
  packs: ['history-science'],
  question: 'Combien d'os compte le squelette d'un adulte ?',   // affiché et lu
  unit: 'os',                         // affiché sur la carte
  answer: 206,                        // > 0, valeur de référence
  answerLabel: '206 os',              // facultatif : réponse affichée si le format auto ne suffit pas
  difficulty: 1,
  context: '…',
  referenceYear: 2025,                // si la valeur évolue dans le temps
}
```

### 4.4 Règles de rédaction par champ

| Champ | Règle |
|---|---|
| `text` / `question` / `label` | Écrit pour être **lu à voix haute** : pas de chiffres romains (« Louis XIV » → « Louis 14 »), pas de sigle sauf s'il se prononce comme un mot (« l'ONU », oui ; « la SNCB », on écrit « les chemins de fer belges »). Doit tenir sur 4 lignes à 26 px, soit environ 90 caractères au maximum. |
| `year` | L'événement doit être **daté sans ambiguïté**. Si l'événement s'étale, on précise lequel des moments compte : « sortie en France », « premier album », « inauguration », « naissance ». |
| `answer` | Une valeur **stable** de préférence. Sinon, on renseigne `referenceYear` et on arrondit à 2 ou 3 chiffres significatifs. |
| `answerLabel` | Facultatif. Par défaut, l'app formate `answer` et l'unité (« ≈ 11,8 millions d'habitants » si `referenceYear` est présent). À n'utiliser que si ce format ne convient pas. |
| `context` | Une phrase de 160 caractères au maximum, vraie et vérifiable. Elle ne répète pas la réponse : elle ajoute quelque chose. |
| `excludedLetters` | Une lettre est **autorisée** seulement si un non-spécialiste trouve au moins **2 mots** en 10 secondes. |

---

## 5. Exemples commentés

### 5.1 Quelle année ?

**✅ Exemple 1 : le classique solide**
```json
{ "id": "yr-0001", "packs": ["history-science", "general"], "category": "Histoire",
  "text": "La chute du mur de Berlin",
  "year": 1989, "centuryHint": "19", "difficulty": 1,
  "context": "Un porte-parole a annoncé par erreur que la frontière ouvrait « immédiatement » : la foule s'y est précipitée le soir même." }
```
> Difficulté 1 : presque tout le monde situe l'événement à quelques années près. Le contexte raconte **comment** c'est arrivé, pas la date.

**✅ Exemple 2 : préciser le moment exact**
```json
{ "id": "yr-0002", "packs": ["belgium", "pop"], "category": "Bande dessinée",
  "text": "La toute première apparition de Tintin, dans un journal belge",
  "year": 1929, "centuryHint": "19", "difficulty": 2,
  "context": "Hergé, c'est la prononciation des initiales R.G., pour Georges Remi." }
```
> « Tintin » seul serait ambigu : on pourrait parler du premier album, de la série télévisée ou du film. « Toute première apparition » ne désigne qu'une date (1929, *Le Petit Vingtième*).

**✅ Exemple 3 : la précision géographique**
```json
{ "id": "yr-0003", "packs": ["pop"], "category": "Livres",
  "text": "La sortie en France du premier tome de Harry Potter",
  "year": 1998, "centuryHint": "19", "difficulty": 2,
  "context": "Le manuscrit avait été refusé par une douzaine d'éditeurs avant d'être accepté par une petite maison londonienne." }
```
> L'édition britannique date de 1997 et la française de 1998. Sans « en France », l'item serait contestable : c'est le cas typique cité par le brief.

**✅ Exemple 4 : pack Écosse, avec un contexte inattendu**
```json
{ "id": "yr-0004", "packs": ["scotland", "history-science"], "category": "Sciences",
  "text": "La naissance de Dolly, la brebis clonée, près d'Édimbourg",
  "year": 1996, "centuryHint": "19", "difficulty": 2,
  "context": "Elle doit son prénom à Dolly Parton, car elle a été clonée à partir d'une cellule de glande mammaire." }
```
> Dolly est née en 1996, mais sa naissance n'a été **annoncée** qu'en 1997 : « la naissance » lève l'ambiguïté. Le contexte provoque un éclat de rire garanti, tout en restant exact.

**❌ Exemple 5 : rejeté**
```json
{ "text": "L'invention de l'imprimerie", "year": 1450 }
```
> Rejeté pour deux raisons. La date est approximative (Gutenberg, vers 1450, sans date unique), et la Chine et la Corée imprimaient bien avant : la question appelle le débat, pas la réponse. Une reformulation (« L'impression de la Bible de Gutenberg ») reste trop floue, entre 1452 et 1455. **On supprime.**

### 5.2 Estimation

**✅ Exemple 1 : stable et parlant**
```json
{ "id": "est-0001", "packs": ["history-science", "general"],
  "question": "Combien d'os compte le squelette d'un adulte ?",
  "unit": "os", "answer": 206, "difficulty": 1,
  "context": "Un nouveau-né en a bien davantage : beaucoup fusionnent en grandissant." }
```
> Une valeur fixe et connue de beaucoup, donc la difficulté 1 est juste. L'exactitude est possible : un ratio ≤ 1,01 signifie qu'il faut dire 205, 206 ou 207.

**✅ Exemple 2 : pack Écosse**
```json
{ "id": "est-0002", "packs": ["scotland", "geo-travel"],
  "question": "Quelle est l'altitude du Ben Nevis, le plus haut sommet du Royaume-Uni ?",
  "unit": "mètres", "answer": 1345, "difficulty": 2,
  "context": "Un observatoire météo a fonctionné en permanence à son sommet de 1883 à 1904." }
```
> L'énoncé donne un indice (« le plus haut sommet ») qui permet de raisonner : c'est la définition de la difficulté 2.

**✅ Exemple 3 : une valeur qui bouge, donc `referenceYear`**
```json
{ "id": "est-0003", "packs": ["belgium", "geo-travel"],
  "question": "Combien d'habitants compte la Belgique ?",
  "unit": "habitants", "answer": 11800000,
  "difficulty": 1, "referenceYear": 2025,
  "context": "La Région de Bruxelles-Capitale en compte à elle seule environ 1,2 million." }
```
> La population évolue : on arrondit à 3 chiffres significatifs et on date la valeur. Le multiplicateur [million] du numpad est fait pour ce genre de question.

**✅ Exemple 4 : grand nombre, réponse orale arrondie**
```json
{ "id": "est-0004", "packs": ["history-science"],
  "question": "Quelle est la distance moyenne entre la Terre et la Lune ?",
  "unit": "kilomètres", "answer": 384400,
  "difficulty": 2,
  "context": "La Lune s'éloigne de nous d'environ 3,8 centimètres par an." }
```
> L'énoncé ne contient aucun nombre. La réponse lue est arrondie (« environ »), alors que la valeur stockée reste précise pour le calcul du ratio.

**❌ Exemple 5 : rejeté**
```json
{ "question": "Combien de personnes parlent français dans le monde ?" }
```
> Rejeté : le chiffre dépend de la définition (langue maternelle ? usage courant ? apprenants ?) et varie selon les sources du simple au double. Le joueur qui a raison peut perdre. Un item de ce type ne serait recevable qu'avec une définition stricte et une source unique ; ici, **on supprime**.

### 5.3 Bac Éclair

**✅ Exemple 1 : le classique illimité**
```json
{ "id": "bac-0001", "packs": ["general"], "label": "Un animal",
  "difficulty": 1, "excludedLetters": [] }
```
> Toutes les lettres courantes passent, et même les rares (Kangourou, Quokka, Wapiti, Xérus, Yack, Zèbre). Aucune exclusion.

**✅ Exemple 2 : exclusions justifiées**
```json
{ "id": "bac-0002", "packs": ["general", "geo-travel"], "label": "Un pays",
  "difficulty": 1, "excludedLetters": ["W", "X"] }
```
> Aucun pays souverain ne commence par W ou X en français. Ces lettres sont exclues même si les lettres rares sont activées. En revanche, K (Kenya), Q (Qatar), Y (Yémen) et Z (Zambie) restent possibles.

**✅ Exemple 3 : catégorie plus étroite**
```json
{ "id": "bac-0003", "packs": ["food", "belgium"], "label": "Un fromage",
  "difficulty": 2, "excludedLetters": ["I", "J", "U", "K", "Q", "W", "X", "Y", "Z"] }
```
> Avec I, J et U exclues, 17 lettres courantes restent autorisées, au-dessus du seuil de 15. On garde H pour le Herve, ce qui justifie aussi le rattachement au pack Belgique.

**⚠️ Exemple 4 : pack régional, sous le seuil**
```json
{ "id": "bac-0004", "packs": ["scotland"], "label": "Une ville d'Écosse",
  "difficulty": 3, "excludedLetters": ["B", "C", "H", "J", "N", "R", "U", "V", "K", "Q", "W", "X", "Y", "Z"] }
```
> Un non-spécialiste trouve facilement Aberdeen, Dundee, Édimbourg, Falkirk, Glasgow, Inverness, Livingston, Motherwell, Oban, Perth, Stirling et Thurso, soit **12 lettres seulement**. Voir §6.

**❌ Exemple 5 : rejeté**
```json
{ "label": "Un mot de plus de huit lettres" }
```
> Rejeté : l'arbitre ne peut pas vérifier le compte de lettres en une seconde, à l'oral, en voiture. Une catégorie doit pouvoir se valider **instantanément** et sans calcul.

---

## 6. 🎲 L'exception des packs Écosse et Belgique (Bac Éclair) : réglage par défaut, à revoir en jouant

Exiger **25 catégories à au moins 15 lettres jouables** pour l'Écosse et la Belgique pousse vers des catégories soit trop pointues, soit hors sujet. Deux solutions sont possibles, et je propose de **combiner les deux** :

1. **Seuil abaissé à 10 lettres** pour les catégories rattachées **uniquement** à `scotland` ou `belgium`. Le test de contenu applique ce seuil.
2. **Catégories génériques rattachées aussi à ces packs**, quand elles s'y prêtent naturellement. Par exemple : « Un fromage » (Herve, Maredsous…) → `belgium` ; « Un personnage de BD » → `belgium` ; « Un sport de plein air » → `scotland`. Cela réduit le besoin en catégories purement régionales à environ 12-15 par pack.

---

## 7. Animateur (`host.json`)

### 7.1 Ton

Il n'y a pas de voix de synthèse. L'animateur s'exprime par des **bulles de texte** courtes, affichées aux moments clés, que le copilote peut lire à voix haute s'il en a envie.

L'animateur est **complice, drôle et sobre** : il s'adresse à deux amis, pas à un plateau télé. Les phrases sont courtes (moins de 3 secondes à lire), avec au plus un trait d'humour par réplique, et jamais de moquerie appuyée envers le perdant. Il ne se répète jamais d'une fois sur l'autre : le tirage se fait sans répétition immédiate.

### 7.2 Variables

`{A}`, `{B}` : les prénoms. `{gagnant}`, `{perdant}`, `{meneur}`, `{conducteur}`. `{scoreA}`, `{scoreB}`. `{manche}`, `{total}`. `{jeu}`. `{ecart}`.

Une réplique contenant `{conducteur}` est ignorée si personne n'est désigné conducteur.

### 7.3 Pools (au moins 8 variantes chacun à l'étape 4 ; 2 exemples ici)

| Pool | Exemple 1 | Exemple 2 |
|---|---|---|
| `opening` | « Bienvenue à bord ! {A} contre {B}, ceinture attachée, cerveau allumé. » | « Mesdames et messieurs, votre quiz va bientôt décoller. {conducteur}, toi tu gardes les yeux sur la route ! » |
| `openingRecord` | « Au général, {meneur} mène {scoreA} à {scoreB}. Ça peut changer. » | « Première partie entre vous deux : tout est encore possible. » |
| `intro.bac` | « Bac Éclair ! Une catégorie, une lettre, et le plus rapide gagne. » | « Échauffez vos méninges : place au Bac Éclair. » |
| `intro.year` | « Quelle année ? Sortez vos calendriers mentaux. » | « Voyage dans le temps : à vous de dater l'événement. » |
| `intro.estim` | « Estimation ! Pas besoin d'être exact, juste moins à côté que l'autre. » | « Place aux chiffres. Faites confiance à votre instinct. » |
| `exact` | « Dans le mille ! Chapeau. » | « Exactement ça. Je suis impressionné. » |
| `hugeGap` | « Ah… on n'était pas du tout dans le même siècle. » | « Là, c'est plus une estimation, c'est de la poésie. » |
| `tie` | « Égalité parfaite ! Un point chacun. » | « Impossible de vous départager. Match nul sur celle-là. » |
| `takesLead` | « Et {meneur} passe devant ! » | « Changement en tête : {meneur} prend les commandes. » |
| `finalRound` | « Dernière manche ! Tous les points comptent double. » | « On entre dans le money time : points doublés jusqu'au bout. » |
| `suddenDeath` | « Égalité parfaite ! Mort subite : le plus proche gagne la partie. » | « Personne ne veut perdre ? Une question pour tout décider. » |
| `closeWin` | « Victoire de {gagnant} sur le fil, {scoreA} à {scoreB} ! Quel match. » | « {gagnant} l'emporte d'un souffle. {perdant}, la revanche s'impose. » |
| `landslide` | « Victoire écrasante de {gagnant} ! {perdant}, la route est encore longue. » | « {gagnant} a survolé la partie. Rien à dire, c'était une démonstration. » |

---

## 8. Processus de relecture

1. Rédaction par lots de 25 items, avec la source vérifiée à la rédaction (non stockée dans le JSON).
2. Passage des tests de contenu : schéma, unicité, doublons, bornes, packs, volumes, lettres.
3. **Échantillon de 20 items par jeu soumis à ta relecture** (étape 6), avec la liste des items supprimés et la raison de chaque suppression.
4. En jeu, le bouton **[Signaler]** alimente la liste des items à corriger, exportable depuis le debug.

### Checklist par item

- [ ] Je suis **certain** de la réponse.
- [ ] L'énoncé lu à voix haute par le copilote se comprend du premier coup.
- [ ] Une seule réponse possible (date ou valeur non ambiguë).
- [ ] Le `context` est vrai, en une phrase, et il apprend quelque chose.
- [ ] La difficulté est cohérente avec la définition du §2.
- [ ] Les packs sont pertinents, avec le pack principal en premier.
