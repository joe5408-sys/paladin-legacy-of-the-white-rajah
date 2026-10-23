# Session Handoff

## Last session — 2026-10-23 (Claude Code)
**Task:** Phase 0 plus the first slice of Phase 1: a walkable HD-2D village prototype.

### Files created
- Config: `package.json`, `tsconfig.json`, `vite.config.ts`, `netlify.toml`, `index.html`, `.gitignore`, `.claude/launch.json`
- `src/main.tsx`, `src/app/App.tsx`, `src/styles/global.css`
- `src/game/core/` — `constants.ts`, `collision.ts`, `input.ts`, `useDirectionalInput.ts`
- `src/game/player/` — `Player.tsx`, `pixelSprite.ts`, `animation.ts`
- `src/game/camera/FollowCamera.tsx`
- `src/game/scenes/` — `VillageSquare.tsx`, `environment.tsx`
- `src/game/ui/Hud.tsx`
- `src/data/villageSquare.ts`
- `tests/unit/collision.test.ts`, `tests/unit/input.test.ts`
- `docs/*`

### Tests run
- `npm test`: 16/16 pass
- `npm run build`: success
- Manual check in the browser pane: movement, facing, collision, depth, no console errors

### Uncommitted work
None after the initial commit.

### Next exact task — Phase 2 (NPC and dialogue)
1. Add `src/game/interaction/`: a reusable interactable (id, position, radius, type, label) plus a hook that finds the nearest interactable in range and shows `[E] Talk to …`.
2. Add one village NPC sprite (reuse `pixelSprite.ts` with a palette parameter) standing near the square.
3. Add `src/game/dialogue/`: a data-driven dialogue box (speaker name, multi-line, continue indicator, E/Enter/Space to advance, completion callback). Store dialogue in `src/data/dialogue.ts`.
4. Add a small Zustand store (`src/game/core/gameStore.ts`) for mode (`explore` / `dialogue`) and story flags; freeze player input during dialogue.
5. Unit-test interaction range selection and dialogue advancement.
