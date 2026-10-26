/**
 * Chapter 1 — inside the Royal Archives at dawn (lazy-loaded scene).
 * A tall reading hall: checkered floor, tall book stacks, the Archivist's desk,
 * high windows with shafts of morning light, and the sealed iron door.
 */
import { useFrame } from '@react-three/fiber';
import { useRef, type ReactElement } from 'react';
import * as THREE from 'three';
import type { SpawnPoint } from '../../data/scenes';
import { useGame } from '../../game/core/gameStore';
import { ExplorationRig } from '../../game/scenes/ExplorationRig';
import { getInsigniaTexture } from '../../game/scenes/insignia';
import {
  ARCHIVE_ROOM,
  ARCHIVE_WALL_HEIGHT,
  ARCHIVES_LAYOUT,
  BACK_SHELVES,
  DESK,
  SHELF_DEPTH,
  SHELF_HEIGHT,
  SHELVES,
  VAULT_DOOR,
} from './archivesData';

const T = 0.3; // wall thickness

export default function Archives({ spawn }: { spawn: SpawnPoint }) {
  const { minX, maxX, minZ, maxZ } = ARCHIVE_ROOM;
  const w = maxX - minX;
  const d = maxZ - minZ;
  const H = ARCHIVE_WALL_HEIGHT;

  return (
    <>
      <color attach="background" args={['#0f0c0a']} />
      <hemisphereLight args={['#ffe9c8', '#3a3028', 0.75]} />
      {/* Dawn light through the north windows */}
      <directionalLight
        position={[-2, 9, -6]}
        intensity={1.4}
        color="#ffd9a8"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005}
      />
      {/* Soft fill from the reading-room side so book spines read clearly */}
      <directionalLight position={[2, 6, 10]} intensity={0.9} color="#ffe4c0" />
      {/* Desk lamp */}
      <pointLight position={[0.6, 1.4, DESK.z]} color="#ffcf8a" intensity={4} distance={5} />

      <CheckerFloor />

      {/* North wall with tall windows */}
      <mesh position={[0, H / 2, minZ - T / 2]} receiveShadow>
        <boxGeometry args={[w + 2 * T, H, T]} />
        <meshStandardMaterial color="#e7dcc4" />
      </mesh>
      {[-4.4, -2, 2, 4.4].map((x) => (
        <group key={x} position={[x, 3.1, minZ + 0.01]}>
          <mesh>
            <boxGeometry args={[1, 1.6, 0.04]} />
            <meshStandardMaterial color="#8a6a3c" />
          </mesh>
          <mesh position-z={0.02}>
            <planeGeometry args={[0.8, 1.4]} />
            <meshBasicMaterial color="#ffe6b8" toneMapped={false} />
          </mesh>
        </group>
      ))}
      <LightShafts />

      {/* Side walls: dark wood panelling */}
      {[minX - T / 2, maxX + T / 2].map((x) => (
        <mesh key={x} position={[x, H / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[T, H, d + 2 * T]} />
          <meshStandardMaterial color="#4a3324" />
        </mesh>
      ))}
      {/* Low front wall with the entrance gap */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (0.75 + (w / 2 - 0.75 + T) / 2), 0.3, maxZ + T / 2]}>
          <boxGeometry args={[w / 2 - 0.75 + T, 0.6, T]} />
          <meshStandardMaterial color="#4a3324" />
        </mesh>
      ))}

      {SHELVES.map((s) => (
        <Bookcase key={s.id} x={s.x} z={s.z} width={s.width} palette={s.palette} label />
      ))}
      {BACK_SHELVES.map((s, i) => (
        <Bookcase key={i} x={s.x} z={s.z} width={s.width} palette={['#5a4630', '#6b4a30', '#3f4a3a', '#7b5a34']} tall />
      ))}
      <Desk />
      <VaultDoor />

      <ExplorationRig layout={ARCHIVES_LAYOUT} spawn={spawn} />
    </>
  );
}

function CheckerFloor() {
  const { minX, maxX, minZ, maxZ } = ARCHIVE_ROOM;
  const tiles: ReactElement[] = [];
  for (let x = minX; x < maxX; x++) {
    for (let z = minZ; z < maxZ; z++) {
      tiles.push(
        <mesh key={`${x},${z}`} rotation-x={-Math.PI / 2} position={[x + 0.5, 0, z + 0.5]} receiveShadow>
          <planeGeometry args={[1, 1]} />
          <meshStandardMaterial color={(x + z) % 2 === 0 ? '#d9cfb8' : '#9a6f52'} />
        </mesh>,
      );
    }
  }
  return <group>{tiles}</group>;
}

/** Soft additive beams of dawn light falling from the windows. */
function LightShafts() {
  return (
    <group>
      {[-4.4, -2, 2, 4.4].map((x) => (
        <mesh key={x} position={[x + 0.4, 1.6, ARCHIVE_ROOM.minZ + 1.3]} rotation={[-0.75, 0, 0.12]}>
          <planeGeometry args={[0.9, 3.6]} />
          <meshBasicMaterial
            color="#ffe2a8"
            transparent
            opacity={0.08}
            depthWrite={false}
            blending={THREE.AdditiveBlending}
            side={THREE.DoubleSide}
            toneMapped={false}
          />
        </mesh>
      ))}
    </group>
  );
}

/** A tall wooden bookcase filled with rows of books. */
function Bookcase({
  x,
  z,
  width,
  palette,
  label,
  tall,
}: {
  x: number;
  z: number;
  width: number;
  palette: string[];
  label?: boolean;
  tall?: boolean;
}) {
  const height = tall ? SHELF_HEIGHT + 0.8 : SHELF_HEIGHT;
  const rows = tall ? 5 : 4;
  const rowH = (height - 0.2) / rows;
  const books: ReactElement[] = [];
  for (let r = 0; r < rows; r++) {
    let bx = -width / 2 + 0.12;
    let i = r * 7;
    while (bx < width / 2 - 0.2) {
      const bw = 0.09 + ((i * 37) % 5) * 0.025;
      const bh = rowH * (0.62 + ((i * 13) % 4) * 0.08);
      books.push(
        <mesh key={`${r}-${i}`} position={[bx + bw / 2, 0.12 + r * rowH + bh / 2, SHELF_DEPTH / 2 - 0.08]}>
          <boxGeometry args={[bw * 0.92, bh, 0.12]} />
          <meshStandardMaterial color={palette[i % palette.length]} />
        </mesh>,
      );
      bx += bw;
      i++;
    }
  }
  return (
    <group position={[x, 0, z]}>
      {/* Back panel and frame */}
      <mesh position-y={height / 2} castShadow receiveShadow>
        <boxGeometry args={[width, height, SHELF_DEPTH * 0.6]} />
        <meshStandardMaterial color="#4a3324" />
      </mesh>
      {Array.from({ length: rows + 1 }, (_, r) => (
        <mesh key={r} position={[0, 0.06 + r * rowH, 0.05]}>
          <boxGeometry args={[width, 0.06, SHELF_DEPTH]} />
          <meshStandardMaterial color="#5e4230" />
        </mesh>
      ))}
      {books}
      {/* Brass label plate */}
      {label && (
        <mesh position={[0, height + 0.08, SHELF_DEPTH / 2]}>
          <boxGeometry args={[0.7, 0.16, 0.03]} />
          <meshStandardMaterial color="#c9a24a" metalness={0.5} roughness={0.4} />
        </mesh>
      )}
    </group>
  );
}

function Desk() {
  return (
    <group position={[DESK.x, 0, DESK.z]}>
      <mesh position-y={0.75} castShadow receiveShadow>
        <boxGeometry args={[DESK.width, 0.08, DESK.depth]} />
        <meshStandardMaterial color="#4a2f1b" />
      </mesh>
      <mesh position-y={0.37}>
        <boxGeometry args={[DESK.width - 0.1, 0.72, DESK.depth - 0.1]} />
        <meshStandardMaterial color="#3d2716" />
      </mesh>
      {/* Green banker's lamp, papers and a ledger */}
      <mesh position={[0.6, 0.95, -0.1]}>
        <cylinderGeometry args={[0.16, 0.16, 0.08, 10, 1, false, 0, Math.PI]} />
        <meshStandardMaterial color="#2f6b4a" emissive="#ffcf8a" emissiveIntensity={0.3} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[-0.35, 0.81, 0.05]} rotation-y={0.2}>
        <boxGeometry args={[0.45, 0.04, 0.3]} />
        <meshStandardMaterial color="#efe6d0" />
      </mesh>
      <mesh position={[0.05, 0.84, 0.1]} rotation-y={-0.15}>
        <boxGeometry args={[0.35, 0.1, 0.25]} />
        <meshStandardMaterial color="#7b2f3b" />
      </mesh>
    </group>
  );
}

/** The sealed iron door on the north wall. Its sign glows once the Vale file is found. */
function VaultDoor() {
  const fileFound = useGame((s) => !!s.flags.c1_file_found);
  const awake = useGame((s) => !!s.flags.c1_vault_found);
  const sign = useRef<THREE.MeshBasicMaterial>(null);
  const light = useRef<THREE.PointLight>(null);

  useFrame(({ clock }) => {
    const pulse = 0.5 + Math.sin(clock.elapsedTime * (awake ? 4 : 1.6)) * 0.5;
    const level = awake ? 0.75 + pulse * 0.25 : fileFound ? 0.25 + pulse * 0.2 : 0.12;
    if (sign.current) sign.current.opacity = level;
    if (light.current) light.current.intensity = awake ? 4 + pulse * 4 : fileFound ? 1 + pulse : 0;
  });

  const z = ARCHIVE_ROOM.minZ + 0.02;
  return (
    <group position={[VAULT_DOOR.x, 0, z]}>
      {/* Stone frame */}
      <mesh position={[0, VAULT_DOOR.height / 2 + 0.1, 0.05]}>
        <boxGeometry args={[VAULT_DOOR.width + 0.5, VAULT_DOOR.height + 0.3, 0.12]} />
        <meshStandardMaterial color="#8a8478" />
      </mesh>
      {/* Iron door with rivets */}
      <mesh position={[0, VAULT_DOOR.height / 2, 0.13]} castShadow>
        <boxGeometry args={[VAULT_DOOR.width, VAULT_DOOR.height, 0.08]} />
        <meshStandardMaterial color="#2a2c30" metalness={0.6} roughness={0.5} />
      </mesh>
      {[-0.8, 0.8].flatMap((rx) =>
        [0.3, 1.0, 1.7, 2.4].map((ry) => (
          <mesh key={`${rx}${ry}`} position={[rx, ry, 0.18]}>
            <sphereGeometry args={[0.04, 6, 4]} />
            <meshStandardMaterial color="#4a4c52" metalness={0.7} />
          </mesh>
        )),
      )}
      {/* The carved Paladin sign */}
      <mesh position={[0, 1.6, 0.18]}>
        <planeGeometry args={[1.3, 1.3]} />
        <meshBasicMaterial
          ref={sign}
          map={getInsigniaTexture('#ffe08a')}
          transparent
          opacity={0.12}
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight ref={light} position={[0, 1.6, 0.9]} color="#ffd27a" intensity={0} distance={5} />
    </group>
  );
}
