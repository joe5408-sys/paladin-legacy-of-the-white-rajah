/**
 * Chapter 1 — the vault beneath the Royal Archives (lazy-loaded scene).
 * A cold stone hall: sealed cabinets, oil lamps, the Hollow Sentinel standing
 * before a barred inner gate. The gate slides open at the end of Milestone 1.3.
 */
import { useFrame } from '@react-three/fiber';
import { useRef, type ReactElement } from 'react';
import * as THREE from 'three';
import type { SpawnPoint } from '../../data/scenes';
import { getSentinelTexture, SENTINEL_H, SENTINEL_W } from '../../game/combat/sentinelSprite';
import { CAMERA_PITCH_DEG } from '../../game/core/constants';
import { useGame } from '../../game/core/gameStore';
import { ExplorationRig } from '../../game/scenes/ExplorationRig';
import { getInsigniaTexture } from '../../game/scenes/insignia';
import {
  CABINET_SIZE,
  CABINETS,
  INNER_GATE,
  SENTINEL,
  VAULT_LAYOUT,
  VAULT_ROOM,
  VAULT_WALL_HEIGHT,
} from './vaultData';

const T = 0.3; // wall thickness
const HEIGHT_COMP = 1 / Math.cos(THREE.MathUtils.degToRad(CAMERA_PITCH_DEG));
const SENTINEL_WIDTH = 2.0;
const SENTINEL_HEIGHT = SENTINEL_WIDTH * (SENTINEL_H / SENTINEL_W) * HEIGHT_COMP;

export default function Vault({ spawn }: { spawn: SpawnPoint }) {
  const { minX, maxX, minZ, maxZ } = VAULT_ROOM;
  const w = maxX - minX;
  const d = maxZ - minZ;
  const H = VAULT_WALL_HEIGHT;

  return (
    <>
      <color attach="background" args={['#070606']} />
      <hemisphereLight args={['#e0d2bc', '#3a3028', 0.95]} />
      <directionalLight
        position={[0, 9, 5]}
        intensity={0.9}
        color="#e8dcc8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />
      {/* Oil lamps on the side walls */}
      {/* (placed in the gaps between the cabinets) */}
      {[-2.4, -0.4, 1.9].map((z) =>
        [-1, 1].map((side) => <WallLamp key={`${z}${side}`} x={side * (maxX - 0.05)} z={z} side={side} />),
      )}

      <StoneFloor />

      {/* North wall, side walls and a low south wall with the open iron door */}
      <mesh position={[0, H / 2, minZ - T / 2]} receiveShadow>
        <boxGeometry args={[w + 2 * T, H, T]} />
        <meshStandardMaterial color="#4a423a" />
      </mesh>
      {[minX - T / 2, maxX + T / 2].map((x) => (
        <mesh key={x} position={[x, H / 2, (minZ + maxZ) / 2]}>
          <boxGeometry args={[T, H, d + 2 * T]} />
          <meshStandardMaterial color="#403830" />
        </mesh>
      ))}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (0.75 + (w / 2 - 0.75 + T) / 2), 0.3, maxZ + T / 2]}>
          <boxGeometry args={[w / 2 - 0.75 + T, 0.6, T]} />
          <meshStandardMaterial color="#403830" />
        </mesh>
      ))}

      {CABINETS.map((c) => (
        <Cabinet key={`${c.x},${c.z}`} x={c.x} z={c.z} />
      ))}
      <InnerGate />
      <Sentinel />

      <ExplorationRig layout={VAULT_LAYOUT} spawn={spawn} />
    </>
  );
}

function StoneFloor() {
  const { minX, maxX, minZ, maxZ } = VAULT_ROOM;
  const tiles: ReactElement[] = [];
  for (let x = minX; x < maxX; x++) {
    for (let z = minZ; z < maxZ; z++) {
      const shade = ((x * 7 + z * 13) % 3 + 3) % 3;
      tiles.push(
        <mesh key={`${x},${z}`} rotation-x={-Math.PI / 2} position={[x + 0.5, 0, z + 0.5]} receiveShadow>
          <planeGeometry args={[0.96, 0.96]} />
          <meshStandardMaterial color={['#5a5048', '#544a42', '#5f554c'][shade]} />
        </mesh>,
      );
    }
  }
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
        <planeGeometry args={[maxX - minX + 1, maxZ - minZ + 1]} />
        <meshStandardMaterial color="#221d19" />
      </mesh>
      {tiles}
    </group>
  );
}

function WallLamp({ x, z, side }: { x: number; z: number; side: number }) {
  const light = useRef<THREE.PointLight>(null);
  const seed = useRef(Math.random() * 10);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime + seed.current;
    if (light.current) light.current.intensity = 3 + Math.sin(t * 7) * 0.3 + Math.sin(t * 13) * 0.2;
  });
  return (
    <group position={[x, 1.9, z]}>
      <mesh>
        <boxGeometry args={[0.12, 0.3, 0.12]} />
        <meshStandardMaterial color="#6b5030" metalness={0.4} />
      </mesh>
      <mesh position-y={0.22}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshBasicMaterial color="#ffcf80" toneMapped={false} />
      </mesh>
      <pointLight ref={light} position={[-side * 0.4, 0.2, 0]} color="#ffb860" intensity={3} distance={5} />
    </group>
  );
}

/** A tall record cabinet sealed with red wax. */
function Cabinet({ x, z }: { x: number; z: number }) {
  const facing = x < 0 ? 1 : -1; // doors face the middle of the hall
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={1.1} castShadow receiveShadow>
        <boxGeometry args={[CABINET_SIZE.width, 2.2, CABINET_SIZE.depth]} />
        <meshStandardMaterial color="#5a3e2c" />
      </mesh>
      {[-0.3, 0.3].map((dz) => (
        <mesh key={dz} position={[facing * (CABINET_SIZE.width / 2 + 0.01), 1.1, dz]} rotation-y={(facing * Math.PI) / 2}>
          <planeGeometry args={[0.52, 1.9]} />
          <meshStandardMaterial color="#6b4a34" />
        </mesh>
      ))}
      {/* Wax seal across the doors */}
      <mesh position={[facing * (CABINET_SIZE.width / 2 + 0.03), 1.2, 0]}>
        <sphereGeometry args={[0.08, 8, 6]} />
        <meshStandardMaterial color="#8a1f28" />
      </mesh>
    </group>
  );
}

/** The barred inner gate. Its bars sink into the floor once it is opened. */
function InnerGate() {
  const open = useGame((s) => !!s.flags.c1_inner_gate_open);
  const bars = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);
  useFrame((_, dt) => {
    if (!bars.current) return;
    const target = open ? -INNER_GATE.height - 0.1 : 0;
    bars.current.position.y += (target - bars.current.position.y) * Math.min(1, dt * 1.5);
    if (glow.current) glow.current.intensity = open ? 3 : 0;
  });
  const z = VAULT_ROOM.minZ + 0.05;
  const iron = <meshStandardMaterial color="#222428" metalness={0.6} roughness={0.5} />;
  return (
    <group position={[INNER_GATE.x, 0, z]}>
      {/* Stone frame and the dark room behind */}
      <mesh position={[0, INNER_GATE.height / 2 + 0.1, -0.02]}>
        <boxGeometry args={[INNER_GATE.width + 0.5, INNER_GATE.height + 0.3, 0.1]} />
        <meshStandardMaterial color="#6b6258" />
      </mesh>
      <mesh position={[0, INNER_GATE.height / 2, 0.04]}>
        <planeGeometry args={[INNER_GATE.width, INNER_GATE.height]} />
        <meshBasicMaterial color="#0c0a09" />
      </mesh>
      {/* Rows of sealed boxes, faint in the dark */}
      {[0.5, 1.2, 1.9].map((y) =>
        [-0.7, 0, 0.7].map((x) => (
          <mesh key={`${x}${y}`} position={[x, y, 0.06]}>
            <planeGeometry args={[0.5, 0.4]} />
            <meshStandardMaterial color="#3a2e24" />
          </mesh>
        )),
      )}
      <pointLight ref={glow} position={[0, 1.4, 0.6]} color="#ffd27a" intensity={0} distance={4} />
      <group ref={bars}>
        {[-0.9, -0.45, 0, 0.45, 0.9].map((x) => (
          <mesh key={x} position={[x, INNER_GATE.height / 2, 0.12]} castShadow>
            <boxGeometry args={[0.07, INNER_GATE.height, 0.07]} />
            {iron}
          </mesh>
        ))}
        {[0.3, 1.4, 2.5].map((y) => (
          <mesh key={y} position={[0, y, 0.12]}>
            <boxGeometry args={[INNER_GATE.width, 0.08, 0.08]} />
            {iron}
          </mesh>
        ))}
        {/* The square lock plate in the centre */}
        <mesh position={[0, 1.4, 0.17]}>
          <boxGeometry args={[0.28, 0.28, 0.04]} />
          <meshStandardMaterial color="#7a5524" metalness={0.5} />
        </mesh>
      </group>
      {/* The scratched-out Paladin sign above the gate */}
      <mesh position={[0, INNER_GATE.height + 0.05, 0.04]}>
        <planeGeometry args={[0.5, 0.5]} />
        <meshBasicMaterial map={getInsigniaTexture('#8a7a68')} transparent alphaTest={0.3} />
      </mesh>
    </group>
  );
}

/** The Hollow Sentinel: dormant until the battle, a heap of brass afterwards. */
function Sentinel() {
  const defeated = useGame((s) => !!s.flags.c1_sentinel_defeated);
  const flame = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (flame.current) flame.current.intensity = 1.2 + Math.sin(clock.elapsedTime * 2.2) * 0.4;
  });

  if (defeated) {
    // Wreckage: brass plates and ironwood limbs scattered on the floor.
    const pieces: [number, number, number, number, number, string][] = [
      [-0.35, 0.2, 0.7, 0.18, 0.4, '#b8893a'],
      [0.4, -0.15, 0.5, 0.12, -0.6, '#7a5524'],
      [0.05, 0.35, 0.9, 0.1, 0.2, '#3b2a20'],
      [-0.2, -0.3, 0.45, 0.2, 1.1, '#e0b860'],
      [0.55, 0.3, 0.35, 0.14, -1.3, '#b8893a'],
    ];
    return (
      <group position={[SENTINEL.x, 0, SENTINEL.z]}>
        {pieces.map(([x, z, len, h, rot, color], i) => (
          <mesh key={i} position={[x, h / 2, z]} rotation-y={rot} castShadow>
            <boxGeometry args={[len, h, 0.22]} />
            <meshStandardMaterial color={color} metalness={0.4} roughness={0.6} />
          </mesh>
        ))}
        {/* The empty chest cage */}
        <mesh position={[0, 0.18, 0]} rotation={[0.3, 0.4, 0]}>
          <torusGeometry args={[0.22, 0.04, 6, 10]} />
          <meshStandardMaterial color="#b8893a" metalness={0.4} />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[SENTINEL.x, 0, SENTINEL.z]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0.1]}>
        <circleGeometry args={[0.7, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <mesh position-y={SENTINEL_HEIGHT / 2}>
        <planeGeometry args={[SENTINEL_WIDTH, SENTINEL_HEIGHT]} />
        {/* Slightly dimmed while dormant */}
        <meshBasicMaterial map={getSentinelTexture()} alphaTest={0.5} color="#b8b0a8" toneMapped={false} />
      </mesh>
      <pointLight ref={flame} position={[0, SENTINEL_HEIGHT * 0.45, 0.5]} color="#9fd4ff" intensity={1.2} distance={3} />
    </group>
  );
}
