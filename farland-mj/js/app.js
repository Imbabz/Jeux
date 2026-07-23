/* ===== Farland MJ — application ===== */
(function () {
  "use strict";

  // ---------- utilitaires ----------
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const esc = (s) => String(s == null ? "" : s)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  function abilMod(score) { return Math.floor((score - 10) / 2); }
  function signed(n) { return (n >= 0 ? "+" : "") + n; }
  const LS = {
    get(k, d) { try { return JSON.parse(localStorage.getItem(k)) ?? d; } catch { return d; } },
    set(k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch {} }
  };
  function hint(msg) {
    const h = $("#hint"); h.textContent = msg; h.classList.add("show");
    clearTimeout(h._t); h._t = setTimeout(() => h.classList.remove("show"), 1600);
  }
  const byId = (arr, id) => arr.find((x) => x.id === id);

  // ---------- navigation onglets ----------
  const TABS = ["jeu", "des", "perso", "bestiaire", "univers"];
  function showTab(tab) {
    TABS.forEach((t) => {
      $("#view-" + t).classList.toggle("active", t === tab);
      const b = $(`nav.tabbar button[data-tab="${t}"]`);
      if (b) b.classList.toggle("active", t === tab);
    });
    LS.set("lastTab", tab);
    window.scrollTo(0, 0);
  }
  $$("nav.tabbar button").forEach((b) =>
    b.addEventListener("click", () => showTab(b.dataset.tab)));

  // =====================================================================
  //  VUE AVENTURE (scénarios + lecteur de scènes)
  // =====================================================================
  const gameState = LS.get("gameState", { scenarioId: null, sceneId: null });

  function renderScenarioList() {
    const html = `
      <div class="card">
        <h2 style="margin-top:0;color:var(--accent)">Choisir une aventure</h2>
        <p class="muted small">Lecteur pour le Maître du Jeu : chaque scène affiche le <b style="color:#a9cbe4">texte à lire à voix haute</b> puis vos <b style="color:var(--accent-2)">notes secrètes</b>, et propose les suites possibles.</p>
      </div>
      ${SCENARIOS.map((s) => `
        <button class="pick" data-scenario="${s.id}">
          <h3>${esc(s.titre)}</h3>
          <div class="meta">${esc(s.sousTitre)} · ${esc(s.niveau)}</div>
          <p>${esc(s.resume)}</p>
        </button>`).join("")}
      <div class="card small muted center">
        Contenu adapté des scénarios officiels du <b>Monde de Farland</b> (farlandworld.com).
      </div>`;
    $("#view-jeu").innerHTML = html;
    $$("#view-jeu [data-scenario]").forEach((b) =>
      b.addEventListener("click", () => openScenario(b.dataset.scenario)));
  }

  function openScenario(sid, sceneId) {
    const sc = byId(SCENARIOS, sid);
    if (!sc) return renderScenarioList();
    gameState.scenarioId = sid;
    gameState.sceneId = sceneId || sc.debut;
    LS.set("gameState", gameState);
    renderScene();
  }

  function renderScene() {
    const sc = byId(SCENARIOS, gameState.scenarioId);
    if (!sc) return renderScenarioList();
    const scene = byId(sc.scenes, gameState.sceneId) || byId(sc.scenes, sc.debut);
    const idx = sc.scenes.indexOf(scene);

    const lecture = (scene.lecture && scene.lecture.length) ? `
      <div class="readbox">
        <span class="label">📢 À lire à voix haute</span>
        ${scene.lecture.map((p) => `<p>${esc(p)}</p>`).join("")}
      </div>` : "";

    const mjNotes = (scene.mj && scene.mj.length) ? `
      <div class="gmbox">
        <span class="label">🎭 Notes du MJ</span>
        <ul>${scene.mj.map((p) => `<li>${esc(p)}</li>`).join("")}</ul>
      </div>` : "";

    const mobs = (scene.monstres && scene.monstres.length) ? `
      <div class="section-title">Créatures présentes — touchez pour la fiche</div>
      <div>${scene.monstres.map((mid) => {
        const m = byId(BESTIARY, mid);
        return m ? `<button class="mini-mob" data-mob="${m.id}">👹 ${esc(m.nom)} <span class="cr">FP ${esc(m.cr)}</span></button>` : "";
      }).join("")}</div>` : "";

    const loot = (scene.tresor && scene.tresor.length) ? `
      <div class="section-title">Trésor / butin</div>
      <ul class="loot">${scene.tresor.map((t) => `<li>${esc(t)}</li>`).join("")}</ul>` : "";

    const choices = (scene.choix && scene.choix.length) ? `
      <div class="choices">
        <span class="label">Que font les héros ?</span>
        ${scene.choix.map((c) => `
          <button class="choice" data-goto="${c.cible}">
            <span>${esc(c.txt)}</span><span class="arrow">›</span>
          </button>`).join("")}
      </div>` : `
      <div class="choices">
        <button class="choice" data-goto="__list__"><span>Fin de cette branche — retour aux aventures</span><span class="arrow">›</span></button>
      </div>`;

    $("#view-jeu").innerHTML = `
      <div class="btn-row" style="margin-bottom:12px">
        <button class="btn-ghost" data-goto="__list__">‹ Aventures</button>
        <button class="btn-ghost" data-goto="${sc.debut}">⟲ Début</button>
        <button class="btn-ghost" id="jump-btn">☰ Scènes</button>
      </div>
      <div class="progress">${esc(sc.titre)} — scène ${idx + 1}/${sc.scenes.length}</div>
      <div class="scene-head">
        <h2>${esc(scene.titre)}</h2>
      </div>
      <div class="scene-loc">📍 ${esc(scene.lieu || "")}</div>
      ${lecture}
      ${mjNotes}
      ${mobs}
      ${loot}
      ${choices}
      <div id="jump-panel"></div>`;

    // liaisons
    $$("#view-jeu [data-goto]").forEach((b) => b.addEventListener("click", () => {
      const t = b.dataset.goto;
      if (t === "__list__") { renderScenarioList(); window.scrollTo(0,0); return; }
      gameState.sceneId = t; LS.set("gameState", gameState); renderScene(); window.scrollTo(0, 0);
    }));
    $$("#view-jeu [data-mob]").forEach((b) => b.addEventListener("click", () => {
      openBestiaryEntry(b.dataset.mob);
    }));
    $("#jump-btn").addEventListener("click", () => {
      const p = $("#jump-panel");
      if (p.innerHTML) { p.innerHTML = ""; return; }
      p.innerHTML = `<div class="card"><div class="section-title" style="margin-top:0">Aller à une scène</div>${
        sc.scenes.map((s, i) => `<button class="choice" data-goto="${s.id}"><span>${i+1}. ${esc(s.titre)}</span><span class="arrow">›</span></button>`).join("")
      }</div>`;
      $$("#jump-panel [data-goto]").forEach((b) => b.addEventListener("click", () => {
        gameState.sceneId = b.dataset.goto; LS.set("gameState", gameState); renderScene(); window.scrollTo(0,0);
      }));
    });
    window.scrollTo(0, 0);
  }

  function renderGameTab() {
    if (gameState.scenarioId && byId(SCENARIOS, gameState.scenarioId)) renderScene();
    else renderScenarioList();
  }

  // =====================================================================
  //  VUE DÉS
  // =====================================================================
  let diceLog = LS.get("diceLog", []);
  let d20mode = "normal";

  function pushLog(label, total, detail) {
    diceLog.unshift({ label, total, detail, t: Date.now() });
    diceLog = diceLog.slice(0, 25);
    LS.set("diceLog", diceLog);
  }

  function renderDice() {
    $("#view-des").innerHTML = `
      <div class="card">
        <h2 style="margin-top:0;color:var(--accent)">Jet de d20</h2>
        <div class="d20-ctrl">
          <label class="small muted">Modif.</label>
          <input type="number" id="d20mod" value="0" inputmode="numbers" />
          <div class="adv-toggle btn-row" style="flex:1">
            <button data-mode="dis" class="${d20mode==='dis'?'on':''}">Désav.</button>
            <button data-mode="normal" class="${d20mode==='normal'?'on':''}">Normal</button>
            <button data-mode="adv" class="${d20mode==='adv'?'on':''}">Avantage</button>
          </div>
        </div>
        <button class="btn-accent btn-block" id="roll-d20">🎲 Lancer le d20</button>
        <div class="dice-result" id="d20-out"><div class="total">—</div><div class="detail muted">Prêt à lancer</div></div>
      </div>

      <div class="card">
        <div class="section-title" style="margin-top:0">Dés simples</div>
        <div class="dice-grid">
          ${[4,6,8,10,12,20,100].map((d)=>`<button data-die="${d}">d${d}</button>`).join("")}
          <button data-die="6" data-n="2">2d6<small>dégâts</small></button>
          <button data-die="6" data-n="3">3d6</button>
        </div>
      </div>

      <div class="card">
        <div class="section-title" style="margin-top:0">Lancer personnalisé</div>
        <div class="btn-row">
          <input type="text" id="custom-expr" class="search" placeholder="ex : 2d8+3, 1d20-1, 4d4" style="flex:1;margin:0" />
          <button class="btn-accent" id="roll-custom">Lancer</button>
        </div>
      </div>

      <div class="card">
        <div class="section-title" style="margin-top:0">Historique <button class="btn-ghost small" id="clear-log" style="float:right;min-height:auto;padding:4px 10px">Vider</button></div>
        <div class="roll-log" id="roll-log"></div>
      </div>`;

    $$('#view-des .adv-toggle button').forEach((b)=>b.addEventListener("click",()=>{
      d20mode = b.dataset.mode; renderDice();
    }));
    $("#roll-d20").addEventListener("click", () => {
      const m = parseInt($("#d20mod").value, 10) || 0;
      const r = Dice.d20(m, d20mode);
      const cls = r.crit ? "crit" : r.fail ? "fail" : "";
      const modeTxt = r.mode === "adv" ? " (avantage)" : r.mode === "dis" ? " (désav.)" : "";
      const otherTxt = r.other != null ? ` · autre dé ${r.other}` : "";
      $("#d20-out").innerHTML =
        `<div class="total ${cls}">${r.total}</div>
         <div class="detail">dé ${r.natural}${r.mod?` ${signed(r.mod)}`:""}${modeTxt}${otherTxt}${r.crit?" · CRITIQUE ⭐":r.fail?" · échec critique 💀":""}</div>`;
      pushLog(`d20${r.mod?signed(r.mod):""}${modeTxt}`, r.total, `dé ${r.natural}`);
      renderLog();
    });
    $$('#view-des [data-die]').forEach((b)=>b.addEventListener("click",()=>{
      const sides = +b.dataset.die, n = +(b.dataset.n||1);
      const r = Dice.roll(n, sides);
      $("#d20-out").innerHTML = `<div class="total">${r.sum}</div><div class="detail">${n}d${sides} : [${r.rolls.join(", ")}]</div>`;
      pushLog(`${n}d${sides}`, r.sum, `[${r.rolls.join(", ")}]`); renderLog();
    }));
    $("#roll-custom").addEventListener("click", rollCustom);
    $("#custom-expr").addEventListener("keydown",(e)=>{ if(e.key==="Enter") rollCustom(); });
    $("#clear-log").addEventListener("click",()=>{ diceLog=[]; LS.set("diceLog",diceLog); renderLog(); });
    renderLog();
  }

  function rollCustom() {
    const expr = $("#custom-expr").value.trim();
    const r = Dice.rollExpr(expr);
    if (!r) { hint("Format invalide (ex : 2d6+3)"); return; }
    $("#d20-out").innerHTML = `<div class="total">${r.total}</div><div class="detail">${esc(expr)} : [${r.rolls.join(", ")}]${r.mod?` ${signed(r.mod)}`:""}</div>`;
    pushLog(expr, r.total, `[${r.rolls.join(", ")}]`); renderLog();
  }

  function renderLog() {
    const el = $("#roll-log"); if (!el) return;
    if (!diceLog.length) { el.innerHTML = `<div class="muted small">Aucun jet.</div>`; return; }
    el.innerHTML = diceLog.map((r)=>`<div class="row"><span>${esc(r.label)} <span class="muted small">${esc(r.detail)}</span></span><b>${r.total}</b></div>`).join("");
  }

  // =====================================================================
  //  VUE PERSONNAGES
  // =====================================================================
  const ABILS = [["for","FOR"],["dex","DEX"],["con","CON"],["int","INT"],["sag","SAG"],["cha","CHA"]];

  function allCharacters() {
    const custom = LS.get("customChars", []);
    return [...PREGENS, ...custom];
  }

  function renderPersoList() {
    const chars = allCharacters();
    $("#view-perso").innerHTML = `
      <div class="card">
        <h2 style="margin-top:0;color:var(--accent)">Fiches de personnage</h2>
        <p class="muted small">Accès rapide aux héros. Touchez une caractéristique pour lancer un jet de d20 avec son modificateur.</p>
        <button class="btn-accent btn-block" id="new-char">+ Nouveau personnage</button>
      </div>
      ${chars.map((c)=>`
        <button class="pick" data-char="${c.id}">
          <h3>${esc(c.nom)}</h3>
          <div class="meta">${esc(c.classe)} · ${esc(c.race)} · PV ${c.pv} · CA ${c.ca}</div>
        </button>`).join("")}`;
    $("#new-char").addEventListener("click", newCharacterForm);
    $$("#view-perso [data-char]").forEach((b)=>b.addEventListener("click",()=>renderCharSheet(b.dataset.char)));
  }

  function renderCharSheet(id) {
    const c = byId(allCharacters(), id);
    if (!c) return renderPersoList();
    const isCustom = LS.get("customChars", []).some((x)=>x.id===id);

    const abilGrid = `<div class="abil-grid">${ABILS.map(([k,lab])=>{
      const m = abilMod(c.stats[k]);
      return `<div class="abil" data-abil="${k}" data-score="${c.stats[k]}"><div class="name">${lab}</div><div class="score">${c.stats[k]}</div><div class="mod">${signed(m)}</div></div>`;
    }).join("")}</div>`;

    const attaques = (c.attaques||[]).map((a)=>
      `<div class="kv"><b>${esc(a.nom)}</b> — ${a.bonus!=null?`${signed(a.bonus)} à toucher · `:""}${esc(a.degats)} <button class="chip roll" data-atk="${a.bonus!=null?a.bonus:0}" data-name="${esc(a.nom)}">🎲 att.</button></div>`
    ).join("");

    const sorts = (c.sorts&&c.sorts.length)?`<div class="section-title">Sorts</div><ul>${c.sorts.map((s)=>`<li>${esc(s)}</li>`).join("")}</ul>`:"";
    const caps = (c.capacites&&c.capacites.length)?`<div class="section-title">Capacités</div><ul>${c.capacites.map((s)=>`<li>${esc(s)}</li>`).join("")}</ul>`:"";
    const comps = (c.competences&&c.competences.length)?`<div class="section-title">Compétences maîtrisées</div><div class="chip-list">${c.competences.map((s)=>`<span class="chip">${esc(s)}</span>`).join("")}</div>`:"";
    const sauv = (c.jetsSauv&&c.jetsSauv.length)?`<div class="kv"><b>JS maîtrisés :</b> ${c.jetsSauv.map((k)=>k.toUpperCase()).join(", ")}</div>`:"";
    const spellHdr = c.dcSort?`<div class="kv"><b>DD des sorts :</b> ${c.dcSort} · <b>Attaque de sort :</b> ${signed(c.attaqueSort)}</div>`:"";

    $("#view-perso").innerHTML = `
      <div class="btn-row" style="margin-bottom:12px">
        <button class="btn-ghost" id="back-perso">‹ Personnages</button>
        ${isCustom?`<button class="btn-ghost" id="del-char" style="margin-left:auto;color:var(--accent-2)">Supprimer</button>`:""}
      </div>
      <div class="card">
        <h2 style="margin:0 0 2px;color:var(--accent)">${esc(c.nom)}</h2>
        <div class="muted">${esc(c.classe)} · ${esc(c.race)}</div>
        <div class="stat-line">
          <div class="box"><div class="k">Points de vie</div><div class="v">${c.pv}</div></div>
          <div class="box"><div class="k">Classe d'armure</div><div class="v">${c.ca}</div></div>
          <div class="box"><div class="k">Initiative</div><div class="v">${signed(c.init||abilMod(c.stats.dex))}</div></div>
          <div class="box"><div class="k">Maîtrise</div><div class="v">${signed(c.maitrise||2)}</div></div>
        </div>
        <div class="section-title">Caractéristiques — touchez pour lancer</div>
        ${abilGrid}
        ${sauv}
        ${spellHdr}
      </div>
      ${attaques?`<div class="card"><div class="section-title" style="margin-top:0">Attaques</div>${attaques}</div>`:""}
      ${(comps||caps||sorts)?`<div class="card">${comps}${caps}${sorts}</div>`:""}
      ${c.equipement?`<div class="card"><div class="section-title" style="margin-top:0">Équipement</div><p class="small">${esc(c.equipement)}</p></div>`:""}
      ${c.notes?`<div class="card small muted">💡 ${esc(c.notes)}</div>`:""}
      <div class="dice-result" id="char-roll" style="display:none"></div>`;

    $("#back-perso").addEventListener("click", renderPersoList);
    if (isCustom) $("#del-char").addEventListener("click", ()=>{
      if (!confirm("Supprimer ce personnage ?")) return;
      LS.set("customChars", LS.get("customChars",[]).filter((x)=>x.id!==id));
      renderPersoList();
    });
    $$("#view-perso [data-abil]").forEach((b)=>b.addEventListener("click",()=>{
      const m = abilMod(+b.dataset.score);
      const r = Dice.d20(m, d20mode);
      showCharRoll(`Jet de ${b.querySelector(".name").textContent} (${signed(m)})`, r);
    }));
    $$("#view-perso [data-atk]").forEach((b)=>b.addEventListener("click",()=>{
      const r = Dice.d20(+b.dataset.atk, d20mode);
      showCharRoll(`${b.dataset.name} — jet d'attaque (${signed(+b.dataset.atk)})`, r);
    }));
  }

  function showCharRoll(label, r) {
    const el = $("#char-roll"); if (!el) return;
    const cls = r.crit ? "crit" : r.fail ? "fail" : "";
    el.style.display = "block";
    el.innerHTML = `<div class="total ${cls}">${r.total}</div><div class="detail">${esc(label)} · dé ${r.natural}${r.crit?" ⭐":r.fail?" 💀":""}</div>`;
    pushLog(label, r.total, `dé ${r.natural}`);
    el.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  function newCharacterForm() {
    $("#view-perso").innerHTML = `
      <div class="btn-row" style="margin-bottom:12px"><button class="btn-ghost" id="cancel-new">‹ Annuler</button></div>
      <div class="card">
        <h2 style="margin-top:0;color:var(--accent)">Nouveau personnage</h2>
        <label class="small muted">Nom</label><input type="text" id="f-nom" class="search" />
        <label class="small muted">Classe & niveau</label><input type="text" id="f-classe" class="search" placeholder="ex : Barde niv. 2" />
        <label class="small muted">Race</label><input type="text" id="f-race" class="search" />
        <div class="stat-line">
          <div class="box"><div class="k">PV</div><input type="number" id="f-pv" value="10" style="width:64px"></div>
          <div class="box"><div class="k">CA</div><input type="number" id="f-ca" value="12" style="width:64px"></div>
        </div>
        <div class="section-title">Caractéristiques</div>
        <div class="abil-grid">${ABILS.map(([k,lab])=>`<div class="abil"><div class="name">${lab}</div><input type="number" id="f-${k}" value="10" style="width:100%;text-align:center"></div>`).join("")}</div>
        <label class="small muted">Compétences maîtrisées (séparées par des virgules)</label><input type="text" id="f-comp" class="search" />
        <label class="small muted">Notes / équipement</label><input type="text" id="f-notes" class="search" />
        <button class="btn-accent btn-block" id="save-char">Enregistrer</button>
      </div>`;
    $("#cancel-new").addEventListener("click", renderPersoList);
    $("#save-char").addEventListener("click", ()=>{
      const stats = {}; ABILS.forEach(([k])=>stats[k] = parseInt($("#f-"+k).value,10)||10);
      const c = {
        id: "cust-" + Date.now(),
        nom: $("#f-nom").value.trim() || "Sans nom",
        classe: $("#f-classe").value.trim() || "Aventurier",
        race: $("#f-race").value.trim() || "—",
        pv: parseInt($("#f-pv").value,10)||10,
        ca: parseInt($("#f-ca").value,10)||12,
        maitrise: 2, stats,
        competences: $("#f-comp").value.split(",").map((s)=>s.trim()).filter(Boolean),
        notes: $("#f-notes").value.trim()
      };
      const custom = LS.get("customChars", []); custom.push(c); LS.set("customChars", custom);
      renderCharSheet(c.id);
    });
  }

  // =====================================================================
  //  VUE BESTIAIRE
  // =====================================================================
  let bestFilter = "";

  function renderBestiary() {
    const q = bestFilter.toLowerCase();
    const list = BESTIARY.filter((m)=>
      !q || m.nom.toLowerCase().includes(q) || m.type.toLowerCase().includes(q) ||
      (m.tags||[]).some((t)=>t.includes(q)));
    $("#view-bestiaire").innerHTML = `
      <div class="card">
        <h2 style="margin-top:0;color:var(--accent)">Bestiaire & PNJ</h2>
        <input type="text" class="search" id="best-search" placeholder="Rechercher (nom, type, aventure1, mort-vivant…)" value="${esc(bestFilter)}">
        <div class="btn-row">
          <button class="chip roll" data-filter="">Tous</button>
          <button class="chip roll" data-filter="aventure1">Aventure 1</button>
          <button class="chip roll" data-filter="aventure2">Aventure 2</button>
          <button class="chip roll" data-filter="mort-vivant">Morts-vivants</button>
          <button class="chip roll" data-filter="boss">Boss</button>
        </div>
      </div>
      <div id="best-list">${list.map(bestiaryCard).join("") || `<div class="card muted center">Aucune créature.</div>`}</div>`;
    const s = $("#best-search");
    s.addEventListener("input",()=>{ bestFilter = s.value; const pos = s.selectionStart;
      const listEl = $("#best-list");
      const q2 = bestFilter.toLowerCase();
      const l2 = BESTIARY.filter((m)=>!q2||m.nom.toLowerCase().includes(q2)||m.type.toLowerCase().includes(q2)||(m.tags||[]).some((t)=>t.includes(q2)));
      listEl.innerHTML = l2.map(bestiaryCard).join("") || `<div class="card muted center">Aucune créature.</div>`;
      bindBestiaryDetails();
    });
    $$("#view-bestiaire [data-filter]").forEach((b)=>b.addEventListener("click",()=>{ bestFilter=b.dataset.filter; renderBestiary(); }));
    bindBestiaryDetails();
  }

  function bestiaryCard(m) {
    const stats = ABILS.map(([k,lab])=>`<div class="box"><div class="k">${lab}</div><div class="v" style="font-size:16px">${m.stats[k]} <span class="muted" style="font-size:12px">${signed(abilMod(m.stats[k]))}</span></div></div>`).join("");
    const traits = (m.traits&&m.traits.length)?`<div class="section-title">Traits</div><ul>${m.traits.map((t)=>`<li>${esc(t)}</li>`).join("")}</ul>`:"";
    const actions = (m.actions&&m.actions.length)?`<div class="section-title">Actions</div><ul>${m.actions.map((t)=>`<li>${esc(t)}</li>`).join("")}</ul>`:"";
    return `<details id="mob-${m.id}">
      <summary>${esc(m.nom)} <span class="tag cr">FP ${esc(m.cr)}</span></summary>
      <div class="muted small">${esc(m.type)}</div>
      <div class="stat-line" style="margin-top:8px">
        <div class="box"><div class="k">CA</div><div class="v" style="font-size:16px">${esc(m.ac)}</div></div>
        <div class="box"><div class="k">PV</div><div class="v" style="font-size:16px">${esc(m.pv)}</div></div>
        <div class="box"><div class="k">Vitesse</div><div class="v" style="font-size:14px">${esc(m.vitesse)}</div></div>
      </div>
      <div class="stat-line">${stats}</div>
      ${m.comp?`<div class="kv"><b>Comp. :</b> ${esc(m.comp)}</div>`:""}
      ${m.sens?`<div class="kv"><b>Sens :</b> ${esc(m.sens)}</div>`:""}
      ${m.langues?`<div class="kv"><b>Langues :</b> ${esc(m.langues)}</div>`:""}
      ${traits}${actions}
      ${m.notes?`<div class="card small muted" style="margin-top:10px">💡 ${esc(m.notes)}</div>`:""}
    </details>`;
  }
  function bindBestiaryDetails(){ /* détails natifs, rien à lier */ }

  function openBestiaryEntry(id) {
    showTab("bestiaire");
    bestFilter = "";
    renderBestiary();
    const d = $("#mob-"+id);
    if (d) { d.open = true; d.scrollIntoView({ behavior:"smooth", block:"start" }); }
  }

  // =====================================================================
  //  VUE UNIVERS
  // =====================================================================
  function renderUnivers() {
    const L = FARLAND_LORE;
    const godBlock = (g) => `<details><summary>${esc(g.titre)}</summary>${g.liste.map((d)=>`<div class="kv"><b>${esc(d.nom)}</b> — ${esc(d.dom)}</div>`).join("")}</details>`;
    $("#view-univers").innerHTML = `
      <div class="card">
        <h2 style="margin-top:0;color:var(--accent)">${esc(L.intro.titre)}</h2>
        ${L.intro.texte.map((p)=>`<p>${esc(p)}</p>`).join("")}
        <div class="card" style="background:var(--bg-3);border-color:var(--accent)"><b style="color:var(--accent)">💰 Monnaie</b><p class="small" style="margin:6px 0 0">${esc(L.intro.monnaie)}</p></div>
      </div>

      <div class="card">
        <div class="section-title" style="margin-top:0">${esc(L.seigneursDuPeche.titre)}</div>
        <p class="small muted">${esc(L.seigneursDuPeche.texte)}</p>
        ${L.seigneursDuPeche.liste.map((s)=>`<div class="kv"><b>${esc(s.peche)}</b> — ${esc(s.note)}</div>`).join("")}
      </div>

      <div class="card">
        <div class="section-title" style="margin-top:0">${esc(L.royaumes.titre)}</div>
        ${L.royaumes.liste.map((r)=>`<details><summary>${esc(r.nom)}</summary><p class="small">${esc(r.texte)}</p></details>`).join("")}
      </div>

      <div class="card">
        <div class="section-title" style="margin-top:0">${esc(L.dieux.titre)}</div>
        <p class="small muted">${esc(L.dieux.texte)}</p>
        ${godBlock(L.dieux.bons)}
        ${godBlock(L.dieux.neutres)}
        ${godBlock(L.dieux.mauvais)}
      </div>

      <div class="card">
        <div class="section-title" style="margin-top:0">${esc(L.races.titre)}</div>
        <p class="small muted">${esc(L.races.texte)}</p>
        <ul class="small">${L.races.liste.map((r)=>`<li>${esc(r)}</li>`).join("")}</ul>
      </div>

      <div class="card">
        <div class="section-title" style="margin-top:0">${esc(L.langues.titre)}</div>
        <ul class="small">${L.langues.liste.map((r)=>`<li>${esc(r)}</li>`).join("")}</ul>
      </div>

      <div class="card small muted center">
        Univers du <b>Monde de Farland</b> — cadre gratuit compatible D&D 5e (farlandworld.com).<br>
        Contenu résumé pour l'usage du MJ.
      </div>`;
  }

  // =====================================================================
  //  INITIALISATION
  // =====================================================================
  renderGameTab();
  renderDice();
  renderPersoList();
  renderBestiary();
  renderUnivers();
  showTab(LS.get("lastTab", "jeu"));

  // expose pour debug éventuel
  window.FarlandApp = { showTab, openScenario };
})();
