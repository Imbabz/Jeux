/* ============================================================
   SCÉNARIOS — structurés en scènes navigables (mode MJ)
   Chaque scène :
     id, titre, lieu,
     lecture: []   -> texte À LIRE À VOIX HAUTE au joueur
     mj: []        -> notes / mécaniques pour le MJ uniquement
     monstres: []  -> ids du bestiaire présents
     tresor: []    -> butin
     choix: [{txt, cible}]  -> navigation
   ============================================================ */

window.SCENARIOS = [
/* ==========================================================================
   AVENTURE 1 — CE QUI SE CACHE À L'INTÉRIEUR  (What Lurks Within?)
   ========================================================================== */
{
  id: "wlw",
  titre: "Ce qui se cache à l'intérieur",
  sousTitre: "Royaume de Daven — Village d'Eichen",
  niveau: "Personnages de niveau 2 (4 à 5 joueurs)",
  resume: "D'étranges disparitions et des cadavres décapités frappent le paisible village d'Eichen. Derrière tout cela : un culte de Grlarshh mené par la famille Morgenstein, et une monstruosité extraplanaire — la Reine Vargouille — tapie dans une ancienne tombe orc.",
  auteur: "Martin McKenzie — World of Farland (2015)",
  debut: "wlw-intro",
  scenes: [
    {
      id: "wlw-intro", titre: "Introduction & accroches", lieu: "Avant de commencer",
      lecture: [],
      mj: [
        "Rappel monnaie : Farland = étalon ARGENT. 1 pa = 1 po du D&D standard.",
        "Le scénario est découpé par lieux : selon où les héros enquêtent, on saute d'une section à l'autre. Le but ultime est de les amener à la TOMBE ORC.",
        "Choisis une accroche pour lancer les héros :",
        "• Résidents : ils vivent à Eichen, on leur demande d'enquêter.",
        "• Liens familiaux : un disparu est un proche d'un héros.",
        "• Les Pourfendeurs : les héros sont une guilde secrète de chasseurs de morts-vivants.",
        "• Voyage de hasard : ils passent, entendent parler du problème à la taverne + une affiche (250 pa de récompense).",
        "• Aider le mage : un vieux mage les paie pour ramener une preuve de la créature extraplanaire.",
        "• Suite de « Les Tours de la Nuit » : un cousin d'un chef de camp de Loch Brech réclame de l'aide."
      ],
      choix: [{ txt: "Arriver à Eichen ▶", cible: "wlw-eichen" }]
    },
    {
      id: "wlw-eichen", titre: "Le village d'Eichen — les rumeurs", lieu: "Partie 1",
      lecture: [
        "Eichen est un petit village d'environ 500 âmes, presque tous humains, à la lisière de la forêt de Chênaie (Oaken Forest). Deux tavernes seulement : l'auberge « Le Gobelin Boiteux » et la taverne « Le Mage Joyeux ». Les gens sont inquiets : la nuit, on disparaît, et on retrouve parfois des corps… sans tête."
      ],
      mj: [
        "Figures d'autorité : Arnulf Von Gerhan (maire/marchand), Hogan Von Feran (capitaine de la garde), shérif Bernard Hugo, prêtresse Katrina Rabe (Bestra), prêtre Boris Whiteanvil (Neltak), l'alchimiste Nebnel Luts Hiller.",
        "Valeur max d'un objet acheté/vendu : 100 pa.",
        "Distribue les RUMEURS (jet d'Investigation DC 5 à 15 chacune) — tu peux les lire directement :",
        "• Chasseurs disparus : 2 chasseurs tués dans les bois il y a 3 semaines, retrouvés sans tête mais intacts pour le reste (DC 10).",
        "• Garçon disparu : un jeune garçon parti promener son chien dans la forêt il y a 9 jours ; le chien est revenu terrorisé (DC 10).",
        "• Le vieil ermite : Oscar Drok, nain reclus à ~1,5 km au nord, n'est plus venu au marché depuis un mois (DC 10).",
        "• Le manoir Morgenstein : le vieux Morgenstein, sa femme et son fils invisibles depuis 3 mois ; le collecteur d'impôts n'en serait jamais revenu (DC 5).",
        "• Secrets de famille : les Morgenstein sortent surtout la nuit ; on murmure des tunnels sous le domaine (DC 15).",
        "• La tombe : on parle d'une tombe récemment découverte dans la forêt, maudite et piégée (DC 15).",
        "URGENCE : si les héros tardent, de nouvelles victimes tombent (couple + fils fermiers dans 2 jours ; puis un PNJ ami ; puis l'auberge attaquée par 6 vargouilles). Ajoute 3 vargouilles supplémentaires quelque part."
      ],
      choix: [
        { txt: "Aller au manoir Morgenstein", cible: "wlw-manoir-ext" },
        { txt: "Aller à la cabane d'Oscar Drok", cible: "wlw-drok-ext" }
      ]
    },

    /* --- MANOIR --- */
    {
      id: "wlw-manoir-ext", titre: "Le manoir Morgenstein — extérieur", lieu: "Partie 2",
      lecture: [
        "Le vieux manoir est délabré, jadis fastueux, aujourd'hui couvert de poussière. On y accède par un chemin de terre à travers des jardins envahis par la végétation."
      ],
      mj: [
        "Victor le bossu surveille : 50 % à une fenêtre, 50 % à arpenter le parc. Perception DC 10 pour qu'il repère les héros de jour.",
        "S'il les repère, il ne se bat pas : il court prévenir Gregory et verrouille derrière lui (crochetage DC 20). Casser une fenêtre sans précaution alerte tout le monde.",
        "L'intérieur est vide (meubles vendus pour financer la magie noire), sauf le taudis de Victor. Le seul point d'intérêt : l'entrée de la cave, bien moins poussiéreuse."
      ],
      monstres: ["victor"],
      choix: [
        { txt: "Descendre l'escalier de la cave ▼", cible: "wlw-manoir-stairs" },
        { txt: "◀ Retour au village", cible: "wlw-eichen" }
      ]
    },
    {
      id: "wlw-manoir-stairs", titre: "Cave — haut de l'escalier", lieu: "Sous-sol niveau 1",
      lecture: [
        "En bas de l'escalier de pierre humide et usé, à une dizaine de mètres, vacille une lueur de torche. Vous entendez le murmure d'une conversation… vous devinez la présence d'une demi-douzaine de voix différentes."
      ],
      mj: [
        "Murs et sols glissants : tout PJ qui charge/court/saute/culbute fait un JS Dextérité DC 10 ou tombe à terre. Escalade avec désavantage.",
        "La salle du bas sert de réfectoire aux cultistes. Ils jouent aux cartes entre deux rituels : sauf alerte, ils ne réagissent qu'à une charge frontale.",
        "Toutes les descriptions supposent une approche DE JOUR, ennemis non alertés. Sinon, ajuste."
      ],
      choix: [{ txt: "Entrer — Aire A ▶", cible: "wlw-manoir-A" }]
    },
    {
      id: "wlw-manoir-A", titre: "Aire A — le réfectoire", lieu: "Sous-sol niveau 1",
      lecture: [
        "Vous débouchez dans une salle éclairée aux torches. Au centre, trois humanoïdes en robe rouge foncé, d'âges variés, sont absorbés dans une partie de cartes autour d'une grande table de chêne. Dans un coin se dresse une vision glaçante : un ours squelettique de plus de deux mètres, aux orbites noires et vides, semble vous fixer !"
      ],
      mj: [
        "Quelques secondes après l'entrée, les cultistes sont repérés : ils dégainent gourdins et dagues (action complète), et l'un crie le mot de commande « nefarious » — l'ours squelette attaque tout ce qui ne porte pas de robe rouge (« dictum » l'arrête).",
        "L'un des cultistes court prévenir Gregory dans son sanctuaire (aire E).",
        "Butin sur la table : lanterne à capote (30 min d'huile), cruche de bière, 17 pe + 18 pc. Dans un coin : 2 robes rouges, 2 torches neuves, 8 pintes d'huile."
      ],
      monstres: ["cultiste", "ours-squelette"],
      tresor: ["17 pe, 18 pc", "2 robes de cultiste, 2 torches, 8 pintes d'huile"],
      choix: [
        { txt: "Porte vers l'Aire B (prison)", cible: "wlw-manoir-B" },
        { txt: "Porte vers l'Aire C (cellier)", cible: "wlw-manoir-C" }
      ]
    },
    {
      id: "wlw-manoir-B", titre: "Aire B — la prison", lieu: "Sous-sol niveau 1",
      lecture: [
        "Un petit carrefour non éclairé : des portes à gauche, à droite et droit devant. De la porte de gauche vous parviennent des cris étouffés, comme quelqu'un bâillonné qui tente d'attirer votre attention…"
      ],
      mj: [
        "Deux cellules. Celle de droite : vide, ouverte. Celle de gauche : verrouillée (crochetage DC 20, une clé sur un cultiste de l'aire A) — elle contient un prisonnier.",
        "Prisonnier : Frederic Goldhorn, collecteur d'impôts, détenu 2 semaines, dénutri. Libéré, il révèle : il devait être sacrifié à Grlarshh ; il a entendu parler d'un passage secret vers le niveau inférieur, et d'une « bête reine » dans une tombe. Promet 25 pa à chacun s'il est ramené au village."
      ],
      choix: [
        { txt: "◀ Retour Aire A", cible: "wlw-manoir-A" },
        { txt: "Vers l'Aire C (cellier)", cible: "wlw-manoir-C" }
      ]
    },
    {
      id: "wlw-manoir-C", titre: "Aire C — le cellier & le passage secret", lieu: "Sous-sol niveau 1",
      lecture: [
        "Une pièce poussiéreuse de 3 m sur 9. Contre les murs, des rangées de casiers à vin vides. À environ 6 m, une porte robuste dans le mur de gauche."
      ],
      mj: [
        "Porte de gauche PIÉGÉE : arbalète double de l'autre côté (déclenchée à l'ouverture). Un loquet au sol permet de passer sans déclencher. Perception DC 15 repère le piège, Investigation DC 5 le désarme.",
        "  › Piège d'arbalète double : +4 à toucher, 2 cibles au hasard, 6 (1d8+2) perforants chacune.",
        "Fouille (10 min) : 3 bouteilles de spiritueux (5 po chacune) derrière un casier — Perception DC 20.",
        "PASSAGE SECRET vers le niveau 2 : porte dissimulée au mur nord (Perception DC 15 pour trouver, Investigation DC 10 pour ouvrir — pierre descellée à gauche).",
        "Fosse piégée au sol à ~3 m de la porte secrète : bâche de cuir camouflée. Perception DC 15 (manque de passage) / Investigation DC 12. JS Dex DC 15 sinon chute : 6 (2d6) contondants + 5 (1d10) tranchants (verre brisé). Parois graissées : escalade avec désavantage."
      ],
      tresor: ["3 bouteilles de spiritueux (5 po ch.)"],
      choix: [
        { txt: "◀ Retour Aire A", cible: "wlw-manoir-A" },
        { txt: "Descendre par le passage secret ▼ (Aire D)", cible: "wlw-manoir-D" }
      ]
    },
    {
      id: "wlw-manoir-D", titre: "Aire D — les gardes squelettes", lieu: "Sous-sol niveau 2",
      lecture: [
        "Vous débouchez dans une vaste salle pavée, anormalement froide. Trois squelettes armés et armurés se tiennent au garde-à-vous devant une grande double porte de bois. Une torche vacillante au-dessus des portes est le seul éclairage de cette pièce nue."
      ],
      mj: [
        "Les 3 squelettes (CA 15 chemise de mailles, épée longue 6/1d8+2) attaquent quiconque entre sans dire le mot de passe « Mortis nu vigo ».",
        "Si Gregory + ses 2 cultistes entendent le combat (très probable), ils viennent en renfort.",
        "NOTE : tout ce niveau est impie — les morts-vivants ont AVANTAGE aux JS pour résister au Renvoi."
      ],
      monstres: ["squelette"],
      choix: [{ txt: "Franchir la double porte — Aire E ▶", cible: "wlw-manoir-E" }]
    },
    {
      id: "wlw-manoir-E", titre: "Aire E — le sanctuaire de Gregory", lieu: "Sous-sol niveau 2",
      lecture: [
        "Un énorme autel de granit taché de sang domine la pièce, sur une estrade. Derrière, un grand symbole de bois d'un dieu obscur ; sur l'autel, une dague courbe et dentelée croûtée de sang séché. Deux étagères débordent de vieux grimoires, un secrétaire couvert de plumes et d'encre. Debout devant l'autel : un prêtre en riches robes rouge et noir, jeune homme imposant à la peau blafarde, aux yeux fous. Deux cultistes l'encadrent et arment leurs arbalètes. Dans un coin, un bossu tremblant vous fixe, terrifié…"
      ],
      mj: [
        "Gregory Morgenstein (stats Fanatique de secte). R1 : hold person (DC 11) sur le personnage le plus lourdement armuré / le moins intelligent, puis mêlée. Combat jusqu'à la mort.",
        "Le bossu (Victor) reste prostré dans son coin toute la bataille. S'il est épargné, il peut ensuite guider vers la tombe.",
        "Coffre verrouillé (crochetage DC 15, CA 15, 12 PV) : 7 pa, 258 pc, 34 pe, 2 ambres (10 pa ch.), bague argent+émeraude (10 pa), saphir (20 pa), chandeliers d'argent (10 pa), couverts d'argent (5 pa), bijoux femme (20 pa), potion de soins, et une CARTE grossière d'Eichen avec un grand X noir dans la forêt. (Si le coffre est fracassé, la potion se brise.)",
        "Sur le secrétaire : notes de torture + LA LETTRE (voir ci-dessous) qui révèle « la Reine » et la nouvelle tombe."
      ],
      monstres: ["gregory", "cultiste"],
      tresor: ["7 pa, 258 pc, 34 pe", "Gemmes & bijoux (~70 pa)", "Potion de soins", "Carte avec un X dans la forêt", "La Lettre du Père"],
      choix: [
        { txt: "Lire « La Lettre du Père » ▶", cible: "wlw-lettre" },
        { txt: "Où aller ensuite ? (interroger Victor)", cible: "wlw-suite" }
      ]
    },
    {
      id: "wlw-lettre", titre: "La Lettre du Père", lieu: "Indice clé",
      lecture: [
        "« Mon cher fils, contrairement à nos doutes, le sujet s'est révélé une étude des plus intéressantes cette semaine. Créature peu intelligente mais d'une ruse animale, elle a déjà coûté la vie à deux de nos frères. Selon mes observations, cette créature et sa progéniture sont la cause des attaques dans Eichen, et je compte “acquérir” de nouveaux réceptacles humanoïdes pour notre Reine afin d'étudier son cycle de reproduction. Les travaux du nouveau repaire sont presque finis : un enclos sur mesure pour notre Reine et des logements pour dix de nos plus fidèles. As-tu pu communier avec le grand seigneur récemment ? Avec amour, Père. »",
        "« P.S. — Garde l'œil sur Victor. Depuis un mois, je doute de sa loyauté. S'il le faut, réduis-le au silence : il en sait trop. »"
      ],
      mj: [
        "Cette lettre pointe explicitement vers la TOMBE ORC dans la forêt (le X sur la carte). Si Victor est mort avant qu'on lise ceci, rends la carte plus détaillée pour trouver l'entrée."
      ],
      choix: [
        { txt: "Interroger Victor / Où aller ▶", cible: "wlw-suite" },
        { txt: "Aller directement à la tombe orc ▶", cible: "wlw-tombe-entree" }
      ]
    },
    {
      id: "wlw-suite", titre: "Où aller ensuite ? — Victor", lieu: "Transition",
      lecture: [],
      mj: [
        "Si Victor a survécu et n'a pas été attaqué, on peut l'interroger. Il zozote fortement. Extraits de réponses :",
        "• Qui es-tu ? — « Pitié, ne me tuez pas mêtres ! Je m'appelle Victor, humble serviteur et jardinier… »",
        "• Que se passe-t-il ? — Il raconte la folie de Marnak, les squelettes, le sacrifice de Dame Henrietta et Miss Felicia à Grlarshh, la découverte d'une bête maléfique dans une tombe voisine où se trouve désormais Marnak.",
        "• Nous aideras-tu ? — Si les héros comptent arrêter les meurtres, il accepte de les mener à la tombe (mais n'y entrera pas).",
        "Si les héros n'ont pas encore visité la cabane d'Oscar Drok, ils peuvent aussi y aller. Sinon, direction la tombe."
      ],
      choix: [
        { txt: "Aller à la cabane d'Oscar Drok", cible: "wlw-drok-ext" },
        { txt: "Aller à la tombe orc ▶", cible: "wlw-tombe-entree" }
      ]
    },

    /* --- CABANE DROK --- */
    {
      id: "wlw-drok-ext", titre: "Cabane d'Oscar Drok — extérieur", lieu: "Forêt de Chênaie",
      lecture: [
        "Vous approchez une vieille cabane dans une clairière. À moins de 60 m, portes et volets sont clos, aucune fumée ne s'élève de la cheminée. De grands chenils semblent vides. On dirait qu'il n'y a personne."
      ],
      mj: [
        "À 18 m : Perception passive DC 12 pour remarquer du mouvement dans les chenils. À 12 m : lecture ci-dessous.",
        "5 gros chiens affamés et terrorisés (stats loups) chargent. Surprise si tout le groupe rate la Perception passive.",
        "Dressage animal DC 15 (en leur jetant de la nourriture) pour les calmer ; une tentative de plus possible avec plus de nourriture.",
        "Fouille de la cabane sans jet : 8 pa, 67 pc, 34 pe, 8 flèches. Perception DC 15 : bourse (2 po, émeraude brute 20 pa, topaze lisse 30 pc).",
        "Porte solidement barrée de l'intérieur (crochetage DC 20 / enfoncer DC 20). Ou arracher un volet (Force DC 15)."
      ],
      monstres: ["loup"],
      tresor: ["8 pa, 67 pc, 34 pe, 8 flèches", "Émeraude brute (20 pa), topaze (30 pc)"],
      choix: [
        { txt: "Entrer dans la cabane ▶", cible: "wlw-drok-int" },
        { txt: "◀ Retour au village", cible: "wlw-eichen" }
      ]
    },
    {
      id: "wlw-drok-int", titre: "Cabane d'Oscar Drok — intérieur & cave", lieu: "Forêt de Chênaie",
      lecture: [
        "Bois brisé, vêtements déchirés, poteries fracassées. Une trappe cerclée de fer est à demi cachée sous les débris au centre. Une odeur âcre d'urine et d'excréments flotte dans l'air. Personne ici depuis des semaines. Sous la trappe, une cave sombre et exiguë."
      ],
      mj: [
        "Cave : plafond bas (1,2 m), sol de terre. 8 RATS GÉANTS attaquent depuis les caisses (surprise si non détectés — Perception passive DC 12 pour entendre grattements/couinements).",
        "Coffre cadenassé (crochetage DC 18) : Potion d'escalade + Potion de résistance. Lanterne sourde utilisable (sans huile).",
        "OSCAR DROK, nain squelettique, épie par la porte de sa chambre-cellier. Il bondit, dague et gourdin en main, en hurlant « Vous ne m'aurez jamais, bâtards aux yeux verts ! » quand un héros descend la trappe ou approche de sa porte.",
        "Réduit à < la moitié de ses PV, il s'effondre en sanglots. Il est fou : il prend les héros pour des vargouilles. On le raisonne par des jours de réconfort, un calm emotions (suppression temporaire) ou une restauration mineure (guérison définitive — dispo gratuitement au temple du village).",
        "Guéri, Oscar accepte de mener les héros à l'ENTRÉE de la tombe (sans y entrer)."
      ],
      monstres: ["rat-geant", "oscar-drok"],
      tresor: ["Potion d'escalade, Potion de résistance", "Lanterne sourde"],
      choix: [
        { txt: "Aller à la tombe orc ▶", cible: "wlw-tombe-entree" },
        { txt: "Aller au manoir Morgenstein", cible: "wlw-manoir-ext" }
      ]
    },

    /* --- Fil perdu --- */
    {
      id: "wlw-tombe-entree", titre: "Entrée de la tombe orc", lieu: "Partie 3 — Cimetière orc",
      lecture: [
        "Après une demi-heure à travers d'épais taillis, vous émergez dans une petite clairière. Face à vous, dans un tertre de terre de plus de 3 m de haut, se dresse une porte grossière faite de dalles de granit antiques gravées d'étranges glyphes. Les battants de pierre, brisés depuis longtemps, gisent dans l'herbe. Au-delà du seuil, un escalier ancien et brisé descend dans les ténèbres."
      ],
      mj: [
        "Si les héros écoutent : gouttes d'eau + chants lointains en contrebas (Perception DC 15). Réussite +5 : c'est une prière en infernal à Grlarshh.",
        "Runes en vieux dialecte orc (Langue Sombre, jet Int DC 15) : « Ici reposent les os des plus forts de Croc-Rouge. Que quiconque franchit ce seuil affronte le courroux des ancêtres ! »",
        "Du bruit à la descente peut alerter les vargouilles (aires A/B/C)."
      ],
      choix: [{ txt: "Descendre dans la caverne ▼", cible: "wlw-tombe-caverne" }]
    },
    {
      id: "wlw-tombe-caverne", titre: "La caverne inondée & la statue", lieu: "Cimetière orc",
      lecture: [
        "Au bas de l'escalier, l'endroit tient plus de la caverne souterraine que d'une salle. Le plafond de terre est hérissé de racines pendantes. À 6 m, le sol de terre plonge sous une eau sombre et boueuse. Plus loin, sur un îlot, se dresse un monument couvert de champignons de 3 m. Au loin, deux îlots plus grands hérissés de pierres tombales. À votre droite, une paroi récemment creusée : des patères avec des robes rouges, une table, deux chaises, un pot de chambre, une lanterne éteinte."
      ],
      mj: [
        "Eau boueuse, 90 cm max de profondeur. Vargouilles en embuscade sur les îlots (yeux verts luisants). Perception DC 5 pour qu'elles entendent tout bruit fort.",
        "Aire A : 1 vargouille cachée (Perception DC 14 pour la repérer) ; si attaque, 2 autres viennent de l'îlot opposé.",
        "Aire B : 2 vargouilles cachées ; + celle de l'aire A en renfort.",
        "Tout cri/bruit fort a 70 % de chances d'alerter les cultistes en prière (aire E) → embuscade.",
        "STATUE (îlot proche) = dieu Vornoth. Gratter le champignon révèle 2 grosses émeraudes en guise d'yeux (100 pa chacune). Escalade DC 20 (glissant)."
      ],
      monstres: ["vargouille"],
      tresor: ["2 émeraudes dans les yeux de la statue (100 pa ch.)"],
      choix: [
        { txt: "Franchir jusqu'à l'îlot B et le trou creusé ▶", cible: "wlw-tombe-corridor" }
      ]
    },
    {
      id: "wlw-tombe-corridor", titre: "Le corridor creusé", lieu: "Complexe souterrain",
      lecture: [
        "Un escalier de blocs de pierre descend sur 6 m vers un corridor de 1,5 m de large aux murs et sol de terre. Il file tout droit et, au loin, on distingue la lueur de torches et des portes à gauche et à droite, à une vingtaine de mètres."
      ],
      mj: [
        "Corridor non gardé. Si les cultistes sont alertés, on peut en voir courir entre l'armurerie (D) et le temple (E). Attaqués dans le corridor, ils fuient vers le temple.",
        "Portes à gauche et à droite = dortoirs (aire C). Droit devant = armurerie (D) puis temple (E)."
      ],
      choix: [
        { txt: "Ouvrir un dortoir (Aire C)", cible: "wlw-tombe-C" },
        { txt: "Continuer vers l'armurerie (Aire D)", cible: "wlw-tombe-D" }
      ]
    },
    {
      id: "wlw-tombe-C", titre: "Aire C — les dortoirs", lieu: "Complexe souterrain",
      lecture: [
        "En ouvrant la porte d'un dortoir garni de lits et de coffres, un gobelours de plus de deux mètres à la mâchoire inférieure arrachée s'avance lourdement vers vous, morgenstern et bouclier levés !"
      ],
      mj: [
        "Zombie gobelours par dortoir : attaque si on entre sans frapper 3 coups. Ne quitte pas la pièce sauf ordre de Marnak.",
        "3 lits, mobilier, 3 coffres par pièce (crochetage DC 15). Contenu des 6 coffres : vêtements + petites bourses.",
        "Butin notable : ambre 10 pa ; masse ; 4 dés d'ivoire ; poupée vaudou à épingles ; bracelet argent+topaze (25 pa) ; vêtements flamboyants (25 pa) + bottes de cuir + bague d'or (10 pa) ; deck de cartes usé ; chapeau de paille. Total monnaie ~ diverse (pc/pe)."
      ],
      monstres: ["zombie-gobelours"],
      tresor: ["Ambre (10 pa)", "Bracelet argent+topaze (25 pa)", "Bague d'or (10 pa)", "Vêtements flamboyants (25 pa)"],
      choix: [
        { txt: "Continuer vers l'armurerie (Aire D)", cible: "wlw-tombe-D" }
      ]
    },
    {
      id: "wlw-tombe-D", titre: "Aire D — armurerie & garde-manger", lieu: "Complexe souterrain",
      lecture: [
        "Une petite salle fraîchement creusée. Les murs sont garnis de râteliers d'épieux, dagues, morgensterns, petits boucliers et armures en tous états — de quoi équiper une vingtaine de personnes ! Deux tonneaux, et des quartiers de viande salée et fromages pendus aux poutres."
      ],
      mj: [
        "Marnak rêve de lever une petite armée. 1 tonneau d'eau, 1 de bière. ATTENTION : la viande pendue est… humaine.",
        "Si alertés, les cultistes accourent ici prendre armure + morgenstern : il leur faut ~2 minutes pour s'équiper (aire E)."
      ],
      choix: [
        { txt: "Pousser la grande porte — Temple (Aire E) ▶", cible: "wlw-tombe-E" }
      ]
    },
    {
      id: "wlw-tombe-E", titre: "Aire E — le temple : Marnak", lieu: "Complexe souterrain",
      lecture: [
        "Une large salle aux murs de pierre, éclairée aux torches. Au centre, une estrade et un autel de granit noir. Autour, quatre cultistes en robe rouge et armure de cuir, armes variées. Derrière l'autel, une silhouette voûtée aux cheveux blancs vaporeux, en robes de velours rouge et noir flamboyantes, pointe le doigt vers vous et commence à psalmodier, les yeux écarquillés de folie !"
      ],
      mj: [
        "Combat « final » (en apparence). Marnak lance armure du mage dès l'alerte, récupère son grimoire (1 min).",
        "4 cultistes : sans préparation, stats de base ; préparés (2 min), CA 14 + morgenstern (5/1d8+1) et +5 PX chacun.",
        "Dès que Marnak subit 12 PV OU que 3 cultistes tombent : invisibilité et fuite par où les héros sont venus (Perception DC 10 pour le localiser, ou l'attendre dans l'eau de l'entrée).",
        "S'il fuit : retourne au manoir ; s'il découvre son fils mort, il quitte le village pour toujours.",
        "Rappel : très dangereux si l'ennemi a eu le temps de se préparer."
      ],
      monstres: ["marnak", "cultiste"],
      choix: [
        { txt: "Explorer les quartiers de Marnak (Aire F)", cible: "wlw-tombe-F" },
        { txt: "Vers la caverne de la Reine (Aire G)", cible: "wlw-tombe-G" }
      ]
    },
    {
      id: "wlw-tombe-F", titre: "Aire F — quartiers de Marnak", lieu: "Complexe souterrain",
      lecture: [
        "De luxueux quartiers avec un lit à baldaquin et une petite bibliothèque. Une odeur douceâtre de putréfaction agresse vos narines. Des étagères de livres reliés cuir ; un bureau couvert de papiers, d'encre et d'une carte des royaumes. Mais l'objet le plus dérangeant : un cadavre masculin décapité et à demi décomposé, suspendu au plafond par des chaînes à crochets, comme un ornement macabre. On dirait le corps d'un jeune garçon."
      ],
      mj: [
        "Le corps est celui du garçon disparu (trop décomposé pour être identifié sans magie). Marnak l'étudiait.",
        "Notes : dessins du cou, étude des mœurs reproductrices des vargouilles, la nature des attaques, croquis d'une créature tentaculaire « la Reine » (Marnak ignore ce qu'elle est — soupçonne un autre plan). Journal : références au Seigneur de la Mort, sacrifices, meurtre de sa femme et sa fille.",
        "Compartiment caché du bureau (Perception DC 18) : GRIMOIRE de Marnak (absent s'il a fui avec).",
        "Coffre au pied du lit (crochetage DC 20, briser DC 20 — Marnak a les clés) : hache d'armes M de belle facture, bourse (3 po, 20 pa, 230 pc), onyx noirs (30 pa), cotte de mailles taille M, tube à parchemin = PARCHEMIN d'Animation des Morts.",
        "Autres objets : globe (20 pa), encrier+plume (10 pa), 50 pa d'encres à sorts, 2 livres rares (50 pa et 40 pa), bague d'or à rubis (alliance, 50 pa)."
      ],
      monstres: [],
      tresor: ["Hache d'armes de qualité", "Cotte de mailles (M)", "Parchemin : Animation des Morts", "Grimoire de Marnak", "Bourse : 3 po, 20 pa, 230 pc", "Onyx noirs (30 pa), bague à rubis (50 pa)", "2 livres rares (90 pa), globe & encres (80 pa)"],
      choix: [
        { txt: "Descendre vers la caverne de la Reine (Aire G) ▼", cible: "wlw-tombe-G" }
      ]
    },
    {
      id: "wlw-tombe-G", titre: "Aire G — LA REINE VARGOUILLE", lieu: "Le vrai combat final",
      lecture: [
        "Quittant le corridor de terre, vous émergez dans une vaste caverne naturelle, sombre et profonde. En son centre, un large puits dont le fond échappe à la lumière. Stalagmites et stalactites hérissent la salle comme une forêt inversée de cactus.",
        "Puis, telle un démon montant des enfers, une masse flottante de tentacules de plus de deux mètres jaillit du puits. Chaque appendice écailleux se termine par une tête humanoïde difforme aux yeux verts luisants. Vous n'avez pas le temps de compter, mais il y en a au moins huit. La bête fonce en sifflant de rage !"
      ],
      mj: [
        "La Reine est tapie au fond du puits et remonte dès qu'elle entend entrer (Perception passive DC 12 pour l'entendre monter — surprise sinon).",
        "Tactique simple : jaillir, CRI pour semer le chaos, puis déchirer. Combat jusqu'à la mort (soif de reproduction via le baiser).",
        "Repaire 30 m plus bas (forte odeur d'ammoniac) : corps décapité d'un aventurier + butin."
      ],
      monstres: ["vargouille-reine"],
      tresor: ["Armure de plates", "Épée longue, bouclier lourd", "Potion de soins", "Sac : corde 15 m, grappin, gourde", "5 pa, 120 pc, 56 pe"],
      choix: [
        { txt: "Conclure l'aventure ▶", cible: "wlw-fin" }
      ]
    },
    {
      id: "wlw-fin", titre: "Conclusion", lieu: "Épilogue",
      lecture: [
        "La Reine morte, l'infestation s'éteint. Les héros peuvent ramener les corps au temple du village, faire leur rapport aux autorités, toucher la récompense promise (250 pa) et jouir d'une semaine gratuite au Gobelin Boiteux. Ils seront toujours les bienvenus à Eichen."
      ],
      mj: [
        "Prolongements possibles :",
        "• Si Marnak s'est échappé, il reviendra se venger.",
        "• La carte au X et les notes suggèrent l'origine de la Reine : d'autres créatures existent peut-être.",
        "• Marnak pourrait n'être qu'une branche d'un culte plus vaste.",
        "• Suite officielle « The Quick and the Dead » : un mot dirige les héros vers le village de Kenby."
      ],
      choix: []
    }
  ]
},

/* ==========================================================================
   AVENTURE 2 — LES TOURS DE LA NUIT  (Towers of Night)
   ========================================================================== */
{
  id: "ton",
  titre: "Les Tours de la Nuit",
  sousTitre: "Royaume de Zeland — La Plaine des Batailles",
  niveau: "Personnages de niveau 1 (4 à 5 joueurs)",
  resume: "Le camp rebelle de Loch Brech, en Zeland (royaume du Seigneur de la Paresse), est harcelé par des morts-vivants venus du nord. Deux comploteurs — le nécromancien Beryn et le hobgobelin Drokag — profanent les antiques Tours de l'Attente pour lever une armée de morts et gagner les faveurs du Seigneur de la Paresse.",
  auteur: "Don Knight — World of Farland (2015)",
  debut: "ton-intro",
  scenes: [
    {
      id: "ton-intro", titre: "Introduction & accroches", lieu: "Avant de commencer",
      lecture: [],
      mj: [
        "Contexte : jadis, les Zelandais exposaient leurs morts au sommet des Tours de l'Attente (sur la Plaine des Batailles) pendant un an, puis jetaient les os dans une fosse à la base. Quand le Seigneur de la Paresse a pris Zeland, la noblesse de la Plaine a disparu.",
        "Deux êtres convoitent la région : Beryn (nécromancien de peu de renom) et Drokag (hobgobelin ambitieux). Ils profanent les Tours pour lever une armée de morts-vivants et plaire au Seigneur de la Paresse.",
        "Accroches (les héros arrivent au camp de Loch Brech, nord de Zeland) :",
        "• Fuir la persécution : accusés d'« ambition illégale ».",
        "• Un lieu pour travailler en paix : ils ont entendu parler du camp.",
        "• Pur hasard : ils longeaient la Plaine des Batailles."
      ],
      choix: [{ txt: "Arriver au camp de Loch Brech ▶", cible: "ton-camp" }]
    },
    {
      id: "ton-camp", titre: "Le camp de Loch Brech", lieu: "Partie 1",
      lecture: [
        "Sous la grande tente centrale, trois humains vous observent avec intérêt, chacun sur un tabouret. À gauche, un homme d'âge mûr en armure de cuir usée, marqué par les batailles. Au centre, une jeune femme quelconque en habits de paysanne. À droite, un homme au-delà de la force de l'âge, usé par une vie de dur labeur."
      ],
      mj: [
        "Chefs (g. à d.) : Kieran O'Nel (défense), Ulica (renseignement), Nathi O'Rorke (artisans).",
        "Kieran propose le marché : « Trop de morts-vivants ces temps-ci. Ils viennent du nord, de la Plaine des Batailles. Aucun de mes hommes ne peut être détaché. Arrêtez la source, prouvez votre valeur, et vous aurez refuge. Ça devrait être facile : les morts sont faibles, donc ce qui les fabrique devrait l'être aussi. » (Il se trompe.)",
        "Ulica (renseignement) : la hausse de morts-vivants vient exclusivement du nord ; aucune info depuis l'intérieur de la Plaine (trop risqué d'y entrer).",
        "Services du camp (39 habitants) : Grand-mère Hawkins (soigneuse, Bestra, Soins niv 1 pour 30 pa) et son apprenti Sabd (embauche possible contre une part du butin) ; forgeron Tarlach (armes/armures < 30 pa) ; marchand Peddler (biens < 30 pa). Pas d'objets magiques ni alchimiques. Étalon argent (1 pa = 1 po du PHB)."
      ],
      choix: [{ txt: "Partir vers la Plaine des Batailles ▶", cible: "ton-journey" }]
    },
    {
      id: "ton-journey", titre: "Le voyage vers la Plaine", lieu: "Partie 1",
      lecture: [
        "Cinq heures de marche séparent le camp des abords de la Plaine des Batailles."
      ],
      mj: [
        "Toutes les 3 h passées sur/aux abords de la Plaine, jette une rencontre aléatoire (d100) :",
        "• 0-19 : Patrouille de Hestor (2 orcs + 2 gobelins). Les orcs commandent, les gobelins servent d'éclaireurs/d'appâts. Ne se tire qu'1×/2 jours ; 2e tirage sous 2 jours = rien.",
        "• 20-34 : 3 Squelettes.",
        "• 35-49 : 3 Zombies.",
        "• 50-64 : 1 Goule.",
        "• 65-100 : Rien."
      ],
      monstres: ["orc", "gobelin", "squelette", "zombie", "goule"],
      choix: [{ txt: "Arriver au pied des deux Tours ▶", cible: "ton-base" }]
    },
    {
      id: "ton-base", titre: "Le pied des Tours", lieu: "Partie 2",
      lecture: [
        "En arrivant à la Plaine des Batailles, vous découvrez deux tours. À leur base, l'anormalité saute aux yeux : une grande bâche a été tendue entre les deux Tours de l'Attente. Dessous se dressent trois squelettes, armés d'armes rouillées ramassées sur la plaine. Derrière eux, quatre kobolds s'affairent autour d'un tas d'ossements. Les tours sont distantes d'une trentaine de mètres."
      ],
      mj: [
        "3 Squelettes + 4 Kobolds NON armés. Si le combat éclate, les kobolds fuient plus profond dans la Plaine (ils ne préviennent pas leurs chefs par dépit).",
        "La bâche est décentrée, plus proche de la tour de DROITE (~4,5 m)."
      ],
      monstres: ["squelette", "kobold"],
      choix: [
        { txt: "Entrer dans la Tour de DROITE (Drokag)", cible: "ton-d-l1" },
        { txt: "Entrer dans la Tour de GAUCHE (Beryn)", cible: "ton-g-l1" }
      ]
    },

    /* --- TOUR DE DROITE --- */
    {
      id: "ton-d-l1", titre: "Tour Droite — Niveau 1 : Entrée", lieu: "Tour de Droite",
      lecture: [
        "Une lumière pâle entre par l'entrée. Au centre, un vaste trou circulaire occupe l'essentiel du sol, laissant une coursive de ~3 m tout autour. Un garde-fou hexagonal l'entoure, avec des torchères éteintes. Une longue échelle gît au sol, dépassant du bord du trou. Des planches et une grande dalle sont empilées derrière. Un escalier monte le long du mur ouest."
      ],
      mj: [
        "L'échelle a été retirée du puits et le trou couvert : Beryn a perdu le contrôle de 6 zombies qu'il a piégés au Sous-niveau 1. Perception DC 12 : mouvement en contrebas.",
        "Les débris s'enlèvent facilement → descente vers Sous-niveau 1. L'escalier monte vers Niveau 2."
      ],
      choix: [
        { txt: "Descendre au Sous-niveau 1 ▼", cible: "ton-d-sl1" },
        { txt: "Monter au Niveau 2 ▲", cible: "ton-d-l2" }
      ]
    },
    {
      id: "ton-d-sl1", titre: "Tour Droite — Sous-niv. 1 : Maintenance", lieu: "Tour de Droite",
      lecture: [
        "Il fait sombre. Un immense trou domine le centre de la salle. Des silhouettes titubent le long de l'étroite coursive vers vous, à environ 6 m. Ce sont des cadavres en décomposition !"
      ],
      mj: [
        "3 Zombies (les 6 d'origine, dont 3 ici). Ils vous prennent en tenaille près de l'échelle.",
        "Peu d'intérêt sinon : planches, tuiles, 2 marteaux, une scie, une longue perche à tête plate (servait à tasser le tas d'os). Le puits descend au Sous-niveau 2, remonte au Niveau 1."
      ],
      monstres: ["zombie"],
      choix: [
        { txt: "Descendre au Sous-niveau 2 (fosse à os) ▼", cible: "ton-d-sl2" },
        { txt: "Remonter au Niveau 1 ▲", cible: "ton-d-l1" }
      ]
    },
    {
      id: "ton-d-sl2", titre: "Tour Droite — Sous-niv. 2 : Fosse à os", lieu: "Tour de Droite",
      lecture: [
        "Le fond de la tour, à au moins 3 m sous la surface. Au centre, une immense fosse creusée dans le sol de terre battue, remplie des os d'anciens Zelandais. De grosses pierres cernent la fosse. Le seul accès est le puits par lequel vous êtes descendus."
      ],
      mj: [
        "Rien d'intéressant. Si quelqu'un tombe par le centre de la tour, il atterrit ici : traiter comme une fosse à pieux (os coupants) de la hauteur voulue."
      ],
      choix: [{ txt: "Remonter ▲", cible: "ton-d-sl1" }]
    },
    {
      id: "ton-d-l2", titre: "Tour Droite — Niveau 2 : Chambre du Mémorial", lieu: "Tour de Droite",
      lecture: [
        "La pièce est saccagée. Restes d'arrangements floraux, vieux objets jetés à terre. Plusieurs plaques de bois arrachées du garde-fou gisent au sol. Serrés sur l'étroite coursive : 4 kobolds et un grand hobgobelin. Les kobolds, surpris en plein pillage, restent figés jusqu'à ce que le hobgobelin beugle un ordre dans leur langue grossière — et ils foncent sur vous."
      ],
      mj: [
        "DROKAG le hobgobelin + 4 kobolds. Drokag se sert des kobolds comme boucliers et tire à l'arbalète depuis l'autre côté du trou. À la moitié de ses PV, il bouscule les plus faibles et fuit vers l'autre tour pour prévenir Beryn.",
        "Plaques : les squelettes de cette tour sont morts de batailles anciennes, avant le Seigneur de la Paresse.",
        "Fouille (Perception DC 12) : statuette d'ivoire de Bestra (50 pa) + CASQUE DE MINEUR (voir Trésors).",
        "Sur Drokag : la CLÉ DE CHIFFRE (déchiffre les documents de l'autel, Niveau 3) — révèle l'espionne Bebbin O'Nel.",
        "Butin de Drokag : cotte de mailles, bouclier, épée longue, arc long + 30 flèches, 50 pa."
      ],
      monstres: ["drokag", "kobold"],
      tresor: ["Statuette d'ivoire de Bestra (50 pa)", "Casque de Mineur (lanterne mains-libres)", "Clé de Chiffre", "50 pa, épée longue, arc long, cotte de mailles"],
      choix: [
        { txt: "Monter au Niveau 3 (autel) ▲", cible: "ton-d-l3" },
        { txt: "Descendre au Niveau 1 ▼", cible: "ton-d-l1" }
      ]
    },
    {
      id: "ton-d-l3", titre: "Tour Droite — Niveau 3 : Chambre d'Adieu (base de Drokag)", lieu: "Tour de Droite",
      lecture: [
        "Une salle jadis bien entretenue : sol de tuiles de meilleure qualité, plafond haut (~9 m), aucun garde-fou autour du trou. Sur le mur sud, un autel près du bord du trou, jonché de parchemins. Torchères éteintes le long des murs. Une échelle monte à l'est, un escalier descend à l'ouest."
      ],
      mj: [
        "Base d'opérations de Drokag. Parchemins = CARTES : l'une montre la zone de Loch Brech avec plusieurs marques (anciens emplacements du camp — Drokag comptait capturer les campeurs et les livrer à Hestor).",
        "Pile de NOTES CODÉES sur l'autel : avec la Clé de Chiffre de Drokag, jet Int DC 10 pour traduire (fais le jet toi-même, MJ). Réussite → révèle Bebbin O'Nel comme ESPIONNE. Échec → pointe une personne innocente au hasard (à toi de jouer).",
        "Bebbin O'Nel = sœur cadette de Kieran O'Nel ; elle croit élever sa famille en collaborant avec Beryn et Drokag ; elle envoie des rapports quand elle sort « chasser le dark folk »."
      ],
      tresor: ["Cartes (emplacements du camp)", "Notes codées → identité de l'espionne"],
      choix: [
        { txt: "Monter au Niveau 4 (grue) ▲", cible: "ton-d-l4" },
        { txt: "Redescendre au Niveau 2 ▼", cible: "ton-d-l2" }
      ]
    },
    {
      id: "ton-d-l4", titre: "Tour Droite — Niveau 4 : Chambre de la Grue", lieu: "Tour de Droite",
      lecture: [
        "Le trou central est ici plus petit (~1,5 m de moins). Plafond plus haut (~6 m). Dans le coin nord-ouest, une grande grue de bois aux mécanismes visiblement âgés, une vieille plateforme, un enchevêtrement de cordages. Un escalier monte ; on ne redescend que par l'échelle. Une lumière vive filtre par le trou du plafond et par huit fenêtres, chacune assez large pour un humain, donnant sur d'énormes supports de bois soutenant le toit."
      ],
      mj: [
        "La grue montait jadis les défunts au sommet. Plateforme = un corps. Les cordages sont vieux et peuvent rompre sous un poids réel.",
        "L'escalier monte au Toit ; l'échelle redescend au Niveau 3."
      ],
      choix: [
        { txt: "Monter sur le Toit ▲", cible: "ton-d-toit" },
        { txt: "Redescendre au Niveau 3 ▼", cible: "ton-d-l3" }
      ]
    },
    {
      id: "ton-d-toit", titre: "Tour Droite — Toit : Dernier Repos", lieu: "Tour de Droite",
      lecture: [
        "Le toit déborde de 1,5 m de chaque côté. Quelques vieux squelettes gisent çà et là. Un muret d'environ 60 cm ceint le toit. Au centre, le trou habituel. Sur le côté ouest, trois squelettes armés d'arcs longs fixent l'autre tour."
      ],
      mj: [
        "3 Squelettes archers (arc long +4, 6/1d8+2). Ordre : ne tirer que si BERYN est en danger ; sinon n'attaquent que si on les dérange.",
        "Si les héros ne les éliminent pas, ces archers tirent dans le combat final sur le Toit de la Tour de Gauche. Élimine-les ici pour désamorcer le piège."
      ],
      monstres: ["squelette"],
      choix: [
        { txt: "Redescendre / rejoindre la Tour de Gauche", cible: "ton-g-l1" }
      ]
    },

    /* --- TOUR DE GAUCHE --- */
    {
      id: "ton-g-l1", titre: "Tour Gauche — Niveau 1 : Entrée", lieu: "Tour de Gauche",
      lecture: [
        "Une dalle carrée à l'entrée figure le soleil dans toute sa gloire. Au centre, le grand trou circulaire habituel, coursive de ~3 m autour, garde-fou hexagonal, torchères éteintes. Une échelle dépasse du sol au nord, descendant vers les niveaux inférieurs. Un escalier monte le long du mur ouest."
      ],
      mj: [
        "Rien de valeur ici. Perception DC 10 : quelque chose s'affaire furieusement dans le tas d'os du Sous-niveau 2 (des kobolds qui récoltent des os).",
        "Échelle → Sous-niveau 1 ; escalier → Niveau 2."
      ],
      choix: [
        { txt: "Descendre au Sous-niveau 1 ▼", cible: "ton-g-sl1" },
        { txt: "Monter au Niveau 2 ▲", cible: "ton-g-l2" }
      ]
    },
    {
      id: "ton-g-sl1", titre: "Tour Gauche — Sous-niv. 1 : Maintenance", lieu: "Tour de Gauche",
      lecture: [
        "De la lumière filtre du niveau supérieur. Autour de la salle, des sacs et des caisses débordent d'ossements. Des jappements de chiens et le cliquetis d'os montent du niveau inférieur. Une échelle mène en bas et en haut."
      ],
      mj: [
        "Les caisses d'os sont le fruit du travail des kobolds. Ils montent les os au 1er niveau via la grue (Niveau 4). Rien à combattre ici — descends encore.",
        "Échelle → Sous-niveau 2 et → Niveau 1."
      ],
      choix: [
        { txt: "Descendre au Sous-niveau 2 ▼", cible: "ton-g-sl2" },
        { txt: "Remonter au Niveau 1 ▲", cible: "ton-g-l1" }
      ]
    },
    {
      id: "ton-g-sl2", titre: "Tour Gauche — Sous-niv. 2 : Fosse à os", lieu: "Tour de Gauche",
      lecture: [
        "Le fond de la tour. Au centre, une immense fosse d'ossements. Quatre kobolds s'affairent, surpris mais prêts. Le seul accès est celui par lequel vous êtes venus."
      ],
      mj: [
        "4 Kobolds. Ils préfèreraient fuir mais sont acculés : ils gardent le tas d'os entre eux et vous et lancent des os comme projectiles.",
        "  › Os lancés (33 % chacun) : Petit 1 pt / Moyen 1d3 / Grand 1d6 contondant.",
        "  › En mêlée : outils improvisés récupérés en haut — scie 1d4 tranchant, marteaux 1d6, perche 1d6 (pénalités d'arme improvisée)."
      ],
      monstres: ["kobold"],
      choix: [{ txt: "Remonter ▲", cible: "ton-g-sl1" }]
    },
    {
      id: "ton-g-l2", titre: "Tour Gauche — Niveau 2 : Chambre du Mémorial", lieu: "Tour de Gauche",
      lecture: [
        "La pièce a été entièrement pillée. Restes du mémorial épars, ce que les pillards ont dédaigné jonche le sol. Plusieurs plaques de bois arrachées gisent à terre. L'escalier continue vers le haut comme vers le bas."
      ],
      mj: [
        "Drokag a d'abord pillé cette tour avant qu'ils n'échangent (Drokag à droite pour contenir les zombies).",
        "Fouille (Perception DC 12) : broche d'argent en forme de soleil (30 pa) + pipe à tabac en laiton (10 pa).",
        "Plaques : cette tour abrite deux pelotons entiers (guerres barbares + Bataille de la Hache) et quelques seigneurs mineurs."
      ],
      tresor: ["Broche d'argent au soleil (30 pa)", "Pipe en laiton (10 pa)"],
      choix: [
        { txt: "Monter au Niveau 3 ▲", cible: "ton-g-l3" }
      ]
    },
    {
      id: "ton-g-l3", titre: "Tour Gauche — Niveau 3 : Chambre d'Adieu", lieu: "Tour de Gauche",
      lecture: [
        "Sol de tuiles de meilleure qualité, aucun garde-fou autour du trou (attention à la chute dans le noir !). Un autel sur le côté sud, près du bord. Une échelle monte à l'est, un escalier descend à l'ouest."
      ],
      mj: [
        "Pièce vide MAIS prudence : Perception DC 12 → bruits de mastication au-dessus (une goule ronge des os au Niveau 4).",
        "En montant l'échelle, Discrétion DC 12 évite l'embuscade. Sinon, la goule (cachée sur une poutre par une fenêtre) entend les héros grimper et prépare son embuscade."
      ],
      choix: [
        { txt: "Monter au Niveau 4 (grue / goule) ▲", cible: "ton-g-l4" },
        { txt: "Redescendre au Niveau 2 ▼", cible: "ton-g-l2" }
      ]
    },
    {
      id: "ton-g-l4", titre: "Tour Gauche — Niveau 4 : Chambre de la Grue (goule)", lieu: "Tour de Gauche",
      lecture: [
        "Comme dans l'autre tour : trou central plus petit, plafond ~6 m, une vieille grue au nord-ouest, plateforme, cordages emmêlés. Huit fenêtres donnant sur d'énormes supports de bois. Une lumière vive au sommet suggère le toit à l'étage supérieur."
      ],
      mj: [
        "1 GOULE, rusée et parlante : elle s'est alliée à Beryn (par intérêt alimentaire) et lui sert de garde privé — Beryn lui fait plus confiance qu'à Drokag et ses kobolds.",
        "La trouver : Perception DC 12, ou sortir sur une poutre. Elle tend une embuscade dès que les héros s'éloignent de l'échelle/escalier, les coinçant contre un mur ou le trou. Si les héros montent sans fouiller, elle les suit sur le toit.",
        "NE PAS l'éliminer avant le combat final = elle rejoindra le combat contre Beryn (très dangereux)."
      ],
      monstres: ["goule"],
      choix: [
        { txt: "Monter sur le Toit (Beryn) ▲", cible: "ton-g-toit" },
        { txt: "Redescendre au Niveau 3 ▼", cible: "ton-g-l3" }
      ]
    },
    {
      id: "ton-g-toit", titre: "Tour Gauche — Toit : BERYN le Nécromancien", lieu: "Combat final",
      lecture: [
        "Le toit s'élargit d'1,5 m tout autour, ceint d'un muret de 60 cm. Au centre, le trou habituel, un peu plus petit. À l'est, un homme en habits de paysan lâches agite les mains dans un rituel étrange, marmonnant des mots de pouvoir tirés d'un parchemin. Les quelques squelettes restés sur cette tour se dressent devant lui. Il semble entièrement absorbé et n'attaque pas."
      ],
      mj: [
        "BERYN. Perception DC 15 pour le voir en plein rituel ; Arcanes DC 15 pour comprendre qu'il lève des squelettes.",
        "Quand les héros approchent, 3 squelettes qu'il vient d'animer se dressent : il s'en sert comme boucliers et lance ses sorts par-derrière.",
        "PIÈGES CUMULÉS (potentiellement mortels) : si les archers du Toit de la Tour de DROITE sont encore vivants, ils tirent ici à l'arc long ; si la GOULE du Niveau 4 est encore vive, elle rejoint aussi le combat. D'où l'intérêt de les avoir neutralisés avant.",
        "Butin de Beryn : grimoire, 50 pa, bâton, dague, bague d'argent (20 pa)."
      ],
      monstres: ["beryn", "squelette", "goule"],
      tresor: ["Grimoire de Beryn", "50 pa, bague d'argent (20 pa)"],
      choix: [
        { txt: "Conclure l'aventure ▶", cible: "ton-fin" }
      ]
    },
    {
      id: "ton-fin", titre: "Conclusion", lieu: "Épilogue",
      lecture: [
        "Beryn et Drokag vaincus, il ne reste qu'à rentrer faire rapport à Kieran et aux autres. À toi, MJ, de récompenser les héros comme bon te semble."
      ],
      mj: [
        "PX BONUS (les morts étaient d'anciens Zelandais) :",
        "• Déposer les zombies sur le toit à la manière ancestrale : +50 PX/héros.",
        "• Mettre la goule au repos : +50 PX.",
        "• Jeter squelettes + os pillés dans la fosse à os : +100 PX.",
        "• Remettre les plaques à leur place : +50 PX.",
        "• Démasquer Bebbin O'Nel comme espionne via les documents de Drokag : +100 PX.",
        "Prolongement : Bebbin s'échappe avant d'être démasquée et va vendre le camp à un autre pouvoir maléfique → nouvelle quête pour la rattraper."
      ],
      choix: []
    }
  ]
},

/* ==========================================================================
   AVENTURE 2 — VERSION SOLO  (1 seul héros : Sylwen l'elfe + son loup Fenn)
   Narration au singulier, rencontres allégées, choix prédéfinis.
   ========================================================================== */
{
  id: "ton-solo",
  titre: "Les Tours de la Nuit — Solo",
  sousTitre: "Adaptation pour UN SEUL héros — Sylwen l'elfe",
  niveau: "1 héroïne de niveau 3 (Sylwen) + son loup Fenn",
  resume: "Version pensée pour jouer À DEUX PERSONNES SEULEMENT : un MJ et un seul joueur. Sylwen Feuille-d'Argent, rôdeuse elfe accompagnée de son loup Fenn, est envoyée par le camp de Loch Brech mettre fin à la vague de morts-vivants qui déferle des Tours de l'Attente. Rencontres allégées, narration à la 2ᵉ personne, et à chaque étape une série de choix clairs.",
  auteur: "D'après Don Knight — World of Farland, adapté pour le jeu solo",
  debut: "ts-intro",
  scenes: [
    {
      id: "ts-intro", titre: "Mode solo — préparation", lieu: "Avant de commencer",
      lecture: [],
      mj: [
        "★ COMMENT JOUER À DEUX : tu es le MJ, tu lis les encadrés bleus à voix haute et tu décris le monde. Ton unique joueur incarne SYLWEN (onglet Persos → « Sylwen Feuille-d'Argent »).",
        "Sylwen n'est jamais vraiment seule : son loup FENN combat à ses côtés (fiche « Fenn » dans le Bestiaire). En combat, fais agir Fenn juste après Sylwen.",
        "Rencontres ALLÉGÉES pour un seul héros : les nombres d'ennemis ont déjà été réduits dans chaque scène. Si Sylwen tombe à 0 PV, laisse-lui une chance (Fenn la traîne à l'abri, un JS de mort, etc.) — le but est de raconter une belle aventure, pas de la tuer.",
        "Choisis une accroche à raconter : Sylwen fuyait une accusation d'« ambition illégale » ; ou elle cherchait un lieu tranquille ; ou elle passait simplement par là et le camp lui a demandé de l'aide."
      ],
      choix: [{ txt: "Arriver au camp de Loch Brech ▶", cible: "ts-camp" }]
    },
    {
      id: "ts-camp", titre: "Le camp de Loch Brech", lieu: "Partie 1",
      lecture: [
        "Sous la grande tente centrale, trois chefs t'observent, Sylwen. Kieran, un vieux guerrier en cuir usé ; Ulica, une femme discrète chargée du renseignement ; et Nathi, un artisan au dos courbé par le travail. Ton loup Fenn reste collé à ta jambe, oreilles dressées.",
        "Kieran te toise : « Une elfe et son loup, hein ? Écoute : il y a trop de morts-vivants ces temps-ci. Ils viennent du nord, de la Plaine des Batailles. Aucun de mes hommes ne peut y aller. Trouve la source, arrête-la, et tu auras ta place ici. »"
      ],
      mj: [
        "Services du camp si Sylwen veut se préparer : Grand-mère Hawkins soigne (Soins niv 1) pour 30 pa ; le forgeron Tarlach vend armes/armures < 30 pa ; Peddler vend des biens < 30 pa. Pas d'objets magiques. (Étalon argent : 1 pa = 1 po du manuel.)",
        "Ulica précise : la hausse vient exclusivement du nord ; personne n'ose entrer dans la Plaine."
      ],
      actions: [
        { txt: "🗣️ Convaincre Kieran d'une avance", carac: "Charisme (Persuasion)", dc: 13, mod: 0,
          reussite: "Kieran grogne, amusé, et te lâche 30 pa d'avance pour t'équiper.",
          echec: "« La paie vient après le travail, l'elfe. » Rien pour l'instant." },
        { txt: "🧠 Sonder Ulica sur la menace", carac: "Sagesse (Perspicacité)", dc: 10, mod: 2,
          reussite: "Ulica est franche : tout vient du nord, de la Plaine. Personne n'ose y entrer.",
          echec: "Elle reste vague ; rien de plus que la rumeur." }
      ],
      choix: [{ txt: "Partir vers la Plaine des Batailles ▶", cible: "ts-journey" }]
    },
    {
      id: "ts-journey", titre: "Le voyage", lieu: "Partie 1",
      lecture: [
        "Cinq heures de marche. La lande grise s'étire, silencieuse. Fenn gronde par moments, le poil hérissé : quelque chose rôde."
      ],
      mj: [
        "RENCONTRE ALLÉGÉE (solo) : jette 1d6 une seule fois pendant le trajet —",
        "• 1-2 : 2 Squelettes sortent de la brume.",
        "• 3 : 1 Goule affamée traque Sylwen.",
        "• 4 : Une patrouille réduite de Hestor : 1 orc + 1 gobelin.",
        "• 5-6 : Rien, le trajet est calme.",
        "Astuce solo : Sylwen peut tirer à l'arc avant le contact (surprise si Discrétion réussie), et lancer Fenn pour prendre l'ennemi en tenaille."
      ],
      monstres: ["squelette", "goule", "orc", "gobelin"],
      actions: [
        { txt: "🎲 Jet de rencontre (route)", die: 6, table: [
            { max: 2, txt: "2 Squelettes émergent de la brume — combat ! (fiche Squelette au Bestiaire)" },
            { max: 3, txt: "Une Goule affamée traque Sylwen — combat !" },
            { max: 4, txt: "Patrouille réduite de Hestor : 1 orc + 1 gobelin." },
            { max: 6, txt: "Rien. Le trajet reste calme." }
          ] },
        { txt: "👁️ Repérer le danger (Fenn gronde)", carac: "Sagesse (Perception)", dc: 12, mod: 4,
          reussite: "Tu repères l'ennemi le premier : tu peux tirer avant qu'il n'approche (surprise possible).",
          echec: "Trop tard — tu es prise au dépourvu, pas de surprise." }
      ],
      choix: [{ txt: "Arriver au pied des deux Tours ▶", cible: "ts-base" }]
    },
    {
      id: "ts-base", titre: "Le pied des Tours", lieu: "Partie 2",
      lecture: [
        "Deux tours de pierre se dressent sur la plaine. Entre elles, une grande bâche a été tendue. Dessous : deux squelettes armés de lames rouillées, et deux kobolds qui trient un tas d'ossements. Ils ne t'ont pas encore vue."
      ],
      mj: [
        "ALLÉGÉ (solo) : 2 Squelettes + 2 Kobolds (au lieu de 3 + 4).",
        "Les kobolds fuient dès que le combat tourne mal — ils ne préviennent pas leurs chefs.",
        "Sylwen peut ouvrir avec une flèche + marque du chasseur ; Fenn charge un squelette (avantage)."
      ],
      monstres: ["squelette", "kobold", "fenn"],
      actions: [
        { txt: "🏹 Ouvrir par une flèche furtive", carac: "Dextérité (Discrétion)", dc: 12, mod: 5,
          reussite: "Silencieuse, tu décoches avant qu'ils réagissent : SURPRISE, avantage au 1er tour, et Fenn charge.",
          echec: "Une brindille craque : pas de surprise, lancez l'initiative normalement." },
        { txt: "🏹 Jet d'attaque à l'arc", roll: "1d20+5", note: "Touché : 1d8+3 perforants (+1d6 si marque du chasseur active)." },
        { txt: "🐺 Attaque de Fenn (morsure)", roll: "1d20+4", note: "Touché : 2d4+2 perforants ; JS Force DC 11 ou la cible tombe à terre." }
      ],
      choix: [
        { txt: "Entrer dans la Tour de DROITE (le hobgobelin Drokag)", cible: "ts-d-bas" },
        { txt: "Entrer dans la Tour de GAUCHE (le nécromancien Beryn)", cible: "ts-g-bas" }
      ]
    },

    /* --- TOUR DE DROITE : Drokag --- */
    {
      id: "ts-d-bas", titre: "Tour de Droite — l'entrée", lieu: "Tour de Droite",
      lecture: [
        "Une lumière pâle éclaire une salle circulaire. En son centre, un grand trou béant cerné d'un garde-fou. Une échelle gît au sol, à demi engagée dans le trou. Un escalier monte le long du mur."
      ],
      mj: [
        "Perception DC 12 : du mouvement en contrebas (des zombies piégés au niveau inférieur).",
        "L'escalier monte vers Drokag (niveau supérieur). L'échelle descend vers les zombies."
      ],
      actions: [
        { txt: "👂 Écouter le trou", carac: "Sagesse (Perception)", dc: 12, mod: 4,
          reussite: "Tu perçois des pas traînants en contrebas : des zombies rôdent au niveau inférieur.",
          echec: "Le silence… trompeur." }
      ],
      choix: [
        { txt: "Descendre affronter ce qui bouge en bas ▼", cible: "ts-d-zombies" },
        { txt: "Monter vers le sommet (Drokag) ▲", cible: "ts-d-drokag" }
      ]
    },
    {
      id: "ts-d-zombies", titre: "Tour de Droite — les zombies", lieu: "Tour de Droite",
      lecture: [
        "En bas, il fait sombre. Deux cadavres en décomposition titubent vers toi le long de l'étroite coursive qui cerne le trou."
      ],
      mj: [
        "ALLÉGÉ (solo) : 2 Zombies (au lieu de 3). Terrain étroit : facile de les affronter un par un.",
        "Rien d'autre d'utile ici : des planches, une scie, deux marteaux, une longue perche."
      ],
      monstres: ["zombie", "fenn"],
      actions: [
        { txt: "🏹 Jet d'attaque à l'arc", roll: "1d20+5", note: "1d8+3 perforants. Zombie : Ténacité (JS Con DC 5 + dégâts pour rester à 1 PV)." },
        { txt: "🗡️ Attaque à l'épée courte", roll: "1d20+5", note: "1d6+3 tranchants (+1d6 att. bonus avec la 2e lame)." },
        { txt: "🐺 Attaque de Fenn", roll: "1d20+4", note: "2d4+2 perforants ; avantage si Sylwen est au contact (meute)." }
      ],
      choix: [
        { txt: "Remonter et monter vers Drokag ▲", cible: "ts-d-drokag" }
      ]
    },
    {
      id: "ts-d-drokag", titre: "Tour de Droite — Drokag le hobgobelin", lieu: "Tour de Droite",
      lecture: [
        "Une salle saccagée, jonchée de plaques de bois arrachées. Serrés sur la coursive : deux kobolds pillards et un grand hobgobelin en cotte de mailles, arbalète au poing. En te voyant, il aboie un ordre — les kobolds se ruent sur toi !"
      ],
      mj: [
        "ALLÉGÉ (solo) : Drokag + 2 kobolds (au lieu de 4). Drokag se cache derrière les kobolds et tire à l'arbalète depuis l'autre bord du trou.",
        "À la moitié de ses PV, il tente de fuir vers l'autre tour pour prévenir Beryn : Fenn peut le rattraper (course 12 m).",
        "Sur son corps : la CLÉ DE CHIFFRE (permet plus tard de démasquer l'espionne du camp), 50 pa, une belle épée longue.",
        "Fouille (Perception DC 12) : statuette d'ivoire de Bestra (50 pa) + un Casque de Mineur (lampe mains-libres)."
      ],
      monstres: ["drokag", "kobold", "fenn"],
      tresor: ["Clé de Chiffre", "Statuette de Bestra (50 pa)", "Casque de Mineur", "50 pa, épée longue"],
      actions: [
        { txt: "🔎 Fouiller la salle saccagée", carac: "Intelligence (Investigation)", dc: 12, mod: 2,
          reussite: "Sous les décombres : une statuette d'ivoire de Bestra (50 pa) et un Casque de Mineur (lampe mains-libres).",
          echec: "Rien de plus que poussière et plaques brisées." },
        { txt: "🏃 Fenn poursuit Drokag qui fuit", carac: "Course de Fenn", dc: 12, mod: 4,
          reussite: "Fenn bondit et plaque le hobgobelin : il ne préviendra pas Beryn.",
          echec: "Drokag file vers l'autre tour — Beryn sera prévenu de ton arrivée." },
        { txt: "🏹 Jet d'attaque à l'arc", roll: "1d20+5", note: "1d8+3 perforants. Vise Drokag par-dessus les kobolds." }
      ],
      choix: [
        { txt: "Monter au toit neutraliser les archers ▲", cible: "ts-d-toit" },
        { txt: "Passer directement à la Tour de Gauche (Beryn)", cible: "ts-g-bas" }
      ]
    },
    {
      id: "ts-d-toit", titre: "Tour de Droite — le toit", lieu: "Tour de Droite",
      lecture: [
        "Sur le toit balayé par le vent, deux vieux squelettes armés d'arcs longs se tiennent immobiles, tournés vers l'autre tour, comme des sentinelles."
      ],
      mj: [
        "ALLÉGÉ (solo) : 2 Squelettes archers (au lieu de 3). Ils n'attaquent que si on les dérange… ou si Beryn est menacé.",
        "IMPORTANT : les éliminer MAINTENANT évite qu'ils ne canardent Sylwen pendant le combat final contre Beryn (ils tirent d'une tour à l'autre)."
      ],
      monstres: ["squelette", "fenn"],
      actions: [
        { txt: "🎯 Tir d'ouverture sur un archer", carac: "Dextérité (Discrétion)", dc: 12, mod: 5,
          reussite: "Tu abats presque un squelette avant qu'ils ne bougent : avantage au 1er tour.",
          echec: "Ils te repèrent et lèvent leurs arcs — combat de face." },
        { txt: "🏹 Jet d'attaque à l'arc", roll: "1d20+5", note: "1d8+3 perforants." }
      ],
      choix: [
        { txt: "Rejoindre la Tour de Gauche affronter Beryn ▶", cible: "ts-g-bas" }
      ]
    },

    /* --- TOUR DE GAUCHE : Beryn --- */
    {
      id: "ts-g-bas", titre: "Tour de Gauche — l'ascension", lieu: "Tour de Gauche",
      lecture: [
        "Une dalle gravée d'un soleil marque l'entrée. Comme dans l'autre tour, un grand trou occupe le centre. Un escalier grimpe vers les étages. D'en haut te parviennent de faibles bruits."
      ],
      mj: [
        "Beryn est tout en haut, sur le toit, absorbé par son rituel. Entre toi et lui : une goule tapie au 4ᵉ niveau.",
        "Perception DC 12 en montant : des bruits de mastication plus haut (la goule ronge des os)."
      ],
      actions: [
        { txt: "🤫 Monter en silence (éviter la goule)", carac: "Dextérité (Discrétion)", dc: 12, mod: 5,
          reussite: "Pas légers d'elfe : tu montes sans un bruit. Tu pourras surprendre la goule au lieu d'être embusquée.",
          echec: "Une marche grince : la goule t'entend et se met en embuscade." }
      ],
      choix: [
        { txt: "Monter vers le sommet ▲", cible: "ts-g-goule" }
      ]
    },
    {
      id: "ts-g-goule", titre: "Tour de Gauche — la goule embusquée", lieu: "Tour de Gauche",
      lecture: [
        "Une salle avec une vieille grue de bois et huit fenêtres donnant sur d'énormes poutres. Des petits tas d'os marqués de coups de dents. Soudain, une forme grise et décharnée bondit d'une poutre : une goule aux griffes crochues !"
      ],
      mj: [
        "1 Goule (rusée, elle sert de garde à Beryn). Discrétion DC 12 en montant permet de l'éviter/surprendre.",
        "⚠ Ses griffes paralysent (JS Con DC 10) — mais Sylwen, elfe, est IMMUNISÉE au sommeil et résiste au charme ; la paralysie de goule, elle, la menace : garde Fenn prêt à intervenir.",
        "L'éliminer ici l'empêche de rejoindre le combat contre Beryn."
      ],
      monstres: ["goule", "fenn"],
      actions: [
        { txt: "🏹 Jet d'attaque à l'arc", roll: "1d20+5", note: "1d8+3 perforants." },
        { txt: "🗡️ Attaque à l'épée courte", roll: "1d20+5", note: "1d6+3 tranchants." },
        { txt: "🐺 Attaque de Fenn", roll: "1d20+4", note: "2d4+2 perforants." },
        { txt: "🛡️ Résister à la paralysie (griffes)", carac: "JS Constitution", dc: 10, mod: 2,
          reussite: "Tu encaisses sans être paralysée.",
          echec: "Paralysée 1 min ! Fenn tient la goule à distance ; nouveau JS chaque fin de tour." }
      ],
      choix: [
        { txt: "Monter sur le toit affronter Beryn ▲", cible: "ts-g-beryn" }
      ]
    },
    {
      id: "ts-g-beryn", titre: "Tour de Gauche — BERYN le nécromancien", lieu: "Combat final",
      lecture: [
        "Sur le toit, un homme en habits de paysan agite les mains au-dessus d'un parchemin, marmonnant des mots de pouvoir. Devant lui, quelques squelettes se dressent lentement. Il ne t'a pas encore remarquée, tout à son rituel macabre."
      ],
      mj: [
        "COMBAT FINAL. Arcanes DC 15 : Sylwen comprend qu'il relève des morts. Une flèche + marque du chasseur avant qu'il ne réagisse = énorme avantage (surprise si Discrétion réussie).",
        "ALLÉGÉ (solo) : Beryn + 2 Squelettes (au lieu de 3). Il s'en sert de boucliers et lance ses sorts par-derrière (projectile magique, rayon de maladie, image miroir).",
        "⚠ SI tu n'as PAS nettoyé les archers du toit d'en face → ils tirent ici ; SI tu n'as PAS tué la goule → elle arrive en renfort. D'où l'intérêt d'avoir fait le ménage avant.",
        "Attention à « Moisson sinistre » : s'il tue Fenn ou Sylwen avec un sort, il se soigne. Concentre le feu sur lui.",
        "Butin : son grimoire, 50 pa, une bague d'argent (20 pa)."
      ],
      monstres: ["beryn", "squelette", "goule", "fenn"],
      tresor: ["Grimoire de Beryn", "50 pa, bague d'argent (20 pa)"],
      actions: [
        { txt: "🏹 Flèche + marque du chasseur (surprise)", carac: "Dextérité (Discrétion)", dc: 12, mod: 5,
          reussite: "Beryn, absorbé, ne te voit pas : marque posée, flèche encochée — 1er tour avec avantage et +1d6.",
          echec: "Il sent une présence et se retourne : ses squelettes se dressent, pas de surprise." },
        { txt: "📖 Comprendre son rituel", carac: "Intelligence (Arcanes)", dc: 15, mod: 0,
          reussite: "Il relève des squelettes : abats-le vite pour stopper le flot de morts.",
          echec: "Ces gestes te dépassent." },
        { txt: "🏹 Jet d'attaque à l'arc", roll: "1d20+5", note: "1d8+3 (+1d6 marque). Concentre le feu sur Beryn (Moisson sinistre le soigne s'il tue)." },
        { txt: "🐺 Attaque de Fenn", roll: "1d20+4", note: "2d4+2 ; envoie-le sur Beryn pendant que tu tires." }
      ],
      choix: [
        { txt: "Conclure l'aventure ▶", cible: "ts-fin" }
      ]
    },
    {
      id: "ts-fin", titre: "Conclusion", lieu: "Épilogue",
      lecture: [
        "Beryn et Drokag vaincus, le silence retombe sur la Plaine des Batailles. Fenn hurle une fois, vers la lune. Il ne reste qu'à rentrer au camp de Loch Brech, où Kieran t'attend pour tenir sa promesse : une place parmi eux, enfin."
      ],
      mj: [
        "Récompense au choix (or, équipement, refuge). PX bonus solo si Sylwen a :",
        "• remis les morts au repos dignement (+50 PX) ;",
        "• rapporté la Clé de Chiffre et démasqué l'espionne Bebbin O'Nel via les notes de Drokag (+100 PX).",
        "Prolongement : Bebbin, la sœur cadette de Kieran, s'enfuit pour vendre le camp à un autre pouvoir maléfique — Sylwen et Fenn pourraient la traquer.",
        "Suite naturelle : enchaîner sur « Ce qui se cache à l'intérieur » (un cousin d'Eichen réclame de l'aide)."
      ],
      choix: []
    }
  ]
}
];
