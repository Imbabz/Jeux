/* ============================================================
   FICHES PERSONNAGES pré-tirées (prêtes à jouer, saveur Farland)
   Format compatible avec l'onglet Personnages / le lanceur de dés.
   stats : valeurs 1-20 ; les modificateurs sont calculés à l'affichage.
   Ces pregens servent de modèles ; le joueur peut créer les siens
   (stockés dans le navigateur / localStorage).
   ============================================================ */

window.PREGENS = [
  {
    id: "pg-guerrier",
    nom: "Gorm Poing-de-Fer",
    classe: "Guerrier niv. 2", race: "Demi-orc",
    pv: 20, ca: 16, vitesse: "9 m", init: 1,
    stats: { for: 16, dex: 13, con: 15, int: 8, sag: 12, cha: 10 },
    maitrise: 2,
    jetsSauv: ["for", "con"],
    competences: ["Athlétisme", "Intimidation", "Survie", "Perception"],
    attaques: [
      { nom: "Épée longue", bonus: 5, degats: "1d8+3 tranchant (2 mains : 1d10+3)" },
      { nom: "Arc long", bonus: 3, degats: "1d8+1 perforant (45/180 m)" }
    ],
    capacites: [
      "Second souffle (bonus, 1×/repos court) : récupère 1d10+2 PV.",
      "Fougue (Action Surge, 1×/repos court) : une action supplémentaire.",
      "Résistance à la brutalité : 1×/jour reste à 1 PV au lieu de 0.",
      "Vision dans le noir 18 m."
    ],
    equipement: "Cotte de mailles, bouclier (rangé si arc), épée longue, arc long + 20 flèches, sac d'aventurier, 15 pa.",
    notes: "Tank de première ligne. Idéal pour encaisser hold person et les morsures."
  },
  {
    id: "pg-clerc",
    nom: "Sœur Aline de Bestra",
    classe: "Clerc niv. 2 (Domaine de la Vie)", race: "Humaine",
    pv: 16, ca: 18, vitesse: "9 m", init: 0,
    stats: { for: 13, dex: 10, con: 14, int: 11, sag: 16, cha: 12 },
    maitrise: 2,
    jetsSauv: ["sag", "cha"],
    competences: ["Médecine", "Religion", "Perspicacité", "Persuasion"],
    dcSort: 13, attaqueSort: 5,
    attaques: [
      { nom: "Masse d'armes", bonus: 4, degats: "1d6+1 contondant" },
      { nom: "Flamme sacrée (tour)", bonus: 5, degats: "1d8 radiant (JS Dex DC 13)" }
    ],
    sorts: [
      "Tours : flamme sacrée, réparation, lumière.",
      "Niv 1 (3 empl.) : soins (1d8+3 renforcé Vie), bénédiction, injonction, sanctuaire, blessure.",
      "Niv 2 (2 empl.) : arme spirituelle, immobilisation de personne, restauration mineure (guérit Oscar Drok / la maladie vargouille)."
    ],
    capacites: [
      "Renvoi des morts-vivants (Channel Divinity, DC 13) — TRÈS utile contre squelettes/zombies. ⚠ Dans la cave du manoir (aventure 1), le sol impie donne l'avantage aux morts-vivants.",
      "Disciple de la Vie : chaque sort de soin ajoute 2 + niveau du sort."
    ],
    equipement: "Cotte de mailles, bouclier, masse d'armes, symbole sacré de Bestra, sacoche de composantes, 15 pa.",
    notes: "Soigneuse & anti-morts-vivants. Peut lever la malédiction de la Reine Vargouille."
  },
  {
    id: "pg-roublard",
    nom: "Wren la Silencieuse",
    classe: "Roublard niv. 2", race: "Halfeline",
    pv: 14, ca: 14, vitesse: "7,50 m", init: 3,
    stats: { for: 9, dex: 16, con: 12, int: 13, sag: 12, cha: 14 },
    maitrise: 2,
    jetsSauv: ["dex", "int"],
    competences: ["Discrétion (expertise)", "Crochetage (expertise)", "Perception", "Investigation", "Acrobaties", "Escamotage"],
    attaques: [
      { nom: "Rapière", bonus: 5, degats: "1d8+3 perforant" },
      { nom: "Arc court", bonus: 5, degats: "1d6+3 perforant (24/96 m)" },
      { nom: "Dague (lancer)", bonus: 5, degats: "1d4+3 (6/18 m)" }
    ],
    capacites: [
      "Attaque sournoise : +1d6 dégâts (avantage ou allié adjacent à la cible).",
      "Ruse (bonus) : Se désengager / Foncer / se Cacher en action bonus.",
      "Chanceuse (halfelin) : relance les 1 naturels sur d20.",
      "Expertise : double maîtrise en Discrétion et Crochetage."
    ],
    equipement: "Armure de cuir, rapière, arc court + 20 flèches, 2 dagues, outils de voleur, 15 pa.",
    notes: "Détecte/désarme les pièges (arbalète, fosse), crochette les coffres, éclaireuse. Parfaite pour la tour et le manoir."
  },
  {
    id: "pg-magicien",
    nom: "Edran Cœur-de-Braise",
    classe: "Magicien niv. 2 (Évocation)", race: "Humain",
    pv: 13, ca: 12, vitesse: "9 m", init: 2,
    stats: { for: 8, dex: 14, con: 13, int: 16, sag: 12, cha: 10 },
    maitrise: 2,
    jetsSauv: ["int", "sag"],
    competences: ["Arcanes", "Histoire", "Investigation", "Perception"],
    dcSort: 13, attaqueSort: 5,
    attaques: [
      { nom: "Trait de feu (tour)", bonus: 5, degats: "1d10 feu (36 m)" },
      { nom: "Rayon de givre (tour)", bonus: 5, degats: "1d8 froid, -3 m vitesse" },
      { nom: "Dague", bonus: 4, degats: "1d4+2 perforant" }
    ],
    sorts: [
      "Tours : trait de feu, rayon de givre, main du mage, lumière.",
      "Niv 1 (3 empl.) : projectile magique (auto-touche, utile vs vargouilles), mains brûlantes, bouclier, armure du mage, sommeil.",
      "Sculpteur de sorts : peut épargner ses alliés d'une évocation."
    ],
    capacites: [
      "Récupération arcanique (1×/jour, repos court) : récupère des emplacements de sort.",
      "Rituels depuis le grimoire (détection de la magie, identification…)."
    ],
    equipement: "Bâton, dague, grimoire, sacoche de composantes, 15 pa.",
    notes: "Artillerie. Projectile magique ne rate jamais — utile contre les vargouilles cachées."
  },
  {
    id: "pg-rodeur",
    nom: "Kaelin des Bois",
    classe: "Rôdeur niv. 2 (Chasseur)", race: "Elfe des bois",
    pv: 17, ca: 15, vitesse: "10,50 m", init: 3,
    stats: { for: 12, dex: 16, con: 13, int: 10, sag: 14, cha: 10 },
    maitrise: 2,
    jetsSauv: ["for", "dex"],
    competences: ["Survie", "Perception", "Discrétion", "Nature", "Dressage"],
    dcSort: 12, attaqueSort: 4,
    attaques: [
      { nom: "Arc long", bonus: 5, degats: "1d8+3 perforant (45/180 m)" },
      { nom: "2 épées courtes", bonus: 5, degats: "1d6+3 / 1d6 (bonus) tranchant" }
    ],
    sorts: [
      "Niv 1 (2 empl.) : marque du chasseur (+1d6 sur une cible), soin des blessures, flèche assurée, communication avec les animaux."
    ],
    capacites: [
      "Ennemi juré : morts-vivants (avantage aux jets pour les pister/se souvenir).",
      "Explorateur né : difficile à surprendre en nature.",
      "Sang-froid elfique : avantage vs charme, immunité au sommeil magique.",
      "Vision dans le noir 18 m, pieds légers.",
      "Dressage : peut calmer les chiens d'Oscar Drok."
    ],
    equipement: "Armure de cuir clouté, arc long + 20 flèches, 2 épées courtes, kit d'explorateur, 15 pa.",
    notes: "Éclaireur/archer polyvalent. Marque du chasseur pour piquer un boss."
  }
];
