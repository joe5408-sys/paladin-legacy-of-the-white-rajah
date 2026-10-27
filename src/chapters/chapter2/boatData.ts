/**
 * Chapter 2, Milestone 2.1 — the open rear deck of an express boat on the Rajang. Pure data.
 *
 * Deck: x -4.6..4.6 (bow/cabin to the west, engine to the east), z -1.4..1.4.
 *   Cabin door (west)     Adrian's things; leads on to Kapit once the captain has been asked
 *   Bench (north rail)    Aunt Mara
 *   Cargo (south rail)    an auntie with a basket of rambutans
 *   Engine (east)         Captain Ah Hock, frowning at it
 */
import { boxFromCenter, type Box } from '../../game/core/collision';
import type { DialogueDef } from '../../game/dialogue/types';
import type { Interactable } from '../../game/interaction/interaction';
import { NPC_COLLIDER_SIZE, type NpcPlacement, type SceneLayout } from '../../game/scenes/layout';
import type { Objective } from '../../data/quests';
import { VILLAGE_C2_OBJECTIVES } from './villageData';
import { LANDING_OBJECTIVES } from './waystationData';
import { HALL_OBJECTIVES } from './hallData';

export const DECK: Box = { minX: -4.6, maxX: 4.6, minZ: -1.4, maxZ: 1.4 };
export const BENCH = { x: -2.0, z: -1.15, width: 2.0, depth: 0.4 };
export const CARGO = { x: 1.7, z: 0.95, width: 1.1, depth: 0.6 };
export const ENGINE = { x: 4.1, z: 0, width: 1.0, depth: 1.4 };

export const BOAT_NPCS: NpcPlacement[] = [
  { id: 'npc-mara-boat', character: 'mara', x: -1.9, z: -0.55, facing: 'south' },
  { id: 'npc-passenger', character: 'passenger', x: 0.7, z: -0.9, facing: 'south' },
  { id: 'npc-auntie', character: 'auntie', x: -0.3, z: 1.05, facing: 'north' },
  { id: 'npc-ahhock', character: 'ahhock', x: 3.2, z: -0.6, facing: 'west' },
];

export const BOAT_INTERACTABLES: Interactable[] = [
  {
    id: 'npc-mara-boat',
    kind: 'talk',
    label: 'Aunt Mara',
    x: -1.9,
    z: -0.55,
    radius: 1.2,
    npc: 'mara',
    dialogue: [
      { dialogue: 'c2_mara_talk', unless: ['c2_talked_mara'] },
      { dialogue: 'c2_mara_news', requires: ['c2_saw_news'], unless: ['c2_talked_captain'] },
      { dialogue: 'c2_mara_after', requires: ['c2_talked_captain'] },
      { dialogue: 'c2_mara_repeat' },
    ],
  },
  {
    id: 'npc-passenger',
    kind: 'talk',
    label: 'Student',
    x: 0.7,
    z: -0.9,
    radius: 1.2,
    npc: 'passenger',
    dialogue: [
      { dialogue: 'c2_passenger_busy', unless: ['c2_talked_mara'] },
      { dialogue: 'c2_passenger_news', unless: ['c2_saw_news'] },
      { dialogue: 'c2_passenger_after' },
    ],
  },
  {
    id: 'npc-auntie',
    kind: 'talk',
    label: 'Auntie',
    x: -0.3,
    z: 1.05,
    radius: 1.2,
    npc: 'auntie',
    dialogue: [{ dialogue: 'c2_auntie' }],
  },
  {
    id: 'npc-ahhock',
    kind: 'talk',
    label: 'Captain Ah Hock',
    x: 3.2,
    z: -0.6,
    radius: 1.2,
    npc: 'ahhock',
    dialogue: [
      { dialogue: 'c2_captain_busy', unless: ['c2_saw_news'] },
      { dialogue: 'c2_captain', unless: ['c2_talked_captain'] },
      { dialogue: 'c2_captain_after' },
    ],
  },
  {
    id: 'boat-cabin',
    kind: 'inspect',
    label: 'Cabin',
    x: -4.25,
    z: 0,
    radius: 0.7,
    dialogue: [
      // A save from the old 2.1 cliffhanger only needs a short reminder.
      { dialogue: 'c2_to_jetty', requires: ['c2_reached_jetty'] },
      { dialogue: 'c2_disembark', requires: ['c2_talked_captain'] },
      { dialogue: 'c2_cabin_early' },
    ],
  },
];

const COLLIDERS: Box[] = [
  boxFromCenter(BENCH.x, BENCH.z, BENCH.width, BENCH.depth),
  boxFromCenter(CARGO.x, CARGO.z, CARGO.width, CARGO.depth),
  boxFromCenter(ENGINE.x, ENGINE.z, ENGINE.width, ENGINE.depth),
  ...BOAT_NPCS.map((n) => boxFromCenter(n.x, n.z, NPC_COLLIDER_SIZE, NPC_COLLIDER_SIZE)),
];

export const BOAT_LAYOUT: SceneLayout = {
  bounds: DECK,
  colliders: () => COLLIDERS,
  interactables: BOAT_INTERACTABLES,
  npcs: BOAT_NPCS,
};

export const CHAPTER2_OBJECTIVES: Objective[] = [
  { id: 'c2_mara', text: 'Talk to Aunt Mara.', completeWhen: 'c2_talked_mara' },
  { id: 'c2_news', text: 'Find out what the other passengers are talking about.', completeWhen: 'c2_saw_news' },
  { id: 'c2_captain', text: 'Ask the captain about Sungai Awan.', completeWhen: 'c2_talked_captain' },
  { id: 'c2_jetty', text: 'Collect your things from the cabin.', completeWhen: 'c2_reached_jetty' },
  ...VILLAGE_C2_OBJECTIVES,
  ...LANDING_OBJECTIVES,
  ...HALL_OBJECTIVES,
];

export const BOAT_DIALOGUE: DialogueDef[] = [
  {
    id: 'c2_boat_arrival',
    lines: [
      { speaker: null, text: 'Two days later. After a night on the coastal boat to Sibu, Adrian and Mara are on the morning express boat, pushing up the Rajang.', setFlags: ['c2_arrived'] },
      { speaker: null, text: 'Kuching is far behind them. Ahead lies Kapit, and beyond it, home.' },
      { speaker: null, text: 'The VALE box is wrapped in an old sarong at the bottom of Mara\'s bag. Adrian has not let the bag out of his sight.' },
    ],
  },
  {
    id: 'c2_mara_talk',
    lines: [
      { speaker: 'mara', text: 'Two days on boats. My knees are writing a letter of complaint to the Rajah.' },
      { speaker: 'adrian', text: 'Do you think Daniel is all right?' },
      { speaker: 'mara', text: 'Daniel Rengas is the most stubborn polite young man I have ever met. They will be tired of him long before he is tired of them.' },
      { speaker: 'mara', text: 'What worries me is Harrow. "While it is still there." Men like that don\'t make threats. They make schedules.' },
      { speaker: 'adrian', text: 'You said Elias didn\'t hide everything in the palace. What did you mean?' },
      { speaker: 'mara', text: 'My grandmother said he came home in 1921 with nothing but a boat and a map he never showed anyone. Then he went upriver alone, and came back without the map.' },
      { speaker: 'mara', text: 'Ask around the boat. River people talk. Everyone on the Rajang knows somebody who knows something.', setFlags: ['c2_talked_mara'] },
    ],
  },
  {
    id: 'c2_mara_repeat',
    lines: [{ speaker: 'mara', text: 'Go on, ask around. I am going to sit here and look at the river like a woman with no enemies.' }],
  },
  {
    id: 'c2_mara_news',
    lines: [
      { speaker: 'adrian', text: 'Aunt. Awan Riverlands is surveying the upper river. Relocation packages.' },
      { speaker: 'mara', text: '...Then we are not going home for a visit. Talk to the captain. If anyone knows what has gone upriver this week, it is him.' },
    ],
  },
  {
    id: 'c2_mara_after',
    lines: [{ speaker: 'mara', text: 'A free longboat? Ah Hock must like you. Or he dislikes those survey men even more than I do.' }],
  },
  {
    id: 'c2_passenger_busy',
    lines: [{ speaker: null, text: 'A student in a university hoodie frowns at his phone, refreshing it every few seconds.' }],
  },
  {
    id: 'c2_passenger_news',
    lines: [
      { speaker: 'passenger', text: 'Sorry, bang. You\'re going past Kapit? Sungai Awan side?' },
      { speaker: 'adrian', text: 'Sungai Awan. Why?' },
      { speaker: 'passenger', text: 'My family\'s from just above there. Look at this.' },
      { speaker: null, style: 'inscription', text: 'ROYAL HOUSEHOLD APPROVES AWAN RIVERLANDS SURVEY. Land along the upper river to be "consolidated for development". Residents to be offered relocation packages.' },
      { speaker: 'passenger', text: 'My mum says survey boats went up last week. Nobody asked anybody anything.' },
      { speaker: 'adrian', text: 'Awan Riverlands. Harrow and Pell. Same company, new name.', setFlags: ['c2_saw_news'] },
      { speaker: 'passenger', text: 'You know them?' },
      { speaker: 'adrian', text: 'I\'ve read their mail.' },
    ],
  },
  {
    id: 'c2_passenger_after',
    lines: [{ speaker: 'passenger', text: 'I\'m sending it to the family group chat. Twice. My uncle only reads things the second time.' }],
  },
  {
    id: 'c2_auntie',
    lines: [
      { speaker: 'auntie', text: 'You look hungry. Rambutan. Take, take. Your auntie also. Too thin, both of you.' },
      { speaker: 'adrian', text: 'Thank you, Auntie.' },
      { speaker: null, text: 'The rambutans are very good.' },
    ],
  },
  {
    id: 'c2_captain_busy',
    lines: [{ speaker: 'ahhock', text: 'Not now. The engine is making a noise I don\'t like, and I don\'t like most noises.' }],
  },
  {
    id: 'c2_captain',
    lines: [
      { speaker: 'adrian', text: 'Captain. We need to get to Sungai Awan.' },
      { speaker: 'ahhock', text: 'Express boat doesn\'t stop there. Too small. I\'ll take you myself from Kapit, in my cousin\'s longboat.' },
      { speaker: 'ahhock', text: 'Free. Don\'t argue. A survey boat went up there yesterday. Big men, no smiles. I don\'t like them on my river.' },
      { speaker: null, text: 'The captain\'s eyes drop to the medallion at Adrian\'s collar.' },
      { speaker: 'ahhock', text: 'That sign. My grandmother used to tell us about people who wore a sword over a river. She said they walked the river in the bad years and kept the floods honest.' },
      { speaker: 'ahhock', text: 'Children\'s story, I always thought. Kapit in twenty minutes. Get your things from the cabin.', setFlags: ['c2_talked_captain'] },
    ],
  },
  {
    id: 'c2_captain_after',
    lines: [{ speaker: 'ahhock', text: 'The longboat is the blue one with the dented bow. You can\'t miss it. Everybody has tried.' }],
  },
  {
    id: 'c2_cabin_early',
    lines: [{ speaker: null, text: 'Inside the cabin, rows of seats face a small television playing an old kung-fu film, very loudly. Half the passengers are asleep anyway.' }],
  },
  {
    id: 'c2_disembark',
    lines: [
      { speaker: null, text: 'At Kapit, the express boat noses in among a crowd of longboats. The blue one with the dented bow is waiting.' },
      { speaker: null, text: 'Two more hours upriver. The jungle closes in on both banks, and the water turns from brown to green.' },
      { speaker: null, text: 'In the late afternoon, the Sungai Awan jetty slides into view: the same leaning posts, the same red roofs above the bank.' },
      { speaker: null, text: 'And along the bank, a line of wooden survey pegs tied with bright orange tape.', setFlags: ['c2_reached_jetty'] },
      { speaker: 'adrian', text: 'Those weren\'t here a week ago.' },
      { speaker: 'mara', text: 'No. And I don\'t think they are planning to take them home.' },
    ],
    enterScene: { scene: 'village_c2', spawn: 'jetty' },
  },
  {
    id: 'c2_to_jetty',
    lines: [{ speaker: null, text: 'Ah Hock\'s blue longboat is waiting at Kapit. Two hours later, Sungai Awan.' }],
    enterScene: { scene: 'village_c2', spawn: 'jetty' },
  },
];
