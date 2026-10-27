/**
 * Chapter 2 — Sungai Awan, changed (lazy-loaded scene). The prologue village with
 * a Crown notice board, survey pegs, the Awan Riverlands survey boat and
 * Ah Hock's blue longboat.
 */
import type { SpawnPoint } from '../../data/scenes';
import { VillageSquare } from '../../game/scenes/VillageSquare';
import { NOTICE_BOARD, SURVEY_PEGS, VILLAGE_C2_LAYOUT } from './villageData';

export default function VillageC2({ spawn }: { spawn: SpawnPoint }) {
  return (
    <VillageSquare spawn={spawn} layout={VILLAGE_C2_LAYOUT}>
      <NoticeBoard />
      {SURVEY_PEGS.map((p, i) => (
        <SurveyPeg key={i} x={p.x} z={p.z} />
      ))}
      {/* The survey boat (east) and Ah Hock's longboat (west), moored off the boardwalk */}
      <MooredBoat x={9.0} z={-7.3} length={5.0} hull="#f4f4f0" stripe="#3a6a8a" cabin />
      <MooredBoat x={-9.2} z={-7.0} length={4.4} hull="#3f7fb8" stripe="#e8e2d2" />
    </VillageSquare>
  );
}

export function NoticeBoard() {
  return (
    <group position={[NOTICE_BOARD.x, 0, NOTICE_BOARD.z]}>
      {[-0.42, 0.42].map((x) => (
        <mesh key={x} position={[x, 0.7, 0]} castShadow>
          <boxGeometry args={[0.08, 1.4, 0.08]} />
          <meshStandardMaterial color="#5a4030" />
        </mesh>
      ))}
      <mesh position={[0, 1.05, 0]} castShadow>
        <boxGeometry args={[NOTICE_BOARD.width, 0.7, 0.06]} />
        <meshStandardMaterial color="#7a5a3c" />
      </mesh>
      {/* The Crown notice, crisp and white among older, faded papers */}
      <mesh position={[0.12, 1.06, 0.035]}>
        <planeGeometry args={[0.42, 0.52]} />
        <meshStandardMaterial color="#f6f4ec" />
      </mesh>
      <mesh position={[0.12, 1.25, 0.04]}>
        <planeGeometry args={[0.3, 0.06]} />
        <meshStandardMaterial color="#b8302e" />
      </mesh>
      <mesh position={[-0.27, 1.0, 0.035]} rotation-z={0.08}>
        <planeGeometry args={[0.28, 0.36]} />
        <meshStandardMaterial color="#d8cfa8" />
      </mesh>
    </group>
  );
}

export function SurveyPeg({ x, z }: { x: number; z: number }) {
  return (
    <group position={[x, 0, z]}>
      <mesh position-y={0.25} castShadow>
        <boxGeometry args={[0.06, 0.5, 0.06]} />
        <meshStandardMaterial color="#c8a878" />
      </mesh>
      <mesh position-y={0.43}>
        <boxGeometry args={[0.08, 0.08, 0.08]} />
        <meshStandardMaterial color="#ff7a1a" emissive="#ff6a00" emissiveIntensity={0.25} />
      </mesh>
      {/* Tape streamer */}
      <mesh position={[0.1, 0.4, 0]} rotation-z={-0.5}>
        <planeGeometry args={[0.2, 0.04]} />
        <meshStandardMaterial color="#ff7a1a" side={2} />
      </mesh>
    </group>
  );
}

export function MooredBoat({
  x,
  z,
  length,
  hull,
  stripe,
  cabin,
}: {
  x: number;
  z: number;
  length: number;
  hull: string;
  stripe: string;
  cabin?: boolean;
}) {
  return (
    <group position={[x, -0.3, z]}>
      <mesh position-y={0.15} castShadow>
        <boxGeometry args={[length, 0.4, 1.1]} />
        <meshStandardMaterial color={hull} />
      </mesh>
      <mesh position={[0, 0.2, 0.556]}>
        <planeGeometry args={[length, 0.1]} />
        <meshStandardMaterial color={stripe} />
      </mesh>
      {/* Pointed bow */}
      <mesh position={[-length / 2 - 0.25, 0.15, 0]} rotation-y={Math.PI / 4}>
        <boxGeometry args={[0.75, 0.4, 0.75]} />
        <meshStandardMaterial color={hull} />
      </mesh>
      {cabin && (
        <mesh position={[0.6, 0.65, 0]} castShadow>
          <boxGeometry args={[1.8, 0.6, 0.9]} />
          <meshStandardMaterial color="#e8ecee" />
        </mesh>
      )}
    </group>
  );
}
