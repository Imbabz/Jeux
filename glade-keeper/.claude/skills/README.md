# Project skills

Skills installed here load automatically for any Claude Code session working
in this repo (they persist in git — unlike `~/.claude/skills`, which in the
cloud/web environment is an ephemeral container that's wiped each session).

## Installed
| Skill | Source | Purpose |
|-------|--------|---------|
| `3d-modeling` | github.com/majiayu000/claude-skill-registry | Topology, UV, LOD, and game-ready export pipelines (FBX/glTF → Godot). Use when importing/prepping real 3D assets. |
| `three-best-practices` | github.com/emalorenzo/three-agent-skills | Three.js performance + correctness. Sharpens the browser design-preview renders used to iterate on look-and-feel. |
| `r3f-best-practices` | github.com/emalorenzo/three-agent-skills | React-Three-Fiber patterns (if the preview harness ever moves to R3F). |

## How these were installed (network note)
This environment's egress policy **blocks `github.com`, `codeload.github.com`,
and the GitHub API** (HTTP 403), so `git clone <repo>` does not work here.
However `raw.githubusercontent.com` and the npm registry **are** reachable, so
skills are installed by fetching their `SKILL.md` (and any bundled files) via
raw URLs, e.g.:

```bash
curl -s https://raw.githubusercontent.com/<owner>/<repo>/<branch>/skills/<name>/SKILL.md \
  -o .claude/skills/<name>/SKILL.md
```

To add more skills (e.g. Godot-specific ones), provide the `owner/repo` and the
path to the skill folder, and they can be pulled the same way. A skill's
directory may include supporting files (`references/`, scripts) that also need
fetching; `SKILL.md` is the required core.
