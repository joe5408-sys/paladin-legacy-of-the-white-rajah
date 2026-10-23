/**
 * Procedural placeholder pixel-art for characters.
 * Original art drawn in code: 16x24 frames, 4 columns x 4 rows.
 *   Columns: 0 idle-a, 1 idle-b, 2 walk-a, 3 walk-b
 *   Rows:    0 south, 1 north, 2 east, 3 west (west = mirrored east)
 * A 1px dark outline is added automatically around every shape.
 * Characters differ by palette and a few optional features.
 */
import type { Direction } from '../core/input';
import { SPRITE_FRAME_H as FH, SPRITE_FRAME_W as FW } from '../core/constants';

export const SHEET_COLS = 4;
export const SHEET_ROWS = 4;
export const DIRECTION_ROW: Record<Direction, number> = { south: 0, north: 1, east: 2, west: 3 };

export interface CharacterPalette {
  outline: string;
  hair: string;
  hairHi: string;
  skin: string;
  skinShade: string;
  eye: string;
  /** Top garment (jacket, shirt, blouse). */
  jacket: string;
  jacketShade: string;
  /** Accent stripe down the front. */
  trim: string;
  belt: string;
  pants: string;
  boots: string;
}

export interface CharacterFeatures {
  glasses?: boolean;
  /** Hair tied up in a bun. */
  hairBun?: boolean;
  /** Long skirt instead of trousers (legs hidden). */
  longSkirt?: boolean;
}

type Ctx = CanvasRenderingContext2D;
type Facing = 'south' | 'north' | 'east';

function rect(ctx: Ctx, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.fillRect(x, y, w, h);
}

/** Draws one 16x24 frame at the canvas origin. */
function drawFrame(
  ctx: Ctx,
  C: CharacterPalette,
  f: CharacterFeatures,
  facing: Facing,
  col: number,
) {
  const bob = col === 0 ? 0 : 1; // body dips on breath and on each step
  const hy = 2 + bob; // head top
  const by = 10 + bob; // body top
  const legTop = 18;

  // Legs and boots
  if (f.longSkirt) {
    rect(ctx, 4, legTop, 8, 5, C.pants);
    rect(ctx, 4, legTop + 2, 8, 1, C.trim); // woven band
    rect(ctx, 5, 23, 2, 1, C.boots);
    rect(ctx, 9, 23, 2, 1, C.boots);
  } else if (facing === 'east') {
    if (col === 2) {
      rect(ctx, 9, legTop, 2, 4, C.pants); rect(ctx, 9, 22, 3, 2, C.boots);
      rect(ctx, 5, legTop, 2, 4, C.pants); rect(ctx, 4, 22, 3, 2, C.boots);
    } else if (col === 3) {
      rect(ctx, 8, legTop, 2, 4, C.pants); rect(ctx, 8, 22, 3, 2, C.boots);
      rect(ctx, 6, legTop, 2, 4, C.pants); rect(ctx, 5, 22, 3, 2, C.boots);
    } else {
      rect(ctx, 6, legTop, 4, 4, C.pants); rect(ctx, 6, 22, 5, 2, C.boots);
    }
  } else {
    const lUp = col === 2 ? 1 : 0;
    const rUp = col === 3 ? 1 : 0;
    rect(ctx, 5, legTop, 3, 4 - lUp, C.pants); rect(ctx, 5, 22 - lUp, 3, 2, C.boots);
    rect(ctx, 8, legTop, 3, 4 - rUp, C.pants); rect(ctx, 8, 22 - rUp, 3, 2, C.boots);
  }

  // Body
  rect(ctx, 4, by, 8, 8 - bob, C.jacket);
  rect(ctx, 4, by + 6 - bob, 8, 1, C.belt);
  if (facing === 'south') {
    rect(ctx, 7, by, 2, 5, C.trim);
    rect(ctx, 4, by, 1, 6 - bob, C.jacketShade);
    const swing = col === 2 ? 1 : col === 3 ? -1 : 0;
    rect(ctx, 3, by + 1, 1, 5 + swing, C.jacketShade); rect(ctx, 3, by + 6 + swing, 1, 1, C.skin);
    rect(ctx, 12, by + 1, 1, 5 - swing, C.jacketShade); rect(ctx, 12, by + 6 - swing, 1, 1, C.skin);
  } else if (facing === 'north') {
    rect(ctx, 7, by + 1, 2, 4, C.jacketShade);
    const swing = col === 2 ? 1 : col === 3 ? -1 : 0;
    rect(ctx, 3, by + 1, 1, 5 - swing, C.jacketShade); rect(ctx, 3, by + 6 - swing, 1, 1, C.skin);
    rect(ctx, 12, by + 1, 1, 5 + swing, C.jacketShade); rect(ctx, 12, by + 6 + swing, 1, 1, C.skin);
  } else {
    rect(ctx, 10, by, 2, 5, C.trim);
    const armX = col === 2 ? 8 : col === 3 ? 6 : 7;
    rect(ctx, armX, by + 1, 2, 5, C.jacketShade); rect(ctx, armX, by + 6, 2, 1, C.skin);
  }

  // Head
  if (f.hairBun) {
    if (facing === 'east') rect(ctx, 3, hy + 1, 3, 3, C.hair);
    else rect(ctx, 6, hy - 2, 4, 3, C.hair);
  }
  rect(ctx, 5, hy, 6, 8, C.skin);
  if (facing === 'south') {
    rect(ctx, 5, hy, 6, 3, C.hair); rect(ctx, 6, hy, 3, 1, C.hairHi);
    rect(ctx, 5, hy + 3, 1, 2, C.hair); rect(ctx, 10, hy + 3, 1, 2, C.hair);
    rect(ctx, 6, hy + 4, 1, 2, C.eye); rect(ctx, 9, hy + 4, 1, 2, C.eye);
    if (f.glasses) {
      rect(ctx, 5, hy + 4, 3, 1, C.outline); rect(ctx, 8, hy + 4, 3, 1, C.outline);
    }
    rect(ctx, 5, hy + 7, 6, 1, C.skinShade);
  } else if (facing === 'north') {
    rect(ctx, 5, hy, 6, 7, C.hair); rect(ctx, 6, hy, 3, 1, C.hairHi);
    rect(ctx, 5, hy + 7, 6, 1, C.skinShade);
  } else {
    rect(ctx, 5, hy, 6, 3, C.hair); rect(ctx, 7, hy, 3, 1, C.hairHi);
    rect(ctx, 5, hy + 3, 3, 3, C.hair);
    rect(ctx, 9, hy + 4, 1, 2, C.eye);
    if (f.glasses) rect(ctx, 8, hy + 4, 3, 1, C.outline);
    rect(ctx, 11, hy + 4, 1, 2, C.skin); // nose
    rect(ctx, 5, hy + 7, 6, 1, C.skinShade);
  }
}

/** Paints a 1px outline into transparent pixels that touch opaque ones. */
export function addOutline(ctx: Ctx, w: number, h: number, outline: string) {
  const img = ctx.getImageData(0, 0, w, h);
  const src = new Uint8ClampedArray(img.data);
  const r = parseInt(outline.slice(1, 3), 16);
  const g = parseInt(outline.slice(3, 5), 16);
  const b = parseInt(outline.slice(5, 7), 16);
  const alpha = (x: number, y: number) =>
    x < 0 || y < 0 || x >= w || y >= h ? 0 : src[(y * w + x) * 4 + 3];
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      if (alpha(x, y) > 0) continue;
      if (alpha(x - 1, y) || alpha(x + 1, y) || alpha(x, y - 1) || alpha(x, y + 1)) {
        const i = (y * w + x) * 4;
        img.data[i] = r;
        img.data[i + 1] = g;
        img.data[i + 2] = b;
        img.data[i + 3] = 255;
      }
    }
  }
  ctx.putImageData(img, 0, 0);
}

/** Builds a full character sprite sheet on a canvas. Browser-only. */
export function createCharacterSheet(
  palette: CharacterPalette,
  features: CharacterFeatures = {},
): HTMLCanvasElement {
  const sheet = document.createElement('canvas');
  sheet.width = FW * SHEET_COLS;
  sheet.height = FH * SHEET_ROWS;
  const out = sheet.getContext('2d')!;
  out.imageSmoothingEnabled = false;

  const frame = document.createElement('canvas');
  frame.width = FW;
  frame.height = FH;
  const fctx = frame.getContext('2d', { willReadFrequently: true })!;

  const rows: Array<[number, Facing, boolean]> = [
    [0, 'south', false],
    [1, 'north', false],
    [2, 'east', false],
    [3, 'east', true], // west mirrors east
  ];
  for (const [row, facing, mirror] of rows) {
    for (let col = 0; col < SHEET_COLS; col++) {
      fctx.clearRect(0, 0, FW, FH);
      drawFrame(fctx, palette, features, facing, col);
      addOutline(fctx, FW, FH, palette.outline);
      out.save();
      if (mirror) {
        out.translate((col + 1) * FW, row * FH);
        out.scale(-1, 1);
        out.drawImage(frame, 0, 0);
      } else {
        out.drawImage(frame, col * FW, row * FH);
      }
      out.restore();
    }
  }
  return sheet;
}
