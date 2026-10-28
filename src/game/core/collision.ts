/**
 * Simple 2D collision on the ground plane (X/Z).
 * The player is a circle; obstacles are axis-aligned boxes.
 * No physics engine: we resolve each axis separately so the player
 * slides along walls instead of sticking to them.
 */

export interface Vec2 {
  x: number;
  z: number;
}

/** Axis-aligned box on the ground plane, given by its min/max corners. */
export interface Box {
  minX: number;
  maxX: number;
  minZ: number;
  maxZ: number;
}

export function boxFromCenter(cx: number, cz: number, width: number, depth: number): Box {
  return {
    minX: cx - width / 2,
    maxX: cx + width / 2,
    minZ: cz - depth / 2,
    maxZ: cz + depth / 2,
  };
}

/** True if a circle at `p` with `radius` overlaps the box. */
export function circleOverlapsBox(p: Vec2, radius: number, box: Box): boolean {
  const nearestX = Math.max(box.minX, Math.min(p.x, box.maxX));
  const nearestZ = Math.max(box.minZ, Math.min(p.z, box.maxZ));
  const dx = p.x - nearestX;
  const dz = p.z - nearestZ;
  return dx * dx + dz * dz < radius * radius;
}

function blocked(p: Vec2, radius: number, colliders: readonly Box[], bounds: Box): boolean {
  if (
    p.x - radius < bounds.minX ||
    p.x + radius > bounds.maxX ||
    p.z - radius < bounds.minZ ||
    p.z + radius > bounds.maxZ
  ) {
    return true;
  }
  return colliders.some((box) => circleOverlapsBox(p, radius, box));
}

/**
 * Move from `from` by `delta`, stopping at colliders and world bounds.
 * X and Z are resolved independently so movement slides along walls.
 * Large steps are split into sub-steps so fast frames cannot tunnel. A blocked
 * sub-step still moves as far as it can, so the player stops flush against an
 * obstacle whatever the frame rate (not up to a whole frame's movement short of it).
 */
export function moveWithCollision(
  from: Vec2,
  delta: Vec2,
  radius: number,
  colliders: readonly Box[],
  bounds: Box,
): Vec2 {
  const maxStep = radius * 0.5;
  const steps = Math.max(1, Math.ceil(Math.max(Math.abs(delta.x), Math.abs(delta.z)) / maxStep));
  let pos = { ...from };
  const sx = delta.x / steps;
  const sz = delta.z / steps;

  for (let i = 0; i < steps; i++) {
    pos = advance(pos, sx, 0, radius, colliders, bounds);
    pos = advance(pos, 0, sz, radius, colliders, bounds);
  }
  return pos;
}

/** Moves by (dx, dz) if that is free; otherwise as far along it as is free (to within 1/64 of it). */
function advance(pos: Vec2, dx: number, dz: number, radius: number, colliders: readonly Box[], bounds: Box): Vec2 {
  if (dx === 0 && dz === 0) return pos;
  const at = (t: number) => ({ x: pos.x + dx * t, z: pos.z + dz * t });
  if (!blocked(at(1), radius, colliders, bounds)) return at(1);
  let free = 0;
  let hit = 1;
  for (let i = 0; i < 6; i++) {
    const mid = (free + hit) / 2;
    if (blocked(at(mid), radius, colliders, bounds)) hit = mid;
    else free = mid;
  }
  return free > 0 ? at(free) : pos;
}
