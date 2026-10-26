/**
 * The Hollow Sentinel: a tall palace construct of brass and dark ironwood with a
 * crowned, faceless mask and an empty cage for a chest, where a cold flame burns.
 * Original placeholder pixel art drawn in code (32x44, single frame).
 */
import * as THREE from 'three';
import { addOutline } from '../player/pixelSprite';

export const SENTINEL_W = 32;
export const SENTINEL_H = 44;

const C = {
  outline: '#0d0b0a',
  brass: '#b8893a',
  brassLight: '#e0b860',
  brassDark: '#7a5524',
  wood: '#3b2a20',
  woodLight: '#5a4030',
  hollow: '#16110f',
  flame: '#9fd4ff',
  flameCore: '#f2fbff',
  livery: '#7b2430',
  liveryDark: '#5a1820',
};

function rect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function draw(g: CanvasRenderingContext2D) {
  // Legs: thin ironwood with brass knee plates and feet
  for (const lx of [11, 18]) {
    rect(g, lx, 31, 3, 12, C.wood);
    rect(g, lx, 31, 1, 12, C.woodLight);
    rect(g, lx - 1, 36, 5, 2, C.brass);
    rect(g, lx - 1, 42, 5, 2, C.brassDark);
  }

  // Waist belt and the palace livery tabard
  rect(g, 10, 28, 12, 3, C.brassDark);
  rect(g, 15, 28, 2, 3, C.brassLight); // buckle
  rect(g, 12, 31, 8, 6, C.livery);
  rect(g, 12, 31, 1, 6, C.liveryDark);
  rect(g, 19, 31, 1, 6, C.liveryDark);
  rect(g, 12, 36, 8, 1, C.brass); // gold hem

  // Chest: an open brass cage, hollow inside, with a cold flame
  rect(g, 9, 16, 14, 12, C.brass);
  rect(g, 10, 17, 12, 10, C.hollow);
  rect(g, 13, 20, 6, 6, C.flame);
  rect(g, 14, 19, 4, 1, C.flame);
  rect(g, 15, 21, 2, 4, C.flameCore);
  for (const bx of [11, 14, 17, 20]) rect(g, bx, 17, 1, 10, C.brassDark); // cage bars
  rect(g, 9, 16, 14, 1, C.brassLight);
  rect(g, 9, 21, 14, 1, C.brassDark); // rib band

  // Shoulders: broad brass plates
  rect(g, 4, 13, 9, 4, C.brass);
  rect(g, 19, 13, 9, 4, C.brass);
  rect(g, 4, 13, 9, 1, C.brassLight);
  rect(g, 19, 13, 9, 1, C.brassLight);
  rect(g, 4, 16, 9, 1, C.brassDark);
  rect(g, 19, 16, 9, 1, C.brassDark);

  // Long arms of ironwood bound with brass, ending in blade-like forearms
  for (const [ax, dir] of [[4, -1], [25, 1]] as const) {
    rect(g, ax, 17, 3, 13, C.wood);
    rect(g, ax, 17, 1, 13, C.woodLight);
    rect(g, ax - 1, 21, 5, 1, C.brass);
    rect(g, ax - 1, 26, 5, 1, C.brass);
    // Forearm blade, tapering to a point
    const bx = dir < 0 ? ax - 1 : ax;
    rect(g, bx, 30, 4, 4, C.brassLight);
    rect(g, bx + (dir < 0 ? 0 : 1), 34, 3, 3, C.brassLight);
    rect(g, bx + (dir < 0 ? 0 : 2), 37, 2, 3, C.brass);
    rect(g, bx + (dir < 0 ? 0 : 3), 40, 1, 2, C.brassDark);
  }

  // Neck
  rect(g, 14, 11, 4, 2, C.wood);

  // Head: a smooth brass mask with no face, only two hollow slits, and a crown
  rect(g, 12, 3, 8, 8, C.brass);
  rect(g, 12, 3, 2, 8, C.brassLight);
  rect(g, 18, 3, 2, 8, C.brassDark);
  rect(g, 13, 6, 2, 1, C.hollow);
  rect(g, 17, 6, 2, 1, C.hollow);
  rect(g, 11, 2, 10, 1, C.brassDark); // crown band
  rect(g, 12, 0, 1, 2, C.brassLight);
  rect(g, 15, 0, 2, 2, C.brassLight);
  rect(g, 19, 0, 1, 2, C.brassLight);
}

let cached: THREE.CanvasTexture | null = null;

/** Shared Sentinel texture. Browser-only. */
export function getSentinelTexture(): THREE.CanvasTexture {
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = SENTINEL_W;
  canvas.height = SENTINEL_H;
  const g = canvas.getContext('2d', { willReadFrequently: true })!;
  draw(g);
  addOutline(g, SENTINEL_W, SENTINEL_H, C.outline);
  cached = new THREE.CanvasTexture(canvas);
  cached.magFilter = THREE.NearestFilter;
  cached.minFilter = THREE.NearestFilter;
  cached.generateMipmaps = false;
  cached.colorSpace = THREE.SRGBColorSpace;
  return cached;
}
