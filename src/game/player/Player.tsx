import { useFrame } from '@react-three/fiber';
import { useEffect, useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { Box, Vec2 } from '../core/collision';
import { moveWithCollision } from '../core/collision';
import {
  CAMERA_PITCH_DEG,
  PLAYER_RADIUS,
  PLAYER_SPEED,
  SPRITE_FRAME_H,
  SPRITE_FRAME_W,
  SPRITE_WORLD_WIDTH,
} from '../core/constants';
import { DIRECTION_VECTORS, type Direction } from '../core/input';
import { useDirectionalInput } from '../core/useDirectionalInput';
import { frameColumn } from './animation';
import { createHeroSheet, DIRECTION_ROW, SHEET_COLS, SHEET_ROWS } from './pixelSprite';

interface PlayerProps {
  start: Vec2;
  colliders: readonly Box[];
  bounds: Box;
  /** Shared, mutated every frame; the camera reads it to follow the player. */
  positionRef: React.MutableRefObject<THREE.Vector3>;
}

// The sprite stands upright. Seen from a pitched camera it would look squashed,
// so stretch it vertically by 1/cos(pitch) to restore the drawn proportions.
const HEIGHT_COMPENSATION = 1 / Math.cos(THREE.MathUtils.degToRad(CAMERA_PITCH_DEG));
const SPRITE_WORLD_HEIGHT =
  SPRITE_WORLD_WIDTH * (SPRITE_FRAME_H / SPRITE_FRAME_W) * HEIGHT_COMPENSATION;

export function Player({ start, colliders, bounds, positionRef }: PlayerProps) {
  const input = useDirectionalInput();
  const group = useRef<THREE.Group>(null);
  const state = useRef({
    pos: { ...start } as Vec2,
    facing: 'south' as Direction,
    moving: false,
    stateTime: 0,
  });

  const texture = useMemo(() => {
    const tex = new THREE.CanvasTexture(createHeroSheet());
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.generateMipmaps = false;
    tex.colorSpace = THREE.SRGBColorSpace;
    tex.repeat.set(1 / SHEET_COLS, 1 / SHEET_ROWS);
    return tex;
  }, []);
  useEffect(() => () => texture.dispose(), [texture]);

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1); // clamp long frames (tab switch) to avoid big jumps
    const s = state.current;
    const dir = input.current();
    const wasMoving = s.moving;

    if (dir) {
      s.facing = dir;
      const v = DIRECTION_VECTORS[dir];
      const next = moveWithCollision(
        s.pos,
        { x: v.x * PLAYER_SPEED * dt, z: v.z * PLAYER_SPEED * dt },
        PLAYER_RADIUS,
        colliders,
        bounds,
      );
      s.moving = true;
      s.pos = next;
    } else {
      s.moving = false;
    }
    s.stateTime = wasMoving === s.moving ? s.stateTime + dt : 0;

    // Pick sprite frame. Texture V runs bottom-up, sheet rows run top-down.
    const col = frameColumn(s.moving, s.stateTime);
    const row = DIRECTION_ROW[s.facing];
    texture.offset.set(col / SHEET_COLS, 1 - (row + 1) / SHEET_ROWS);

    group.current?.position.set(s.pos.x, 0, s.pos.z);
    positionRef.current.set(s.pos.x, 0, s.pos.z);

    if (import.meta.env.DEV) {
      (window as unknown as Record<string, unknown>).__PALADIN__ = {
        x: s.pos.x,
        z: s.pos.z,
        facing: s.facing,
        moving: s.moving,
      };
    }
  });

  return (
    <group ref={group} position={[start.x, 0, start.z]}>
      {/* Blob shadow keeps the sprite grounded without real sprite shadows */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.02} renderOrder={1}>
        <circleGeometry args={[0.32, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.35} depthWrite={false} />
      </mesh>
      <mesh position-y={SPRITE_WORLD_HEIGHT / 2}>
        <planeGeometry args={[SPRITE_WORLD_WIDTH, SPRITE_WORLD_HEIGHT]} />
        {/* alphaTest gives hard pixel edges and correct depth against 3D geometry */}
        <meshBasicMaterial map={texture} alphaTest={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}
