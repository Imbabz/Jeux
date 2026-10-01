"""Prénoms et noms de famille (base INSEE via @socialgouv/match-entities) : la source est en
majuscules sans accents ; on remet les accents des plus courants et on écarte les particules."""

JUNK = {'DE', 'EL', 'DIT', 'EPSE', 'FILS', 'MA', 'DA', 'MAR', 'THI', 'VAN', 'BEN', 'MARI', 'ABD', 'DU', 'LE', 'LA', 'DOS', 'DES'}

ACCENTS = dict(pair.split('=') for pair in """ANDRE=André FRANCOIS=François RENE=René GERARD=Gérard ERIC=Éric
FRANCOISE=Françoise FREDERIC=Frédéric STEPHANE=Stéphane SEBASTIEN=Sébastien HELENE=Hélène EMILE=Émile
THERESE=Thérèse MICHELE=Michèle VALERIE=Valérie JEROME=Jérôme VERONIQUE=Véronique JOEL=Joël JOSE=José
HERVE=Hervé ANDREE=Andrée STEPHANIE=Stéphanie CELINE=Céline RENEE=Renée LEON=Léon CECILE=Cécile
EUGENE=Eugène GENEVIEVE=Geneviève BENOIT=Benoît CEDRIC=Cédric NOEL=Noël EMILIE=Émilie BEATRICE=Béatrice
AURELIE=Aurélie ETIENNE=Étienne AGNES=Agnès EVELYNE=Évelyne EDOUARD=Édouard MICKAEL=Mickaël GISELE=Gisèle
REGIS=Régis CLEMENT=Clément ELODIE=Élodie JOELLE=Joëlle ELIANE=Éliane REMY=Rémy DANIELE=Danièle
RAPHAEL=Raphaël JEREMY=Jérémy GREGORY=Grégory LOIC=Loïc REMI=Rémi ELIE=Élie MELANIE=Mélanie FELIX=Félix
SEVERINE=Séverine AIME=Aimé ELISE=Élise FREDERIQUE=Frédérique IRENE=Irène REGINE=Régine ANGELIQUE=Angélique
AURELIEN=Aurélien NOELLE=Noëlle EDITH=Édith AMELIE=Amélie GERALDINE=Géraldine GAELLE=Gaëlle GERALD=Gérald
ANGELE=Angèle ANAIS=Anaïs LEA=Léa GAETAN=Gaëtan BENEDICTE=Bénédicte DESIRE=Désiré NADEGE=Nadège
EUGENIE=Eugénie CHLOE=Chloé CLEMENCE=Clémence MARLENE=Marlène JEREMIE=Jérémie GAEL=Gaël GREGOIRE=Grégoire
AIMEE=Aimée EMILIENNE=Émilienne MOISE=Moïse NOEMIE=Noémie DOROTHEE=Dorothée LEO=Léo ARSENE=Arsène
CLEMENTINE=Clémentine LEONE=Léone EMILIEN=Émilien LEOPOLD=Léopold MYLENE=Mylène JOSEE=Josée MIKAEL=Mikaël
LEONIE=Léonie GWENAELLE=Gwenaëlle MARYLENE=Marylène LEONARD=Léonard CELIA=Célia CESAR=César
THEODORE=Théodore ADELE=Adèle EMELINE=Émeline OPHELIE=Ophélie AMEDEE=Amédée EVE=Ève INES=Inès
CELESTIN=Célestin THEOPHILE=Théophile THEO=Théo CECILIA=Cécilia HONORE=Honoré ELEONORE=Éléonore
LEONCE=Léonce SOLENE=Solène BARTHELEMY=Barthélemy ELOI=Éloi RAPHAELLE=Raphaëlle REJANE=Réjane
OCEANE=Océane ISMAEL=Ismaël FELICIEN=Félicien GWENAEL=Gwenaël DESIREE=Désirée ADELAIDE=Adélaïde
BERENGERE=Bérengère CHERIF=Chérif TIMOTHEE=Timothée IRENEE=Irénée HEDI=Hédi MAITE=Maïté ELOISE=Éloïse
ZOE=Zoé BERANGERE=Bérangère HELOISE=Héloïse FELICIE=Félicie MELODIE=Mélodie EMERIC=Émeric ISMAIL=Ismaïl
AICHA=Aïcha VALERY=Valéry CHRISTELE=Christèle SAID=Saïd AISSA=Aïssa SMAIL=Smaïl EMMA=Emma
LEFEVRE=Lefèvre MENARD=Ménard HEBERT=Hébert BENARD=Bénard LEGER=Léger GERAUD=Géraud LEMAITRE=Lemaître
CHENE=Chêne GENDRE=Gendre BRUNEAU=Bruneau PREVOST=Prévost FREMONT=Frémont GREGOIRE=Grégoire
""".split())


def pretty(raw):
    """« JEAN-PIERRE » → « Jean-Pierre », avec accents si connus."""
    if raw in ACCENTS:
        return ACCENTS[raw]
    parts = [ACCENTS.get(p, p.capitalize()) for p in raw.split('-')]
    return '-'.join(parts)


def top(names, limit):
    out = []
    for raw, _ in sorted(names, key=lambda x: -x[1]):
        if raw in JUNK or len(raw) < 2 or ' ' in raw:
            continue
        out.append(pretty(raw))
        if len(out) >= limit:
            break
    return out
