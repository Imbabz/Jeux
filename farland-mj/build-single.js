/* Génère farland-mj.html : une version TOUT-EN-UN (CSS + JS + données inlinés)
   Pratique sur mobile : un seul fichier à héberger, téléverser ou ouvrir.
   (Le mode « installation PWA hors-ligne » complet nécessite la version
   multi-fichiers avec sw.js ; ce fichier unique, lui, fonctionne déjà sans
   réseau une fois ouvert car tout y est embarqué.)

   Usage :  node build-single.js
*/
const fs = require("fs");
const p = require("path");
const dir = __dirname;
const read = (f) => fs.readFileSync(p.join(dir, f), "utf8");

const css = read("css/style.css");
const js = [
  "js/data/lore.js",
  "js/data/bestiary.js",
  "js/data/scenarios.js",
  "js/data/characters.js",
  "js/dice.js",
  "js/app.js",
].map(read).join("\n\n");

const icon = read("icons/icon.svg");
const iconData = "data:image/svg+xml;base64," + Buffer.from(icon).toString("base64");

const html = `<!DOCTYPE html>
<html lang="fr">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover, maximum-scale=1" />
<meta name="theme-color" content="#14110f" />
<meta name="apple-mobile-web-app-capable" content="yes" />
<meta name="mobile-web-app-capable" content="yes" />
<title>Farland MJ — Compagnon de jeu de rôle</title>
<link rel="icon" href="${iconData}" />
<link rel="apple-touch-icon" href="${iconData}" />
<style>
/* reset minimal */
*{margin:0;padding:0;box-sizing:border-box}
${css}
</style>
</head>
<body>
<header class="topbar">
  <span class="logo">🐉</span>
  <h1>Farland <span class="muted" style="font-weight:400;font-size:14px">— MJ</span></h1>
  <span class="sub" id="topbar-sub">Compagnon de table</span>
</header>
<main>
  <section id="view-jeu" class="view active"></section>
  <section id="view-des" class="view"></section>
  <section id="view-perso" class="view"></section>
  <section id="view-bestiaire" class="view"></section>
  <section id="view-univers" class="view"></section>
</main>
<div class="floating-hint" id="hint"></div>
<nav class="tabbar">
  <button data-tab="jeu" class="active"><span class="ic">📖</span>Aventure</button>
  <button data-tab="des"><span class="ic">🎲</span>Dés</button>
  <button data-tab="perso"><span class="ic">🛡️</span>Persos</button>
  <button data-tab="bestiaire"><span class="ic">👹</span>Bestiaire</button>
  <button data-tab="univers"><span class="ic">🌍</span>Univers</button>
</nav>
<script>
${js}
</script>
</body>
</html>
`;

fs.writeFileSync(p.join(dir, "farland-mj.html"), html);
console.log("OK — farland-mj.html généré (" + Math.round(html.length / 1024) + " Ko)");
