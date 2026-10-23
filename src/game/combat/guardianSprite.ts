/**
 * The Covenant Guardian: a towering stone sentinel bound to the chamber.
 * Original placeholder pixel art drawn in code (32x40, single frame;
 * idle motion and hit reactions are done by moving the sprite).
 */
import * as THREE from 'three';
import { addOutline } from '../player/pixelSprite';

export const GUARDIAN_W = 32;
export const GUARDIAN_H = 40;

const C = {
  outline: '#0e1014',
  stone: '#6f7b86',
  stoneLight: '#93a0ab',
  stoneDark: '#4c5660',
  crack: '#363d45',
  moss: '#4f6b48',
  gold: '#ffd27a',
  goldDeep: '#c9963a',
};

function rect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function draw(g: CanvasRenderingContext2D) {
  // Legs: thick pillars
  rect(g, 8, 30, 6, 10, C.stoneDark);
  rect(g, 18, 30, 6, 10, C.stoneDark);
  rect(g, 8, 30, 2, 10, C.stone);
  rect(g, 18, 30, 2, 10, C.stone);
  rect(g, 7, 38, 8, 2, C.crack);
  rect(g, 17, 38, 8, 2, C.crack);

  // Torso
  rect(g, 6, 13, 20, 18, C.stone);
  rect(g, 6, 13, 3, 18, C.stoneLight);
  rect(g, 23, 13, 3, 18, C.stoneDark);
  rect(g, 6, 28, 20, 3, C.stoneDark); // belt stone
  // Chest emblem: the sword over the river
  rect(g, 15, 15, 2, 9, C.gold); // blade
  rect(g, 12, 17, 8, 1, C.gold); // crossguard
  rect(g, 15, 14, 2, 1, C.goldDeep); // pommel
  for (let x = 10; x < 22; x++) rect(g, x, 23 + (Math.floor(x / 2) % 2), 1, 1, C.gold); // river
  // Cracks and moss
  rect(g, 9, 20, 1, 4, C.crack);
  rect(g, 10, 24, 1, 2, C.crack);
  rect(g, 21, 15, 1, 3, C.crack);
  rect(g, 7, 26, 3, 1, C.moss);
  rect(g, 22, 27, 2, 1, C.moss);

  // Shoulders (pauldrons)
  rect(g, 1, 11, 8, 6, C.stoneLight);
  rect(g, 23, 11, 8, 6, C.stoneLight);
  rect(g, 1, 15, 8, 2, C.stone);
  rect(g, 23, 15, 8, 2, C.stone);
  rect(g, 3, 12, 2, 1, C.gold);
  rect(g, 27, 12, 2, 1, C.gold);

  // Arms and big fists
  rect(g, 2, 17, 5, 11, C.stone);
  rect(g, 25, 17, 5, 11, C.stone);
  rect(g, 2, 17, 1, 11, C.stoneLight);
  rect(g, 29, 17, 1, 11, C.stoneDark);
  rect(g, 1, 27, 7, 5, C.stoneDark);
  rect(g, 24, 27, 7, 5, C.stoneDark);
  rect(g, 2, 28, 5, 1, C.stone);
  rect(g, 25, 28, 5, 1, C.stone);

  // Head: helm with a crest and a glowing eye slit
  rect(g, 11, 3, 10, 10, C.stone);
  rect(g, 11, 3, 2, 10, C.stoneLight);
  rect(g, 19, 3, 2, 10, C.stoneDark);
  rect(g, 15, 0, 2, 3, C.goldDeep); // crest
  rect(g, 12, 7, 8, 2, C.crack);
  rect(g, 13, 7, 2, 2, C.gold); // eyes
  rect(g, 17, 7, 2, 2, C.gold);
  rect(g, 14, 11, 4, 1, C.stoneDark);
}

let cached: THREE.CanvasTexture | null = null;

/** Shared Guardian texture. Browser-only. */
export function getGuardianTexture(): THREE.CanvasTexture {
  if (cached) return cached;
  const canvas = document.createElement('canvas');
  canvas.width = GUARDIAN_W;
  canvas.height = GUARDIAN_H;
  const g = canvas.getContext('2d', { willReadFrequently: true })!;
  draw(g);
  addOutline(g, GUARDIAN_W, GUARDIAN_H, C.outline);
  cached = new THREE.CanvasTexture(canvas);
  cached.magFilter = THREE.NearestFilter;
  cached.minFilter = THREE.NearestFilter;
  cached.generateMipmaps = false;
  cached.colorSpace = THREE.SRGBColorSpace;
  return cached;
}
