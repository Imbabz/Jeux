# Glade Keeper — Project Handoff & Master Brief

**Read this first.** It is the single, self-contained onboarding document for
anyone (human or AI) continuing this project. Deeper detail lives in
`GDD.md` (design), `ASSETS.md` (asset plan), the root `CLAUDE.md` (working
conventions), and `.claude/skills/` (installed skills). This file summarises
and ties them together.

---

## 1. What this is (context in one paragraph)
**Glade Keeper** is a cozy, low-stakes, third-person 3D game where you play a
gentle woodland wizard (**Wren**) caring for a small enchanted glade and its
whimsical stilt-village. You help animals and neighbors with small troubles
and coax a half-withered world back into bloom, at your own unhurried pace.
There is **no combat, no danger, no timer you can fail, no death.** It is a
relaxing, beautiful, "leave the world a little more alive than you found it"
experience — think *A Short Hike* / *Stardew Valley* warmth with the light and
grandeur of *Journey* and the storybook art of *Ni no Kuni*. It is being built
solo(-ish) in **Godot 4**, deliberately small in scope but high in polish.

## 2. The north-star feeling (do not violate)
Unhurried · warm · safe · softly magical · a touch wistful.
> **Emotional promise: "Leave the world a little more alive than you found it."**

Every design decision is judged against this. **Anything that adds stress,
urgency, punishment, grind, or clutter is wrong for this game**, even if it is
"good game design" in general. Serenity is the product.

## 3. Gameplay
**Cast:** Wren (player) · animals (foxes, rabbits, deer, birds — small
troubles) · nature-spirits (glowing, mostly wordless) · a few gentle
forest-folk neighbors (light personalities, simple requests).

**Two core verbs (deliberately just two — kept minimal on purpose):**
1. **Mend** — walk to an animal/neighbor in need, press **E**, resolve a small
   trouble (thorn, lost creature, blocked path). Warm VFX + thank-you.
2. **Tend & grow** — target a grey, withered spot, press **E**, and it blooms
   (ground greens, flowers pop in, green bloom burst). Drives the restoration.

*Explicitly OUT of scope (to protect the calm):* combat, fail states,
crafting/brewing, gathering economies, inventory grind, relationship grinds.

**Pacing:** a slow, always-ignorable **day→dusk cycle** (dusk = the magic
hour, gold light, windows glow) over a **restoration arc** (the glade visibly
heals and fills with life as you Mend & Tend; progress *is* the reward — no
score, no timer). New areas open gently as the world revives.

**Session loop:** wander → notice something needing care → Mend/Tend → the
glade grows a little more alive → drift on. 5 minutes or an hour both feel
complete.

**Controls (current):** `WASD` move · mouse look/orbit · `E` interact ·
`Esc` release cursor. (To be moved to a remappable Input Map.)

## 4. Visual / art direction
**Target = Journey × Ni no Kuni (Studio Ghibli).** Saturated storybook
palette, painterly skies, soft **cel/toon shading**, warm magical glows
punching through cool greens, drifting motes, god-rays, dusk gold.

**Core principle:** geometry stays **low-poly / stylized**; the "graphical",
premium quality comes from **shading, colour, light, and VFX — not
polycount**. This keeps the game performant *and* beautiful, and lets a tiny
team ship. Style **consistency** across assets matters more than fidelity of
any single asset. Reference concept art was provided by the owner (moody
forest-wizard paintings, a stilted treehouse village, a fairy glade, and a
stylized cozy-village game screenshot); design-preview renders have been
shared throughout in chat.

## 5. Technical architecture
- **Engine:** Godot 4.3+, GDScript, `mobile` renderer (perf headroom).
- **Main scene:** `scenes/world/emberglade.tscn` (script `emberglade.gd`)
  builds the whole world procedurally at runtime and instantiates player, HUD,
  animals, and tend-patches.
- **Player:** `scenes/player/wren.tscn` — `CharacterBody3D` with
  `wren_controller.gd` (movement, mouse-orbit camera via SpringArm, and a
  unified interaction system that handles any body in groups `animal` or
  `tendable` through one prompt/`interact()` path) + `wren_model.gd` (the
  wizard built from primitives, with idle/walk/cast animation; swap-ready for
  a real model).
- **Interactables** implement a duck-typed contract: a `problem_text` property
  and an `interact()` method. `animal_npc.gd` and `tend_patch.gd` both satisfy
  it, so the controller treats them uniformly.
- **Cel shading:** `shaders/toon.gdshader` (banded diffuse + cool rim).
  Applied at load by `emberglade._apply_toon_shading()`, which walks the tree
  and converts every solid, **non-emissive, opaque** `StandardMaterial3D` into
  a toon `ShaderMaterial` — leaving emissive (windows, particles, staff glow)
  and transparent (water) materials untouched.
- **Day→dusk:** `emberglade._process()` ping-pongs a phase and lerps sun
  angle/colour/energy, sky + fog colours, and ramps dusk light energies.
- **VFX / atmosphere:** all built in-engine (fireflies, fairy motes, bloom
  bursts, smoke, staff glow, god-ray volumetric fog). Only tiny
  radial-gradient sprites are generated in code.
- **Restoration (planned):** implement withered↔alive as a per-material
  **vitality shader parameter** so we don't need duplicate dead/alive meshes.

### Folder map
```
glade-keeper/
  project.godot                  main scene = scenes/world/emberglade.tscn
  CLAUDE.md                      working conventions (read after this file)
  README.md                      how to run
  shaders/toon.gdshader          cel/toon shader
  scenes/  world/(emberglade,tend_patch) player/wren npc/animal_npc ui/hud
  scripts/ mirror scenes/ 1:1
  docs/    GDD.md ASSETS.md HANDOFF.md(this)
  assets/  reference/ models/ textures/ audio/   (drop art here; see README)
  .claude/skills/  3d-modeling, three-best-practices, r3f-best-practices
```

### "Placeholder-then-swap" philosophy
The entire world is currently **procedural primitives built in code**. Real
assets (`.glb`) drop into `assets/models/` and **replace the primitive
builders without changing layout or logic** — positions and gameplay carry
over. This is why everything uses explicit, deterministic placement (not RNG):
so layouts stay stable across the swap and across the preview mirror.

## 6. How we work (workflow — important for a new AI)
- **Cannot run Godot in the dev sandbox** (no GPU/display; Godot download is
  egress-blocked). So changes are validated by **inspection**, not play.
- **Feedback loop = a Three.js "design preview."** Because Godot can't render
  here, we mirror the Godot scene in a self-contained Three.js page
  (`three.module.min.js` + a `preview.html` in scratch), render it headless
  via Playwright/Chromium, screenshot it, and share the image for the owner's
  taste feedback. The preview is an **approximation** (it even fakes
  cel-shading), always disclosed as such. Keep Godot as source of truth and
  keep the preview roughly in sync when useful.
- **Environment/egress constraints:** `github.com`, `codeload`, and the GitHub
  API are **403-blocked** (so `git clone` of third-party repos fails), but
  `raw.githubusercontent.com`, npm, and pypi **are** reachable — that's how the
  `.claude/skills` were installed (raw file fetch). The container is
  **ephemeral**; only what's committed to git persists.
- **Git:** develop on branch `claude/fantasy-game-studio-setup-rjvgfd`;
  commit + push each meaningful step. Repo: `imbabz/jeux`, project lives in the
  `glade-keeper/` subfolder.
- **GDScript conventions:** static typing by default, but keep vars that hold
  **custom-scripted nodes** untyped (`var x = ...`) so the analyzer doesn't
  hard-error on custom methods; tabs for indent; default collision layers;
  animals are `StaticBody3D`. See `CLAUDE.md` for the full list.
- **Taste vs. implementation:** the owner is not a programmer but is an
  experienced player. **Always loop them in on taste/design calls** (tone,
  look, what's fun) via clear options; handle implementation details yourself.

## 7. Current state (what's built and working, in code)
Enclosed forest-glade hub (two-ring tree wall, undergrowth, winding
stream+pond, ferns/toadstools/flowers/rocks) · cottage (conical roof, lit
window, chimney smoke) · placeholder stilted treehouse + rope bridge · **Wren
the wizard** (robe/hat/beard/glowing staff) with idle/walk/**cast** animation ·
**Mend** loop (3 animals) · **Tend & grow** loop (withered patches → bloom) ·
**cel/toon shader** · **day→dusk cycle** · fireflies + green fairy motes +
god-ray fog · minimal HUD prompt.

**⚠️ Nothing has run on real hardware yet.** It is verified by inspection
only. The `toon.gdshader` in particular is **unverified** — if it has a typo,
materials render magenta but the game still runs; first hardware run must check
this and report the Output-panel error for a blind fix.

## 8. Assets (see `ASSETS.md` for the full breakdown)
~70% of the world is coverable by **free CC0 packs** (Quaternius / Kenney):
all nature, most village pieces, SFX, UI icons, fonts. The **unique heroes**
(Wren, the cottage, the staff, neighbor characters) need **AI-3D (Meshy/Tripo
from the concept art) or commission**, because free packs have no cohesive
robed-wizard cast. Everything glowing/atmospheric (shaders, VFX, day cycle,
water, restoration) is built in-engine. **Music** is the one thing worth
eventually commissioning. Phase-1 shopping list is at the top of `ASSETS.md`.

## 9. Success factors (what makes THIS game succeed)
1. **The feeling lands.** Calm, warm, safe, unhurried. If a playtester feels
   stressed or bored-in-a-bad-way, that's the only real bug that matters.
2. **Cohesive art direction** carried by cel-shading + light + VFX + a
   consistent palette — not by expensive geometry. Consistency > fidelity.
3. **Performance / lightweight.** Runs smooth on modest hardware; low poly by
   design. This was an explicit founding requirement.
4. **Small but polished.** A tiny, gorgeous, complete slice beats a large rough
   one. Protect scope ferociously.
5. **The two verbs feel good** (Mend + Tend) and **dusk is magical.** These are
   the moments that must sing.
6. **Visible, rewarding restoration** — the world blooming is the reward; no
   score, no pressure.
7. **Cozy audio** — ambient beds + gentle SFX + one good theme. The single
   biggest "feeling" multiplier per unit effort.
8. **Low development friction** — placeholder-then-swap, easy iteration, clear
   docs, so momentum never stalls.

## 10. Roadmap
**What the OWNER must do (unblocks the "next level"):**
1. 🔴 **Run it on real hardware** (Godot 4.3+, open project, F5) and verify —
   especially the cel-shader (magenta ⇒ paste the error). This gate unblocks
   everything; until then all work is unverified.
2. 🟢 Drop the **free nature/animal packs** into `assets/models/` and push.
3. 🟣 **AI-3D the hero characters** (Wren, neighbors, cottage) from the concept
   art; commit the `.glb`s.
4. 🔵 Add **audio** (Kenney/freesound ambience + SFX; consider commissioning
   music later).
5. Provide any remaining creative calls: Wren's final look, the neighbor cast,
   the first restoration goal.

**What the AI can build next (no input needed):**
NPC neighbors (idle/walk + simple requests) · a proper **dialogue box** +
speaker portraits (portraits need art) · **foliage wind-sway** shader · the
**glade-vitality/restoration** tracking system + a subtle indicator ·
**asset-integration pipeline** (swap primitives for `.glb`s as they land) ·
remappable **Input Map** · title/pause screens · save/checkpoint.

## 11. Orientation for a new AI session
1. Read this file, then `CLAUDE.md`, then `GDD.md` and `ASSETS.md`.
2. The main scene is `scenes/world/emberglade.tscn`; almost everything is built
   in `scripts/world/emberglade.gd`.
3. You cannot run Godot here — use the Three.js preview + screenshot loop for
   visual feedback, and validate GDScript by careful inspection.
4. Commit to branch `claude/fantasy-game-studio-setup-rjvgfd`.
5. Guard the north-star feeling (§2) and the success factors (§9) above all.
