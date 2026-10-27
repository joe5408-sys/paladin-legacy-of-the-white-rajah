# Session Handoff

## Last session — 2026-10-27 (Claude Code): Chapter 2 finished; Chapter 3 designed; Milestones 3.1–3.2
**Result:** Chapter 2 is complete and live (2.5 as `91e592a`). `docs/CHAPTER_3.md` ("The Crown's Word") was drafted and **agreed with all its default decisions**. Milestone 3.1 (The Long Way Down) is built: the Chapter 2 card continues into Chapter 3, the night express boat down the Rajang, Pell aboard, Adrian in the news as a wanted man, Daniel's call about the Petition Hour, Kuching before dawn → "To Be Continued". 3.1 is **live** as `04646ca`. Milestone 3.2 (A Wanted Man) adds **dialogue choices** (new system 1), the waterfront before dawn, Kak Jamilah's room, the Archivist's note, Pell's choice to sponsor the petition and Daniel's plan → "To Be Continued". 3.2 is **live** as `b4387c1`; the browser tests pass 4/4 against the live site.

### Key files
- 2.5: `src/chapters/chapter2/{JettyDusk.tsx,jettyData.ts}`; boss armour in `game/combat/battle.ts` (`armored`, `armor` on `EncounterDef`; pass the encounter as `playerAction`'s 4th argument); `game/combat/ironWardenSprite.ts`; `lighting="dusk"` on `VillageSquare`
- 3.1: `src/chapters/chapter3/{content.ts,BoatNight.tsx,boatNightData.ts}`; `BoatScene` (layout + `time="night"`) exported from `src/chapters/chapter2/Boat.tsx`; `CHAPTER3_MAX_HP` in `data/encounters.ts`; Chapter 3 in `chapters/loader.ts`, `quests.ts`, `gameStore.ts` (`CHAPTER_STARTS[3]`), `save.ts`, `ChapterComplete.tsx`, `TitleScreen.tsx`; a `boat_night` ambience in `game/audio/audio.ts`
- 3.2: dialogue choices in `game/dialogue/types.ts` (`DialogueChoice`), `game/dialogue/rules.ts` (`availableChoices`), `game/core/gameStore.ts` (`choicesOnScreen`, `moveChoice`, `chooseOption`; `pressAction` routes ↑/↓/W/S and E/Enter while replies are on screen) and `game/ui/DialogueBox.tsx` (+ `.dialogue-choices` CSS); `src/chapters/chapter3/{kuchingData.ts,WaterfrontNight.tsx,JamilahRoom.tsx}`; `WaterfrontScene` exported from `src/chapters/chapter1/Waterfront.tsx`
- Tests: `tests/unit/{ironWarden,chapter3}.test.ts`; `tests/e2e/full-story.spec.ts` (Chapters 0–2) and **`tests/e2e/chapter3.spec.ts`** (starts from a saved game on the Chapter 2 Complete card)

### Tests run
`npm test` 249/249 · `npm run e2e` 4/4 (production build, Edge; full story 4.8 min, Chapter 3 test 39 s) · `npx tsc -b` OK.

### Next steps
1. **Milestone 3.3 — The Palace Gate** (see `docs/CHAPTER_3.md`): morning at the Palace forecourt across the river (`palace_gate`, a new scene: gates, gardens, a queue of petitioners with small human requests, ceremonial guards); Royal Security turn Adrian away despite the sealed petition; Daniel faces his former partner; Harrow wakes the **Crowned Sentinel** (Paladin-built in the 1890s, royal seal riveted over their sign; gold and ivory, crowned helm; a new sprite). First fight: heavy blows that Defend blocks, River Ward when hurt, about Hollow Warden difficulty, and it **withdraws** at low HP (the first, gentle use of new system 2, a `yieldAt` HP on an encounter that ends the battle in victory with its own text). The petitioners hold the gate open → next milestone. Pell's reply flags (`c3_reason_*`) are there for later callbacks.
2. Later Chapter 3 milestones should get their own browser tests that start from saved games, like `chapter3.spec.ts`.
3. A human play-through of Chapters 2–3 for pacing and difficulty.

### Watch out
- Pushing to `master` deploys to the public site. The owner wants every finished milestone committed, pushed and checked live without asking.
- Source files use Windows line endings (CRLF). For scripted multi-line edits, write a Node script to a file (long inline heredocs have broken the shell here) and normalise line endings in it.
- The "every interactable can be reached on foot" unit test tries four straight approaches and fails if a start point even touches a collider; place NPCs with a clear lane on at least one side.
- The Vite dev watcher can miss fast scripted multi-writes; restart `npm run dev` if the browser disagrees with the tests.
- The desktop app's browser pane throttles hidden pages. Prefer Playwright (`npx playwright test`) for real-time checks.
- Windows file names are case-insensitive: don't create `foo.ts` next to `Foo.tsx` in the same folder.
- e2e routes: wait out the fade-in after entering a scene without an arrival speech before walking, and walk around NPCs, stones and lamp posts (they are solid).
- No Python on this machine; use Node for scripts.
