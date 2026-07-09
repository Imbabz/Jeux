# Glade Keeper — Game Design Doc (living document)

## One-line pitch
A cozy, low-stakes third-person game where you are a gentle woodland wizard
caring for a small glade and its whimsical stilt-village — helping animals
and neighbors with small troubles and coaxing the withered world back into
bloom, at your own unhurried pace.

## The feeling (north star)
Unhurried, warm, safe, softly magical, a touch wistful. **No danger, no
combat, no clock you can fail, no death.** The emotional promise:
> *"Leave the world a little more alive than you found it."*
You arrive at a sleepy, half-asleep glade; through small kindnesses it
slowly becomes vibrant, glowing, and populated. Dusk is the magic hour.
Ni no Kuni's color, Journey's light and hush.

## Cast
- **Wren** — the player; a gentle young hedge-wizard/caretaker with a
  glowing staff.
- **Animals** — foxes, rabbits, deer, birds… each with small, gentle
  troubles (the Mend loop). Some become regulars around your cottage.
- **Nature-spirits** — small, glowing, mostly wordless creatures (the
  fairies of the reference art). More VFX than character.
- **A few forest-folk neighbors** — a small cast (start with ~3–5) of gentle
  villagers with light personalities and simple requests. Warmth, not
  quest-grind.

## Core verbs (what the wizard actually does)
1. **Mend** — approach an animal/neighbor in need, cast, and resolve a small
   trouble (thorn, lost creature, blocked path). Warm VFX + a thank-you.
2. **Tend & grow** — target a grey, withered spot, wave the staff, and watch
   it bloom: grass greens, flowers open, a dead tree buds. Instant, visible,
   satisfying. This drives the restoration arc.

*(Deliberately NOT in scope: brewing/crafting, lantern-lighting chores,
relationship grinds, gathering economies. Kept out to protect the serene
pace. Can revisit later.)*

## Pacing & progression
- **Gentle day→dusk cycle:** a soft ambient time-of-day loop. Dusk turns the
  light gold and is the world's most beautiful moment — but it's always
  optional; nothing is gated on time, nothing fails.
- **Restoration arc:** the glade visibly heals as you Tend and Mend — more
  color, more bloom, more animals and neighbors present over time. Progress
  *is* the reward (no score, no timer). New areas open gently as the world
  revives (a revived path reveals a new grove).

## Session loop
Wander → notice something needing care (an animal in trouble, a withered
patch) → Mend / Tend → the glade grows a little more alive → drift on. A
session can be 5 minutes or an hour; both feel complete.

## Controls (current)
- `WASD` — move · Mouse — look/orbit · `E` — Mend/Tend the nearest target ·
  `Esc` — release/recapture cursor. *(To be moved to a remappable Input Map.)*

## Art direction
Blend of **Journey** (atmosphere, light, vistas) and **Ni no Kuni / Studio
Ghibli** (saturated storybook palette, painterly skies, soft **cel-shading**).
Geometry stays low-poly/stylized; the "graphical" quality comes from shading,
color, light, and VFX — not polycount. Reference renders shared in chat.

## Technical pillars
- **Engine:** Godot 4.3+ (GDScript), `mobile` renderer for perf headroom.
- **Cheap simulation:** the player is the main moving physics body; animals
  and props are static or lightly animated. No heavy physics.
- **Placeholder-then-swap:** the world is currently 100% procedural
  primitives built in code. Real assets (Quaternius/Kenney `.glb`, later
  AI-3D/commissioned heroes) drop into `assets/models/` and replace the
  primitive builders without changing layout/logic. See `assets/README.md`.
- **Restoration via shader, not duplicate meshes:** "withered vs. bloomed"
  is driven by a per-material vitality parameter (desaturate/regrow) where
  possible, so we don't need dead+alive copies of every prop.

## What exists right now
- Enclosed forest-glade hub: two-ring tree wall, undergrowth, stream+pond,
  cottage (lit window + smoke), placeholder stilted treehouse + rope bridge,
  ferns/toadstools/flowers/rocks, day-ish warm lighting, fog god-rays,
  fireflies + green fairy motes.
- Wren: third-person walk/run + mouse-look camera.
- 3 animals with a proximity prompt + sparkle VFX + thank-you on interact.
- Minimal HUD.

## Backlog (roughly by bang-for-buck)
0. **Cel/toon shader** (TOP visual lever) — Godot `.gdshader`: banded diffuse
   ramp + rim + optional outline. Needs a hardware test run to verify.
1. **Asset integration** — import the free nature/animal packs and swap
   placeholders (see `docs/ASSETS.md`).
2. **Tend & grow verb** — target a withered patch → bloom transition (shader
   vitality param + bloom VFX).
3. **Day→dusk cycle** — animate sun/sky/fog between morning and gold dusk;
   lantern/window emissives ramp up at dusk.
4. **UX/UI** — dialogue box + speaker portraits, a subtle "glade vitality"
   meter, pause/settings, remappable Input Map.
5. **NPC neighbors** — a few forest-folk with idle/walk + simple requests.
6. **Audio** — ambient forest/dusk beds + gentle SFX (huge cozy ROI).
7. **Restoration systems** — track tended spots, reveal new areas, populate
   the glade over time. Save/checkpoint, title screen.

## Explicit non-goals (for now)
No combat, fail states, inventory grind, or crafting complexity. Anything
that adds stress cuts against the pitch.
