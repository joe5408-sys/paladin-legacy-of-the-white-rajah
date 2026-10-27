/**
 * Chapter 2 — the rear deck of an express boat on the Rajang at morning (lazy-loaded scene).
 * Chapter 3 reuses it at night (`BoatScene` with its own layout and `time="night"`).
 * The boat itself stands still; the river, the far bank and its jungle slide past
 * to give the feeling of travel cheaply (a few moving groups that wrap around).
 */
import { useFrame } from '@react-three/fiber';
import { createContext, useContext, useMemo, useRef, type ReactElement } from 'react';
import * as THREE from 'three';
import type { SpawnPoint } from '../../data/scenes';
import { ExplorationRig } from '../../game/scenes/ExplorationRig';
import type { SceneLayout } from '../../game/scenes/layout';
import { BENCH, BOAT_LAYOUT, CARGO, DECK, ENGINE } from './boatData';

/** How fast the scenery drifts past (world units per second). */
const SPEED = 2.4;
/** Scenery wraps around within this x range. */
const SPAN = 48;

/** Small deterministic random generator, so the bank looks the same every visit. */
function rng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

/** Colours for each time of day. Night is Chapter 3's overnight boat. */
const PALETTES = {
  day: {
    night: false,
    sky: '#e9dcc0',
    hemi: ['#fff1d8', '#6b5a40', 1.0] as const,
    sun: { position: [9, 7, 4] as const, intensity: 1.3, color: '#ffe2b0' },
    water: '#8a6e4a',
    streak: '#b89c74',
    wake: '#efe4cc',
    mud: '#9a7a52',
    forest: '#3a5a30',
    trunk: '#5a4632',
    greens: ['#3f6a34', '#4d7a3a', '#35582c', '#5a8540'],
    longhouse: '#8a6a48',
    roof: '#6a5a4a',
    window: '#3a4a58',
  },
  night: {
    night: true,
    sky: '#0b1322',
    hemi: ['#8094c8', '#16161e', 0.55] as const,
    sun: { position: [-6, 9, 3] as const, intensity: 0.7, color: '#b8c8ff' },
    water: '#1e2a36',
    streak: '#3e5266',
    wake: '#8a9aae',
    mud: '#2e2a24',
    forest: '#16241a',
    trunk: '#2a2420',
    greens: ['#1e3320', '#24402a', '#1a2c1c', '#2a4630'],
    longhouse: '#3a2e24',
    roof: '#2a2620',
    window: '#ffcc80',
  },
};
type Palette = (typeof PALETTES)['day'] | (typeof PALETTES)['night'];
const PaletteContext = createContext<Palette>(PALETTES.day);
const usePalette = () => useContext(PaletteContext);

export default function Boat({ spawn }: { spawn: SpawnPoint }) {
  return <BoatScene spawn={spawn} layout={BOAT_LAYOUT} />;
}

/** The express boat with any layout (people and interactions), by day or by night. */
export function BoatScene({
  spawn,
  layout,
  time = 'day',
}: {
  spawn: SpawnPoint;
  layout: SceneLayout;
  time?: keyof typeof PALETTES;
}) {
  const P = PALETTES[time];
  return (
    <PaletteContext.Provider value={P}>
      <color attach="background" args={[P.sky]} />
      <hemisphereLight args={[P.hemi[0], P.hemi[1], P.hemi[2]]} />
      <directionalLight
        position={[P.sun.position[0], P.sun.position[1], P.sun.position[2]]}
        intensity={P.sun.intensity}
        color={P.sun.color}
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-8}
        shadow-camera-right={8}
        shadow-camera-top={6}
        shadow-camera-bottom={-6}
        shadow-bias={-0.0005}
      />

      <River />
      <FarBank />
      <Hull />
      <Deck />
      {P.night && (
        // A deck lamp over the cabin door, and the moon over the far bank
        <>
          <pointLight position={[DECK.minX + 0.4, 1.9, 0]} color="#ffd8a0" intensity={7} distance={7} decay={1.5} />
          <mesh position={[-10, 9, -22]}>
            <circleGeometry args={[1.1, 24]} />
            <meshBasicMaterial color="#e8eeff" toneMapped={false} fog={false} />
          </mesh>
        </>
      )}

      <ExplorationRig layout={layout} spawn={spawn} />
    </PaletteContext.Provider>
  );
}

/** Scrolls a group along +x and wraps it, so the boat seems to move west. */
function useDrift(speed = SPEED) {
  const ref = useRef<THREE.Group>(null);
  useFrame((_, dt) => {
    const g = ref.current;
    if (!g) return;
    g.position.x += speed * Math.min(dt, 0.1);
    if (g.position.x > SPAN / 2) g.position.x -= SPAN;
  });
  return ref;
}

/** Muddy brown water with drifting streaks of foam. */
function River() {
  const P = usePalette();
  const streaks = useMemo(() => {
    const r = rng(7);
    return Array.from({ length: 70 }, () => ({
      x: (r() - 0.5) * SPAN,
      z: -4.4 + r() * 11,
      len: 0.4 + r() * 1.4,
    })).filter((s) => !(Math.abs(s.z) < 1.9 && s.x > -8 && s.x < 6)); // not under the hull
  }, []);
  const a = useDrift(SPEED * 1.15);
  const b = useDrift(SPEED * 1.15);
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position-y={-0.45}>
        <planeGeometry args={[80, 40]} />
        <meshStandardMaterial color={P.water} />
      </mesh>
      {/* Two copies of the streak field, offset by one span, so the wrap is seamless */}
      {[a, b].map((ref, k) => (
        <group key={k} ref={ref} position-x={k === 0 ? 0 : -SPAN}>
          {streaks.map((s, i) => (
            <mesh key={i} rotation-x={-Math.PI / 2} position={[s.x, -0.43, s.z]}>
              <planeGeometry args={[s.len, 0.05]} />
              <meshBasicMaterial color={P.streak} transparent opacity={0.7} depthWrite={false} />
            </mesh>
          ))}
        </group>
      ))}
      {/* The boat's wake: two foam lines spreading out behind the stern */}
      {[-1, 1].map((side) => (
        <mesh key={side} rotation={[-Math.PI / 2, 0, side * 0.18]} position={[7.4, -0.42, side * 1.3]}>
          <planeGeometry args={[5, 0.14]} />
          <meshBasicMaterial color={P.wake} transparent opacity={0.8} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
}

/** The far (north) bank: a mud strip, jungle, and now and then a longhouse on stilts. */
function FarBank() {
  const P = usePalette();
  const items = useMemo(() => {
    const r = rng(42);
    const out: ReactElement[] = [];
    for (let i = 0; i < 46; i++) {
      const x = -SPAN / 2 + (i / 46) * SPAN + r() * 0.6;
      const z = -5.4 - r() * 1.4;
      const h = 1.6 + r() * 2.4;
      const green = P.greens[Math.floor(r() * 4)];
      out.push(
        <group key={`t${i}`} position={[x, 0, z]}>
          <mesh position-y={h / 2}>
            <cylinderGeometry args={[0.08, 0.12, h, 5]} />
            <meshStandardMaterial color={P.trunk} />
          </mesh>
          <mesh position-y={h + 0.3}>
            <sphereGeometry args={[0.7 + r() * 0.6, 7, 5]} />
            <meshStandardMaterial color={green} flatShading />
          </mesh>
        </group>,
      );
    }
    // Two longhouses on stilts, with a jetty below each
    for (const lx of [-14, 9]) {
      out.push(
        <group key={`lh${lx}`} position={[lx, 0, -5.3]}>
          {[-2.4, -1.2, 0, 1.2, 2.4].map((px) => (
            <mesh key={px} position={[px, 0.6, 0]}>
              <boxGeometry args={[0.1, 1.2, 0.1]} />
              <meshStandardMaterial color="#4a3a2a" />
            </mesh>
          ))}
          <mesh position-y={1.6}>
            <boxGeometry args={[5.6, 0.9, 1.4]} />
            <meshStandardMaterial color={P.longhouse} />
          </mesh>
          <mesh position-y={2.3} rotation-x={0}>
            <boxGeometry args={[5.9, 0.35, 1.7]} />
            <meshStandardMaterial color={P.roof} />
          </mesh>
          {/* Lamplit windows at night */}
          {P.night &&
            [-1.8, -0.6, 0.6, 1.8].map((wx) => (
              <mesh key={wx} position={[wx, 1.65, 0.71]}>
                <planeGeometry args={[0.36, 0.3]} />
                <meshBasicMaterial color={P.window} toneMapped={false} />
              </mesh>
            ))}
          <mesh position={[0, -0.3, 1.4]}>
            <boxGeometry args={[0.8, 0.08, 2.0]} />
            <meshStandardMaterial color="#5a4632" />
          </mesh>
        </group>,
      );
    }
    return out;
  }, [P]);
  const a = useDrift();
  const b = useDrift();
  return (
    <group>
      {/* Mud bank and a dark band of distant forest, fixed in place */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.4, -5.0]}>
        <planeGeometry args={[80, 1.0]} />
        <meshStandardMaterial color={P.mud} />
      </mesh>
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.39, -9.5]}>
        <planeGeometry args={[80, 8]} />
        <meshStandardMaterial color={P.forest} />
      </mesh>
      {[a, b].map((ref, k) => (
        <group key={k} ref={ref} position-x={k === 0 ? 0 : -SPAN}>
          {items}
        </group>
      ))}
    </group>
  );
}

/** The long hull of the express boat, its cabin and its rails. */
function Hull() {
  const P = usePalette();
  const { minX, maxX, minZ, maxZ } = DECK;
  const width = maxZ - minZ + 0.4;
  return (
    <group>
      {/* Hull, painted white with a blue band */}
      <mesh position={[-1.3, -0.35, 0]} castShadow receiveShadow>
        <boxGeometry args={[12.6, 0.66, width]} />
        <meshStandardMaterial color="#e8ece8" />
      </mesh>
      <mesh position={[-1.3, -0.48, width / 2 + 0.005]}>
        <planeGeometry args={[12.6, 0.16]} />
        <meshStandardMaterial color="#2f5f8a" />
      </mesh>
      {/* Pointed bow far to the west */}
      <mesh position={[-8.1, -0.35, 0]} rotation-y={Math.PI / 4}>
        <boxGeometry args={[width * 0.7, 0.66, width * 0.7]} />
        <meshStandardMaterial color="#e8ece8" />
      </mesh>

      {/* Passenger cabin over the front of the boat */}
      <group position={[(-7.6 + minX) / 2, 0, 0]}>
        <mesh position-y={0.9} castShadow receiveShadow>
          <boxGeometry args={[minX + 7.6, 1.8, width]} />
          <meshStandardMaterial color="#f2f2ea" />
        </mesh>
        <mesh position-y={1.86}>
          <boxGeometry args={[minX + 7.9, 0.12, width + 0.2]} />
          <meshStandardMaterial color="#2f5f8a" />
        </mesh>
        {/* Windows along the south side */}
        {[-1.0, -0.2, 0.6].map((x) => (
          <mesh key={x} position={[x, 1.15, width / 2 + 0.005]}>
            <planeGeometry args={[0.6, 0.45]} />
            {P.night ? <meshBasicMaterial color={P.window} toneMapped={false} /> : <meshStandardMaterial color={P.window} />}
          </mesh>
        ))}
      </group>
      {/* Cabin door facing the deck */}
      <mesh position={[minX + 0.005, 0.8, 0]} rotation-y={Math.PI / 2}>
        <planeGeometry args={[0.8, 1.5]} />
        <meshStandardMaterial color="#3a4a58" />
      </mesh>

      {/* Railings along both sides of the open deck */}
      {[minZ - 0.12, maxZ + 0.12].map((z) => (
        <group key={z}>
          <mesh position={[(minX + maxX) / 2, 0.7, z]}>
            <boxGeometry args={[maxX - minX, 0.05, 0.05]} />
            <meshStandardMaterial color="#c9ccc8" metalness={0.4} />
          </mesh>
          {Array.from({ length: 10 }, (_, i) => (
            <mesh key={i} position={[minX + 0.1 + i * ((maxX - minX - 0.2) / 9), 0.35, z]}>
              <boxGeometry args={[0.04, 0.7, 0.04]} />
              <meshStandardMaterial color="#c9ccc8" metalness={0.4} />
            </mesh>
          ))}
        </group>
      ))}
    </group>
  );
}

/** Deck planks and what sits on them: a bench, cargo, the engine housing. */
function Deck() {
  const { minX, maxX, minZ, maxZ } = DECK;
  const planks: ReactElement[] = [];
  for (let z = minZ; z < maxZ - 0.01; z += 0.35) {
    planks.push(
      <mesh key={z} rotation-x={-Math.PI / 2} position={[(minX + maxX) / 2, 0.005, z + 0.175]} receiveShadow>
        <planeGeometry args={[maxX - minX, 0.33]} />
        <meshStandardMaterial color={Math.round(z / 0.35) % 2 ? '#a07a52' : '#94704a'} />
      </mesh>,
    );
  }
  return (
    <group>
      <mesh rotation-x={-Math.PI / 2} position={[(minX + maxX) / 2, 0, 0]}>
        <planeGeometry args={[maxX - minX, maxZ - minZ + 0.3]} />
        <meshStandardMaterial color="#5a4430" />
      </mesh>
      {planks}

      {/* Wooden bench along the north rail */}
      <group position={[BENCH.x, 0, BENCH.z]}>
        <mesh position-y={0.42} castShadow>
          <boxGeometry args={[BENCH.width, 0.06, BENCH.depth]} />
          <meshStandardMaterial color="#6b4a30" />
        </mesh>
        {[-0.85, 0.85].map((x) => (
          <mesh key={x} position={[x, 0.2, 0]}>
            <boxGeometry args={[0.06, 0.4, BENCH.depth - 0.05]} />
            <meshStandardMaterial color="#4a3220" />
          </mesh>
        ))}
        {/* Mara's bag */}
        <mesh position={[0.5, 0.58, 0]} castShadow>
          <boxGeometry args={[0.4, 0.26, 0.24]} />
          <meshStandardMaterial color="#7a3a4a" />
        </mesh>
      </group>

      {/* Cargo: crates, rice sacks and a basket of rambutans */}
      <group position={[CARGO.x, 0, CARGO.z]}>
        <mesh position={[-0.25, 0.22, 0]} castShadow>
          <boxGeometry args={[0.5, 0.44, 0.5]} />
          <meshStandardMaterial color="#b08a5a" />
        </mesh>
        <mesh position={[0.3, 0.16, 0.02]} castShadow>
          <boxGeometry args={[0.5, 0.32, 0.45]} />
          <meshStandardMaterial color="#e2d6b8" />
        </mesh>
        <mesh position={[0.3, 0.42, 0.02]} castShadow>
          <boxGeometry args={[0.45, 0.2, 0.4]} />
          <meshStandardMaterial color="#d8caa8" />
        </mesh>
      </group>
      <group position={[-0.95, 0, 1.0]}>
        <mesh position-y={0.12}>
          <cylinderGeometry args={[0.2, 0.16, 0.24, 10]} />
          <meshStandardMaterial color="#a8824a" />
        </mesh>
        {[[-0.07, 0], [0.07, 0.03], [0, -0.07], [0.02, 0.08]].map(([x, z], i) => (
          <mesh key={i} position={[x, 0.27, z]}>
            <sphereGeometry args={[0.06, 6, 5]} />
            <meshStandardMaterial color="#c8323a" />
          </mesh>
        ))}
      </group>

      {/* Engine housing at the stern, with an exhaust pipe */}
      <group position={[ENGINE.x, 0, ENGINE.z]}>
        <mesh position-y={0.4} castShadow receiveShadow>
          <boxGeometry args={[ENGINE.width, 0.8, ENGINE.depth]} />
          <meshStandardMaterial color="#6a7078" metalness={0.3} />
        </mesh>
        <mesh position={[0.2, 1.1, -0.45]}>
          <cylinderGeometry args={[0.07, 0.07, 0.8, 8]} />
          <meshStandardMaterial color="#2a2a2a" metalness={0.5} />
        </mesh>
      </group>
    </group>
  );
}
