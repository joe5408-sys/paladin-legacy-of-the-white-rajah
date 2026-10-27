/**
 * Chapter 2, Milestone 2.5 — The Iron Warden. Pure data.
 *
 * Sungai Awan at dusk (the Chapter 2 village with evening light). The whole
 * village is out on the boardwalk; Harrow's black barge is tying up at the far
 * end of the jetty, where the survey boat was. Julian Pell waits at its
 * gangway, and on its deck, under a tarpaulin, stands the Iron Warden.
 *
 * Story order: arrival → talk to Pell → the Iron Warden steps off the barge →
 * boss battle → it falls into the river → Pell reads the Charter → Adrian will
 * take it to the Rajah → Chapter 2 Complete.
 */
import { boxFromCenter, type Box } from '../../game/core/collision';
import type { StoryFlags } from '../../game/core/flags';
import type { DialogueDef } from '../../game/dialogue/types';
import type { Interactable } from '../../game/interaction/interaction';
import { NPC_COLLIDER_SIZE, type NpcPlacement, type SceneLayout } from '../../game/scenes/layout';
import { BUILDINGS, PROPS, stairBox, VILLAGE_BOUNDS } from '../../data/villageSquare';
import { NOTICE_BOARD } from './villageData';

/** Harrow's barge, moored off the east end of the boardwalk (in the river: not walkable). */
export const BARGE = { x: 9.4, z: -8.2, length: 8.0, width: 2.6 };
/** The Iron Warden: on the barge's deck, then on the boardwalk once it steps off. */
export const IRON_ON_BARGE = { x: 9.8, z: -8.2 };
export const IRON_ON_JETTY = { x: 10.6, z: -4.6 };
export const IRON_SIZE = { width: 1.4, depth: 0.6 };
export const PELL_DUSK = { x: 8.4, z: -4.5 };

export const JETTY_NPCS: NpcPlacement[] = [
  { id: 'npc-ahhock-dusk', character: 'ahhock', x: -10.0, z: -4.5, facing: 'east' },
  { id: 'npc-mara-dusk', character: 'mara', x: -7.0, z: -3.4, facing: 'east' },
  { id: 'npc-daniel-dusk', character: 'daniel', x: -4.6, z: -3.5, facing: 'east' },
  { id: 'npc-lim-dusk', character: 'lim', x: -2.2, z: -3.3, facing: 'east' },
  { id: 'npc-siti-dusk', character: 'siti', x: -0.6, z: -3.2, facing: 'east' },
  { id: 'npc-pell-dusk', character: 'pell', x: PELL_DUSK.x, z: PELL_DUSK.z, facing: 'west' },
];

const talk = (id: string, label: string, npc: Interactable['npc'], at: { x: number; z: number }, dialogue: string): Interactable => ({
  id,
  kind: 'talk',
  label,
  x: at.x,
  z: at.z,
  radius: 1.3,
  npc,
  dialogue: [{ dialogue }],
});

export const JETTY_INTERACTABLES: Interactable[] = [
  {
    id: 'npc-pell-dusk',
    kind: 'talk',
    label: 'Julian Pell',
    x: PELL_DUSK.x,
    z: PELL_DUSK.z,
    radius: 1.4,
    npc: 'pell',
    dialogue: [
      { dialogue: 'c2_pell_dusk', unless: ['c2_iron_seen'] },
      { dialogue: 'c2_pell_dusk_after' },
    ],
  },
  {
    // Only needed if the game was closed mid-battle.
    id: 'iron-warden',
    kind: 'inspect',
    label: 'Iron Warden',
    x: IRON_ON_JETTY.x - 1.0,
    z: IRON_ON_JETTY.z,
    radius: 1.3,
    when: { requires: ['c2_iron_seen'], unless: ['c2_iron_defeated'] },
    dialogue: [{ dialogue: 'c2_iron_again' }],
  },
  talk('npc-ahhock-dusk', 'Captain Ah Hock', 'ahhock', { x: -10.0, z: -4.5 }, 'c2_ahhock_dusk'),
  talk('npc-mara-dusk', 'Aunt Mara', 'mara', { x: -7.0, z: -3.4 }, 'c2_mara_dusk'),
  talk('npc-daniel-dusk', 'Daniel', 'daniel', { x: -4.6, z: -3.5 }, 'c2_daniel_dusk'),
  talk('npc-lim-dusk', 'Uncle Lim', 'lim', { x: -2.2, z: -3.3 }, 'c2_lim_dusk'),
  talk('npc-siti-dusk', 'Kak Siti', 'siti', { x: -0.6, z: -3.2 }, 'c2_siti_dusk'),
  {
    id: 'notice-board-dusk',
    kind: 'inspect',
    label: 'Notice Board',
    x: NOTICE_BOARD.x,
    z: NOTICE_BOARD.z - 0.5,
    radius: 1.0,
    dialogue: [{ dialogue: 'c2_notice_dusk' }],
  },
];

const FIXED_COLLIDERS: Box[] = [
  ...BUILDINGS.map((b) => boxFromCenter(b.x, b.z, b.width, b.depth)),
  ...BUILDINGS.filter((b) => b.stilts).map(stairBox),
  ...PROPS.filter((p) => p.collider).map((p) => boxFromCenter(p.x, p.z, p.collider!.width, p.collider!.depth)),
  boxFromCenter(NOTICE_BOARD.x, NOTICE_BOARD.z, NOTICE_BOARD.width, NOTICE_BOARD.depth),
  ...JETTY_NPCS.map((n) => boxFromCenter(n.x, n.z, NPC_COLLIDER_SIZE, NPC_COLLIDER_SIZE)),
];
const IRON_COLLIDER = boxFromCenter(IRON_ON_JETTY.x, IRON_ON_JETTY.z, IRON_SIZE.width, IRON_SIZE.depth);

export const JETTY_LAYOUT: SceneLayout = {
  bounds: VILLAGE_BOUNDS,
  // The Iron Warden only blocks the boardwalk between stepping off the barge and the battle's end.
  colliders: (flags: StoryFlags) => [...FIXED_COLLIDERS, ...(flags.c2_iron_seen && !flags.c2_iron_defeated ? [IRON_COLLIDER] : [])],
  interactables: JETTY_INTERACTABLES,
  npcs: JETTY_NPCS,
};

export const JETTY_OBJECTIVES = [
  { id: 'c2_dusk', text: 'Get back to the village before the barge.', completeWhen: 'c2_dusk_arrived' },
  { id: 'c2_pell_barge', text: 'Confront Julian Pell at the barge.', completeWhen: 'c2_iron_seen' },
  { id: 'c2_iron', text: 'Stop the Iron Warden.', completeWhen: 'c2_iron_defeated' },
] as const;

export const JETTY_DIALOGUE: DialogueDef[] = [
  {
    id: 'c2_dusk_arrival',
    lines: [
      { speaker: null, text: 'Dusk at Sungai Awan. The whole village is out on the boardwalk, and almost nobody is talking.', setFlags: ['c2_dusk_arrived'] },
      { speaker: null, text: 'A long black barge is nosing in to the far end of the jetty, floodlights blazing from a crane. On its deck, under a tarpaulin, something very large is standing up.' },
      { speaker: 'mara', text: 'We beat it. Just.' },
      { speaker: 'daniel', text: 'Pell is at the gangway. Whatever is under that tarpaulin, he is the only one here who might call it off.' },
      { speaker: 'adrian', text: 'Then I\'ll talk to him.' },
    ],
  },
  {
    id: 'c2_pell_dusk',
    lines: [
      { speaker: 'pell', text: 'Mr Vale. Thank goodness. Nobody will tell me what this is. The Lord Chamberlain\'s office sent it upriver this afternoon, "to secure the survey".' },
      { speaker: 'adrian', text: 'You didn\'t order it?' },
      { speaker: 'pell', text: 'I ordered a consultation and a tea urn! This came with its own paperwork. Sealed. I am not permitted to open it.' },
      { speaker: null, text: 'The tarpaulin slides off the barge\'s deck. Under it stands a construct twice the height of the Sentinel: riveted iron plates over the glow of a furnace.', setFlags: ['c2_iron_seen'] },
      { speaker: null, text: 'Its visor turns toward the boardwalk. "SURVEY AREA AR-1. RESIDENTS WILL STAND CLEAR. SECURING."' },
      { speaker: null, text: 'It steps off the barge. The whole jetty sways under it.' },
      { speaker: 'pell', text: 'Stop! Stop, there are people here! Mr Vale, I can\'t stop it!' },
      { speaker: 'adrian', text: 'I can.' },
    ],
    startBattle: 'iron_warden',
  },
  {
    id: 'c2_pell_dusk_after',
    lines: [{ speaker: 'pell', text: 'I didn\'t know. I swear I didn\'t know.' }],
  },
  {
    id: 'c2_iron_again',
    lines: [{ speaker: null, text: 'The Iron Warden\'s furnace glows behind its plates. "SECURING."' }],
    startBattle: 'iron_warden',
  },
  {
    id: 'c2_iron_defeated',
    lines: [
      { speaker: null, text: 'The Iron Warden staggers back across the planks. The jetty rail gives way, and with a great hiss of steam it topples into the river.' },
      { speaker: null, text: 'For a long moment the water boils. Then there is only the river, brown and slow, carrying the floodlights\' reflections away.' },
      { speaker: 'lim', text: '...Somebody is paying for my railing.' },
      { speaker: 'pell', text: 'There were children on this boardwalk. That thing would have...' },
      { speaker: 'adrian', text: 'Mr Pell. Read this.' },
      { speaker: null, text: 'Adrian unrolls the River Charter under the floodlights. Pell reads it twice: the Rajah\'s signature, the seal, the date. 3 March 1921.' },
      { speaker: 'pell', text: 'It was signed before the concession. If this is real, the concession was never lawful, and my family\'s company was built on...' },
      { speaker: 'pell', text: 'I don\'t know which side I\'m on any more, Mr Vale. This morning I was sure.' },
      { speaker: 'daniel', text: 'Take that to the Lord Chamberlain and it disappears. So do you.' },
      { speaker: 'adrian', text: 'Then I won\'t take it to the Lord Chamberlain. Elias was meant to carry it to Kuching a hundred years ago. He never got there.' },
      { speaker: 'mara', text: 'Adrian...' },
      { speaker: 'adrian', text: 'I\'m taking it to the capital. To the Rajah himself.' },
      { speaker: null, text: 'Out on the river, the barge\'s floodlights go dark, one by one.' },
    ],
    endChapter: true,
  },
  {
    id: 'c2_ahhock_dusk',
    lines: [{ speaker: 'ahhock', text: 'Engine\'s warm. If you need to leave fast, I\'m here. I am also not looking at that barge.' }],
  },
  {
    id: 'c2_mara_dusk',
    lines: [{ speaker: 'mara', text: 'Go on. Pell is at the gangway. I will be right here, looking frightening.' }],
  },
  {
    id: 'c2_daniel_dusk',
    lines: [{ speaker: 'daniel', text: 'If this goes wrong, I\'m standing between that thing and the kedai. Badge or no badge.' }],
  },
  {
    id: 'c2_lim_dusk',
    lines: [{ speaker: 'lim', text: 'Whole village came out and nobody knows why. That is how you know it is serious.' }],
  },
  {
    id: 'c2_siti_dusk',
    lines: [{ speaker: 'siti', text: 'The clinic is open and the kettle is on. Whatever happens out there, you come and see me after. I mean it.' }],
  },
  {
    id: 'c2_notice_dusk',
    lines: [{ speaker: null, text: 'Someone has pinned a second notice over the first: CONSULTATION POSTPONED. The rude crocodile has been given a crown.' }],
  },
];
