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
 * Large steps are split into sub-steps so fast frames cannot tunnel.
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
    const tryX = { x: pos.x + sx, z: pos.z };
    if (!blocked(tryX, radius, colliders, bounds)) pos = tryX;
    const tryZ = { x: pos.x, z: pos.z + sz };
    if (!blocked(tryZ, radius, colliders, bounds)) pos = tryZ;
  }
  return pos;
}
