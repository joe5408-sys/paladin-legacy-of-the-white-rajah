/**
 * Chapter 1 — Kuching waterfront at dusk (lazy-loaded scene).
 * Reuses the low-poly building blocks from the prologue. Chapter 3 reuses it
 * before dawn (`WaterfrontScene` with its own layout, `time="night"` and extra props).
 */
import type { ReactNode } from 'react';
import type { SpawnPoint } from '../../data/scenes';
import type { SceneLayout } from '../../game/scenes/layout';
import type { PropDef } from '../../data/villageSquare';
import { ExplorationRig } from '../../game/scenes/ExplorationRig';
import { Boardwalk, Building, GroundPatch, Prop, River } from '../../game/scenes/environment';
import {
  ARCHIVES,
  BANDSTAND,
  PIER,
  STALL,
  WATERFRONT_LAYOUT,
  WF_BOARDWALK,
  WF_BUILDINGS,
  WF_PROPS,
  WF_RIVER,
} from './data';

/** Lamps and palms just beyond the south edge of the plaza (decoration only). */
const SOUTH_EDGE: PropDef[] = [
  { kind: 'palm', x: -9, z: 7.2 },
  { kind: 'lamp', x: -4.5, z: 6.7 },
  { kind: 'palm', x: 0, z: 7.3 },
  { kind: 'lamp', x: 4.5, z: 6.7 },
  { kind: 'palm', x: 9.5, z: 7.2 },
];

/** Decorative far-bank tree line: [x, z, scale]. */
const FAR_TREES: Array<[number, number, number]> = Array.from({ length: 16 }, (_, i) => {
  const x = -30 + i * 3.6 + ((i * 5) % 3) * 0.5;
  return [x, -15.5 - ((i * 3) % 3) * 0.8, 0.8 + ((i * 7) % 4) * 0.12];
});

/** Sky and moonlight: dusk (Chapter 1) or the dark hour before dawn (Chapter 3). */
const LIGHTING = {
  dusk: { sky: '#1b2140', fog: '#262b48', hemi: 0.6, moon: 0.8 },
  night: { sky: '#090d1c', fog: '#10152a', hemi: 0.42, moon: 0.55 },
} as const;

export default function Waterfront({ spawn }: { spawn: SpawnPoint }) {
  return <WaterfrontScene spawn={spawn} layout={WATERFRONT_LAYOUT} />;
}

/** The waterfront with any layout (people and interactions), lighting and extra props. */
export function WaterfrontScene({
  spawn,
  layout,
  time = 'dusk',
  children,
}: {
  spawn: SpawnPoint;
  layout: SceneLayout;
  time?: keyof typeof LIGHTING;
  children?: ReactNode;
}) {
  const L = LIGHTING[time];
  return (
    <>
      {/* Deep blue sky, cool moonlight, warm lamps and windows */}
      <color attach="background" args={[L.sky]} />
      <fog attach="fog" args={[L.fog, 32, 60]} />
      <hemisphereLight args={['#8fa3d8', '#2b2a3a', L.hemi]} />
      <directionalLight
        position={[6, 14, 6]}
        intensity={L.moon}
        color="#b8c8ff"
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-left={-17}
        shadow-camera-right={17}
        shadow-camera-top={12}
        shadow-camera-bottom={-12}
        shadow-camera-near={1}
        shadow-camera-far={40}
        shadow-bias={-0.0005}
        shadow-normalBias={0.02}
      />
      {/* Lamp and stall glow (a few point lights only, for performance) */}
      <pointLight position={[3.4, 2.2, -4.2]} color="#ffc36b" intensity={6} distance={7} />
      <pointLight position={[12.2, 2.2, -4.2]} color="#ffc36b" intensity={6} distance={7} />
      <pointLight position={[-7.4, 2.2, 0.5]} color="#ffc36b" intensity={6} distance={7} />
      <pointLight position={[STALL.x, 2, STALL.z + 0.3]} color="#ffb060" intensity={5} distance={5} />

      {/* Ground: paved promenade, grass verges, the river beyond the boardwalk */}
      <GroundPatch x={0} z={4} width={60} depth={20.4} color="#5d6b4f" y={0} />
      <GroundPatch x={0} z={1.5} width={28} depth={7} color="#8f8a80" />
      <GroundPatch x={7.5} z={-4} width={13} depth={1.6} color="#8f8a80" />
      <GroundPatch x={0} z={-20} width={80} depth={20} color="#26402f" y={-0.1} />
      <River {...WF_RIVER} />
      <Boardwalk {...WF_BOARDWALK} />
      <Pier />
      <Sampan x={11.6} z={-7.4} />

      {WF_BUILDINGS.map((b) => (
        <Building key={b.id} def={b} />
      ))}
      <ArchivesColumns />
      {WF_PROPS.map((p, i) => (
        <Prop key={i} def={p} />
      ))}
      {/* Decoration along the south edge of the plaza (outside the walkable area) */}
      {SOUTH_EDGE.map((p, i) => (
        <Prop key={`s${i}`} def={p} />
      ))}
      <GroundPatch x={0} z={6.6} width={30} depth={0.5} color="#3f5a3a" y={0.01} />
      <KopiStall />
      <Bandstand />

      {/* Across the river: the Palace and the old fort, lit for the night */}
      <Palace x={4} z={-12.5} />
      <Fort x={13.5} z={-11.8} />
      {FAR_TREES.map(([x, z, s], i) => (
        <mesh key={i} position={[x, 1.2 * s, z]} scale={s}>
          <icosahedronGeometry args={[1.4, 0]} />
          <meshStandardMaterial color={i % 2 ? '#20382a' : '#2a4532'} flatShading />
        </mesh>
      ))}

      {children}
      <ExplorationRig layout={layout} spawn={spawn} />
    </>
  );
}

/** A colonnade across the Archives' front. */
function ArchivesColumns() {
  const xs = [-3.9, -2.5, -0.5, 0.9];
  return (
    <group>
      {xs.map((x) => (
        <mesh key={x} position={[x, 1.45, ARCHIVES.frontZ + 0.25]} castShadow>
          <cylinderGeometry args={[0.16, 0.18, 2.9, 10]} />
          <meshStandardMaterial color="#f1ece0" />
        </mesh>
      ))}
      {/* Entablature over the columns */}
      <mesh position={[ARCHIVES.x, 3.0, ARCHIVES.frontZ + 0.25]} castShadow>
        <boxGeometry args={[5.4, 0.25, 0.55]} />
        <meshStandardMaterial color="#e6e0d0" />
      </mesh>
      {/* Steps */}
      <mesh position={[ARCHIVES.x, 0.06, ARCHIVES.frontZ + 0.3]} receiveShadow>
        <boxGeometry args={[2.2, 0.12, 0.5]} />
        <meshStandardMaterial color="#cfc8b8" />
      </mesh>
    </group>
  );
}

function Pier() {
  const len = PIER.fromZ - PIER.toZ;
  return (
    <group>
      <mesh position={[PIER.x, 0.02, (PIER.fromZ + PIER.toZ) / 2]} receiveShadow>
        <boxGeometry args={[PIER.width, 0.08, len]} />
        <meshStandardMaterial color="#7d5f42" />
      </mesh>
      {[-1, 1].flatMap((side) =>
        [0, 1, 2].map((i) => (
          <mesh key={`${side}${i}`} position={[PIER.x + (side * PIER.width) / 2, -0.15, PIER.fromZ - 0.6 - i * 1.3]}>
            <cylinderGeometry args={[0.07, 0.07, 0.7, 6]} />
            <meshStandardMaterial color="#4a3826" />
          </mesh>
        )),
      )}
    </group>
  );
}

/** A small wooden river boat moored by the pier. */
function Sampan({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, -0.25, z]} rotation-y={Math.PI / 2 + 0.12}>
      <mesh>
        <boxGeometry args={[0.9, 0.25, 3]} />
        <meshStandardMaterial color="#6b4a30" />
      </mesh>
      <mesh position={[0, 0.35, 0.2]}>
        <boxGeometry args={[0.8, 0.45, 1.2]} />
        <meshStandardMaterial color="#a8442f" />
      </mesh>
    </group>
  );
}

function KopiStall() {
  return (
    <group position={[STALL.x, 0, STALL.z]}>
      <mesh position-y={0.45} castShadow receiveShadow>
        <boxGeometry args={[STALL.width, 0.9, STALL.depth]} />
        <meshStandardMaterial color="#7a4a2a" />
      </mesh>
      {/* Steaming pot on the counter */}
      <mesh position={[-0.5, 1.05, 0]}>
        <cylinderGeometry args={[0.2, 0.2, 0.25, 10]} />
        <meshStandardMaterial color="#c9c9c9" metalness={0.5} roughness={0.4} />
      </mesh>
      {/* Awning on two posts */}
      {[-1, 1].map((s) => (
        <mesh key={s} position={[(s * STALL.width) / 2, 1.1, -0.35]}>
          <boxGeometry args={[0.08, 2.2, 0.08]} />
          <meshStandardMaterial color="#3b2b20" />
        </mesh>
      ))}
      <mesh position={[0, 2.2, -0.1]} rotation-x={0.25} castShadow>
        <boxGeometry args={[STALL.width + 0.4, 0.06, 1.3]} />
        <meshStandardMaterial color="#c0392b" />
      </mesh>
      {/* Stools for customers (decoration) */}
      {[-0.7, 0, 0.7].map((sx) => (
        <mesh key={sx} position={[sx, 0.22, 0.85]}>
          <cylinderGeometry args={[0.16, 0.18, 0.44, 8]} />
          <meshStandardMaterial color="#d84d3a" />
        </mesh>
      ))}
    </group>
  );
}

/** Octagonal bandstand pavilion. */
function Bandstand() {
  const posts = 8;
  const r = BANDSTAND.size / 2 - 0.15;
  return (
    <group position={[BANDSTAND.x, 0, BANDSTAND.z]}>
      <mesh position-y={0.15} receiveShadow castShadow>
        <cylinderGeometry args={[BANDSTAND.size / 2, BANDSTAND.size / 2 + 0.1, 0.3, 8]} />
        <meshStandardMaterial color="#d8d2c4" />
      </mesh>
      {Array.from({ length: posts }, (_, i) => {
        const a = (i / posts) * Math.PI * 2;
        return (
          <mesh key={i} position={[Math.cos(a) * r, 1.3, Math.sin(a) * r]} castShadow>
            <cylinderGeometry args={[0.06, 0.06, 2, 6]} />
            <meshStandardMaterial color="#f1ece0" />
          </mesh>
        );
      })}
      <mesh position-y={2.65} castShadow>
        <coneGeometry args={[BANDSTAND.size / 2 + 0.35, 1, 8]} />
        <meshStandardMaterial color="#2f6b5a" />
      </mesh>
    </group>
  );
}

/** The Palace across the river: a long white hall with a central tower, lit windows. */
function Palace({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={1.8}>
        <boxGeometry args={[10, 3.6, 3.5]} />
        <meshStandardMaterial color="#efeadf" />
      </mesh>
      <mesh position-y={3.8}>
        <boxGeometry args={[10.4, 0.4, 3.9]} />
        <meshStandardMaterial color="#3b4a5a" />
      </mesh>
      <mesh position-y={4.4}>
        <boxGeometry args={[1.8, 5, 1.8]} />
        <meshStandardMaterial color="#efeadf" />
      </mesh>
      <mesh position-y={7.3}>
        <coneGeometry args={[1.4, 1.2, 4]} />
        <meshStandardMaterial color="#3b4a5a" />
      </mesh>
      {/* Lit windows */}
      {Array.from({ length: 8 }, (_, i) => (
        <mesh key={i} position={[-4.2 + i * 1.2, 2, 1.76]}>
          <planeGeometry args={[0.5, 0.8]} />
          <meshBasicMaterial color="#ffe2a0" toneMapped={false} />
        </mesh>
      ))}
    </group>
  );
}

/** A small white fort tower with crenellations. */
function Fort({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={1.8}>
        <boxGeometry args={[2.4, 3.6, 2.4]} />
        <meshStandardMaterial color="#e8e4da" />
      </mesh>
      {[-1, 0, 1].flatMap((i) =>
        [-1, 1].map((s) => (
          <mesh key={`${i}${s}`} position={[i * 0.8, 3.8, s * 1.1]}>
            <boxGeometry args={[0.4, 0.4, 0.2]} />
            <meshStandardMaterial color="#e8e4da" />
          </mesh>
        )),
      )}
      <mesh position={[0, 2.4, 1.21]}>
        <planeGeometry args={[0.4, 0.7]} />
        <meshBasicMaterial color="#ffe2a0" toneMapped={false} />
      </mesh>
    </group>
  );
}
