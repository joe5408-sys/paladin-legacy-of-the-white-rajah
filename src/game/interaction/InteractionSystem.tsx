import { useFrame } from '@react-three/fiber';
import type * as THREE from 'three';
import { gameStore } from '../core/gameStore';
import { findNearestInteractable, type Interactable } from './interaction';

interface Props {
  targets: readonly Interactable[];
  playerPos: React.MutableRefObject<THREE.Vector3>;
}

/** Each frame, records which available interactable (if any) is in range of the player. */
export function InteractionSystem({ targets, playerPos }: Props) {
  useFrame(() => {
    const state = gameStore.getState();
    if (state.mode !== 'explore') return;
    const p = playerPos.current;
    state.setNearby(findNearestInteractable({ x: p.x, z: p.z }, targets, state.flags));
  });
  return null;
}
