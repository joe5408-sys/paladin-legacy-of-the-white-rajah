/**
 * Adrian's battle poses, holding the blade of light the heirloom forms in his hand.
 * Original pixel art drawn in code. Each frame is 40x32: the normal 16x24
 * character sits centred at the bottom, with room around it for the blade.
 *
 *   Columns: 0 ready, 1 ready (breath), 2 wind-up (blade raised behind), 3 strike (blade thrust forward)
 *   All frames face east (towards the Guardian).
 */
import * as THREE from 'three';
import type { CharacterDef } from '../../data/characters';
import {
  addOutline,
  bodyTop,
  drawCharacterFrame,
  type ArmPose,
} from '../player/pixelSprite';

export const BATTLE_FRAME_W = 40;
export const BATTLE_FRAME_H = 32;
/** Where the 16x24 character frame sits inside the 40x32 battle frame. */
const OX = 12;
const OY = 8;

export type BattlePose = 'ready' | 'ready2' | 'windup' | 'strike';
export const POSE_COLUMN: Record<BattlePose, number> = { ready: 0, ready2: 1, windup: 2, strike: 3 };
export const POSE_COUNT = 4;

const BLADE = {
  core: '#ffffff',
  edge: '#ffd27a',
  guard: '#c9963a',
};

type Ctx = CanvasRenderingContext2D;

function px(g: Ctx, x: number, y: number, color: string, w = 1, h = 1) {
  g.fillStyle = color;
  g.fillRect(x, y, w, h);
}

/** Blade rising diagonally up and to the right from (sx, sy). */
function bladeUpRight(g: Ctx, sx: number, sy: number, len: number) {
  px(g, sx - 1, sy - 1, BLADE.guard);
  px(g, sx + 1, sy + 1, BLADE.guard);
  for (let k = 1; k <= len; k++) {
    px(g, sx + k, sy - k, BLADE.core);
    if (k < len) px(g, sx + k + 1, sy - k, BLADE.edge);
  }
}

/** Blade rising diagonally up and to the left from (sx, sy). */
function bladeUpLeft(g: Ctx, sx: number, sy: number, len: number) {
  px(g, sx + 1, sy - 1, BLADE.guard);
  px(g, sx - 1, sy + 1, BLADE.guard);
  for (let k = 1; k <= len; k++) {
    px(g, sx - k, sy - k, BLADE.core);
    if (k < len) px(g, sx - k - 1, sy - k, BLADE.edge);
  }
}

/** Blade pointing straight forward (east) from (sx, sy). */
function bladeForward(g: Ctx, sx: number, sy: number, len: number) {
  px(g, sx, sy - 1, BLADE.guard, 1, 4);
  px(g, sx + 1, sy, BLADE.core, len, 1);
  px(g, sx + 1, sy + 1, BLADE.edge, len - 1, 1);
}

const POSES: Array<{ pose: BattlePose; legs: number; arm: ArmPose }> = [
  { pose: 'ready', legs: 0, arm: 'forward' },
  { pose: 'ready2', legs: 1, arm: 'forward' },
  { pose: 'windup', legs: 0, arm: 'raised' },
  { pose: 'strike', legs: 2, arm: 'extended' }, // stride into the blow
];

/** Builds the battle pose sheet. Browser-only. */
export function createHeroBattleSheet(character: CharacterDef): HTMLCanvasElement {
  if (!character.palette) throw new Error(`Character "${character.id}" has no sprite palette`);
  const sheet = document.createElement('canvas');
  sheet.width = BATTLE_FRAME_W * POSE_COUNT;
  sheet.height = BATTLE_FRAME_H;
  const out = sheet.getContext('2d')!;
  out.imageSmoothingEnabled = false;

  const frame = document.createElement('canvas');
  frame.width = 16;
  frame.height = 24;
  const fctx = frame.getContext('2d', { willReadFrequently: true })!;

  POSES.forEach(({ legs, arm }, i) => {
    fctx.clearRect(0, 0, 16, 24);
    drawCharacterFrame(fctx, character.palette!, character.features ?? {}, 'east', legs, arm);
    addOutline(fctx, 16, 24, character.palette!.outline);
    const bx = i * BATTLE_FRAME_W + OX; // frame origin inside the sheet
    out.drawImage(frame, bx, OY);

    // The blade is drawn after the outline so it stays bright and clean.
    const by = OY + bodyTop(legs);
    if (arm === 'forward') bladeUpRight(out, bx + 13, by + 2, 8);
    else if (arm === 'raised') bladeUpLeft(out, bx + 2, by - 7, 7);
    else if (arm === 'extended') bladeForward(out, bx + 15, by + 1, 12);
  });

  return sheet;
}

/** Texture of the battle sheet with nearest-neighbour sampling. */
export function createHeroBattleTexture(character: CharacterDef): THREE.CanvasTexture {
  const tex = new THREE.CanvasTexture(createHeroBattleSheet(character));
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.repeat.set(1 / POSE_COUNT, 1);
  return tex;
}

export function setBattlePose(texture: THREE.Texture, pose: BattlePose) {
  texture.offset.set(POSE_COLUMN[pose] / POSE_COUNT, 0);
}
