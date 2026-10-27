# Session Handoff

## Last session — 2026-10-27 (Claude Code): Chapter 2, Milestones 2.3–2.5 (Chapter 2 complete)
**Result:** 2.3 (The Waystation) is live as `dbcffc7` and 2.4 (The River Charter) as `f1a4b37`. 2.5 (The Iron Warden) finishes Chapter 2: after the Hollow Warden, the race downriver to Sungai Awan at dusk, Julian Pell at Harrow's barge, the two-phase Iron Warden boss, Pell reading the Charter, and Adrian deciding to take it to the Rajah → **Chapter 2 Complete**. 2.5 is **live** as `91e592a`; the browser tests pass 3/3 against the live site, playing the whole game to the Chapter 2 Complete card.

### Key files
- 2.3: `src/chapters/chapter2/{Waystation.tsx,waystationData.ts}`; River Ward in `game/combat/battle.ts`, `data/encounters.ts` (`RIVER_WARD`, `playerStatsFor`), `gameStore.ts` (each battle stores its `player` stats), `BattleHud.tsx`; `clearFlags` on dialogue for the stone reset
- 2.4: `src/chapters/chapter2/{Hall.tsx,hallData.ts}`; the Hollow Warden in `Waystation.tsx`, `waystationData.ts` and `data/encounters.ts`; `getWardenTexture()` in `game/combat/sentinelSprite.ts`
- 2.5: `src/chapters/chapter2/{JettyDusk.tsx,jettyData.ts}`; boss armour in `game/combat/battle.ts` (`armored` state, `armor` on `EncounterDef`; pass the encounter as `playerAction`'s 4th argument); `iron_warden` in `data/encounters.ts`; `game/combat/ironWardenSprite.ts`; the jetty arena, armour popups and flying plates in `BattleArena.tsx`; a `lighting="dusk"` option on `VillageSquare`; a `boss` battle loop in `game/audio/audio.ts`; the Chapter 2 Complete card in `ChapterComplete.tsx`
- Tests: `tests/unit/{waystation,warden,ironWarden}.test.ts`, `chapter2.test.ts`, `tests/e2e/full-story.spec.ts`

### Tests run
`npm test` 224/224 · `npm run e2e` 3/3 (production build, Edge; the whole game to the Chapter 2 Complete card takes 4.8 min, test limit 8 min) · `npx tsc -b` OK.

### Next steps
1. **Chapter 3 design doc** before any code (as with `CHAPTER_1.md` and `CHAPTER_2.md`): Adrian takes the River Charter to the capital and the Rajah. Hooks left open: Julian Pell's doubts (a possible ally), Daniel choosing between his badge and the village, Harrow knowing the Charter exists, the medallion's two arts (Radiant Strike, River Ward). Then `hasChapterAfter(2)` → true and a "Continue to Chapter 3" on the card.
2. A human play-through of Chapter 2 for pacing and difficulty (the boss has only been tuned by strategy tests).
3. Before release, someone from the region could read the Chapter 2 characters and dialogue (see `CHAPTER_2.md`, Cultural notes).
4. The full-story browser test now plays the whole game (about 5 of its 8 minutes). Split it per chapter, with saved games as starting points, before Chapter 3 makes it longer.

### Watch out
- Pushing to `master` deploys to the public site. The owner wants every finished milestone committed, pushed and checked live without asking.
- Source files use Windows line endings (CRLF); scripted find-and-replace must allow for that.
- The Vite dev watcher can miss fast scripted multi-writes; restart `npm run dev` if the browser disagrees with the tests.
- The desktop app's browser pane throttles hidden pages. Prefer Playwright (`npx playwright test`) for real-time checks.
- Windows file names are case-insensitive: don't create `foo.ts` next to `Foo.tsx` in the same folder (data files use names like `jettyData.ts` for this reason).
- e2e routes: wait out the fade-in after entering a scene without an arrival speech before walking, and walk around NPCs, stones and lamp posts (they are solid).
- No Python on this machine; use Node for scripts.
