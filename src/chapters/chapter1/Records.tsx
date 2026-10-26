/**
 * Chapter 1 — the sealed records room behind the vault (lazy-loaded scene).
 * Shelves of tin record boxes, a reading table with the VALE box, and an old
 * flood door down to the river. When the lights go out, only the Archivist's
 * lantern and the officers' torchlight from the vault remain.
 */
import { useFrame } from '@react-three/fiber';
import { useRef, type ReactElement } from 'react';
import * as THREE from 'three';
import type { SpawnPoint } from '../../data/scenes';
import { useGame } from '../../game/core/gameStore';
import { ExplorationRig } from '../../game/scenes/ExplorationRig';
import {
  BOX_SHELVES,
  FLOOD_DOOR,
  READING_TABLE,
  RECORDS_LAYOUT,
  RECORDS_ROOM,
  RECORDS_WALL_HEIGHT,
  type BoxShelf,
} from './recordsData';

const T = 0.3; // wall thickness
const LAMPS = [
  { x: 0, z: -0.6 },
  { x: -2.2, z: 1.2 },
  { x: 2.2, z: -2.2 },
];

export default function Records({ spawn }: { spawn: SpawnPoint }) {
  const { minX, maxX, minZ, maxZ } = RECORDS_ROOM;
  const w = maxX - minX;
  const d = maxZ - minZ;
  const H = RECORDS_WALL_HEIGHT;

  return (
    <>
      <color attach="background" args={['#060505']} />
      <Lighting />

      <Floor />
      <mesh position={[0, H / 2, minZ - T / 2]} receiveShadow>
        <boxGeometry args={[w + 2 * T, H, T]} />
        <meshStandardMaterial color="#5a5248" />
      </mesh>
      {[minX - T / 2, maxX + T / 2].map((x) => (
        <mesh key={x} position={[x, H / 2, (minZ + maxZ) / 2]}>
          <boxGeometry args={[T, H, d + 2 * T]} />
          <meshStandardMaterial color="#4f483f" />
        </mesh>
      ))}
      {/* Low south wall with the open gate from the vault */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (0.8 + (w / 2 - 0.8 + T) / 2), 0.3, maxZ + T / 2]}>
          <boxGeometry args={[w / 2 - 0.8 + T, 0.6, T]} />
          <meshStandardMaterial color="#4f483f" />
        </mesh>
      ))}

      {BOX_SHELVES.map((s, i) => (
        <Shelf key={i} shelf={s} seed={i} />
      ))}
      <ReadingTable />
      <FloodDoor />

      <ExplorationRig layout={RECORDS_LAYOUT} spawn={spawn} />
    </>
  );
}

/** Room lights, which fade out when the lights go out. */
function Lighting() {
  const dark = useGame((s) => !!s.flags.c1_lights_out);
  const security = useGame((s) => !!s.flags.c1_security_arrived);
  const hemi = useRef<THREE.HemisphereLight>(null);
  const key = useRef<THREE.DirectionalLight>(null);
  const lamps = useRef<(THREE.PointLight | null)[]>([]);
  const bulbs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const lantern = useRef<THREE.PointLight>(null);
  const torch = useRef<THREE.PointLight>(null);
  const level = useRef(dark ? 0 : 1);

  useFrame(({ clock }, dt) => {
    level.current += ((dark ? 0 : 1) - level.current) * Math.min(1, dt * 6);
    const k = level.current;
    const t = clock.elapsedTime;
    if (hemi.current) hemi.current.intensity = 0.14 + 0.96 * k;
    if (key.current) key.current.intensity = 0.05 + 0.75 * k;
    lamps.current.forEach((l) => l && (l.intensity = 3.5 * k));
    bulbs.current.forEach((m) => m && m.color.setScalar(0.15 + 0.85 * k));
    if (lantern.current) lantern.current.intensity = dark ? 5 + Math.sin(t * 9) * 0.4 + Math.sin(t * 5) * 0.3 : 0;
    if (torch.current) torch.current.intensity = security ? 2.2 + Math.sin(t * 3) * 0.4 : 0;
  });

  return (
    <>
      <hemisphereLight ref={hemi} args={['#e6dccb', '#3a3028', 0.9]} />
      <directionalLight
        ref={key}
        position={[0, 9, 5]}
        intensity={0.8}
        color="#efe4d0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-6}
        shadow-camera-right={6}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />
      {/* Bare bulbs hanging from the ceiling */}
      {LAMPS.map((l, i) => (
        <group key={i} position={[l.x, 2.5, l.z]}>
          <mesh position-y={0.4}>
            <cylinderGeometry args={[0.01, 0.01, 0.8, 4]} />
            <meshBasicMaterial color="#1a1612" />
          </mesh>
          <mesh>
            <sphereGeometry args={[0.08, 8, 6]} />
            <meshBasicMaterial ref={(m) => void (bulbs.current[i] = m)} color="#ffe2a8" toneMapped={false} />
          </mesh>
          <pointLight ref={(p) => void (lamps.current[i] = p)} color="#ffd9a0" intensity={3.5} distance={5.5} />
        </group>
      ))}
      {/* The Archivist's lantern at the flood door, and torchlight from the vault */}
      <pointLight ref={lantern} position={[-2.1, 1.2, -3.1]} color="#ffb860" intensity={0} distance={7} />
      <pointLight ref={torch} position={[0, 1.6, 2.9]} color="#d8e6ff" intensity={0} distance={4.5} />
    </>
  );
}

function Floor() {
  const { minX, maxX, minZ, maxZ } = RECORDS_ROOM;
  const boards: ReactElement[] = [];
  // Old wooden floorboards running north–south
  for (let x = minX; x < maxX; x += 0.5) {
    const shade = ['#6b5440', '#634d3a', '#715a45'][Math.round((x - minX) * 2) % 3];
    boards.push(
      <mesh key={x} rotation-x={-Math.PI / 2} position={[x + 0.25, 0, (minZ + maxZ) / 2]} receiveShadow>
        <planeGeometry args={[0.48, maxZ - minZ]} />
        <meshStandardMaterial color={shade} />
      </mesh>,
    );
  }
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
        <planeGeometry args={[maxX - minX + 1, maxZ - minZ + 1]} />
        <meshStandardMaterial color="#1e1813" />
      </mesh>
      {boards}
    </group>
  );
}

const TIN = ['#6f7a6c', '#5f6a62', '#7a7468', '#687280'];

/** A wooden shelf unit stacked with tin record boxes. */
function Shelf({ shelf, seed }: { shelf: BoxShelf; seed: number }) {
  const along = shelf.sx > shelf.sz; // runs along x (back wall) or along z (side wall)
  const length = along ? shelf.sx : shelf.sz;
  const depth = along ? shelf.sz : shelf.sx;
  const height = 2.2;
  const rows = 4;
  const rowH = height / rows;
  // Which way the box fronts face (toward the middle of the room)
  const face = along ? 1 : shelf.x < 0 ? 1 : -1;
  const boxes: ReactElement[] = [];
  for (let r = 0; r < rows; r++) {
    const count = Math.floor(length / 0.42);
    for (let i = 0; i < count; i++) {
      if ((i * 7 + r * 3 + seed) % 9 === 0) continue; // a few gaps
      const u = -length / 2 + 0.25 + i * 0.42;
      const color = TIN[(i + r + seed) % TIN.length];
      const pos: [number, number, number] = along ? [u, 0.2 + r * rowH, 0] : [0, 0.2 + r * rowH, u];
      boxes.push(
        <group key={`${r}-${i}`} position={pos}>
          <mesh>
            <boxGeometry args={along ? [0.36, 0.3, depth * 0.8] : [depth * 0.8, 0.3, 0.36]} />
            <meshStandardMaterial color={color} metalness={0.3} roughness={0.6} />
          </mesh>
          {/* Stencilled label */}
          <mesh
            position={along ? [0, 0.02, (face * depth * 0.8) / 2 + 0.005] : [(face * depth * 0.8) / 2 + 0.005, 0.02, 0]}
            rotation-y={along ? 0 : (face * Math.PI) / 2}
          >
            <planeGeometry args={[0.2, 0.08]} />
            <meshStandardMaterial color="#d8d2c0" />
          </mesh>
        </group>,
      );
    }
  }
  return (
    <group position={[shelf.x, 0, shelf.z]}>
      {Array.from({ length: rows + 1 }, (_, r) => (
        <mesh key={r} position-y={0.04 + r * rowH} receiveShadow>
          <boxGeometry args={along ? [length, 0.05, depth] : [depth, 0.05, length]} />
          <meshStandardMaterial color="#4a3526" />
        </mesh>
      ))}
      {[-1, 1].map((e) => (
        <mesh key={e} position={along ? [(e * length) / 2, height / 2, 0] : [0, height / 2, (e * length) / 2]} castShadow>
          <boxGeometry args={[0.06, height, 0.06]} />
          <meshStandardMaterial color="#3a2a1e" />
        </mesh>
      ))}
      {boxes}
    </group>
  );
}

/** The reading table and the VALE box, which stands open once read. */
function ReadingTable() {
  const open = useGame((s) => !!s.flags.c1_box_read);
  return (
    <group position={[READING_TABLE.x, 0, READING_TABLE.z]}>
      <mesh position-y={0.75} castShadow receiveShadow>
        <boxGeometry args={[READING_TABLE.width, 0.07, READING_TABLE.depth]} />
        <meshStandardMaterial color="#5a3a24" />
      </mesh>
      {[-1, 1].flatMap((sx) =>
        [-1, 1].map((sz) => (
          <mesh key={`${sx}${sz}`} position={[sx * (READING_TABLE.width / 2 - 0.08), 0.37, sz * (READING_TABLE.depth / 2 - 0.08)]}>
            <boxGeometry args={[0.07, 0.74, 0.07]} />
            <meshStandardMaterial color="#4a2f1d" />
          </mesh>
        )),
      )}
      {/* The tin box */}
      <group position={[0, 0.79, 0.05]}>
        <mesh position-y={0.1} castShadow>
          <boxGeometry args={[0.5, 0.2, 0.34]} />
          <meshStandardMaterial color="#7a8478" metalness={0.4} roughness={0.5} />
        </mesh>
        <mesh position={[0, 0.1, 0.171]}>
          <planeGeometry args={[0.3, 0.09]} />
          <meshBasicMaterial color="#efe8d4" />
        </mesh>
        {/* Lid, hinged at the back */}
        <group position={[0, 0.2, -0.17]} rotation-x={open ? -1.9 : 0}>
          <mesh position={[0, 0.015, 0.17]}>
            <boxGeometry args={[0.52, 0.03, 0.36]} />
            <meshStandardMaterial color="#6a7468" metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
        {/* Wax seal, broken once read */}
        {!open && (
          <mesh position={[0.18, 0.21, 0.12]}>
            <cylinderGeometry args={[0.05, 0.05, 0.02, 10]} />
            <meshStandardMaterial color="#8a1f28" />
          </mesh>
        )}
        {open && (
          <mesh position={[-0.55, 0.01, 0.05]} rotation-y={0.25}>
            <boxGeometry args={[0.32, 0.02, 0.24]} />
            <meshStandardMaterial color="#e6dcc0" />
          </mesh>
        )}
      </group>
    </group>
  );
}

/** A low, rusted iron door in the north wall. It stands open in the dark. */
function FloodDoor() {
  const open = useGame((s) => !!s.flags.c1_lights_out);
  const z = RECORDS_ROOM.minZ + 0.02;
  return (
    <group position={[FLOOD_DOOR.x, 0, z]}>
      <mesh position={[0, FLOOD_DOOR.height / 2 + 0.08, 0.02]}>
        <boxGeometry args={[FLOOD_DOOR.width + 0.3, FLOOD_DOOR.height + 0.16, 0.08]} />
        <meshStandardMaterial color="#6e665a" />
      </mesh>
      {/* The opening: dark, with a hint of river light once open */}
      <mesh position={[0, FLOOD_DOOR.height / 2, 0.065]}>
        <planeGeometry args={[FLOOD_DOOR.width, FLOOD_DOOR.height]} />
        <meshBasicMaterial color={open ? '#0d1a22' : '#000000'} />
      </mesh>
      {open && <pointLight position={[0, 0.6, 0.4]} color="#6fa8c8" intensity={1.5} distance={2.5} />}
      {/* The iron door: shut against the wall, or swung open into the room */}
      <group position={[-FLOOD_DOOR.width / 2, 0, 0.1]} rotation-y={open ? 1.9 : 0}>
        <mesh position={[FLOOD_DOOR.width / 2, FLOOD_DOOR.height / 2, 0]} castShadow>
          <boxGeometry args={[FLOOD_DOOR.width, FLOOD_DOOR.height, 0.06]} />
          <meshStandardMaterial color="#4a5a4c" metalness={0.5} roughness={0.7} />
        </mesh>
        {[0.4, 1.0, 1.6].map((y) => (
          <mesh key={y} position={[FLOOD_DOOR.width / 2, y, 0.035]}>
            <boxGeometry args={[FLOOD_DOOR.width, 0.06, 0.02]} />
            <meshStandardMaterial color="#3a4438" metalness={0.5} />
          </mesh>
        ))}
      </group>
      {/* Brass plate: FLOOD DOOR */}
      <mesh position={[0, FLOOD_DOOR.height + 0.3, 0.07]}>
        <planeGeometry args={[0.6, 0.14]} />
        <meshStandardMaterial color="#b8893a" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}
