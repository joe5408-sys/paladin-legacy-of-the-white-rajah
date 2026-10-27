/**
 * Chapter 2, Milestone 2.4 — inside the waystation. Pure data.
 *
 * A round hall cut into the cliff (room x -4..4, z -4..3): Elias's writing desk
 * (west), a sealed bronze case on a plinth (east), the Paladin oath carved on
 * the north wall, and a basin of river-water in the middle. The door to the
 * landing is at the south end. The Charter, the oath and the order are invented.
 *
 * Story: journal → case (the River Charter) → Daniel arrives → out onto the
 * landing, where the Hollow Warden climbs out of the river (waystationData.ts).
 */
import { boxFromCenter, type Box } from '../../game/core/collision';
import type { DialogueDef } from '../../game/dialogue/types';
import type { Interactable } from '../../game/interaction/interaction';
import { NPC_COLLIDER_SIZE, type NpcPlacement, type SceneLayout } from '../../game/scenes/layout';

export const HALL_ROOM: Box = { minX: -4, maxX: 4, minZ: -4, maxZ: 3 };
export const HALL_WALL_HEIGHT = 3.4;

export const DESK = { x: -3.2, z: -0.6, width: 1.0, depth: 1.4 };
export const CASE = { x: 3.2, z: -0.6, width: 1.0, depth: 1.0 };
export const BASIN = { x: 0, z: -1.8, size: 1.0 };

export const HALL_NPCS: NpcPlacement[] = [
  { id: 'npc-daniel-hall', character: 'daniel', x: -1.2, z: 2.2, facing: 'north', when: { requires: ['c2_daniel_returned'] } },
];

export const HALL_INTERACTABLES: Interactable[] = [
  {
    id: 'elias-journal',
    kind: 'inspect',
    label: "Elias's Journal",
    x: DESK.x + 1.0,
    z: DESK.z,
    radius: 0.9,
    dialogue: [
      { dialogue: 'c2_journal_again', requires: ['c2_read_journal'] },
      { dialogue: 'c2_journal' },
    ],
  },
  {
    id: 'charter-case',
    kind: 'inspect',
    label: 'Sealed Case',
    x: CASE.x - 1.0,
    z: CASE.z,
    radius: 0.9,
    dialogue: [
      { dialogue: 'c2_case_empty', requires: ['c2_found_charter'] },
      { dialogue: 'c2_charter', requires: ['c2_read_journal'] },
      { dialogue: 'c2_case_sealed' },
    ],
  },
  {
    id: 'oath-wall',
    kind: 'inspect',
    label: 'Carved Wall',
    x: 0,
    z: HALL_ROOM.minZ + 0.6,
    radius: 1.0,
    dialogue: [{ dialogue: 'c2_oath' }],
  },
  {
    id: 'hall-basin',
    kind: 'inspect',
    label: 'Stone Basin',
    x: BASIN.x,
    z: BASIN.z + 0.9,
    radius: 0.6,
    dialogue: [{ dialogue: 'c2_basin' }],
  },
  {
    id: 'hall-exit',
    kind: 'enter',
    label: 'Landing',
    x: 0,
    z: HALL_ROOM.maxZ - 0.15,
    radius: 0.8,
    enter: { scene: 'waystation_landing', spawn: 'from_hall' },
  },
];

const FIXED: Box[] = [
  boxFromCenter(DESK.x, DESK.z, DESK.width, DESK.depth),
  boxFromCenter(CASE.x, CASE.z, CASE.width, CASE.depth),
  boxFromCenter(BASIN.x, BASIN.z, BASIN.size, BASIN.size),
];
const DANIEL = boxFromCenter(HALL_NPCS[0].x, HALL_NPCS[0].z, NPC_COLLIDER_SIZE, NPC_COLLIDER_SIZE);

export const HALL_LAYOUT: SceneLayout = {
  bounds: HALL_ROOM,
  colliders: (flags) => (flags.c2_daniel_returned ? [...FIXED, DANIEL] : FIXED),
  interactables: HALL_INTERACTABLES,
  npcs: HALL_NPCS,
};

export const HALL_OBJECTIVES = [
  { id: 'c2_search', text: 'Search the waystation.', completeWhen: 'c2_found_charter' },
  { id: 'c2_warden', text: 'Defeat the Hollow Warden.', completeWhen: 'c2_warden_defeated' },
] as const;

export const HALL_DIALOGUE: DialogueDef[] = [
  {
    id: 'c2_hall_arrival',
    lines: [
      { speaker: null, text: 'Beyond the door is a round hall cut into the cliff. Roots hang through cracks in the ceiling.', setFlags: ['c2_entered_hall'] },
      { speaker: null, text: 'River-light ripples across the walls from a stone basin in the floor, though no sun reaches it.' },
      { speaker: null, text: 'A writing desk. A wall carved from floor to ceiling. And on a plinth, a sealed bronze case.' },
      { speaker: 'adrian', text: 'He worked here. Elias sat at that desk.' },
    ],
  },
  {
    id: 'c2_journal',
    lines: [
      { speaker: null, text: 'A leather journal, swollen with damp but still readable. The handwriting matches the map on the back of the portrait.' },
      { speaker: null, style: 'inscription', text: '3rd March, 1921. The Rajah signed it today, in his own hand, against the advice of his whole council. The river lands belong to those who live on them.' },
      { speaker: null, style: 'inscription', text: 'He gave it to me to carry to the Land Office in Kuching. Harrow knows. His men are on the Sibu road and at every wharf.' },
      { speaker: null, style: 'inscription', text: 'So I have brought it here instead, and sealed the case to the sign. Only a Vale\'s light will open it.' },
      { speaker: null, style: 'inscription', text: 'If I do not come back, the Charter waits. So does the river.  — E. V.' },
      { speaker: 'adrian', text: 'He never got it registered. So the concession went ahead, as if the Charter had never existed.' },
    ],
    setFlags: ['c2_read_journal'],
  },
  {
    id: 'c2_journal_again',
    lines: [{ speaker: null, style: 'inscription', text: 'If I do not come back, the Charter waits. So does the river.  — E. V.' }],
  },
  {
    id: 'c2_case_sealed',
    lines: [
      { speaker: null, text: 'A bronze case on a stone plinth, its lid carved with the sword-and-river sign. There is no lock and no hinge to force.' },
      { speaker: 'adrian', text: 'Sealed. Elias must have written something about this.' },
    ],
  },
  {
    id: 'c2_charter',
    lines: [
      { speaker: null, text: 'Adrian lifts the medallion. The sign on the lid wakes, white-gold, and the lid swings open without a sound.' },
      { speaker: null, text: 'Inside, wrapped in oilcloth, is a folded document on heavy paper, sealed in red wax.' },
      { speaker: null, style: 'inscription', text: 'THE RIVER CHARTER. We grant and confirm to the people of the Awan river the lands they live upon, to hold for themselves and their children forever.' },
      { speaker: null, style: 'inscription', text: 'No concession shall stand against this grant. Given under our hand and seal, in the year 1921.' },
      { speaker: null, text: 'Below the text, the Rajah\'s signature, and the great red seal of state.', setFlags: ['c2_found_charter'] },
      { speaker: 'adrian', text: 'Sungai Awan was never Harrow\'s to sell. It was never anyone\'s to sell.' },
    ],
    next: 'c2_daniel_returns',
  },
  {
    id: 'c2_case_empty',
    lines: [{ speaker: null, text: 'The bronze case stands open and empty. The Charter is safe inside Adrian\'s jacket.' }],
  },
  {
    id: 'c2_oath',
    lines: [
      { speaker: null, text: 'The whole north wall is carved with lines of text. As Adrian reads, the words fill with light.' },
      { speaker: null, style: 'inscription', text: 'I stand between the Crown and the river, and serve both by guarding the people between them.' },
      { speaker: null, style: 'inscription', text: 'I will not draw my sword for gold, nor sheathe it out of fear.' },
      { speaker: null, style: 'inscription', text: 'What the river gives, I will keep. What the Crown promises, I will hold it to.' },
      { speaker: null, style: 'inscription', text: 'When the Crown forgets its word, I will remember it for them.' },
      { speaker: 'adrian', text: 'The whole oath. Not just the first line.' },
    ],
    setFlags: ['c2_read_oath'],
  },
  {
    id: 'c2_basin',
    lines: [{ speaker: null, text: 'Clear river-water fills the basin, fed by a channel through the rock. It is cold, and it glows faintly, like the spirit did.' }],
  },
  {
    id: 'c2_daniel_returns',
    lines: [
      { speaker: null, text: 'Footsteps on the stone outside. A torch beam sweeps across the doorway.', setFlags: ['c2_daniel_returned'] },
      { speaker: 'daniel', text: 'Easy. It\'s me.' },
      { speaker: 'adrian', text: 'Daniel! They let you go?' },
      { speaker: 'daniel', text: 'Released "for lack of evidence". Which means they want to see where I go next.' },
      { speaker: 'adrian', text: 'And you came here.' },
      { speaker: 'daniel', text: 'The long way round. Three boats, and Ah Hock\'s cousin brought me past the rapids. I may have been followed anyway. I\'m sorry.' },
      { speaker: 'daniel', text: 'But you need to hear this. Harrow\'s barge left Kapit an hour ago, coming upriver tonight. The manifest says "equipment".' },
      { speaker: 'daniel', text: '...Is that a Rajah\'s seal?' },
      { speaker: 'adrian', text: 'The River Charter. The land, given to the people who live on it, in 1921. Elias died carrying it.' },
      { speaker: 'daniel', text: 'Then that\'s what Harrow is coming for.' },
      { speaker: null, text: 'Outside, Mara shouts. Something heavy lands on the stone steps.' },
    ],
    enterScene: { scene: 'waystation_landing', spawn: 'from_hall' },
  },
];
