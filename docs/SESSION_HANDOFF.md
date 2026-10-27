# Session Handoff

## Last session — 2026-10-27 (Claude Code): Chapter 2 finished; Chapter 3 designed; Milestone 3.1
**Result:** Chapter 2 is complete and live (2.5 as `91e592a`). `docs/CHAPTER_3.md` ("The Crown's Word") was drafted and **agreed with all its default decisions**. Milestone 3.1 (The Long Way Down) is built: the Chapter 2 card continues into Chapter 3, the night express boat down the Rajang, Pell aboard, Adrian in the news as a wanted man, Daniel's call about the Petition Hour, Kuching before dawn → "To Be Continued". Not yet checked on the live site.

### Key files
- 2.5: `src/chapters/chapter2/{JettyDusk.tsx,jettyData.ts}`; boss armour in `game/combat/battle.ts` (`armored`, `armor` on `EncounterDef`; pass the encounter as `playerAction`'s 4th argument); `game/combat/ironWardenSprite.ts`; `lighting="dusk"` on `VillageSquare`
- 3.1: `src/chapters/chapter3/{content.ts,BoatNight.tsx,boatNightData.ts}`; `BoatScene` (layout + `time="night"`) exported from `src/chapters/chapter2/Boat.tsx`; `CHAPTER3_MAX_HP` in `data/encounters.ts`; Chapter 3 in `chapters/loader.ts`, `quests.ts`, `gameStore.ts` (`CHAPTER_STARTS[3]`), `save.ts`, `ChapterComplete.tsx`, `TitleScreen.tsx`; a `boat_night` ambience in `game/audio/audio.ts`
- Tests: `tests/unit/{ironWarden,chapter3}.test.ts`; `tests/e2e/full-story.spec.ts` (Chapters 0–2) and **`tests/e2e/chapter3.spec.ts`** (starts from a saved game on the Chapter 2 Complete card)

### Tests run
`npm test` 235/235 · `npm run e2e` 4/4 (production build, Edge; full story 4.8 min, Chapter 3 test 19 s) · `npx tsc -b` OK.

### Next steps
1. **Milestone 3.2 — A Wanted Man** (see `docs/CHAPTER_3.md`): the Kuching waterfront at night (`waterfront_night`, a variant of the 1.1 waterfront: wanted posters, Royal Security on the pier, shutters down), Kak Jamilah's room above her stall (a new small interior), the Archivist's note about the Petition Hour, and **Pell's choice** to sponsor the petition. This brings in **new system 1, dialogue choices**: a `choices` list on a dialogue line (label, next conversation, optional `requires`), chosen with ↑/↓ + E or the mouse. In 3.2 every reply leads to Pell signing; the real use is presenting evidence in 3.4.
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
