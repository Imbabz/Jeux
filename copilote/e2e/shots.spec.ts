import { expect, test, type Page } from '@playwright/test';

/**
 * Captures 375 × 667 de chaque écran (relecture design avant chaque point d'arrêt)
 * et vérification « aucun scroll pendant une manche ».
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

async function typeYear(page: Page, year: string) {
  // Le pavé est pré-rempli avec l'indice de siècle : on efface puis on tape.
  for (let i = 0; i < 4; i++) await page.getByRole('button', { name: 'Effacer' }).click();
  for (const d of year) await page.getByRole('button', { name: d, exact: true }).click();
  await page.getByRole('button', { name: 'Valider' }).click();
}

async function playQuestion(page: Page, a: string | null, b: string | null, capture = false) {
  if (capture) await shot(page, '04-lecture');
  await page.getByRole('button', { name: /C’est lu/ }).click();
  if (capture) await shot(page, '05-reflexion');
  await page.getByRole('button', { name: /On est prêts/ }).click();
  if (capture) {
    await page.waitForTimeout(300);
    await shot(page, '06-decompte');
  }
  await page.getByText(/a dit…/).waitFor({ timeout: 6000 });
  if (capture) {
    await expectNoScroll(page);
    await shot(page, '07-saisie-A');
  }
  if (a) await typeYear(page, a);
  else await page.getByRole('button', { name: 'Pas de réponse' }).click();
  if (b) await typeYear(page, b);
  else await page.getByRole('button', { name: 'Pas de réponse' }).click();
  if (capture) await shot(page, '08-pret');
  await page.getByRole('button', { name: 'Révéler' }).click();
  await page.waitForTimeout(700);
  if (capture) {
    await expectNoScroll(page);
    await shot(page, '09-revelation');
  }
  await page
    .getByRole('button', { name: /Question suivante|Fin de la manche|Voir le résultat/ })
    .click();
}

test('accueil, configuration, partie Express complète', async ({ page }) => {
  test.setTimeout(120_000);
  await page.goto('/?seed=42');
  await page.evaluate(() => document.fonts.ready);
  await shot(page, '01-accueil');

  await page.getByRole('button', { name: 'Jouer' }).click();
  await page.getByLabel('Prénom du joueur 1').fill('Léa');
  await page.getByLabel('Prénom du joueur 2').fill('Tom');
  await page.getByRole('radio', { name: 'Express' }).click();
  await shot(page, '02-configuration');
  await page.getByRole('button', { name: 'Lancer' }).click();

  await expectNoScroll(page);
  await shot(page, '03-ouverture');
  await page.getByRole('button', { name: /C’est parti/ }).click();
  await shot(page, '03b-intro-manche');

  for (let round = 0; round < 3; round++) {
    await page.getByRole('button', { name: 'Première question' }).click();
    for (let q = 0; q < 3; q++) {
      await playQuestion(
        page,
        round === 0 ? '1950' : null,
        round === 0 ? null : '1950',
        round === 0 && q === 1,
      );
    }
    if (round === 0) {
      await expectNoScroll(page);
      await shot(page, '10-fin-de-manche');
    }
    if (round === 2) await shot(page, '10b-fin-derniere-manche');
    await page.getByRole('button', { name: /Manche suivante|Résultat final/ }).click();
    if (round === 1) await shot(page, '03c-intro-derniere-manche');
  }

  // Score : A marque la manche 1, B les manches 2 et 3 (doublée) → partie terminée.
  await page.getByText(/gagne\s!/).waitFor();
  await shot(page, '11-fin-de-partie');
});

test('styleguide', async ({ page }) => {
  await page.goto('/styleguide');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'e2e/screenshots/00-styleguide.png', fullPage: true });
});
