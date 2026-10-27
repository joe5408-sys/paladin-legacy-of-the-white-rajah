# Session Handoff

## Last session — 2026-10-27 (Claude Code): Chapter 2, Milestones 2.3–2.4
**Result:** 2.3 (The Waystation) is live as `dbcffc7`. 2.4 (The River Charter) is built and tested: through the waystation door to Elias's journal and the River Charter of 1921, Daniel's return with news of Harrow's barge, and the Hollow Warden battle on the landing → "To Be Continued". 2.4 is **live** as `f1a4b37`; the browser tests pass 3/3 against the live site.

### Key files
- 2.3: `src/chapters/chapter2/{Waystation.tsx,waystationData.ts}`; River Ward in `game/combat/battle.ts`, `data/encounters.ts` (`RIVER_WARD`, `playerStatsFor`), `gameStore.ts` (each battle stores its `player` stats), `BattleHud.tsx`; `clearFlags` on dialogue for the stone reset
- 2.4: `src/chapters/chapter2/{Hall.tsx,hallData.ts}`; Warden added to `Waystation.tsx` and `waystationData.ts` (Daniel, the Warden, the door into the hall); `hollow_warden` in `data/encounters.ts`; `getWardenTexture()` in `game/combat/sentinelSprite.ts` (the Sentinel recoloured)
- Tests: `tests/unit/{waystation,warden}.test.ts`, `chapter2.test.ts`, `full-story.spec.ts`

### Tests run
`npm test` 204/204 · `npm run e2e` 3/3 (production build, Edge; the whole game takes 4.2 min, test limit 6 min) · `npx tsc -b` OK.

### Next steps
1. **Milestone 2.5 — The Iron Warden** (see `docs/CHAPTER_2.md`): dusk at the Sungai Awan jetty (`jetty_dusk`, possibly a lighting variant of `village_c2`); the barge with Julian Pell and the Iron Warden; a **two-phase boss** (an `armor` value in `battle.ts` that Radiant Strike breaks, then heavy blows where River Ward matters); the Warden falls into the river; Pell sees the Charter; Adrian decides to take it to the Rajah → **Chapter 2 Complete** (a real chapter-complete card, and `hasChapterAfter(2)` stays false until Chapter 3 exists). Move the chapter end from `c2_warden_defeated`.
2. Consider the design doc's optional max-HP raise (30 → 36) before the boss, and tune the boss with strategy tests.

### Watch out
- Pushing to `master` deploys to the public site. The owner wants every finished milestone committed, pushed and checked live without asking.
- The full-story e2e test is getting long (4.2 min of a 6 min limit); raise the limit again or split it if 2.5 pushes it close.
- The Vite dev watcher can miss fast scripted multi-writes; restart `npm run dev` if the browser disagrees with the tests.
- The desktop app's browser pane throttles hidden pages. Prefer Playwright (`npx playwright test`) for real-time checks.
- Windows file names are case-insensitive: don't create `foo.ts` next to `Foo.tsx` in the same folder (data files use names like `hallData.ts` for this reason).
- e2e routes: wait out the fade-in after entering a scene without an arrival speech before walking, and walk around NPCs and stones (they are solid).
- No Python on this machine; use Node for scripts.
