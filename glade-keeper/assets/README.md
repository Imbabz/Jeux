# Assets

Drop art/audio here. Folder = type:

| Folder | What goes in it | Preferred formats |
|--------|-----------------|-------------------|
| `reference/` | Concept art, screenshots, mood/palette refs (NOT used in-game, just guidance) | `.png` / `.jpg` |
| `models/` | 3D meshes (characters, props, environment) | **`.glb`/`.gltf`** (best for Godot), also `.fbx` / `.obj` |
| `textures/` | Image textures, gradient ramps, sprites | `.png` (transparency), `.jpg` |
| `audio/` | Music + SFX | `.ogg` (best for Godot), `.wav` |

## How to add assets (from any machine, no Godot needed)
Easiest right now: **GitHub web UI**. Open the repo on github.com → navigate to
`glade-keeper/assets/<folder>` → **Add file ▸ Upload files** → drag them in →
Commit. Then tell Claude which branch you uploaded to and it will pull them in
and wire them into the scene.

(Or, if you use git locally: drop files in the right folder, `git add`,
`git commit`, `git push`.)

## Notes
- **Size:** GitHub rejects files >100 MB and warns >50 MB. Low-poly `.glb`
  models and reasonable textures are usually well under that. If something is
  huge, say so — we'll compress or use Git LFS.
- **Godot import:** `.glb`/`.gltf` import cleanly with materials. For `.fbx`,
  Godot needs the FBX2glTF converter set up once — flag it if you only have FBX.
- **Reference images** can also just be pasted into chat instead of committed —
  that's faster for pure look-and-feel guidance.
