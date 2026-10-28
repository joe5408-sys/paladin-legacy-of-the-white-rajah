import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type * as THREE from 'three';
import { CHARACTERS } from '../../data/characters';
import type { Box, Vec2 } from '../core/collision';
import { moveWithCollision } from '../core/collision';
import { PLAYER_RADIUS, PLAYER_SPEED } from '../core/constants';
import { gameStore } from '../core/gameStore';
import { playerTracker } from '../core/playerTracker';
import { DIRECTION_VECTORS, type Direction } from '../core/input';
import { useDirectionalInput } from '../core/useDirectionalInput';
import { frameColumn } from './animation';
import { setSpriteFrame, SpriteBody, useCharacterTexture } from './spriteBody';

interface PlayerProps {
  start: Vec2;
  startFacing?: Direction;
  colliders: readonly Box[];
  bounds: Box;
  /** Shared, mutated every frame; the camera and interaction system read it. */
  positionRef: React.MutableRefObject<THREE.Vector3>;
}

export function Player({ start, startFacing = 'south', colliders, bounds, positionRef }: PlayerProps) {
  const input = useDirectionalInput();
  const texture = useCharacterTexture(CHARACTERS.adrian);
  const group = useRef<THREE.Group>(null);
  const state = useRef({
    pos: { ...start } as Vec2,
    facing: startFacing as Direction,
    moving: false,
    stateTime: 0,
  });

  useFrame((_, rawDt) => {
    const dt = Math.min(rawDt, 0.1); // clamp long frames (tab switch) to avoid big jumps
    const s = state.current;
    // No movement while a conversation, menu or anything else has control.
    const g = gameStore.getState();
    const dir = g.mode === 'explore' && !g.paused ? input.current() : null;
    const wasMoving = s.moving;

    if (dir) {
      s.facing = dir;
      const v = DIRECTION_VECTORS[dir];
      s.pos = moveWithCollision(
        s.pos,
        { x: v.x * PLAYER_SPEED * dt, z: v.z * PLAYER_SPEED * dt },
        PLAYER_RADIUS,
        colliders,
        bounds,
      );
      s.moving = true;
    } else {
      s.moving = false;
    }
    s.stateTime = wasMoving === s.moving ? s.stateTime + dt : 0;

    setSpriteFrame(texture, s.facing, frameColumn(s.moving, s.stateTime));
    group.current?.position.set(s.pos.x, 0, s.pos.z);
    positionRef.current.set(s.pos.x, 0, s.pos.z);
    playerTracker.x = s.pos.x;
    playerTracker.z = s.pos.z;
    playerTracker.facing = s.facing;
    playerTracker.moving = s.moving;
  });

  return (
    <group ref={group} position={[start.x, 0, start.z]}>
      <SpriteBody texture={texture} />
    </group>
  );
}
