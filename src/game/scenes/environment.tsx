/**
 * Low-poly building blocks for HD-2D environments.
 * Everything is simple primitive geometry so it is cheap and easy to replace later.
 */
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { BuildingDef, PropDef } from '../../data/villageSquare';

/** House with walls, a gabled roof, door and windows on the camera-facing side. */
export function Building({ def }: { def: BuildingDef }) {
  const { x, z, width, depth, height, wallColor, roofColor, trimColor, stilts = 0 } = def;
  const roofRise = depth * 0.38;
  const slopeLen = Math.hypot(depth / 2 + 0.35, roofRise);
  const slopeAngle = Math.atan2(roofRise, depth / 2 + 0.35);
  const base = stilts;
  const front = depth / 2 + 0.01;

  return (
    <group position={[x, 0, z]}>
      {stilts > 0 && (
        <>
          {[-1, 1].flatMap((sx) =>
            [-1, 1].map((sz) => (
              <mesh
                key={`${sx}${sz}`}
                position={[(sx * (width - 0.3)) / 2, stilts / 2, (sz * (depth - 0.3)) / 2]}
                castShadow
              >
                <boxGeometry args={[0.18, stilts, 0.18]} />
                <meshStandardMaterial color="#3d2a1c" />
              </mesh>
            )),
          )}
          {/* Veranda deck and front stairs */}
          <mesh position={[0, stilts - 0.05, depth / 2 + 0.25]} castShadow receiveShadow>
            <boxGeometry args={[width, 0.1, 0.5]} />
            <meshStandardMaterial color="#5b3d27" />
          </mesh>
          {[0, 1, 2].map((i) => (
            <mesh
              key={i}
              position={[0, (stilts * (i + 0.5)) / 3, depth / 2 + 0.55 + (2 - i) * 0.22]}
              castShadow
              receiveShadow
            >
              <boxGeometry args={[1.1, stilts / 3, 0.24]} />
              <meshStandardMaterial color="#6b4a30" />
            </mesh>
          ))}
        </>
      )}

      {/* Walls */}
      <mesh position={[0, base + height / 2, 0]} castShadow receiveShadow>
        <boxGeometry args={[width, height, depth]} />
        <meshStandardMaterial color={wallColor} />
      </mesh>
      {/* Base trim */}
      <mesh position={[0, base + 0.08, 0]}>
        <boxGeometry args={[width + 0.06, 0.16, depth + 0.06]} />
        <meshStandardMaterial color={trimColor} />
      </mesh>

      {/* Gabled roof: two sloped slabs meeting at the ridge, plus gable ends */}
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[0, base + height + roofRise / 2, (side * (depth / 2 + 0.35)) / 2]}
          rotation-x={side * slopeAngle}
          castShadow
          receiveShadow
        >
          <boxGeometry args={[width + 0.5, 0.12, slopeLen]} />
          <meshStandardMaterial color={roofColor} />
        </mesh>
      ))}
      <GableEnds width={width} depth={depth} rise={roofRise} y={base + height} color={wallColor} />

      {/* Door and windows on the south face */}
      {def.door && (
        <mesh position={[0, base + 0.75, front]}>
          <boxGeometry args={[0.8, 1.5, 0.05]} />
          <meshStandardMaterial color="#3a2618" />
        </mesh>
      )}
      {[-1, 1].map((side) => (
        <group key={side} position={[side * Math.min(width * 0.3, 1.5), base + height * 0.58, front]}>
          <mesh>
            <boxGeometry args={[0.7, 0.6, 0.05]} />
            <meshStandardMaterial color={trimColor} />
          </mesh>
          <mesh position-z={0.02}>
            <boxGeometry args={[0.56, 0.46, 0.05]} />
            <meshStandardMaterial color="#ffd98a" emissive="#ffb347" emissiveIntensity={0.35} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

/** Triangular wall pieces that close the ends of the gabled roof. */
function GableEnds(props: { width: number; depth: number; rise: number; y: number; color: string }) {
  const shape = new THREE.Shape();
  shape.moveTo(-props.depth / 2, 0);
  shape.lineTo(props.depth / 2, 0);
  shape.lineTo(0, props.rise);
  shape.closePath();
  return (
    <>
      {[-1, 1].map((side) => (
        <mesh
          key={side}
          position={[(side * props.width) / 2, props.y, 0]}
          rotation-y={Math.PI / 2}
          castShadow
        >
          <shapeGeometry args={[shape]} />
          <meshStandardMaterial color={props.color} side={THREE.DoubleSide} />
        </mesh>
      ))}
    </>
  );
}

export function Prop({ def }: { def: PropDef }) {
  const rot = def.rotation ?? 0;
  switch (def.kind) {
    case 'palm':
      return <Palm x={def.x} z={def.z} />;
    case 'crate':
      return (
        <mesh position={[def.x, 0.35, def.z]} rotation-y={rot} castShadow receiveShadow>
          <boxGeometry args={[0.7, 0.7, 0.7]} />
          <meshStandardMaterial color="#9b7446" />
        </mesh>
      );
    case 'barrel':
      return (
        <mesh position={[def.x, 0.4, def.z]} castShadow>
          <cylinderGeometry args={[0.3, 0.3, 0.8, 10]} />
          <meshStandardMaterial color="#2f5d8a" />
        </mesh>
      );
    case 'bench':
      return (
        <group position={[def.x, 0, def.z]} rotation-y={rot}>
          <mesh position-y={0.42} castShadow receiveShadow>
            <boxGeometry args={[1.7, 0.08, 0.5]} />
            <meshStandardMaterial color="#8a5a35" />
          </mesh>
          {[-0.7, 0.7].map((lx) => (
            <mesh key={lx} position={[lx, 0.2, 0]} castShadow>
              <boxGeometry args={[0.08, 0.4, 0.45]} />
              <meshStandardMaterial color="#3b2b20" />
            </mesh>
          ))}
        </group>
      );
    case 'lamp':
      return (
        <group position={[def.x, 0, def.z]}>
          <mesh position-y={1.1} castShadow>
            <cylinderGeometry args={[0.05, 0.07, 2.2, 6]} />
            <meshStandardMaterial color="#2a2a30" />
          </mesh>
          <mesh position-y={2.25}>
            <boxGeometry args={[0.28, 0.3, 0.28]} />
            <meshStandardMaterial color="#ffe1a0" emissive="#ffc35c" emissiveIntensity={0.8} />
          </mesh>
        </group>
      );
    case 'planter':
      return (
        <group position={[def.x, 0, def.z]}>
          <mesh position-y={0.2} castShadow receiveShadow>
            <boxGeometry args={[0.6, 0.4, 0.6]} />
            <meshStandardMaterial color="#b0603f" />
          </mesh>
          <mesh position-y={0.6} castShadow>
            <icosahedronGeometry args={[0.38, 0]} />
            <meshStandardMaterial color="#3f8a45" flatShading />
          </mesh>
        </group>
      );
  }
}

/** Low-poly palm: slightly leaning trunk and a crown of flat fronds. */
function Palm({ x, z }: { x: number; z: number }) {
  const fronds = 7;
  return (
    <group position={[x, 0, z]} rotation-z={0.08}>
      <mesh position-y={1.4} castShadow>
        <cylinderGeometry args={[0.1, 0.16, 2.8, 6]} />
        <meshStandardMaterial color="#7d6248" flatShading />
      </mesh>
      {Array.from({ length: fronds }, (_, i) => {
        const a = (i / fronds) * Math.PI * 2;
        return (
          <group key={i} position-y={2.8} rotation-y={a}>
            <mesh position={[0.6, -0.15, 0]} rotation-z={-0.35} castShadow>
              <boxGeometry args={[1.3, 0.04, 0.36]} />
              <meshStandardMaterial color={i % 2 ? '#2f7d3b' : '#3d9447'} flatShading />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

/** Gently shimmering river surface. */
export function River(props: { minX: number; maxX: number; minZ: number; maxZ: number }) {
  const mat = useRef<THREE.MeshStandardMaterial>(null);
  useFrame(({ clock }) => {
    if (mat.current) mat.current.emissiveIntensity = 0.12 + Math.sin(clock.elapsedTime * 1.3) * 0.04;
  });
  const w = props.maxX - props.minX;
  const d = props.maxZ - props.minZ;
  return (
    <mesh
      rotation-x={-Math.PI / 2}
      position={[(props.minX + props.maxX) / 2, -0.35, (props.minZ + props.maxZ) / 2]}
      receiveShadow
    >
      <planeGeometry args={[w, d]} />
      <meshStandardMaterial
        ref={mat}
        color="#3f6f73"
        emissive="#2a8a8f"
        emissiveIntensity={0.12}
        roughness={0.25}
        metalness={0.1}
      />
    </mesh>
  );
}

/** Plank walkway along the river with posts and a railing. */
export function Boardwalk(props: { minX: number; maxX: number; minZ: number; maxZ: number }) {
  const w = props.maxX - props.minX;
  const d = props.maxZ - props.minZ;
  const cx = (props.minX + props.maxX) / 2;
  const cz = (props.minZ + props.maxZ) / 2;
  const planks = Math.floor(w / 0.5);
  return (
    <group>
      {Array.from({ length: planks }, (_, i) => (
        <mesh
          key={i}
          position={[props.minX + 0.25 + i * 0.5, 0.02, cz]}
          receiveShadow
        >
          <boxGeometry args={[0.46, 0.08, d]} />
          <meshStandardMaterial color={i % 3 === 0 ? '#8c6a48' : '#94714d'} />
        </mesh>
      ))}
      {/* Embankment under the walkway, visible from the camera angle */}
      <mesh position={[cx, -0.2, props.minZ + 0.05]}>
        <boxGeometry args={[w, 0.4, 0.1]} />
        <meshStandardMaterial color="#5c4430" />
      </mesh>
      {/* Railing on the river side */}
      <mesh position={[cx, 0.55, props.minZ + 0.1]} castShadow>
        <boxGeometry args={[w, 0.06, 0.06]} />
        <meshStandardMaterial color="#5c4430" />
      </mesh>
      {Array.from({ length: Math.floor(w / 1.5) + 1 }, (_, i) => (
        <mesh key={i} position={[props.minX + i * 1.5, 0.3, props.minZ + 0.1]} castShadow>
          <boxGeometry args={[0.08, 0.6, 0.08]} />
          <meshStandardMaterial color="#5c4430" />
        </mesh>
      ))}
    </group>
  );
}

/** Flat ground strip, e.g. a dirt path. */
export function GroundPatch(props: {
  x: number;
  z: number;
  width: number;
  depth: number;
  color: string;
  y?: number;
}) {
  return (
    <mesh rotation-x={-Math.PI / 2} position={[props.x, props.y ?? 0.005, props.z]} receiveShadow>
      <planeGeometry args={[props.width, props.depth]} />
      <meshStandardMaterial color={props.color} />
    </mesh>
  );
}
