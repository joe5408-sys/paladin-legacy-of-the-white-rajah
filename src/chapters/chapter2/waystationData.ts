/**
 * Chapter 2, Milestone 2.3 — the waystation landing above the rapids. Pure data.
 *
 * An invented Paladin site (not based on any real sacred place): mossy steps up
 * from the river to a stone terrace, three standing stones carved with the
 * sword-and-river sign, and a sealed door in the cliff. Area: x -6..6, z -5..4.
 *
 * The light puzzle uses only flags. Elias's verse gives the order:
 *   "first the deep, then the bright, then the one that waits"
 *   the deep   = the stone standing in the river pool (east, by the water)
 *   the bright = the stone in a shaft of sunlight (west)
 *   the waits  = the stone beside the door, turned to face it (north)
 * A wrong order puts out the stones already lit, with no other penalty.
 */
import { boxFromCenter, type Box } from '../../game/core/collision';
import type { StoryFlags } from '../../game/core/flags';
import type { DialogueDef } from '../../game/dialogue/types';
import type { Interactable } from '../../game/interaction/interaction';
import { NPC_COLLIDER_SIZE, type NpcPlacement, type SceneLayout } from '../../game/scenes/layout';

export const LANDING_BOUNDS: Box = { minX: -6, maxX: 6, minZ: -5, maxZ: 4 };

/** The three standing stones. */
export const STONES = {
  deep: { x: 4.6, z: 2.3 },
  bright: { x: -4.4, z: -1.4 },
  waits: { x: 2.1, z: -3.9 },
} as const;
export const STONE_SIZE = { width: 0.7, depth: 0.5 };

/** The sealed door in the cliff, and where the training spirit appears in it. */
export const DOOR = { x: 0, width: 1.8, height: 2.6 };
export const SPIRIT = { x: 0, z: -4.3 };

/** The mossy steps from the river up to the terrace (decoration; walkable). */
export const STEPS = { x: 0, width: 3, fromZ: 2.6, toZ: 0.6, count: 5 };

export const LANDING_NPCS: NpcPlacement[] = [
  { id: 'npc-ahhock-landing', character: 'ahhock', x: -2.7, z: 3.4, facing: 'north' },
  { id: 'npc-mara-landing', character: 'mara', x: 2.0, z: 3.3, facing: 'north' },
];

const stone = (
  id: string,
  label: string,
  at: { x: number; z: number },
  dialogue: Interactable['dialogue'],
): Interactable => ({ id, kind: 'activate', label, x: at.x, z: at.z + 0.75, radius: 1.0, dialogue });

export const LANDING_INTERACTABLES: Interactable[] = [
  stone('stone-deep', 'Stone by the Water', STONES.deep, [
    { dialogue: 'c2_stone_glowing', requires: ['c2_stones_woken'] },
    { dialogue: 'c2_stone_glowing', requires: ['c2_stone_deep'] },
    { dialogue: 'c2_stone_deep_wake' },
  ]),
  stone('stone-bright', 'Sunlit Stone', STONES.bright, [
    { dialogue: 'c2_stone_glowing', requires: ['c2_stones_woken'] },
    { dialogue: 'c2_stone_glowing', requires: ['c2_stone_bright'] },
    { dialogue: 'c2_stone_bright_wake', requires: ['c2_stone_deep'] },
    { dialogue: 'c2_stone_bright_dark' },
  ]),
  stone('stone-waits', 'Stone by the Door', STONES.waits, [
    { dialogue: 'c2_stone_glowing', requires: ['c2_stones_woken'] },
    { dialogue: 'c2_stone_waits_wake', requires: ['c2_stone_bright'] },
    { dialogue: 'c2_stones_reset', requires: ['c2_stone_deep'] },
    { dialogue: 'c2_stone_waits_dark' },
  ]),
  {
    id: 'waystation-door',
    kind: 'inspect',
    label: 'Sealed Door',
    x: DOOR.x,
    z: LANDING_BOUNDS.minZ + 0.7,
    radius: 1.1,
    when: { unless: ['c2_stones_woken'] },
    dialogue: [{ dialogue: 'c2_door_sealed' }],
  },
  {
    // Only needed if the game was closed mid-battle: face the spirit again.
    id: 'training-spirit',
    kind: 'talk',
    label: 'Spirit of the Waystation',
    x: SPIRIT.x,
    z: SPIRIT.z + 1.1,
    radius: 1.3,
    when: { requires: ['c2_stones_woken'], unless: ['c2_spirit_defeated'] },
    dialogue: [{ dialogue: 'c2_spirit_again' }],
  },
  {
    id: 'npc-mara-landing',
    kind: 'talk',
    label: 'Aunt Mara',
    x: 2.0,
    z: 3.3,
    radius: 1.3,
    npc: 'mara',
    dialogue: [
      { dialogue: 'c2_mara_landing_after', requires: ['c2_stones_woken'] },
      { dialogue: 'c2_mara_landing' },
    ],
  },
  {
    id: 'npc-ahhock-landing',
    kind: 'talk',
    label: 'Captain Ah Hock',
    x: -2.7,
    z: 3.4,
    radius: 1.3,
    npc: 'ahhock',
    dialogue: [{ dialogue: 'c2_ahhock_landing' }],
  },
];

const FIXED_COLLIDERS: Box[] = [
  ...Object.values(STONES).map((s) => boxFromCenter(s.x, s.z, STONE_SIZE.width, STONE_SIZE.depth)),
  ...LANDING_NPCS.map((n) => boxFromCenter(n.x, n.z, NPC_COLLIDER_SIZE, NPC_COLLIDER_SIZE)),
];
const SPIRIT_COLLIDER = boxFromCenter(SPIRIT.x, SPIRIT.z, 1.0, 0.5);

export const LANDING_LAYOUT: SceneLayout = {
  bounds: LANDING_BOUNDS,
  // The spirit stands in the open doorway until its test is passed.
  colliders: (flags: StoryFlags) =>
    flags.c2_stones_woken && !flags.c2_spirit_defeated ? [...FIXED_COLLIDERS, SPIRIT_COLLIDER] : FIXED_COLLIDERS,
  interactables: LANDING_INTERACTABLES,
  npcs: LANDING_NPCS,
};

export const LANDING_OBJECTIVES = [
  { id: 'c2_stones', text: 'Wake the three stones in the right order.', completeWhen: 'c2_stones_woken' },
  { id: 'c2_spirit', text: "Face the waystation's guardian.", completeWhen: 'c2_learned_ward' },
] as const;

export const LANDING_DIALOGUE: DialogueDef[] = [
  {
    id: 'c2_landing_arrival',
    lines: [
      { speaker: null, text: 'Past the last bend, Ah Hock cuts the engine. A flight of stone steps rises out of the river, green with moss.', setFlags: ['c2_landing_arrived'] },
      { speaker: null, text: 'At the top: a terrace of old paving, three standing stones, and a door cut into the cliff, sealed with a single slab.' },
      { speaker: null, text: 'Every stone bears the same carving. A sword, crossing a river.' },
      { speaker: 'mara', text: 'A hundred years nobody has stood here. Except, I think, your great-grandfather.' },
      { speaker: 'adrian', text: '"Wake the stones as the water woke: first the deep, then the bright, then the one that waits."' },
      { speaker: 'mara', text: 'Then wake them, Paladin. I will supervise from here. I am eighty-one; supervising is my art.' },
    ],
  },
  {
    id: 'c2_stone_glowing',
    lines: [{ speaker: null, text: 'The stone glows softly under Adrian\'s hand, warm as the medallion at his collar.' }],
  },
  {
    id: 'c2_stone_deep_wake',
    lines: [
      { speaker: null, text: 'This stone stands with its foot in a pool of river-water, deep and dark and still.' },
      { speaker: null, text: 'Adrian lifts the medallion to the carving. The sign drinks the light and glows blue-white, like moonlight under water.' },
      { speaker: 'adrian', text: 'The deep. One.' },
    ],
    setFlags: ['c2_stone_deep'],
  },
  {
    id: 'c2_stone_bright_dark',
    lines: [
      { speaker: null, text: 'A shaft of sunlight falls through the canopy onto this stone, and its carving shines.' },
      { speaker: null, text: 'Adrian lifts the medallion. The sign flickers... and goes dark.' },
      { speaker: 'adrian', text: 'Not first. "As the water woke." Water starts somewhere deep.' },
    ],
  },
  {
    id: 'c2_stone_bright_wake',
    lines: [
      { speaker: null, text: 'A shaft of sunlight falls through the canopy onto this stone.' },
      { speaker: null, text: 'Adrian lifts the medallion. The carving blazes gold, and a thread of light runs through the moss between this stone and the first.' },
      { speaker: 'adrian', text: 'The bright. Two.' },
    ],
    setFlags: ['c2_stone_bright'],
  },
  {
    id: 'c2_stone_waits_dark',
    lines: [
      { speaker: null, text: 'This stone stands apart beside the door, turned to face it, as if it has been waiting a long time for it to open.' },
      { speaker: null, text: 'Adrian lifts the medallion. Nothing. The stone keeps on waiting.' },
      { speaker: 'adrian', text: '"The one that waits." It would be last, wouldn\'t it.' },
    ],
  },
  {
    id: 'c2_stones_reset',
    lines: [
      { speaker: null, text: 'Adrian lifts the medallion to the stone beside the door. For a moment it glows...' },
      { speaker: null, text: '...then every stone on the terrace goes dark at once, with a sound like a sigh.' },
      { speaker: 'mara', text: '(from the steps) Wrong order, I think. Start again. Nobody is timing you.' },
    ],
    clearFlags: ['c2_stone_deep', 'c2_stone_bright'],
  },
  {
    id: 'c2_stone_waits_wake',
    lines: [
      { speaker: null, text: 'Adrian lifts the medallion to the stone that waits. It answers at once, as if it had only been waiting for him.' },
      { speaker: null, text: 'Light runs from stone to stone along the grooves in the paving, then up the cliff into the carving on the door.', setFlags: ['c2_stones_woken'] },
      { speaker: null, text: 'Stone grinds on stone. The slab sinks into the ground, and cool air breathes out of the dark.' },
      { speaker: null, text: 'In the doorway, light gathers into a tall figure: the shape of the Guardian beneath the Vale house, but made of moving river-water.' },
      { speaker: 'spirit', text: 'BLOOD OF VALE. YOU WOKE THE STONES AS THE WATER WOKE.' },
      { speaker: 'spirit', text: 'THE CHAMBER TAUGHT YOU TO STRIKE. HERE YOU WILL LEARN TO SHIELD. STAND, AND BE TAUGHT.' },
    ],
    startBattle: 'training_spirit',
  },
  {
    id: 'c2_spirit_again',
    lines: [{ speaker: 'spirit', text: 'THE LESSON IS NOT FINISHED, HEIR OF VALE. STAND, AND BE TAUGHT.' }],
    startBattle: 'training_spirit',
  },
  {
    id: 'c2_spirit_defeated',
    lines: [
      { speaker: null, text: 'The spirit kneels, as the Guardian did. But it does not crumble. Its light pours like water into the medallion at Adrian\'s collar.' },
      { speaker: 'spirit', text: 'A SWORD PROTECTS ONE MOMENT. A WARD PROTECTS WHAT COMES AFTER.' },
      { speaker: 'spirit', text: 'THE RIVER DOES NOT FIGHT THE ROCK. IT KEEPS THE VALLEY.' },
      { speaker: null, style: 'inscription', text: 'Adrian learned River Ward: once per battle, recover HP and block the next hit completely.', setFlags: ['c2_learned_ward'] },
      { speaker: 'spirit', text: 'WHAT ELIAS LEFT IS WITHIN. THE DOOR IS OPEN TO YOU.' },
      { speaker: null, text: 'The spirit flows back down the steps and into the river, and is gone.' },
      { speaker: 'mara', text: 'Well. Go on, then. I will hold the boat. And the balm.' },
    ],
    endChapter: true,
  },
  {
    id: 'c2_door_sealed',
    lines: [
      { speaker: null, text: 'A single slab of stone seals the doorway. There is no handle, no keyhole: only the sword-and-river sign, dark and cold.' },
      { speaker: 'adrian', text: 'The stones first. The deep, the bright, then the one that waits.' },
    ],
  },
  {
    id: 'c2_mara_landing',
    lines: [
      { speaker: 'mara', text: 'Deep, bright, waiting. When I was a girl, the old people said the river wakes in the deep pools first, then runs out into the sun.' },
      { speaker: 'mara', text: 'As for waiting... I have been waiting since the kettle this morning. Hurry up.' },
    ],
  },
  {
    id: 'c2_mara_landing_after',
    lines: [{ speaker: 'mara', text: 'I saw it, Adrian. The water standing up like a man. I am too old to be this surprised.' }],
  },
  {
    id: 'c2_ahhock_landing',
    lines: [{ speaker: 'ahhock', text: 'I am not getting out of this boat. The leeches here know my name.' }],
  },
];
