"""Rattachement des catégories du Bac Éclair aux ressources lexicales.
Pour chaque catégorie : des sous-classes (étiquette affichée) et les synsets WordNet racines.
Seuls les noms communs connus de Lexique (fréquence ≥ min_freq par million de mots) sont gardés."""

WORDNET = {
    # Ordre des sous-classes : de la plus précise à la plus large (le premier rattachement gagne,
    # pour que « papillon » soit un insecte et pas la race de chien du même nom).
    'bac-0001': dict(min_freq=0.05, classes=[
        ('crustacé', ['crustacean.n.01']), ('arachnide', ['arachnid.n.01']), ('insecte', ['insect.n.01']),
        ('mollusque', ['mollusk.n.01']), ('oiseau', ['bird.n.01']), ('poisson', ['fish.n.01']),
        ('reptile', ['reptile.n.01']), ('amphibien', ['amphibian.n.03']), ('ver', ['worm.n.01']),
        ('mammifère', ['mammal.n.01']), ('animal', ['animal.n.01'])]),
    'bac-0092': dict(min_freq=0.05, classes=[
        ('oiseau', ['bird.n.01']), ('reptile', ['reptile.n.01']), ('amphibien', ['amphibian.n.03']),
        ('poisson', ['fish.n.01']), ('mammifère', ['mammal.n.01'])],
        exclude_roots=['domestic_animal.n.01', 'livestock.n.01', 'dog.n.01', 'domestic_cat.n.01', 'poultry.n.02']),
    'bac-0013': dict(min_freq=0.02, classes=[
        ('rapace', ['bird_of_prey.n.01', 'owl.n.01']), ('passereau', ['passerine.n.01']),
        ('oiseau aquatique', ['aquatic_bird.n.01']), ('gallinacé', ['gallinaceous_bird.n.01']),
        ('oiseau', ['bird.n.01'])]),
    'bac-0004': dict(min_freq=0.1, classes=[
        ('santé', ['health_professional.n.01', 'medical_practitioner.n.01', 'nurse.n.01']),
        ('artisanat', ['craftsman.n.03', 'skilled_worker.n.01']),
        ('commerce', ['merchant.n.01', 'salesperson.n.01', 'shopkeeper.n.01']),
        ('arts et spectacle', ['artist.n.01', 'performer.n.01', 'musician.n.01', 'writer.n.01']),
        ('sciences', ['scientist.n.01']), ('droit', ['lawyer.n.01', 'jurist.n.01']),
        ('enseignement', ['educator.n.01']), ('transport', ['driver.n.01', 'pilot.n.01', 'sailor.n.01']),
        ('sécurité', ['lawman.n.01', 'firefighter.n.01', 'soldier.n.01', 'guard.n.01']),
        ('agriculture', ['farmer.n.01']), ('cuisine', ['cook.n.01']),
        ('métier', ['worker.n.01', 'professional.n.01', 'employee.n.01'])], no_instances=True),
    'bac-0006': dict(min_freq=0.05, classes=[
        ('fruit', ['edible_fruit.n.01', 'berry.n.01', 'citrus.n.01']), ('légume', ['vegetable.n.01']),
        ('fruit sec', ['edible_nut.n.01'])]),
    'bac-0100': dict(min_freq=0.05, classes=[('légume', ['vegetable.n.01'])]),
    'bac-0008': dict(min_freq=0.05, classes=[('sport', ['sport.n.01', 'athletic_game.n.01'])]),
    'bac-0009': dict(min_freq=0.05, classes=[('couleur', ['chromatic_color.n.01', 'achromatic_color.n.01'])]),
    'bac-0010': dict(min_freq=0.03, classes=[
        ('à cordes', ['stringed_instrument.n.01']), ('à vent', ['wind_instrument.n.01']),
        ('percussion', ['percussion_instrument.n.01']), ('à clavier', ['keyboard_instrument.n.01']),
        ('instrument', ['musical_instrument.n.01'])]),
    'bac-0011': dict(min_freq=0.1, classes=[
        ('organe', ['internal_organ.n.01', 'organ.n.01']), ('os', ['bone.n.01']),
        ('partie du corps', ['body_part.n.01'])]),
    'bac-0012': dict(min_freq=0.05, classes=[
        ('chaussure', ['footwear.n.02', 'footwear.n.01']), ('couvre-chef', ['headdress.n.01']),
        ('vêtement', ['clothing.n.01', 'garment.n.01'])]),
    'bac-0014': dict(min_freq=0.05, classes=[('plat', ['dish.n.02']), ('soupe', ['soup.n.01'])]),
    'bac-0015': dict(min_freq=0.05, classes=[
        ('gâteau', ['cake.n.03']), ('pâtisserie', ['pastry.n.02']), ('glace', ['frozen_dessert.n.01']),
        ('dessert', ['dessert.n.01'])]),
    'bac-0016': dict(min_freq=0.05, classes=[
        ('alcool', ['alcohol.n.01']), ('boisson chaude', ['coffee.n.01', 'tea.n.01']),
        ('boisson', ['beverage.n.01'])]),
    'bac-0017': dict(min_freq=0.05, classes=[
        ('conifère', ['conifer.n.01']), ('arbre fruitier', ['fruit_tree.n.01']), ('arbre', ['tree.n.01'])]),
    'bac-0018': dict(min_freq=0.03, classes=[('fleur', ['flower.n.01'])]),
    'bac-0022': dict(min_freq=0.1, classes=[
        ('bateau', ['vessel.n.02', 'boat.n.01']), ('aéronef', ['aircraft.n.01']),
        ('véhicule', ['wheeled_vehicle.n.01', 'motor_vehicle.n.01', 'vehicle.n.01'])], no_instances=True),
    'bac-0039': dict(min_freq=0.1, classes=[('outil', ['hand_tool.n.01', 'tool.n.01'])]),
    'bac-0061': dict(min_freq=0.05, classes=[('créature', ['imaginary_being.n.01', 'mythical_monster.n.01'])],
                     no_instances=True),
    'bac-0086': dict(min_freq=0.02, classes=[('langue', ['natural_language.n.01'])], no_instances=True),
    'bac-0093': dict(min_freq=0.02, classes=[('fromage', ['cheese.n.01'])]),
    'bac-0094': dict(min_freq=0.05, classes=[
        ('crustacé', ['crustacean.n.01', 'shellfish.n.01']), ('coquillage', ['mollusk.n.01']),
        ('poisson', ['food_fish.n.01', 'fish.n.01'])]),
    'bac-0095': dict(min_freq=0.05, classes=[('épice', ['spice.n.02', 'spice.n.01']), ('herbe', ['herb.n.02', 'herb.n.01'])]),
    'bac-0096': dict(min_freq=0.05, classes=[('friandise', ['candy.n.01', 'sweet.n.03'])]),
    'bac-0110': dict(min_freq=0.05, classes=[('tissu', ['fabric.n.01']), ('matière', ['leather.n.01', 'fiber.n.01'])]),
}
