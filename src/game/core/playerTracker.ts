import type { Direction } from './input';

/**
 * The player's live position, written every frame by the Player component.
 * Kept outside React/Zustand so per-frame updates cost nothing; read only
 * when something needs a snapshot (e.g. saving the game).
 */
export const playerTracker: { x: number; z: number; facing: Direction } = {
  x: 0,
  z: 0,
  facing: 'south',
};
