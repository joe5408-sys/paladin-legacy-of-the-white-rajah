# Session Handoff

## Last session — 2026-10-26 (Claude Code): Phase 7 / Chapter 1, Milestones 1.1–1.2
**Result:** Chapter 1 has started. After "Chapter 0 Complete" the player can **Continue to Chapter 1**, arrive at the Kuching waterfront, meet Daniel at the pier and reach the sealed Royal Archives ("To Be Continued"). Chapter content is lazy-loaded, and Playwright browser tests now play the whole story automatically.

### Key files
- `src/chapters/loader.ts`; `src/chapters/chapter1/{data.ts,content.ts,Waterfront.tsx}`
- Registries: `src/data/{dialogue,layouts,quests}.ts`; chapter helpers in `src/game/quests/quests.ts`
- UI: `ChapterTitleCard.tsx`, `ChapterComplete.tsx` (chapter variants), `TitleScreen.tsx` (preload and hint)
- Tests: `tests/unit/chapter1.test.ts`, `tests/e2e/*`, `playwright.config.ts`
- Design: `docs/CHAPTER_1.md`

### Tests run
`npm test` 117/117 · `npx playwright test` 3/3 (production build, Edge) · `npm run build` OK.

### Milestone 1.2 (done this session)
Royal Archives interior, the Archivist, and the shelf investigation to the waking iron door. Files: `src/chapters/chapter1/{Archives.tsx,archivesData.ts}`. Tests: `chapter1.test.ts` and `full-story.spec.ts`.

### Next exact task — Milestone 1.3: The Hollow Sentinel
See `docs/CHAPTER_1.md`.
1. Opening the iron door leads to a vault antechamber (new lazy scene) where a palace construct, the **Hollow Sentinel** (original design), attacks: the second battle. Reuse `battle.ts` and add an encounter in `data/encounters.ts` with new tuning (harder than the Guardian).
2. Consider one new Paladin skill only if the fight needs it (scope rule).
3. Victory → vault contents → "To Be Continued" moves to the end of 1.3.
4. Unit tests plus an e2e extension; deploy; run the e2e suite against the live site.

### Watch out
- Pushing to `master` deploys to the public site.
- The Vite dev watcher can miss fast scripted multi-writes; restart `npm run dev` if the browser disagrees with the tests.
- The desktop app's browser pane throttles hidden pages. Prefer Playwright (`npx playwright test`) for real-time checks.
- Windows file names are case-insensitive: don't create `foo.ts` next to `Foo.tsx` in the same folder (Archives data lives in `archivesData.ts` for this reason).
