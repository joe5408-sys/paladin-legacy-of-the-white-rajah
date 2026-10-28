# Architecture

## Stack
TypeScript · Vite · React (UI and menus) · Three.js through React Three Fiber (3D world) · Zustand (game state, from Phase 2) · Vitest (unit tests) · Playwright (e2e, to be added).

## Layout
```
src/
  app/App.tsx              Canvas + HUD shell (16:9 letterboxed)
  data/                    Pure data: layouts, later dialogue/quests/encounters
  game/
    core/                  Framework-free logic: collision, input, constants
    player/                Player component, sprite sheet, animation
    camera/                Fixed orthographic follow camera
    scenes/                Scene components and reusable low-poly pieces
    ui/                    React HUD overlays
  styles/global.css
tests/unit/                Vitest tests for pure logic
docs/                      Design, progress and handoff docs
```

## Chapters (lazy-loaded)
- Chapter 0 is built in. Each later chapter lives in `src/chapters/chapterN/` with `data.ts` (layout, dialogue, objectives), `content.ts` (registers them) and its scene components.
- `loadChapter(n)` dynamically imports the chapter, so it's a separate download. The title screen preloads whatever chapter the save needs (`peekSavedFlags`) before validating it.
- Scene metadata (`SCENES`: names, spawns, arrival rules) stays static because it's tiny. Lazy scene components render through `React.lazy` in `SceneView`.
- The current chapter comes from flags (`chapter1_started`), and so do its objectives (`objectivesFor`) and the "at chapter end" state (`isAtChapterEnd`).

## Testing
- `npm test`: Vitest unit and integration tests on pure logic and the store (they play the whole story through store actions).
- `npm run e2e`: Playwright against the production build in the local Edge (`tests/e2e`). It drives the real game with keyboard input; tests read the UI through `data-testid` attributes.

## Key decisions
- **Pure logic is separate from rendering.** `core/collision.ts`, `core/input.ts`, `player/animation.ts` and `data/*` do not import React or Three.js, so they are unit-testable in Node.
- **Collision** is circle vs. axis-aligned boxes on the X/Z plane, resolved per axis (to slide along walls) with sub-steps (no tunnelling). No physics engine.
- **Coordinates:** 1 unit ≈ 1 m. +X = east, −Z = north (away from camera), +Z = south (toward camera). Y is up.
- **Camera:** orthographic, fixed 42° pitch, no rotation. `zoom = canvasHeight / CAMERA_VIEW_HEIGHT` keeps the framing the same at any resolution. Exponential smoothing with `1 - exp(-k·dt)`.
- **Sprites:** upright planes (not tilted toward the camera), stretched by `1/cos(pitch)` so on-screen proportions match the pixel art. `alphaTest` (not transparency) so sprites write depth and sort correctly against 3D geometry. Nearest filtering, no mipmaps.
- **Placeholder art is generated in code** (`pixelSprite.ts`), so there are no binary assets to license yet. A real sprite sheet PNG can replace `createHeroSheet()` without changing `Player.tsx`, as long as it keeps the 4×4 frame layout.
- **Per-frame state lives in refs**, not React state, to avoid re-renders at 60 FPS. The camera reads the player position through a shared `Vector3` ref.
- **Debug hook:** in every build, `window.__PALADIN__` is the live player tracker `{x, z, facing, moving}` (read-only use). The Playwright `walk()` helper uses it to walk an exact distance instead of timing key presses.
