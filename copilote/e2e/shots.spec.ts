import { test } from '@playwright/test';

// Captures 375 × 667 des écrans, relues avant chaque point d'arrêt.
test('accueil', async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: 'e2e/screenshots/accueil.png' });
});
