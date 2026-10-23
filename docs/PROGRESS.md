# Progress

**Current phase:** Phase 5 — Complete Prologue ✅ done → Phase 6 (Save & Deployment) next
**Last updated:** 2026-10-23

### Phase 5 — Complete prologue ✅
- **Scene 5, Revelation:** after the Guardian falls, abstract glowing script fades in on the chamber's back wall. "Inspect Glowing Inscription" plays the message:
  - The required line appears exactly, in a centred gold inscription style: **"The oath was never sworn to the Crown alone."**
  - It continues: the Vale Paladins refused a palace order to empty the river villages and were branded traitors for standing with the people, signed by Elias Vale (fictional).
  - Sets `read_message`.
- **Scene 6, Royal Attention:** the message chains straight into Daniel Rengas (Royal Security Office, fictional) coming down the stairs. His sprite appears on the first line (an NPC gated by `daniel_arrived`). He explains the old palace sensors detected the awakening, hints that some in the palace doubt the treason story, and points Adrian to **Kuching**.
- **CHAPTER 0 COMPLETE:** the screen fades in with the chapter title, the key quote, the play time, a locked "Chapter 1 · Kuching" notice and **Play Again**, which starts a fresh New Game. All input is frozen in `mode: 'ending'`.
- **Engine additions:**
  - Dialogue `next` (chain conversations) and `endChapter`.
  - Line `style: 'inscription'`.
  - NPC `when` conditions.
  - Store `endChapter()`, `newGame()`, and `startedAt` / `completedAt` for the play-time readout.
- **Pacing pass:**
  - Estimated from the actual dialogue (45 required lines, 575 words, at 200 wpm or typewriter speed plus key presses), walking routes and battle pacing: **about 4:00 rushing through required content, about 6:20 reading everything and exploring.**
  - That sits at the low end of the 5–10 min target. I didn't pad it; a first-time player who reads and looks around should land around 5–6½ minutes. **This needs a real human play-through to confirm.** The end screen shows the measured time.
  - Pacing changes made: the message flows straight into Daniel (no dead walk back), Daniel stands in view during his scene, and arrival points sit away from exits.

**Phase 5 test results (2026-10-23):**
- `npm test`: 85/85 pass, 8 new. One test plays the **entire prologue** from New Game to CHAPTER 0 COMPLETE and checks objectives in order. Others cover inscription gating, the exact required line, Daniel's visibility, chaining, input lock on the ending, and Play Again.
- `npm run build`: OK.
- **Full browser play-through** with keyboard and mouse input, from opening narration to the ending screen: every objective updated in order, the inscription and Daniel rendered, the ending card showed, and Play Again restarted cleanly. No console errors.
- The automated run took 0:50 because it skips text instantly; that's only the mechanical floor.

**Dev-server note:** on this Windows machine Vite's file watcher sometimes missed several quick back-to-back writes to one file (made by a script), so it served stale modules and caused errors that weren't really in the code. If the browser behaves differently from the tests, restart `npm run dev`. The production build is unaffected.

### Phase 4 — Turn-based battle ✅
- **Rules** (`src/game/combat/battle.ts`): pure and deterministic. The player goes first; turns alternate; Attack 6, Radiant Strike 10 (2 charges), Defend halves the next hit; victory at enemy HP 0, defeat at player HP 0. HP never goes below 0. Numbers live in `src/data/encounters.ts`.
- **Store flow:** the `guardian_awaken` dialogue ends with `startBattle`, which switches to `mode: 'battle'`. Stages run intro → command → player_action → enemy_action → command…, then victory or defeat.
  - Victory sets `guardian_defeated`, returns to the chamber (`after_battle` spawn) and plays `guardian_defeated`. The objective becomes "Read the ancestral message."
  - Defeat offers Retry, which fully resets HP and charges. The retried battle is winnable, so defeat can't block the prologue.
  - The Guardian never re-triggers after defeat.
- **Arena** (`BattleArena.tsx`): a close fixed framing of the chamber with Adrian on the left and the Guardian on the right.
  - Adrian lunges on Attack and Skill; the Guardian lunges on its attack.
  - Whoever takes a hit shakes and flashes red.
  - Radiant Strike adds a gold ring burst and a light flash.
  - Defend shows a blue shield until the next hit.
  - Floating damage numbers and "Guard!".
  - On victory the Guardian sinks and fades; on defeat Adrian collapses.
- **Guardian sprite:** original 32×40 stone sentinel drawn in code (`guardianSprite.ts`), with gold eyes and the sword-over-river emblem.
- **Battle HUD** (`BattleHud.tsx`):
  - Enemy and player HP bars, Radiant Strike charge pips and a "Guarding" status.
  - A message log with help text for the highlighted command.
  - Command menu: ↑/↓ or W/S and E/Enter/Space, or mouse. Radiant Strike is greyed out and skipped at 0 charges.
  - A first-turn tutorial tip.
  - A VICTORY banner with Continue, and a DEFEAT panel with Retry Battle.
  - Automatic pacing (~1.1 s per action, which E can skip).

**Phase 4 test results (2026-10-23):**
- `npm test`: 77/77 pass, 17 new, covering every §19 Combat rule plus the in-game flow (start from story event, victory return, no re-trigger, defeat → retry → win).
- `npm run build`: OK.
- Browser play-through:
  - The sign starts the Guardian's speech, then the battle.
  - Radiant Strike showed the burst, "-10" and 14/24.
  - The enemy hit for 4 (26/30). Defend showed the shield, then "guard holds: only 2 damage".
  - The second Radiant Strike left ×0 and greyed out. Attack brought the Guardian to 0/24 → VICTORY → back to the chamber, farewell dialogue, objective "Read the ancestral message."
  - Defeat path: defending repeatedly reached 0/30 → DEFEAT → Retry restored 30/30, 24/24 and ×2.
  - No console errors after a clean reload.

**Balance note:** with the master-prompt starting values, the battle is very forgiving. The Guardian deals 4 a turn against 30 HP, so you only lose by defending about 15 times in a row. Fine for a tutorial; tune in `encounters.ts` if desired.

### Phase 3 — Story objectives ✅
- **Quests:** a linear objective list (`src/data/quests.ts`) derived from story flags (`src/game/quests/quests.ts`). The active objective is the first incomplete one, so there's no quest state to sync, completed steps can't re-trigger, and later flags can't skip earlier objectives. A HUD tracker sits top-right and flashes "New Objective" on change.
- **Flags and conditions** (`src/game/core/flags.ts`): one typed list of flags, plus `requires` / `unless` conditions shared by dialogue rules and interactables.
- **Scenes:** a registry (`src/data/scenes.ts`) with names, spawn points and arrival dialogue. The store handles `requestScene → swapScene → finishTransition` with a 350 ms black fade (`SceneFade`). Input is blocked mid-transition. The HUD location label follows the scene.
- **Shared rig** (`ExplorationRig`): player, NPCs, interactions and camera for any scene. Colliders can depend on flags (the open hatch blocks the hole).
- **Scene 1:** opening narration plays on load (`village_arrival`).
- **Area B (family home):** plank floor, cut-away front wall, back wall with windows and the family portrait (blank nameplate, inspectable), table with teapot and stools, cabinet, bookshelf, plants.
- **Aunt Mara:** a new sprite (white bun, maroon blouse, long skirt) with an intro, a repeat line and a post-awakening line.
- **Heirloom:** a bronze medallion on a pedestal with three interactables gated by story state:
  - Before Mara: inspect → "say hello first".
  - After Mara: Touch → the awakening.
  - After awakening: inspect.
- **Awakening:** individual dialogue lines can set flags, so the medallion flares mid-conversation (pulsing glow, gold light, the sign traced on the floor). The final line opens the floor hatch (dark stairwell, steps, warm light from below).
- **Paladin sign:** an original sword-over-river insignia drawn in code (`insignia.ts`), used on the medallion, the home floor and the chamber.
- **Area C (ancient chamber), minimal:** stone floor, pillars, flickering braziers, a glowing floor sign, a wall relief and stairs back up. The arrival narration sets `entered_chamber`. The Guardian comes in Phase 4.
- Uncle Lim gets a new line after you've been home.

**Phase 3 test results (2026-10-23):**
- `npm test`: 60/60 pass, 23 new. They cover the whole discovery sequence through store actions, objective order and no-skip, transitions, arrival-once, heirloom gating, spawn safety, exit targets, dialogue references, and on-foot reachability of every interactable in all 3 scenes.
- `npm run build`: OK.
- Browser play-through in the pane: opening narration → walk to the house → fade → home arrival (objective: Speak with Aunt Mara) → Mara intro (objective: Inspect the heirloom) → Touch Heirloom (glow and floor sign visible) → passage opens → Enter Hidden Passage → chamber arrival (objective: Defeat the Guardian) → stairs back up → exit to village.
- No console errors after a clean reload.

### Phase 2 — NPC and dialogue ✅
- Zustand store (`src/game/core/gameStore.ts`): mode (`explore` / `dialogue`), story flags, interactable in range, active dialogue. Exposed in dev as `window.__PALADIN_STORE__`.
- Reusable interactions (`src/game/interaction/`): kinds talk / inspect / collect / activate / enter (only talk and inspect do anything yet). Nearest target within its radius wins. Prompt reads `[E] Talk to Uncle Lim`.
- One action-key handler: E interacts while exploring; E / Enter / Space advance dialogue. Held keys (repeat) are ignored, so one press can't both open and skip.
- Data-driven dialogue (`src/data/dialogue.ts`): speaker or narration, a typewriter effect (first press reveals the full line, the next advances), a ▼/■ continue marker, flags set on completion, an optional completion callback.
- Story-state rules choose the conversation (`selectDialogue`): Uncle Lim gives his intro once (sets `met_lim`), then a short repeat line.
- NPC: Uncle Lim, shopkeeper outside the kedai. Generated sprite with his own palette and glasses, idle animation, collider, and he turns to face the player while talking.
- The family home stairs are an "Inspect" point with narration (sets `saw_family_home`). It becomes the door to the interior in Phase 3.
- Player movement is frozen while dialogue is open.
- Character sprite code is shared (`spriteBody.tsx`); palettes live in `src/data/characters.ts`.

**Phase 2 test results (2026-10-23):** `npm test` 37/37 pass; build succeeds. Browser check: prompt hidden at spawn and shown in range; E opens Lim's intro with the correct speaker; typewriter, reveal and advance work through all 5 lines; player can't move during dialogue; `met_lim` is set; the second talk plays the repeat line; Lim turns to face Adrian from the side; family home narration shows no name plate and italic text; no console errors on a clean load.

## Completed

### Phase 0 — Project foundation ✅
- Vite 8 + React 19 + TypeScript + Three.js 0.186 + React Three Fiber 9 + Zustand (installed, not yet used) + Vitest.
- Scripts: `dev`, `build`, `preview`, `test`, `typecheck`.
- `netlify.toml` (build `npm run build`, publish `dist`). Relative asset base (`./`).
- `.claude/launch.json` for the desktop preview pane.

### Phase 1 — HD-2D exploration (first deliverable) ✅
- Real 3D village square (Area A, Sungai Awan): ground, dirt paths, river, plank boardwalk with railing, far riverbank tree line.
- Three low-poly buildings with gabled roofs, doors and lit windows; the Vale family home is on stilts with a veranda and stairs.
- Props: palms, crates, barrel, bench, lamp posts, planters.
- 2D pixel-art placeholder hero (Adrian Vale), drawn in code: 16×24 frames, idle + walk, four facings (west mirrors east), auto outline, nearest-neighbour sampling.
- Upright sprite with 1/cos(pitch) height correction, alpha-tested so depth works against 3D geometry; blob shadow.
- Fixed orthographic camera, 42° pitch, frame-rate-independent smooth follow, constant world height at any window size.
- WASD + arrow keys, four-direction movement (most recently pressed key wins), delta-time movement, stuck-key reset on window blur.
- Collision: circle vs. axis-aligned boxes with per-axis sliding and anti-tunnelling sub-steps; world bounds keep the player off the river.
- Warm directional light with shadows, hemisphere fill, fog.
- Minimal HUD: location label, controls hint. 16:9 letterboxed frame.

## Test status (actual results, 2026-10-23)
- `npm test`: **16/16 passed** (collision, bounds, village layout, input, animation frames).
- `npm run build`: **succeeds** (JS bundle 1.15 MB / 315 kB gzip; mostly three.js).
- Manual browser check (desktop app browser pane, dev server):
  - Moves in all four directions; facing updates to match (checked through the dev-only `window.__PALADIN__` state).
  - Measured speed ≈ 3.2 units/s, matching `PLAYER_SPEED`.
  - Stops against the shop wall (z ≈ 0.21 = wall + radius) and at the south map edge.
  - Bench correctly hides the sprite's legs when the player stands behind it (depth sorting works).
  - No console errors on a clean load.
  - ~144 FPS measured in the pane on the dev machine (display-capped). **Not yet measured on low-end hardware.**

## Known issues / notes
- `THREE.Clock` deprecation warning comes from inside React Three Fiber; harmless.
- Bundle-size warning limit raised to 1.5 MB; code-split when more scenes exist.
- Player sprite is hidden behind palm fronds when directly behind a palm. That is correct depth, but may need fading later.
- The family home stairs are blocked by a collider until the interior scene exists.
- Playwright is not installed yet (deferred so we don't download browsers before e2e tests are needed).
- Not deployed to Netlify yet; no GitHub remote yet.
