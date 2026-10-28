import type { Direction } from './input';

/**
 * The player's live position, written every frame by the Player component.
 * Kept outside React/Zustand so per-frame updates cost nothing; read only
 * when something needs a snapshot (e.g. saving the game).
 */
export const playerTracker: { x: number; z: number; facing: Direction; moving: boolean } = {
  x: 0,
  z: 0,
  facing: 'south',
  moving: false,
};

// Debug hook (all builds): browser tests read the live position as window.__PALADIN__,
// so they can walk a set distance instead of guessing it from time.
if (typeof window !== 'undefined') (window as unknown as Record<string, unknown>).__PALADIN__ = playerTracker;
