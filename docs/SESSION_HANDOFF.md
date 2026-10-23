# Session Handoff

## Last session — 2026-10-23 (Claude Code), Phase 3: Story Objectives
**Result:** done. The discovery sequence plays end to end: village → family home → Aunt Mara → heirloom awakening → hidden passage → ancient chamber. Objectives update on screen at each step.

### Files added
- `src/game/core/flags.ts`: StoryFlag list, `Condition`, `meetsCondition`
- `src/game/quests/quests.ts`, `src/data/quests.ts`
- `src/data/scenes.ts`: scene registry (names, spawns, arrival dialogue)
- `src/data/familyHome.ts`, `src/data/ancientChamber.ts`: layouts
- `src/game/scenes/layout.ts` (SceneLayout, NpcPlacement), `ExplorationRig.tsx`, `SceneView.tsx`, `FamilyHome.tsx`, `AncientChamber.tsx`, `insignia.ts`
- `src/game/ui/ObjectiveTracker.tsx`, `src/game/ui/SceneFade.tsx`
- `tests/unit/story.test.ts`

### Files modified
`gameStore.ts` (scene, spawn, transitions, arrival, per-line flags), `interaction.ts` (`when`, `enter`, `isAvailable`), `InteractionSystem.tsx`, `dialogue/types.ts`, `dialogue/rules.ts`, `villageSquare.ts` (VILLAGE_LAYOUT, door is now an exit), `VillageSquare.tsx`, `Player.tsx` (start facing), `Npc.tsx`, `pixelSprite.ts` (bun, long skirt), `characters.ts` (Mara), `dialogue.ts`, `Hud.tsx`, `App.tsx`, `global.css`, `tests/unit/dialogue.test.ts`, docs.

### Tests run
`npm test` 60/60 · `npm run build` OK · full browser play-through (see PROGRESS.md).

### Dev shortcuts
In dev builds, `window.__PALADIN_STORE__.getState()` exposes the store. For example, `setFlags([...])` plus `requestScene('chamber','stairs')` jumps ahead for testing.

### Uncommitted work
None after the Phase 3 commit.

### Next exact task — Phase 4 (Turn-Based Battle)
1. `src/data/encounters.ts`: Covenant Guardian encounter (HP 24, attack 4) and player stats (HP 30, Attack 6, Radiant Strike 10 ×2, Defend halves the next hit).
2. `src/game/combat/battle.ts`: pure deterministic battle state machine (player turn → enemy turn; victory and defeat checks; retry resets HP and charges). Unit-test every rule in MASTER_PROMPT §19 "Combat".
3. Trigger: in the chamber, inspecting the Paladin Sign (after `entered_chamber`, unless `guardian_defeated`) plays a short Guardian intro, then switches the store to `mode: 'battle'`.
4. Battle scene: a small 3D arena (reuse chamber pieces) with a battle camera framing, player and Guardian sprites (new placeholder Guardian sprite, larger), simple lunge/flash attack animations.
5. Battle UI: HP bars, Attack / Skill (shows charges left) / Defend menu (arrow keys + E/Enter), message log, a first-turn tutorial tip, victory message and a defeat screen with Retry Battle.
6. Victory sets `guardian_defeated` and returns to the chamber. The "Read the ancestral message" step belongs to Phase 5.
