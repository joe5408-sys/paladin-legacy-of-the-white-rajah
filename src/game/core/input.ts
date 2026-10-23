/**
 * Four-direction keyboard input.
 * The most recently pressed direction wins, which feels natural when the
 * player rolls from one key to another without lifting the first.
 */

export type Direction = 'north' | 'south' | 'east' | 'west';

const KEY_TO_DIRECTION: Record<string, Direction> = {
  KeyW: 'north',
  ArrowUp: 'north',
  KeyS: 'south',
  ArrowDown: 'south',
  KeyA: 'west',
  ArrowLeft: 'west',
  KeyD: 'east',
  ArrowRight: 'east',
};

export function directionForKey(code: string): Direction | undefined {
  return KEY_TO_DIRECTION[code];
}

/** Ground-plane unit vector for each direction. North is away from the camera (-Z). */
export const DIRECTION_VECTORS: Record<Direction, { x: number; z: number }> = {
  north: { x: 0, z: -1 },
  south: { x: 0, z: 1 },
  east: { x: 1, z: 0 },
  west: { x: -1, z: 0 },
};

/** Tracks held movement keys in press order. */
export class DirectionalInput {
  private held: string[] = [];

  press(code: string): boolean {
    if (!directionForKey(code)) return false;
    if (!this.held.includes(code)) this.held.push(code);
    return true;
  }

  release(code: string): boolean {
    const i = this.held.indexOf(code);
    if (i === -1) return false;
    this.held.splice(i, 1);
    return true;
  }

  clear(): void {
    this.held = [];
  }

  /** The active direction, or null when no movement key is held. */
  current(): Direction | null {
    const last = this.held[this.held.length - 1];
    return last ? (directionForKey(last) ?? null) : null;
  }
}
