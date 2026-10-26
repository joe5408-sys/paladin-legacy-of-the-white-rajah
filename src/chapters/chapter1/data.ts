/**
 * Chapter 1 — The Capital's Shadow. Milestone 1.1: Arrival in Kuching.
 * Pure data: the waterfront layout, its characters' placement, dialogue and
 * objectives. Everything here is loaded on demand (not at startup).
 *
 * Fictional setting: an imagined, alternate-history Kuching. The palace,
 * archives, officials and events are invented.
 *
 * Map: x -14..14, z -5.2..6. River to the north. Along the north edge, west to
 * east: a row of shophouses, the Royal Archives, then the open riverfront
 * boardwalk with the ferry pier. Across the river: the Palace and an old fort.
 */
import type { Objective } from '../../data/quests';
import type { BuildingDef, PropDef } from '../../data/villageSquare';
import { boxFromCenter, type Box } from '../../game/core/collision';
import type { DialogueDef } from '../../game/dialogue/types';
import type { Interactable } from '../../game/interaction/interaction';
import { NPC_COLLIDER_SIZE, type NpcPlacement, type SceneLayout } from '../../game/scenes/layout';

export const WATERFRONT_BOUNDS: Box = { minX: -14, maxX: 14, minZ: -5.2, maxZ: 6 };
export const WF_RIVER = { minX: -40, maxX: 40, minZ: -20, maxZ: -6.2 };
export const WF_BOARDWALK = { minX: 1.6, maxX: 14.5, minZ: -6.2, maxZ: -4.8 };
export const PIER = { x: 9, width: 1.2, fromZ: -6.2, toZ: -9.5 };

const shophouse = (id: string, x: number, wall: string, trim: string): BuildingDef => ({
  id,
  label: 'Shophouse',
  x,
  z: -3.4,
  width: 2.2,
  depth: 3,
  height: 3.2,
  wallColor: wall,
  roofColor: '#6b3a2a',
  trimColor: trim,
  door: true,
});

export const WF_BUILDINGS: BuildingDef[] = [
  shophouse('shop-1', -12.5, '#d9a35b', '#f0ebe0'),
  shophouse('shop-2', -10.3, '#8fb9a8', '#f0ebe0'),
  shophouse('shop-3', -8.1, '#e3c7a1', '#6b4a30'),
  shophouse('shop-4', -5.9, '#c97b63', '#f0ebe0'),
  {
    id: 'archives',
    label: 'Royal Archives',
    x: -1.5,
    z: -3.3,
    width: 6,
    depth: 3,
    height: 3.4,
    wallColor: '#e6e0d0',
    roofColor: '#4f4a44',
    trimColor: '#9b8f78',
    door: true,
  },
];

/** Front of the Archives, used for the columns and the door interaction. */
export const ARCHIVES = { x: -1.5, frontZ: -1.8 };

export const WF_PROPS: PropDef[] = [
  { kind: 'lamp', x: 3.4, z: -4.4, collider: { width: 0.3, depth: 0.3 } },
  { kind: 'lamp', x: 12.2, z: -4.4, collider: { width: 0.3, depth: 0.3 } },
  { kind: 'lamp', x: -7.4, z: 0.3, collider: { width: 0.3, depth: 0.3 } },
  { kind: 'palm', x: -13.2, z: 4.6, collider: { width: 0.5, depth: 0.5 } },
  { kind: 'palm', x: 13.1, z: 4.9, collider: { width: 0.5, depth: 0.5 } },
  { kind: 'palm', x: 13, z: -1.2, collider: { width: 0.5, depth: 0.5 } },
  { kind: 'planter', x: -4.2, z: -1.2, collider: { width: 0.7, depth: 0.7 } },
  { kind: 'planter', x: 1.2, z: -1.2, collider: { width: 0.7, depth: 0.7 } },
  { kind: 'bench', x: 3.2, z: 3.1, collider: { width: 1.8, depth: 0.6 } },
  { kind: 'bench', x: 6.6, z: -3.6, collider: { width: 1.8, depth: 0.6 } },
];

/** Kak Jamilah's kolo mee stall, with a bandstand pavilion to the west. */
export const STALL = { x: -4.5, z: 2.4, width: 2.2, depth: 0.8 };
export const BANDSTAND = { x: -10, z: 2.6, size: 2.6 };

export const WF_NPCS: NpcPlacement[] = [
  { id: 'npc-daniel-pier', character: 'daniel', x: 9, z: -4.3, facing: 'south' },
  { id: 'npc-mara-bench', character: 'mara', x: 3.2, z: 2.2, facing: 'south' },
  { id: 'npc-jamilah', character: 'jamilah', x: -4.5, z: 1.6, facing: 'south' },
];

export const WF_INTERACTABLES: Interactable[] = [
  {
    id: 'npc-daniel-pier',
    kind: 'talk',
    label: 'Daniel',
    x: 9,
    z: -4.3,
    radius: 1.4,
    npc: 'daniel',
    dialogue: [
      { dialogue: 'c1_daniel_pier', unless: ['c1_met_daniel'] },
      { dialogue: 'c1_daniel_repeat' },
    ],
  },
  {
    id: 'npc-mara-bench',
    kind: 'talk',
    label: 'Aunt Mara',
    x: 3.2,
    z: 2.2,
    radius: 1.4,
    npc: 'mara',
    dialogue: [
      { dialogue: 'c1_mara_after', requires: ['c1_met_daniel'] },
      { dialogue: 'c1_mara_before' },
    ],
  },
  {
    id: 'npc-jamilah',
    kind: 'talk',
    label: 'Kak Jamilah',
    x: -4.5,
    z: 1.6,
    radius: 1.7, // talk across the stall counter
    npc: 'jamilah',
    dialogue: [{ dialogue: 'c1_jamilah' }],
  },
  {
    id: 'archives-door',
    kind: 'inspect',
    label: 'Royal Archives',
    x: ARCHIVES.x,
    z: -1.25,
    radius: 1.1,
    when: { unless: ['c1_archives_reached'] },
    dialogue: [
      { dialogue: 'c1_archives_door', requires: ['c1_met_daniel'] },
      { dialogue: 'c1_archives_early' },
    ],
  },
  {
    // After the first dawn, the doors simply lead inside.
    id: 'archives-enter',
    kind: 'enter',
    label: 'Royal Archives',
    x: ARCHIVES.x,
    z: -1.25,
    radius: 1.1,
    when: { requires: ['c1_archives_reached'] },
    enter: { scene: 'archives', spawn: 'entrance' },
  },
];

function buildColliders(): Box[] {
  const boxes: Box[] = WF_BUILDINGS.map((b) => boxFromCenter(b.x, b.z, b.width, b.depth));
  for (const p of WF_PROPS) {
    if (p.collider) boxes.push(boxFromCenter(p.x, p.z, p.collider.width, p.collider.depth));
  }
  boxes.push(boxFromCenter(STALL.x, STALL.z, STALL.width, STALL.depth));
  boxes.push(boxFromCenter(BANDSTAND.x, BANDSTAND.z, BANDSTAND.size, BANDSTAND.size));
  for (const n of WF_NPCS) boxes.push(boxFromCenter(n.x, n.z, NPC_COLLIDER_SIZE, NPC_COLLIDER_SIZE));
  return boxes;
}

const COLLIDERS = buildColliders();

export const WATERFRONT_LAYOUT: SceneLayout = {
  bounds: WATERFRONT_BOUNDS,
  colliders: () => COLLIDERS,
  interactables: WF_INTERACTABLES,
  npcs: WF_NPCS,
};

export const CHAPTER1_OBJECTIVES: Objective[] = [
  { id: 'c1_meet_daniel', text: 'Meet Daniel at the ferry pier.', completeWhen: 'c1_met_daniel' },
  { id: 'c1_archives', text: 'Go to the Royal Archives.', completeWhen: 'c1_archives_reached' },
  // Milestone 1.2: inside the Archives
  { id: 'c1_treason', text: 'Find the treason records.', completeWhen: 'c1_clue_gap' },
  { id: 'c1_ask', text: 'Ask the Archivist about the missing folder.', completeWhen: 'c1_hint_household' },
  { id: 'c1_ledgers', text: 'Search the household ledgers.', completeWhen: 'c1_file_found' },
  { id: 'c1_vault', text: 'Investigate the iron door.', completeWhen: 'c1_vault_found' },
  { id: 'c1_sentinel', text: 'Get past the brass figure in the vault.', completeWhen: 'c1_sentinel_defeated' },
  { id: 'c1_inner_gate', text: 'Open the inner gate.', completeWhen: 'c1_inner_gate_open' },
  { id: 'c1_box', text: 'Open the VALE box.', completeWhen: 'c1_box_read' },
  { id: 'c1_reply', text: "Find the Rajah's reply.", completeWhen: 'c1_letter_found' },
  { id: 'c1_escape', text: 'Escape through the flood door.', completeWhen: 'c1_escaped' },
];

export const CHAPTER1_DIALOGUE: DialogueDef[] = [
  {
    id: 'c1_arrival',
    lines: [
      { speaker: null, text: 'Kuching. Two days downriver, and the capital glows against the evening sky.', setFlags: ['c1_arrived'] },
      { speaker: null, text: 'Across the water, the Palace stands white and silent, its windows lit like watching eyes.' },
      { speaker: 'mara', text: 'Forty years since I last stood here. The city grew taller. The palace did not.' },
      { speaker: 'adrian', text: 'Daniel said to meet him at the ferry pier. Let\'s not keep royal security waiting.' },
    ],
  },
  {
    id: 'c1_daniel_pier',
    lines: [
      { speaker: 'daniel', text: 'You came. Good. Keep your voice down; the waterfront has ears tonight.' },
      { speaker: 'adrian', text: 'Whose ears?' },
      { speaker: 'daniel', text: 'An hour after I filed my report on the awakening, someone in the palace erased it. Then they erased my access.' },
      { speaker: 'daniel', text: 'But the original treason record still exists. The Royal Archives keep everything, even what the Crown wants forgotten.' },
      { speaker: 'adrian', text: 'Then that is where we start.' },
      { speaker: 'daniel', text: 'The Archives are the stone building just west of the boardwalk. Take a look. I\'ll watch the street.' },
    ],
    setFlags: ['c1_met_daniel'],
  },
  {
    id: 'c1_daniel_repeat',
    lines: [{ speaker: 'daniel', text: 'The Archives, west of here, past the boardwalk. I have the street covered.' }],
  },
  {
    id: 'c1_mara_before',
    lines: [{ speaker: 'mara', text: 'Go and find your officer. These old knees need this bench a while longer.' }],
  },
  {
    id: 'c1_mara_after',
    lines: [
      { speaker: 'mara', text: 'The Archives? Your great-grandfather spent half his life in that building.' },
      { speaker: 'mara', text: 'Mind the ghosts, Adrian. Some of them still keep the books.' },
    ],
  },
  {
    id: 'c1_jamilah',
    lines: [
      { speaker: 'jamilah', text: 'Kolo mee, adik? Best on the waterfront. My mother\'s recipe, and her mother\'s before that.' },
      { speaker: 'adrian', text: 'Maybe after we save the kingdom.' },
      { speaker: 'jamilah', text: 'Hah! Then I will keep the pot warm. Don\'t take too long.' },
    ],
  },
  {
    id: 'c1_archives_early',
    lines: [
      { speaker: null, text: 'The Royal Archives. Its heavy doors are shut for the night.' },
      { speaker: 'adrian', text: 'Daniel first. He will know how to get in.' },
    ],
  },
  {
    id: 'c1_archives_door',
    lines: [
      { speaker: null, text: 'Tall doors of carved belian wood. Above them, the royal crest.' },
      { speaker: null, text: 'Beneath it, scratched almost smooth, the faint outline of a sword over a river.' },
      { speaker: 'adrian', text: 'The Paladin sign. Here, on the Crown\'s own archive.' },
      { speaker: null, text: 'The doors are locked until dawn.' },
      { speaker: 'adrian', text: 'Dawn, then. Whatever they buried in there, I am digging it up.' },
      { speaker: null, text: 'A long night on a hard bench. Daniel keeps watch; Aunt Mara snores, gently.' },
      { speaker: null, text: 'At first light, the carved doors creak open.', setFlags: ['c1_archives_reached'] },
    ],
    enterScene: { scene: 'archives', spawn: 'entrance' },
  },
];
