/**
 * Area A — Sungai Awan village square (fictional riverside settlement near Kapit).
 * Pure data: geometry placement and colliders. Scene components read this;
 * nothing here imports React or Three.js.
 */
import { boxFromCenter, type Box } from '../game/core/collision';
import type { Direction } from '../game/core/input';
import type { Interactable } from '../game/interaction/interaction';
import type { CharacterId } from './characters';

export interface BuildingDef {
  id: string;
  label: string;
  x: number;
  z: number;
  width: number; // along X
  depth: number; // along Z
  height: number; // wall height
  wallColor: string;
  roofColor: string;
  trimColor: string;
  /** Raised on stilts (riverside style). */
  stilts?: number;
  /** Door on the south (camera-facing) wall. */
  door?: boolean;
}

export interface PropDef {
  kind: 'palm' | 'crate' | 'lamp' | 'bench' | 'planter' | 'barrel';
  x: number;
  z: number;
  rotation?: number;
  /** Footprint for collision; omit for walk-through decoration. */
  collider?: { width: number; depth: number };
}

/** Walkable rectangle. North edge stops at the boardwalk railing. */
export const VILLAGE_BOUNDS: Box = { minX: -12, maxX: 12, minZ: -5.2, maxZ: 8 };

export const PLAYER_START = { x: -6, z: 5.5 };

/** River runs along the north edge, behind the boardwalk. */
export const RIVER = { minX: -40, maxX: 40, minZ: -14.5, maxZ: -6.2 };
export const BOARDWALK = { minX: -12.5, maxX: 12.5, minZ: -6.2, maxZ: -4.8 };

export const BUILDINGS: BuildingDef[] = [
  {
    id: 'kedai',
    label: 'Kedai Runcit',
    x: -7.5,
    z: -1.6,
    width: 4.4,
    depth: 3,
    height: 2.4,
    wallColor: '#e9dcc0',
    roofColor: '#a8442f',
    trimColor: '#2f6b5a',
    door: true,
  },
  {
    id: 'clinic',
    label: 'Klinik Desa',
    x: -1.5,
    z: -1.8,
    width: 3.6,
    depth: 2.8,
    height: 2.2,
    wallColor: '#cfe1e6',
    roofColor: '#46677d',
    trimColor: '#f2f2ea',
    door: true,
  },
  {
    id: 'family-home',
    label: 'Vale Family Home',
    x: 6.8,
    z: -0.6,
    width: 5,
    depth: 3.4,
    height: 2.2,
    wallColor: '#7a5134',
    roofColor: '#4b3b2a',
    trimColor: '#d6b36a',
    stilts: 0.7,
    door: true,
  },
];

export const PROPS: PropDef[] = [
  { kind: 'palm', x: -10.6, z: -3.6, collider: { width: 0.5, depth: 0.5 } },
  { kind: 'palm', x: 3.2, z: -3.8, collider: { width: 0.5, depth: 0.5 } },
  { kind: 'palm', x: 10.8, z: 4.8, collider: { width: 0.5, depth: 0.5 } },
  { kind: 'palm', x: -10.4, z: 6.6, collider: { width: 0.5, depth: 0.5 } },
  { kind: 'crate', x: -4.6, z: -0.6, collider: { width: 0.8, depth: 0.8 } },
  { kind: 'crate', x: -4.7, z: 0.3, rotation: 0.3, collider: { width: 0.8, depth: 0.8 } },
  { kind: 'barrel', x: -9.9, z: 0.4, collider: { width: 0.7, depth: 0.7 } },
  { kind: 'bench', x: 0.5, z: 2.6, collider: { width: 1.8, depth: 0.6 } },
  { kind: 'lamp', x: -3.2, z: -4.1, collider: { width: 0.3, depth: 0.3 } },
  { kind: 'lamp', x: 4.2, z: 2.2, collider: { width: 0.3, depth: 0.3 } },
  { kind: 'planter', x: 3.9, z: 0.6, collider: { width: 0.7, depth: 0.7 } },
  { kind: 'planter', x: 9.7, z: 1.6, collider: { width: 0.7, depth: 0.7 } },
];

export interface NpcPlacement {
  id: string;
  character: CharacterId;
  x: number;
  z: number;
  facing: Direction;
}

/** Uncle Lim minds his shop counter outside the kedai. */
export const NPCS: NpcPlacement[] = [
  { id: 'npc-lim', character: 'lim', x: -6.2, z: 1.0, facing: 'south' },
];

export const NPC_COLLIDER_SIZE = 0.6;

export const INTERACTABLES: Interactable[] = [
  {
    id: 'npc-lim',
    kind: 'talk',
    label: 'Uncle Lim',
    x: -6.2,
    z: 1.0,
    radius: 1.4,
    npc: 'lim',
    dialogue: [
      { dialogue: 'lim_intro', unless: ['met_lim'] },
      { dialogue: 'lim_repeat' },
    ],
  },
  {
    // Becomes an "enter" door in Phase 3, when the interior exists.
    id: 'family-home-stairs',
    kind: 'inspect',
    label: 'Vale Family Home',
    x: 6.8,
    z: 2.15,
    radius: 1.2,
    dialogue: [{ dialogue: 'family_home_exterior' }],
  },
];

/** Stair footprint in front of a stilt house door (blocked until interiors exist). */
export function stairBox(b: BuildingDef): Box {
  return boxFromCenter(b.x, b.z + b.depth / 2 + 0.45, 1.2, 0.9);
}

export function buildVillageColliders(): Box[] {
  const boxes: Box[] = BUILDINGS.map((b) => boxFromCenter(b.x, b.z, b.width, b.depth));
  for (const b of BUILDINGS) if (b.stilts) boxes.push(stairBox(b));
  for (const p of PROPS) {
    if (p.collider) boxes.push(boxFromCenter(p.x, p.z, p.collider.width, p.collider.depth));
  }
  for (const n of NPCS) boxes.push(boxFromCenter(n.x, n.z, NPC_COLLIDER_SIZE, NPC_COLLIDER_SIZE));
  return boxes;
}
