/**
 * Chapter 3 — the audience hall (lazy-loaded scene). An invented palace
 * interior: white walls and columns, tall windows with morning light, a red
 * carpet to a gilded throne on a dais, blue-and-gold banners, benches for the
 * petitioners, the Clerk's desk and the gold petitioner's circle. The Crowned
 * Sentinel stands beside the throne, still as a statue.
 */
import * as THREE from 'three';
import type { SpawnPoint } from '../../data/scenes';
import { CROWNED_H, CROWNED_W, getCrownedSentinelTexture } from '../../game/combat/crownedSentinelSprite';
import { CAMERA_PITCH_DEG } from '../../game/core/constants';
import { ExplorationRig } from '../../game/scenes/ExplorationRig';
import { BENCHES, CLERK_DESK3, DAIS, HALL3_BOUNDS, HALL3_LAYOUT, HALL_SENTINEL, MARK, THRONE } from './audienceData';

const HEIGHT_COMP = 1 / Math.cos(THREE.MathUtils.degToRad(CAMERA_PITCH_DEG));
const SENTINEL_W = 2.0;
const SENTINEL_H = SENTINEL_W * (CROWNED_H / CROWNED_W) * HEIGHT_COMP;
const WALL_H = 4.2;
const WHITE = '#efe9da';
const GOLD = '#c8a040';
const { minX, maxX, minZ, maxZ } = HALL3_BOUNDS;
const W = maxX - minX + 1.2;
const D = maxZ - minZ + 1.2;
const CZ = (minZ + maxZ) / 2;

export default function AudienceHall({ spawn }: { spawn: SpawnPoint }) {
  return (
    <>
      <color attach="background" args={['#120f0c']} />
      <hemisphereLight args={['#fff6e4', '#5a4a3a', 0.85]} />
      {/* Morning light through the east windows */}
      <directionalLight
        position={[8, 9, 2]}
        intensity={1.4}
        color="#fff0d0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-9}
        shadow-camera-right={9}
        shadow-camera-top={8}
        shadow-camera-bottom={-8}
        shadow-bias={-0.0005}
      />
      <pointLight position={[THRONE.x, 2.6, THRONE.z + 1.2]} color="#ffe2a0" intensity={6} distance={6} />

      <Floor />
      <Walls />
      <Dais />
      {BENCHES.map((b, i) => (
        <group key={i} position={[b.x, 0, b.z]}>
          <mesh position-y={0.4} castShadow receiveShadow>
            <boxGeometry args={[b.width, 0.1, b.depth]} />
            <meshStandardMaterial color="#6a3e24" />
          </mesh>
          {[-1, 1].map((s) => (
            <mesh key={s} position={[s * (b.width / 2 - 0.15), 0.2, 0]}>
              <boxGeometry args={[0.1, 0.4, b.depth - 0.06]} />
              <meshStandardMaterial color="#4a2a18" />
            </mesh>
          ))}
        </group>
      ))}
      <group position={[CLERK_DESK3.x, 0, CLERK_DESK3.z]}>
        <mesh position-y={0.38} castShadow>
          <boxGeometry args={[CLERK_DESK3.width, 0.76, CLERK_DESK3.depth]} />
          <meshStandardMaterial color="#6a4228" />
        </mesh>
        <mesh rotation-x={-Math.PI / 2} position={[0, 0.77, 0]}>
          <planeGeometry args={[0.9, 0.4]} />
          <meshStandardMaterial color="#f4eedc" />
        </mesh>
      </group>
      {/* The Crowned Sentinel beside the throne */}
      <group position={[HALL_SENTINEL.x, 0.12, HALL_SENTINEL.z]}>
        <mesh position-y={SENTINEL_H / 2}>
          <planeGeometry args={[SENTINEL_W, SENTINEL_H]} />
          <meshBasicMaterial map={getCrownedSentinelTexture(true)} alphaTest={0.5} toneMapped={false} />
        </mesh>
      </group>

      <ExplorationRig layout={HALL3_LAYOUT} spawn={spawn} />
    </>
  );
}

/** Pale stone floor, the red carpet up the middle, and the gold petitioner's circle. */
function Floor() {
  return (
    <group>
      {Array.from({ length: Math.ceil(W) }, (_, i) =>
        Array.from({ length: Math.ceil(D) }, (_, j) => (
          <mesh key={`${i}-${j}`} rotation-x={-Math.PI / 2} position={[minX - 0.6 + 0.5 + i, 0, minZ - 0.6 + 0.5 + j]} receiveShadow>
            <planeGeometry args={[0.98, 0.98]} />
            <meshStandardMaterial color={(i + j) % 2 ? '#e2dccd' : '#d6cfbd'} />
          </mesh>
        )),
      )}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.006, (MARK.z + maxZ + 0.6) / 2 - 1.2]} receiveShadow>
        <planeGeometry args={[1.5, maxZ + 0.6 - MARK.z + 2.4]} />
        <meshStandardMaterial color="#8a2a2a" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[MARK.x, 0.012, MARK.z]}>
        <ringGeometry args={[0.45, 0.6, 32]} />
        <meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

/** White walls with columns, tall windows on the east side and blue-and-gold banners. */
function Walls() {
  return (
    <group>
      <mesh position={[0, WALL_H / 2, minZ - 0.6]} receiveShadow>
        <boxGeometry args={[W, WALL_H, 0.2]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      {[minX - 0.6, maxX + 0.6].map((x) => (
        <mesh key={x} position={[x, WALL_H / 2, CZ]}>
          <boxGeometry args={[0.2, WALL_H, D]} />
          <meshStandardMaterial color={WHITE} />
        </mesh>
      ))}
      {/* Columns along both side walls */}
      {[minX - 0.25, maxX + 0.25].flatMap((x) =>
        [-3.6, -1.0, 1.6].map((z) => (
          <mesh key={`${x}${z}`} position={[x, WALL_H / 2, z]} castShadow>
            <cylinderGeometry args={[0.22, 0.26, WALL_H, 12]} />
            <meshStandardMaterial color="#f6f2e8" />
          </mesh>
        )),
      )}
      {/* Tall windows on the east wall, bright with morning */}
      {[-2.3, 0.3, 2.9].map((z) => (
        <mesh key={z} position={[maxX + 0.49, 2.2, z]} rotation-y={-Math.PI / 2}>
          <planeGeometry args={[1.0, 2.6]} />
          <meshBasicMaterial color="#fff6dc" toneMapped={false} />
        </mesh>
      ))}
      {/* Banners on the back wall either side of the throne */}
      {[-2.8, 2.8].map((x) => (
        <group key={x} position={[x, 2.4, minZ - 0.49]}>
          <mesh>
            <planeGeometry args={[0.9, 2.4]} />
            <meshStandardMaterial color="#2a3f7a" />
          </mesh>
          <mesh position={[0, -1.1, 0.005]}>
            <planeGeometry args={[0.9, 0.12]} />
            <meshStandardMaterial color={GOLD} />
          </mesh>
          <mesh position={[0, 0.5, 0.005]}>
            <circleGeometry args={[0.22, 16]} />
            <meshStandardMaterial color={GOLD} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** The dais with its steps, and the gilded throne. */
function Dais() {
  return (
    <group>
      {/* Kept low, so the Rajah (a sprite standing at floor level) isn't hidden by it */}
      <mesh position={[DAIS.x, 0.06, DAIS.z]} castShadow receiveShadow>
        <boxGeometry args={[DAIS.width, 0.12, DAIS.depth]} />
        <meshStandardMaterial color="#cfc6b0" />
      </mesh>
      <mesh position={[DAIS.x, 0.03, DAIS.z + DAIS.depth / 2 + 0.2]} receiveShadow>
        <boxGeometry args={[DAIS.width - 1, 0.06, 0.4]} />
        <meshStandardMaterial color="#d8d0bc" />
      </mesh>
      <group position={[THRONE.x, 0.12, THRONE.z - 0.35]}>
        <mesh position-y={1.1} castShadow>
          <boxGeometry args={[1.1, 2.2, 0.2]} />
          <meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.4} />
        </mesh>
        <mesh position={[0, 1.15, 0.11]}>
          <planeGeometry args={[0.8, 1.6]} />
          <meshStandardMaterial color="#8a2a2a" />
        </mesh>
        <mesh position-y={2.35}>
          <coneGeometry args={[0.18, 0.4, 6]} />
          <meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.4} />
        </mesh>
      </group>
    </group>
  );
}
