/**
 * Chapter 3 — the Palace forecourt in the morning (lazy-loaded scene). An
 * invented palace: white walls and gold-tipped gates, clipped hedges, the Clerk
 * of Petitions' desk, and the river steps where the first ferry lands. The
 * Crowned Sentinel stands in the gateway once it has walked out; the gates swing
 * open at the end.
 */
import * as THREE from 'three';
import type { SpawnPoint } from '../../data/scenes';
import { CROWNED_H, CROWNED_W, getCrownedSentinelTexture } from '../../game/combat/crownedSentinelSprite';
import { CAMERA_PITCH_DEG } from '../../game/core/constants';
import { useGame } from '../../game/core/gameStore';
import { ExplorationRig } from '../../game/scenes/ExplorationRig';
import { GroundPatch } from '../../game/scenes/environment';
import { CLERK_DESK, GATE, GATE_BOUNDS, GATE_LAYOUT, HEDGES, SENTINEL_AT_GATE } from './palaceData';

const HEIGHT_COMP = 1 / Math.cos(THREE.MathUtils.degToRad(CAMERA_PITCH_DEG));
const SENTINEL_W = 2.0;
const SENTINEL_H = SENTINEL_W * (CROWNED_H / CROWNED_W) * HEIGHT_COMP;
const WALL_H = 2.4;
const WALL_Z = GATE_BOUNDS.minZ - 0.5;
const WHITE = '#efe9da';
const GOLD = '#c8a040';

export default function PalaceGate({ spawn }: { spawn: SpawnPoint }) {
  return (
    <>
      {/* Morning: a clear sky and warm low sun */}
      <color attach="background" args={['#a8cce8']} />
      <fog attach="fog" args={['#c4dcec', 34, 64]} />
      <hemisphereLight args={['#fff6e4', '#7a8a6a', 1.0]} />
      <directionalLight
        position={[8, 12, 7]}
        intensity={1.8}
        color="#fff0d4"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-14}
        shadow-camera-right={14}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />

      {/* Paved forecourt with lawn beyond, and the river steps to the south */}
      {/* Lawn up to the river steps (z 5.2), so the steps and the river show to the south */}
      <GroundPatch x={0} z={-10} width={60} depth={30.4} color="#7c9a5c" y={-0.01} />
      <GroundPatch x={0} z={0} width={19} depth={10} color="#ddd5c2" />
      <GroundPatch x={0} z={0} width={2.2} depth={10} color="#cfc5ae" y={0.005} />
      <RiverSteps />

      <ForecourtWall />
      <Gates />
      <Palace />
      {HEDGES.map((h, i) => (
        <mesh key={i} position={[h.x, 0.45, h.z]} castShadow receiveShadow>
          <boxGeometry args={[h.width, 0.9, h.depth]} />
          <meshStandardMaterial color="#3f6a34" />
        </mesh>
      ))}
      {[-4.2, 4.2].map((x) => (
        <Pennant key={x} x={x} />
      ))}
      <ClerkDesk />
      <Sentinel />

      <ExplorationRig layout={GATE_LAYOUT} spawn={spawn} />
    </>
  );
}

function ForecourtWall() {
  const half = GATE.width / 2;
  const segments: Array<[number, number]> = [
    [-14, -half],
    [half, 14],
  ];
  return (
    <group>
      {segments.map(([a, b]) => (
        <group key={a}>
          <mesh position={[(a + b) / 2, WALL_H / 2, WALL_Z]} castShadow receiveShadow>
            <boxGeometry args={[b - a, WALL_H, 0.5]} />
            <meshStandardMaterial color={WHITE} />
          </mesh>
          <mesh position={[(a + b) / 2, WALL_H + 0.06, WALL_Z]}>
            <boxGeometry args={[b - a, 0.12, 0.6]} />
            <meshStandardMaterial color={GOLD} metalness={0.4} roughness={0.5} />
          </mesh>
        </group>
      ))}
      {/* Gateposts topped with gold finials */}
      {[-half - 0.25, half + 0.25].map((x) => (
        <group key={x} position={[x, 0, WALL_Z]}>
          <mesh position-y={1.6} castShadow>
            <boxGeometry args={[0.6, 3.2, 0.7]} />
            <meshStandardMaterial color={WHITE} />
          </mesh>
          <mesh position-y={3.4}>
            <sphereGeometry args={[0.22, 10, 8]} />
            <meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Two iron gate leaves tipped with gold; they stand open once the petitioners hold them. */
function Gates() {
  const open = useGame((s) => !!s.flags.c3_gate_open || (!!s.flags.c3_sentinel_woken && !s.flags.c3_sentinel_withdrew));
  const leaf = GATE.width / 2;
  return (
    <group>
      {[-1, 1].map((side) => (
        // Each leaf hinges at its gatepost and swings north, into the Palace grounds
        <group key={side} position={[side * leaf, 0, WALL_Z]} rotation-y={open ? side * -1.35 : 0}>
          <group position={[-side * leaf / 2, 0, 0]}>
            {Array.from({ length: 6 }, (_, i) => (
              <group key={i} position={[(i - 2.5) * (leaf / 6), 0, 0]}>
                <mesh position-y={1.3}>
                  <boxGeometry args={[0.05, 2.6, 0.05]} />
                  <meshStandardMaterial color="#2a2a30" metalness={0.6} roughness={0.5} />
                </mesh>
                <mesh position-y={2.66}>
                  <coneGeometry args={[0.06, 0.16, 6]} />
                  <meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.4} />
                </mesh>
              </group>
            ))}
            {[0.4, 1.4, 2.4].map((y) => (
              <mesh key={y} position-y={y}>
                <boxGeometry args={[leaf, 0.06, 0.06]} />
                <meshStandardMaterial color="#2a2a30" metalness={0.6} roughness={0.5} />
              </mesh>
            ))}
          </group>
        </group>
      ))}
    </group>
  );
}

/** The Palace beyond the wall: a long white front, arched windows and a gold dome. */
function Palace() {
  return (
    <group position={[0, 0, -12]}>
      <mesh position-y={2.6} castShadow>
        <boxGeometry args={[22, 5.2, 5]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      <mesh position-y={5.35}>
        <boxGeometry args={[22.6, 0.3, 5.4]} />
        <meshStandardMaterial color="#8a3a2a" />
      </mesh>
      {Array.from({ length: 9 }, (_, i) => (
        <group key={i} position={[-9 + i * 2.25, 0, 2.51]}>
          {[1.4, 3.6].map((y) => (
            <mesh key={y} position-y={y}>
              <planeGeometry args={[0.7, 1.2]} />
              <meshStandardMaterial color="#3a4658" />
            </mesh>
          ))}
        </group>
      ))}
      {/* Central tower and dome */}
      <mesh position={[0, 6.2, 0.4]} castShadow>
        <boxGeometry args={[3.2, 2.6, 3.2]} />
        <meshStandardMaterial color={WHITE} />
      </mesh>
      <mesh position={[0, 7.5, 0.4]}>
        <sphereGeometry args={[1.5, 16, 10, 0, Math.PI * 2, 0, Math.PI / 2]} />
        <meshStandardMaterial color={GOLD} metalness={0.5} roughness={0.35} />
      </mesh>
    </group>
  );
}

/** A tall pole with a plain blue-and-gold pennant (an invented banner). */
function Pennant({ x }: { x: number }) {
  return (
    <group position={[x, 0, WALL_Z - 0.5]}>
      <mesh position-y={2.4}>
        <cylinderGeometry args={[0.04, 0.05, 4.8, 6]} />
        <meshStandardMaterial color="#d8d4cc" metalness={0.4} />
      </mesh>
      <mesh position={[0.45, 4.3, 0]}>
        <planeGeometry args={[0.9, 0.5]} />
        <meshStandardMaterial color="#2a3f7a" side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0.45, 4.3, 0.01]}>
        <planeGeometry args={[0.9, 0.08]} />
        <meshStandardMaterial color={GOLD} side={THREE.DoubleSide} />
      </mesh>
    </group>
  );
}

function ClerkDesk() {
  return (
    <group position={[CLERK_DESK.x, 0, CLERK_DESK.z]}>
      <mesh position-y={0.38} castShadow receiveShadow>
        <boxGeometry args={[CLERK_DESK.width, 0.76, CLERK_DESK.depth]} />
        <meshStandardMaterial color="#6a4228" />
      </mesh>
      {/* The register, open: "the size of a door" */}
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.77, 0]}>
        <planeGeometry args={[1.1, 0.5]} />
        <meshStandardMaterial color="#f4eedc" />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.772, 0]}>
        <planeGeometry args={[0.03, 0.5]} />
        <meshStandardMaterial color="#8a6a3a" />
      </mesh>
      {/* Ink pot and pen */}
      <mesh position={[0.6, 0.82, -0.15]}>
        <cylinderGeometry args={[0.05, 0.05, 0.08, 8]} />
        <meshStandardMaterial color="#1a1a2a" />
      </mesh>
    </group>
  );
}

/** Stone steps down to the river, where the petitioners' ferry lands. */
function RiverSteps() {
  return (
    <group position={[0, 0, GATE_BOUNDS.maxZ + 0.6]}>
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, -0.12 - i * 0.14, i * 0.45]} receiveShadow>
          <boxGeometry args={[8, 0.14, 0.45]} />
          <meshStandardMaterial color={i % 2 ? '#c8c0ac' : '#d4ccb8'} />
        </mesh>
      ))}
      {/* The river runs right up under the steps */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.5, 4]}>
        <planeGeometry args={[80, 14]} />
        <meshStandardMaterial color="#5a7a74" roughness={0.3} />
      </mesh>
    </group>
  );
}

/** The Crowned Sentinel in the gateway, between walking out and withdrawing. */
function Sentinel() {
  const here = useGame((s) => !!s.flags.c3_sentinel_woken && !s.flags.c3_sentinel_withdrew);
  if (!here) return null;
  return (
    <group position={[SENTINEL_AT_GATE.x, 0, SENTINEL_AT_GATE.z]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 0.1]}>
        <circleGeometry args={[0.7, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.4} depthWrite={false} />
      </mesh>
      <mesh position-y={SENTINEL_H / 2}>
        <planeGeometry args={[SENTINEL_W, SENTINEL_H]} />
        <meshBasicMaterial map={getCrownedSentinelTexture(true)} alphaTest={0.5} toneMapped={false} />
      </mesh>
    </group>
  );
}
