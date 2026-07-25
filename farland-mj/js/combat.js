/* ============================================================
   MODULE DE COMBAT — écran de jeu dédié (plein écran)
   Architecture : moteur autonome initialisé par app.js via init(deps).
   deps = { $, esc, Dice, byId, bestiary, heroSheet, getHero, saveHero,
            pushLog, renderLog, tokenHtml, openFiche, onExit, navigate, d20mode }
   État persistant par scène : clé "combatV2:<scenario>:<scene>".
   ============================================================ */
window.CombatEngine = (function () {
  "use strict";
  let D = null;              // deps injectées
  let S = null;              // état du combat courant
  let ctx = null;            // { sc, scene, key }

  const FEATURES = {
    mark: { label: "🎯 Marque du chasseur", cost: "bonus", desc: "+1d6 dégâts sur la cible marquée" },
    cure: { label: "💚 Soin des blessures", cost: "action", desc: "1 sort · rend 1d8+3 PV" }
  };

  // ---------- état ----------
  function sig(scene) { return (scene.combat.ennemis || []).map((e) => e.ref + "x" + e.n).join(","); }
  function key(sc, scene) { return `combatV2:${sc.id}:${scene.id}`; }

  function build(scene) {
    const enemies = [];
    (scene.combat.ennemis || []).forEach((grp) => {
      const b = D.byId(D.bestiary, grp.ref); if (!b) return;
      for (let i = 0; i < grp.n; i++) {
        enemies.push({ ref: grp.ref, nom: grp.n > 1 ? `${b.nom} ${i + 1}` : b.nom,
          ac: parseInt(b.ac, 10) || 10, hpMax: parseInt(b.pv, 10) || 1, hp: parseInt(b.pv, 10) || 1,
          atk: b.atk || null, defeated: false });
      }
    });
    return { sig: sig(scene), round: 1, phase: "player", tab: "atk",
      enemies, target: enemies.length ? 0 : null,
      turn: { action: true, bonus: true, reaction: true },
      mark: null, markName: null, hidden: false, dodge: false, prone: null,
      initiative: null, log: [] };
  }

  function save() { if (ctx) localStorage.setItem(ctx.key, JSON.stringify(S)); }
  function stateFor(sc, scene) {
    try {
      const raw = localStorage.getItem(key(sc, scene));
      if (raw) { const s = JSON.parse(raw); if (s.sig === sig(scene)) return s; }
    } catch (e) {}
    return null;
  }
  function isWon(sc, scene) { const s = stateFor(sc, scene); return !!(s && s.enemies.length && s.enemies.every((e) => e.defeated)); }

  function log(msg, cls) {
    S.log.unshift({ t: msg, c: cls || "" });
    S.log = S.log.slice(0, 30);
  }

  // ---------- démarrage ----------
  function start(sc, scene, opts) {
    ctx = { sc, scene, key: key(sc, scene) };
    S = stateFor(sc, scene) || build(scene);
    if (!S.initiative) {
      const h = D.heroSheet();
      const hr = D.Dice.d20(h ? (h.init || 0) : 0, "normal");
      const er = D.Dice.d20(1, "normal");
      S.initiative = hr.total >= er.total ? "hero" : "enemies";
      log(`⚡ Initiative : toi ${hr.total} · eux ${er.total} — ${S.initiative === "hero" ? "TU commences !" : "ILS commencent !"}`, S.initiative === "hero" ? "ok" : "ko");
      if (S.initiative === "enemies" && !(opts && opts.noAmbush)) {
        S.phase = "enemies"; // verrouille l'interface joueur pendant l'embuscade (évite d'agir dans la fenêtre du délai)
        save(); render();
        setTimeout(() => { enemyPhase(true); }, 450);
        return;
      }
      save();
    }
    render();
  }

  function exit(result) {
    const el = document.getElementById("combat-screen");
    if (el) el.remove();
    document.body.classList.remove("combat-open");
    if (D.onExit) D.onExit(result, ctx ? ctx.scene : null);
  }

  // ---------- rendu ----------
  function hpbarHtml(hp, hpMax, extra) {
    const pct = Math.max(0, Math.min(100, Math.round(hp / hpMax * 100)));
    const lvl = hp === 0 ? "dead" : (pct <= 33 ? "low" : (pct <= 66 ? "mid" : "high"));
    return `<div class="hpbar ${extra || ""}"><div class="hpfill ${lvl}" style="width:${pct}%"></div><span class="hptxt">${hp} / ${hpMax} PV</span></div>`;
  }

  function render() {
    let el = document.getElementById("combat-screen");
    if (!el) {
      el = document.createElement("div");
      el.id = "combat-screen";
      document.body.appendChild(el);
      document.body.classList.add("combat-open");
    }
    const esc = D.esc, hero = D.heroSheet(), H = D.getHero();
    const allDead = S.enemies.length && S.enemies.every((e) => e.defeated);
    const lost = H && H.hp === 0;
    if (allDead && S.phase !== "won") { S.phase = "won"; log("🏆 Victoire ! Tous les ennemis sont vaincus.", "ok"); save(); }
    if (lost && S.phase !== "lost") { S.phase = "lost"; save(); }

    // --- ennemis ---
    const foes = S.enemies.map((e, i) => {
      const sel = S.target === i && !e.defeated;
      return `<div class="cb-foe ${e.defeated ? "ko" : ""} ${sel ? "sel" : ""}" data-tgt="${i}">
        ${D.tokenHtml(e.ref)}
        <div class="cb-foe-main">
          <div class="cb-foe-name">${e.defeated ? "💀 " : ""}${esc(e.nom)} <span class="enemy-ac">🛡️ ${e.ac}</span>
            ${S.mark === i ? `<span class="mark-badge">🎯</span>` : ""}${S.prone === i ? `<span class="mark-badge prone">⬇️ à terre</span>` : ""}</div>
          ${hpbarHtml(e.hp, e.hpMax, "sm")}
        </div>
        <button class="mini-fiche" data-fiche="${e.ref}">›</button>
      </div>`;
    }).join("");

    // --- héros ---
    const econ = (k, lbl) => `<span class="econ ${S.turn[k] ? "on" : "off"}">${S.turn[k] ? "●" : "○"} ${lbl}</span>`;
    const states = [
      S.hidden ? `<span class="cb-state">👤 cachée (avantage)</span>` : "",
      S.dodge ? `<span class="cb-state">🛡️ esquive</span>` : "",
      S.mark != null ? `<span class="cb-state">🎯 ${esc(S.markName || "")}</span>` : ""
    ].join("");
    const heroBox = H ? `
      <div class="cb-hero ${H.hp === 0 ? "down" : ""}">
        <span class="tok" style="border-color:#4a7a4a">🧝</span>
        <div class="cb-hero-main">
          <div class="cb-hero-name">${esc(hero ? hero.nom.split(" ")[0] : "Héros")}
            <span class="hud-stats">🛡️ ${hero ? hero.ca : "?"} · ✨ ${H.slots}/${H.slotsMax}</span></div>
          ${hpbarHtml(H.hp, H.hpMax, "sm")}
          <div class="cb-states">${states}</div>
        </div>
        <div class="cb-round">R${S.round}</div>
      </div>` : "";

    // --- panneau d'actions par onglet ---
    let pane = "";
    if (S.phase === "won") {
      pane = `<div class="cb-end won">
        <div class="cb-end-title">🏆 VICTOIRE !</div>
        <p>Les ennemis sont vaincus. Pense à ramasser le butin dans la scène.</p>
        <button class="btn-accent btn-block" id="cb-exit-won">Retour à l'aventure ▶</button></div>`;
    } else if (S.phase === "lost") {
      const potIdx = H ? H.inv.findIndex((it) => it.type === "potion" && it.qty > 0) : -1;
      pane = `<div class="cb-end lost">
        <div class="cb-end-title">💀 À TERRE…</div>
        <p>Le monde vacille, les bruits du combat s'étouffent… Fenn aboie, affolé.</p>
        ${potIdx >= 0
          ? `<button class="btn-accent btn-block" id="cb-emergency-potion">🧪 Boire une potion in extremis !</button>
             <button class="btn-ghost btn-block" id="cb-exit-lost">Non, laisser tomber ▶</button>`
          : `<p>Une mâchoire se referme sur ton col : Fenn te traîne à l'abri. Tu te réveilles, meurtrie mais vivante.</p>
             <button class="btn-accent btn-block" id="cb-exit-lost">Se relever à 1 PV ▶</button>`}
      </div>`;
    } else if (S.phase === "enemies") {
      pane = `<div class="cb-hint">⏳ Les ennemis agissent…</div>`;
    } else {
      pane = renderTab(hero, H);
    }

    const tabs = (S.phase === "player") ? `
      <div class="cb-tabs">
        ${[["atk", "⚔️", "Attaques"], ["cap", "✨", "Capacités"], ["obj", "🧪", "Objets"],
           ["env", "🌍", "Décor"], ["man", "🏃", "Manœuvres"]].map(([id, ic, lbl]) =>
          `<button class="cb-tab ${S.tab === id ? "on" : ""}" data-tab="${id}"><span>${ic}</span>${lbl}</button>`).join("")}
      </div>` : "";

    el.innerHTML = `
      <div class="cb-top">
        <button class="btn-ghost" id="cb-flee-x">✕</button>
        <div class="cb-title">⚔️ ${esc(ctx.scene.titre)}</div>
        <button class="btn-ghost" id="cb-reset">↺</button>
      </div>
      ${heroBox}
      <div class="cb-foes">${foes}</div>
      ${tabs}
      <div class="cb-pane">${pane}</div>
      ${S.phase === "player" ? `<button class="cb-endturn" id="cb-endturn">⏭️ Fin de mon tour — riposte ennemie</button>` : ""}
      <div class="cb-log">${S.log.map((l) => `<div class="cb-log-line ${l.c}">${l.t}</div>`).join("")}</div>`;

    bind(el);
  }

  function renderTab(hero, H) {
    const esc = D.esc;
    const tgt = S.target != null ? S.enemies[S.target] : null;
    const tgtOk = tgt && !tgt.defeated;
    if (S.tab === "atk") {
      const atks = (hero && hero.attaques || []).map((a, i) =>
        `<button class="atk-btn ${S.turn.action ? "" : "disabled"}" data-atk="${i}">
          <span>${esc(a.nom)}${S.hidden ? " 👤" : ""}</span><span class="act-meta">+${a.bonus} · ${esc(a.degR || a.degats)}</span></button>`).join("");
      return `<div class="cb-hint">Cible : <b>${tgtOk ? esc(tgt.nom) : "—"}</b> · touche un ennemi pour changer${S.hidden ? " · 👤 avantage (cachée)" : ""}</div>${atks}`;
    }
    if (S.tab === "cap") {
      const feats = (hero && hero.combatFeatures || []).map((fk) => {
        const f = FEATURES[fk]; if (!f) return "";
        const active = fk === "mark" && S.mark != null;
        const ok = active || (f.cost === "bonus" ? S.turn.bonus : (S.turn.action && (fk !== "cure" || (H && H.slots > 0))));
        return `<button class="feat-btn ${active ? "active" : ""} ${ok ? "" : "disabled"}" data-feat="${fk}">
          <span>${f.label}${active ? " ✓" : ""}</span><span class="act-meta">${f.cost === "bonus" ? "bonus" : "action"} · ${esc(f.desc)}${fk === "cure" && H ? ` (${H.slots})` : ""}</span></button>`;
      }).join("");
      return feats || `<div class="cb-hint">Aucune capacité.</div>`;
    }
    if (S.tab === "obj") {
      const pots = (H && H.inv || []).map((it, idx) => (it.type === "potion" && it.qty > 0)
        ? `<button class="feat-btn potion ${S.turn.action ? "" : "disabled"}" data-pot="${idx}">
            <span>🧪 ${esc(it.nom)}</span><span class="act-meta">action · ×${it.qty}</span></button>` : "").join("");
      return pots || `<div class="cb-hint">Aucun objet utilisable. (Les potions se boivent ici.)</div>`;
    }
    if (S.tab === "env") {
      const envs = (ctx.scene.combat.env || []).map((a, i) =>
        `<button class="action-btn ${S.turn.action ? "" : "disabled"}" data-env="${i}">
          <span class="act-txt">${esc(a.txt)}</span><span class="act-meta">DC ${a.dc} · ${esc(a.carac || "")}</span></button>`).join("");
      return envs || `<div class="cb-hint">Rien d'exploitable dans le décor ici.</div>`;
    }
    if (S.tab === "man") {
      const dis = (ok) => ok ? "" : "disabled";
      return `
        <button class="action-btn ${dis(S.turn.action)}" data-man="dodge"><span class="act-txt">🛡️ Esquive totale</span><span class="act-meta">action · leurs attaques à désavantage</span></button>
        <button class="action-btn ${dis(S.turn.action)}" data-man="hide"><span class="act-txt">👤 Se cacher</span><span class="act-meta">action · Discrétion DC 12 → avantage</span></button>
        <button class="action-btn ${dis(S.turn.action)}" data-man="shove"><span class="act-txt">🤜 Bousculer la cible</span><span class="act-meta">action · Athlétisme opposé → à terre</span></button>
        <button class="action-btn" data-man="flee"><span class="act-txt">🏃 Fuir le combat</span><span class="act-meta">Athlétisme DC 12 → retour à la scène</span></button>`;
    }
    return "";
  }

  // ---------- interactions ----------
  function bind(el) {
    el.querySelectorAll("[data-tab]").forEach((b) => b.addEventListener("click", () => { S.tab = b.dataset.tab; save(); render(); }));
    el.querySelectorAll("[data-tgt]").forEach((f) => f.addEventListener("click", (ev) => {
      if (ev.target.closest("[data-fiche]")) return;
      const i = +f.dataset.tgt;
      if (!S.enemies[i].defeated) { S.target = i; save(); render(); }
    }));
    el.querySelectorAll("[data-fiche]").forEach((b) => b.addEventListener("click", () => { const id = b.dataset.fiche; exit("paused"); D.openFiche(id); }));
    el.querySelectorAll("[data-atk]").forEach((b) => b.addEventListener("click", () => heroAttack(+b.dataset.atk)));
    el.querySelectorAll("[data-feat]").forEach((b) => b.addEventListener("click", () => useFeature(b.dataset.feat)));
    el.querySelectorAll("[data-pot]").forEach((b) => b.addEventListener("click", () => drinkPotion(+b.dataset.pot)));
    el.querySelectorAll("[data-env]").forEach((b) => b.addEventListener("click", () => envAction(+b.dataset.env)));
    el.querySelectorAll("[data-man]").forEach((b) => b.addEventListener("click", () => maneuver(b.dataset.man)));
    const et = el.querySelector("#cb-endturn"); if (et) et.addEventListener("click", () => enemyPhase(false));
    const fx = el.querySelector("#cb-flee-x"); if (fx) fx.addEventListener("click", () => exit("paused"));
    const rs = el.querySelector("#cb-reset"); if (rs) rs.addEventListener("click", () => { S = build(ctx.scene); save(); render(); });
    const w = el.querySelector("#cb-exit-won"); if (w) w.addEventListener("click", () => exit("won"));
    const l = el.querySelector("#cb-exit-lost"); if (l) l.addEventListener("click", () => {
      const H = D.getHero(); H.hp = 1; D.saveHero();
      S = build(ctx.scene); save(); exit("lost");
    });
    const ep = el.querySelector("#cb-emergency-potion"); if (ep) ep.addEventListener("click", emergencyPotion);
  }

  // Dernière chance à 0 PV : si une potion est disponible, la boire relance le combat au lieu de le perdre.
  function emergencyPotion() {
    const H = D.getHero(); if (!H) return;
    const idx = H.inv.findIndex((it) => it.type === "potion" && it.qty > 0);
    if (idx < 0) return;
    const it = H.inv[idx];
    const r = D.Dice.rollExpr(it.heal || "2d4+2");
    H.hp = Math.max(1, Math.min(H.hpMax, r.total));
    it.qty--; if (it.qty <= 0) H.inv.splice(idx, 1);
    D.saveHero();
    S.phase = "player";
    log(`🧪 IN EXTREMIS : ${it.nom} te ramène à ${H.hp} PV — le combat continue !`, "ok");
    D.pushLog(it.nom, r.total, "urgence");
    save(); render(); D.renderLog();
  }

  function needTarget() {
    const t = S.target, e = t != null ? S.enemies[t] : null;
    if (!e || e.defeated) { log("🎯 Choisis d'abord une cible vivante.", ""); render(); return null; }
    return e;
  }

  function heroAttack(ai) {
    if (!S.turn.action) { log("⚠ Action déjà utilisée — termine ton tour.", ""); render(); return; }
    const hero = D.heroSheet(); const a = hero && hero.attaques && hero.attaques[ai];
    if (!a) return;
    const e = needTarget(); if (!e) return;
    const t = S.target;
    const proneBonus = S.prone === t;
    const mode = (S.hidden || proneBonus) ? "adv" : D.d20mode();
    const r = D.Dice.d20(a.bonus, mode);
    const hitOk = r.crit || (!r.fail && r.total >= e.ac);
    S.hidden = false;
    if (proneBonus) S.prone = null; // avantage consommé sur cette attaque
    if (hitOk) {
      const p = D.Dice.parse(a.degR || a.degats) || { n: 1, sides: 6, mod: 0 };
      const base = D.Dice.roll(r.crit ? p.n * 2 : p.n, p.sides);
      let dmg = base.sum + p.mod, extra = "";
      if (S.mark === t) { const md = D.Dice.roll(r.crit ? 2 : 1, 6); dmg += md.sum; extra = " (+marque)"; }
      e.hp = Math.max(0, e.hp - dmg); e.defeated = e.hp === 0;
      const advTag = mode === "adv" ? " (avantage)" : "";
      log(`⚔️ ${a.nom} → ${e.nom} : ${r.total}${r.crit ? " ⭐CRIT" : ""}${advTag} vs CA ${e.ac} — TOUCHÉ, ${dmg} dégâts${extra}${e.defeated ? " · VAINCU 💀" : ""}`, "ok");
      D.pushLog(`${a.nom} → ${e.nom}`, r.total, `${dmg} dég.`);
      if (e.defeated) {
        if (S.mark === t) { S.mark = null; S.markName = null; }
        if (S.prone === t) S.prone = null;
        if (S.target === t) { const n = S.enemies.findIndex((x) => !x.defeated); S.target = n >= 0 ? n : null; }
      }
    } else {
      log(`⚔️ ${a.nom} → ${e.nom} : ${r.total}${r.fail ? " 💀" : ""} vs CA ${e.ac} — raté.`, "ko");
      D.pushLog(`${a.nom} → ${e.nom}`, r.total, "raté");
    }
    S.turn.action = false;
    save(); render(); D.renderLog();
  }

  function useFeature(fk) {
    const H = D.getHero();
    if (fk === "mark") {
      if (S.mark != null) { S.mark = null; S.markName = null; save(); render(); return; }
      if (!S.turn.bonus) { log("⚠ Action bonus déjà utilisée.", ""); render(); return; }
      const e = needTarget(); if (!e) return;
      S.mark = S.target; S.markName = e.nom; S.turn.bonus = false;
      log(`🎯 Marque du chasseur sur ${e.nom} : +1d6 sur tes attaques.`, "ok");
    }
    if (fk === "cure") {
      if (!S.turn.action) { log("⚠ Action déjà utilisée.", ""); render(); return; }
      if (!H || H.slots <= 0) { log("⚠ Plus d'emplacements de sort.", ""); render(); return; }
      const r = D.Dice.rollExpr("1d8+3");
      H.hp = Math.min(H.hpMax, H.hp + r.total); H.slots--; D.saveHero();
      S.turn.action = false;
      log(`💚 Soin des blessures : +${r.total} PV (${H.hp}/${H.hpMax}).`, "ok");
      D.pushLog("Soin des blessures", r.total, "soin");
    }
    save(); render(); D.renderLog();
  }

  function drinkPotion(idx) {
    if (!S.turn.action) { log("⚠ Boire une potion coûte l'action du tour.", ""); render(); return; }
    const H = D.getHero(); const it = H.inv[idx];
    if (!it || it.type !== "potion" || it.qty <= 0) return;
    const r = D.Dice.rollExpr(it.heal || "2d4+2");
    H.hp = Math.min(H.hpMax, H.hp + r.total); it.qty--;
    if (it.qty <= 0) H.inv.splice(idx, 1);
    D.saveHero(); S.turn.action = false;
    log(`🧪 ${it.nom} : +${r.total} PV (${H.hp}/${H.hpMax}).`, "ok");
    D.pushLog(it.nom, r.total, "potion");
    save(); render(); D.renderLog();
  }

  function envAction(i) {
    if (!S.turn.action) { log("⚠ Action déjà utilisée.", ""); render(); return; }
    const a = (ctx.scene.combat.env || [])[i]; if (!a) return;
    const r = D.Dice.d20(a.mod || 0, D.d20mode());
    const ok = r.total >= a.dc;
    S.turn.action = false;
    if (ok) {
      let extra = "";
      const e = S.target != null ? S.enemies[S.target] : null;
      if (a.dmg && e && !e.defeated) {
        const dr = D.Dice.rollExpr(a.dmg);
        e.hp = Math.max(0, e.hp - dr.total); e.defeated = e.hp === 0;
        extra = ` ${dr.total} dégâts à ${e.nom}${e.defeated ? " — VAINCU 💀" : ""}.`;
      }
      if (a.koTarget && e && !e.defeated) { e.hp = 0; e.defeated = true; extra = ` ${e.nom} est hors de combat !`; }
      log(`🌍 ${a.txt} : ${r.total} vs DC ${a.dc} — RÉUSSI ! ${a.reussite || ""}${extra}`, "ok");
      D.pushLog(a.txt, r.total, "réussite");
      if (a.cible) { save(); D.renderLog(); exit("jump:" + a.cible); return; }
    } else {
      log(`🌍 ${a.txt} : ${r.total} vs DC ${a.dc} — échec. ${a.echec || ""}`, "ko");
      D.pushLog(a.txt, r.total, "échec");
    }
    save(); render(); D.renderLog();
  }

  function maneuver(m) {
    const hero = D.heroSheet();
    if (m === "dodge") {
      if (!S.turn.action) { log("⚠ Action déjà utilisée.", ""); render(); return; }
      S.dodge = true; S.turn.action = false;
      log("🛡️ Esquive totale : leurs attaques seront à DÉSAVANTAGE ce round.", "ok");
    }
    if (m === "hide") {
      if (!S.turn.action) { log("⚠ Action déjà utilisée.", ""); render(); return; }
      const r = D.Dice.d20(5, D.d20mode());
      S.turn.action = false;
      if (r.total >= 12) { S.hidden = true; log(`👤 Discrétion ${r.total} — cachée ! Prochaine attaque avec AVANTAGE.`, "ok"); }
      else log(`👤 Discrétion ${r.total} — repérée, pas d'avantage.`, "ko");
    }
    if (m === "shove") {
      if (!S.turn.action) { log("⚠ Action déjà utilisée.", ""); render(); return; }
      const e = needTarget(); if (!e) return;
      const mine = D.Dice.d20(1, D.d20mode()); const theirs = D.Dice.d20(1, "normal");
      S.turn.action = false;
      if (mine.total >= theirs.total) {
        S.prone = S.target;
        log(`🤜 Bousculade ${mine.total} vs ${theirs.total} : ${e.nom} est À TERRE — ta prochaine attaque contre lui aura l'AVANTAGE !`, "ok");
      } else {
        log(`🤜 Bousculade ${mine.total} vs ${theirs.total} : ${e.nom} tient bon.`, "ko");
      }
    }
    if (m === "flee") {
      const r = D.Dice.d20(1, D.d20mode());
      if (r.total >= 12) { log(`🏃 Fuite ${r.total} — tu te dégages !`, "ok"); save(); exit("fled"); return; }
      log(`🏃 Fuite ${r.total} — bloquée ! Le combat continue.`, "ko");
      S.turn.action = false;
    }
    save(); render();
  }

  // ---------- tour ennemi automatique ----------
  function enemyPhase(ambush) {
    const H = D.getHero(); const hero = D.heroSheet();
    S.phase = "enemies";
    const hAC = hero ? hero.ca : 12;
    let delayLines = [];
    S.enemies.forEach((e) => {
      if (e.defeated || !e.atk || !H || H.hp === 0) return;
      const mode = S.dodge ? "dis" : "normal";
      const r = D.Dice.d20(e.atk.hit, mode);
      const hit = r.crit || (!r.fail && r.total >= hAC);
      if (hit) {
        const p = D.Dice.parse(e.atk.deg) || { n: 1, sides: 6, mod: 0 };
        const dr = D.Dice.roll(r.crit ? p.n * 2 : p.n, p.sides);
        const dmg = dr.sum + p.mod;
        H.hp = Math.max(0, H.hp - dmg);
        delayLines.push([`👹 ${e.nom} : ${r.total}${r.crit ? " ⭐CRIT" : ""} vs CA ${hAC} — TOUCHE, ${dmg} dégâts ! (${H.hp}/${H.hpMax} PV)`, "ko"]);
      } else {
        delayLines.push([`👹 ${e.nom} : ${r.total} vs CA ${hAC} — te rate${S.dodge ? " (esquive !)" : ""}.`, "ok"]);
      }
    });
    D.saveHero();
    delayLines.forEach(([m, c]) => log(m, c));
    // nouveau round
    S.round += ambush ? 0 : 1;
    S.phase = "player";
    S.turn = { action: true, bonus: true, reaction: true };
    S.dodge = false;
    if (S.hidden) { S.hidden = false; log("👤 La discrétion s'estompe avec le round.", ""); } // évite qu'elle reste active indéfiniment si non consommée
    log(`— Round ${S.round} : à toi ! —`, "");
    save(); render();
  }

  return { init(deps) { D = deps; }, start, isWon,
    hasState(sc, scene) { return !!stateFor(sc, scene); } };
})();
