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
  await once(page, 'bac-2-decompte');
  await page
    .getByRole('button', { name: 'Ensemble !' })
    .and(page.locator(':enabled'))
    .waitFor({ timeout: 6000 });
  await page.waitForTimeout(1200);
  await once(page, 'bac-3-chrono');
  await page.getByRole('button', { name: turn % 2 === 0 ? 'Léa' : 'Tom', exact: true }).click();
  await once(page, 'bac-4-resolu');
  await page
    .getByRole('button', { name: /Tour suivant|Fin de la manche|Voir le résultat/ })
    .click();
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
