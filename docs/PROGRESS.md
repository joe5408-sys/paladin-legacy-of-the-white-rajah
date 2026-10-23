# Progress

**Current phase:** Phase 2 — NPC & Dialogue ✅ done → Phase 3 next
**Last updated:** 2026-10-23

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
