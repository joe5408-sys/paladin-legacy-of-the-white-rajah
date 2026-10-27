/**
 * The Crowned Sentinel (Chapter 3): the palace's ceremonial guardian, built by
 * the Paladins in the 1890s. Ivory plate with gold trim, a crowned helm with a
 * T-shaped visor, a royal-blue tabard and a ceremonial halberd. On its chest the
 * royal seal is riveted over the old sword-and-river sign; with the seal gone,
 * the sign shows through and glows.
 * Original placeholder pixel art drawn in code (36x52, single frame each).
 */
import * as THREE from 'three';
import { addOutline } from '../player/pixelSprite';

export const CROWNED_W = 36;
export const CROWNED_H = 52;

const C = {
  outline: '#120e0a',
  ivory: '#e8e0cc',
  ivoryLight: '#fbf6e8',
  ivoryDark: '#b8ac90',
  gold: '#d8b04a',
  goldLight: '#f4d880',
  goldDark: '#9a7a2a',
  blue: '#2a3f7a',
  blueDark: '#1c2c58',
  hollow: '#1a1410',
  seal: '#c89a3a',
  sealDark: '#8a6420',
  sign: '#9fe0ff',
  signCore: '#e8faff',
  shaft: '#6a4a2a',
  blade: '#c8ccd4',
  bladeLight: '#eef0f4',
};

function rect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function draw(g: CanvasRenderingContext2D, sealed: boolean) {
  // Halberd, held upright in the right hand (behind the arm)
  rect(g, 32, 6, 2, 44, C.shaft);
  rect(g, 32, 6, 1, 44, C.goldDark);
  rect(g, 30, 2, 6, 6, C.blade); // axe blade
  rect(g, 30, 2, 2, 6, C.bladeLight);
  rect(g, 32, 0, 2, 3, C.bladeLight); // spike
  rect(g, 31, 8, 4, 1, C.gold); // collar

  // Legs: ivory greaves with gold knee caps
  for (const lx of [12, 20]) {
    rect(g, lx, 38, 4, 11, C.ivory);
    rect(g, lx, 38, 1, 11, C.ivoryLight);
    rect(g, lx + 3, 38, 1, 11, C.ivoryDark);
    rect(g, lx - 1, 41, 6, 2, C.gold);
    rect(g, lx - 1, 49, 6, 3, C.ivoryDark);
  }

  // Long royal-blue tabard with a gold hem
  rect(g, 12, 30, 12, 13, C.blue);
  rect(g, 12, 30, 1, 13, C.blueDark);
  rect(g, 23, 30, 1, 13, C.blueDark);
  rect(g, 12, 42, 12, 1, C.gold);
  rect(g, 17, 32, 2, 8, C.goldDark); // a stitched stripe

  // Breastplate
  rect(g, 10, 15, 16, 15, C.ivory);
  rect(g, 10, 15, 16, 1, C.ivoryLight);
  rect(g, 10, 15, 2, 15, C.ivoryLight);
  rect(g, 24, 15, 2, 15, C.ivoryDark);
  rect(g, 10, 29, 16, 1, C.gold); // waist trim
  if (sealed) {
    // The royal seal, a gold disc riveted over the old sign
    rect(g, 14, 18, 8, 8, C.seal);
    rect(g, 15, 17, 6, 1, C.seal);
    rect(g, 15, 26, 6, 1, C.sealDark);
    rect(g, 15, 19, 6, 1, C.goldLight); // crown mark on the seal
    rect(g, 15, 18, 1, 1, C.goldLight);
    rect(g, 17, 18, 2, 1, C.goldLight);
    rect(g, 20, 18, 1, 1, C.goldLight);
    rect(g, 16, 22, 4, 2, C.sealDark);
    for (const [rx, ry] of [[14, 18], [21, 18], [14, 25], [21, 25]]) rect(g, rx, ry, 1, 1, C.ivoryLight);
  } else {
    // The Paladin sign shows through: a sword over a river, glowing
    rect(g, 14, 18, 8, 9, C.hollow);
    rect(g, 17, 18, 2, 8, C.sign); // blade
    rect(g, 15, 20, 6, 1, C.sign); // crossguard
    rect(g, 17, 19, 2, 3, C.signCore);
    rect(g, 14, 25, 2, 1, C.sign); // the river beneath
    rect(g, 16, 24, 2, 1, C.sign);
    rect(g, 18, 25, 2, 1, C.sign);
    rect(g, 20, 24, 2, 1, C.sign);
  }

  // Great pauldrons, ivory with gold edges
  for (const sx of [3, 25]) {
    rect(g, sx, 12, 9, 6, C.ivory);
    rect(g, sx, 12, 9, 1, C.ivoryLight);
    rect(g, sx, 17, 9, 1, C.gold);
    rect(g, sx + 1, 14, 7, 1, C.ivoryDark);
  }

  // Arms with gold gauntlets; the right hand grips the halberd
  for (const ax of [5, 27]) {
    rect(g, ax, 18, 4, 12, C.ivory);
    rect(g, ax, 18, 1, 12, C.ivoryLight);
    rect(g, ax - 1, 23, 6, 1, C.gold);
    rect(g, ax - 1, 30, 6, 4, C.gold);
    rect(g, ax - 1, 30, 6, 1, C.goldLight);
  }
  rect(g, 31, 30, 4, 3, C.gold); // hand around the shaft

  // Helm with a T-shaped visor, under a gold crown with a blue gem
  rect(g, 18 - 4, 4, 8, 10, C.ivory);
  rect(g, 14, 4, 2, 10, C.ivoryLight);
  rect(g, 20, 4, 2, 10, C.ivoryDark);
  rect(g, 15, 7, 6, 1, C.hollow); // visor slit
  rect(g, 17, 7, 2, 5, C.hollow); // and its upright
  rect(g, 13, 3, 10, 2, C.gold); // crown band
  rect(g, 13, 0, 2, 3, C.gold);
  rect(g, 17, 0, 2, 3, C.goldLight);
  rect(g, 21, 0, 2, 3, C.gold);
  rect(g, 17, 3, 2, 1, C.blue); // gem
  rect(g, 16, 14, 4, 1, C.goldDark); // gorget
}

const cache = new Map<boolean, THREE.CanvasTexture>();

/** Shared Crowned Sentinel texture: with the royal seal on its chest, or the Paladin sign. Browser-only. */
export function getCrownedSentinelTexture(sealed = true): THREE.CanvasTexture {
  const hit = cache.get(sealed);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = CROWNED_W;
  canvas.height = CROWNED_H;
  const g = canvas.getContext('2d', { willReadFrequently: true })!;
  draw(g, sealed);
  addOutline(g, CROWNED_W, CROWNED_H, C.outline);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.set(sealed, tex);
  return tex;
}
