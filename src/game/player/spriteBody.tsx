import { useEffect, useMemo } from 'react';
import * as THREE from 'three';
import type { CharacterDef } from '../../data/characters';
import {
  CAMERA_PITCH_DEG,
  SPRITE_FRAME_H,
  SPRITE_FRAME_W,
  SPRITE_WORLD_WIDTH,
} from '../core/constants';
import type { Direction } from '../core/input';
import { createCharacterSheet, DIRECTION_ROW, SHEET_COLS, SHEET_ROWS } from './pixelSprite';

// Sprites stand upright. Seen from a pitched camera they would look squashed,
// so stretch them vertically by 1/cos(pitch) to restore the drawn proportions.
const HEIGHT_COMPENSATION = 1 / Math.cos(THREE.MathUtils.degToRad(CAMERA_PITCH_DEG));
export const SPRITE_WORLD_HEIGHT =
  SPRITE_WORLD_WIDTH * (SPRITE_FRAME_H / SPRITE_FRAME_W) * HEIGHT_COMPENSATION;

/** Creates (once) a pixel-crisp sprite-sheet texture for a character. */
export function useCharacterTexture(character: CharacterDef): THREE.CanvasTexture {
  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(createCharacterSheet(character.palette, character.features));
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.repeat.set(1 / SHEET_COLS, 1 / SHEET_ROWS);
    return tex;
  }, [character]);
  useEffect(() => () => texture.dispose(), [texture]);
  return texture;
}

/** Points the texture at one frame. Texture V runs bottom-up, sheet rows run top-down. */
export function setSpriteFrame(texture: THREE.Texture, facing: Direction, column: number) {
  const row = DIRECTION_ROW[facing];
  texture.offset.set(column / SHEET_COLS, 1 - (row + 1) / SHEET_ROWS);
}

/** The visible sprite plane plus a blob shadow, anchored at the feet. */
export function SpriteBody({ texture }: { texture: THREE.Texture }) {
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position-y={0.02} renderOrder={1}>
        <circleGeometry args={[0.32, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh position-y={SPRITE_WORLD_HEIGHT / 2}>
        <planeGeometry args={[SPRITE_WORLD_WIDTH, SPRITE_WORLD_HEIGHT]} />
        {/* alphaTest gives hard pixel edges and correct depth against 3D geometry */}
        <meshBasicMaterial map={texture} alphaTest={0.5} toneMapped={false} />
      </mesh>
    </>
  );
}
