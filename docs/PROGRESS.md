# Progress

**Current phase:** Phase 8 — Chapter 2: The River Remembers (design agreed, `docs/CHAPTER_2.md`). Milestone 2.1 (Upriver) ✅ done; 2.2 (Home, Changed) next. See `docs/CHAPTER_1.md`.
**MVP:** ✅ complete (phases 0–6); Chapter 0 is live.
**Live site:** https://legacyofwhiterajah.netlify.app
**Repository:** https://github.com/joe5408-sys/paladin-legacy-of-the-white-rajah (public, `master`; Netlify auto-deploys on push)
**Last updated:** 2026-10-26

### Phase 8 — Chapter 2, Milestone 2.1: Upriver (2026-10-26) ✅
- **Design:** `docs/CHAPTER_2.md` agreed with its default choices: River Ward, Daniel as a story ally, a redeemable Julian Pell, real place names allowed, five milestones.
- **Chapter hand-off:** the Chapter 1 Complete card now offers **Continue to Chapter 2** (its default choice), which downloads Chapter 2 on demand and shows the title card "Chapter 2 · The River Remembers". The chapter-start code is now shared (`startChapter(1 | 2)`), and the loader, quests, saves and title screen know about Chapter 2.
- **Express boat scene** (`src/chapters/chapter2/Boat.tsx` + `boatData.ts`, lazy-loaded): a white-and-blue express boat with cabin, rails, bench, cargo and engine housing on the brown Rajang. The jungle bank, longhouses on stilts and river foam drift past to suggest travel, and two foam lines trail behind the stern. New engine-and-river ambience.
- **New characters:** Captain Ah Hock, a university student and an auntie with rambutans.
- **Story:** four objectives in a fixed order (Mara → the news on the student's phone → the captain → the cabin), ending at the Sungai Awan jetty with fresh survey pegs on the bank → "To Be Continued".
- **Test results:** `npm test` 161/161. The new `chapter2.test.ts` (6 tests) covers lazy loading, the hand-off from Chapter 1, the boat conversations and their locks, saves, and a save claiming the boat too early. The shared layout, spawn and dialogue checks now include the boat. `npm run e2e` 3/3: the full-story test continues from Chapter 1 Complete into Chapter 2, checks its files download only then, and plays 2.1 to the card (2.4 min for the whole game). Visual check by screenshots: removed fog that washed the scene out, brought the far bank into view, and replaced a slab-like wake with foam lines.
- **Live:** deployed as `b0ced46`; `E2E_BASE_URL=https://legacyofwhiterajah.netlify.app npx playwright test` 3/3 against the live site (2.5 min).

### Phase 7 — Chapter 1, Milestone 1.4: The Redacted Name (2026-10-26) ✅ Chapter 1 complete
- The vault's inner gate now leads on (no ending): **the sealed records** (`src/chapters/chapter1/Records.tsx` + `recordsData.ts`, lazy-loaded), a low room of wooden floorboards, hanging bulbs, shelves of stencilled tin record boxes, a reading table with the VALE box, and a rusted flood door. Saves from the old 1.3 cliffhanger get "Enter Sealed Records" at the open gate.
- **The reveal:** the VALE box (lid opens, wax seal breaks) holds the river-lands timber concession, Harrow's half-share, and the one unredacted charge sheet naming **Elias Vale**. The Private Office shelf holds the Rajah's misfiled reply refusing to sign. All names, companies and documents are fictional; the Rajah is never named.
- **The confrontation:** reading the letter runs straight into Harrow's arrival. **New characters:** Lord Chamberlain Edmund Harrow (silver hair, dark morning coat, gold chain of office) and two Royal Security officers, who appear in the room and block the way back. The medallion flares and the lights fade out: only the Archivist's lantern by the now-open flood door and the officers' torchlight from the vault remain. Harrow and Daniel have short lines in the dark.
- **Ending:** the Archivist reveals she knew Elias's name all along; Daniel stays behind; Mara waits in a sampan → **Chapter 1 Complete** card ("Keep the sign safe until the Crown deserves it again"), pointing to Chapter 2. On this card Main Menu is the default choice, so a stray key press can't start a new game. The title screen's Continue hint reads "Chapter 1 complete".
- New ambience for the records room. People only count as obstacles while they are in the room (colliders follow story flags).
- **Test results:** `npm test` 151/151 (8 new: the full 1.4 flow, who stands in the room when, old-save migration, a save taken in the dark, and the Chapter 1 Complete save; the spawn and reachability checks cover the new room and caught a spawn point sitting on the exit prompt). `npm run e2e` 3/3: the full-story test now plays **the whole game**, Chapter 0 through Chapter 1 Complete, with real input (2.1 min). Visual check by screenshots: fixed box labels glowing in the dark and Harrow facing away from Adrian.
- **Live:** deployed as `586b4d4`; `E2E_BASE_URL=https://legacyofwhiterajah.netlify.app npx playwright test` 3/3 against the live site (the whole game in 2.1 min).

### Phase 7 — Chapter 1, Milestone 1.3: The Hollow Sentinel (2026-10-26) ✅
- The iron door now opens (no ending): **the vault** (`src/chapters/chapter1/Vault.tsx` + `vaultData.ts`, lazy-loaded), a narrow stone hall with sealed cabinets, flickering oil lamps and a barred inner gate. After the door opens, the Archives offer a plain "Enter Vault"; saves from the old 1.2 cliffhanger continue from there.
- **The Hollow Sentinel** (original pixel art, `src/game/combat/sentinelSprite.ts`): a palace construct of brass and ironwood. It stands dormant before the gate and blocks the way until it falls; afterwards its wreckage lies on the floor.
- **Second battle**, reusing the battle system. Encounters now choose their sprite and backdrop (the vault arena has a cold stone floor and the inner gate behind the enemy). New, data-driven **heavy attack**: every 3rd round the Sentinel charges ("Charging a heavy blow!" in its panel, rears back, pulses white-blue), then strikes for 16. Defend blocks that blow completely ("Blocked!"); Defend still halves normal hits. A first-turn tip explains it, and it shows again after a retry.
- **Balance** (checked by unit tests): HP 42, slash 7. Going all-out and ignoring the wind-up loses (37 damage vs 30 HP); defending whenever it charges wins with about 9 HP left; even plain Attacks win if every heavy blow is defended. The Covenant Guardian is unchanged. No new Paladin skill: the scope rule said only if the fight needed one, and it doesn't.
- Victory → the brass plate from its chest unlocks the inner gate (the bars sink into the floor) → rows of sealed boxes, one marked VALE → "To Be Continued". The chapter end moved to `c1_inner_gate_open`. New vault ambience (low drone, dripping water).
- **Test results:** `npm test` 143/143 (new `sentinel.test.ts` for the battle rules and balance; `chapter1.test.ts` covers the vault flow, the battle, defeat and retry, the Sentinel's collider, and old-save migration and save validation for the vault). `npm run e2e` 3/3: the full-story test now also walks into the vault, wins the Sentinel fight by defending its heavy blows, and opens the gate (1.8 min). I checked the vault and battle visually with screenshots: brightened the hall, moved the lamps out of the cabinets, removed a jagged wall shadow, and made the gate bars sink into the floor instead of rising through the ceiling.
- **Live:** deployed as `fb2669a`; `E2E_BASE_URL=https://legacyofwhiterajah.netlify.app npx playwright test` 3/3 against the live site (full story 1.9 min).

### Phase 7 — Chapter 1, Milestone 1.2: The Royal Archives (2026-10-26) ✅
- The Archives door no longer ends the chapter: a night passes ("Aunt Mara snores, gently") and the doors open at dawn. Dialogue can now move the player to another scene when it ends (`enterScene`).
- **Royal Archives interior** (`src/chapters/chapter1/Archives.tsx` + `archivesData.ts`, lazy-loaded): a checkered floor; four themed bookcases plus back-wall stacks; high windows with dawn light shafts; the Archivist's desk with a green lamp; and a riveted iron door bearing the Paladin sign, which glows faintly once the file is found and blazes when it wakes.
- **New character:** the Archivist (grey bun, glasses, olive cardigan). Daniel guards the entrance.
- **Investigation (4 new objectives):** Treason Proceedings (a gap under V) → ask the Archivist (embarrassments were filed with the household accounts) → Household Ledgers (the redacted file: Lord Chamberlain R. Harrow's order under the royal seal, with the Rajah's signature line blank) → the iron door wakes → "To Be Continued". Optional lore on the Land Grants shelf.
- **Saves and migration:** after dawn the waterfront door becomes a plain "Enter Royal Archives". Saves from the old 1.1 cliffhanger now continue into the Archives instead of the ending card. The chapter end moved to `c1_vault_found`.
- New ambience: a hushed hall with a slow clock tick.
- **Test results:** `npm test` 123/123 (6 new, including the full 1.2 flow and old-save migration; the reachability and spawn checks now cover the Archives too). `npm run e2e` 3/3: the full-story test now plays Chapter 0 → waterfront → the whole Archives investigation → "To Be Continued" with real input (1.3 min). I checked the Archives visually with screenshots and added a front fill light so the book spines read clearly.

### Phase 7 — Chapter 1, Milestone 1.1: Arrival in Kuching (2026-10-26) ✅
- **Chapter system:** chapter content is **lazy-loaded** (`src/chapters/loader.ts`), so Chapter 1's dialogue and 3D scene are separate downloads (about 4 KB gzip) fetched only when the player reaches Chapter 1 or continues a Chapter 1 save.
  - Registries for dialogue, layouts and objectives (`registerDialogues`, `registerLayout`, `registerObjectives`).
  - Chapter-aware objectives (`objectivesFor`), save validation, title "Continue" hint and closing cards.
- **Chapter 0 → 1:** the Chapter 0 card now offers **Continue to Chapter 1** (keeps story flags and play time). A full-screen chapter title card follows ("Chapter 1 · The Capital's Shadow").
- **Kuching waterfront** (`src/chapters/chapter1/`): dusk lighting; a row of four shophouses; the columned Royal Archives; the river boardwalk with a ferry pier and moored boat; the Palace and old fort lit across the river; Kak Jamilah's kolo mee stall; a bandstand; lamps and palms.
  - NPCs: Daniel (pier), Aunt Mara (bench) and Kak Jamilah (new character).
  - Objectives: Meet Daniel → Go to the Royal Archives → **To Be Continued** card (saved, and reopens on Continue).
  - New ambience: evening river with night insects.
- **Automated browser tests (Playwright)**, run in the locally installed **Edge** (no browser download), against the production build:
  - `npm run e2e` builds and runs them. `E2E_BASE_URL=https://legacyofwhiterajah.netlify.app npx playwright test` tests the live site.
  - `smoke.spec.ts`: title, settings, New Game, walk into the house, autosave, pause, Save, return to the title, refresh, Continue; corrupt save.
  - `full-story.spec.ts`: **plays all of Chapter 0 and Chapter 1 milestone 1.1 with real keyboard input**, and checks that Chapter 1 isn't downloaded before it's reached.
- **Live:** deployed with commit `401eeeb`. The full Playwright suite also passed **against the live site** (3/3, full-story run 1.0 min).
- **Test results:** `npm test` 117/117 (12 new). `npx playwright test` 3/3 passed against the production build (the full-story run takes about 58 s). The build splits Chapter 1 into its own files. I also checked the waterfront visually with Playwright screenshots and fixed three things: the Palace was out of view, the boat was facing the wrong way, and the south edge was empty.

### Post-launch: sword combat visuals (2026-10-26) ✅
Playtest feedback said attacks showed no sword action. In battle, Adrian now holds the **blade of light** the heirloom forms.
- **New 40×32 battle poses** (`src/game/combat/heroBattleSprite.ts`, original pixel art): ready (two breathing frames), wind-up (blade drawn back over the shoulder) and strike (arm and blade thrust forward). Victory raises the blade.
- **Attack timeline:** wind-up and pull back → dash in → strike lands at 0.2 s → **hit-stop** (both sides freeze 0.1 s) → step back. Sound and damage numbers stay in sync.
- **Slash trail:** a white arc sweeps across the Guardian on Attack. Radiant Strike gets a bigger golden double arc on top of the existing burst. The blade also casts a soft glow that flares on each strike.
- **Unchanged:** battle rules and numbers, and exploration (Adrian is unarmed outside battle).
- **Verified in the browser** by freezing frames at impact for both Attack and Radiant Strike, plus the wind-up pose. 105/105 tests pass; the build succeeds.

### Deployment verification (2026-10-26, live site) ✅
- HTTP 200. The JS and CSS files are byte-identical to the local production build (same content hashes). Hashed assets are served with `max-age=31536000, immutable`; the favicon loads.
- **The full prologue was played on the live site:**
  - New Game → opening narration → walk to the house → home (autosaved) → Aunt Mara → heirloom awakening → hidden passage → chamber → Guardian battle.
  - Pausing mid-battle shows Save greyed out. Resume continued the fight.
  - VICTORY (Guardian 0/24, Adrian 22/30) → back in the chamber, objective "Read the ancestral message" → inscription → Daniel Rengas → **CHAPTER 0 COMPLETE** (automated run 0:55, text skipped instantly).
- **Save/load on the live site:** the completed game was autosaved. After a browser refresh the title showed "Continue · Chapter 0 complete · 0:55"; Continue reopened the completion card, and Main Menu returned to the title.
- **Console:** no errors; only the known harmless `THREE.Clock` deprecation warning from React Three Fiber.
- **Still for a human to check:** sound by ear, and a real-speed play-through to measure true play time (estimate 4–6½ min).

### Phase 6 — Save, menus, audio, deploy prep 🟡
- **Save system** (`src/game/save/save.ts`): localStorage key `paladin.save`, schema v1. It stores scene, position and facing, story flags (quest state is derived from them), play time and prologue completion.
  - Everything loaded is validated: corrupt JSON, other schema versions, unknown scenes, unknown flags, NaN or out-of-bounds positions, positions inside furniture, and scenes the story hasn't unlocked are all rejected or repaired. Nothing throws, even if storage is blocked or full.
  - No mid-battle saves: manual Save works only while exploring, and battle state is never stored.
- **Autosave checkpoints** (`AutoSave.tsx`): on arriving in a scene (after arrival dialogue sets its flags), after beating the Guardian, and at chapter end. A small "✦ Saved" toast shows each time.
- **Title screen:** New Game; Continue only when a valid save exists, showing location and play time; Settings. New Game asks before erasing an existing save. Invalid saves show a warning instead of crashing. A footer states the setting is fiction and alternate history.
- **Pause menu** (Esc): Resume, Save (greyed out with a reason during dialogue or battle), Settings, Return to Main Menu (asks first; Cancel is the default). Pausing freezes movement, dialogue keys and battle pacing.
- **Settings** (persisted separately): text speed (Slow / Normal / Fast / Instant), volume, sound on/off.
- **Chapter complete card:** Play Again and Main Menu.
- **Audio** (`src/game/audio/`): synthesized at runtime with Web Audio, so no files and no licensing.
  - Ambience per scene: river and birds in the village, a warm pad at home, a low drone in the chamber, a heartbeat pulse in battle, plus title and ending pads.
  - SFX for menu moves, dialogue lines, doors, objectives, the heirloom awakening, every battle action, victory, defeat and saving.
  - Starts on the first key or click (browser autoplay rules). `AudioDirector` listens to game state, so gameplay code knows nothing about sound.
- **Robustness:** an error boundary offers "Return to Main Menu" instead of a blank page.
- **Deploy prep:**
  - `netlify.toml`: build `npm run build`, publish `dist`, Node 22, immutable caching for hashed assets, revalidated HTML, basic security headers.
  - SVG favicon, meta description, `<noscript>` message.
  - `.claude/launch.json` gains `paladin-prod` (vite preview on :4173).

**Phase 6 test results (2026-10-26):**
- `npm test`: 105/105 pass, 20 new. They cover save validation and repair, corrupt, incompatible and blocked storage, the save → "refresh" → Continue round trip, completed saves reopening on the ending card, pre-battle checkpoint restore, pause rules and settings validation.
- `npm run build`: OK.
- **Verified in the browser on the production build** (`vite preview`, the same files Netlify would serve):
  - Title with no save (Continue hidden).
  - Settings change saved to storage.
  - New Game: the confirming E didn't skip the first line.
  - Walked into the house: autosave toast, save written.
  - Esc → pause → Save ("Game saved.") → Return to Main Menu → confirm (default Cancel) → title shows Continue with "Vale Family Home · 0:19".
  - **Browser refresh → Continue** restored the home at the exact saved position, with the correct objective and no arrival-scene replay.
  - Corrupted save and incompatible-version save: no crash, Continue hidden, warning shown.
- **Not yet verified in the browser on the production build:**
  - Pausing mid-battle (Save greyed out) and the finished-game save reopening on the ending card. Both pass unit tests.
  - Audio is untested by ear: I can't hear the browser. Needs a quick listen.
  - The automated run stopped because the app window went out of view, which throttles the page to about 1 frame/s.
  - The battle and ending were fully browser-tested in Phases 4–5 on the dev build.
- **Not done:** GitHub push and Netlify deploy (waiting for the owner's go-ahead), and Playwright e2e (not installed, to avoid a large browser download).

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
