/**
 * Chapter 2 — Sungai Awan at dusk (lazy-loaded scene). The Chapter 2 village in
 * evening light, with the lamps lit, Harrow's black barge at the east end of the
 * jetty and the Iron Warden on its deck: under a tarpaulin, then on the
 * boardwalk, then gone into the river.
 */
import { useFrame } from '@react-three/fiber';
import { useRef } from 'react';
import * as THREE from 'three';
import type { SpawnPoint } from '../../data/scenes';
import { PROPS } from '../../data/villageSquare';
import { getIronWardenTexture, IRON_H, IRON_W } from '../../game/combat/ironWardenSprite';
import { CAMERA_PITCH_DEG } from '../../game/core/constants';
import { useGame } from '../../game/core/gameStore';
import { VillageSquare } from '../../game/scenes/VillageSquare';
import { BARGE, IRON_ON_BARGE, IRON_ON_JETTY, JETTY_LAYOUT } from './jettyData';
import { MooredBoat, NoticeBoard, SurveyPeg } from './VillageC2';
import { SURVEY_PEGS } from './villageData';

const HEIGHT_COMP = 1 / Math.cos(THREE.MathUtils.degToRad(CAMERA_PITCH_DEG));
const IRON_WIDTH = 2.6;
const IRON_HEIGHT = IRON_WIDTH * (IRON_H / IRON_W) * HEIGHT_COMP;
const LAMPS = PROPS.filter((p) => p.kind === 'lamp');

export default function JettyDusk({ spawn }: { spawn: SpawnPoint }) {
  return (
    <VillageSquare spawn={spawn} layout={JETTY_LAYOUT} lighting="dusk">
      <NoticeBoard />
      {SURVEY_PEGS.map((p, i) => (
        <SurveyPeg key={i} x={p.x} z={p.z} />
      ))}
      {/* Ah Hock's longboat, back at the west end of the jetty */}
      <MooredBoat x={-9.2} z={-7.0} length={4.4} hull="#3f7fb8" stripe="#e8e2d2" />
      {/* The village lamps are lit */}
      {LAMPS.map((l, i) => (
        <pointLight key={i} position={[l.x, 2.3, l.z]} color="#ffc878" intensity={6} distance={7} decay={1.6} />
      ))}
      <Barge />
      <IronWarden />
    </VillageSquare>
  );
}

/** A long black barge with an orange company stripe and floodlights on a crane. */
function Barge() {
  const { x, z, length, width } = BARGE;
  return (
    <group position={[x, -0.3, z]}>
      <mesh position-y={0.2} castShadow>
        <boxGeometry args={[length, 0.6, width]} />
        <meshStandardMaterial color="#24242a" roughness={0.8} />
      </mesh>
      <mesh position={[0, 0.3, width / 2 + 0.006]}>
        <planeGeometry args={[length, 0.14]} />
        <meshStandardMaterial color="#d8742a" emissive="#d8742a" emissiveIntensity={0.3} />
      </mesh>
      {/* Wheelhouse at the stern (east) */}
      <mesh position={[length / 2 - 1.0, 0.95, -0.3]} castShadow>
        <boxGeometry args={[1.4, 0.9, 1.4]} />
        <meshStandardMaterial color="#3a3a42" />
      </mesh>
      <mesh position={[length / 2 - 1.0, 1.05, 0.41]}>
        <planeGeometry args={[1.0, 0.25]} />
        <meshBasicMaterial color="#ffd89a" toneMapped={false} />
      </mesh>
      {/* Crane mast and arm with floodlights pointing at the boardwalk */}
      <mesh position={[-length / 2 + 0.8, 1.8, -0.6]} castShadow>
        <boxGeometry args={[0.18, 3.0, 0.18]} />
        <meshStandardMaterial color="#c8a040" />
      </mesh>
      <mesh position={[-length / 2 + 2.0, 3.2, -0.6]} rotation-z={-0.15}>
        <boxGeometry args={[2.6, 0.14, 0.14]} />
        <meshStandardMaterial color="#c8a040" />
      </mesh>
      {[-length / 2 + 1.4, -length / 2 + 2.8].map((fx) => (
        <group key={fx} position={[fx, 3.0, -0.4]}>
          <mesh>
            <boxGeometry args={[0.36, 0.22, 0.2]} />
            <meshBasicMaterial color="#fff2c8" toneMapped={false} />
          </mesh>
          <pointLight position={[0, -0.4, 1.4]} color="#fff0d0" intensity={10} distance={9} decay={1.6} />
        </group>
      ))}
    </group>
  );
}

/** Under a tarpaulin on the barge, then on the boardwalk; after the battle, steam on the water. */
function IronWarden() {
  const seen = useGame((s) => !!s.flags.c2_iron_seen);
  const defeated = useGame((s) => !!s.flags.c2_iron_defeated);
  const glow = useRef<THREE.PointLight>(null);
  useFrame(({ clock }) => {
    if (glow.current) glow.current.intensity = 2.2 + Math.sin(clock.elapsedTime * 2.6) * 0.8;
  });

  if (defeated) {
    // Where it fell: a ring of disturbed water and a broken section of rail
    return (
      <group>
        <mesh rotation-x={-Math.PI / 2} position={[IRON_ON_JETTY.x - 0.4, -0.33, -7.0]}>
          <ringGeometry args={[0.6, 1.3, 24]} />
          <meshBasicMaterial color="#d8c8b8" transparent opacity={0.35} depthWrite={false} />
        </mesh>
        <mesh position={[IRON_ON_JETTY.x - 0.6, 0.2, -6.4]} rotation-z={0.7}>
          <boxGeometry args={[1.2, 0.06, 0.06]} />
          <meshStandardMaterial color="#5c4430" />
        </mesh>
      </group>
    );
  }

  if (!seen) {
    // A great shape under green canvas on the barge's deck
    return (
      <group position={[IRON_ON_BARGE.x, 0.3, IRON_ON_BARGE.z]}>
        <mesh position-y={1.3} castShadow>
          <cylinderGeometry args={[0.7, 1.15, 2.6, 7]} />
          <meshStandardMaterial color="#4e5c36" roughness={0.95} flatShading />
        </mesh>
        <mesh position-y={2.75} castShadow>
          <sphereGeometry args={[0.62, 7, 5]} />
          <meshStandardMaterial color="#4e5c36" roughness={0.95} flatShading />
        </mesh>
      </group>
    );
  }

  return (
    <group position={[IRON_ON_JETTY.x, 0, IRON_ON_JETTY.z]}>
      <mesh rotation-x={-Math.PI / 2} position={[0, 0.05, 0.1]}>
        <circleGeometry args={[0.9, 20]} />
        <meshBasicMaterial color="#000" transparent opacity={0.5} depthWrite={false} />
      </mesh>
      <mesh position-y={IRON_HEIGHT / 2}>
        <planeGeometry args={[IRON_WIDTH, IRON_HEIGHT]} />
        <meshBasicMaterial map={getIronWardenTexture(true)} alphaTest={0.5} toneMapped={false} />
      </mesh>
      <pointLight ref={glow} position={[0, IRON_HEIGHT * 0.55, 0.6]} color="#ff8a2a" intensity={2.2} distance={4} />
    </group>
  );
}
