/**
 * The Iron Warden (Chapter 2 boss): Harrow's largest construct, a squat giant of
 * riveted iron with a furnace for a heart and the palace livery at its waist.
 * Two looks: armoured (phase 1, plates bolted over the chest and shoulders) and
 * exposed (phase 2, the plates gone and the furnace blazing).
 * Original placeholder pixel art drawn in code (40x52, single frame each).
 */
import * as THREE from 'three';
import { addOutline } from '../player/pixelSprite';

export const IRON_W = 40;
export const IRON_H = 52;

const C = {
  outline: '#0b0a0a',
  iron: '#5a5e66',
  ironLight: '#8a909a',
  ironDark: '#33363c',
  rivet: '#c0c4cc',
  plate: '#474b52',
  plateLight: '#6e737c',
  rust: '#8a4a2a',
  hollow: '#140e0c',
  fire: '#ff8a2a',
  fireCore: '#ffe08a',
  ember: '#c8441a',
  livery: '#7b2430',
  liveryDark: '#5a1820',
  gold: '#d0a040',
};

function rect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

function draw(g: CanvasRenderingContext2D, armored: boolean) {
  // Legs: thick iron pillars with wide feet
  for (const lx of [12, 23]) {
    rect(g, lx, 38, 6, 11, C.iron);
    rect(g, lx, 38, 2, 11, C.ironLight);
    rect(g, lx + 5, 38, 1, 11, C.ironDark);
    rect(g, lx - 1, 43, 8, 2, C.ironDark); // knee band
    rect(g, lx - 2, 49, 10, 3, C.ironDark);
    rect(g, lx - 2, 49, 10, 1, C.iron);
  }

  // Hips: a heavy belt and the palace livery tabard with a gold hem
  rect(g, 10, 34, 20, 4, C.ironDark);
  rect(g, 18, 34, 4, 4, C.gold); // buckle
  rect(g, 14, 38, 12, 7, C.livery);
  rect(g, 14, 38, 1, 7, C.liveryDark);
  rect(g, 25, 38, 1, 7, C.liveryDark);
  rect(g, 14, 44, 12, 1, C.gold);

  // Torso: a barrel of iron around the furnace
  rect(g, 9, 16, 22, 18, C.iron);
  rect(g, 9, 16, 22, 1, C.ironLight);
  rect(g, 9, 16, 2, 18, C.ironLight);
  rect(g, 29, 16, 2, 18, C.ironDark);
  if (armored) {
    // Bolted plates over the furnace; only a thin slit of fire shows
    rect(g, 11, 18, 18, 14, C.plate);
    rect(g, 11, 18, 18, 1, C.plateLight);
    rect(g, 11, 25, 18, 1, C.ironDark); // seam between the plates
    rect(g, 14, 22, 12, 1, C.ember); // the slit
    rect(g, 17, 22, 6, 1, C.fire);
    for (const [rx, ry] of [[12, 19], [27, 19], [12, 30], [27, 30], [12, 26], [27, 26], [19, 19], [19, 30]]) {
      rect(g, rx, ry, 1, 1, C.rivet);
    }
    rect(g, 22, 28, 3, 2, C.rust); // a streak of river rust
  } else {
    // The furnace, open and blazing, behind a few broken plate edges
    rect(g, 11, 18, 18, 14, C.hollow);
    rect(g, 13, 21, 14, 10, C.ember);
    rect(g, 15, 22, 10, 8, C.fire);
    rect(g, 17, 23, 6, 6, C.fireCore);
    rect(g, 14, 20, 2, 1, C.fire);
    rect(g, 24, 19, 2, 2, C.fire); // flicker
    for (const bx of [14, 19, 24]) rect(g, bx, 18, 1, 14, C.ironDark); // furnace grate
    rect(g, 11, 18, 3, 2, C.plate); // what is left of the plates
    rect(g, 27, 30, 2, 2, C.plate);
  }

  // Shoulders: great round pauldrons (thicker and riveted while armoured)
  for (const sx of [2, 28]) {
    rect(g, sx, 12, 10, 7, C.iron);
    rect(g, sx, 12, 10, 1, C.ironLight);
    rect(g, sx, 18, 10, 1, C.ironDark);
    if (armored) {
      rect(g, sx + 1, 10, 8, 3, C.plate);
      rect(g, sx + 1, 10, 8, 1, C.plateLight);
      rect(g, sx + 2, 15, 1, 1, C.rivet);
      rect(g, sx + 7, 15, 1, 1, C.rivet);
    }
  }

  // Arms: short and massive, ending in huge fists
  for (const ax of [3, 32]) {
    rect(g, ax, 19, 5, 15, C.iron);
    rect(g, ax, 19, 1, 15, C.ironLight);
    rect(g, ax - 1, 24, 7, 2, C.ironDark); // elbow band
    rect(g, ax - 1, 34, 7, 7, C.ironDark); // fist
    rect(g, ax - 1, 34, 7, 1, C.iron);
    rect(g, ax, 36, 5, 1, C.ironLight); // knuckles
    rect(g, ax, 38, 5, 1, C.ironLight);
  }

  // Head: small, sunk between the shoulders, with a glowing visor and a crown band
  rect(g, 15, 5, 10, 9, C.iron);
  rect(g, 15, 5, 2, 9, C.ironLight);
  rect(g, 23, 5, 2, 9, C.ironDark);
  rect(g, 16, 9, 8, 2, C.hollow);
  rect(g, 17, 9, 6, 1, armored ? C.ember : C.fire);
  rect(g, 14, 4, 12, 1, C.gold); // crown band
  rect(g, 15, 2, 1, 2, C.gold);
  rect(g, 19, 1, 2, 3, C.gold);
  rect(g, 24, 2, 1, 2, C.gold);
  rect(g, 18, 14, 4, 2, C.ironDark); // neck
}

const cache = new Map<boolean, THREE.CanvasTexture>();

/** Shared Iron Warden texture, armoured or exposed. Browser-only. */
export function getIronWardenTexture(armored: boolean): THREE.CanvasTexture {
  const hit = cache.get(armored);
  if (hit) return hit;
  const canvas = document.createElement('canvas');
  canvas.width = IRON_W;
  canvas.height = IRON_H;
  const g = canvas.getContext('2d', { willReadFrequently: true })!;
  draw(g, armored);
  addOutline(g, IRON_W, IRON_H, C.outline);
  const tex = new THREE.CanvasTexture(canvas);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  cache.set(armored, tex);
  return tex;
}
