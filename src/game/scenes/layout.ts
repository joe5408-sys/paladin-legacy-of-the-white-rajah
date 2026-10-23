import type { CharacterId } from '../../data/characters';
import type { Box } from '../core/collision';
import type { Condition, StoryFlags } from '../core/flags';
import type { Direction } from '../core/input';
import type { Interactable } from '../interaction/interaction';

export interface NpcPlacement {
  id: string;
  character: CharacterId;
  x: number;
  z: number;
  facing: Direction;
  /** Only present while this story condition holds. */
  when?: Condition;
}

/** Everything the exploration rig needs to run a scene. Pure data. */
export interface SceneLayout {
  /** Walkable rectangle. */
  bounds: Box;
  /** Obstacles; may depend on story state (e.g. an opened floor hatch). */
  colliders(flags: StoryFlags): Box[];
  interactables: Interactable[];
  npcs: NpcPlacement[];
}

export const NPC_COLLIDER_SIZE = 0.6;
