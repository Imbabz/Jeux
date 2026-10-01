"""Journal de la seconde vérification du contenu (sources web multiples).
OVERRIDES : id → champs corrigés, appliqués par les scripts build_*.py.
REMOVED   : ids supprimés faute de certitude.
Chaque entrée garde la raison et les sources consultées."""

OVERRIDES = {
    'yr-0003': {'context': "Le manuscrit avait été refusé par une dizaine d'éditeurs avant d'être accepté à Londres."},
    # Sources : fr.wikipedia (Harry Potter à l'école des sorciers), actualitte.com — « dix » ou « douze » selon les sources.
    'yr-0017': {'context': "Fleming a reçu le prix Nobel de médecine en 1945, avec Florey et Chain, qui ont rendu le médicament utilisable."},
    # Sources : en.wikipedia (Discovery of penicillin), Asimov Press « The Penicillin Myth » — le retour de vacances n'est attesté par aucun document d'époque.
    'yr-0052': {'text': "Le brevet du pneu de vélo gonflable de l'Écossais John Boyd Dunlop",
                'context': "Ce brevet a ensuite été invalidé : un autre Écossais, Robert Thomson, avait breveté l'idée dès 1846."},
    # Sources : en.wikipedia (John Boyd Dunlop), newsletter.co.uk, gracesguide.co.uk.
    'yr-0083': {'text': "L'invention de la machine électrique à barbe à papa"},
    # Sources : en.wikipedia (William Morrison), National Geographic — demande de brevet 1897, accordé en 1899.
    'yr-0136': {'context': "Ses premiers vols commerciaux reliaient Paris à Rio, via Dakar, et Londres à Bahreïn."},
    # Sources : fr.wikipedia (Concorde), Air France Corporate (21 janvier 1976) — New York n'est desservi qu'à partir de fin 1977.
    'yr-0151': {'context': "Depuis Copenhague, on passe d'abord sous la mer en tunnel, puis par une île artificielle, avant le pont."},
    # Sources : en.wikipedia (Øresund Bridge, Peberholm), oresundsbron.com.
    'yr-0187': {'context': "Le Club Med ayant refusé le tournage, le film a été tourné dans un village de vacances semblable, en Côte d'Ivoire."},
    # Sources : fr.wikipedia (Les Bronzés), Le Parisien, Allociné (secrets de tournage, Assouindé).

    # --- Estimation ---
    'est-0006': {'context': "Autant que dans le cou humain : chacune mesure simplement plus de 25 centimètres."},
    # Sources : Giraffe Conservation Foundation, worldatlas.com — 25 à 28 cm selon les sources, d'où « plus de ».
    'est-0011': {'answer': 100, 'context': "La vitesse la plus élevée mesurée de façon fiable est de 104 km/h, sur quelques centaines de mètres."},
    # Sources : en.wikipedia (Fastest animals), Cincinnati Zoo (98 km/h en 2012), Tsavo Trust — 110 km/h n'a jamais été mesuré.
    'est-0075': {'context': "La Belgique a battu ce record en 2020, avec 652 jours."},
    # Sources : Guinness World Records, Brussels Times, Al Jazeera (2020).
    'est-0080': {'answer': 560000, 'context': "Son port est le deuxième d'Europe, derrière Rotterdam."},
    # Sources : fr.wikipedia (Anvers) — 562 002 habitants au 1er janvier 2025, après la fusion avec Borsbeek.
    'est-0082': {'context': "Le beffroi, haut de 83 mètres, penche d'environ un mètre depuis des siècles."},
    # Sources : fr.wikipedia (Beffroi de Bruges : 1,19 m), visitbruges.be.
    'est-0084': {'context': "Chacun est peint aux couleurs d'un pays européen, devant son drapeau."},
    # Sources : atlasobscura.com, sax.dinant.be — installés en 2010 ; 28 saxophones alors que l'UE comptait 27 pays : on reste général.
    'est-0102': {'answer': 650000},
    # Sources : National Records of Scotland, estimations mi-2024 (Glasgow City 650 300).
    'est-0103': {'answer': 530000},
    # Sources : National Records of Scotland, estimations mi-2024 (City of Edinburgh 530 680).
    'est-0115': {'context': "C'est le deuxième plus grand monument dédié à un écrivain, après celui de José Martí à La Havane."},
    # Sources : en.wikipedia (Scott Monument, José Martí Memorial).
    'est-0177': {'answer': 10, 'context': "Une meule d'environ 40 kilos demande à peu près 400 litres de lait."},
    # Sources : comte.com (Portrait d'un grand fromage), agriculture.gouv.fr, DRAAF Bourgogne-Franche-Comté.
    'est-0184': {'question': "Combien de cépages traditionnels sont autorisés pour élaborer le champagne ?",
                 'context': "Trois dominent : chardonnay, pinot noir et meunier. Un huitième, le voltis, est admis à l'essai depuis 2022."},
    # Sources : dico-du-vin.com, Comité Champagne (levigneronchampenois.comitechampagne.fr), vitisphere.com.
    'est-0187': {'context': "En France, on en consomme en moyenne 7 à 9 grammes par jour."},
    # Sources : ANSES, étude INCA 3 (9 g pour les hommes, 7 g pour les femmes).
    'est-0191': {'context': "Depuis un décret de 1993, elle se fait sans aucun additif : farine, eau, sel et levure ou levain."},
    # Sources : france-pittoresque.com, lepainfrancais.fr — quelques adjuvants (farine de fève…) restent tolérés, d'où « additif ».
    'est-0199': {'question': "Combien de litres d’eau conseille-t-on pour cuire 500 grammes de pâtes ?", 'answer': 5},
    # Correction de forme : « 1 litres » s'affichait au singulier fautif ; la règle d'un litre pour 100 g est inchangée.

    # --- Bac Éclair : lettres injouables retirées (relecture lettre par lettre) ---
    'bac-0006': {'add_excluded': 'V'}, 'bac-0009': {'add_excluded': 'H'},
    'bac-0024': {'add_excluded': 'U'}, 'bac-0029': {'add_excluded': 'U'}, 'bac-0030': {'add_excluded': 'U'},
    'bac-0031': {'add_excluded': 'U'}, 'bac-0032': {'add_excluded': 'U'}, 'bac-0033': {'add_excluded': 'UJ'},
    'bac-0035': {'add_excluded': 'U'}, 'bac-0087': {'add_excluded': 'U'}, 'bac-0089': {'add_excluded': 'U'},
    'bac-0090': {'add_excluded': 'U'}, 'bac-0091': {'add_excluded': 'U'}, 'bac-0097': {'add_excluded': 'U'},
    'bac-0098': {'add_excluded': 'U'}, 'bac-0111': {'add_excluded': 'U'},
    # Packs complétés : deux catégories écartées (pays d'Amérique, Tintin) faute de mots en alternance.
    'bac-0019': {'packs': ['general', 'belgium', 'sport', 'food', 'pop']},
    'bac-0013': {'packs': ['general', 'history-science', 'scotland', 'geo-travel']},
    'bac-0092': {'packs': ['geo-travel', 'scotland', 'history-science']},
}
REMOVED = {
    'est-0101',
    # Royal Mile : 1,8 km (un mile écossais) selon les offices de tourisme, 1,43 km selon en.wikipedia. Sources contradictoires.
}


def apply(items):
    from hints import HINTS
    # Applique les corrections par id ; les ids restent stables (une suppression laisse un trou).
    out = []
    for item in items:
        if item['id'] in REMOVED:
            continue
        fix = dict(OVERRIDES.get(item['id'], {}))
        extra = fix.pop('add_excluded', '')
        item = {**item, **fix}
        if extra:
            item['excludedLetters'] = item['excludedLetters'] + [l for l in extra if l not in item['excludedLetters']]
        if item['id'] in HINTS:
            item['hint'] = HINTS[item['id']]
        out.append(item)
    return out
