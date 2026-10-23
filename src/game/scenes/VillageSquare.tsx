import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  BOARDWALK,
  BUILDINGS,
  buildVillageColliders,
  PLAYER_START,
  PROPS,
  RIVER,
  VILLAGE_BOUNDS,
} from '../../data/villageSquare';
import { FollowCamera } from '../camera/FollowCamera';
import { Player } from '../player/Player';
import { Boardwalk, Building, GroundPatch, Prop, River } from './environment';

/** Decorative tree line on the far bank: [x, z, scale]. Not walkable, no colliders. */
const FAR_TREES: Array<[number, number, number]> = Array.from({ length: 22 }, (_, i) => {
  const x = -26 + i * 2.5 + ((i * 7) % 3) * 0.4;
  const z = -15.5 - ((i * 5) % 4) * 0.9;
  const s = 0.8 + ((i * 3) % 5) * 0.12;
  return [x, z, s];
});

/** Area A — the riverside village square of Sungai Awan. */
export function VillageSquare() {
  const colliders = useMemo(() => buildVillageColliders(), []);
  const playerPos = useRef(new THREE.Vector3(PLAYER_START.x, 0, PLAYER_START.z));

  return (
    <>
      <color attach="background" args={['#9fc6c9']} />
      <fog attach="fog" args={['#b9d3cf', 30, 55]} />

      {/* Warm late-afternoon light with soft sky fill */}
      <hemisphereLight args={['#fff3dc', '#4d6b4a', 0.9]} />
      <directionalLight
        position={[-8, 14, 6]}
        intensity={2.2}
        color="#ffe2b8"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-16}
        shadow-camera-right={16}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />

      {/* Ground: grass, then dirt paths linking the square to each building */}
      {/* Village ground stops at the boardwalk so the river shows behind it */}
      <GroundPatch x={0} z={4} width={60} depth={20.4} color="#6f9a52" y={0} />
      {/* Far riverbank and rainforest edge */}
      <GroundPatch x={0} z={-24} width={80} depth={20} color="#3f6b3c" y={-0.1} />
      {FAR_TREES.map(([x, z, s], i) => (
        <mesh key={i} position={[x, 1.2 * s, z]} scale={s} castShadow>
          <icosahedronGeometry args={[1.4, 0]} />
          <meshStandardMaterial color={i % 2 ? '#2e5a33' : '#3a6b3a'} flatShading />
        </mesh>
      ))}
      <GroundPatch x={0} z={3.9} width={24} depth={1.6} color="#b99a6b" />
      <GroundPatch x={-6} z={6} width={1.6} depth={4.5} color="#b99a6b" />
      <GroundPatch x={6.8} z={2.4} width={1.6} depth={2.6} color="#b99a6b" />
      <GroundPatch x={-7.5} z={1.2} width={1.4} depth={2} color="#b99a6b" />
      <GroundPatch x={-1.5} z={1.1} width={1.4} depth={2} color="#b99a6b" />
      <GroundPatch x={0} z={-4.2} width={24} depth={1.0} color="#a98b5f" />

      <River {...RIVER} />
      <Boardwalk {...BOARDWALK} />

      {BUILDINGS.map((b) => (
        <Building key={b.id} def={b} />
      ))}
      {PROPS.map((p, i) => (
        <Prop key={i} def={p} />
      ))}

      <Player
        start={PLAYER_START}
        colliders={colliders}
        bounds={VILLAGE_BOUNDS}
        positionRef={playerPos}
      />
      <FollowCamera target={playerPos} />
    </>
  );
}
