# Session Handoff

## Last session — 2026-10-26 (Claude Code): Phase 7 / Chapter 1, Milestones 1.1–1.3
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

### Milestone 1.3 (done this session)
The vault behind the iron door and the Hollow Sentinel battle (telegraphed heavy blow; Defend blocks it), then the inner gate → "To Be Continued". Files: `src/chapters/chapter1/{Vault.tsx,vaultData.ts}`, `src/game/combat/sentinelSprite.ts`; battle changes in `battle.ts`, `BattleArena.tsx`, `BattleHud.tsx`, `data/encounters.ts`. Tests: `sentinel.test.ts`, `chapter1.test.ts`, `full-story.spec.ts`. Latest results: `npm test` 143/143, `npm run e2e` 3/3.

### Next exact task — Milestone 1.4: The Redacted Name
See `docs/CHAPTER_1.md`.
1. Open the VALE box in the inner vault (a small new scene or the vault's back room): what Harrow's 1921 order hid, and why the Rajah never signed it. Keep it fictional and respectful (MASTER_PROMPT cultural notes).
2. A confrontation hook with palace security (Daniel's own office), then a cliffhanger into Chapter 2.
3. Replace "To Be Continued" with a proper "Chapter 1 Complete" card; move the chapter end flag.
4. Unit tests plus an e2e extension; deploy; run the e2e suite against the live site.

### Watch out
- Pushing to `master` deploys to the public site.
- The Vite dev watcher can miss fast scripted multi-writes; restart `npm run dev` if the browser disagrees with the tests.
- The desktop app's browser pane throttles hidden pages. Prefer Playwright (`npx playwright test`) for real-time checks.
- Windows file names are case-insensitive: don't create `foo.ts` next to `Foo.tsx` in the same folder (Archives data lives in `archivesData.ts` for this reason).
