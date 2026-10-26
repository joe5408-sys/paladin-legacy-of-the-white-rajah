/**
 * Chapter 1, Milestone 1.2 — inside the Royal Archives. Pure data.
 * The iron door leads to the vault (milestone 1.3, vaultData.ts).
 *
 * One tall reading hall, front wall cut away (like the family home).
 * Room: x -6..6, z -4..3.5. North wall: high windows and the sealed iron door.
 *
 *   Shelf A (west, back)  Land grants         flavour clue
 *   Shelf C (east, back)  Treason proceedings the gap where the Vale folder should be
 *   Shelf B (west, front) Household ledgers   where the folder was hidden
 *   The Archivist's desk sits in the middle; Daniel guards the entrance.
 */
import { boxFromCenter, type Box } from '../../game/core/collision';
import type { DialogueDef } from '../../game/dialogue/types';
import type { Interactable } from '../../game/interaction/interaction';
import { NPC_COLLIDER_SIZE, type NpcPlacement, type SceneLayout } from '../../game/scenes/layout';

export const ARCHIVE_ROOM: Box = { minX: -6, maxX: 6, minZ: -4, maxZ: 3.5 };
export const ARCHIVE_WALL_HEIGHT = 4.2;

export interface ShelfDef {
  id: string;
  label: string;
  x: number;
  z: number;
  width: number;
  /** Book colour scheme (purely visual). */
  palette: string[];
}

export const SHELF_DEPTH = 0.5;
export const SHELF_HEIGHT = 2.4;

export const SHELVES: ShelfDef[] = [
  { id: 'shelf-grants', label: 'Land Grants', x: -3.4, z: -1.5, width: 2.6, palette: ['#6b4a30', '#8a6a3c', '#4f5d3a', '#7b5a34'] },
  { id: 'shelf-treason', label: 'Treason Proceedings', x: 3.4, z: -1.5, width: 2.6, palette: ['#7b2f3b', '#5c2029', '#8a3b2f', '#4a1f24'] },
  { id: 'shelf-household', label: 'Household Ledgers', x: -3.4, z: 1.4, width: 2.6, palette: ['#2f4f6b', '#3d6b7f', '#2a3f55', '#4a6a8a'] },
  { id: 'shelf-maps', label: 'Maps and Charts', x: 3.4, z: 1.4, width: 2.6, palette: ['#c9a24a', '#a8843a', '#8a6a2c', '#d8b86a'] },
];

/** Shelves along the back wall, either side of the iron door (decoration). */
export const BACK_SHELVES = [
  { x: -4.2, z: -3.7, width: 3 },
  { x: 4.2, z: -3.7, width: 3 },
];

export const DESK = { x: 0, z: 0.1, width: 2, depth: 0.8 };
export const VAULT_DOOR = { x: 0, width: 2, height: 2.8 };

export const ARCHIVE_NPCS: NpcPlacement[] = [
  { id: 'npc-archivist', character: 'archivist', x: 0, z: -0.65, facing: 'south' },
  { id: 'npc-daniel-archives', character: 'daniel', x: 1.8, z: 2.6, facing: 'south' },
];

const shelfFront = (id: string) => {
  const s = SHELVES.find((x) => x.id === id)!;
  return { x: s.x, z: s.z + SHELF_DEPTH / 2 + 0.4 };
};

export const ARCHIVE_INTERACTABLES: Interactable[] = [
  {
    id: 'npc-archivist',
    kind: 'talk',
    label: 'the Archivist',
    x: 0,
    z: -0.65,
    radius: 1.6, // spoken to across the desk
    npc: 'archivist',
    dialogue: [
      { dialogue: 'c1_archivist_after', requires: ['c1_file_found'] },
      { dialogue: 'c1_archivist_wait', requires: ['c1_hint_household'] },
      { dialogue: 'c1_archivist_hint', requires: ['c1_clue_gap'] },
      { dialogue: 'c1_archivist_intro', unless: ['c1_met_archivist'] },
      { dialogue: 'c1_archivist_repeat' },
    ],
  },
  {
    id: 'shelf-treason',
    kind: 'inspect',
    label: 'Treason Proceedings',
    ...shelfFront('shelf-treason'),
    radius: 1.0,
    dialogue: [
      { dialogue: 'c1_shelf_treason_after', requires: ['c1_clue_gap'] },
      { dialogue: 'c1_shelf_treason' },
    ],
  },
  {
    id: 'shelf-household',
    kind: 'inspect',
    label: 'Household Ledgers',
    ...shelfFront('shelf-household'),
    radius: 1.0,
    dialogue: [
      { dialogue: 'c1_shelf_household_after', requires: ['c1_file_found'] },
      { dialogue: 'c1_shelf_household_file', requires: ['c1_hint_household'] },
      { dialogue: 'c1_shelf_household_early' },
    ],
  },
  {
    id: 'shelf-grants',
    kind: 'inspect',
    label: 'Land Grants',
    ...shelfFront('shelf-grants'),
    radius: 1.0,
    dialogue: [{ dialogue: 'c1_shelf_grants' }],
  },
  {
    id: 'vault-door',
    kind: 'inspect',
    label: 'Iron Door',
    x: VAULT_DOOR.x,
    z: -3.3,
    radius: 1.2,
    when: { unless: ['c1_vault_found'] },
    dialogue: [
      { dialogue: 'c1_vault_door', requires: ['c1_file_found'] },
      { dialogue: 'c1_vault_early' },
    ],
  },
  {
    // Once the door has opened (also for saves from the old 1.2 cliffhanger).
    id: 'vault-enter',
    kind: 'enter',
    label: 'Vault',
    x: VAULT_DOOR.x,
    z: -3.3,
    radius: 1.2,
    when: { requires: ['c1_vault_found'] },
    enter: { scene: 'vault', spawn: 'entrance' },
  },
  {
    id: 'npc-daniel-archives',
    kind: 'talk',
    label: 'Daniel',
    x: 1.8,
    z: 2.6,
    radius: 1.4,
    npc: 'daniel',
    dialogue: [{ dialogue: 'c1_daniel_archives' }],
  },
  {
    id: 'archives-exit',
    kind: 'enter',
    label: 'Waterfront',
    x: 0,
    z: 3.3,
    radius: 0.9,
    enter: { scene: 'waterfront', spawn: 'archives_door' },
  },
];

const COLLIDERS: Box[] = [
  ...SHELVES.map((s) => boxFromCenter(s.x, s.z, s.width, SHELF_DEPTH)),
  ...BACK_SHELVES.map((s) => boxFromCenter(s.x, s.z, s.width, SHELF_DEPTH)),
  boxFromCenter(DESK.x, DESK.z, DESK.width, DESK.depth),
  ...ARCHIVE_NPCS.map((n) => boxFromCenter(n.x, n.z, NPC_COLLIDER_SIZE, NPC_COLLIDER_SIZE)),
];

export const ARCHIVES_LAYOUT: SceneLayout = {
  bounds: ARCHIVE_ROOM,
  colliders: () => COLLIDERS,
  interactables: ARCHIVE_INTERACTABLES,
  npcs: ARCHIVE_NPCS,
};

export const ARCHIVES_DIALOGUE: DialogueDef[] = [
  {
    id: 'c1_archives_arrival',
    lines: [
      {
        speaker: null,
        text: 'Inside, the Royal Archives smell of paper, dust and old varnish. Dawn light slants through the high windows.',
        setFlags: ['c1_entered_archives'],
      },
      { speaker: 'daniel', text: 'The Archivist runs this place like a fortress. Be polite. Be very polite.' },
    ],
  },
  {
    id: 'c1_archivist_intro',
    lines: [
      { speaker: 'archivist', text: 'Visitors at dawn. How unusual. You may look, you may read. You may not remove so much as a comma.' },
      { speaker: 'adrian', text: 'We are looking for treason records. Around 1921. The name is Vale.' },
      { speaker: 'archivist', text: '...Treason proceedings are in the east stacks, at the back.' },
      { speaker: 'archivist', text: 'I would be surprised if you find what you are looking for.' },
    ],
    setFlags: ['c1_met_archivist'],
  },
  {
    id: 'c1_archivist_repeat',
    lines: [{ speaker: 'archivist', text: 'East stacks, at the back. Treason proceedings. Mind the ribbons; they are older than you.' }],
  },
  {
    id: 'c1_shelf_treason',
    lines: [
      { speaker: null, text: 'Treason Proceedings, 1890 to 1940. Fat folders tied with red ribbon, the names of the accused in faded gold.' },
      { speaker: null, text: 'Under V: Vanes, Varga, Vaz... then a gap the width of one folder. Only dust.' },
      { speaker: 'adrian', text: 'Someone took it. Or wanted it to look that way.' },
    ],
    setFlags: ['c1_clue_gap'],
  },
  {
    id: 'c1_shelf_treason_after',
    lines: [{ speaker: null, text: 'The gap under V is still there: a neat, deliberate absence.' }],
  },
  {
    id: 'c1_archivist_hint',
    lines: [
      { speaker: 'adrian', text: 'The Vale folder is gone. There is just a gap on the shelf.' },
      { speaker: 'archivist', text: 'Nothing leaves this building, Mr Vale. Things are only... put somewhere else.' },
      { speaker: 'archivist', text: 'When the palace was embarrassed, it filed the embarrassment with the household accounts. Candles, carriages, inconvenient people.' },
      { speaker: 'archivist', text: 'The west stacks, nearest the door. Household ledgers.' },
    ],
    setFlags: ['c1_met_archivist', 'c1_hint_household'],
  },
  {
    id: 'c1_archivist_wait',
    lines: [
      { speaker: 'archivist', text: 'The household ledgers, Mr Vale. I have catalogued them for thirty years. Nobody has ever asked about them before today.' },
    ],
  },
  {
    id: 'c1_shelf_household_early',
    lines: [{ speaker: null, text: 'Palace household ledgers: candles, carriages, and a surprising number of umbrellas.' }],
  },
  {
    id: 'c1_shelf_household_file',
    lines: [
      { speaker: null, text: 'Between two ledgers for the year 1921, a thin folder with nothing written on its spine.' },
      { speaker: null, style: 'inscription', text: 'VALE — NOT FOR THE RECORD' },
      { speaker: null, text: 'Most pages are blacked out. One survives: a copy of the order to empty the river villages.' },
      { speaker: null, style: 'inscription', text: 'By order of the Lord Chamberlain, R. Harrow. Royal seal affixed.' },
      { speaker: null, text: 'Below it, the line for the Rajah\'s own signature is empty.' },
      { speaker: 'adrian', text: 'The Rajah never signed it. Someone used his seal without him.' },
      { speaker: 'archivist', text: 'That folder was not in my catalogue, Mr Vale.' },
      { speaker: 'archivist', text: 'Neither, officially, is the door at the back of this room. The iron one. It bears your sign.' },
    ],
    setFlags: ['c1_file_found'],
  },
  {
    id: 'c1_shelf_household_after',
    lines: [{ speaker: null, text: 'The ledgers sit closed again, the thin folder tucked safely inside Adrian\'s jacket. Copied, not removed. Mostly.' }],
  },
  {
    id: 'c1_shelf_grants',
    lines: [
      { speaker: null, text: 'Land grants along the Rajang River, 1880 to 1920.' },
      { speaker: null, text: 'One grant to the Vale family, 1898: "for service to the river villages". A red line strikes through it, dated 1921.' },
      { speaker: 'adrian', text: '1921. The same year as the treason charge.' },
    ],
  },
  {
    id: 'c1_archivist_after',
    lines: [
      { speaker: 'archivist', text: 'The iron door, Mr Vale. In thirty years I have never heard it make a sound.' },
      { speaker: 'archivist', text: 'This morning, since you walked in, it has been humming.' },
    ],
  },
  {
    id: 'c1_vault_early',
    lines: [
      { speaker: null, text: 'A door of black iron set deep in the stone. No handle, no keyhole. Only a worn carving of a sword over a river.' },
      { speaker: 'adrian', text: 'Our sign again. What is it doing in the Crown\'s archive?' },
    ],
  },
  {
    id: 'c1_vault_door',
    lines: [
      { speaker: null, text: 'As Adrian steps close, the medallion under his shirt grows warm.' },
      { speaker: null, text: 'The carving on the iron door begins to glow, line by line: sword, then river.', setFlags: ['c1_vault_found'] },
      { speaker: 'daniel', text: 'Adrian... the floor is shaking.' },
      { speaker: null, text: 'With a groan of old iron, the door swings inward. Cold air breathes out of the dark.' },
      { speaker: 'daniel', text: 'I will hold the hall. Shout if you need me.' },
    ],
    enterScene: { scene: 'vault', spawn: 'entrance' },
  },
  {
    id: 'c1_daniel_archives',
    lines: [
      { speaker: 'daniel', text: 'I will keep the door. If anyone from the palace walks in, you are a visiting scholar and I am your very bored driver.' },
    ],
  },
];
