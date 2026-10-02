"""Relecture logique par thème du dictionnaire du Bac (intrus, doublons, mots hors catégorie).
Appliquée après la fusion des listes manuelles et des listes extraites des ressources."""

# Mots retirés d'une catégorie : hors thème, trop vagues ou doublons d'une autre forme.
REMOVED = {
    'bac-0005': ['instrument', 'ustensile', 'ipod'],  # trop vagues / marque
    'bac-0006': ['châtaignier', 'néflier', 'dattes', 'huckleberry', 'shiitake'],  # arbres, pluriel, anglicisme
    'bac-0008': ['darts (fléchettes)', 'eaux vives (kayak)', 'glisse'],
    'bac-0010': ['appeau', 'percussion', 'rhodes (piano)'],
    'bac-0011': ['sang', 'neurone', 'cheveux', 'bronches'],  # pas des parties du corps / pluriels
    'bac-0013': ['rapace'],  # famille, pas un oiseau
    'bac-0014': ['lasagnes', 'nems', 'spaghettis', 'sushis', 'goulash'],  # doublons du singulier
    'bac-0015': ['dessert glacé', 'vanille glacée', 'viennoiserie'],
    'bac-0016': ['bouillon', 'malt'],
    'bac-0017': ['if commun', 'ilex (houx)', 'rhus', 'bambou'],  # doublons latins, bambou = herbe
    'bac-0018': ['fleur de lotus'],  # doublon de lotus
    'bac-0021': ['Abidjan'],  # capitale : Yamoussoukro
    'bac-0022': ['benne'],
    'bac-0023': ['aspirateur'],
    'bac-0032': ['disque'],
    'bac-0039': ['clou', 'vis', 'griffe', 'guillaume (rabot)'],  # quincaillerie, pas des outils
    'bac-0047': ['Agatha Christie (série)'],
    'bac-0055': ['Il est cinq heures', 'Ensemble'],
    'bac-0061': ['basilic (créature)', 'Anubis'],  # doublon ; dieu égyptien, pas un monstre
    'bac-0116': ['nez qui coule'],
    'bac-0120': ['on mange'],
}

# Formes corrigées : titre complet avec son article, libellé plus naturel.
RENAMED = {
    'bac-0039': {'laser (niveau)': 'niveau laser'},
    'bac-0047': {'Casa de papel': 'La Casa de papel'},
    'bac-0055': {'Champs-Élysées': 'Les Champs-Élysées'},
    'bac-0057': {'Rouge et le Noir': 'Le Rouge et le Noir'},
}
