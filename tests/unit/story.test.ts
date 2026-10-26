/**
 * Phase 3: quest progression, scene transitions, and the discovery sequence
 * (village → home → Aunt Mara → heirloom → passage → chamber), driven through
 * the same store actions the game uses.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { gameStore } from '../../src/game/core/gameStore';
import { currentObjective, currentObjectiveIndex } from '../../src/game/quests/quests';
import { PROLOGUE_OBJECTIVES } from '../../src/data/quests';
import { SCENES, type SceneId } from '../../src/data/scenes';
import { DIALOGUES } from '../../src/data/dialogue';
import { VILLAGE_LAYOUT } from '../../src/data/villageSquare';
import { HOME_LAYOUT } from '../../src/data/familyHome';
import { CHAMBER_LAYOUT } from '../../src/data/ancientChamber';
import { WATERFRONT_LAYOUT } from '../../src/chapters/chapter1/data';
import { ARCHIVES_LAYOUT } from '../../src/chapters/chapter1/archivesData';
import '../../src/chapters/chapter1/content'; // registers Chapter 1 dialogue and objectives
import { findNearestInteractable, isAvailable } from '../../src/game/interaction/interaction';
import { circleOverlapsBox, moveWithCollision } from '../../src/game/core/collision';
import { PLAYER_RADIUS } from '../../src/game/core/constants';
import type { StoryFlag, StoryFlags } from '../../src/game/core/flags';
import type { SceneLayout } from '../../src/game/scenes/layout';

const s = () => gameStore.getState();
const LAYOUTS: Record<SceneId, SceneLayout> = {
  village: VILLAGE_LAYOUT,
  home: HOME_LAYOUT,
  chamber: CHAMBER_LAYOUT,
  waterfront: WATERFRONT_LAYOUT,
  archives: ARCHIVES_LAYOUT,
};
const ALL_FLAGS = Object.fromEntries(
  ([
    'arrived', 'met_lim', 'entered_home', 'met_mara', 'heirloom_awakened',
    'passage_open', 'entered_chamber', 'guardian_defeated', 'read_message',
    'chapter1_started', 'c1_arrived', 'c1_met_daniel', 'c1_archives_reached', 'c1_entered_archives',
    'c1_met_archivist', 'c1_clue_gap', 'c1_hint_household', 'c1_file_found',
  ] as StoryFlag[]).map((f) => [f, true]),
) as StoryFlags;

function finishDialogue() {
  for (let i = 0; i < 100 && s().dialogue; i++) s().pressAction('Enter');
}

/** Interacts with an interactable by id in the current scene, as the player would. */
function use(id: string) {
  const target = LAYOUTS[s().scene].interactables.find((t) => t.id === id);
  if (!target) throw new Error(`No interactable ${id} in ${s().scene}`);
  expect(isAvailable(target, s().flags), `${id} should be available`).toBe(true);
  s().setNearby(target);
  return s().pressAction('KeyE');
}

/** Completes a running fade transition and its arrival dialogue. */
function completeTransition() {
  s().swapScene();
  s().finishTransition();
  finishDialogue();
}

beforeEach(() => s().reset());

describe('quest objectives', () => {
  it('starts on "Find the ancestral family home."', () => {
    expect(currentObjective(PROLOGUE_OBJECTIVES, {})?.text).toBe('Find the ancestral family home.');
  });

  it('advances in order as flags are set', () => {
    const flags: StoryFlags = {};
    const seen: string[] = [];
    for (const o of PROLOGUE_OBJECTIVES) {
      seen.push(currentObjective(PROLOGUE_OBJECTIVES, flags)!.id);
      flags[o.completeWhen] = true;
    }
    expect(seen).toEqual(PROLOGUE_OBJECTIVES.map((o) => o.id));
    expect(currentObjective(PROLOGUE_OBJECTIVES, flags)).toBeNull();
  });

  it('does not skip ahead if a later flag is somehow set first', () => {
    expect(currentObjectiveIndex(PROLOGUE_OBJECTIVES, { met_mara: true })).toBe(0);
  });
});

describe('scene transitions', () => {
  it('fades out, swaps scene at the spawn point, fades in, then returns control', () => {
    expect(s().requestScene('home', 'door')).toBe(true);
    expect(s().mode).toBe('transition');
    expect(s().scene).toBe('village');
    s().swapScene();
    expect(s().scene).toBe('home');
    expect(s().spawn).toEqual(SCENES.home.spawns.door);
    expect(s().transition?.phase).toBe('in');
    s().finishTransition();
    expect(s().transition).toBeNull();
    // First visit plays the arrival dialogue
    expect(s().mode).toBe('dialogue');
    expect(s().dialogue?.def.id).toBe('home_arrival');
  });

  it('blocks movement keys and interactions mid-transition', () => {
    s().requestScene('home', 'door');
    expect(s().pressAction('KeyE')).toBe(false);
    expect(s().requestScene('chamber', 'stairs')).toBe(false);
    expect(s().startDialogue('portrait')).toBe(false);
  });

  it('rejects unknown spawn points', () => {
    expect(s().requestScene('home', 'nowhere')).toBe(false);
    expect(s().mode).toBe('explore');
  });

  it('only plays an arrival dialogue the first time', () => {
    s().requestScene('home', 'door');
    completeTransition();
    s().requestScene('village', 'from_home');
    completeTransition();
    s().requestScene('home', 'door');
    s().swapScene();
    s().finishTransition();
    expect(s().mode).toBe('explore');
  });
});

describe('discovery sequence (Scenes 1–4)', () => {
  it('can be completed in order, updating objectives at each step', () => {
    const objective = () => currentObjective(PROLOGUE_OBJECTIVES, s().flags)?.id;

    // Scene 1: opening narration
    expect(s().arrive()).toBe(true);
    finishDialogue();
    expect(s().flags.arrived).toBe(true);
    expect(objective()).toBe('find_home');

    // Scene 2: enter the home → objective updates on arrival
    expect(use('family-home-door')).toBe(true);
    completeTransition();
    expect(s().scene).toBe('home');
    expect(objective()).toBe('talk_mara');

    // Heirloom cannot be awakened before talking to Mara
    expect(use('heirloom-locked')).toBe(true);
    expect(s().dialogue?.def.id).toBe('heirloom_locked');
    finishDialogue();
    expect(s().flags.heirloom_awakened).toBeUndefined();

    expect(use('npc-mara')).toBe(true);
    expect(s().dialogue?.def.id).toBe('mara_intro');
    finishDialogue();
    expect(objective()).toBe('inspect_heirloom');

    // Scene 3: awakening; flags are set mid-conversation by specific lines
    expect(use('heirloom')).toBe(true);
    expect(s().flags.heirloom_awakened).toBeUndefined();
    s().pressAction('Enter'); // reveal line 1
    s().pressAction('Enter'); // → line 2: the medallion flares
    expect(s().flags.heirloom_awakened).toBe(true);
    expect(s().flags.passage_open).toBeUndefined();
    finishDialogue();
    expect(s().flags.passage_open).toBe(true);
    expect(objective()).toBe('enter_chamber');

    // The open hatch blocks walking into the hole
    const hatchBlocked = HOME_LAYOUT.colliders(s().flags).length > HOME_LAYOUT.colliders({}).length;
    expect(hatchBlocked).toBe(true);

    // Mara now has new lines
    use('npc-mara');
    expect(s().dialogue?.def.id).toBe('mara_after_awaken');
    finishDialogue();

    // Scene 4 lead-in: descend
    expect(use('hidden-passage')).toBe(true);
    completeTransition();
    expect(s().scene).toBe('chamber');
    expect(s().flags.entered_chamber).toBe(true);
    expect(objective()).toBe('defeat_guardian');
  });

  it('completed story conversations do not replay', () => {
    s().requestScene('home', 'door');
    completeTransition();
    use('npc-mara');
    finishDialogue();
    use('npc-mara');
    expect(s().dialogue?.def.id).toBe('mara_repeat');
    finishDialogue();
    use('heirloom');
    finishDialogue();
    use('heirloom-awake');
    expect(s().dialogue?.def.id).toBe('heirloom_after');
  });

  it('exactly one heirloom interaction is available at each story stage', () => {
    const heirlooms = HOME_LAYOUT.interactables.filter((t) => t.id.startsWith('heirloom'));
    for (const flags of [{}, { met_mara: true }, { met_mara: true, heirloom_awakened: true }] as StoryFlags[]) {
      expect(heirlooms.filter((t) => isAvailable(t, flags))).toHaveLength(1);
    }
  });

  it('the hidden passage does not exist until it opens', () => {
    const passage = HOME_LAYOUT.interactables.find((t) => t.id === 'hidden-passage')!;
    expect(isAvailable(passage, { met_mara: true, heirloom_awakened: true })).toBe(false);
    expect(isAvailable(passage, { passage_open: true })).toBe(true);
  });
});

describe('scene layout data', () => {
  for (const [id, layout] of Object.entries(LAYOUTS) as [SceneId, SceneLayout][]) {
    describe(id, () => {
      const colliders = layout.colliders(ALL_FLAGS);

      it('every spawn point is in bounds, unobstructed, and away from exit prompts', () => {
        for (const [name, p] of Object.entries(SCENES[id].spawns)) {
          expect(colliders.some((b) => circleOverlapsBox(p, PLAYER_RADIUS, b)), name).toBe(false);
          expect(p.x).toBeGreaterThanOrEqual(layout.bounds.minX + PLAYER_RADIUS);
          expect(p.x).toBeLessThanOrEqual(layout.bounds.maxX - PLAYER_RADIUS);
          expect(p.z).toBeGreaterThanOrEqual(layout.bounds.minZ + PLAYER_RADIUS);
          expect(p.z).toBeLessThanOrEqual(layout.bounds.maxZ - PLAYER_RADIUS);
          const near = findNearestInteractable(p, layout.interactables, ALL_FLAGS);
          expect(near?.kind, `${name} spawns on top of ${near?.id}`).not.toBe('enter');
        }
      });

      it('every exit points to a real scene and spawn', () => {
        for (const t of layout.interactables) {
          if (t.enter) expect(SCENES[t.enter.scene].spawns[t.enter.spawn], t.id).toBeDefined();
        }
      });

      it('every referenced dialogue exists', () => {
        for (const t of layout.interactables) {
          for (const r of t.dialogue ?? []) expect(DIALOGUES[r.dialogue], r.dialogue).toBeDefined();
        }
        for (const r of SCENES[id].arrival ?? []) expect(DIALOGUES[r.dialogue]).toBeDefined();
      });

      it('every interactable can be reached on foot', () => {
        for (const t of layout.interactables) {
          // Try walking toward it from each side; succeed if any approach reaches it.
          const reached = [
            [0, 3],
            [3, 0],
            [-3, 0],
            [0, -3],
          ].some(([dx, dz]) => {
            let pos = {
              x: Math.min(Math.max(t.x + dx, layout.bounds.minX + 0.4), layout.bounds.maxX - 0.4),
              z: Math.min(Math.max(t.z + dz, layout.bounds.minZ + 0.4), layout.bounds.maxZ - 0.4),
            };
            if (colliders.some((b) => circleOverlapsBox(pos, PLAYER_RADIUS, b))) return false;
            for (let i = 0; i < 200; i++) {
              const step = { x: Math.sign(t.x - pos.x) * 0.03, z: Math.sign(t.z - pos.z) * 0.03 };
              pos = moveWithCollision(pos, step, PLAYER_RADIUS, colliders, layout.bounds);
            }
            return Math.hypot(pos.x - t.x, pos.z - t.z) <= t.radius;
          });
          expect(reached, t.id).toBe(true);
        }
      });
    });
  }
});
