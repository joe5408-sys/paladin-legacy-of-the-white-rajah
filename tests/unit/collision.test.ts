import { describe, expect, it } from 'vitest';
import {
  boxFromCenter,
  circleOverlapsBox,
  moveWithCollision,
  type Box,
} from '../../src/game/core/collision';
import {
  BUILDINGS,
  buildVillageColliders,
  PLAYER_START,
  VILLAGE_BOUNDS,
} from '../../src/data/villageSquare';
import { PLAYER_RADIUS } from '../../src/game/core/constants';

const bounds: Box = { minX: -10, maxX: 10, minZ: -10, maxZ: 10 };
const wall = boxFromCenter(2, 0, 1, 4); // x 1.5..2.5, z -2..2
const r = 0.3;

describe('circleOverlapsBox', () => {
  it('detects overlap and separation', () => {
    expect(circleOverlapsBox({ x: 1.3, z: 0 }, r, wall)).toBe(true);
    expect(circleOverlapsBox({ x: 1.1, z: 0 }, r, wall)).toBe(false);
  });
});

describe('moveWithCollision', () => {
  it('moves freely in open space', () => {
    const p = moveWithCollision({ x: 0, z: 0 }, { x: 0, z: -1 }, r, [wall], bounds);
    expect(p.x).toBe(0);
    expect(p.z).toBeCloseTo(-1, 9);
  });

  it('stops before a wall instead of passing through', () => {
    const p = moveWithCollision({ x: 0, z: 0 }, { x: 5, z: 0 }, r, [wall], bounds);
    expect(p.x).toBeLessThanOrEqual(wall.minX - r + 1e-9);
    expect(p.x).toBeGreaterThan(wall.minX - r - 0.2);
  });

  it('does not tunnel through a thin wall on a very large step', () => {
    const thin = boxFromCenter(2, 0, 0.1, 4);
    const p = moveWithCollision({ x: 0, z: 0 }, { x: 8, z: 0 }, r, [thin], bounds);
    expect(p.x).toBeLessThan(2);
  });

  it('slides along a wall when moving diagonally into it', () => {
    const start = { x: 1.15, z: 0 };
    const p = moveWithCollision(start, { x: 0.5, z: 0.5 }, r, [wall], bounds);
    expect(p.x).toBeLessThanOrEqual(wall.minX - r + 1e-9); // blocked on X, up against the wall
    expect(p.x).toBeGreaterThan(wall.minX - r - 0.01);
    expect(p.z).toBeCloseTo(0.5, 5); // free on Z
  });

  it('stops flush against a wall whatever the frame rate', () => {
    const walkTo = (dt: number) => {
      let p = { x: 0, z: 0 };
      for (let t = 0; t < 1; t += dt) p = moveWithCollision(p, { x: 3.2 * dt, z: 0 }, r, [wall], bounds);
      return p.x;
    };
    const contact = wall.minX - r;
    for (const dt of [1 / 144, 1 / 60, 1 / 15, 0.1]) {
      expect(walkTo(dt), String(dt)).toBeLessThanOrEqual(contact + 1e-9);
      expect(walkTo(dt), String(dt)).toBeGreaterThan(contact - 0.01);
    }
  });

  it('keeps the player inside the world bounds', () => {
    const p = moveWithCollision({ x: 9, z: 0 }, { x: 5, z: 0 }, r, [], bounds);
    expect(p.x).toBeLessThanOrEqual(bounds.maxX - r);
  });
});

describe('village layout', () => {
  const colliders = buildVillageColliders();

  it('spawns the player in a clear, in-bounds spot', () => {
    expect(colliders.some((b) => circleOverlapsBox(PLAYER_START, PLAYER_RADIUS, b))).toBe(false);
    expect(PLAYER_START.x).toBeGreaterThan(VILLAGE_BOUNDS.minX + PLAYER_RADIUS);
    expect(PLAYER_START.z).toBeLessThan(VILLAGE_BOUNDS.maxZ - PLAYER_RADIUS);
  });

  it('blocks walking into the family home', () => {
    const home = BUILDINGS.find((b) => b.id === 'family-home')!;
    let pos = { x: home.x, z: home.z + 5 };
    for (let i = 0; i < 200; i++) {
      pos = moveWithCollision(pos, { x: 0, z: -0.05 }, PLAYER_RADIUS, colliders, VILLAGE_BOUNDS);
    }
    expect(pos.z).toBeGreaterThan(home.z + home.depth / 2);
  });

  it('stops the player at the riverside boardwalk', () => {
    let pos = { x: 0, z: 4 };
    for (let i = 0; i < 400; i++) {
      pos = moveWithCollision(pos, { x: 0, z: -0.05 }, PLAYER_RADIUS, colliders, VILLAGE_BOUNDS);
    }
    expect(pos.z).toBeGreaterThanOrEqual(VILLAGE_BOUNDS.minZ + PLAYER_RADIUS - 1e-9);
  });
});
