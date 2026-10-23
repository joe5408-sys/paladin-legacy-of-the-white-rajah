import { describe, expect, it } from 'vitest';
import {
  findNearestInteractable,
  promptText,
  type Interactable,
} from '../../src/game/interaction/interaction';
import { directionToward } from '../../src/game/core/input';
import { circleOverlapsBox, moveWithCollision } from '../../src/game/core/collision';
import { PLAYER_RADIUS } from '../../src/game/core/constants';
import {
  buildVillageColliders,
  INTERACTABLES,
  NPCS,
  VILLAGE_BOUNDS,
} from '../../src/data/villageSquare';
import { DIALOGUES } from '../../src/data/dialogue';
import { CHARACTERS } from '../../src/data/characters';

const a: Interactable = { id: 'a', kind: 'talk', label: 'A', x: 0, z: 0, radius: 1.5 };
const b: Interactable = { id: 'b', kind: 'inspect', label: 'Sign', x: 2, z: 0, radius: 1.5 };

describe('findNearestInteractable', () => {
  it('returns the target when in range', () => {
    expect(findNearestInteractable({ x: 0.5, z: 0.5 }, [a])?.id).toBe('a');
  });

  it('returns null when out of range', () => {
    expect(findNearestInteractable({ x: 3, z: 3 }, [a])).toBeNull();
  });

  it('picks the closest when several are in range', () => {
    expect(findNearestInteractable({ x: 0.8, z: 0 }, [a, b])?.id).toBe('a');
    expect(findNearestInteractable({ x: 1.2, z: 0 }, [a, b])?.id).toBe('b');
  });

  it('includes the exact radius boundary', () => {
    expect(findNearestInteractable({ x: 1.5, z: 0 }, [a])?.id).toBe('a');
  });
});

describe('promptText', () => {
  it('builds a verb + label prompt', () => {
    expect(promptText(a)).toBe('Talk to A');
    expect(promptText(b)).toBe('Inspect Sign');
  });
});

describe('directionToward', () => {
  it('uses the dominant axis', () => {
    expect(directionToward({ x: 0, z: 0 }, { x: 2, z: 1 })).toBe('east');
    expect(directionToward({ x: 0, z: 0 }, { x: -2, z: 1 })).toBe('west');
    expect(directionToward({ x: 0, z: 0 }, { x: 0.5, z: 2 })).toBe('south');
    expect(directionToward({ x: 0, z: 0 }, { x: 0.5, z: -2 })).toBe('north');
  });
});

describe('village interaction data', () => {
  const colliders = buildVillageColliders();

  it('references dialogues and characters that exist', () => {
    for (const t of INTERACTABLES) {
      for (const rule of t.dialogue ?? []) expect(DIALOGUES[rule.dialogue], rule.dialogue).toBeDefined();
      if (t.npc) expect(CHARACTERS[t.npc]).toBeDefined();
    }
    for (const d of Object.values(DIALOGUES)) {
      for (const line of d.lines) if (line.speaker) expect(CHARACTERS[line.speaker]).toBeDefined();
    }
  });

  it('every interactable can actually be reached by walking up to it', () => {
    for (const t of INTERACTABLES) {
      // Approach from the south, the open side of every target in this map.
      let pos = { x: t.x, z: Math.min(t.z + 4, VILLAGE_BOUNDS.maxZ - 1) };
      for (let i = 0; i < 200; i++) {
        pos = moveWithCollision(pos, { x: 0, z: -0.05 }, PLAYER_RADIUS, colliders, VILLAGE_BOUNDS);
      }
      expect(findNearestInteractable(pos, INTERACTABLES)?.id, t.id).toBe(t.id);
    }
  });

  it('NPCs block movement', () => {
    for (const n of NPCS) {
      expect(colliders.some((box) => circleOverlapsBox({ x: n.x, z: n.z }, PLAYER_RADIUS, box))).toBe(true);
    }
  });
});
