/**
 * Chapter 3, Milestone 3.5 — the epilogue. Pure data.
 *
 * Sungai Awan by day, a week after the hearing: the Chapter 2 village again,
 * with a new layout. Ah Hock's longboat brings Adrian home to the jetty. All
 * along the bank the survey pegs have been pulled out and piled up outside the
 * kedai; one is left, at the foot of the Vale house stairs, where Mara is
 * waiting. Pulling it up ends the chapter (and the first story).
 */
import { boxFromCenter, type Box } from '../../game/core/collision';
import type { DialogueDef } from '../../game/dialogue/types';
import type { Interactable } from '../../game/interaction/interaction';
import { NPC_COLLIDER_SIZE, type NpcPlacement, type SceneLayout } from '../../game/scenes/layout';
import { BUILDINGS, PROPS, stairBox, VILLAGE_BOUNDS } from '../../data/villageSquare';
import type { Objective } from '../../data/quests';
import { NOTICE_BOARD } from '../chapter2/villageData';

/** The last survey peg, in front of the Vale house beside its stairs. */
export const LAST_PEG = { x: 5.3, z: 1.6 };
/** The pile of pulled-up pegs outside the kedai (decoration only). */
export const PEG_PILE = { x: -5.0, z: 1.7 };

export const EPILOGUE_NPCS: NpcPlacement[] = [
  { id: 'npc-ahhock-epi', character: 'ahhock', x: -0.4, z: -4.45, facing: 'east' },
  { id: 'npc-mara-epi', character: 'mara', x: 3.5, z: 1.8, facing: 'east' },
  { id: 'npc-lim-epi', character: 'lim', x: -6.2, z: 1.0, facing: 'south' },
  { id: 'npc-siti-epi', character: 'siti', x: -0.2, z: 0.5, facing: 'south' },
  { id: 'npc-daniel-epi', character: 'daniel', x: -2.4, z: 3.0, facing: 'south' },
  { id: 'npc-pell-epi', character: 'pell', x: 8.6, z: -4.4, facing: 'north' },
];

const at = (id: string) => EPILOGUE_NPCS.find((n) => n.id === id)!;
const talk = (id: string, label: string, dialogue: string): Interactable => ({
  id,
  kind: 'talk',
  label,
  x: at(id).x,
  z: at(id).z,
  radius: 1.3,
  npc: at(id).character,
  dialogue: [{ dialogue }],
});

export const EPILOGUE_INTERACTABLES: Interactable[] = [
  {
    id: 'last-peg',
    kind: 'activate',
    verb: 'Pull up',
    label: 'the Last Survey Peg',
    x: LAST_PEG.x,
    z: LAST_PEG.z,
    radius: 1.2,
    when: { unless: ['c3_pegs_pulled'] },
    dialogue: [{ dialogue: 'c3_last_peg' }],
  },
  talk('npc-mara-epi', 'Aunt Mara', 'c3_mara_epi'),
  talk('npc-ahhock-epi', 'Captain Ah Hock', 'c3_ahhock_epi'),
  talk('npc-lim-epi', 'Uncle Lim', 'c3_lim_epi'),
  talk('npc-siti-epi', 'Kak Siti', 'c3_siti_epi'),
  talk('npc-daniel-epi', 'Daniel', 'c3_daniel_epi'),
  talk('npc-pell-epi', 'Julian Pell', 'c3_pell_epi'),
  {
    id: 'notice-board-epi',
    kind: 'inspect',
    label: 'Notice Board',
    x: NOTICE_BOARD.x,
    z: NOTICE_BOARD.z - 0.5,
    radius: 1.0,
    dialogue: [{ dialogue: 'c3_notice_epi' }],
  },
];

const EPILOGUE_COLLIDERS: Box[] = [
  ...BUILDINGS.map((b) => boxFromCenter(b.x, b.z, b.width, b.depth)),
  ...BUILDINGS.filter((b) => b.stilts).map(stairBox),
  ...PROPS.filter((p) => p.collider).map((p) => boxFromCenter(p.x, p.z, p.collider!.width, p.collider!.depth)),
  boxFromCenter(NOTICE_BOARD.x, NOTICE_BOARD.z, NOTICE_BOARD.width, NOTICE_BOARD.depth),
  ...EPILOGUE_NPCS.map((n) => boxFromCenter(n.x, n.z, NPC_COLLIDER_SIZE, NPC_COLLIDER_SIZE)),
];

export const EPILOGUE_LAYOUT: SceneLayout = {
  bounds: VILLAGE_BOUNDS,
  colliders: () => EPILOGUE_COLLIDERS,
  interactables: EPILOGUE_INTERACTABLES,
  npcs: EPILOGUE_NPCS,
};

export const EPILOGUE_OBJECTIVES: Objective[] = [
  { id: 'c3_home', text: 'Go home to Sungai Awan.', completeWhen: 'c3_epilogue_arrived' },
  { id: 'c3_last_peg', text: 'Pull up the last survey peg, by the Vale house.', completeWhen: 'c3_pegs_pulled' },
];

export const EPILOGUE_DIALOGUE: DialogueDef[] = [
  {
    id: 'c3_epilogue_arrival',
    lines: [
      { speaker: null, text: 'A week later. Sungai Awan, in the morning.', setFlags: ['c3_epilogue_arrived'] },
      { speaker: null, text: 'Ah Hock\'s blue longboat noses in to the jetty. All along the bank, people are pulling the orange survey pegs out of the ground and throwing them on a pile outside the kedai.' },
      { speaker: 'ahhock', text: 'Last stop, Paladin. Mind the new railing. Pell paid for it.' },
      { speaker: 'mara', text: 'Adrian! Over here, by the house. I saved you the last one.' },
    ],
  },
  {
    // The end of Chapter 3, and of the first story.
    id: 'c3_last_peg',
    lines: [
      { speaker: null, text: 'The last survey peg stands at the foot of the Vale house stairs. Its orange tape has faded in the sun.' },
      { speaker: 'mara', text: 'Your great-grandfather carried a promise up this river, so it would still be here when someone came for it. Go on.' },
      { speaker: null, text: 'It comes out of the ground with a small, unimpressive pop.', setFlags: ['c3_pegs_pulled'] },
      { speaker: 'lim', text: 'That one is going on my wall!' },
      { speaker: 'mara', text: 'There. Now it is just a garden again.' },
      { speaker: 'adrian', text: 'Aunt Mara. The Crown remembers its heroes, and history remembers its traitors. But who decides which is which?' },
      { speaker: 'mara', text: 'This time? A young Rajah, an old Clerk, and a great deal of paperwork.' },
      { speaker: 'mara', text: 'Next time, the people who were there. So you tell the truth, and you tell it well. Elias did. Now so have you.' },
      { speaker: null, text: 'Out on the river, the morning boat sounds its horn. At Adrian\'s collar, the medallion is warm, and quiet.' },
    ],
    endChapter: true,
  },
  {
    id: 'c3_mara_epi',
    lines: [{ speaker: 'mara', text: 'The last peg, by the stairs. I have guarded it all week. Lim offered me money for it, twice.' }],
  },
  {
    id: 'c3_ahhock_epi',
    lines: [{ speaker: 'ahhock', text: 'Express boat runs Tuesdays. For you, any day, free. Don\'t tell anybody.' }],
  },
  {
    id: 'c3_lim_epi',
    lines: [
      { speaker: 'lim', text: 'Forty-one pegs. I counted. Forty-one pegs, one Charter, and a railing somebody owes me.' },
      { speaker: 'lim', text: '...Pell paid for the railing? Then nobody owes me anything. Strange feeling.' },
    ],
  },
  {
    id: 'c3_siti_epi',
    lines: [{ speaker: 'siti', text: 'The clinic had a letter from the palace. Somebody up there has noticed we exist, and wants to know what we need. I have written four pages so far.' }],
  },
  {
    id: 'c3_daniel_epi',
    lines: [
      { speaker: 'daniel', text: 'Osman phoned. My badge is waiting, if I want it. Back pay and everything.' },
      { speaker: 'daniel', text: 'Harrow left Kuching on Tuesday, with a lot of boxes. Somebody should keep an eye on where they went. I said I\'d think about it.' },
    ],
  },
  {
    id: 'c3_pell_epi',
    lines: [
      { speaker: 'pell', text: 'I am unemployed, Mr Vale, and the river is very nice in the morning. I never looked at it before.' },
      { speaker: 'pell', text: 'The Archivist wrote to me. There are other villages in those tin boxes in the vault. Other families. I thought you would want to know.' },
    ],
  },
  {
    id: 'c3_notice_epi',
    lines: [{ speaker: null, text: 'A new notice, on palace paper: THE RIVER CHARTER OF 1921 IS ENTERED IN THE REGISTER OF ROYAL GRANTS. Somebody has drawn the crocodile again. It is smiling.' }],
  },
];
