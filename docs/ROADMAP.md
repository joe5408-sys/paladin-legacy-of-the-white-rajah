# Roadmap

Goal: a complete, playable 5–10 minute prologue ("Chapter 0: The Forgotten Heir"). No Chapter 1 work until Phase 6 is done.

| Phase | Scope | Acceptance | Status |
|---|---|---|---|
| 0 — Foundation | Vite/React/TS/R3F project, scripts, docs, build | App launches, build succeeds, no critical startup errors | ✅ Done |
| 1 — HD-2D Exploration | 3D test environment, 2D player sprite, fixed camera, movement, collision | Walk through a 3D environment; facing, camera follow and collision work | ✅ Done (village square) |
| 2 — NPC & Dialogue | One NPC, interaction prompt, dialogue box, story state | Approach NPC and complete a conversation | ✅ Done (Uncle Lim) |
| 3 — Story Objectives | Family home interior, heirloom, quest state machine, scene transitions | Discovery sequence can be completed | ✅ Done (plus a minimal chamber room) |
| 4 — Turn-Based Battle | Battle scene, Attack/Skill/Defend, HP, Guardian, win/lose, retry | Win or lose; retry works; victory advances story | ✅ Done |
| 5 — Complete Prologue | Connect scenes, revelation, Daniel Rengas, completion screen, pacing | Full prologue playable in ~5–10 min | ✅ Done (est. 4–6½ min; confirm with a human play-through) |
| 6 — Save & Deployment | localStorage save/load, pause menu, basic audio, polish, regression tests, Netlify | Deployed game runs; save/load works; no critical progression bugs | ✅ Done. Live at https://legacyofwhiterajah.netlify.app, verified end to end |

| 7 — Chapter 1: The Capital's Shadow | Lazy-loaded chapter system; Kuching milestones 1.1–1.4 (see `CHAPTER_1.md`) | Each milestone playable, tested (unit + Playwright) and deployed | ✅ Done (1.1–1.4), live |
| 8 — Chapter 2: The River Remembers (working title) | Five milestones 2.1–2.5, drafted in `CHAPTER_2.md` | Design doc agreed before any code; then each milestone playable, tested and deployed | 🟡 2.1–2.2 done · 2.3 next |

See `MASTER_PROMPT.md` §19 for the detailed pass/fail acceptance tests.
