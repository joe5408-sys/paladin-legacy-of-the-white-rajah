import { useFrame } from '@react-three/fiber';
import { useMemo, useRef, type ReactNode } from 'react';
import * as THREE from 'three';
import {
  FURNITURE,
  HEIRLOOM,
  HOME_LAYOUT,
  HOME_ROOM,
  HOME_WALL_HEIGHT,
  PASSAGE,
  PORTRAIT,
  type FurnitureDef,
} from '../../data/familyHome';
import type { SpawnPoint } from '../../data/scenes';
import { useGame } from '../core/gameStore';
import { ExplorationRig } from './ExplorationRig';
import type { SceneLayout } from './layout';
import { getInsigniaTexture } from './insignia';

const WALL = '#8a6544';
const WALL_DARK = '#6e4f34';
const T = 0.3; // wall thickness
/** Passage steps, nearest first, darkening as they descend. */
const STEP_COLORS = ['#4a3626', '#36281c', '#261c14', '#18120d', '#0d0a07'];

/**
 * Area B — the Vale family home. Front wall is cut away so the room reads clearly.
 * Later chapters reuse it with their own layout and extra props.
 */
export function FamilyHome({
  spawn,
  layout = HOME_LAYOUT,
  showPortrait = true,
  children,
}: {
  spawn: SpawnPoint;
  layout?: SceneLayout;
  /** False once the portrait has been taken off the wall (Chapter 2). */
  showPortrait?: boolean;
  children?: ReactNode;
}) {
  const { minX, maxX, minZ, maxZ } = HOME_ROOM;
  const w = maxX - minX;
  const d = maxZ - minZ;
  const H = HOME_WALL_HEIGHT;

  return (
    <>
      <color attach="background" args={['#120d0a']} />
      <hemisphereLight args={['#ffe6c4', '#3a2a1c', 0.7]} />
      {/* Afternoon sun through the north windows */}
      <directionalLight
        position={[-3, 9, 5]}
        intensity={1.6}
        color="#ffd9a0"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-7}
        shadow-camera-right={7}
        shadow-camera-top={7}
        shadow-camera-bottom={-7}
        shadow-bias={-0.0005}
      />
      <pointLight position={[1.5, 2.2, 0.5]} intensity={6} distance={9} color="#ffb870" />

      <Floor />

      {/* Back (north) wall with two windows */}
      <mesh position={[0, H / 2, minZ - T / 2]} receiveShadow>
        <boxGeometry args={[w + 2 * T, H, T]} />
        <meshStandardMaterial color={WALL} />
      </mesh>
      {[-2.6, 2.9].map((x) => (
        <group key={x} position={[x, 1.6, minZ + 0.01]}>
          <mesh>
            <boxGeometry args={[1.1, 0.9, 0.04]} />
            <meshStandardMaterial color="#d6b36a" />
          </mesh>
          <mesh position-z={0.02}>
            <boxGeometry args={[0.95, 0.75, 0.04]} />
            <meshStandardMaterial color="#bfe3f2" emissive="#ffe6b0" emissiveIntensity={0.6} />
          </mesh>
        </group>
      ))}
      {/* Side walls */}
      {[minX - T / 2, maxX + T / 2].map((x) => (
        <mesh key={x} position={[x, H / 2, 0]} receiveShadow castShadow>
          <boxGeometry args={[T, H, d + 2 * T]} />
          <meshStandardMaterial color={WALL_DARK} />
        </mesh>
      ))}
      {/* Low front wall with a doorway gap in the middle */}
      {[-1, 1].map((side) => (
        <mesh key={side} position={[side * (0.7 + (w / 2 - 0.7 + T) / 2), 0.25, maxZ + T / 2]}>
          <boxGeometry args={[w / 2 - 0.7 + T, 0.5, T]} />
          <meshStandardMaterial color={WALL_DARK} />
        </mesh>
      ))}

      {showPortrait && <Portrait />}
      {FURNITURE.map((f, i) => (
        <Furniture key={i} def={f} />
      ))}
      <Heirloom />
      <HiddenPassage />

      {children}
      <ExplorationRig layout={layout} spawn={spawn} />
    </>
  );
}

function Floor() {
  const { minX, maxX, minZ, maxZ } = HOME_ROOM;
  const planks = Math.round((maxX - minX) / 0.45);
  const d = maxZ - minZ;
  return (
    <group>
      {Array.from({ length: planks }, (_, i) => (
        <mesh key={i} position={[minX + 0.225 + i * 0.45, -0.04, (minZ + maxZ) / 2]} receiveShadow>
          <boxGeometry args={[0.43, 0.08, d]} />
          <meshStandardMaterial color={['#9a6b42', '#a3734a', '#93653e'][i % 3]} />
        </mesh>
      ))}
      {/* Dark gaps between planks */}
      <mesh rotation-x={-Math.PI / 2} position={[0, -0.05, 0]}>
        <planeGeometry args={[maxX - minX, d]} />
        <meshStandardMaterial color="#3a2618" />
      </mesh>
    </group>
  );
}

function Portrait() {
  // A simple painted group of figures in a gold frame (original placeholder art).
  const texture = useMemo(() => {
    const c = document.createElement('canvas');
    c.width = 24;
    c.height = 16;
    const g = c.getContext('2d')!;
    g.fillStyle = '#c9b48a';
    g.fillRect(0, 0, 24, 16);
    g.fillStyle = '#a8916a';
    g.fillRect(0, 11, 24, 5);
    // Uniformed figure (left) and young ruler (right), sepia tones
    g.fillStyle = '#efe6d2';
    g.fillRect(6, 6, 4, 8);
    g.fillStyle = '#5a4630';
    g.fillRect(7, 3, 2, 3);
    g.fillRect(15, 4, 2, 3);
    g.fillStyle = '#6d5638';
    g.fillRect(14, 7, 4, 7);
    const tex = new THREE.CanvasTexture(c);
    tex.magFilter = THREE.NearestFilter;
    tex.minFilter = THREE.NearestFilter;
    tex.colorSpace = THREE.SRGBColorSpace;
    return tex;
  }, []);
  return (
    <group position={[PORTRAIT.x, PORTRAIT.y, PORTRAIT.wallZ + 0.03]}>
      <mesh>
        <boxGeometry args={[1.25, 0.9, 0.05]} />
        <meshStandardMaterial color="#b8913f" metalness={0.3} roughness={0.5} />
      </mesh>
      <mesh position-z={0.03}>
        <planeGeometry args={[1.05, 0.7]} />
        <meshStandardMaterial map={texture} />
      </mesh>
      {/* Blank nameplate */}
      <mesh position={[0, -0.55, 0.02]}>
        <boxGeometry args={[0.5, 0.1, 0.03]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.5} roughness={0.4} />
      </mesh>
    </group>
  );
}

function Furniture({ def }: { def: FurnitureDef }) {
  switch (def.kind) {
    case 'mat':
      return (
        <mesh rotation-x={-Math.PI / 2} position={[def.x, 0.005, def.z]} receiveShadow>
          <planeGeometry args={[3.2, 1.9]} />
          <meshStandardMaterial color="#c7a86a" />
        </mesh>
      );
    case 'table':
      return (
        <group position={[def.x, 0, def.z]}>
          <mesh position-y={0.42} castShadow receiveShadow>
            <boxGeometry args={[1.4, 0.08, 0.9]} />
            <meshStandardMaterial color="#5e3d24" />
          </mesh>
          {[-0.6, 0.6].flatMap((x) =>
            [-0.35, 0.35].map((z) => (
              <mesh key={`${x}${z}`} position={[x, 0.2, z]} castShadow>
                <boxGeometry args={[0.08, 0.4, 0.08]} />
                <meshStandardMaterial color="#4a2f1b" />
              </mesh>
            )),
          )}
          {/* Teapot and cups */}
          <mesh position={[0.1, 0.55, 0]} castShadow>
            <sphereGeometry args={[0.12, 8, 6]} />
            <meshStandardMaterial color="#e8e2d6" />
          </mesh>
          <mesh position={[-0.35, 0.5, 0.15]}>
            <cylinderGeometry args={[0.05, 0.04, 0.08, 8]} />
            <meshStandardMaterial color="#e8e2d6" />
          </mesh>
        </group>
      );
    case 'stool':
      return (
        <mesh position={[def.x, 0.2, def.z]} castShadow receiveShadow>
          <cylinderGeometry args={[0.2, 0.22, 0.4, 8]} />
          <meshStandardMaterial color="#6b4a30" />
        </mesh>
      );
    case 'cabinet':
      return (
        <group position={[def.x, 0, def.z]}>
          <mesh position-y={0.9} castShadow receiveShadow>
            <boxGeometry args={[0.6, 1.8, 1.5]} />
            <meshStandardMaterial color="#5a3a22" />
          </mesh>
          {[-0.36, 0.36].map((z) => (
            <mesh key={z} position={[-0.31, 1.0, z]}>
              <boxGeometry args={[0.02, 1.3, 0.62]} />
              <meshStandardMaterial color="#6e4a2e" />
            </mesh>
          ))}
        </group>
      );
    case 'shelf':
      return (
        <group position={[def.x, 0, def.z]}>
          <mesh position-y={0.55} castShadow receiveShadow>
            <boxGeometry args={[1.4, 1.1, 0.4]} />
            <meshStandardMaterial color="#5a3a22" />
          </mesh>
          {/* Books */}
          {[-0.45, -0.3, -0.15, 0.2, 0.35].map((x, i) => (
            <mesh key={x} position={[x, 1.22, 0]}>
              <boxGeometry args={[0.12, 0.25 + (i % 2) * 0.06, 0.28]} />
              <meshStandardMaterial color={['#7b2f3b', '#2f5d8a', '#3d7f6e', '#c9a24a', '#5a4630'][i]} />
            </mesh>
          ))}
        </group>
      );
    case 'plant':
      return (
        <group position={[def.x, 0, def.z]}>
          <mesh position-y={0.22} castShadow>
            <cylinderGeometry args={[0.22, 0.18, 0.44, 8]} />
            <meshStandardMaterial color="#9c5a3c" />
          </mesh>
          <mesh position-y={0.7} castShadow>
            <icosahedronGeometry args={[0.35, 0]} />
            <meshStandardMaterial color="#3f8a45" flatShading />
          </mesh>
        </group>
      );
  }
}

/** Bronze medallion on a carved pedestal; glows once awakened. */
function Heirloom() {
  const awakened = useGame((s) => !!s.flags.heirloom_awakened);
  const insignia = getInsigniaTexture('#ffe9a8');
  const medal = useRef<THREE.Group>(null);
  const glowMat = useRef<THREE.MeshStandardMaterial>(null);
  const light = useRef<THREE.PointLight>(null);
  const floorSign = useRef<THREE.MeshBasicMaterial>(null);
  const t = useRef(0);

  useFrame((_, dt) => {
    if (!awakened) return;
    t.current += Math.min(dt, 0.1);
    const pulse = 0.5 + Math.sin(t.current * 3) * 0.5;
    if (medal.current) medal.current.position.y = 1.25 + Math.sin(t.current * 1.6) * 0.05;
    if (glowMat.current) glowMat.current.emissiveIntensity = 1.2 + pulse * 1.2;
    if (light.current) light.current.intensity = 6 + pulse * 4;
    // Floor sign fades in over the first second, then breathes
    if (floorSign.current) floorSign.current.opacity = Math.min(1, t.current) * (0.55 + pulse * 0.35);
  });

  return (
    <group position={[HEIRLOOM.x, 0, HEIRLOOM.z]}>
      {/* Carved pedestal */}
      <mesh position-y={0.45} castShadow receiveShadow>
        <boxGeometry args={[0.55, 0.9, 0.55]} />
        <meshStandardMaterial color="#4f321f" />
      </mesh>
      <mesh position-y={0.92}>
        <boxGeometry args={[0.66, 0.06, 0.66]} />
        <meshStandardMaterial color="#c9a24a" metalness={0.4} roughness={0.4} />
      </mesh>
      {/* Medallion faces the camera */}
      <group ref={medal} position-y={1.25}>
        <mesh rotation-x={Math.PI / 2} castShadow>
          <cylinderGeometry args={[0.24, 0.24, 0.05, 20]} />
          <meshStandardMaterial
            ref={glowMat}
            color="#a8743a"
            metalness={0.6}
            roughness={0.35}
            emissive={awakened ? '#ffd27a' : '#000000'}
            emissiveIntensity={awakened ? 1.2 : 0}
          />
        </mesh>
        <mesh position-z={0.03}>
          <planeGeometry args={[0.44, 0.44]} />
          <meshBasicMaterial map={insignia} transparent alphaTest={0.3} toneMapped={false} />
        </mesh>
      </group>
      {awakened && (
        <>
          <pointLight ref={light} position={[0, 1.3, 0.5]} color="#ffd98a" intensity={6} distance={6} />
          {/* The sign traced in light on the floor in front of the pedestal */}
          <mesh rotation-x={-Math.PI / 2} position={[0, 0.02, 1.1]}>
            <planeGeometry args={[1.5, 1.5]} />
            <meshBasicMaterial
              ref={floorSign}
              map={insignia}
              transparent
              opacity={0}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
        </>
      )}
    </group>
  );
}

/** Floor hatch by the west wall. Closed: a slightly different floor panel. Open: steps into darkness. */
function HiddenPassage() {
  const open = useGame((s) => !!s.flags.passage_open);
  const w = PASSAGE.maxX - PASSAGE.minX;
  const d = PASSAGE.maxZ - PASSAGE.minZ;
  const cx = (PASSAGE.minX + PASSAGE.maxX) / 2;
  const cz = (PASSAGE.minZ + PASSAGE.maxZ) / 2;

  if (!open) {
    return (
      <mesh rotation-x={-Math.PI / 2} position={[cx, 0.006, cz]}>
        <planeGeometry args={[w, d]} />
        <meshStandardMaterial color="#8a5d38" />
      </mesh>
    );
  }
  const steps = 5;
  return (
    <group position={[cx, 0, cz]}>
      {/* Dark opening */}
      <mesh rotation-x={-Math.PI / 2} position-y={0.01}>
        <planeGeometry args={[w, d]} />
        <meshBasicMaterial color="#050304" />
      </mesh>
      {/* Steps fading into the dark, descending northward */}
      {STEP_COLORS.slice(0, steps).map((color, i) => (
        <mesh key={i} rotation-x={-Math.PI / 2} position={[0, 0.012, d / 2 - 0.18 - i * 0.3]}>
          <planeGeometry args={[w - 0.2, 0.16]} />
          <meshBasicMaterial color={color} toneMapped={false} />
        </mesh>
      ))}
      {/* Faint golden light rising from below */}
      <pointLight position={[0, -0.2, 0]} color="#e8b860" intensity={2} distance={2.5} />
      {/* Hatch boards slid aside */}
      <mesh position={[0, 0.03, -d / 2 - 0.15]} castShadow>
        <boxGeometry args={[w, 0.06, 0.3]} />
        <meshStandardMaterial color="#6e4a2e" />
      </mesh>
    </group>
  );
}
