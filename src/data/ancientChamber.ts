/**
 * Area C — the ancient chamber beneath the Vale house. Pure data.
 * Room: x -5..5, z -4..3.4. Stairs up at the south edge.
 * The Covenant Guardian encounter is added in Phase 4.
 */
import { boxFromCenter, type Box } from '../game/core/collision';
import type { Interactable } from '../game/interaction/interaction';
import type { SceneLayout } from '../game/scenes/layout';

export const CHAMBER_BOUNDS: Box = { minX: -5, maxX: 5, minZ: -4, maxZ: 3.4 };
export const CHAMBER_WALL_HEIGHT = 3.2;

export const PILLARS = [
  { x: -3.6, z: -2.6 },
  { x: 3.6, z: -2.6 },
  { x: -3.6, z: 1.4 },
  { x: 3.6, z: 1.4 },
];
export const PILLAR_SIZE = 0.8;

export const BRAZIERS = [
  { x: -1.9, z: -3.4 },
  { x: 1.9, z: -3.4 },
];

/** The great sword-and-river sign set into the floor. */
export const FLOOR_SIGN = { x: 0, z: -0.8, radius: 1.7 };

export const CHAMBER_INTERACTABLES: Interactable[] = [
  {
    id: 'chamber-sign',
    kind: 'inspect',
    label: 'Paladin Sign',
    x: FLOOR_SIGN.x,
    z: FLOOR_SIGN.z,
    radius: 1.6,
    dialogue: [{ dialogue: 'chamber_sign' }],
  },
  {
    id: 'chamber-stairs',
    kind: 'enter',
    label: 'Stairs Up',
    x: 0,
    z: 3.1,
    radius: 0.9,
    enter: { scene: 'home', spawn: 'from_passage' },
  },
];

const COLLIDERS: Box[] = [
  ...PILLARS.map((p) => boxFromCenter(p.x, p.z, PILLAR_SIZE, PILLAR_SIZE)),
  ...BRAZIERS.map((b) => boxFromCenter(b.x, b.z, 0.6, 0.6)),
];

export const CHAMBER_LAYOUT: SceneLayout = {
  bounds: CHAMBER_BOUNDS,
  colliders: () => COLLIDERS,
  interactables: CHAMBER_INTERACTABLES,
  npcs: [],
};
