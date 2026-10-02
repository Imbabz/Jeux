import { expect, test, type Page } from '@playwright/test';

/**
 * Parties complètes jouées par un « joueur aléatoire » (relecture de fluidité, étape 4) :
 * à chaque pas, on cherche l'action disponible à l'écran, on joue au hasard (graine fixe),
 * et on sème des perturbations réalistes : Annuler, Pause, fermeture de l'app puis reprise.
 * Le test échoue sur une erreur JavaScript, un défilement en partie, ou un écran bloqué.
 */

function rng(seed: number) {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Report {
  steps: number;
  undos: number;
  pauses: number;
  reloads: number;
  bacCards: number;
  questions: number;
  stalls: string[];
}

async function visible(page: Page, name: string | RegExp) {
  const button = page.getByRole('button', { name, exact: typeof name === 'string' }).first();
  return (await button.isVisible().catch(() => false)) && (await button.isEnabled())
    ? button
    : null;
}

async function noScroll(page: Page, where: string) {
  const overflow = await page.evaluate(() => ({
    y: document.documentElement.scrollHeight - window.innerHeight,
    x: document.documentElement.scrollWidth - window.innerWidth,
  }));
  expect(overflow.x, `défilement horizontal : ${where}`).toBeLessThanOrEqual(0);
  expect(overflow.y, `défilement vertical : ${where}`).toBeLessThanOrEqual(0);
}

async function playMatch(page: Page, seed: number, format: 'Express' | 'Classique') {
  const random = rng(seed);
  const report: Report = {
    steps: 0,
    undos: 0,
    pauses: 0,
    reloads: 0,
    bacCards: 0,
    questions: 0,
    stalls: [],
  };
  await page.goto(`/?seed=${seed}`);
  await page.getByRole('button', { name: /Jouer|Nouvelle partie/ }).click();
  await page.getByLabel('Prénom du joueur 1').fill('Léa');
  await page.getByLabel('Prénom du joueur 2').fill('Tom');
  await page.getByRole('radio', { name: format }).click();
  await page.getByRole('button', { name: 'Lancer' }).click();

  let idle = 0;
  for (let step = 0; step < 900; step++) {
    report.steps = step;
    // Perturbations, uniquement pendant une manche (barre d'actions visible).
    const inMatch = await page.getByRole('navigation', { name: 'Actions de partie' }).isVisible();
    if (inMatch) {
      await noScroll(page, `pas ${step}`);
      const roll = random();
      const undo = await visible(page, 'Annuler');
      if (roll < 0.05 && undo) {
        await undo.click();
        report.undos++;
        continue;
      }
      if (roll < 0.08) {
        await page.getByRole('button', { name: 'Pause' }).click();
        await page.getByRole('button', { name: 'Reprendre' }).click();
        report.pauses++;
        continue;
      }
      if (roll < 0.1) {
        await page.reload();
        await page.getByRole('button', { name: /Reprendre la partie/ }).click();
        report.reloads++;
        continue;
      }
    }

    const done = await visible(page, 'Revanche');
    if (done) return report;

    const simple = [
      'C’est parti !',
      'Première question',
      'Question décisive',
      'Retourner la carte',
      'C’est lu ▶',
      'Révéler',
    ];
    let acted = false;
    for (const name of simple) {
      const b = await visible(page, name);
      if (b) {
        await b.click();
        if (name === 'Retourner la carte') report.bacCards++;
        if (name === 'C’est lu ▶') report.questions++;
        acted = true;
        break;
      }
    }
    if (acted) {
      idle = 0;
      continue;
    }

    const regexes: RegExp[] = [
      /de (commencer|reprendre)$/,
      /^On est prêts/,
      /^(Question suivante|Fin de la manche|Voir le résultat|Carte suivante)$/,
      /^(Manche suivante|Résultat final)$/,
    ];
    for (const re of regexes) {
      const b = await visible(page, re);
      if (b) {
        await b.click();
        acted = true;
        break;
      }
    }
    if (acted) {
      idle = 0;
      continue;
    }

    // Échange du Bac : mot validé ou raté ; parfois on laisse filer le chrono.
    const valid = await visible(page, 'Validé');
    if (valid) {
      const roll = random();
      if (roll < 0.55) await valid.click();
      else if (roll < 0.9) await page.getByRole('button', { name: /Raté/ }).click();
      else await page.waitForTimeout(400);
      idle = 0;
      continue;
    }

    // Saisie d'une réponse (Année ou Estimation).
    if (await page.getByText(/a dit…/).isVisible()) {
      if (random() < 0.1) {
        await page.getByRole('button', { name: 'Pas de réponse' }).click();
      } else if (await page.getByRole('button', { name: 'Virgule' }).isVisible()) {
        const digits = String(1 + Math.floor(random() * 9999));
        for (const d of digits) await page.getByRole('button', { name: d, exact: true }).click();
        await page.getByRole('button', { name: 'Valider' }).click();
      } else {
        const year = String(1000 + Math.floor(random() * 1025));
        for (const d of year) await page.getByRole('button', { name: d, exact: true }).click();
        await page.getByRole('button', { name: 'Valider' }).click();
      }
      idle = 0;
      continue;
    }

    // Rien à faire : un chrono tourne (décompte, fin d'un mot…).
    idle++;
    if (idle > 40) {
      await page.screenshot({ path: `e2e/screenshots/bloque-${seed}.png` });
      report.stalls.push(`pas ${step}`);
      throw new Error(`Écran bloqué (graine ${seed}, pas ${step})`);
    }
    await page.waitForTimeout(300);
  }
  throw new Error(`Partie trop longue (graine ${seed})`);
}

for (const [seed, format] of [
  [11, 'Express'],
  [23, 'Express'],
  [37, 'Express'],
  [41, 'Express'],
  [53, 'Classique'],
] as const) {
  test(`partie aléatoire ${format} (graine ${seed})`, async ({ page }) => {
    test.setTimeout(420_000);
    const errors: string[] = [];
    page.on('pageerror', (e) => errors.push(e.message));
    page.on('console', (m) => {
      if (m.type() === 'error') errors.push(m.text());
    });
    // Chronos courts pour jouer vite : pas de temps de réflexion, 2 s par mot au Bac.
    await page.addInitScript(() => {
      const key = 'copilote:settings';
      if (localStorage.getItem(key)) return;
      localStorage.setItem(
        key,
        JSON.stringify({
          schemaVersion: 1,
          thinkSeconds: 0,
          bacWordSeconds: 2,
          sound: true,
          haptics: true,
          avoidSeen: true,
          exactBonus: true,
          doubleFinalRound: true,
          lastSetup: null,
        }),
      );
    });
    const report = await playMatch(page, seed, format);
    console.log(`graine ${seed} (${format}) :`, JSON.stringify(report));
    expect(errors).toEqual([]);
    await expect(page.getByText(/gagne/).first()).toBeVisible();
  });
}
