import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import type * as THREE from 'three';
import { CHARACTERS } from '../../data/characters';
import type { NpcPlacement } from '../scenes/layout';
import { gameStore } from '../core/gameStore';
import { directionToward } from '../core/input';
import { frameColumn } from '../player/animation';
import { setSpriteFrame, SpriteBody, useCharacterTexture } from '../player/spriteBody';

interface NpcProps {
  placement: NpcPlacement;
  playerPos: React.MutableRefObject<THREE.Vector3>;
}

/** A standing NPC. Idles in place and turns to face the player while talking. */
export function Npc({ placement, playerPos }: NpcProps) {
  const texture = useCharacterTexture(CHARACTERS[placement.character]);
  const time = useRef(Math.random() * 2); // offset so NPCs don't breathe in sync

  useFrame((_, dt) => {
    time.current += Math.min(dt, 0.1);
    const talking = gameStore.getState().dialogue?.source?.npc === placement.character;
    const facing = talking
      ? directionToward(placement, { x: playerPos.current.x, z: playerPos.current.z })
      : placement.facing;
    setSpriteFrame(texture, facing, frameColumn(false, time.current));
  });

  return (
    <group position={[placement.x, 0, placement.z]}>
      <SpriteBody texture={texture} />
    </group>
  );
}
