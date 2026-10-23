/**
 * Area B — the Vale family home interior. One room, front wall cut away
 * (classic HD-2D interior view). Pure data.
 *
 * Room: x -4.5..4.5, z -3.5..3.5. North wall at the back, door in the south wall.
 */
import { boxFromCenter, type Box } from '../game/core/collision';
import type { StoryFlags } from '../game/core/flags';
import type { Interactable } from '../game/interaction/interaction';
import { NPC_COLLIDER_SIZE, type NpcPlacement, type SceneLayout } from '../game/scenes/layout';

export const HOME_ROOM = { minX: -4.5, maxX: 4.5, minZ: -3.5, maxZ: 3.5 };
export const HOME_WALL_HEIGHT = 2.6;

export interface FurnitureDef {
  kind: 'table' | 'stool' | 'cabinet' | 'plant' | 'mat' | 'shelf';
  x: number;
  z: number;
  /** Footprint for collision; omit for flat items like mats. */
  collider?: { width: number; depth: number };
}

export const FURNITURE: FurnitureDef[] = [
  { kind: 'mat', x: -2.2, z: 1.2 },
  { kind: 'table', x: -2.2, z: 1.2, collider: { width: 1.4, depth: 0.9 } },
  { kind: 'stool', x: -3.3, z: 1.2, collider: { width: 0.45, depth: 0.45 } },
  { kind: 'stool', x: -1.1, z: 1.2, collider: { width: 0.45, depth: 0.45 } },
  { kind: 'cabinet', x: 4.05, z: 0.8, collider: { width: 0.7, depth: 1.6 } },
  { kind: 'shelf', x: 1.9, z: -3.15, collider: { width: 1.4, depth: 0.5 } },
  { kind: 'plant', x: 3.9, z: -2.9, collider: { width: 0.6, depth: 0.6 } },
  { kind: 'plant', x: 3.9, z: 2.9, collider: { width: 0.6, depth: 0.6 } },
];

export const HEIRLOOM = { x: -2.6, z: -2.75 };
export const PORTRAIT = { x: 0, y: 1.55, wallZ: -3.5 };
/** Hidden floor hatch by the west wall; opens when the heirloom awakens. */
export const PASSAGE = { minX: -4.3, maxX: -3.0, minZ: -1.5, maxZ: 0.3 };

export const HOME_NPCS: NpcPlacement[] = [
  { id: 'npc-mara', character: 'mara', x: 2.6, z: -1.2, facing: 'south' },
];

export const HOME_INTERACTABLES: Interactable[] = [
  {
    id: 'npc-mara',
    kind: 'talk',
    label: 'Aunt Mara',
    x: 2.6,
    z: -1.2,
    radius: 1.4,
    npc: 'mara',
    dialogue: [
      { dialogue: 'mara_after_awaken', requires: ['heirloom_awakened'] },
      { dialogue: 'mara_intro', unless: ['met_mara'] },
      { dialogue: 'mara_repeat' },
    ],
  },
  // The heirloom changes with the story: locked → touchable → awakened.
  {
    id: 'heirloom-locked',
    kind: 'inspect',
    label: 'Heirloom',
    x: HEIRLOOM.x,
    z: HEIRLOOM.z,
    radius: 1.3,
    when: { unless: ['met_mara'] },
    dialogue: [{ dialogue: 'heirloom_locked' }],
  },
  {
    id: 'heirloom',
    kind: 'activate',
    label: 'Heirloom',
    x: HEIRLOOM.x,
    z: HEIRLOOM.z,
    radius: 1.3,
    when: { requires: ['met_mara'], unless: ['heirloom_awakened'] },
    dialogue: [{ dialogue: 'heirloom_awaken' }],
  },
  {
    id: 'heirloom-awake',
    kind: 'inspect',
    label: 'Heirloom',
    x: HEIRLOOM.x,
    z: HEIRLOOM.z,
    radius: 1.3,
    when: { requires: ['heirloom_awakened'] },
    dialogue: [{ dialogue: 'heirloom_after' }],
  },
  {
    id: 'portrait',
    kind: 'inspect',
    label: 'Family Portrait',
    x: PORTRAIT.x,
    z: -2.9,
    radius: 1.1,
    dialogue: [{ dialogue: 'portrait' }],
  },
  {
    id: 'hidden-passage',
    kind: 'enter',
    label: 'Hidden Passage',
    x: -2.55,
    z: -0.6,
    radius: 1.1,
    when: { requires: ['passage_open'] },
    enter: { scene: 'chamber', spawn: 'stairs' },
  },
  {
    id: 'home-exit',
    kind: 'enter',
    label: 'Village',
    x: 0,
    z: 3.2,
    radius: 0.9,
    enter: { scene: 'village', spawn: 'from_home' },
  },
];

const STATIC_COLLIDERS: Box[] = [
  ...FURNITURE.filter((f) => f.collider).map((f) =>
    boxFromCenter(f.x, f.z, f.collider!.width, f.collider!.depth),
  ),
  boxFromCenter(HEIRLOOM.x, HEIRLOOM.z, 0.7, 0.7), // pedestal
  ...HOME_NPCS.map((n) => boxFromCenter(n.x, n.z, NPC_COLLIDER_SIZE, NPC_COLLIDER_SIZE)),
];

export function buildHomeColliders(flags: StoryFlags): Box[] {
  // Once open, the hatch is a hole in the floor; walk up to it, not into it.
  return flags.passage_open ? [...STATIC_COLLIDERS, PASSAGE] : STATIC_COLLIDERS;
}

export const HOME_LAYOUT: SceneLayout = {
  bounds: HOME_ROOM, // walls sit just outside these bounds
  colliders: buildHomeColliders,
  interactables: HOME_INTERACTABLES,
  npcs: HOME_NPCS,
};
