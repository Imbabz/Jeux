# Glade Keeper — Game Design Doc (living document)

## One-line pitch
A cozy, low-stakes third-person game about a young hedge-wizard tending a
small valley during its last peaceful spring, helping woodland animals with
small, gentle troubles.

## Premise
Emberglade is a quiet valley, the kind of place stories forget because
nothing bad ever happens there — yet. You play **Wren**, an apprentice
warden left in charge of the glade for a season while the elder warden is
away. There's no danger, no combat, no fail state. Just a valley, its
animals, and small problems that a little patience and a little magic can
fix. (The "last peaceful spring" framing is pure mood — we are not building
a war game. It never has to be shown or explained beyond a wistful vibe.)

## Core loop (v1)
1. Walk through the glade (third-person, camera orbits with the mouse).
2. Notice an animal in trouble (a floating name label, a short line of text
   when you're close).
3. Walk up, press **E** to help.
4. A small warm VFX burst plays, the animal's line changes to a thank-you.
5. Repeat, at your own pace — no timer, no score, no lose condition.

## Controls
- `WASD` — move
- Mouse — look / orbit camera
- `E` — help the nearest animal
- `Esc` — release/recapture the mouse cursor

## Art direction pillars
- **"Lofi but living."** Geometry stays deliberately simple (primitives:
  capsules, boxes, cones) — this keeps performance high and lets a solo
  dev/small team ship fast. The *feeling* of quality comes from lighting,
  color, fog, glow, and particle VFX carrying the atmosphere, not polycount.
- Warm, soft directional light + sky ambient, gentle fog, filmic tonemap,
  light bloom/glow.
- VFX should read as small, precious, and warm: pollen, fireflies, sparkle
  bursts on "helped," soft light shafts later.

## Technical pillars
- **Engine:** Godot 4.3+ (GDScript), Forward+ features available but using
  the `mobile` renderer by default for performance headroom.
- **No physics-heavy simulation.** Animals are static (`StaticBody3D`); the
  player is the only moving physics body. Keeps the sim cheap and bug
  surface small.
- Placeholder art is 100% procedural (built in code, no imported meshes),
  so there's zero external-asset pipeline to manage yet. Swapping in real
  models later only means changing what a scene instantiates.

## What exists right now (v1 — first playable slice)
- Emberglade hub scene: ground, a pond, 8 trees, sky/fog/glow environment,
  ambient firefly/pollen particles.
- Wren: third-person walk/run + mouse-look camera.
- 3 animals (Fox, Rabbit, Deer), each with a one-line problem, a proximity
  prompt, and a sparkle VFX + thank-you line on interact.
- Minimal HUD: contextual "Press E" prompt + controls reminder.

## Art-direction target
Aiming for a blend of **Journey** (atmosphere, light, grand vistas) and
**Ni no Kuni / Studio Ghibli** (saturated storybook palette, painterly
skies, soft **cel-shading**). Geometry stays simple; the "graphical" quality
comes from shading, color, and light. See the design preview renders shared
in chat for the reference look.

## Backlog / next passes (roughly in order of "most bang for the buck")
0. **VFX/Shading — cel/toon shader (TOP PRIORITY):** the single biggest lever
   toward the Ni no Kuni look. Write a Godot `.gdshader` (banded diffuse ramp
   + optional rim + outline via inverted-hull or edge-detect) and apply it to
   the world materials. This is the one piece that can't be verified in the
   dev sandbox, so it needs a test run on real hardware once available.
1. **World/Narrative:** more animals + varied problems; a couple of small
   multi-step quests instead of single-interact ones.
2. **UX/UI:** proper dialogue box (not just a floating label), a subtle
   "glade is fully tended" completion moment, pause/settings menu.
3. **VFX:** swap flat sparkle quads for a soft radial-gradient sparkle
   texture; add light shafts through the trees; day/night or golden-hour
   lighting cycle.
4. **Systems/Gameplay:** a real Godot Input Map (Project Settings → Input
   Map) instead of hardcoded keys, so controls are remappable and
   controller-friendly.
5. **Art:** first real low-poly character/animal models once the loop is
   validated (placeholders are intentionally disposable).
6. **Audio:** ambient soundscape + a couple of gentle SFX (the biggest
   "cozy" upgrade for the least effort).
7. Save/checkpoint, main menu, title screen.

## Explicit non-goals (for now)
No combat, no fail states, no inventory grind, no crafting complexity.
Anything that adds stress cuts against the pitch.
