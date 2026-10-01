import { expect, test, type Page } from '@playwright/test';

/**
 * Captures 375 × 667 de chaque écran (relecture design avant chaque point d'arrêt),
 * partie Express jouée de bout en bout avec les trois jeux, et vérification « aucun scroll en manche ».
 */

async function shot(page: Page, name: string) {
  await page.waitForTimeout(400); // laisse finir les animations d'entrée
  await page.screenshot({ path: `e2e/screenshots/${name}.png` });
}

async function expectNoScroll(page: Page) {
  const overflow = await page.evaluate(
    () => document.documentElement.scrollHeight - window.innerHeight,
  );
  expect(overflow).toBeLessThanOrEqual(0);
}

const taken = new Set<string>();
async function once(page: Page, name: string) {
  if (taken.has(name)) return;
  taken.add(name);
  await expectNoScroll(page);
  await shot(page, name);
}

async function typeYear(page: Page, year: string) {
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Effacer' }).click();
  for (const d of year) await page.getByRole('button', { name: d, exact: true }).click();
  await page.getByRole('button', { name: 'Valider' }).click();
}

async function typeEstim(page: Page, digits: string, multiplier?: string) {
  for (const d of digits) {
    await page.getByRole('button', { name: d === ',' ? 'Virgule' : d, exact: true }).click();
  }
  if (multiplier) await page.getByRole('radio', { name: multiplier }).click();
  await page.getByRole('button', { name: 'Valider' }).click();
}

async function playClosest(page: Page, game: 'year' | 'estim') {
  const hint = page.getByRole('button', { name: 'Indice' });
  if (await hint.isVisible()) {
    await hint.click();
    await once(page, `${game}-0-indice`);
  }
  await once(page, `${game}-1-lecture`);
  await page.getByRole('button', { name: /C’est lu/ }).click();
  await once(page, `${game}-2-reflexion`);
  await page.getByRole('button', { name: /On est prêts/ }).click();
  await page.waitForTimeout(300);
  await once(page, `${game}-3-decompte`);
  await page.getByText(/a dit…/).waitFor({ timeout: 6000 });
  if (game === 'year') {
    await once(page, 'year-4-saisie');
    await typeYear(page, '1950');
    await page.getByRole('button', { name: 'Pas de réponse' }).click();
  } else {
    await typeEstim(page, '6,5', 'million');
    await once(page, 'estim-4-saisie-B');
    await typeEstim(page, '120');
  }
  await once(page, `${game}-5-pret`);
  await page.getByRole('button', { name: 'Révéler' }).click();
  await page.waitForTimeout(700);
  await once(page, `${game}-6-revelation`);
  await page
    .getByRole('button', { name: /Question suivante|Fin de la manche|Voir le résultat/ })
    .click();
}

async function playBac(page: Page, turn: number) {
  await once(page, 'bac-1-face-cachee');
  await page.getByRole('button', { name: 'Retourner la carte' }).first().click();
  await page.waitForTimeout(500);
  await once(page, 'bac-2-annonce');
  await page.getByRole('button', { name: /de commencer/ }).click();
  await page.waitForTimeout(800);
  await once(page, 'bac-3-chrono');
  // Un mot validé, puis on ouvre la liste des mots acceptés.
  await page.getByRole('button', { name: 'Validé' }).click();
  await page.getByRole('button', { name: /^Dictionnaire/ }).click();
  await once(page, 'bac-4-liste');
  if (turn % 2 === 0) await page.getByRole('button', { name: /Raté/ }).click();
  else {
    await page.getByText(/Temps écoulé/).waitFor({ timeout: 15000 });
    await once(page, 'bac-5-temps-ecoule');
    await page.getByRole('button', { name: /Raté/ }).click();
  }
  await once(page, 'bac-6-resolu');
  await page
    .getByRole('button', { name: /Carte suivante|Fin de la manche|Voir le résultat/ })
    .click();
}

async function adjustScores(page: Page) {
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Ajuster les scores' }).click();
  await page.getByRole('button', { name: 'Ajouter un point à Léa' }).click();
  await once(page, '07-ajuster-scores');
  await page.getByRole('button', { name: 'Terminé' }).click();
  await page.getByRole('button', { name: 'Menu' }).click();
  await page.getByRole('button', { name: 'Réglages' }).click();
  await once(page, '08-reglages');
  await page.getByRole('button', { name: 'Terminé' }).click();
}

test('accueil, configuration, partie Express avec les trois jeux', async ({ page }) => {
  test.setTimeout(180_000);
  await page.goto('/?seed=7');
  await page.evaluate(() => document.fonts.ready);
  await shot(page, '01-accueil');

  await page.getByRole('button', { name: 'Jouer' }).click();
  await page.getByLabel('Prénom du joueur 1').fill('Léa');
  await page.getByLabel('Prénom du joueur 2').fill('Tom');
  await page.getByRole('radio', { name: 'Express' }).click();
  await page.screenshot({ path: 'e2e/screenshots/02-configuration.png', fullPage: true });
  await page.getByRole('button', { name: 'Lancer' }).click();

  await expectNoScroll(page);
  await shot(page, '03-ouverture');
  await page.getByRole('button', { name: /C’est parti/ }).click();

  for (let round = 0; round < 3; round++) {
    const heading = await page.getByRole('heading', { level: 1 }).textContent();
    await shot(page, `04-intro-manche-${round + 1}`);
    await page.getByRole('button', { name: 'Première question' }).click();
    if (round === 0) await adjustScores(page);
    const game = heading?.includes('Bac')
      ? 'bac'
      : heading?.includes('Estimation')
        ? 'estim'
        : 'year';
    for (let q = 0; q < 3; q++) {
      if (game === 'bac') await playBac(page, q + round);
      else await playClosest(page, game);
    }
    await once(page, `05-fin-de-manche-${round + 1}`);
    await page.getByRole('button', { name: /Manche suivante|Résultat final/ }).click();
  }

  const end = page.getByText(/gagne\s!|Mort subite/).first();
  await end.waitFor();
  await shot(page, '06-fin-ou-mort-subite');
});

test('styleguide', async ({ page }) => {
  await page.goto('/styleguide');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'e2e/screenshots/00-styleguide.png', fullPage: true });
});

test('réglages : temps par mot en saisie libre', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText(/^v\d+\.\d+\.\d+ · /)).toBeVisible();
  await page.getByRole('button', { name: 'Réglages' }).click();
  const field = page.getByLabel('Temps par mot, en secondes');
  await field.tap();
  await page.keyboard.type('12');
  await expect(field).toHaveValue('12');
  await page.getByRole('button', { name: 'Une seconde de plus' }).click();
  await expect(field).toHaveValue('13');
  await page.getByRole('button', { name: 'Une seconde de moins' }).click();
  await page.getByRole('button', { name: 'Une seconde de moins' }).click();
  await expect(field).toHaveValue('11');
  await page.screenshot({ path: 'e2e/screenshots/08b-reglages-secondes.png' });
  await page.getByRole('button', { name: 'Terminé' }).click();
  await page.reload();
  await page.getByRole('button', { name: 'Réglages' }).click();
  await expect(page.getByLabel('Temps par mot, en secondes')).toHaveValue('11');
});
