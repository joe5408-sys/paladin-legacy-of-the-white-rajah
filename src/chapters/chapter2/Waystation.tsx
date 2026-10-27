/**
 * Chapter 2 — the waystation landing above the rapids (lazy-loaded scene).
 * An invented Paladin site: mossy steps up from the river, a terrace with three
 * standing stones, and a sealed door in the cliff. The stones glow as they wake;
 * once all three are lit the door sinks and the training spirit stands in it.
 */
import { useFrame } from '@react-three/fiber';
import { useRef, type ReactElement } from 'react';
import * as THREE from 'three';
import type { SpawnPoint } from '../../data/scenes';
import { getSpiritTexture, GUARDIAN_H, GUARDIAN_W } from '../../game/combat/guardianSprite';
import { getWardenTexture, SENTINEL_H, SENTINEL_W } from '../../game/combat/sentinelSprite';
import { CAMERA_PITCH_DEG } from '../../game/core/constants';
import { useGame } from '../../game/core/gameStore';
import { River } from '../../game/scenes/environment';
import { ExplorationRig } from '../../game/scenes/ExplorationRig';
import { getInsigniaTexture } from '../../game/scenes/insignia';
import { DOOR, LANDING_BOUNDS, LANDING_LAYOUT, SPIRIT, STEPS, STONES, WARDEN } from './waystationData';

const HEIGHT_COMP = 1 / Math.cos(THREE.MathUtils.degToRad(CAMERA_PITCH_DEG));
const SPIRIT_WIDTH = 2.0;
const SPIRIT_HEIGHT = SPIRIT_WIDTH * (GUARDIAN_H / GUARDIAN_W) * HEIGHT_COMP;
const CLIFF_HEIGHT = 4.2;

type StoneId = keyof typeof STONES;
const GLOW: Record<StoneId, string> = { deep: '#9fe0ff', bright: '#ffe08a', waits: '#d8f0ff' };

export default function Waystation({ spawn }: { spawn: SpawnPoint }) {
  return (
    <>
      <color attach="background" args={['#14221c']} />
      <hemisphereLight args={['#e4f0d8', '#2a3a2c', 0.9]} />
      <directionalLight
        position={[-4, 10, 5]}
        intensity={1.0}
        color="#fff4dc"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005}
      />

      <Ground />
      <River minX={-12} maxX={12} minZ={LANDING_BOUNDS.maxZ} maxZ={LANDING_BOUNDS.maxZ + 6} />
      <Longboat />
      <Cliff />
      <SealedDoor />
      <Grooves />
      <Sunbeam />
      {(Object.keys(STONES) as StoneId[]).map((id) => (
        <StandingStone key={id} id={id} />
      ))}
      <Jungle />
      <Spirit />
      <Warden />

      <ExplorationRig layout={LANDING_LAYOUT} spawn={spawn} />
    </>
  );
}

/** Mossy paving on the terrace, the steps, and the stone landing by the water. */
function Ground() {
  const { minX, maxX, minZ, maxZ } = LANDING_BOUNDS;
  const tiles: ReactElement[] = [];
  for (let x = minX; x < maxX; x++) {
    for (let z = minZ; z < STEPS.toZ; z++) {
      const shade = ((x * 7 + z * 13) % 4 + 4) % 4;
      tiles.push(
        <mesh key={`${x},${z}`} rotation-x={-Math.PI / 2} position={[x + 0.5, 0.004, z + 0.5]} receiveShadow>
          <planeGeometry args={[0.94, 0.94]} />
          <meshStandardMaterial color={['#6a7062', '#5f6a58', '#56704c', '#687058'][shade]} />
        </mesh>,
      );
    }
  }
  const stepDepth = (STEPS.fromZ - STEPS.toZ) / STEPS.count;
  return (
    <group>
      {/* Earth and moss under everything */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.01, (minZ + maxZ) / 2]} receiveShadow>
        <planeGeometry args={[maxX - minX + 6, maxZ - minZ + 1]} />
        <meshStandardMaterial color="#3a4a30" />
      </mesh>
      {tiles}
      {/* The steps: worn stone treads with moss in the cracks */}
      {Array.from({ length: STEPS.count }, (_, i) => (
        <group key={i} position={[STEPS.x, 0, STEPS.toZ + stepDepth * (i + 0.5)]}>
          <mesh rotation-x={-Math.PI / 2} position-y={0.006} receiveShadow>
            <planeGeometry args={[STEPS.width, stepDepth - 0.06]} />
            <meshStandardMaterial color={i % 2 ? '#7a7e70' : '#73786a'} />
          </mesh>
          <mesh position={[0, 0.03, stepDepth / 2 - 0.02]}>
            <boxGeometry args={[STEPS.width, 0.06, 0.05]} />
            <meshStandardMaterial color="#4a6a3c" />
          </mesh>
        </group>
      ))}
      {/* The landing slab at the water's edge */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.005, (STEPS.fromZ + maxZ) / 2]} receiveShadow>
        <planeGeometry args={[maxX - minX, maxZ - STEPS.fromZ]} />
        <meshStandardMaterial color="#6f7468" />
      </mesh>
      {/* Its edge, seen from the camera */}
      <mesh position={[0, -0.18, maxZ - 0.02]}>
        <boxGeometry args={[maxX - minX, 0.36, 0.05]} />
        <meshStandardMaterial color="#4c5244" />
      </mesh>
    </group>
  );
}

/** Ah Hock's blue longboat, nosed in against the landing. */
function Longboat() {
  return (
    <group position={[-2.2, -0.3, LANDING_BOUNDS.maxZ + 0.9]}>
      <mesh position-y={0.15} castShadow>
        <boxGeometry args={[4.2, 0.4, 1.0]} />
        <meshStandardMaterial color="#3f7fb8" />
      </mesh>
      <mesh position={[0, 0.2, 0.51]}>
        <planeGeometry args={[4.2, 0.1]} />
        <meshStandardMaterial color="#e8e2d2" />
      </mesh>
      <mesh position={[2.35, 0.15, 0]} rotation-y={Math.PI / 4}>
        <boxGeometry args={[0.7, 0.4, 0.7]} />
        <meshStandardMaterial color="#3f7fb8" />
      </mesh>
      {/* Outboard motor */}
      <mesh position={[-2.25, 0.45, 0]}>
        <boxGeometry args={[0.35, 0.5, 0.3]} />
        <meshStandardMaterial color="#2a2a2e" />
      </mesh>
    </group>
  );
}

/** The cliff at the back of the terrace, hung with vines. */
function Cliff() {
  const z = LANDING_BOUNDS.minZ;
  return (
    <group>
      <mesh position={[0, CLIFF_HEIGHT / 2, z - 0.4]} receiveShadow>
        <boxGeometry args={[16, CLIFF_HEIGHT, 0.8]} />
        <meshStandardMaterial color="#5a6052" />
      </mesh>
      {/* Moss along the top and vines down the face */}
      <mesh position={[0, CLIFF_HEIGHT, z - 0.3]}>
        <boxGeometry args={[16.2, 0.3, 1.0]} />
        <meshStandardMaterial color="#3e5a32" />
      </mesh>
      {[-6.2, -4.6, -2.4, 2.6, 4.1, 5.8].map((x, i) => (
        <mesh key={x} position={[x, CLIFF_HEIGHT - 0.9 - (i % 2) * 0.4, z + 0.01]}>
          <planeGeometry args={[0.12, 1.8 + (i % 3) * 0.4]} />
          <meshStandardMaterial color="#3a6a34" />
        </mesh>
      ))}
    </group>
  );
}

/** The door slab: sinks into the ground once the stones are woken. */
function SealedDoor() {
  const open = useGame((s) => !!s.flags.c2_stones_woken);
  const slab = useRef<THREE.Group>(null);
  const glow = useRef<THREE.PointLight>(null);
  useFrame((_, dt) => {
    if (!slab.current) return;
    const target = open ? -DOOR.height - 0.1 : 0;
    slab.current.position.y += (target - slab.current.position.y) * Math.min(1, dt * 1.2);
    if (glow.current) glow.current.intensity = open ? 2.5 : 0;
  });
  const z = LANDING_BOUNDS.minZ + 0.02;
  return (
    <group position={[DOOR.x, 0, z]}>
      {/* Carved frame and the darkness behind */}
      <mesh position={[0, DOOR.height / 2 + 0.15, -0.02]}>
        <boxGeometry args={[DOOR.width + 0.6, DOOR.height + 0.4, 0.12]} />
        <meshStandardMaterial color="#7a7c6c" />
      </mesh>
      <mesh position={[0, DOOR.height / 2, 0.05]}>
        <planeGeometry args={[DOOR.width, DOOR.height]} />
        <meshBasicMaterial color="#080a08" />
      </mesh>
      <pointLight ref={glow} position={[0, 1.4, 0.6]} color="#a8e8ff" intensity={0} distance={4} />
      <group ref={slab}>
        <mesh position={[0, DOOR.height / 2, 0.1]} castShadow>
          <boxGeometry args={[DOOR.width, DOOR.height, 0.1]} />
          <meshStandardMaterial color="#6a6e60" />
        </mesh>
        <mesh position={[0, DOOR.height * 0.6, 0.16]}>
          <planeGeometry args={[0.8, 0.8]} />
          <meshBasicMaterial map={getInsigniaTexture(open ? '#a8e8ff' : '#4a5048')} transparent alphaTest={0.3} toneMapped={false} />
        </mesh>
      </group>
    </group>
  );
}

/** A standing stone with the sword-and-river sign; glows once woken. */
function StandingStone({ id }: { id: StoneId }) {
  const lit = useGame((s) => {
    const f = s.flags;
    if (f.c2_stones_woken) return true;
    return id === 'deep' ? !!f.c2_stone_deep : id === 'bright' ? !!f.c2_stone_bright : false;
  });
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (light.current) light.current.intensity = lit ? 2.2 + Math.sin(clock.elapsedTime * 2 + id.length) * 0.4 : 0;
  });
  const at = STONES[id];
  // The stone that waits is turned towards the door.
  const rotation = id === 'waits' ? Math.PI * 0.8 : 0;
  return (
    <group position={[at.x, 0, at.z]}>
      {id === 'deep' && (
        // The pool it stands in
        <mesh rotation-x={-Math.PI / 2} position-y={0.012}>
          <circleGeometry args={[0.95, 24]} />
          <meshStandardMaterial color="#2c5a60" emissive="#1a6a70" emissiveIntensity={0.25} roughness={0.2} />
        </mesh>
      )}
      <group rotation-y={rotation}>
        <mesh position-y={0.85} castShadow receiveShadow>
          <boxGeometry args={[0.62, 1.7, 0.42]} />
          <meshStandardMaterial color={id === 'deep' ? '#5c665e' : '#757a6c'} />
        </mesh>
        <mesh position={[0, 1.72, 0]}>
          <boxGeometry args={[0.66, 0.08, 0.46]} />
          <meshStandardMaterial color="#4a6a3c" />
        </mesh>
        <mesh position={[0, 1.05, 0.215]}>
          <planeGeometry args={[0.5, 0.5]} />
          <meshBasicMaterial
            map={getInsigniaTexture(lit ? GLOW[id] : '#4c5248')}
            transparent
            alphaTest={0.3}
            toneMapped={false}
          />
        </mesh>
      </group>
      <pointLight ref={light} position={[0, 1.2, 0.6]} color={GLOW[id]} intensity={0} distance={3.5} />
    </group>
  );
}

/** Threads of light through the moss, joining the lit stones and the door. */
function Grooves() {
  const deepBright = useGame((s) => !!s.flags.c2_stone_bright || !!s.flags.c2_stones_woken);
  const all = useGame((s) => !!s.flags.c2_stones_woken);
  const door = { x: DOOR.x, z: LANDING_BOUNDS.minZ + 0.2 };
  return (
    <group>
      {deepBright && <Groove from={STONES.deep} to={STONES.bright} color="#cfe8ff" />}
      {all && <Groove from={STONES.bright} to={STONES.waits} color="#cfe8ff" />}
      {all && <Groove from={STONES.waits} to={door} color="#a8e8ff" />}
    </group>
  );
}

function Groove({ from, to, color }: { from: { x: number; z: number }; to: { x: number; z: number }; color: string }) {
  const dx = to.x - from.x;
  const dz = to.z - from.z;
  const len = Math.hypot(dx, dz);
  return (
    <mesh
      rotation={[-Math.PI / 2, 0, Math.atan2(dz, dx) * -1]}
      position={[(from.x + to.x) / 2, 0.015, (from.z + to.z) / 2]}
    >
      <planeGeometry args={[len, 0.07]} />
      <meshBasicMaterial color={color} transparent opacity={0.8} toneMapped={false} />
    </mesh>
  );
}

/** The shaft of sunlight through the canopy onto the bright stone. */
function Sunbeam() {
  const at = STONES.bright;
  return (
    <group position={[at.x, 0, at.z]}>
      <mesh position={[0.3, 2.6, 0.1]} rotation-z={-0.12}>
        <cylinderGeometry args={[0.55, 0.95, 5.2, 16, 1, true]} />
        <meshBasicMaterial
          color="#fff2c0"
          transparent
          opacity={0.14}
          depthWrite={false}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
          toneMapped={false}
        />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position-y={0.013}>
        <circleGeometry args={[0.95, 24]} />
        <meshBasicMaterial color="#fff2c0" transparent opacity={0.22} depthWrite={false} toneMapped={false} />
      </mesh>
      <pointLight position={[0, 2.5, 0.3]} color="#fff0c0" intensity={2} distance={4} />
    </group>
  );
}

/** Trees and ferns crowding the edges of the terrace. */
function Jungle() {
  const trees: Array<[number, number, number]> = [
    [-6.9, -4.2, 1.2], [-7.2, -1.6, 1.0], [-6.8, 1.2, 1.3], [-7.4, 3.4, 0.9],
    [6.9, -4.0, 1.1], [7.3, -1.2, 1.3], [6.8, 0.9, 0.9], [7.2, 3.2, 1.2],
    [-3.6, -5.6, 0.9], [3.8, -5.7, 1.0],
  ];
  const ferns: Array<[number, number]> = [
    [-5.6, -4.4], [-5.7, 0.2], [-5.5, 2.4], [5.6, -2.6], [5.7, -0.2], [5.4, 1.4], [-1.9, 1.4], [1.9, 1.2], [-3.1, -4.6], [3.6, -4.6],
  ];
  return (
    <group>
      {trees.map(([x, z, s]) => (
        <group key={`${x},${z}`} position={[x, 0, z]} scale={s}>
          <mesh position-y={1.4} castShadow>
            <cylinderGeometry args={[0.16, 0.24, 2.8, 7]} />
            <meshStandardMaterial color="#4a3a2a" />
          </mesh>
          <mesh position-y={3.0} castShadow>
            <icosahedronGeometry args={[1.2, 0]} />
            <meshStandardMaterial color="#2f5a2c" flatShading />
          </mesh>
          <mesh position={[0.5, 2.5, 0.3]}>
            <icosahedronGeometry args={[0.8, 0]} />
            <meshStandardMaterial color="#3a6a32" flatShading />
          </mesh>
        </group>
      ))}
      {ferns.map(([x, z]) => (
        <mesh key={`${x},${z}`} position={[x, 0.22, z]}>
          <coneGeometry args={[0.32, 0.45, 6]} />
          <meshStandardMaterial color="#4a7a3a" flatShading />
        </mesh>
      ))}
    </group>
  );
}

/** The training spirit, standing in the open doorway until its test is passed. */
function Spirit() {
  const present = useGame((s) => !!s.flags.c2_stones_woken && !s.flags.c2_spirit_defeated);
  const body = useRef<THREE.Group>(null);
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    if (body.current) body.current.position.y = Math.sin(t * 1.6) * 0.05;
    if (light.current) light.current.intensity = 2 + Math.sin(t * 2.4) * 0.5;
  });
  if (!present) return null;
  return (
    <group position={[SPIRIT.x, 0, SPIRIT.z]}>
      <group ref={body}>
        <mesh position-y={SPIRIT_HEIGHT / 2}>
          <planeGeometry args={[SPIRIT_WIDTH, SPIRIT_HEIGHT]} />
          <meshBasicMaterial map={getSpiritTexture()} alphaTest={0.5} transparent opacity={0.92} toneMapped={false} />
        </mesh>
      </group>
      <pointLight ref={light} position={[0, SPIRIT_HEIGHT * 0.5, 0.8]} color="#9fe0ff" intensity={2} distance={4} />
    </group>
  );
}

const WARDEN_WIDTH = 2.0;
const WARDEN_HEIGHT = WARDEN_WIDTH * (SENTINEL_H / SENTINEL_W) * HEIGHT_COMP;

/** The Hollow Warden: on the steps once it climbs out of the river, a wreck in the shallows after. */
function Warden() {
  const seen = useGame((s) => !!s.flags.c2_warden_seen);
  const defeated = useGame((s) => !!s.flags.c2_warden_defeated);
  const flame = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (flame.current) flame.current.intensity = 1.6 + Math.sin(clock.elapsedTime * 3.1) * 0.5;
  });
  if (!seen) return null;

  if (defeated) {
    // Brass plates and ironwood limbs half-sunk at the water's edge.
    const pieces: [number, number, number, number, string][] = [
      [-0.6, 0.0, 0.8, 0.5, '#5f8a6a'],
      [0.3, 0.2, 0.6, -0.4, '#2a2a1e'],
      [0.8, -0.1, 0.5, 1.2, '#8fb890'],
    ];
    return (
      <group position={[WARDEN.x, -0.15, LANDING_BOUNDS.maxZ + 0.6]}>
        {pieces.map(([x, z, len, rot, color], i) => (
          <mesh key={i} position={[x, 0, z]} rotation-y={rot}>
            <boxGeometry args={[len, 0.2, 0.25]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.7} />
          </mesh>
        ))}
      </group>
    );
  }

  return (
    <group position={[WARDEN.x, 0, WARDEN.z]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0.1]}>
        <circleGeometry args={[0.7, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.45} depthWrite={false} />
      </mesh>
      <mesh position-y={WARDEN_HEIGHT / 2}>
        <planeGeometry args={[WARDEN_WIDTH, WARDEN_HEIGHT]} />
        <meshBasicMaterial map={getWardenTexture()} alphaTest={0.5} toneMapped={false} />
      </mesh>
      <pointLight ref={flame} position={[0, WARDEN_HEIGHT * 0.45, 0.5]} color="#ffb060" intensity={1.6} distance={3.5} />
    </group>
  );
}
