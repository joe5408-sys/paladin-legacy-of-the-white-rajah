/**
 * Chapter 3, Milestone 3.3 — The Palace Gate. Pure data.
 *
 * The Palace forecourt in the morning (an invented palace; not the real Astana).
 * North: the forecourt wall with tall gold-tipped gates (x 0) and the white
 * Palace beyond. The Clerk of Petitions at a small desk west of the gate;
 * Sergeant Osman and another officer east of it. Clipped hedges on both sides,
 * a queue of petitioners by the west hedge, and the river steps to the south,
 * where Adrian, Mara, Pell and Daniel come up from the first ferry.
 *
 * Story order: arrival → the Clerk registers the petition → Sergeant Osman has
 * orders to detain Adrian; Daniel faces her → the Crowned Sentinel walks out of
 * the gate → battle → it withdraws at the sight of the medallion → the gates
 * begin to close, the petitioners stand in the gateway, the Clerk invokes custom,
 * Osman lets them through → "To Be Continued".
 */
import { boxFromCenter, type Box } from '../../game/core/collision';
import type { StoryFlags } from '../../game/core/flags';
import type { DialogueDef } from '../../game/dialogue/types';
import type { Interactable } from '../../game/interaction/interaction';
import { NPC_COLLIDER_SIZE, type NpcPlacement, type SceneLayout } from '../../game/scenes/layout';
import type { Objective } from '../../data/quests';

export const GATE_BOUNDS: Box = { minX: -9, maxX: 9, minZ: -4.6, maxZ: 4.6 };
/** The gateway in the forecourt wall (the wall runs along the north edge). */
export const GATE = { x: 0, z: -4.9, width: 3.0 };
export const CLERK_DESK = { x: -2.6, z: -3.4, width: 1.4, depth: 0.6 };
export const HEDGES = [
  { x: -6.0, z: -1.5, width: 3.0, depth: 1.6 },
  { x: 6.0, z: -1.5, width: 3.0, depth: 1.6 },
];
/** Where the Crowned Sentinel stands once it has walked out of the gate. */
export const SENTINEL_AT_GATE = { x: 0, z: -3.9 };
export const SENTINEL_SIZE = { width: 1.0, depth: 0.6 };

const npc = (id: string, character: NpcPlacement['character'], x: number, z: number, facing: NpcPlacement['facing']): NpcPlacement => ({
  id,
  character,
  x,
  z,
  facing,
});

export const GATE_NPCS: NpcPlacement[] = [
  npc('npc-clerk', 'clerk', CLERK_DESK.x, -4.1, 'south'),
  npc('npc-sergeant', 'sergeant', 1.2, -3.9, 'south'),
  npc('npc-gate-officer', 'officer', 2.6, -3.9, 'south'),
  // The queue of petitioners along the west hedge, facing the Clerk
  npc('npc-teacher', 'teacher', -4.0, -1.4, 'north'),
  npc('npc-fisher', 'fisher', -4.0, -0.2, 'north'),
  npc('npc-auntie-gate', 'auntie', -4.0, 1.0, 'north'),
  // Adrian's party, up from the river steps
  npc('npc-daniel-gate', 'daniel', -1.4, 3.0, 'north'),
  npc('npc-mara-gate', 'mara', 1.4, 3.3, 'north'),
  npc('npc-pell-gate', 'pell', 2.6, 2.9, 'north'),
];

const at = (id: string) => GATE_NPCS.find((n) => n.id === id)!;
const talk = (id: string, label: string, dialogue: Interactable['dialogue'], radius = 1.2): Interactable => ({
  id,
  kind: 'talk',
  label,
  x: at(id).x,
  z: at(id).z,
  radius,
  npc: at(id).character,
  dialogue,
});

export const GATE_INTERACTABLES: Interactable[] = [
  talk('npc-clerk', 'Clerk of Petitions', [
    { dialogue: 'c3_clerk', unless: ['c3_petition_registered'] },
    { dialogue: 'c3_clerk_after' },
  ], 1.7), // across the desk
  talk('npc-sergeant', 'Sergeant Osman', [
    { dialogue: 'c3_sergeant_after', requires: ['c3_petition_registered'] },
    { dialogue: 'c3_sergeant_early' },
  ]),
  {
    id: 'npc-gate-officer',
    kind: 'inspect',
    label: 'Royal Security Officer',
    x: 2.6,
    z: -3.9,
    radius: 1.2,
    dialogue: [{ dialogue: 'c3_gate_officer' }],
  },
  talk('npc-teacher', 'Schoolteacher', [{ dialogue: 'c3_teacher' }]),
  talk('npc-fisher', 'Fisherman', [{ dialogue: 'c3_fisher' }]),
  talk('npc-auntie-gate', 'Auntie', [{ dialogue: 'c3_auntie_gate' }]),
  talk('npc-daniel-gate', 'Daniel', [{ dialogue: 'c3_daniel_gate' }]),
  talk('npc-mara-gate', 'Aunt Mara', [{ dialogue: 'c3_mara_gate' }]),
  talk('npc-pell-gate', 'Julian Pell', [{ dialogue: 'c3_pell_gate' }]),
  {
    id: 'palace-gate',
    kind: 'inspect',
    label: 'Palace Gate',
    x: GATE.x,
    z: GATE_BOUNDS.minZ + 0.5,
    radius: 1.0,
    when: { unless: ['c3_sentinel_woken'] },
    dialogue: [{ dialogue: 'c3_gate_closed' }],
  },
  {
    // Only needed if the game was closed mid-battle.
    id: 'crowned-sentinel',
    kind: 'inspect',
    label: 'Crowned Sentinel',
    x: SENTINEL_AT_GATE.x,
    z: SENTINEL_AT_GATE.z + 1.0,
    radius: 1.2,
    when: { requires: ['c3_sentinel_woken'], unless: ['c3_sentinel_withdrew'] },
    dialogue: [{ dialogue: 'c3_sentinel_again' }],
  },
];

const FIXED_COLLIDERS: Box[] = [
  boxFromCenter(CLERK_DESK.x, CLERK_DESK.z, CLERK_DESK.width, CLERK_DESK.depth),
  ...HEDGES.map((h) => boxFromCenter(h.x, h.z, h.width, h.depth)),
  ...GATE_NPCS.map((n) => boxFromCenter(n.x, n.z, NPC_COLLIDER_SIZE, NPC_COLLIDER_SIZE)),
];
const SENTINEL_COLLIDER = boxFromCenter(SENTINEL_AT_GATE.x, SENTINEL_AT_GATE.z, SENTINEL_SIZE.width, SENTINEL_SIZE.depth);

export const GATE_LAYOUT: SceneLayout = {
  bounds: GATE_BOUNDS,
  // The Sentinel blocks the gateway between walking out and withdrawing.
  colliders: (flags: StoryFlags) => [
    ...FIXED_COLLIDERS,
    ...(flags.c3_sentinel_woken && !flags.c3_sentinel_withdrew ? [SENTINEL_COLLIDER] : []),
  ],
  interactables: GATE_INTERACTABLES,
  npcs: GATE_NPCS,
};

export const GATE_OBJECTIVES: Objective[] = [
  { id: 'c3_clerk', text: 'Give the petition to the Clerk of Petitions.', completeWhen: 'c3_petition_registered' },
  { id: 'c3_gate', text: 'Get through the Palace gate.', completeWhen: 'c3_gate_open' },
];

export const GATE_DIALOGUE: DialogueDef[] = [
  {
    id: 'c3_gate_arrival',
    lines: [
      { speaker: null, text: 'Eight-forty. The first ferry has carried two dozen petitioners across the river, and Adrian among them with his hood up.', setFlags: ['c3_gate_arrived'] },
      { speaker: null, text: 'The Palace forecourt: white walls, clipped hedges, and tall gates tipped with gold. Closed. Beside them, at a little desk, sits the Clerk of Petitions with a register the size of a door.' },
      { speaker: 'daniel', text: 'Royal Security on the gate. The sergeant is Nadia Osman. My old partner.' },
      { speaker: 'mara', text: 'Is she the kind who arrests people?' },
      { speaker: 'daniel', text: 'She\'s the kind who does what\'s written down. So give the petition to the Clerk first. Then it\'s written down.' },
    ],
  },
  {
    id: 'c3_clerk',
    lines: [
      { speaker: 'clerk', text: 'Good morning, good morning! Name, village, and the nature of your... is that a sponsored petition?' },
      { speaker: 'clerk', text: 'Charter 114! Sealed and witnessed! Young man, I have opened the Petition Hour every month for forty years, and nobody has brought me a sponsored petition since I had hair.' },
      { speaker: null, text: 'He writes it into the register in slow, beautiful letters.' },
      { speaker: null, style: 'inscription', text: 'ADRIAN VALE, OF SUNGAI AWAN. PETITION CONCERNING THE RIVER CHARTER OF 1921.', setFlags: ['c3_petition_registered'] },
      { speaker: 'clerk', text: 'There. It is written, and nobody may unwrite it. Not even the Lord Chamberlain. Through the gate at nine, if you please.' },
    ],
    next: 'c3_sergeant_blocks',
  },
  {
    id: 'c3_sergeant_blocks',
    lines: [
      { speaker: 'sergeant', text: 'Mr Vale. Stop there, please.' },
      { speaker: 'sergeant', text: 'Lord Chamberlain\'s orders. You are to be detained at the gate for questioning.' },
      { speaker: 'daniel', text: 'Nadia.' },
      { speaker: 'sergeant', text: 'Danny. I wondered when you\'d turn up.' },
      { speaker: 'daniel', text: 'He\'s a registered petitioner. You know what the regulations say about petitioners in the Hour.' },
      { speaker: 'sergeant', text: 'I know what my orders say. ...I also know you never once lied to me in nine years.' },
      { speaker: null, text: 'Before she can decide, the gate behind her groans. Something on the other side is walking.' },
      { speaker: null, text: 'It ducks under the arch: a tall figure in ivory and gold, with a crowned helm and a ceremonial halberd. On its chest, the royal seal is riveted over an older mark.', setFlags: ['c3_sentinel_woken'] },
      { speaker: 'pell', text: 'That\'s the Crowned Sentinel. It stands in the Throne Hall. It\'s on postcards. It isn\'t supposed to move!' },
      { speaker: 'mara', text: 'Neither was the last one.' },
    ],
    startBattle: 'crowned_sentinel_gate',
  },
  {
    id: 'c3_sentinel_again',
    lines: [{ speaker: null, text: 'The Crowned Sentinel stands in the gateway, its halberd lowered across it.' }],
    startBattle: 'crowned_sentinel_gate',
  },
  {
    // The end of Milestone 3.3.
    id: 'c3_sentinel_withdraws',
    lines: [
      { speaker: null, text: 'The halberd stops a hand\'s width from Adrian\'s shoulder. The Sentinel\'s visor turns to the medallion, glowing at his collar.' },
      { speaker: null, text: 'For a long moment it does not move. Then it lifts the halberd, turns, and walks back through the gate into the Palace.' },
      { speaker: 'daniel', text: 'It knew that sign.' },
      { speaker: null, text: 'Inside, someone is shouting for the gates to be closed. Two guards begin to swing them shut.' },
      { speaker: null, text: 'The auntie with the pension form steps into the gateway and stays there. The fisherman stands beside her. Then the schoolteacher. Then everyone else.' },
      { speaker: 'clerk', text: 'The Petition Hour is open! By custom, no gate may be closed on a petitioner! It is in the register!' },
      { speaker: 'sergeant', text: '...You heard the Clerk. The gates stay open.' },
      { speaker: 'sergeant', text: 'I didn\'t see you, Danny. Any of you. Go on.', setFlags: ['c3_gate_open'] },
    ],
    endChapter: true,
  },
  {
    id: 'c3_clerk_after',
    lines: [{ speaker: 'clerk', text: 'It is written! Nine o\'clock, through the gate. Oh, I haven\'t been this excited since the flood of \'98.' }],
  },
  {
    id: 'c3_sergeant_early',
    lines: [{ speaker: 'sergeant', text: 'Petitions go to the Clerk, sir. The gate opens at nine.' }],
  },
  {
    id: 'c3_sergeant_after',
    lines: [{ speaker: 'sergeant', text: 'Keep your hood up, Mr Vale. I\'m trying very hard not to recognise you.' }],
  },
  {
    id: 'c3_gate_officer',
    lines: [{ speaker: null, text: 'A young officer at the gate, staring very carefully at a point just above Adrian\'s head.' }],
  },
  {
    id: 'c3_teacher',
    lines: [{ speaker: 'teacher', text: 'The school bus to my village stopped last year. Forty children. I\'ve brought their drawings for His Majesty. Some of them are of the bus.' }],
  },
  {
    id: 'c3_fisher',
    lines: [{ speaker: 'fisher', text: 'Fishing licence. Somebody moved the boundary marker into the middle of my river. I would like it moved back, please.' }],
  },
  {
    id: 'c3_auntie_gate',
    lines: [{ speaker: 'auntie', text: 'You! From the boat, with the rambutans! I have posted this pension form for three years. Today I give it to the Rajah\'s own clerk, with my own hand.' }],
  },
  {
    id: 'c3_daniel_gate',
    lines: [{ speaker: 'daniel', text: 'Clerk first. Then it\'s written down, and Nadia has to think twice.' }],
  },
  {
    id: 'c3_mara_gate',
    lines: [{ speaker: 'mara', text: 'Hood up, back straight. Petitioners do not slouch.' }],
  },
  {
    id: 'c3_pell_gate',
    lines: [{ speaker: 'pell', text: 'My father had lunch here once. He complained about the soup for a year.' }],
  },
  {
    id: 'c3_gate_closed',
    lines: [{ speaker: null, text: 'Tall iron gates tipped with gold, and beyond them the white Palace. Locked until nine.' }],
  },
];
