# PALADIN: LEGACY OF THE WHITE RAJAH — MASTER DEVELOPMENT PROMPT v3.0
Small HD-2D RPG | Alternate-History Sarawak | Incremental Development

## 1. Mission
Act as lead developer and technical director with combined expertise in: senior TypeScript game development; Three.js / React Three Fiber; HD-2D technical art; pixel-art character animation; RPG systems design; narrative and dialogue design; Sarawak cultural and historical research; game UI/UX; software testing; Git and Netlify deployment.

Build a small, functional, expandable browser RPG: **PALADIN: LEGACY OF THE WHITE RAJAH**.
The immediate objective is a complete, playable **5–10 minute prologue**. Do not build an open-world RPG. Do not implement every system at once. A complete small game beats a large incomplete one. The project must stay maintainable across multiple Claude Code, Codex and Antigravity sessions.

## 2. Game identity
- **Genre:** story-driven HD-2D fantasy RPG.
- **Setting:** an alternate modern-day Sarawak where the Brooke dynasty survived as a constitutional monarchy, with modern technology, contemporary communities, historical architecture and a forgotten supernatural Paladin order.
- **Central theme:** *The Crown remembers its heroes. History remembers its traitors. But who decides which is which?*
- **Premise:** for generations an ancient Paladin family protected Sarawak's monarchy. The family was accused of betraying the Crown and erased from official royal records. Decades later a young descendant finds an ancestral heirloom that awakens dormant Paladin powers, and starts investigating why. Chapter 1 introduces the mystery without resolving it.
- **Tone:** fantasy adventure, family mystery, political intrigue, Sarawakian identity, occasional humour, emotional storytelling. Avoid overly complicated lore in the first chapter.

## 3. Art direction (authoritative)
**HD-2D:** a real 3D environment with 2D pixel-art character sprites. It should resemble the general HD-2D approach without copying proprietary artwork. Required: 3D terrain and buildings; 2D character sprites; elevated three-quarter camera; depth-aware sprite rendering; basic environmental shadows; atmospheric lighting; pixel-art-inspired dialogue and UI; consistent proportions. The environment must use real 3D geometry, not one flat background image.

**Simplicity:** low-poly environments; buildings from modular geometric parts; simple placeholder sprites at first; no expensive volumetric lighting, heavy post-processing or photorealistic assets.

**Resolution:** 16:9. 320×180 pixel-art reference grid; scalable canvas; pixelated sprite textures; crisp nearest-neighbour sampling; readable high-resolution UI. Don't force 3D to 320×180 if it hurts clarity.

**Camera:** fixed elevated, orthographic, ~40–45° downward pitch, fixed rotation, smooth player tracking, no manual rotation in the MVP. Keep characters readable and interaction zones obvious.

**Sprites:** idle and walk animations; four facings (N/S/E/W); mirroring is OK where it looks right. Don't require elaborate sheets before movement works. Sprite planes must depth-test correctly and face the camera without unintended rotation or floating.

## 4. World and history
A fictional Sarawak with a Brooke constitutional monarchy alongside modern government: roads, smartphones, hospitals, schools, commercial centres, royal institutions, contemporary civilian life. Ancient Paladin history lies beneath. Clearly separate this fictional constitutional history from real Malaysian and Sarawakian history.
**Cultural requirements:** represent Sarawak's multicultural society respectfully; don't invent sacred traditions and present them as authentic; never associate supernatural corruption with a real ethnic or religious group; use original mythology for the Paladin order; for the MVP, prefer recognisable environmental details over comprehensive cultural representation.

## 5. MVP world
Location: **Sungai Awan**, a fictional riverside settlement near Kapit.
- **Area A — Village Square:** small riverside path; 2–3 background buildings; family residence; one speaking NPC; decorations; exit toward the family home.
- **Area B — Ancestral Home:** small interior with a wooden floor, furniture, family portrait, locked chest or heirloom pedestal, elderly relative, interactive heirloom.
- **Area C — Ancient Chamber:** small battle environment with a stone floor, ancient Paladin insignia, the Guardian enemy and simple atmospheric lighting.
No explorable forest, large town or extra regions. Use scene transitions.

## 6. Prologue story — Chapter 0: The Forgotten Heir
- **Protagonist:** Adrian Vale (working name), 24, returning after a message from an elderly relative; knows little of the family's ancestry. No character customisation.
- **Aunt Mara:** elderly relative and keeper of secrets; introduces family history, points to the heirloom, reveals the forgotten Paladin order.
- **Daniel Rengas:** royal security officer; appears at the end; warns the awakening was detected.
- **The Covenant Guardian:** supernatural entity bound to the ancestral chamber; first enemy and combat tutorial; guards a hidden historical message. It may speak, or communicate through short text prompts.

**Scenes:**
1. *Arrival:* opening dialogue (returned after many years); player gets control. Objective: "Find the ancestral family home."
2. *The Family Secret:* enter the house; Aunt Mara reveals the family served the White Rajah and was accused of treason; directs the player to the heirloom.
3. *The Awakening:* interact with the heirloom; magical reaction; ancient symbol revealed; hidden passage opens.
4. *First Battle:* enter the chamber; the Guardian appears; transition to turn-based combat with a short tutorial.
5. *Revelation:* after victory: **"The oath was never sworn to the Crown alone."** Evidence that the "betrayal" meant protecting the people rather than obeying a royal command.
6. *Royal Attention:* Daniel Rengas arrives or calls; the awakening was detected; the player is pointed toward Kuching. Display **CHAPTER 0 COMPLETE**. The next chapter stays locked.

## 7. Player movement
WASD and arrows; four-direction facing; smooth, consistent, delta-time movement; collision with buildings and walls; E to interact; fixed camera follow. Normalise diagonals if allowed (prefer four-direction movement). No jumping, climbing, swimming, vehicles or complex physics. The player must stay on walkable surfaces.

## 8. Interaction system
Reusable component. Types: Talk, Inspect, Collect, Activate, Enter area. Show a prompt in range (e.g. `[E] Talk to Aunt Mara`). Interaction works only within a defined distance, with no pixel-perfect positioning.

## 9. Dialogue system
Reusable RPG dialogue UI: speaker name, text, continue indicator, multiple lines, keyboard control, completion callback. Data-driven: no dialogue text hard-coded in 3D scene components. Branching is not needed in the MVP but can be added later. Dialogue is original and concise.

## 10. Quest system
Minimal linear state machine. Objectives: 1) find the family home; 2) speak with Aunt Mara; 3) inspect the heirloom; 4) enter the ancient chamber; 5) defeat the Guardian; 6) read the ancestral message. Show the active objective on screen; update automatically. No side quests, reputation, branches, factions or complex journals, but design so these can be added later.

## 11. Hybrid combat
Exploration is real-time movement in the HD-2D world. **Battle** is a separate turn-based encounter in a small 3D arena (it can reuse the environment system with different camera framing). Display the player and enemy sprites, HP, commands, messages and simple attack animations. No real-time sword combat.
**Commands:** Attack, Skill, Defend (future: Item, Equipment, Party). Don't show unavailable commands as working.
**Rules:** alternate turns; the player goes first in the tutorial; one action per turn; the enemy makes a simple attack; the battle ends at 0 HP. Deterministic, configurable damage.
**Starting balance:** Player HP 30; Guardian HP 24; Attack 6; Radiant Strike 10; Guardian attack 4; Defend halves the next incoming hit.
**Radiant Strike:** a magical sword attack, up to 2 uses per battle. No mana, skill trees, elements or complex status effects.
**Victory:** stop enemy actions, show a victory message, fire the story event, return to exploration/story.
**Defeat:** show a defeat screen with Retry Battle; restart with the initial HP and charges. Defeat must never permanently block the prologue.

## 12. Interface
- **Exploration HUD:** current objective, interaction prompt, optional location label. Keep it minimal.
- **Dialogue:** classic bottom-of-screen box.
- **Battle:** player HP, enemy HP, commands, messages.
- **Main menu:** New Game, Continue (only when a valid save exists), Settings.
- **Pause menu:** Resume, Save, Return to Main Menu.
All visible buttons must work.

## 13. Save system
localStorage. Save: schema version, current scene, player position, quest state, story flags, prologue completion. Don't save mid-battle state; a save before battle restores to the pre-battle checkpoint. Validate data; handle missing, invalid or incompatible saves without crashing. New Game resets progress after confirmation.

## 14. Technical stack
TypeScript, Vite, React, Three.js, React Three Fiber, Drei, Zustand, Vitest, Playwright. React for menus/UI; R3F for the 3D world. Data-driven dialogue, quests, characters, items and encounters. No physics engine unless simple collision proves insufficient.

## 15. Project structure
```
src/ app/ game/{core,scenes,player,camera,interaction,dialogue,quests,combat,save,ui} data/
     assets/{sprites,models,textures,audio} styles/
tests/{unit,integration,e2e}
docs/ MASTER_PROMPT.md GAME_DESIGN.md ARCHITECTURE.md ROADMAP.md PROGRESS.md SESSION_HANDOFF.md ASSET_REGISTER.md
```
No unnecessary abstraction layers; prefer small, understandable modules.

## 16. Asset strategy
- **Stage 1 (placeholders):** coloured geometric buildings, simple floors, placeholder sprites, basic UI panels, primitive battle arena.
- **Stage 2 (HD-2D identity):** original pixel-art sprites, stylised wooden houses, low-poly furniture, tropical foliage, Paladin symbols, atmospheric lighting.
- **Stage 3 (polish):** animations, materials, lighting, magic effects, UI decoration, audio.
Don't delay gameplay for final art. All assets must be original, properly licensed, or explicitly authorised; record third-party licences. Do not copy Pokémon, Octopath Traveler or any other game's sprites, maps, music or UI.

## 17. Performance
Desktop Chrome, Edge, Safari and other modern browsers. 60 FPS on capable laptops; degrade gracefully. MVP limits: one small outdoor area, one small interior, one small arena, few NPCs, one enemy per battle, limited dynamic lights, minimal post-processing. Don't load future chapters at startup. Measure with real browser tools; never claim targets without testing.

## 18. Development phases
- **Phase 0 — Foundation:** inspect repo, initialise, scripts, docs, verify build. *Accept:* launches, builds, no critical startup errors.
- **Phase 1 — HD-2D Exploration:** 3D test environment, 2D player sprite, fixed camera, movement, collision. *Accept:* walk through 3D, facing works, camera follows, collision works.
- **Phase 2 — NPC & Dialogue:** one NPC, prompt, dialogue box, story state. *Accept:* approach NPC and complete a conversation.
- **Phase 3 — Story Objectives:** family home, heirloom, quest progression, scene transition. *Accept:* complete the discovery sequence.
- **Phase 4 — Turn-Based Battle:** scene, commands, HP/damage, Guardian, victory/defeat. *Accept:* win or lose, retry works, victory advances story.
- **Phase 5 — Complete Prologue:** connect scenes, revelation, Daniel Rengas, completion screen, pacing. *Accept:* full prologue in ~5–10 min.
- **Phase 6 — Save & Deployment:** save/load, pause menu, basic audio, polish, regression tests, Netlify. *Accept:* deployed game runs, save/load works, no critical progression bugs.
Do not begin Chapter 1 before Phase 6 is complete.

## 19. MVP acceptance tests
- **Exploration:** moves in four directions; facing changes; camera follows without noticeable jitter; can't pass blocked objects; stays in the map.
- **Interaction:** prompt appears in range and disappears out of range; E activates the intended object; never triggers distant objects.
- **Dialogue:** opens; correct speaker; text advances; closes; story state updates.
- **Quest:** objectives appear in order; completing one advances the next; completed events don't re-trigger; mandatory stages can't be skipped by accident.
- **Combat:** starts from the right story event; Attack lowers enemy HP; Skill applies correct damage; Defend reduces damage; enemy attacks on its turn; victory only at enemy 0 HP; defeat only at player 0 HP; retry resets correctly.
- **Save/load:** persists after refresh; Continue restores the right scene; quest state persists; invalid save doesn't crash.
- **Deployment:** build succeeds; Netlify loads; sprites/models load; transitions work; no critical console errors; full prologue completable on the deployed site.
A successful build alone does not prove gameplay works.

## 20. Netlify deployment
GitHub as source. Build `npm run build`, publish `dist`. Make asset paths work in production. Add redirect rules only if client-side routing is used (avoid routing if a single shell works). Test the deployed site directly; never claim deployment success without verification.

## 21. Session continuity
Maintain `docs/PROGRESS.md` (phase, features, known issues, test status), `docs/SESSION_HANDOFF.md` (last task, files modified, tests run, uncommitted work, next exact task) and `docs/ROADMAP.md` (phases, acceptance, status).
**Session start:** inspect repo → read handoff → check git status → confirm phase → work on one scoped milestone.
**Session end:** run tests → run build → update docs → summarise → identify the next milestone. Never invent test results.

## 22. Multi-agent development
Suggested (flexible): Claude Code handles gameplay, dialogue, quests and battle; Codex handles architecture, tests, refactoring and debugging; Antigravity handles browser inspection, visual testing, UI refinement and deployment verification. Avoid concurrent edits to the same files. Use git commits and documented handoffs.

## 23. Strict scope control
The MVP must NOT include: open-world Sarawak; full Kuching; multiplayer; complex enemy AI; real-time sword combat; character customisation; multiple classes; skill trees; crafting; equipment upgrades; faction reputation; procedural generation; large inventories; voice acting; cinematic cutscenes; complex weather; mobile controls. Every new feature must justify its cost.

## 24. First execution directive (completed 2026-10-23)
Inspect the repo; if empty, initialise Vite + React + TS + R3F. Implement Phase 0 and the smallest functional part of Phase 1. The first deliverable needs: a 3D ground plane; a simple 3D building; a 2D pixel-art placeholder character; WASD movement; four-direction facing; a fixed elevated camera; basic collision; a working dev server; a successful production build. No dialogue, quests or combat in that milestone. Afterwards: run tests and the build, record real results, update progress docs, explain how to run, and name the next small milestone.
