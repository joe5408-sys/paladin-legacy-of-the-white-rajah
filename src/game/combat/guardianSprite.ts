/**
 * The Covenant Guardian: a towering stone sentinel bound to the chamber.
 * Original placeholder pixel art drawn in code (32x40, single frame;
 * idle motion and hit reactions are done by moving the sprite).
 */
import * as THREE from 'three';
import { addOutline } from '../player/pixelSprite';

export const GUARDIAN_W = 32;
export const GUARDIAN_H = 40;

type Palette = Record<'outline' | 'stone' | 'stoneLight' | 'stoneDark' | 'crack' | 'moss' | 'gold' | 'goldDeep', string>;

const STONE: Palette = {
  outline: '#0e1014',
  stone: '#6f7b86',
  stoneLight: '#93a0ab',
  stoneDark: '#4c5660',
  crack: '#363d45',
  moss: '#4f6b48',
  gold: '#ffd27a',
  goldDeep: '#c9963a',
};

/** The Spirit of the Waystation (Chapter 2): the Guardian's shape in river-water and light. */
const RIVER: Palette = {
  outline: '#0a2a3a',
  stone: '#4fa8c8',
  stoneLight: '#a8e4f4',
  stoneDark: '#2f7898',
  crack: '#d8f6ff',
  moss: '#7fd8c0',
  gold: '#ffffff',
  goldDeep: '#bff0ff',
};

function rect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function draw(g: CanvasRenderingContext2D, C: Palette) {
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

const cache = new Map<Palette, THREE.CanvasTexture>();

function texture(palette: Palette): THREE.CanvasTexture {
  const hit = cache.get(palette);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = GUARDIAN_W;
  canvas.height = GUARDIAN_H;
  const g = canvas.getContext('2d', { willReadFrequently: true })!;
  draw(g, palette);
  addOutline(g, GUARDIAN_W, GUARDIAN_H, palette.outline);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.set(palette, tex);
  return tex;
}

/** Shared Guardian texture. Browser-only. */
export function getGuardianTexture(): THREE.CanvasTexture {
  return texture(STONE);
}

/** Shared Spirit of the Waystation texture. Browser-only. */
export function getSpiritTexture(): THREE.CanvasTexture {
  return texture(RIVER);
}
