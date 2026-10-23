import { useFrame } from '@react-three/fiber';
import { useMemo, useRef } from 'react';
import * as THREE from 'three';
import {
  BRAZIERS,
  CHAMBER_BOUNDS,
  CHAMBER_LAYOUT,
  CHAMBER_WALL_HEIGHT,
  FLOOR_SIGN,
  INSCRIPTION,
  PILLAR_SIZE,
  PILLARS,
} from '../../data/ancientChamber';
import type { SpawnPoint } from '../../data/scenes';
import { useGame } from '../core/gameStore';
import { ExplorationRig } from './ExplorationRig';
import { getInsigniaTexture } from './insignia';

const STONE = '#55606a';
const STONE_DARK = '#3a434c';

/** Area C — the ancient chamber below the house. Guardian encounter arrives in Phase 4. */
export function AncientChamber({ spawn }: { spawn: SpawnPoint }) {
  const { minX, maxX, minZ, maxZ } = CHAMBER_BOUNDS;
  const w = maxX - minX;
  const H = CHAMBER_WALL_HEIGHT;

  return (
    <>
      <color attach="background" args={['#05060a']} />
      <fog attach="fog" args={['#05060a', 24, 40]} />
      <ambientLight intensity={0.25} color="#8aa0c0" />
      <directionalLight position={[2, 10, 4]} intensity={0.5} color="#9fb4d8" />

      {/* Stone floor tiles */}
      {Array.from({ length: Math.ceil(w) + 1 }, (_, i) =>
        Array.from({ length: Math.ceil(maxZ - minZ) + 2 }, (_, j) => (
          <mesh
            key={`${i}-${j}`}
            rotation-x={-Math.PI / 2}
            position={[minX + i, 0, minZ + j]}
            receiveShadow
          >
            <planeGeometry args={[0.96, 0.96]} />
            <meshStandardMaterial color={(i + j) % 2 ? '#4b545c' : '#454d55'} />
          </mesh>
        )),
      )}
      <mesh rotation-x={-Math.PI / 2} position-y={-0.01}>
        <planeGeometry args={[w + 2, maxZ - minZ + 3]} />
        <meshStandardMaterial color="#22282e" />
      </mesh>

      {/* Back and side walls */}
      <mesh position={[0, H / 2, minZ - 0.4]}>
        <boxGeometry args={[w + 1.6, H, 0.4]} />
        <meshStandardMaterial color={STONE_DARK} />
      </mesh>
      {[minX - 0.6, maxX + 0.6].map((x) => (
        <mesh key={x} position={[x, H / 2, (minZ + maxZ) / 2]}>
          <boxGeometry args={[0.4, H, maxZ - minZ + 1.2]} />
          <meshStandardMaterial color={STONE_DARK} />
        </mesh>
      ))}
      {/* Carved relief of the sign on the back wall */}
      <mesh position={[0, 1.9, minZ - 0.19]}>
        <planeGeometry args={[1.4, 1.4]} />
        <meshBasicMaterial map={getInsigniaTexture('#8fa3b8')} transparent alphaTest={0.3} />
      </mesh>

      {/* Stairs up (south edge) */}
      {[0, 1, 2].map((i) => (
        <mesh key={i} position={[0, 0.12 + i * 0.24, maxZ + 0.3 + i * 0.3]}>
          <boxGeometry args={[1.4, 0.24 + i * 0.48, 0.3]} />
          <meshStandardMaterial color={STONE} />
        </mesh>
      ))}

      {PILLARS.map((p, i) => (
        <mesh key={i} position={[p.x, H / 2, p.z]} castShadow>
          <boxGeometry args={[PILLAR_SIZE, H, PILLAR_SIZE]} />
          <meshStandardMaterial color={STONE} />
        </mesh>
      ))}
      {BRAZIERS.map((b, i) => (
        <Brazier key={i} x={b.x} z={b.z} />
      ))}

      <FloorSign />
      <Inscription />

      <ExplorationRig layout={CHAMBER_LAYOUT} spawn={spawn} />
    </>
  );
}

export function Brazier({ x, z }: { x: number; z: number }) {
  const light = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    // Gentle flicker
    if (light.current) light.current.intensity = 5 + Math.sin(clock.elapsedTime * 11 + x) * 0.8;
  });
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={0.4}>
        <cylinderGeometry args={[0.18, 0.24, 0.8, 8]} />
        <meshStandardMaterial color="#2a2a2e" />
      </mesh>
      <mesh position-y={0.88}>
        <cylinderGeometry args={[0.32, 0.2, 0.18, 8]} />
        <meshStandardMaterial color="#3a3a40" />
      </mesh>
      <mesh position-y={1.05}>
        <coneGeometry args={[0.2, 0.4, 6]} />
        <meshBasicMaterial color="#ffb347" toneMapped={false} />
      </mesh>
      <pointLight ref={light} position-y={1.3} color="#ff9a40" intensity={5} distance={7} />
    </group>
  );
}

function FloorSign() {
  const mat = useRef<THREE.MeshBasicMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.opacity = 0.6 + Math.sin(clock.elapsedTime * 1.8) * 0.25;
  });
  return (
    <>
      <mesh rotation-x={-Math.PI / 2} position={[FLOOR_SIGN.x, 0.02, FLOOR_SIGN.z]}>
        <planeGeometry args={[FLOOR_SIGN.radius * 2, FLOOR_SIGN.radius * 2]} />
        <meshBasicMaterial
          ref={mat}
          map={getInsigniaTexture('#ffe08a')}
          transparent
          depthWrite={false}
          toneMapped={false}
        />
      </mesh>
      <pointLight position={[FLOOR_SIGN.x, 0.6, FLOOR_SIGN.z]} color="#ffd27a" intensity={3} distance={5} />
    </>
  );
}

/** Rows of carved script; drawn as abstract pixel glyphs (not a real writing system). */
function createScriptTexture(seed: number): THREE.CanvasTexture {
  const W = 48;
  const H = 30;
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  const g = c.getContext('2d')!;
  g.fillStyle = '#ffe08a';
  let r = seed;
  const rand = () => {
    r = (r * 9301 + 49297) % 233280;
    return r / 233280;
  };
  for (let row = 0; row < 5; row++) {
    let x = 1 + Math.floor(rand() * 3);
    const y = 2 + row * 6;
    while (x < W - 4) {
      const w = 2 + Math.floor(rand() * 3);
      // A glyph: a stem plus one or two strokes
      g.fillRect(x, y, 1, 4);
      if (rand() > 0.3) g.fillRect(x, y + Math.floor(rand() * 3), w, 1);
      if (rand() > 0.5) g.fillRect(x + w - 1, y + 1, 1, 3);
      x += w + 2 + (rand() > 0.85 ? 3 : 0);
    }
  }
  const tex = new THREE.CanvasTexture(c);
  tex.magFilter = THREE.NearestFilter;
  tex.minFilter = THREE.NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = THREE.SRGBColorSpace;
  return tex;
}

/** The ancestral message: glows into view once the Guardian is defeated. */
function Inscription() {
  const visible = useGame((s) => !!s.flags.guardian_defeated);
  const textures = useMemo(() => [createScriptTexture(7), createScriptTexture(23)], []);
  const mats = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const light = useRef<THREE.PointLight>(null);
  const t = useRef(0);

  useFrame((_, dt) => {
    if (!visible) return;
    t.current += Math.min(dt, 0.1);
    const fadeIn = Math.min(1, t.current / 1.5);
    const pulse = 0.85 + Math.sin(t.current * 2) * 0.15;
    for (const m of mats.current) if (m) m.opacity = fadeIn * pulse;
    if (light.current) light.current.intensity = fadeIn * 4;
  });

  if (!visible) return null;
  return (
    <group position={[INSCRIPTION.x, INSCRIPTION.y + 0.4, INSCRIPTION.wallZ + 0.03]}>
      {[-1, 1].map((side, i) => (
        <mesh key={side} position-x={side * 1.75}>
          <planeGeometry args={[1.9, 1.2]} />
          <meshBasicMaterial
            ref={(m) => {
              mats.current[i] = m;
            }}
            map={textures[i]}
            transparent
            opacity={0}
            depthWrite={false}
            toneMapped={false}
          />
        </mesh>
      ))}
      <pointLight ref={light} position={[0, 0, 1.2]} color="#ffd27a" intensity={0} distance={6} />
    </group>
  );
}
