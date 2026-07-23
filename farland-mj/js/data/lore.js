/* ============================================================
   UNIVERS DE FARLAND — Données de référence (World of Farland)
   Source : farlandworld.com (setting gratuit, compatible D&D 5e)
   Contenu résumé/adapté en français pour l'usage du MJ.
   ============================================================ */

window.FARLAND_LORE = {

  intro: {
    titre: "Le Monde de Farland",
    texte: [
      "Farland (le monde de Núrion) est un cadre de campagne de fantasy sombre, gratuit et compatible D&D 5e. On le décrit comme un mélange entre Le Seigneur des Anneaux et Le Trône de Fer : un monde héroïque classique auquel on a ajouté la noirceur, la trahison et le désespoir.",
      "Il y a des siècles, le monde a été CONQUIS PAR LE MAL. Le dieu noir Vornoth et ses serviteurs ont soumis les peuples libres. Le continent central a été découpé en SEPT ROYAUMES, chacun gouverné par un Seigneur du Péché — l'incarnation vivante d'un des sept péchés capitaux.",
      "Aujourd'hui, une Libération est en cours. Plusieurs royaumes se sont affranchis mais vacillent au bord de l'effondrement, et la guerre totale contre les puissances des ténèbres approche. C'est dans ce climat que les héros interviennent."
    ],
    monnaie: "IMPORTANT — Monnaie : Farland utilise l'ÉTALON ARGENT. Une pièce d'argent (pa) vaut ce que vaut une pièce d'or (po) dans le D&D standard. Ordre décroissant : platine (pp) > argent (pa) > cuivre (pc) > étain (pe / 'tp'). Si un prix du manuel dit « po », lisez « pa » dans Farland."
  },

  seigneursDuPeche: {
    titre: "Les Sept Seigneurs du Péché",
    texte: "Chaque royaume conquis est dominé par un Seigneur incarnant un péché capital, servant du dieu noir Vornoth.",
    liste: [
      { peche: "Orgueil (Pride)",      note: "Le plus arrogant des tyrans." },
      { peche: "Envie (Envy)",         note: "Convoite ce que possèdent les autres." },
      { peche: "Colère (Wrath)",       note: "Règne par la fureur et la guerre." },
      { peche: "Paresse (Sloth)",      note: "Seigneur du royaume de ZELAND (cf. « Les Tours de la Nuit »). Sa négligence laisse pourrir la terre et prospérer les morts-vivants." },
      { peche: "Avarice (Greed)",      note: "Amasse et affame ses sujets." },
      { peche: "Gourmandise (Gluttony)", note: "Dévore les ressources de son royaume." },
      { peche: "Luxure (Lust)",        note: "Corrompt par le désir et la manipulation." }
    ]
  },

  royaumes: {
    titre: "Royaumes cités dans ces aventures",
    liste: [
      {
        nom: "Le Royaume de Daven",
        texte: "Théâtre de « Ce qui se cache à l'intérieur ». Longtemps ravagé par le mal depuis la Libération, mais le village d'Eichen, isolé en bordure d'une grande forêt et loin des routes commerciales, avait été jusque-là épargné — avant que d'étranges disparitions et des cadavres décapités ne commencent."
      },
      {
        nom: "Le Royaume de Zeland",
        texte: "Théâtre de « Les Tours de la Nuit ». Gouverné par le Seigneur de la Paresse. Sa capitale des patrouilles est Hestor. Autrefois, les Zelandais enterraient leurs morts au sommet des Tours de l'Attente, sur la Plaine des Batailles (Battleplain), pendant un an, avant de jeter les os dans une fosse à la base de la tour. Le camp rebelle de Loch Brech survit au nord."
      }
    ]
  },

  dieux: {
    titre: "Les Divinités de Farland",
    texte: "Le panthéon (Grandes Divinités). Les prêtres et cultistes rencontrés dans ces aventures servent l'un de ces dieux.",
    bons: {
      titre: "Dieux BONS",
      liste: [
        { nom: "Heshtail", dom: "Le Père, dieu du soleil, de la lumière et des serments." },
        { nom: "Bestra", dom: "Déesse de l'amour, de la beauté et de la nature. Très vénérée par les gens simples (symboles de Bestra apparaissent dans les deux aventures : prêtresse Katrina Rabe à Eichen, tente-temple au camp de Loch Brech)." },
        { nom: "Kantor Tal-Allustiel", dom: "Dieu elfique de la magie, de la connaissance et de la musique. Jadis pair des dieux les plus anciens." },
        { nom: "Khuldul Rockcarver", dom: "Dieu nain de la forge, de la pierre et de l'artisanat." },
        { nom: "Khuckduck Gemcutter", dom: "Dieu gnome des gemmes, de l'ingéniosité et de l'invention." },
        { nom: "Bunga Proudfoot", dom: "Dieu halfelin du foyer, du réconfort et de la chance." }
      ]
    },
    neutres: {
      titre: "Dieux NEUTRES",
      liste: [
        { nom: "Neltak", dom: "Dieu de la nature sauvage, des tempêtes et de la survie (prêtre Boris Whiteanvil à Eichen)." },
        { nom: "Dekk", dom: "Dieu du voyage, du commerce et du hasard. Patron le plus courant des druides, qui prétendent avoir suivi l'exemple de neutralité absolue de Neltak." },
        { nom: "Bel", dom: "Dieu de la guerre, de la loi et de l'ordre martial." }
      ]
    },
    mauvais: {
      titre: "Dieux MAUVAIS",
      liste: [
        { nom: "Vornoth", dom: "LE dieu noir, le plus jeune et le plus terrible des dieux du Mal. Dans la Langue Sombre : Vorna'ith, « Dieu des Dieux ». Né lorsque la Triade Voilée — Lagur l'Archtyran, Grlarshh le Malade, et Soggoth le Calamiteux — combina ses pouvoirs. Maître de tous les êtres les plus vils du plan mortel. Le monument orc de la tombe (aventure 1) lui est dédié." },
        { nom: "Grlarshh (le Malade / le Diseur de Secrets Sombres)", dom: "Dieu déchu des secrets interdits, de la maladie et de la corruption. Jadis pair des plus anciens dieux, il a sombré à cause de sa longue guerre contre Vornoth. C'est LUI que sert le culte des Morgenstein dans « Ce qui se cache à l'intérieur »." }
      ]
    }
  },

  races: {
    titre: "Peuples jouables",
    texte: "Farland utilise les races classiques de D&D 5e avec une saveur sombre. Dans ces aventures on croise surtout des humains, quelques demi-orcs et nains.",
    liste: [
      "Humains — dominants dans les royaumes de Daven et Zeland (Eichen est humain à 95 %, demi-orc à 5 %).",
      "Nains — artisans et ermites (ex. Oscar Drok, le chasseur reclus).",
      "Demi-orcs — intégrés dans certains villages (ex. Conrad Smithstan, forgeron d'Eichen).",
      "Elfes, Gnomes, Halfelins — présents dans le monde, chacun avec sa divinité tutélaire (voir panthéon).",
      "Peuples sombres (« dark folk ») — orcs, gobelins, hobgobelins, kobolds : serviteurs des Seigneurs du Péché, croisés en patrouille."
    ]
  },

  langues: {
    titre: "Langues courantes",
    liste: [
      "Kelevan — le « commun » humain des royaumes.",
      "Kingdom Common — langue commune des royaumes libres.",
      "Dark Speech (Langue Sombre) — parlée par les serviteurs du mal et les orcs ; runes anciennes de la tombe orc.",
      "Infernal — langue des cultes et des créatures extraplanaires (les prières à Grlarshh).",
      "Nain, Elfique, etc. — langues raciales classiques."
    ]
  }
};
