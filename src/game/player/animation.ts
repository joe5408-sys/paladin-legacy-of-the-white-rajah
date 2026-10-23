import { IDLE_FPS, WALK_FPS } from '../core/constants';

/** Walk cycle uses the idle-a frame as the passing pose: step A, pass, step B, pass. */
const WALK_CYCLE = [2, 0, 3, 0] as const;
const IDLE_CYCLE = [0, 0, 0, 1] as const; // mostly still, occasional breath

/** Sprite-sheet column for the given animation state and elapsed seconds in that state. */
export function frameColumn(moving: boolean, stateTime: number): number {
  if (moving) return WALK_CYCLE[Math.floor(stateTime * WALK_FPS) % WALK_CYCLE.length];
  return IDLE_CYCLE[Math.floor(stateTime * IDLE_FPS) % IDLE_CYCLE.length];
}
