# Glade Keeper — Comprehensive Asset List

Derived from the locked flow in `GDD.md` (cast: wizard + animals + spirits +
a few folk · verbs: **Mend** + **Tend & grow** · pacing: day→dusk +
restoration). Assets live in `assets/` (see `assets/README.md`).

## Legend — who provides it
- 🛠️ **I build in-engine** — code / shader / VFX, no external asset needed.
- 🆓 **Free pack** — Quaternius / Kenney / CC0 (you download, drop in repo).
- 🤖 **AI-3D** — Meshy/Tripo/Rodin from a concept image (for unique heroes).
- ✍️ **Commission / later** — bespoke art if we want top quality.
- 🎨 **2D art** — portraits / icons / textures.
- 🔊 **Audio** — source (Kenney/freesound) or commission.

## Priority
- **P1** = minimum to rebuild the current slice with real art + the Tend verb.
- **P2** = fills out village, day→dusk, NPC neighbors.
- **P3** = polish / full restoration systems.

---

## ⭐ Phase-1 shopping list (grab these first)
Everything needed to replace today's placeholders and stand up the core loop:
1. 🆓 **Kenney – Nature Kit** (trees, rocks, plants, mushrooms, bridges, fences)
2. 🆓 **Quaternius – Ultimate Nature Pack** (stylized trees/bushes/ferns/flowers/rocks)
3. 🆓 **Quaternius – Ultimate Animated Animals** (fox, rabbit, deer, birds — animated)
4. 🤖/✍️ **Wren the wizard** (player) — one rigged, animated humanoid (see Characters)
5. 🔊 **Kenney – audio packs** (impact/interface/nature SFX) + one ambient forest loop

That set alone gets us from "capsules" to a real, playable, good-looking slice.

---

## 1. Characters (rigged + animated) — the big-ticket items
| Asset | Anims needed | Source | Prio |
|---|---|---|---|
| **Wren (player wizard)** | idle, walk, run, **cast/tend gesture**, sit | 🤖 AI-3D from a concept, OR a humanoid base + Mixamo anims (free), OR ✍️ | P1 |
| **Forest-folk neighbors ×3–5** | idle, walk, talk gesture | 🤖 / ✍️ (share one rig, reskin) | P2 |
| **Fox / Rabbit / Deer** | idle, walk, (Deer) run | 🆓 Quaternius Animated Animals | P1 |
| **Birds, squirrel, hedgehog, frog** | idle, hop/fly | 🆓 Quaternius / Kenney | P2 |
| **Nature-spirits (fairies)** | float (VFX-driven) | 🛠️ mostly VFX + a tiny glowing mesh | P2 |

> Note: characters are the one category free packs cover *weakly* (esp. a
> robed wizard). Realistic plan: **AI-3D the wizard + hero neighbors**, use
> **Mixamo** (free) for humanoid animations, retarget in Godot.

## 2. Environment — Nature (mostly 🆓 free packs)
| Asset | Source | Prio |
|---|---|---|
| Trees — several species/sizes + big "hero" trees | 🆓 Kenney Nature / Quaternius | P1 |
| **Withered/dead tree + stump + fallen log** (for Tend/restoration) | 🆓 (or 🛠️ shader-desaturate a live tree) | P1 |
| Bushes, ferns, reeds, tall grass tufts | 🆓 | P1 |
| Flowers (varied colors), clover, lily pads | 🆓 | P1 |
| Toadstools / mushrooms (incl. the red-cap Ghibli staple) | 🆓 | P1 |
| Rocks / boulders / pebbles / mossy rocks | 🆓 | P1 |
| Ground textures: grass, dirt path, moss, streambed, **grey "withered" variant** | 🎨 CC0 (ambientCG/Poly Haven) or 🛠️ flat + shader | P1 |
| Stream + pond water | 🛠️ water shader | P1 |

## 3. Environment — Village & architecture
| Asset | Source | Prio |
|---|---|---|
| **Wren's cottage** (signature hero building) | 🤖 AI-3D / ✍️ (custom look) | P1 |
| Stilted treehouses ×2–4 + a tower | 🆓 Kenney Survival + 🤖 for whimsy | P2 |
| Rope bridges, plank walkways, docks, stairs, ladders | 🆓 Kenney | P2 |
| **Lanterns / lamp-posts** (dusk lighting) | 🆓 | P2 |
| Fences, gates, signposts, well, birdbath | 🆓 | P2 |
| Market stalls, carts, benches, planters, laundry lines, bunting (img 5 charm) | 🆓 | P3 |

## 4. Props & interactables (for the verbs)
| Asset | Source | Prio |
|---|---|---|
| **The staff** (held, glowing tip) | 🤖/✍️ or 🛠️ simple mesh | P1 |
| Mend targets: thorn, fallen branch, collapsed-bank marker, tangle | 🆓 / 🛠️ | P1 |
| Tend target: "withered patch" state → bloomed state | 🛠️ shader vitality + VFX | P1 |
| Interaction highlight (soft ring/glow under target) | 🛠️ VFX | P1 |

## 5. VFX — 🛠️ all built in-engine (no external assets)
Staff glow · cast/tend **bloom burst** · Mend **heart-glow** · collectible/mote
glints · fireflies · green fairy motes · dust motes in light shafts · water
sparkle · chimney smoke · lantern glow · **dusk god-rays** · magic ripple on
tend. *(Only need small radial-gradient sprite textures, which I generate.)*

## 6. Shaders & materials — 🛠️ built in-engine
**Cel/toon shader** (banded ramp + rim + optional outline) · water shader ·
**foliage wind-sway** · **vitality/bloom shader** (withered↔alive without
duplicate meshes) · day→dusk **sky gradient** + fog/light lerp.

## 7. UI / UX
| Asset | Source | Prio |
|---|---|---|
| Interaction prompt, minimal HUD | 🛠️ | P1 |
| **Dialogue box + speaker portraits** (per NPC) | 🛠️ box + 🎨 portraits | P2 |
| "Glade vitality" indicator (restoration progress) | 🛠️ + maybe 🎨 icon | P2 |
| Small icon set (Mend / Tend / prompts) | 🎨 (Kenney UI packs are 🆓) | P2 |
| Storybook **font** | 🆓 (Google Fonts / CC) | P1 |
| Pause/settings, title screen, day indicator | 🛠️ + 🎨 title art | P3 |

## 8. Audio — 🔊 source or commission (can't author)
| Asset | Source | Prio |
|---|---|---|
| Ambience: forest day loop, dusk/evening loop, stream, wind, birds | 🔊 Kenney/freesound CC0 / ✍️ | P1–P2 |
| Music: gentle day theme + dusk theme | ✍️ composer / 🔊 CC | P2 |
| SFX: footsteps (grass/wood/water), staff cast, **tend bloom chime**, Mend chime, mote pickup, lantern light, UI blips, water splash | 🔊 Kenney / freesound | P1 |

## 9. Sky / lighting / environment
| Asset | Source | Prio |
|---|---|---|
| Day→dusk gradient sky | 🛠️ procedural | P1 |
| Optional HDRIs (day/dusk/night) for richer light | 🎨 Poly Haven CC0 | P3 |
| Distant misty tree-line / hills backdrop | 🛠️ (already have) | P1 |

---

## Realistic sourcing summary
- **~70% of the world is free** (Quaternius/Kenney/CC0): all nature, most
  village pieces, SFX, UI icons, fonts.
- **The unique heroes need AI-3D or commission**: **Wren**, the **cottage**,
  the signature **staff**, and the **neighbor characters** — because free
  packs don't have a cohesive robed-wizard cast.
- **Everything glowing/atmospheric is 🛠️ mine**: shaders, all VFX, the day
  cycle, the vitality/bloom system, water, UI logic.
- **Music** is the one thing worth eventually commissioning — it carries the
  cozy feeling more than any single asset.
