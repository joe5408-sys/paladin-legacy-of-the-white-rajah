/**
 * The Paladin sign: a sword crossing a river inside a ring.
 * Original symbol for this game's fictional order (the sword protects,
 * the river is the people). Drawn in code as crisp pixel art.
 */
import * as THREE from 'three';

const SIZE = 48;

function drawInsignia(ctx: CanvasRenderingContext2D, color: string) {
  const c = SIZE / 2;
  ctx.fillStyle = color;
  // Ring: plot pixels whose distance from centre falls in a band.
  for (let y = 0; y < SIZE; y++) {
    for (let x = 0; x < SIZE; x++) {
      const d = Math.hypot(x + 0.5 - c, y + 0.5 - c);
      if (d >= 20 && d < 23) ctx.fillRect(x, y, 1, 1);
    }
  }
  // River: a wavy band across the middle.
  for (let x = 6; x < SIZE - 6; x++) {
    const y = Math.round(c + 2 + Math.sin((x / SIZE) * Math.PI * 4) * 2);
    ctx.fillRect(x, y, 1, 2);
  }
  // Sword: blade, crossguard, grip, pommel (points down, guarding the river).
  ctx.fillRect(c - 1, 15, 2, 22); // blade
  ctx.fillRect(c - 7, 13, 14, 2); // crossguard
  ctx.fillRect(c - 1, 8, 2, 5); // grip
  ctx.fillRect(c - 2, 6, 4, 2); // pommel
  // Four stars at the diagonals.
  for (const [dx, dy] of [[-13, -13], [11, -13], [-13, 11], [11, 11]]) {
    ctx.fillRect(c + dx, c + dy, 2, 2);
  }
}

const cache = new Map<string, THREE.CanvasTexture>();

/** Shared, cached texture of the sign in the given colour. Browser-only. */
export function getInsigniaTexture(color = '#ffe08a'): THREE.CanvasTexture {
  let tex = cache.get(color);
  if (!tex) {
    const canvas = document.createElement('canvas');
    canvas.width = SIZE;
    canvas.height = SIZE;
    drawInsignia(canvas.getContext('2d')!, color);
    tex = new THREE.CanvasTexture(canvas);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.colorSpace = THREE.SRGBColorSpace;
    cache.set(color, tex);
  }
  return tex;
}
