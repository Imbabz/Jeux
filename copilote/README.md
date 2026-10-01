# Copilote

Quiz oral pour 2 joueurs en voiture. Un seul téléphone, tenu par le copilote, qui lit les cartes à voix haute, arbitre et joue. L'app tire les cartes, chronomètre, bipe et compte les points. Trois jeux : **Bac Éclair**, **Quelle année ?**, **Estimation**.

- Règles et moteur : [`GAME_DESIGN.md`](./GAME_DESIGN.md)
- Design system et écrans : [`DESIGN.md`](./DESIGN.md)
- Charte du contenu : [`CONTENT_GUIDE.md`](./CONTENT_GUIDE.md)

## Développement

Il faut Node 22 (voir `.nvmrc`).

```bash
cd copilote
npm ci
npm run dev            # http://localhost:5173
npm test               # Vitest
npm run test:coverage  # couverture (100 % exigé sur src/engine)
npm run lint && npm run typecheck
npm run build          # build de production + service worker PWA
npm run e2e:shots      # partie Express jouée de bout en bout + captures 375×667 dans e2e/screenshots/
```

Dans une session cloud Claude Code, Chromium est préinstallé. On lance les captures avec :
`PW_CHROMIUM_PATH=/opt/pw-browsers/chromium-1194/chrome-linux/chrome npm run e2e:shots`.

## Architecture

```
src/
├── engine/    logique PURE (aucun React, DOM, Date ni stockage), testée à 100 %
│              état = reduce(config, seed, events[])
├── content/   JSON par jeu, packs, répliques de l'animateur, schémas zod, ContentSource
├── services/  sound (bips WebAudio), haptics, wakeLock, storage, logger : effets de bord
├── app/       session : relie le moteur, le contenu et les services (tirages, persistance, vus)
└── ui/        écrans et composants ; aucune règle de jeu, l'UI affiche l'état et envoie des événements
```

ESLint fait respecter ces frontières : `src/engine` ne peut importer ni React ni les services, et n'a pas accès à `window`, `document` ou `Date`.

## Déploiement

Le déploiement passe par **Vercel**. Le projet `copilote` (équipe Imbabz) est relié à `Imbabz/Jeux` avec le Root Directory `copilote`.
- Un push sur `main` met à jour la production.
- Chaque PR reçoit une URL de prévisualisation, à ouvrir sur téléphone.
- Un commit qui ne touche pas `copilote/` ne déclenche pas de build (`ignoreCommand` dans `vercel.json`).

GitHub Pages continue de servir le dépôt pour les autres jeux. `/Jeux/copilote/` y affiche des sources non buildées : on utilise l'URL Vercel.

**Installer sur iPhone** : ouvrir l'URL de production dans Safari → Partager → « Sur l'écran d'accueil ». L'app s'ouvre alors en plein écran, avec son icône, et fonctionne hors-ligne. Les icônes PNG (iOS ignore le SVG) se régénèrent avec `node scripts/build_icons.mjs` après modification de `public/icon*.svg`.

Astuce de test : `?seed=42` dans l'URL rend une partie reproductible.
