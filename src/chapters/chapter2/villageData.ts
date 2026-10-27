/**
 * Chapter 2, Milestone 2.2 — Sungai Awan, changed. Pure data.
 *
 * Reuses the prologue village and family home (buildings, furniture, colliders)
 * with Chapter 2 people, props and interactions:
 *   Village: a Crown notice board by the jetty, survey pegs along the bank and at
 *            the Vale house, the Awan Riverlands survey boat, Uncle Lim, Kak Siti
 *            (clinic nurse), Julian Pell, and Ah Hock with his longboat.
 *   Home:    Aunt Mara, and Elias's portrait with a map drawn on its back.
 */
import { boxFromCenter, type Box } from '../../game/core/collision';
import type { DialogueDef } from '../../game/dialogue/types';
import type { Interactable } from '../../game/interaction/interaction';
import { NPC_COLLIDER_SIZE, type NpcPlacement, type SceneLayout } from '../../game/scenes/layout';
import { buildHomeColliders, HOME_ROOM, PORTRAIT, HEIRLOOM } from '../../data/familyHome';
import { BUILDINGS, PROPS, stairBox, VILLAGE_BOUNDS } from '../../data/villageSquare';

// ── Village ─────────────────────────────────────────────

export const NOTICE_BOARD = { x: 1.2, z: -3.6, width: 1.0, depth: 0.3 };

/** Survey pegs along the bank, and two at the Vale house. Decoration only. */
export const SURVEY_PEGS: Array<{ x: number; z: number }> = [
  ...[-11, -8.6, -6.2, -3.8, 4.4, 6.6, 8.8, 11].map((x) => ({ x, z: -4.25 })),
  { x: 4.6, z: 0.9 },
  { x: 9.0, z: 1.1 },
];

export const VILLAGE_C2_NPCS: NpcPlacement[] = [
  { id: 'npc-lim-c2', character: 'lim', x: -6.2, z: 1.0, facing: 'south' },
  { id: 'npc-siti', character: 'siti', x: -0.2, z: 0.5, facing: 'south' },
  { id: 'npc-pell', character: 'pell', x: 9.4, z: -4.45, facing: 'west' },
  { id: 'npc-ahhock-village', character: 'ahhock', x: -9.4, z: -4.45, facing: 'east' },
];

export const VILLAGE_C2_INTERACTABLES: Interactable[] = [
  {
    id: 'notice-board',
    kind: 'inspect',
    label: 'Notice Board',
    x: NOTICE_BOARD.x,
    z: NOTICE_BOARD.z - 0.5,
    radius: 1.0,
    dialogue: [
      { dialogue: 'c2_notice', unless: ['c2_read_notice'] },
      { dialogue: 'c2_notice_after' },
    ],
  },
  {
    id: 'npc-lim-c2',
    kind: 'talk',
    label: 'Uncle Lim',
    x: -6.2,
    z: 1.0,
    radius: 1.4,
    npc: 'lim',
    dialogue: [
      { dialogue: 'c2_lim_early', unless: ['c2_read_notice'] },
      { dialogue: 'c2_lim', unless: ['c2_talked_lim'] },
      { dialogue: 'c2_lim_after' },
    ],
  },
  {
    id: 'npc-siti',
    kind: 'talk',
    label: 'Kak Siti',
    x: -0.2,
    z: 0.5,
    radius: 1.3,
    npc: 'siti',
    dialogue: [
      { dialogue: 'c2_siti', unless: ['c2_met_siti'] },
      { dialogue: 'c2_siti_after' },
    ],
  },
  {
    id: 'npc-pell',
    kind: 'talk',
    label: 'Survey Manager',
    x: 9.4,
    z: -4.45,
    radius: 1.3,
    npc: 'pell',
    dialogue: [
      { dialogue: 'c2_pell_busy', unless: ['c2_talked_lim'] },
      { dialogue: 'c2_pell', unless: ['c2_met_pell'] },
      { dialogue: 'c2_pell_after' },
    ],
  },
  {
    id: 'npc-ahhock-village',
    kind: 'talk',
    label: 'Captain Ah Hock',
    x: -9.4,
    z: -4.45,
    radius: 1.3,
    npc: 'ahhock',
    dialogue: [
      { dialogue: 'c2_ahhock_go', requires: ['c2_found_map'] },
      { dialogue: 'c2_ahhock_village' },
    ],
  },
  {
    id: 'survey-peg',
    kind: 'inspect',
    label: 'Survey Peg',
    x: 4.6,
    z: 1.4,
    radius: 0.8,
    dialogue: [{ dialogue: 'c2_peg' }],
  },
  {
    id: 'family-home-door-c2',
    kind: 'enter',
    label: 'Vale Family Home',
    x: 6.8,
    z: 2.15,
    radius: 1.2,
    enter: { scene: 'home_c2', spawn: 'door' },
  },
];

const VILLAGE_C2_COLLIDERS: Box[] = [
  ...BUILDINGS.map((b) => boxFromCenter(b.x, b.z, b.width, b.depth)),
  ...BUILDINGS.filter((b) => b.stilts).map(stairBox),
  ...PROPS.filter((p) => p.collider).map((p) => boxFromCenter(p.x, p.z, p.collider!.width, p.collider!.depth)),
  boxFromCenter(NOTICE_BOARD.x, NOTICE_BOARD.z, NOTICE_BOARD.width, NOTICE_BOARD.depth),
  ...VILLAGE_C2_NPCS.map((n) => boxFromCenter(n.x, n.z, NPC_COLLIDER_SIZE, NPC_COLLIDER_SIZE)),
];

export const VILLAGE_C2_LAYOUT: SceneLayout = {
  bounds: VILLAGE_BOUNDS,
  colliders: () => VILLAGE_C2_COLLIDERS,
  interactables: VILLAGE_C2_INTERACTABLES,
  npcs: VILLAGE_C2_NPCS,
};

// ── Family home ─────────────────────────────────────────

export const HOME_C2_NPCS: NpcPlacement[] = [
  { id: 'npc-mara-home-c2', character: 'mara', x: 2.6, z: -1.2, facing: 'south' },
];

export const HOME_C2_INTERACTABLES: Interactable[] = [
  {
    id: 'npc-mara-home-c2',
    kind: 'talk',
    label: 'Aunt Mara',
    x: 2.6,
    z: -1.2,
    radius: 1.4,
    npc: 'mara',
    dialogue: [
      { dialogue: 'c2_mara_home_early', unless: ['c2_met_pell'] },
      { dialogue: 'c2_mara_home', unless: ['c2_home_talked'] },
      { dialogue: 'c2_mara_home_go', requires: ['c2_found_map'] },
      { dialogue: 'c2_mara_home_repeat' },
    ],
  },
  {
    id: 'portrait-c2',
    kind: 'inspect',
    label: "Elias's Portrait",
    x: PORTRAIT.x,
    z: -2.9,
    radius: 1.1,
    dialogue: [
      // Saves from the old 2.2 cliffhanger: the map is found, so set off upriver.
      { dialogue: 'c2_portrait_go', requires: ['c2_found_map'] },
      { dialogue: 'c2_portrait_map', requires: ['c2_home_talked'] },
      { dialogue: 'c2_portrait_elias' },
    ],
  },
  {
    id: 'heirloom-c2',
    kind: 'inspect',
    label: 'Heirloom Pedestal',
    x: HEIRLOOM.x,
    z: HEIRLOOM.z,
    radius: 1.3,
    dialogue: [{ dialogue: 'c2_pedestal' }],
  },
  {
    id: 'home-exit-c2',
    kind: 'enter',
    label: 'Village',
    x: 0,
    z: 3.2,
    radius: 0.9,
    enter: { scene: 'village_c2', spawn: 'from_home' },
  },
];

export const HOME_C2_LAYOUT: SceneLayout = {
  bounds: HOME_ROOM,
  // Same furniture as the prologue (the floor hatch has stayed open since then).
  colliders: buildHomeColliders,
  interactables: HOME_C2_INTERACTABLES,
  npcs: HOME_C2_NPCS,
};

// ── Story ───────────────────────────────────────────────

export const VILLAGE_C2_DIALOGUE: DialogueDef[] = [
  {
    id: 'c2_village_arrival',
    lines: [
      { speaker: null, text: 'Ah Hock\'s longboat bumps against the jetty. Sungai Awan: the boardwalk, the kedai, the clinic, the Vale house on its stilts.', setFlags: ['c2_village_arrived'] },
      { speaker: null, text: 'Moored at the far end of the boardwalk is a sleek white survey boat. Painted on its hull: AWAN RIVERLANDS.' },
      { speaker: 'ahhock', text: 'I\'ll stay at the jetty till morning. When you need to go upriver, you know where to find me.' },
      { speaker: 'mara', text: 'I am going home to make tea and be angry. Go and read that board, Adrian. Then come home.' },
    ],
  },
  {
    id: 'c2_notice',
    lines: [
      { speaker: null, style: 'inscription', text: 'NOTICE OF SURVEY. Under the River Lands Concession of 1921, the lands of Sungai Awan are designated for consolidation.' },
      { speaker: null, style: 'inscription', text: 'Residents are invited to a consultation on relocation packages. Awan Riverlands Development, for the Office of the Lord Chamberlain.' },
      { speaker: 'adrian', text: 'The 1921 concession. They are not even hiding it.', setFlags: ['c2_read_notice'] },
    ],
  },
  {
    id: 'c2_notice_after',
    lines: [{ speaker: null, text: 'The notice has been up for two days. Someone has drawn a small, rude crocodile in the corner.' }],
  },
  {
    id: 'c2_lim_early',
    lines: [{ speaker: 'lim', text: 'Adrian! You\'re back. Go and read the board by the jetty first. Then come here and shout with me.' }],
  },
  {
    id: 'c2_lim',
    lines: [
      { speaker: 'lim', text: 'Fifty years I have run this shop. Then a boy in a clean shirt tells me I live in a "consolidation zone".' },
      { speaker: 'lim', text: 'They pegged the whole bank on Monday. Even your aunt\'s house. Nobody asked anybody.' },
      { speaker: 'adrian', text: 'Is everyone against it?' },
      { speaker: 'lim', text: '...No. Some want the money. The school bus stopped last year; the young ones are all in Kapit or Kuching. I don\'t blame them. I just don\'t like being bought.' },
      { speaker: 'lim', text: 'The man in charge is at the jetty, by the white boat. Pell. Very polite. I hate him a little bit.', setFlags: ['c2_talked_lim'] },
      { speaker: 'lim', text: 'Siti at the clinic knows more. She knows everything. It is a medical condition.' },
    ],
  },
  {
    id: 'c2_lim_after',
    lines: [{ speaker: 'lim', text: 'Go on, talk to Pell. If he offers you a relocation package, ask him if it comes with a shop.' }],
  },
  {
    id: 'c2_siti',
    lines: [
      { speaker: 'siti', text: 'Adrian Vale! Your aunt said you went to Kuching and came back with a face like a closed door. She was right.' },
      { speaker: 'siti', text: 'The survey men keep asking about the old landing upriver, past the rapids. Asking where "the stones" are. Nobody here goes there.' },
      { speaker: 'adrian', text: 'Stones?' },
      { speaker: 'siti', text: 'Old stories. My grandfather said the landing belonged to "the people with the sword". Pell\'s men went up last week and came back with nothing but leech bites.' },
      { speaker: null, text: 'She presses a small tin of balm into his hand. "For the leeches. You\'ll need it."', setFlags: ['c2_met_siti'] },
    ],
  },
  {
    id: 'c2_siti_after',
    lines: [{ speaker: 'siti', text: 'Leeches, Adrian. Tuck your trousers into your socks. I mean it.' }],
  },
  {
    id: 'c2_pell_busy',
    lines: [{ speaker: null, text: 'A young man in a pressed linen shirt is on the phone beside the survey boat. He holds up one apologetic finger.' }],
  },
  {
    id: 'c2_pell',
    lines: [
      { speaker: 'pell', text: 'Hello! Julian Pell, Awan Riverlands. You must be Mr Vale. Your aunt has told me what she thinks of me. Twice.' },
      { speaker: 'pell', text: 'I know how this looks. But Kapit has a hospital, a school, jobs. The packages are generous. I made sure of that myself.' },
      { speaker: 'adrian', text: 'Under a concession from 1921. One your great-grandfather\'s company used to clear seven villages.' },
      { speaker: 'pell', text: '...You\'ve done your reading. Yes. The Harrow and Pell Timber Company. I\'m not proud of everything in our archive, Mr Vale.' },
      { speaker: 'pell', text: 'But that was a hundred years ago. I\'m trying to do this one properly. There is a consultation tomorrow evening at the clinic. Come and object. I mean that.' },
      { speaker: null, text: 'He sounds as if he means it. Somehow, that is worse.', setFlags: ['c2_met_pell'] },
    ],
  },
  {
    id: 'c2_pell_after',
    lines: [{ speaker: 'pell', text: 'Tomorrow evening, at the clinic. Bring your aunt. Actually... perhaps seat her a long way from me.' }],
  },
  {
    id: 'c2_ahhock_village',
    lines: [{ speaker: 'ahhock', text: 'Upriver? At first light, when you\'re ready. The river is in a mood this week. So am I.' }],
  },
  {
    id: 'c2_peg',
    lines: [
      { speaker: null, text: 'A wooden survey peg wrapped in orange tape, three steps from the Vale family\'s front stairs.' },
      { speaker: null, text: 'Written on it in marker pen: AR-115.' },
    ],
  },
  {
    id: 'c2_mara_home_early',
    lines: [{ speaker: 'mara', text: 'The kettle is on. First go and find out who is in charge of those pegs. Then we talk.' }],
  },
  {
    id: 'c2_mara_home',
    lines: [
      { speaker: 'mara', text: 'So. Mr Pell. Polite?' },
      { speaker: 'adrian', text: 'Very. He thinks he\'s helping.' },
      { speaker: 'mara', text: 'The dangerous ones always do.' },
      { speaker: 'mara', text: 'Adrian. My grandmother said Elias left his map "with the family". Everything of his that the palace didn\'t take is in this room.' },
      { speaker: 'mara', text: 'And only one thing in this room has hung on that wall since 1921.', setFlags: ['c2_home_talked'] },
    ],
  },
  {
    id: 'c2_mara_home_repeat',
    lines: [{ speaker: 'mara', text: 'The portrait, Adrian. Elias and the young Rajah.' }],
  },
  {
    id: 'c2_portrait_elias',
    lines: [
      { speaker: null, text: 'The faded photograph: a stern man in a white uniform, standing beside a young Rajah.' },
      { speaker: 'adrian', text: 'Elias Vale. The nameplate is still blank, but I know your name now.' },
    ],
  },
  {
    id: 'c2_pedestal',
    lines: [{ speaker: null, text: 'The empty pedestal where the medallion waited for a century. Adrian touches it at his collar, out of habit now.' }],
  },
  {
    id: 'c2_portrait_map',
    lines: [
      { speaker: null, text: 'Adrian lifts the portrait off its nail. Behind it, the wall is paler where the sun has never reached.' },
      { speaker: null, text: 'On the back of the frame, under a century of dust, a map is drawn in faded ink: the river above Sungai Awan, the rapids, and three marks around a landing.' },
      { speaker: null, style: 'inscription', text: 'Where the river forgets its name, wake the stones as the water woke: first the deep, then the bright, then the one that waits.' },
      { speaker: 'adrian', text: 'A landing above the rapids. That is where Elias went.' },
      { speaker: 'mara', text: 'Then that is where we are going. Ah Hock owes me a favour from 1987.' },
      { speaker: 'adrian', text: 'What happened in 1987?' },
      { speaker: 'mara', text: 'Ask him. He tells it differently.', setFlags: ['c2_found_map'] },
    ],
    next: 'c2_upriver',
  },
  {
    id: 'c2_mara_home_go',
    lines: [{ speaker: 'mara', text: 'The map, the verse, and Ah Hock at first light. I\'ve packed the leech balm. Siti packed more.' }],
  },
  {
    id: 'c2_portrait_go',
    lines: [
      { speaker: null, text: 'The portrait lies face-down on the table, Elias\'s map drawn on its back.' },
      { speaker: 'mara', text: 'Enough staring. Ah Hock is waiting, and he charges by the hour.' },
    ],
    next: 'c2_upriver',
  },
  {
    id: 'c2_ahhock_go',
    lines: [{ speaker: 'ahhock', text: 'Your aunt says we go upriver. When your aunt says, we go. Get in.' }],
    next: 'c2_upriver',
  },
  {
    // The longboat trip: a time skip to the waystation landing.
    id: 'c2_upriver',
    lines: [
      { speaker: null, text: 'First light. Ah Hock\'s longboat noses out from the jetty, Mara in the bow with the map on her knees.', setFlags: ['c2_went_upriver'] },
      { speaker: null, text: 'Above Sungai Awan the river narrows and turns white over the rapids. Ah Hock stands at the outboard, reading the water like a page.' },
      { speaker: 'ahhock', text: 'My grandmother said the river forgets its name up here. Too many turns. Even the maps give up.' },
      { speaker: 'adrian', text: '"Where the river forgets its name." Ah Hock, keep going.' },
    ],
    enterScene: { scene: 'waystation_landing', spawn: 'arrival' },
  },
];

export const VILLAGE_C2_OBJECTIVES = [
  { id: 'c2_notice', text: 'Read the notice on the village board.', completeWhen: 'c2_read_notice' },
  { id: 'c2_lim', text: 'Talk to Uncle Lim at the kedai.', completeWhen: 'c2_talked_lim' },
  { id: 'c2_pell', text: 'Find the man in charge of the survey.', completeWhen: 'c2_met_pell' },
  { id: 'c2_home', text: 'Go home to Aunt Mara.', completeWhen: 'c2_home_talked' },
  { id: 'c2_map', text: "Look behind Elias's portrait.", completeWhen: 'c2_found_map' },
  { id: 'c2_upriver', text: 'Travel upriver with Ah Hock.', completeWhen: 'c2_went_upriver' },
] as const;
