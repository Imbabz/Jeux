# Glade Keeper — project notes for Claude Code

Godot 4.3+ project. See `docs/GDD.md` for design/scope, `README.md` for how
to run it.

## How "the studio" works here
There's no real multi-person team — one Claude Code session plays every
role in sequence, switching hats as needed:
- **Producer** — keeps scope small, defines the next milestone.
- **World/Narrative** — level layout, animal problems/dialogue, tone.
- **Gameplay/Systems** — player controller, interaction, game logic.
- **VFX** — particles, lighting, materials, post-processing.
- **UX/UI** — HUD, prompts, menus, control feel.

Don't spin up separate subagents for these — the project is small and
tightly coupled (one scene, a handful of scripts), so parallel agents would
just collide on the same files. Do it as sequential focused passes instead.
Subagents are worth it later only for genuinely separable bulk work (e.g.
"write 10 more animal quest configs" once the pattern is established).

The human is not a programmer but has a lot of player experience — always
loop them in on **taste/design** calls (tone, pacing, what's fun), not on
implementation details. Keep explanations of anything they need to do
themselves (installing Godot, running the project, reporting an error)
short and concrete.

## Important environment constraint
**Godot itself cannot run in the sandbox this session executes in** — no
GUI, and downloading the Godot binary is blocked by the environment's
egress policy. This means:
- Changes cannot be visually verified or screenshotted by Claude before
  they're reported as done.
- The human must open the project in their local Godot 4 editor and press
  F5 (or the animal/scene in question) to actually see/test changes.
- If something errors, Godot prints a file + line number in the bottom
  output panel — paste that back verbatim, it's usually enough to fix
  blind.

Because of this, favor code that's simple enough to be correct by
inspection: procedural/primitive placeholder geometry built in GDScript
rather than hand-authored complex `.tscn` resource blocks, since the latter
can't be test-loaded here either.

## GDScript conventions used in this project
- **Static typing by default** (`var x: Type = ...` / `:=`) for anything
  holding a built-in engine type.
- **Deliberately untyped** (`var x = ...`, no `:=`, no `: Type`) for any
  variable that will hold a *custom-scripted* node whose custom
  properties/methods you need to access (e.g. `hud`, `player`, `animal`,
  `target`/`nearest_animal` in the interact code). GDScript's static
  analyzer will hard-error on `foo.custom_method()` if `foo`'s declared
  type is a base engine class that doesn't define `custom_method`. Keeping
  these specific vars untyped avoids that entirely and costs nothing at
  this project's size.
- No physics/collision layers are customized anywhere — everything uses
  Godot's default layer/mask (1/1). Keep it that way unless there's an
  actual need to filter what collides with what; it's one less thing to
  get wrong by hand.
- Animals are `StaticBody3D` (not `CharacterBody3D`) — they don't move in
  v1. Don't upgrade them to a physics body with velocity unless/until an
  animal actually needs to walk around.

## Folder structure
```
glade-keeper/
  project.godot
  scenes/
    world/emberglade.tscn   — the hub level (mostly builds itself in code)
    player/wren.tscn        — player character + camera rig
    npc/animal_npc.tscn     — reusable animal template
    ui/hud.tscn             — prompt + controls label
  scripts/                  — mirrors scenes/ 1:1
  docs/GDD.md               — design doc, read this before adding content
```
