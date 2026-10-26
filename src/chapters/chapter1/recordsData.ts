/**
 * Chapter 1, Milestone 1.4 — the sealed records room behind the vault's inner gate. Pure data.
 *
 * A long, low room of tin record boxes. Room: x -4.5..4.5, z -4..3.
 *   Reading table (middle)      the VALE box
 *   East shelf (middle)         Private Office correspondence: the Rajah's reply
 *   North-west corner           an old flood door down to the river
 *   South gate                  back to the vault (until palace security blocks it)
 */
import { boxFromCenter, type Box } from '../../game/core/collision';
import { meetsCondition, type StoryFlags } from '../../game/core/flags';
import type { DialogueDef } from '../../game/dialogue/types';
import type { Interactable } from '../../game/interaction/interaction';
import { NPC_COLLIDER_SIZE, type NpcPlacement, type SceneLayout } from '../../game/scenes/layout';

export const RECORDS_ROOM: Box = { minX: -4.5, maxX: 4.5, minZ: -4, maxZ: 3 };
export const RECORDS_WALL_HEIGHT = 3.2;

/** Shelves of tin record boxes. `alongZ` shelves stand against a side wall. */
export interface BoxShelf {
  x: number;
  z: number;
  /** Size along x and z. */
  sx: number;
  sz: number;
}
export const BOX_SHELVES: BoxShelf[] = [
  { x: 0.6, z: -3.6, sx: 4.4, sz: 0.6 }, // the last shelf, along the back wall
  { x: -3.75, z: -1.4, sx: 0.7, sz: 1.6 },
  { x: -3.75, z: 0.8, sx: 0.7, sz: 1.6 },
  { x: 3.75, z: -2.4, sx: 0.7, sz: 1.6 },
  { x: 3.75, z: -0.4, sx: 0.7, sz: 1.6 }, // Private Office correspondence
  { x: 3.75, z: 1.6, sx: 0.7, sz: 1.4 },
];
export const PRIVATE_OFFICE_SHELF = BOX_SHELVES[4];

export const READING_TABLE = { x: 0, z: -0.6, width: 1.6, depth: 0.9 };
export const FLOOD_DOOR = { x: -3.2, width: 1.1, height: 1.9 };

const SECURITY = { requires: ['c1_security_arrived' as const] };
const DARK = { requires: ['c1_lights_out' as const] };

export const RECORDS_NPCS: NpcPlacement[] = [
  { id: 'npc-harrow', character: 'harrow', x: 0, z: 0.9, facing: 'east', when: SECURITY },
  { id: 'npc-officer-west', character: 'officer', x: -1.2, z: 2.3, facing: 'north', when: SECURITY },
  { id: 'npc-officer-east', character: 'officer', x: 1.2, z: 2.3, facing: 'north', when: SECURITY },
  { id: 'npc-daniel-records', character: 'daniel', x: 2.3, z: 1.2, facing: 'west', when: SECURITY },
  // In the dark, the Archivist waits at the flood door with a lantern.
  { id: 'npc-archivist-records', character: 'archivist', x: -2.1, z: -3.5, facing: 'west', when: DARK },
];

export const RECORDS_INTERACTABLES: Interactable[] = [
  {
    id: 'vale-box',
    kind: 'inspect',
    label: 'VALE Box',
    x: READING_TABLE.x,
    z: READING_TABLE.z + 0.9,
    radius: 1.1,
    dialogue: [
      { dialogue: 'c1_vale_box', unless: ['c1_box_read'] },
      { dialogue: 'c1_vale_box_after' },
    ],
  },
  {
    id: 'shelf-private-office',
    kind: 'inspect',
    label: 'Private Office Records',
    x: PRIVATE_OFFICE_SHELF.x - 0.75,
    z: PRIVATE_OFFICE_SHELF.z,
    radius: 1.0,
    dialogue: [
      { dialogue: 'c1_rajah_letter', requires: ['c1_box_read'], unless: ['c1_letter_found'] },
      { dialogue: 'c1_private_office_after', requires: ['c1_letter_found'] },
      { dialogue: 'c1_private_office_early' },
    ],
  },
  {
    id: 'records-boxes',
    kind: 'inspect',
    label: 'Record Boxes',
    x: -3.0,
    z: 0.8,
    radius: 0.9,
    when: { unless: ['c1_lights_out'] },
    dialogue: [{ dialogue: 'c1_records_boxes' }],
  },
  {
    id: 'flood-door',
    kind: 'inspect',
    label: 'Flood Door',
    x: FLOOD_DOOR.x,
    z: RECORDS_ROOM.minZ + 0.7,
    radius: 1.0,
    dialogue: [
      { dialogue: 'c1_flood_door', requires: ['c1_lights_out'] },
      { dialogue: 'c1_flood_door_early' },
    ],
  },
  {
    id: 'npc-harrow',
    kind: 'talk',
    label: 'Lord Chamberlain',
    x: 0,
    z: 0.9,
    radius: 1.3,
    npc: 'harrow',
    when: DARK,
    dialogue: [{ dialogue: 'c1_harrow_dark' }],
  },
  {
    id: 'npc-daniel-records',
    kind: 'talk',
    label: 'Daniel',
    x: 2.3,
    z: 1.2,
    radius: 1.2,
    npc: 'daniel',
    when: DARK,
    dialogue: [{ dialogue: 'c1_daniel_dark' }],
  },
  {
    id: 'records-exit',
    kind: 'enter',
    label: 'Vault',
    x: 0,
    z: 2.75,
    radius: 0.8,
    when: { unless: ['c1_security_arrived'] },
    enter: { scene: 'vault', spawn: 'inner_gate' },
  },
];

const FIXED: Box[] = [
  ...BOX_SHELVES.map((s) => boxFromCenter(s.x, s.z, s.sx, s.sz)),
  boxFromCenter(READING_TABLE.x, READING_TABLE.z, READING_TABLE.width, READING_TABLE.depth),
];

export const RECORDS_LAYOUT: SceneLayout = {
  bounds: RECORDS_ROOM,
  // People only block the way while they are in the room.
  colliders: (flags: StoryFlags) => [
    ...FIXED,
    ...RECORDS_NPCS.filter((n) => meetsCondition(n.when, flags)).map((n) =>
      boxFromCenter(n.x, n.z, NPC_COLLIDER_SIZE, NPC_COLLIDER_SIZE),
    ),
  ],
  interactables: RECORDS_INTERACTABLES,
  npcs: RECORDS_NPCS,
};

export const RECORDS_DIALOGUE: DialogueDef[] = [
  {
    id: 'c1_records_arrival',
    lines: [
      { speaker: null, text: 'Beyond the gate, a long, low room. Shelves of tin boxes run back into the dark, each stencilled with a name: families, villages, whole river districts.', setFlags: ['c1_entered_records'] },
      { speaker: null, text: 'On a reading table in the middle, as if someone had been expecting a visitor, sits one box on its own.' },
      { speaker: 'adrian', text: 'VALE.' },
    ],
  },
  {
    id: 'c1_records_boxes',
    lines: [
      { speaker: null, text: 'KAMPUNG BATU. SUNGAI LIMAU. TANJUNG ARU. Each box is a village that is no longer on any map.' },
      { speaker: 'adrian', text: 'We weren\'t the only ones they erased.' },
    ],
  },
  {
    id: 'c1_vale_box',
    lines: [
      { speaker: null, text: 'A plain tin box, sealed with wax. Inside, a bundle of papers tied with faded ribbon.' },
      { speaker: null, style: 'inscription', text: 'CONCESSION: The river lands from Sungai Awan to the sea, granted to the Harrow & Pell Timber Company. The villages to be cleared by the Paladins of the Crown.' },
      { speaker: null, text: 'A share register is pinned to it. Half of the company belonged to R. Harrow.' },
      { speaker: 'adrian', text: 'So that was the reason. Not rebellion. Not security. Timber.' },
      { speaker: null, text: 'Beneath it lies a charge sheet. In the public stacks every copy had the name blacked out. This one does not.' },
      { speaker: null, style: 'inscription', text: 'Charged with treason: ELIAS VALE, Paladin of the Crown, for refusing a lawful order.' },
      { speaker: 'adrian', text: 'Elias Vale. The name they cut out of every record. My great-grandfather.', setFlags: ['c1_box_read'] },
      { speaker: null, text: 'At the bottom of the box is an empty folder labelled "H.H. — reply". Whatever it held has been filed somewhere else.' },
      { speaker: 'adrian', text: 'The Rajah answered him. The Private Office records should be here somewhere.' },
    ],
  },
  {
    id: 'c1_vale_box_after',
    lines: [{ speaker: null, text: 'The concession, the share register and the charge sheet. Adrian tucks them back into the tin box and keeps it close.' }],
  },
  {
    id: 'c1_private_office_early',
    lines: [{ speaker: null, text: 'Correspondence of the Private Office of His Highness the Rajah, 1919 to 1923. Hundreds of letters, all neatly filed.' }],
  },
  {
    id: 'c1_rajah_letter',
    lines: [
      { speaker: null, text: 'In the box for 1921, one letter has been filed under the wrong month. Perhaps on purpose.' },
      { speaker: null, style: 'inscription', text: 'Elias. I will not sign Harrow\'s order. The river villages are my people, and the Crown was made to keep them, not to sell them.' },
      { speaker: null, style: 'inscription', text: 'Harrow has my seal and the Council\'s ear. Keep the sign safe until the Crown deserves it again.' },
      { speaker: null, text: 'It is signed by the Rajah, in his own hand.' },
      { speaker: 'adrian', text: 'He was on our side. The Rajah was on our side, and he still lost.', setFlags: ['c1_letter_found'] },
    ],
    next: 'c1_security',
  },
  {
    id: 'c1_private_office_after',
    lines: [{ speaker: null, text: 'The rest of 1921 is invitations and complaints about the weather.' }],
  },
  {
    id: 'c1_security',
    lines: [
      { speaker: null, text: 'Boots on the stone steps. Torchlight swings through the vault behind the gate.', setFlags: ['c1_security_arrived'] },
      { speaker: 'daniel', text: 'Adrian, I\'m sorry. They came through the reading room. I couldn\'t stop them.' },
      { speaker: null, text: 'Two officers of the Royal Security Office step through the gate. Between them walks a tall man in a dark morning coat, a gold chain of office across his chest.' },
      { speaker: 'harrow', text: 'Mr Vale. Edmund Harrow, Lord Chamberlain. My great-grandfather held the same office. I believe you have been reading his letters.' },
      { speaker: 'adrian', text: 'He emptied seven villages for a timber company he owned, and he used the Rajah\'s seal to do it.' },
      { speaker: 'harrow', text: 'He kept the peace. Paper is how a crown keeps the peace, Mr Vale. Swords are for stories.' },
      { speaker: 'harrow', text: 'Give me the box, and the medallion under your shirt. Then you can go home to your village, while it is still there.' },
      { speaker: 'adrian', text: '...While it is still there?' },
      { speaker: 'harrow', text: 'Officers.' },
      { speaker: 'daniel', text: 'Sir, he is a civilian. There is no warrant.' },
      { speaker: 'harrow', text: 'Then you will write one, Officer Rengas.' },
      { speaker: null, text: 'The medallion burns against Adrian\'s chest. Every lamp in the room flickers...' },
      { speaker: null, text: '...and goes out.', setFlags: ['c1_lights_out'] },
      { speaker: 'archivist', text: '(close by, in the dark) The Archives close at noon, Lord Chamberlain. Mr Vale: the flood door, behind the last shelf. Quickly.' },
      { speaker: 'daniel', text: 'Go! I\'ll keep them busy. They can\'t make me disappear. Not quickly.' },
    ],
  },
  {
    id: 'c1_harrow_dark',
    lines: [{ speaker: 'harrow', text: 'Somebody find the lights! Nobody leaves this room!' }],
  },
  {
    id: 'c1_daniel_dark',
    lines: [{ speaker: 'daniel', text: 'I said go, Adrian! The flood door!' }],
  },
  {
    id: 'c1_flood_door_early',
    lines: [
      { speaker: null, text: 'A low iron door in the corner, green with rust. A brass plate reads FLOOD DOOR. Beyond it, faintly, the sound of the river.' },
    ],
  },
  {
    id: 'c1_flood_door',
    lines: [
      { speaker: null, text: 'The Archivist holds the flood door open, a lantern in her hand. Stone steps run down to black water.' },
      { speaker: 'archivist', text: 'Your great-grandfather used this door too, Mr Vale. In 1921. I found his name in my catalogue this morning, where somebody forgot to black it out.' },
      { speaker: 'archivist', text: 'Take the box. Nothing leaves this building... officially.' },
      { speaker: null, text: 'At the bottom of the steps a sampan rocks on the tide. Sitting in it, under a large umbrella, is a familiar figure.' },
      { speaker: 'mara', text: 'Get in. I have been sitting in this boat since dawn, and the mosquitoes have formed a union.' },
      { speaker: 'adrian', text: 'Daniel stayed behind. And Harrow said "while it is still there", Aunt. About Sungai Awan.' },
      { speaker: 'mara', text: 'Then we go home, before he does. Elias did not hide everything in a palace.' },
      { speaker: null, text: 'The sampan slides out from under the Archives into the brown river, as the bells of the capital ring noon.', setFlags: ['c1_escaped'] },
    ],
    endChapter: true,
  },
];
