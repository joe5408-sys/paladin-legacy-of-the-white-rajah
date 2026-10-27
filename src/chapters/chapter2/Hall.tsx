/**
 * Chapter 2 — inside the waystation (lazy-loaded scene). A round hall cut into
 * the cliff: roots through the ceiling, river-light from a basin in the floor,
 * Elias's desk, the oath carved on the north wall, and the bronze Charter case.
 */
import { useFrame } from '@react-three/fiber';
import { useRef, type ReactElement } from 'react';
import * as THREE from 'three';
import type { SpawnPoint } from '../../data/scenes';
import { useGame } from '../../game/core/gameStore';
import { ExplorationRig } from '../../game/scenes/ExplorationRig';
import { getInsigniaTexture } from '../../game/scenes/insignia';
import { BASIN, CASE, DESK, HALL_LAYOUT, HALL_ROOM, HALL_WALL_HEIGHT } from './hallData';

const T = 0.3; // wall thickness

export default function Hall({ spawn }: { spawn: SpawnPoint }) {
  const { minX, maxX, minZ, maxZ } = HALL_ROOM;
  const w = maxX - minX;
  const d = maxZ - minZ;
  const H = HALL_WALL_HEIGHT;
  return (
    <>
      <color attach="background" args={['#060a09']} />
      <hemisphereLight args={['#cfe4dc', '#22302a', 0.8]} />
      <directionalLight
        position={[0, 9, 5]}
        intensity={0.7}
        color="#e0ecdc"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />

      <Floor />
      {/* North wall (the oath), side walls, and a low south wall with the doorway */}
      <mesh position={[0, H / 2, minZ - T / 2]} receiveShadow>
        <boxGeometry args={[w + 2 * T, H, T]} />
        <meshStandardMaterial color="#4e564a" />
      </mesh>
      {[minX - T / 2, maxX + T / 2].map((x) => (
        <mesh key={x} position={[x, H / 2, (minZ + maxZ) / 2]}>
          <boxGeometry args={[T, H, d + 2 * T]} />
          <meshStandardMaterial color="#464e44" />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (0.75 + (w / 2 - 0.75 + T) / 2), 0.3, maxZ + T / 2]}>
          <boxGeometry args={[w / 2 - 0.75 + T, 0.6, T]} />
          <meshStandardMaterial color="#464e44" />
        </mesh>
      ))}
      {/* Daylight from the open door */}
      <pointLight position={[0, 1.2, maxZ + 0.6]} color="#fff4d8" intensity={3} distance={4} />

      <OathWall />
      <Roots />
      <Basin />
      <Desk />
      <CharterCase />

      <ExplorationRig layout={HALL_LAYOUT} spawn={spawn} />
    </>
  );
}

function Floor() {
  const { minX, maxX, minZ, maxZ } = HALL_ROOM;
  const tiles: ReactElement[] = [];
  for (let x = minX; x < maxX; x++) {
    for (let z = minZ; z < maxZ; z++) {
      const shade = ((x * 5 + z * 11) % 3 + 3) % 3;
      tiles.push(
        <mesh key={`${x},${z}`} rotation-x={-Math.PI / 2} position={[x + 0.5, 0, z + 0.5]} receiveShadow>
          <planeGeometry args={[0.95, 0.95]} />
          <meshStandardMaterial color={['#5c6256', '#565c50', '#5a6a52'][shade]} />
        </mesh>,
      );
    }
  }
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
        <planeGeometry args={[maxX - minX + 1, maxZ - minZ + 1]} />
        <meshStandardMaterial color="#1c221c" />
      </mesh>
      {tiles}
    </group>
  );
}

/** The oath, carved in lines that glow once read. */
function OathWall() {
  const read = useGame((s) => !!s.flags.c2_read_oath);
  const z = HALL_ROOM.minZ + 0.01;
  return (
    <group position={[0, 0, z]}>
      <mesh position={[0, 2.75, 0.01]}>
        <planeGeometry args={[0.7, 0.7]} />
        <meshBasicMaterial map={getInsigniaTexture(read ? '#ffe08a' : '#a8b0a0')} transparent alphaTest={0.3} toneMapped={false} />
      </mesh>
      {[2.2, 1.9, 1.6, 1.3, 1.0, 0.7].map((y, i) => (
        <mesh key={y} position={[0, y, 0.01]}>
          <planeGeometry args={[i % 2 ? 2.6 : 3.0, 0.07]} />
          <meshBasicMaterial color={read ? '#ffe8a8' : '#3a4038'} toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** Roots hanging through cracks in the ceiling. */
function Roots() {
  const roots: Array<[number, number, number]> = [
    [-3.2, -3.4, 1.4], [-1.6, -3.7, 0.9], [1.9, -3.6, 1.2], [3.3, -2.2, 1.0], [-3.6, 1.6, 1.1], [3.5, 1.8, 0.8],
  ];
  return (
    <group>
      {roots.map(([x, z, len]) => (
        <mesh key={`${x},${z}`} position={[x, HALL_WALL_HEIGHT - len / 2, z]}>
          <cylinderGeometry args={[0.03, 0.07, len, 5]} />
          <meshStandardMaterial color="#4a3a28" />
        </mesh>
      ))}
    </group>
  );
}

/** The basin of river-water whose light ripples on the walls. */
function Basin() {
  const light = useRef<THREE.PointLight>(null);
  const water = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (light.current) {
      light.current.intensity = 3 + Math.sin(t * 1.7) * 0.6;
      light.current.position.x = BASIN.x + Math.sin(t * 0.9) * 0.3;
    }
    if (water.current) water.current.emissiveIntensity = 0.5 + Math.sin(t * 2.1) * 0.15;
  });
  const s = BASIN.size;
  return (
    <group position={[BASIN.x, 0, BASIN.z]}>
      <mesh position-y={0.2} castShadow receiveShadow>
        <boxGeometry args={[s, 0.4, s]} />
        <meshStandardMaterial color="#6a7064" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.41}>
        <planeGeometry args={[s - 0.16, s - 0.16]} />
        <meshStandardMaterial ref={water} color="#2a6a70" emissive="#3ab0c0" emissiveIntensity={0.5} roughness={0.15} />
      </mesh>
      <pointLight ref={light} position={[0, 1.2, 0]} color="#8fe0f0" intensity={3} distance={6} />
    </group>
  );
}

/** Elias's writing desk with the journal and a dead candle. */
function Desk() {
  const read = useGame((s) => !!s.flags.c2_read_journal);
  return (
    <group position={[DESK.x, 0, DESK.z]}>
      <mesh position-y={0.75} castShadow receiveShadow>
        <boxGeometry args={[DESK.width, 0.08, DESK.depth]} />
        <meshStandardMaterial color="#5a4030" />
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[(sx * (DESK.width - 0.12)) / 2, 0.37, (sz * (DESK.depth - 0.12)) / 2]}>
            <boxGeometry args={[0.08, 0.74, 0.08]} />
            <meshStandardMaterial color="#3e2c20" />
          </mesh>
        )),
      )}
      {/* The journal: closed, then open once read */}
      <mesh position={[0.15, 0.81, 0]} rotation-y={0.2}>
        <boxGeometry args={[read ? 0.5 : 0.28, 0.05, 0.36]} />
        <meshStandardMaterial color={read ? '#e0d4b0' : '#6a3a24'} />
      </mesh>
      <mesh position={[-0.25, 0.86, -0.45]}>
        <cylinderGeometry args={[0.04, 0.04, 0.14, 8]} />
        <meshStandardMaterial color="#e8e0c8" />
      </mesh>
    </group>
  );
}

/** The bronze case on its plinth; the lid swings open once the Charter is found. */
function CharterCase() {
  const open = useGame((s) => !!s.flags.c2_found_charter);
  const lid = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);
  useFrame((_, dt) => {
    if (lid.current) {
      const target = open ? -1.9 : 0;
      lid.current.rotation.z += (target - lid.current.rotation.z) * Math.min(1, dt * 2);
    }
    if (glow.current) glow.current.intensity = open ? 2.5 : 0.6;
  });
  return (
    <group position={[CASE.x, 0, CASE.z]}>
      <mesh position-y={0.45} castShadow receiveShadow>
        <boxGeometry args={[CASE.width, 0.9, CASE.depth]} />
        <meshStandardMaterial color="#70766a" />
      </mesh>
      <mesh position-y={1.05} castShadow>
        <boxGeometry args={[0.7, 0.3, 0.5]} />
        <meshStandardMaterial color="#9a6a2c" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Lid, hinged on its east edge */}
      <group ref={lid} position={[0.35, 1.2, 0]}>
        <mesh position={[-0.35, 0.03, 0]}>
          <boxGeometry args={[0.72, 0.06, 0.52]} />
          <meshStandardMaterial color="#b07a34" metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[-0.35, 0.065, 0]} rotation-x={-Math.PI / 2}>
          <planeGeometry args={[0.36, 0.36]} />
          <meshBasicMaterial map={getInsigniaTexture(open ? '#fff2c4' : '#6a4a20')} transparent alphaTest={0.3} toneMapped={false} />
        </mesh>
      </group>
      <pointLight ref={glow} position={[-0.5, 1.6, 0.4]} color="#ffe0a0" intensity={0.6} distance={3} />
    </group>
  );
}
