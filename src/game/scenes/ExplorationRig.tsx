import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import type { SpawnPoint } from '../../data/scenes';
import { FollowCamera } from '../camera/FollowCamera';
import { useGame } from '../core/gameStore';
import { InteractionSystem } from '../interaction/InteractionSystem';
import { Npc } from '../npc/Npc';
import { Player } from '../player/Player';
import type { SceneLayout } from './layout';

/**
 * Player, NPCs, interactions and camera for any explorable scene.
 * Scenes only add their own geometry and lighting around this.
 */
export function ExplorationRig({ layout, spawn }: { layout: SceneLayout; spawn: SpawnPoint }) {
  const flags = useGame((s) => s.flags);
  const playerPos = useRef(new THREE.Vector3(spawn.x, 0, spawn.z));
  // Rebuilt only when story flags change (e.g. a floor hatch opens).
  const colliders = useMemo(() => layout.colliders(flags), [layout, flags]);

  return (
    <>
      <Player
        start={spawn}
        startFacing={spawn.facing}
        colliders={colliders}
        bounds={layout.bounds}
        positionRef={playerPos}
      />
      {layout.npcs.map((n) => (
        <Npc key={n.id} placement={n} playerPos={playerPos} />
      ))}
      <InteractionSystem targets={layout.interactables} playerPos={playerPos} />
      <FollowCamera target={playerPos} />
    </>
  );
}
