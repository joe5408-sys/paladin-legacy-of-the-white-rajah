/**
 * Chapter 3 — the small room above Kak Jamilah's stall (lazy-loaded scene).
 * Plank floor, a low table with the Archivist's note, two sleeping mats, an oil
 * lamp, and a window onto the Palace lit across the river.
 */
import type { SpawnPoint } from '../../data/scenes';
import { ExplorationRig } from '../../game/scenes/ExplorationRig';
import { useGame } from '../../game/core/gameStore';
import { ROOM_BOUNDS, ROOM_LAYOUT, ROOM_TABLE } from './kuchingData';

const WALL_H = 2.4;

export default function JamilahRoom({ spawn }: { spawn: SpawnPoint }) {
  const { minX, maxX, minZ, maxZ } = ROOM_BOUNDS;
  const w = maxX - minX + 0.6;
  const d = maxZ - minZ + 0.6;
  return (
    <>
      <color attach="background" args={['#0c0a0a']} />
      <hemisphereLight args={['#ffe2c0', '#2a2018', 0.45]} />
      {/* The oil lamp on the table */}
      <pointLight position={[ROOM_TABLE.x + 0.4, 1.0, ROOM_TABLE.z]} color="#ffbe70" intensity={9} distance={7} decay={1.4} castShadow />

      {/* Plank floor */}
      {Array.from({ length: Math.ceil(d / 0.4) }, (_, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[0, 0, minZ - 0.3 + 0.2 + i * 0.4]} receiveShadow>
          <planeGeometry args={[w, 0.38]} />
          <meshStandardMaterial color={i % 2 ? '#7a5a3c' : '#6e5034'} />
        </mesh>
      ))}

      {/* Back (north) wall with the window, and the side walls */}
      <mesh position={[0, WALL_H / 2, minZ - 0.3]}>
        <boxGeometry args={[w, WALL_H, 0.12]} />
        <meshStandardMaterial color="#c9b48e" />
      </mesh>
      {[minX - 0.3, maxX + 0.3].map((x) => (
        <mesh key={x} position={[x, WALL_H / 2, 0]}>
          <boxGeometry args={[0.12, WALL_H, d]} />
          <meshStandardMaterial color="#bba57e" />
        </mesh>
      ))}
      <Window z={minZ - 0.23} />
      {/* Old newspapers pasted on the west wall */}
      {[-0.8, 0.1, 0.9].map((z, i) => (
        <mesh key={z} position={[minX - 0.23, 1.3 + (i % 2) * 0.2, z]} rotation-y={Math.PI / 2}>
          <planeGeometry args={[0.6, 0.8]} />
          <meshStandardMaterial color="#d8d0b8" />
        </mesh>
      ))}

      {/* Low table, the oil lamp and the note */}
      <group position={[ROOM_TABLE.x, 0, ROOM_TABLE.z]}>
        <mesh position-y={0.32} castShadow receiveShadow>
          <boxGeometry args={[ROOM_TABLE.width, 0.08, ROOM_TABLE.depth]} />
          <meshStandardMaterial color="#5a3a24" />
        </mesh>
        {[-0.6, 0.6].flatMap((x) =>
          [-0.3, 0.3].map((z) => (
            <mesh key={`${x}${z}`} position={[x, 0.14, z]}>
              <boxGeometry args={[0.07, 0.28, 0.07]} />
              <meshStandardMaterial color="#4a2e1c" />
            </mesh>
          )),
        )}
        <mesh position={[0.4, 0.46, 0]}>
          <cylinderGeometry args={[0.06, 0.08, 0.2, 8]} />
          <meshBasicMaterial color="#ffd08a" toneMapped={false} />
        </mesh>
        <Note />
      </group>

      {/* Two sleeping mats along the side walls */}
      {[minX + 0.6, maxX - 0.6].map((x) => (
        <mesh key={x} rotation-x={-Math.PI / 2} position={[x, 0.01, 0.9]}>
          <planeGeometry args={[0.8, 1.6]} />
          <meshStandardMaterial color="#8a3a3a" />
        </mesh>
      ))}

      <ExplorationRig layout={ROOM_LAYOUT} spawn={spawn} />
    </>
  );
}

/** A window onto the river, with the Palace's lights across the water. */
function Window({ z }: { z: number }) {
  return (
    <group position={[0, 1.4, z]}>
      <mesh>
        <planeGeometry args={[1.5, 0.9]} />
        <meshBasicMaterial color="#0e1630" />
      </mesh>
      {/* The Palace: a pale block with gold windows, low on the far bank */}
      <mesh position={[0.1, -0.22, 0.005]}>
        <planeGeometry args={[0.7, 0.18]} />
        <meshBasicMaterial color="#e8e2cc" toneMapped={false} />
      </mesh>
      {[-0.16, 0, 0.16, 0.32].map((x) => (
        <mesh key={x} position={[x + 0.02, -0.22, 0.01]}>
          <planeGeometry args={[0.05, 0.06]} />
          <meshBasicMaterial color="#ffc860" toneMapped={false} />
        </mesh>
      ))}
      {/* Frame and cross-bars */}
      {[
        [0, 0.47, 1.6, 0.06],
        [0, -0.47, 1.6, 0.06],
        [-0.77, 0, 0.06, 1.0],
        [0.77, 0, 0.06, 1.0],
        [0, 0, 0.04, 0.9],
      ].map(([x, y, fw, fh], i) => (
        <mesh key={i} position={[x, y, 0.02]}>
          <planeGeometry args={[fw, fh]} />
          <meshStandardMaterial color="#4a3020" />
        </mesh>
      ))}
    </group>
  );
}

/** The Archivist's folded note; it lies open once read. */
function Note() {
  const read = useGame((s) => !!s.flags.c3_read_note);
  return (
    <mesh rotation-x={-Math.PI / 2} position={[-0.25, 0.365, 0.12]}>
      <planeGeometry args={read ? [0.3, 0.38] : [0.22, 0.16]} />
      <meshStandardMaterial color="#f4efe0" />
    </mesh>
  );
}
