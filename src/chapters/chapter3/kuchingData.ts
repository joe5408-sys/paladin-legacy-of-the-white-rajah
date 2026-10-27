/**
 * Chapter 3, Milestone 3.2 — A Wanted Man. Pure data.
 *
 * Waterfront (before dawn): the Chapter 1 waterfront with shutters down, wanted
 *   posters on the lamp posts and two Royal Security officers on the ferry pier.
 *   Adrian lands at the fuel jetty (east end) and crosses the plaza, away from
 *   the pier, to Kak Jamilah's stall by the bandstand.
 * Jamilah's room: the small room above her stall. The Archivist's note on the
 *   table, Mara and Pell, a window onto the Palace across the river.
 *
 * Story order: arrival → Kak Jamilah → up the back stairs → the Archivist's note
 * (the Petition Hour needs a Crown charter-holder's seal) → Pell's choice (the
 * first dialogue choice: every reply leads to him signing) → Daniel arrives with
 * a plan → "To Be Continued".
 */
import { boxFromCenter, type Box } from '../../game/core/collision';
import type { DialogueDef } from '../../game/dialogue/types';
import type { Interactable } from '../../game/interaction/interaction';
import { NPC_COLLIDER_SIZE, type NpcPlacement, type SceneLayout } from '../../game/scenes/layout';
import type { Objective } from '../../data/quests';
import { BANDSTAND, STALL, WATERFRONT_BOUNDS, WF_BUILDINGS, WF_PROPS } from '../chapter1/data';

// ── Waterfront before dawn ──────────────────────────────

/** Lamp posts carrying a wanted poster (all the waterfront's lamps). */
export const POSTER_LAMPS = WF_PROPS.filter((p) => p.kind === 'lamp');
const POSTER = POSTER_LAMPS.find((p) => p.x < 0)!; // the one by the bandstand, off the pier's sightline

export const WATERFRONT_NIGHT_NPCS: NpcPlacement[] = [
  { id: 'npc-jamilah-night', character: 'jamilah', x: STALL.x, z: 1.6, facing: 'north' },
  { id: 'officer-pier-1', character: 'officer', x: 8.4, z: -4.4, facing: 'south' },
  { id: 'officer-pier-2', character: 'officer', x: 9.6, z: -4.4, facing: 'west' },
  { id: 'npc-mara-wf', character: 'mara', x: 12.4, z: -3.2, facing: 'west' },
  { id: 'npc-pell-wf', character: 'pell', x: 11.3, z: -3.6, facing: 'west' },
];

export const WATERFRONT_NIGHT_INTERACTABLES: Interactable[] = [
  {
    id: 'npc-jamilah-night',
    kind: 'talk',
    label: 'Kak Jamilah',
    x: STALL.x,
    z: 1.6,
    radius: 1.7,
    npc: 'jamilah',
    dialogue: [{ dialogue: 'c3_jamilah' }],
  },
  ...(['officer-pier-1', 'officer-pier-2'] as const).map(
    (id, i): Interactable => ({
      id,
      kind: 'inspect',
      label: 'Royal Security Officer',
      x: i === 0 ? 8.4 : 9.6,
      z: -4.4,
      radius: 1.3,
      dialogue: [{ dialogue: 'c3_officer' }],
    }),
  ),
  {
    id: 'wanted-poster',
    kind: 'inspect',
    label: 'Poster',
    x: POSTER.x,
    z: POSTER.z - 0.6,
    radius: 0.9,
    dialogue: [{ dialogue: 'c3_poster' }],
  },
  {
    id: 'npc-mara-wf',
    kind: 'talk',
    label: 'Aunt Mara',
    x: 12.4,
    z: -3.2,
    radius: 1.3,
    npc: 'mara',
    dialogue: [{ dialogue: 'c3_mara_wf' }],
  },
  {
    id: 'npc-pell-wf',
    kind: 'talk',
    label: 'Julian Pell',
    x: 11.3,
    z: -3.6,
    radius: 1.3,
    npc: 'pell',
    dialogue: [{ dialogue: 'c3_pell_wf' }],
  },
];

const WATERFRONT_NIGHT_COLLIDERS: Box[] = [
  ...WF_BUILDINGS.map((b) => boxFromCenter(b.x, b.z, b.width, b.depth)),
  ...WF_PROPS.filter((p) => p.collider).map((p) => boxFromCenter(p.x, p.z, p.collider!.width, p.collider!.depth)),
  boxFromCenter(STALL.x, STALL.z, STALL.width, STALL.depth),
  boxFromCenter(BANDSTAND.x, BANDSTAND.z, BANDSTAND.size, BANDSTAND.size),
  ...WATERFRONT_NIGHT_NPCS.map((n) => boxFromCenter(n.x, n.z, NPC_COLLIDER_SIZE, NPC_COLLIDER_SIZE)),
];

export const WATERFRONT_NIGHT_LAYOUT: SceneLayout = {
  bounds: WATERFRONT_BOUNDS,
  colliders: () => WATERFRONT_NIGHT_COLLIDERS,
  interactables: WATERFRONT_NIGHT_INTERACTABLES,
  npcs: WATERFRONT_NIGHT_NPCS,
};

// ── Kak Jamilah's room ──────────────────────────────────

export const ROOM_BOUNDS: Box = { minX: -3, maxX: 3, minZ: -2, maxZ: 2 };
export const ROOM_TABLE = { x: 0, z: -0.4, width: 1.4, depth: 0.8 };
export const ROOM_WINDOW = { x: 0, z: ROOM_BOUNDS.minZ };

export const ROOM_NPCS: NpcPlacement[] = [
  { id: 'npc-mara-room', character: 'mara', x: -1.9, z: -0.9, facing: 'south' },
  { id: 'npc-pell-room', character: 'pell', x: 1.9, z: -0.9, facing: 'south' },
];

export const ROOM_INTERACTABLES: Interactable[] = [
  {
    id: 'archivist-note',
    kind: 'inspect',
    label: "Archivist's Note",
    x: ROOM_TABLE.x,
    z: ROOM_TABLE.z + ROOM_TABLE.depth / 2 + 0.25,
    radius: 0.8,
    dialogue: [
      { dialogue: 'c3_note', unless: ['c3_read_note'] },
      { dialogue: 'c3_note_again' },
    ],
  },
  {
    id: 'npc-pell-room',
    kind: 'talk',
    label: 'Julian Pell',
    x: 1.9,
    z: -0.9,
    radius: 1.2,
    npc: 'pell',
    dialogue: [
      { dialogue: 'c3_pell_wait', unless: ['c3_read_note'] },
      { dialogue: 'c3_pell_ask', unless: ['c3_pell_signed'] },
      { dialogue: 'c3_pell_after' },
    ],
  },
  {
    id: 'npc-mara-room',
    kind: 'talk',
    label: 'Aunt Mara',
    x: -1.9,
    z: -0.9,
    radius: 1.2,
    npc: 'mara',
    dialogue: [
      { dialogue: 'c3_mara_room_after', requires: ['c3_read_note'] },
      { dialogue: 'c3_mara_room' },
    ],
  },
  {
    id: 'room-window',
    kind: 'inspect',
    label: 'Window',
    x: ROOM_WINDOW.x,
    z: ROOM_WINDOW.z + 0.4,
    radius: 0.9,
    dialogue: [{ dialogue: 'c3_window' }],
  },
];

const ROOM_COLLIDERS: Box[] = [
  boxFromCenter(ROOM_TABLE.x, ROOM_TABLE.z, ROOM_TABLE.width, ROOM_TABLE.depth),
  ...ROOM_NPCS.map((n) => boxFromCenter(n.x, n.z, NPC_COLLIDER_SIZE, NPC_COLLIDER_SIZE)),
];

export const ROOM_LAYOUT: SceneLayout = {
  bounds: ROOM_BOUNDS,
  colliders: () => ROOM_COLLIDERS,
  interactables: ROOM_INTERACTABLES,
  npcs: ROOM_NPCS,
};

// ── Story ───────────────────────────────────────────────

export const KUCHING_OBJECTIVES: Objective[] = [
  { id: 'c3_jamilah', text: "Get to Kak Jamilah's stall. Keep away from the pier.", completeWhen: 'c3_met_jamilah' },
  { id: 'c3_note', text: "Read the Archivist's note.", completeWhen: 'c3_read_note' },
  { id: 'c3_sponsor', text: 'Ask Pell to sponsor the petition.', completeWhen: 'c3_pell_signed' },
];

export const KUCHING_DIALOGUE: DialogueDef[] = [
  {
    id: 'c3_waterfront_arrival',
    lines: [
      { speaker: null, text: 'The fuel jetty below the shophouses, an hour before dawn. Kuching is shuttered and silent, and every lamp post wears the same poster.', setFlags: ['c3_kuching_arrived'] },
      { speaker: null, text: 'Out on the ferry pier, two Royal Security officers are sharing a flask and watching the river.' },
      { speaker: 'mara', text: 'Jamilah\'s stall is past the Archives, by the bandstand. She starts her broth at four. Go. And do not walk past that pier.' },
      { speaker: 'pell', text: 'We\'ll follow at a distance. Two strangers together are a story. Three are a parade.' },
    ],
  },
  {
    id: 'c3_officer',
    lines: [{ speaker: null, text: 'A Royal Security officer, yawning into his flask. Adrian turns and walks the other way before he can look up.' }],
  },
  {
    id: 'c3_poster',
    lines: [
      { speaker: null, style: 'inscription', text: 'WANTED FOR QUESTIONING: ADRIAN VALE. Any information to the Royal Security Office.' },
      { speaker: null, text: 'The same terrible university photo. Someone has drawn a moustache on it, which honestly helps.' },
    ],
  },
  {
    id: 'c3_mara_wf',
    lines: [{ speaker: 'mara', text: 'Past the Archives, by the bandstand. Not past the pier, Adrian. Not past the pier.' }],
  },
  {
    id: 'c3_pell_wf',
    lines: [{ speaker: 'pell', text: 'I\'ll stay with your aunt. She has promised not to push me in the river until after the petition.' }],
  },
  {
    id: 'c3_jamilah',
    lines: [
      { speaker: 'jamilah', text: 'Adrian Vale. Your face is on every lamp post in Kuching, and it is not your good side.' },
      { speaker: 'adrian', text: 'Kak Jamilah, I need...' },
      { speaker: 'jamilah', text: 'You need to get off the street. The stairs behind the stall. Your aunt and the nice shirt too, I saw them. Go, go.' },
      { speaker: 'jamilah', text: 'My mother hid people from the palace in that room once. Nobody ever asked her why, so I will not ask you.', setFlags: ['c3_met_jamilah'] },
      { speaker: null, text: 'Up a steep back stair, into a small room above the stall that smells of broth and old newspapers.' },
    ],
    enterScene: { scene: 'jamilah_room', spawn: 'arrival' },
  },
  {
    id: 'c3_room_arrival',
    lines: [
      { speaker: null, text: 'A low table, two sleeping mats, a window over the river. Across the water, the Palace is still lit.', setFlags: ['c3_room_entered'] },
      { speaker: 'jamilah', text: 'This came for you an hour ago. A lady in very sensible shoes. She said you would know her.' },
      { speaker: null, text: 'Kak Jamilah leaves a folded note on the table and goes back down to her broth.' },
      { speaker: 'mara', text: 'Sensible shoes. That is the Archivist. Read it, Adrian.' },
    ],
  },
  {
    id: 'c3_note',
    lines: [
      { speaker: null, style: 'inscription', text: 'The Petition Hour opens at nine, as it has every month for a hundred years. Any subject may stand before His Majesty, if a holder of a Crown charter sets their seal on the petition.' },
      { speaker: null, style: 'inscription', text: 'The Lord Chamberlain has struck the petition list. He cannot strike a sponsor. — A.' },
      { speaker: 'adrian', text: 'A Crown charter-holder. Where are we going to find one of those before nine?', setFlags: ['c3_read_note'] },
      { speaker: null, text: 'Mara and Adrian turn, slowly, to look at Julian Pell.' },
      { speaker: 'pell', text: '...Ah.' },
    ],
  },
  {
    id: 'c3_note_again',
    lines: [{ speaker: null, style: 'inscription', text: 'He cannot strike a sponsor. — A.' }],
  },
  {
    id: 'c3_pell_wait',
    lines: [{ speaker: 'pell', text: 'Read the note first, Mr Vale. I have a terrible feeling it\'s about me.' }],
  },
  {
    // The first dialogue choice in the game. Every reply leads to Pell signing.
    id: 'c3_pell_ask',
    lines: [
      { speaker: 'pell', text: 'Awan Riverlands holds Crown Charter 114. My seal is in my bag.' },
      { speaker: 'pell', text: 'If I put it on your petition, I\'m finished with the company. Probably with my family too. My father will hear about it before breakfast.' },
      { speaker: 'pell', text: 'So tell me honestly, Mr Vale. Why should I?' },
    ],
    choices: [
      { id: 'village', label: 'For Sungai Awan.', next: 'c3_pell_village', setFlags: ['c3_reason_village'] },
      { id: 'family', label: "For your family's name.", next: 'c3_pell_family', setFlags: ['c3_reason_family'] },
      { id: 'right', label: "Because you already know it's right.", next: 'c3_pell_right', setFlags: ['c3_reason_right'] },
    ],
  },
  {
    id: 'c3_pell_village',
    lines: [
      { speaker: 'adrian', text: 'Because of Uncle Lim\'s shop, and Kak Siti\'s clinic, and a jetty with a broken rail. People live there, and the Charter says it\'s theirs.' },
      { speaker: 'pell', text: '...I really did order a tea urn for that consultation, you know. For them.' },
    ],
    next: 'c3_pell_signs',
  },
  {
    id: 'c3_pell_family',
    lines: [
      { speaker: 'adrian', text: 'Harrow and Pell. Half of that name signed the concession. The other half can put it right.' },
      { speaker: 'pell', text: 'You\'ve been saving that one. It\'s a good one.' },
    ],
    next: 'c3_pell_signs',
  },
  {
    id: 'c3_pell_right',
    lines: [
      { speaker: 'adrian', text: 'Because you read the Charter twice at the jetty, and you haven\'t stopped thinking about it since.' },
      { speaker: 'pell', text: 'That\'s unfair, Mr Vale. It\'s also true.' },
    ],
    next: 'c3_pell_signs',
  },
  {
    id: 'c3_pell_signs',
    lines: [
      { speaker: null, text: 'Pell takes a small brass seal from his bag, warms the wax over Mara\'s lighter, and presses it into the foot of the petition.' },
      { speaker: null, style: 'inscription', text: 'JULIAN PELL, FOR AWAN RIVERLANDS DEVELOPMENT. HOLDER OF CROWN CHARTER 114.' },
      { speaker: 'pell', text: 'There. I am now unemployed. How exciting.', setFlags: ['c3_pell_signed'] },
      { speaker: 'mara', text: 'Welcome to the family business, Mr Pell. The pay is terrible.' },
      { speaker: null, text: 'Three soft knocks on the stair door. Then two more.' },
    ],
    next: 'c3_daniel_arrives',
  },
  {
    // The end of Milestone 3.2.
    id: 'c3_daniel_arrives',
    lines: [
      { speaker: 'daniel', text: 'It\'s me. Don\'t shout.' },
      { speaker: null, text: 'Daniel Rengas, out of uniform for the first time since they met, holding a paper bag of kaya buns.', setFlags: ['c3_daniel_arrived'] },
      { speaker: 'daniel', text: 'Harrow has Royal Security on the palace gate this morning. My old partner has the shift.' },
      { speaker: 'adrian', text: 'Will he stop us?' },
      { speaker: 'daniel', text: 'He\'ll have to try. The petitioners gather at the river steps at eight and cross on the first ferry. We go with them. Harrow can\'t drag a man out of a crowd of petitioners in front of the Clerk of Petitions.' },
      { speaker: 'daniel', text: '...Probably.' },
      { speaker: 'mara', text: 'Sleep. All of you. Even you, Mr Unemployed.', setFlags: ['c3_plan_made'] },
    ],
    endChapter: true,
  },
  {
    id: 'c3_pell_after',
    lines: [{ speaker: 'pell', text: 'Charter 114. I used to be so proud of that number.' }],
  },
  {
    id: 'c3_mara_room',
    lines: [{ speaker: 'mara', text: 'Read the note, Adrian. I am too old to squint at handwriting by lamplight.' }],
  },
  {
    id: 'c3_mara_room_after',
    lines: [{ speaker: 'mara', text: 'Don\'t look at me. I don\'t have a charter. I have a library card and opinions.' }],
  },
  {
    id: 'c3_window',
    lines: [{ speaker: null, text: 'Across the river, the Palace glows white and gold. In a few hours Adrian will be inside it, one way or another.' }],
  },
];
