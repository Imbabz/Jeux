/* ============================================================
   BESTIAIRE & PNJ — stat blocks
   - Créatures propres à Farland : reprises fidèlement des PDF.
   - Créatures « MM p. XXX » : statistiques du SRD 5.1 (OGL),
     fournies pour rendre l'app autonome en voiture.
   Chaque entrée : id, nom, type, cr, tags, ac, pv, vitesse,
   stats{for,dex,con,int,sag,cha}, traits[], actions[], notes.
   ============================================================ */

window.BESTIARY = [

  /* ---------- Aventure 1 : créatures spéciales ---------- */
  {
    id: "vargouille", nom: "Vargouille", type: "Monstruosité TP, Neutre Mauvais",
    cr: "1/4", tags: ["aventure1", "monstre"],
    ac: "12 (armure naturelle)", pv: "9 (3d6)", vitesse: "1,50 m, vol 9 m",
    stats: { for: 12, dex: 14, con: 11, int: 6, sag: 11, cha: 8 },
    sens: "Vision dans le noir, Perception passive 10", langues: "Kelevan/Infernal brisé",
    traits: [
      "Sensibilité à la lumière. En plein soleil, la vargouille a un désavantage aux jets d'attaque et aux jets de Perception (vue)."
    ],
    actions: [
      "Morsure. +3 à toucher, allonge 1,50 m. Touché : 4 (1d4+2) perforants. La cible réussit un JS Constitution DC 10 ou ne peut plus soigner la morsure (naturellement ou magiquement). Restauration mineure/majeure, délivrance de malédiction, guérison, ou un repos long lève l'effet.",
      "Cri (Recharge 5-6). Cri terrible touchant tout à moins de 18 m (sauf les vargouilles). JS Sagesse DC 10 ou paralysé par la peur. Nouveau JS à la fin de chaque tour. Une cible qui réussit est immunisée à ce cri pendant 24 h.",
      "Baiser. Embrasse une victime paralysée adjacente : JS Constitution DC 12 ou infectée par une maladie qui la transforme en vargouille en 24 h (perte des cheveux en 6 h, oreilles pointues + crocs + tentacules en 12 h, léthargie en 18 h, la tête ailée se détache et tue la victime en 24 h). La lumière du soleil / sort lumière du jour suspend la maladie. Seule une restauration mineure/majeure ou guérison soigne définitivement."
    ],
    notes: "Têtes volantes ailées et tentaculaires, charognardes. Réputées venir des plans infernaux. Yeux verts luisants dans la nuit."
  },
  {
    id: "vargouille-reine", nom: "La Reine Vargouille", type: "Monstruosité G, Neutre Mauvais",
    cr: "4", tags: ["aventure1", "monstre", "boss"],
    ac: "14 (armure naturelle)", pv: "98 (14d10+28)", vitesse: "1,50 m, vol 9 m",
    stats: { for: 17, dex: 14, con: 14, int: 5, sag: 12, cha: 8 },
    sens: "Vision dans le noir, Perception passive 11", langues: "Kelevan/Infernal brisé",
    traits: [
      "Mille yeux, mille oreilles. Grâce à ses multiples têtes, avantage aux jets de Perception quand elle (ou sa cible) n'est pas au soleil. Champ de vision à 360° : ne peut être prise en tenaille.",
      "Créature clé de l'infestation : tant qu'elle vit, les vargouilles prolifèrent dans la région."
    ],
    actions: [
      "Attaques multiples. Deux morsures (dans n'importe quelle direction, sans se retourner) ; OU une morsure + Sifflement de désespoir.",
      "Morsure. +5 à toucher, allonge 1,50 m. Touché : 9 (1d12+3) perforants + JS Con DC 12 ou soins bloqués sur la plaie (mêmes remèdes que la vargouille).",
      "Cri (Recharge 5-6). Comme la vargouille mais JS Sagesse DC 12, rayon 18 m.",
      "Sifflement de désespoir. Tout à moins de 9 m (sauf vargouilles) : JS Sagesse DC 12 ou désavantage aux attaques et aux JS contre la peur. Nouveau JS chaque fin de tour.",
      "Baiser multiple. Embrasse jusqu'à DEUX victimes paralysées adjacentes : JS Con DC 13 ou maladie de transformation (voir vargouille)."
    ],
    notes: "Masse flottante de tentacules de 2 m de large, chaque appendice terminé par une tête humanoïde déformée aux yeux verts. Asexuée, se reproduit par le baiser. « Reine » est un abus de langage. Tactique : jaillir, crier pour semer le chaos, puis déchirer. Combat jusqu'à la mort."
  },
  {
    id: "ours-squelette", nom: "Ours brun squelettique", type: "Mort-vivant G, Loyal Mauvais",
    cr: "1", tags: ["aventure1", "mort-vivant"],
    ac: "13 (lambeaux de fourrure)", pv: "44 (6d10+12)", vitesse: "9 m",
    stats: { for: 19, dex: 10, con: 16, int: 2, sag: 9, cha: 5 },
    sens: "Vision dans le noir 18 m, Perception passive 9", langues: "—",
    traits: [
      "Vulnérabilité : contondant. Immunité : poison. Immunité aux états épuisement, empoisonné.",
      "Mots de commande (dans l'aire A du manoir) : « nefarious » = attaque tout ce qui ne porte pas de robe rouge ; « dictum » = stop."
    ],
    actions: [
      "Attaques multiples. Une morsure + une griffe.",
      "Morsure. +5 à toucher, allonge 1,50 m. Touché : 8 (1d8+4) perforants.",
      "Griffes. +5 à toucher, allonge 1,50 m. Touché : 11 (2d6+4) tranchants."
    ]
  },
  {
    id: "marnak", nom: "Marnak Morgenstein (le vieux)", type: "Humain (mage) M, Loyal Mauvais",
    cr: "2", tags: ["aventure1", "pnj", "boss"],
    ac: "12", pv: "24 (6d6+6)", vitesse: "9 m",
    stats: { for: 9, dex: 14, con: 12, int: 14, sag: 10, cha: 14 },
    comp: "Arcanes +3, Histoire +3, Intimidation +4",
    sens: "Perception passive 10", langues: "Kelevan, Langue Sombre",
    traits: [
      "Incantation (mage niveau 4). Int, DC des sorts 11, +3 à l'attaque de sort.",
      "Sorts préparés — Tours : lumière, main du mage, rayon de givre. Niv 1 (4) : mains brûlantes, armure du mage, projectile magique. Niv 2 (3) : nuée de dagues, invisibilité."
    ],
    actions: [
      "Dague. +2 à toucher, allonge 1,50 m ou 6/18 m. Touché : 2 (1d4) perforants."
    ],
    notes: "Ex-aventurier de 54 ans, dos voûté, cheveux blancs clairsemés. Savant froid et calculateur, sujet à des crises meurtrières. Tactique : armure du mage au début, puis mains brûlantes / nuée de dagues sur les corps-à-corps, rayon de givre et projectile magique sur les lanceurs de sorts. Dès qu'il subit 12 PV ou perd 3 cultistes : invisibilité et fuite pour se venger plus tard."
  },
  {
    id: "gregory", nom: "Gregory Morgenstein (Fanatique de secte)", type: "Humain M, Loyal Mauvais",
    cr: "2", tags: ["aventure1", "pnj", "boss"],
    ac: "13 (armure de cuir)", pv: "33 (6d8+6)", vitesse: "9 m",
    stats: { for: 11, dex: 14, con: 12, int: 10, sag: 13, cha: 14 },
    comp: "Tromperie +4, Persuasion +4, Religion +2",
    sens: "Perception passive 11", langues: "Kelevan",
    traits: [
      "Incantation (prêtre niveau 4). Sag, DC 11, +3 à l'attaque de sort.",
      "Sorts — Tours : lumière, réparation, thaumaturgie. Niv 1 (4) : blessure, bouclier de la foi, injonction. Niv 2 (3) : arme spirituelle, immobilisation de personne (hold person, DC 11)."
    ],
    actions: [
      "Attaques multiples. Deux attaques de dague.",
      "Dague. +4 à toucher, allonge 1,50 m ou 6/18 m. Touché : 4 (1d4+2) perforants."
    ],
    notes: "Fils de Marnak, aussi grand que corpulent (plus d'1,80 m), cheveux noirs gras, prend plaisir à tuer. Complètement fou : combat jusqu'à la mort. R1 : hold person sur le personnage le plus lourdement armuré et le moins intelligent, puis rejoint la mêlée."
  },
  {
    id: "victor", nom: "Victor le Bossu", type: "Humain M, Loyal Neutre",
    cr: "0", tags: ["aventure1", "pnj"],
    ac: "10", pv: "8 (2d8)", vitesse: "9 m",
    stats: { for: 11, dex: 10, con: 10, int: 11, sag: 11, cha: 9 },
    sens: "Perception passive 10", langues: "Kelevan",
    actions: [
      "Gourdin. +2 à toucher, allonge 1,50 m. Touché : 2 (1d4) contondants.",
      "Arc court. +2 à toucher, 24/96 m. Touché : 3 (1d6) perforants."
    ],
    notes: "Serviteur loyal mais non-mauvais des Morgenstein, parle avec un fort zozotement. Lâche : supplie pour sa vie. S'il est épargné, peut guider les héros vers la tombe. Ne se bat qu'à distance, jamais au corps-à-corps."
  },
  {
    id: "oscar-drok", nom: "Oscar Drok (ermite fou)", type: "Nain M, Neutre",
    cr: "1", tags: ["aventure1", "pnj"],
    ac: "13 (cuir souillé)", pv: "50 (10d8+10)", vitesse: "9 m",
    stats: { for: 12, dex: 14, con: 14, int: 11, sag: 10, cha: 11 },
    comp: "Nature +4, Perception +5, Discrétion +6, Survie +5",
    sens: "Perception passive 14", langues: "Nain, Kelevan",
    traits: [
      "Ouïe et vue aiguisées. Avantage aux jets de Perception (ouïe/vue)."
    ],
    actions: [
      "Attaques multiples. Deux attaques au corps-à-corps ou deux à distance.",
      "Gourdin. +5 à toucher, allonge 1,50 m. Touché : 5 (1d6+2) contondants.",
      "Arc long. +4 à toucher, 45/180 m. Touché : 6 (1d8+2) perforants."
    ],
    notes: "Vieux nain chasseur devenu fou après avoir vu les vargouilles. Voit tout le monde comme des monstres aux yeux verts. Réduit à moins de la moitié de ses PV : s'effondre en sanglots. On peut le raisonner par des jours de réconfort, par calme (calm emotions) ou définitivement par restauration mineure."
  },

  /* ---------- Aventure 2 : PNJ spéciaux ---------- */
  {
    id: "drokag", nom: "Drokag le Hobgobelin", type: "Gobelinoïde M, Loyal Mauvais",
    cr: "2", tags: ["aventure2", "pnj", "boss"],
    ac: "18 (cotte de mailles, bouclier)", pv: "28 (4d8+8)", vitesse: "9 m",
    stats: { for: 14, dex: 12, con: 14, int: 10, sag: 10, cha: 10 },
    sens: "Vision dans le noir 18 m, Perception passive 10", langues: "Commun des Royaumes, Langue Sombre",
    traits: [
      "Avantage martial. 1×/tour, +7 (2d6) dégâts sur une attaque d'arme réussie si la cible est à 1,50 m d'un allié non neutralisé du hobgobelin."
    ],
    actions: [
      "Épée longue. +5 à toucher, allonge 1,50 m. Touché : 6 (1d8+2) tranchants, ou 7 (1d10+2) à deux mains.",
      "Arc long. +3 à toucher, 45/180 m. Touché : 6 (1d8+2) perforants."
    ],
    notes: "Ambitieux, rêve de gloire militaire. Se sert des kobolds comme boucliers vivants et tire à l'arbalète depuis l'autre côté du trou. À la moitié de ses PV, fuit vers l'autre tour pour prévenir Beryn. Porte la CLÉ DE CHIFFRE (déchiffre les notes de l'autel — révèle l'espionne Bebbin O'Nel)."
  },
  {
    id: "beryn", nom: "Beryn le Nécromancien", type: "Humain M, Loyal Mauvais",
    cr: "2", tags: ["aventure2", "pnj", "boss"],
    ac: "11", pv: "20 (5d6+5)", vitesse: "9 m",
    stats: { for: 10, dex: 12, con: 13, int: 15, sag: 12, cha: 11 },
    comp: "Arcanes +4, Histoire +4",
    sens: "Perception passive 11", langues: "Commun des Royaumes, Langue Sombre, Kelevan",
    traits: [
      "Moisson sinistre. 1×/tour, quand Beryn tue une créature avec un sort de niv 1+, il regagne des PV égaux au double du niveau du sort (triple si c'est un sort de nécromancie). Pas pour les morts-vivants/constructs.",
      "Incantation (mage niveau 4). Int, DC 12, +4 à l'attaque de sort.",
      "Sorts — Tours : contact glacial, réparation, rayon de givre. Niv 1 (4) : projectile magique, rayon de maladie, bouclier, trait ensorcelé. Niv 2 (3) : couronne de folie, image miroir."
    ],
    actions: [
      "Bâton. +2 à toucher, allonge 1,50 m. Touché : 3 (1d6) contondants, ou 4 (1d8) à deux mains."
    ],
    notes: "Nécromancien de peu de renom. Absorbé par son rituel (lever des squelettes). Quand les héros approchent, 3 squelettes qu'il vient d'animer se dressent : il s'en sert comme boucliers et lance ses sorts par-derrière. Combat potentiellement mortel si le goule et les squelettes du toit voisin ne sont pas neutralisés."
  },

  /* ---------- Monstres SRD référencés (MM p. XXX) ---------- */
  {
    id: "cultiste", nom: "Cultiste", type: "Humanoïde M, tout alignement mauvais",
    cr: "1/8", tags: ["srd", "humanoïde"],
    ac: "12 (armure de cuir)", pv: "9 (2d8)", vitesse: "9 m",
    stats: { for: 11, dex: 12, con: 10, int: 10, sag: 11, cha: 10 },
    comp: "Tromperie +2, Religion +2",
    sens: "Perception passive 10", langues: "une au choix",
    actions: [
      "Cimeterre. +3 à toucher, allonge 1,50 m. Touché : 4 (1d6+1) tranchants.",
      "Variante armée (aventure 1) : Morgenstern, +3 à toucher, 5 (1d8+1) perforants ; CA 14 (cotte de mailles)."
    ]
  },
  {
    id: "fanatique", nom: "Fanatique de secte", type: "Humanoïde M, tout alignement mauvais",
    cr: "2", tags: ["srd", "humanoïde"],
    ac: "13 (armure de cuir)", pv: "33 (6d8+6)", vitesse: "9 m",
    stats: { for: 11, dex: 14, con: 12, int: 10, sag: 13, cha: 14 },
    comp: "Tromperie +4, Persuasion +4, Religion +2",
    sens: "Perception passive 11", langues: "une au choix",
    traits: [
      "Incantation (prêtre niv 4). Sag, DC 11, +3. Tours : lumière, réparation, thaumaturgie. Niv 1 (4) : injonction, bouclier de la foi, blessure. Niv 2 (3) : immobilisation de personne, arme spirituelle."
    ],
    actions: [
      "Attaques multiples. Deux attaques de dague.",
      "Dague. +4 à toucher, allonge 1,50 m ou 6/18 m. Touché : 4 (1d4+2) perforants."
    ]
  },
  {
    id: "squelette", nom: "Squelette", type: "Mort-vivant M, Loyal Mauvais",
    cr: "1/4", tags: ["srd", "mort-vivant"],
    ac: "13 (débris d'armure)", pv: "13 (2d8+4)", vitesse: "9 m",
    stats: { for: 10, dex: 14, con: 15, int: 6, sag: 8, cha: 5 },
    sens: "Vision dans le noir 18 m, Perception passive 9", langues: "comprend ses langues de vivant",
    traits: [
      "Vulnérabilité : contondant. Immunité : poison. Immunité état empoisonné, épuisement.",
      "Variantes de l'aventure : gardes du sanctuaire — CA 15 (chemise de mailles), épée longue 6 (1d8+2) tranchants ; archers — arc long +4, 6 (1d8+2)."
    ],
    actions: [
      "Épée courte. +4 à toucher, allonge 1,50 m. Touché : 5 (1d6+2) perforants.",
      "Arc court. +4 à toucher, 24/96 m. Touché : 5 (1d6+2) perforants."
    ]
  },
  {
    id: "zombie", nom: "Zombie", type: "Mort-vivant M, Neutre Mauvais",
    cr: "1/4", tags: ["srd", "mort-vivant"],
    ac: "8", pv: "22 (3d8+9)", vitesse: "6 m",
    stats: { for: 13, dex: 6, con: 16, int: 3, sag: 6, cha: 5 },
    sens: "Perception passive 8", langues: "comprend ses langues de vivant mais ne parle pas",
    traits: [
      "Ténacité des morts-vivants. Réduit à 0 PV, JS Con DC 5 + dégâts subis pour rester à 1 PV (sauf radiant ou coup critique)."
    ],
    actions: [
      "Coup. +3 à toucher, allonge 1,50 m. Touché : 4 (1d6+1) contondants."
    ]
  },
  {
    id: "zombie-gobelours", nom: "Zombie gobelours", type: "Mort-vivant M, Neutre Mauvais",
    cr: "1", tags: ["srd", "mort-vivant", "aventure1"],
    ac: "8", pv: "27 (5d8+5)", vitesse: "9 m",
    stats: { for: 15, dex: 8, con: 13, int: 3, sag: 6, cha: 5 },
    sens: "Vision dans le noir 18 m, Perception passive 8", langues: "—",
    traits: [
      "Ténacité des morts-vivants (JS Con DC 5 + dégâts).",
      "Garde une salle : n'attaque que si on entre sans frapper trois coups ; ne quitte pas la pièce sauf ordre de Marnak."
    ],
    actions: [
      "Morgenstern. +4 à toucher, allonge 1,50 m. Touché : 9 (2d8) perforants."
    ]
  },
  {
    id: "goule", nom: "Goule", type: "Mort-vivant M, Chaotique Mauvais",
    cr: "1", tags: ["srd", "mort-vivant"],
    ac: "12", pv: "22 (5d8)", vitesse: "9 m",
    stats: { for: 13, dex: 15, con: 10, int: 7, sag: 10, cha: 6 },
    sens: "Vision dans le noir 18 m, Perception passive 10", langues: "Commun",
    traits: [
      "Immunité poison ; immunité états empoisonné, charmé, épuisement."
    ],
    actions: [
      "Morsure. +2 à toucher, allonge 1,50 m. Touché : 9 (2d6+2) perforants.",
      "Griffes. +4 à toucher, allonge 1,50 m. Touché : 7 (2d4+2) tranchants. JS Con DC 10 ou paralysie 1 min (nouveau JS chaque fin de tour ; les elfes y sont immunisés)."
    ],
    notes: "Aventure 2 : cette goule est rusée et parle. Elle s'allie à Beryn par intérêt (nourriture) et lui sert de garde. Tend une embuscade sur les poutres."
  },
  {
    id: "loup", nom: "Loup (chien de garde enragé)", type: "Bête G, Non aligné",
    cr: "1/4", tags: ["srd", "bête", "aventure1"],
    ac: "13 (armure naturelle)", pv: "11 (2d8+2)", vitesse: "12 m",
    stats: { for: 12, dex: 15, con: 12, int: 3, sag: 12, cha: 6 },
    comp: "Perception +3, Discrétion +4",
    sens: "Perception passive 13", langues: "—",
    traits: [
      "Tactique de meute. Avantage à l'attaque si un allié valide est à 1,50 m de la cible.",
      "Chez Oscar Drok : 5 gros chiens affamés et terrorisés. Dressage animal DC 15 (avec nourriture) pour les calmer."
    ],
    actions: [
      "Morsure. +4 à toucher, allonge 1,50 m. Touché : 7 (2d4+2) perforants. JS For DC 11 ou à terre."
    ]
  },
  {
    id: "rat-geant", nom: "Rat géant", type: "Bête P, Non aligné",
    cr: "1/8", tags: ["srd", "bête", "aventure1"],
    ac: "12", pv: "7 (2d6)", vitesse: "9 m",
    stats: { for: 7, dex: 15, con: 11, int: 2, sag: 10, cha: 4 },
    sens: "Vision dans le noir 18 m, Perception passive 10", langues: "—",
    traits: ["Tactique de meute (avantage si allié adjacent à la cible)."],
    actions: [
      "Morsure. +4 à toucher, allonge 1,50 m. Touché : 3 (1d4+2) perforants."
    ]
  },
  {
    id: "kobold", nom: "Kobold", type: "Humanoïde P, Loyal Mauvais",
    cr: "1/8", tags: ["srd", "humanoïde", "aventure2"],
    ac: "12", pv: "5 (2d6-2)", vitesse: "9 m",
    stats: { for: 7, dex: 15, con: 9, int: 8, sag: 7, cha: 8 },
    sens: "Vision dans le noir 18 m, Perception passive 8", langues: "Commun, Draconique",
    traits: [
      "Tactique de meute. Sensibilité au soleil (désavantage en plein soleil).",
      "Aventure 2 : non armés ou avec outils improvisés (scie 1d4 tranchant, marteau 1d6, perche 1d6, os lancés)."
    ],
    actions: [
      "Dague. +4 à toucher, allonge 1,50 m ou 6/18 m. Touché : 4 (1d4+2) perforants.",
      "Fronde. +4 à toucher, 9/36 m. Touché : 4 (1d4+2) contondants."
    ]
  },
  {
    id: "orc", nom: "Orc", type: "Humanoïde M, Chaotique Mauvais",
    cr: "1/2", tags: ["srd", "humanoïde", "aventure2"],
    ac: "13 (armure de cuir clouté)", pv: "15 (2d8+6)", vitesse: "9 m",
    stats: { for: 16, dex: 12, con: 16, int: 7, sag: 11, cha: 10 },
    comp: "Intimidation +2",
    sens: "Vision dans le noir 18 m, Perception passive 10", langues: "Commun, Orc",
    traits: ["Agressif. Action bonus : se déplacer vers un ennemi vu."],
    actions: [
      "Hache d'armes. +5 à toucher, allonge 1,50 m. Touché : 9 (1d12+3) tranchants.",
      "Javeline. +5 à toucher, 1,50 m ou 9/36 m. Touché : 6 (1d6+3) perforants."
    ]
  },
  {
    id: "gobelin", nom: "Gobelin", type: "Humanoïde P, Neutre Mauvais",
    cr: "1/4", tags: ["srd", "humanoïde", "aventure2"],
    ac: "15 (armure de cuir, bouclier)", pv: "7 (2d6)", vitesse: "9 m",
    stats: { for: 8, dex: 14, con: 10, int: 10, sag: 8, cha: 8 },
    comp: "Discrétion +6",
    sens: "Vision dans le noir 18 m, Perception passive 9", langues: "Commun, Gobelin",
    traits: ["Attaque sournoise. Désengagement/Repli en action bonus."],
    actions: [
      "Cimeterre. +4 à toucher, allonge 1,50 m. Touché : 5 (1d6+2) tranchants.",
      "Arc court. +4 à toucher, 24/96 m. Touché : 5 (1d6+2) perforants."
    ]
  },
  {
    id: "fenn", nom: "Fenn — loup de Sylwen (compagnon)", type: "Bête M, compagnon loyal",
    cr: "1/4", tags: ["compagnon", "solo", "aventure2"],
    ac: "13 (armure naturelle)", pv: "11 (2d8+2)", vitesse: "12 m",
    stats: { for: 12, dex: 15, con: 12, int: 3, sag: 12, cha: 6 },
    comp: "Perception +3, Discrétion +4", sens: "Perception passive 13", langues: "comprend Sylwen",
    traits: [
      "Tactique de meute. Avantage à l'attaque si un allié (Sylwen) est à 1,50 m de la cible.",
      "Compagnon : agit au tour de Sylwen, sur ordre. Loyal et intelligent pour un loup — il n'abandonne jamais sa maîtresse."
    ],
    actions: [
      "Morsure. +4 à toucher, allonge 1,50 m. Touché : 7 (2d4+2) perforants. JS Force DC 11 ou la cible tombe à terre."
    ],
    notes: "Le fidèle compagnon de Sylwen. En jeu solo, il double l'action économique : idéalement, Fenn engage au corps-à-corps (créant l'avantage) pendant que Sylwen tire à l'arc."
  }
];
