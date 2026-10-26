# Session Handoff

## Last session — 2026-10-27 (Claude Code): Chapter 2, Milestones 2.1–2.2
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

### Milestone 1.4 (done this session)
The sealed records, the VALE box (Elias Vale's unredacted name), the Rajah's reply, Harrow's arrival, lights out, and the flood-door escape → Chapter 1 Complete. Files: `src/chapters/chapter1/{Records.tsx,recordsData.ts}`; characters `harrow` and `officer` in `data/characters.ts`; the card in `ChapterComplete.tsx`. Latest results: `npm test` 151/151, `npm run e2e` 3/3 (the full-story test plays the whole game).

### Milestones 2.1–2.2 (done)
- 2.1: the express boat up the Rajang (`src/chapters/chapter2/{Boat.tsx,boatData.ts}`).
- 2.2: Sungai Awan changed and the map behind Elias's portrait (`src/chapters/chapter2/{VillageC2.tsx,HomeC2.tsx,villageData.ts}`; the prologue `VillageSquare` and `FamilyHome` now take `layout` and children).
- Tests: `chapter2.test.ts`, `full-story.spec.ts`. Latest results: `npm test` 172/172, `npm run e2e` 3/3.

### Next exact task — Milestone 2.3: The Waystation
See `docs/CHAPTER_2.md`.
1. Ah Hock's longboat upriver past the rapids to an **original** Paladin landing: mossy steps, three standing stones with the sword-and-river sign, and a sealed door (new lazy scene).
2. Light puzzle using existing inspect and flag logic, with the order from the verse: "first the deep, then the bright, then the one that waits". A wrong order resets the stones, with no penalty.
3. The training spirit (a mirror of the Covenant Guardian) teaches **River Ward** (a heal plus a block, once per battle) in a short battle. This is the chapter's one new battle feature; tune it with strategy tests like `sentinel.test.ts`.
4. Unit tests plus an e2e extension; deploy; run the e2e suite against the live site.

### Watch out
- Pushing to `master` deploys to the public site.
- The Vite dev watcher can miss fast scripted multi-writes; restart `npm run dev` if the browser disagrees with the tests.
- The desktop app's browser pane throttles hidden pages. Prefer Playwright (`npx playwright test`) for real-time checks.
- Windows file names are case-insensitive: don't create `foo.ts` next to `Foo.tsx` in the same folder (Archives data lives in `archivesData.ts` for this reason).
- e2e routes: wait out the fade-in after entering a scene without an arrival speech before walking, and walk around NPCs (they are solid).
