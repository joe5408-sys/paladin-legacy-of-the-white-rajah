/**
 * Chapter 3, Milestone 3.1 — The Long Way Down. Pure data.
 *
 * The Chapter 2 express boat again (same deck, bench, cargo and engine), overnight
 * down the Rajang to Kuching:
 *   Bench (north rail)    Aunt Mara, asleep sitting up, holding the Charter case
 *   North rail            the Student from the morning boat in Chapter 2, going back for term
 *   South rail            Julian Pell, who came aboard at Sungai Awan unasked
 *   Engine (east)         Captain Ah Hock, running the night boat himself
 *   Cabin door (west)     rest until Kuching, once Daniel has called
 *
 * Story order: Pell → the Student's phone (Adrian is wanted) → Daniel's call →
 * the cabin → ashore at Kuching before dawn (Milestone 3.2 carries on from there).
 */
import { boxFromCenter, type Box } from '../../game/core/collision';
import type { DialogueDef } from '../../game/dialogue/types';
import type { Interactable } from '../../game/interaction/interaction';
import { NPC_COLLIDER_SIZE, type NpcPlacement, type SceneLayout } from '../../game/scenes/layout';
import type { Objective } from '../../data/quests';
import { BENCH, CARGO, DECK, ENGINE } from '../chapter2/boatData';
import { KUCHING_OBJECTIVES } from './kuchingData';

export const PELL_NIGHT = { x: 0.0, z: 1.0 };

export const BOAT_NIGHT_NPCS: NpcPlacement[] = [
  { id: 'npc-mara-night', character: 'mara', x: -1.9, z: -0.55, facing: 'south' },
  { id: 'npc-student-night', character: 'passenger', x: 0.7, z: -0.9, facing: 'south' },
  { id: 'npc-pell-night', character: 'pell', x: PELL_NIGHT.x, z: PELL_NIGHT.z, facing: 'north' },
  { id: 'npc-ahhock-night', character: 'ahhock', x: 3.2, z: -0.6, facing: 'west' },
];

export const BOAT_NIGHT_INTERACTABLES: Interactable[] = [
  {
    id: 'npc-pell-night',
    kind: 'talk',
    label: 'Julian Pell',
    x: PELL_NIGHT.x,
    z: PELL_NIGHT.z,
    radius: 1.2,
    npc: 'pell',
    dialogue: [
      { dialogue: 'c3_pell', unless: ['c3_talked_pell'] },
      { dialogue: 'c3_pell_after', requires: ['c3_daniel_called'] },
      { dialogue: 'c3_pell_repeat' },
    ],
  },
  {
    id: 'npc-student-night',
    kind: 'talk',
    label: 'Student',
    x: 0.7,
    z: -0.9,
    radius: 1.2,
    npc: 'passenger',
    dialogue: [
      { dialogue: 'c3_student_shy', unless: ['c3_talked_pell'] },
      { dialogue: 'c3_student_news', unless: ['c3_saw_news'] },
      { dialogue: 'c3_student_after' },
    ],
  },
  {
    id: 'npc-mara-night',
    kind: 'talk',
    label: 'Aunt Mara',
    x: -1.9,
    z: -0.55,
    radius: 1.2,
    npc: 'mara',
    dialogue: [
      { dialogue: 'c3_mara_after', requires: ['c3_daniel_called'] },
      { dialogue: 'c3_mara_asleep' },
    ],
  },
  {
    id: 'npc-ahhock-night',
    kind: 'talk',
    label: 'Captain Ah Hock',
    x: 3.2,
    z: -0.6,
    radius: 1.2,
    npc: 'ahhock',
    dialogue: [
      { dialogue: 'c3_ahhock_after', requires: ['c3_daniel_called'] },
      { dialogue: 'c3_ahhock' },
    ],
  },
  {
    id: 'boat-night-cabin',
    kind: 'inspect',
    label: 'Cabin',
    x: -4.25,
    z: 0,
    radius: 0.7,
    dialogue: [
      { dialogue: 'c3_to_kuching', requires: ['c3_daniel_called'] },
      { dialogue: 'c3_cabin_early' },
    ],
  },
];

const COLLIDERS: Box[] = [
  boxFromCenter(BENCH.x, BENCH.z, BENCH.width, BENCH.depth),
  boxFromCenter(CARGO.x, CARGO.z, CARGO.width, CARGO.depth),
  boxFromCenter(ENGINE.x, ENGINE.z, ENGINE.width, ENGINE.depth),
  ...BOAT_NIGHT_NPCS.map((n) => boxFromCenter(n.x, n.z, NPC_COLLIDER_SIZE, NPC_COLLIDER_SIZE)),
];

export const BOAT_NIGHT_LAYOUT: SceneLayout = {
  bounds: DECK,
  colliders: () => COLLIDERS,
  interactables: BOAT_NIGHT_INTERACTABLES,
  npcs: BOAT_NIGHT_NPCS,
};

export const CHAPTER3_OBJECTIVES: Objective[] = [
  { id: 'c3_pell', text: 'Find Julian Pell on deck.', completeWhen: 'c3_talked_pell' },
  { id: 'c3_news', text: 'Find out why the student keeps staring.', completeWhen: 'c3_saw_news' },
  { id: 'c3_rest', text: 'Rest in the cabin until Kuching.', completeWhen: 'c3_reached_kuching' },
  ...KUCHING_OBJECTIVES,
];

export const BOAT_NIGHT_DIALOGUE: DialogueDef[] = [
  {
    id: 'c3_boat_arrival',
    lines: [
      { speaker: null, text: 'Two nights after the Iron Warden fell into the river. The overnight express to Kuching, somewhere below Sibu, with the lights of a longhouse sliding past in the dark.', setFlags: ['c3_arrived'] },
      { speaker: null, text: 'Ah Hock insisted on taking the night boat himself. Mara is asleep on the bench, sitting bolt upright, both arms around the Charter case.' },
      { speaker: null, text: 'The medallion is warm against Adrian\'s chest. Since the jetty he has felt steadier, as if something in it has settled. Max HP 30 → 36.' },
      { speaker: null, text: 'At the stern rail stands Julian Pell, who came aboard at Sungai Awan without being asked.' },
    ],
  },
  {
    id: 'c3_pell',
    lines: [
      { speaker: 'pell', text: 'Mr Vale. Can\'t sleep either? I keep reading the Charter in my head.' },
      { speaker: 'adrian', text: 'Why are you on this boat, Mr Pell?' },
      { speaker: 'pell', text: 'Officially, I\'m on leave. Unofficially... I want to see it registered. Properly. With my own eyes.' },
      { speaker: 'pell', text: 'And if I\'m honest, I don\'t think my employers will want me back once they hear I let you leave the jetty with it.' },
      { speaker: 'adrian', text: 'Harrow will know you\'re with us.' },
      { speaker: 'pell', text: 'Harrow knows everything. It\'s very tiring.', setFlags: ['c3_talked_pell'] },
      { speaker: 'pell', text: 'That student by the rail has been staring at you since Sibu. Either he\'s a fan, or you should go and find out why.' },
    ],
  },
  {
    id: 'c3_pell_repeat',
    lines: [{ speaker: 'pell', text: 'The student, Mr Vale. He\'s pretending very hard not to look at you.' }],
  },
  {
    id: 'c3_pell_after',
    lines: [
      { speaker: 'pell', text: 'A petition to the Rajah in person? My grandfather used to say the Petition Hour was a fairy story the palace told children.' },
      { speaker: 'pell', text: '...He also said Harrow and Pell never did anything wrong. So.' },
    ],
  },
  {
    id: 'c3_student_shy',
    lines: [{ speaker: null, text: 'A university student hunched over his phone. He glances up at Adrian, then very quickly down again.' }],
  },
  {
    id: 'c3_student_news',
    lines: [
      { speaker: 'passenger', text: 'Sorry. Sorry! You were on the morning boat, two weeks ago. With the auntie and the rambutans. It\'s just... is this you?' },
      { speaker: null, style: 'inscription', text: 'BREAKING: Vale heir sought over Royal Archives break-in. Royal Security asks the public for information.' },
      { speaker: null, text: 'The photo is from Adrian\'s old university card. He looks about fifteen and slightly surprised.' },
      { speaker: 'passenger', text: 'It\'s a terrible photo. I won\'t tell anyone. My grandmother is from upriver. She says the palace has never once been in a hurry to help us.', setFlags: ['c3_saw_news'] },
      { speaker: null, text: 'Adrian\'s phone buzzes in his pocket. Unknown number.' },
    ],
    next: 'c3_daniel_call',
  },
  {
    id: 'c3_daniel_call',
    lines: [
      { speaker: 'daniel', text: 'It\'s me. New phone. Don\'t say my name.' },
      { speaker: 'daniel', text: 'They\'ve suspended me, pending a review of my "conduct at the Royal Archives". My badge is in a drawer in Harrow\'s office.' },
      { speaker: 'adrian', text: 'I\'m sorry.' },
      { speaker: 'daniel', text: 'Don\'t be. Listen. There\'s an old right called the Petition Hour: any subject can stand before the Rajah in person. Nobody has used it in years.' },
      { speaker: 'daniel', text: 'And this afternoon Harrow put the petition list "under review". Whatever you\'re planning, he\'s expecting it.' },
      { speaker: 'daniel', text: 'When you land, don\'t use the main pier. Get to Kak Jamilah\'s stall. I\'ll find you there.', setFlags: ['c3_daniel_called'] },
      { speaker: null, text: 'The line goes dead.' },
    ],
  },
  {
    id: 'c3_student_after',
    lines: [{ speaker: 'passenger', text: 'Really, really terrible photo. Good luck in Kuching.' }],
  },
  {
    id: 'c3_mara_asleep',
    lines: [
      { speaker: null, text: 'Mara is asleep, both arms around the Charter case.' },
      { speaker: 'mara', text: '(without opening her eyes) I am awake. Go away.' },
    ],
  },
  {
    id: 'c3_mara_after',
    lines: [
      { speaker: 'mara', text: 'Wanted? Good. Now they have to say your name in public.' },
      { speaker: 'mara', text: 'Kak Jamilah\'s, then. She feeds us, we hide, nobody argues. Go and rest in the cabin, Adrian. Kuching by dawn.' },
    ],
  },
  {
    id: 'c3_ahhock',
    lines: [{ speaker: 'ahhock', text: 'Night boat. No birds, no tourists, nobody asking questions. My favourite kind of river.' }],
  },
  {
    id: 'c3_ahhock_after',
    lines: [{ speaker: 'ahhock', text: 'The main pier? No. I know a fuel jetty below the old shophouses. Nobody ever looks at a fuel jetty.' }],
  },
  {
    id: 'c3_cabin_early',
    lines: [{ speaker: null, text: 'Rows of sleeping passengers, and a television playing a cooking show with the sound off. Adrian is far too awake to sleep.' }],
  },
  {
    // Arrival in Kuching before dawn; the walk ashore is Milestone 3.2.
    id: 'c3_to_kuching',
    lines: [
      { speaker: null, text: 'Adrian sleeps for two hours, badly.' },
      { speaker: null, text: 'Before dawn, Ah Hock cuts the engine and lets the boat drift in to a fuel jetty below the old shophouses. Kuching is asleep. Across the river, the Palace is lit up like a wedding cake.' },
      { speaker: 'mara', text: 'Home of the Rajah, the Lord Chamberlain, and every bad decision since 1921.' },
      { speaker: 'pell', text: 'And of the Petition Hour. If it still exists.' },
      { speaker: 'adrian', text: 'Then that\'s where we\'re going.', setFlags: ['c3_reached_kuching'] },
    ],
    enterScene: { scene: 'waterfront_night', spawn: 'arrival' },
  },
];
