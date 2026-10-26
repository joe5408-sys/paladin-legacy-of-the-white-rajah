/**
 * Chapter 1, Milestone 1.3 — the vault beneath the Royal Archives. Pure data.
 *
 * A narrow stone hall behind the iron door. Room: x -4..4, z -5..3.
 * The Hollow Sentinel stands before the inner gate at the north end;
 * sealed record cabinets line both walls. The iron door is at the south end.
 * The inner gate leads to the sealed records room (milestone 1.4, recordsData.ts).
 */
import { boxFromCenter, type Box } from '../../game/core/collision';
import type { StoryFlags } from '../../game/core/flags';
import type { DialogueDef } from '../../game/dialogue/types';
import type { Interactable } from '../../game/interaction/interaction';
import type { SceneLayout } from '../../game/scenes/layout';

export const VAULT_ROOM: Box = { minX: -4, maxX: 4, minZ: -5, maxZ: 3 };
export const VAULT_WALL_HEIGHT = 3.4;

/** Where the Hollow Sentinel stands (and later lies). */
export const SENTINEL = { x: 0, z: -2.7 };
export const SENTINEL_SIZE = { width: 1.1, depth: 0.6 };

/** The barred inner gate set into the north wall. */
export const INNER_GATE = { x: 0, width: 2.2, height: 2.7 };

/** Sealed record cabinets along the side walls. */
export const CABINETS = [-3.4, -1.4, 0.6].flatMap((z) => [
  { x: -3.45, z },
  { x: 3.45, z },
]);
export const CABINET_SIZE = { width: 0.9, depth: 1.3 };

export const VAULT_INTERACTABLES: Interactable[] = [
  {
    id: 'sentinel',
    kind: 'inspect',
    label: 'Brass Figure',
    x: SENTINEL.x,
    z: SENTINEL.z + 1.0,
    radius: 1.4,
    dialogue: [
      { dialogue: 'c1_sentinel_wake', unless: ['c1_sentinel_defeated'] },
      { dialogue: 'c1_sentinel_remains' },
    ],
  },
  {
    id: 'inner-gate',
    kind: 'inspect',
    label: 'Inner Gate',
    x: INNER_GATE.x,
    z: VAULT_ROOM.minZ + 0.6,
    radius: 1.2,
    when: { unless: ['c1_inner_gate_open'] },
    dialogue: [
      { dialogue: 'c1_inner_gate', requires: ['c1_sentinel_defeated'] },
      { dialogue: 'c1_inner_gate_early' },
    ],
  },
  {
    // Once the gate is open (also for saves from the old 1.3 cliffhanger).
    id: 'records-enter',
    kind: 'enter',
    label: 'Sealed Records',
    x: INNER_GATE.x,
    z: VAULT_ROOM.minZ + 0.6,
    radius: 1.2,
    when: { requires: ['c1_inner_gate_open'] },
    enter: { scene: 'records', spawn: 'entrance' },
  },
  {
    id: 'vault-cabinets',
    kind: 'inspect',
    label: 'Sealed Cabinets',
    x: -2.6,
    z: -0.4,
    radius: 0.9,
    dialogue: [{ dialogue: 'c1_vault_cabinets' }],
  },
  {
    id: 'vault-exit',
    kind: 'enter',
    label: 'Royal Archives',
    x: 0,
    z: 2.85,
    radius: 0.8,
    enter: { scene: 'archives', spawn: 'vault_door' },
  },
];

const FIXED_COLLIDERS: Box[] = CABINETS.map((c) => boxFromCenter(c.x, c.z, CABINET_SIZE.width, CABINET_SIZE.depth));
const SENTINEL_COLLIDER = boxFromCenter(SENTINEL.x, SENTINEL.z, SENTINEL_SIZE.width, SENTINEL_SIZE.depth);

export const VAULT_LAYOUT: SceneLayout = {
  bounds: VAULT_ROOM,
  // The Sentinel blocks the way to the inner gate until it falls.
  colliders: (flags: StoryFlags) => (flags.c1_sentinel_defeated ? FIXED_COLLIDERS : [...FIXED_COLLIDERS, SENTINEL_COLLIDER]),
  interactables: VAULT_INTERACTABLES,
  npcs: [],
};

export const VAULT_DIALOGUE: DialogueDef[] = [
  {
    id: 'c1_vault_arrival',
    lines: [
      { speaker: null, text: 'Beyond the iron door, a narrow stone hall runs under the Archives. The air is cold and smells of lamp oil.', setFlags: ['c1_entered_vault'] },
      { speaker: null, text: 'Cabinets with wax seals line the walls. At the far end, before a barred gate, stands a tall figure of brass and dark wood.' },
      { speaker: 'adrian', text: 'Another guardian... but nobody in my family built this one.' },
    ],
  },
  {
    id: 'c1_vault_cabinets',
    lines: [
      { speaker: null, text: 'Every cabinet is sealed with red wax and the palace crest. The labels have been scraped off.' },
    ],
  },
  {
    id: 'c1_sentinel_wake',
    lines: [
      { speaker: null, text: 'The figure wears palace livery and a crowned brass mask with no face. Its chest is an empty cage.' },
      { speaker: null, text: 'As Adrian steps closer, a cold blue flame flickers on inside the cage.' },
      { speaker: null, text: 'A voice like grinding gears fills the hall: "BY ORDER OF THE LORD CHAMBERLAIN. NO VALE SHALL PASS."' },
      { speaker: 'adrian', text: 'Harrow. Even down here.' },
    ],
    startBattle: 'hollow_sentinel',
  },
  {
    id: 'c1_sentinel_defeated',
    lines: [
      { speaker: null, text: 'The Sentinel folds at the knees. The flame in its chest gutters, and it crashes to the floor in a heap of brass.' },
      { speaker: null, text: 'Where a heart should be, a small brass plate is riveted inside the cage. It bears the royal seal, and the sword and river scratched out across it.' },
      { speaker: 'adrian', text: 'Someone built a guard out of our sign... and set it against us.' },
      { speaker: 'daniel', text: '(from the doorway) Adrian! The whole building is shaking. Are you hurt?' },
      { speaker: 'adrian', text: 'I\'m fine. There is another gate back here. And I think I have its key.' },
    ],
  },
  {
    id: 'c1_sentinel_remains',
    lines: [
      { speaker: null, text: 'The Sentinel lies in pieces, still and cold. Adrian has the brass plate from its chest.' },
    ],
  },
  {
    id: 'c1_inner_gate_early',
    lines: [
      { speaker: null, text: 'A gate of black iron bars, locked fast. In its centre is a small square hollow, like a keyhole made for a plate.' },
      { speaker: null, text: 'Behind Adrian, brass creaks. The figure has turned its head to watch him.' },
    ],
  },
  {
    id: 'c1_inner_gate',
    lines: [
      { speaker: null, text: 'The inner gate is a lattice of black iron. In its centre is a square hollow, the size of the brass plate.' },
      { speaker: null, text: 'Adrian presses the plate into the hollow. It fits. With a long, grinding sigh, the bars sink into the floor.', setFlags: ['c1_inner_gate_open'] },
    ],
    enterScene: { scene: 'records', spawn: 'entrance' },
  },
];
