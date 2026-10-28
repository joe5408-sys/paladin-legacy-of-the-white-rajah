/**
 * Chapter 3 — the epilogue (lazy-loaded scene): Sungai Awan by day, a week after
 * the hearing. The Chapter 2 village with a new layout: the survey boat is gone,
 * the jetty has a new rail, the pulled-up survey pegs lie in a pile outside the
 * kedai, and one last peg stands by the Vale house until Adrian pulls it up.
 */
import type { SpawnPoint } from '../../data/scenes';
import { useGame } from '../../game/core/gameStore';
import { VillageSquare } from '../../game/scenes/VillageSquare';
import { MooredBoat, NoticeBoard, SurveyPeg } from '../chapter2/VillageC2';
import { EPILOGUE_LAYOUT, LAST_PEG, PEG_PILE } from './epilogueData';

export default function VillageEpilogue({ spawn }: { spawn: SpawnPoint }) {
  const pulled = useGame((s) => !!s.flags.c3_pegs_pulled);
  return (
    <VillageSquare spawn={spawn} layout={EPILOGUE_LAYOUT}>
      <NoticeBoard />
      {!pulled && <SurveyPeg x={LAST_PEG.x} z={LAST_PEG.z} />}
      <PegPile />
      {/* Ah Hock's longboat, tied up at the jetty in front of the square */}
      <MooredBoat x={0.4} z={-7.0} length={4.4} hull="#3f7fb8" stripe="#e8e2d2" />
      {/* The new section of jetty rail, still pale and unpainted, where the Iron Warden went through */}
      <mesh position={[10.0, 0.55, -6.15]} castShadow>
        <boxGeometry args={[1.8, 0.07, 0.07]} />
        <meshStandardMaterial color="#d8c49a" />
      </mesh>
    </VillageSquare>
  );
}

/** The pulled-up survey pegs, thrown in a heap outside the kedai. */
function PegPile() {
  const pegs = Array.from({ length: 14 }, (_, i) => ({
    x: ((i * 37) % 9) / 9 - 0.5,
    z: ((i * 53) % 7) / 7 - 0.5,
    rot: (i * 1.3) % Math.PI,
    tilt: 0.15 + ((i * 7) % 5) * 0.05,
    y: 0.04 + (i % 3) * 0.05,
  }));
  return (
    <group position={[PEG_PILE.x, 0, PEG_PILE.z]}>
      {pegs.map((p, i) => (
        <group key={i} position={[p.x * 0.7, p.y, p.z * 0.5]} rotation={[0, p.rot, Math.PI / 2 - p.tilt]}>
          <mesh castShadow>
            <boxGeometry args={[0.06, 0.5, 0.06]} />
            <meshStandardMaterial color="#c8a878" />
          </mesh>
          <mesh position-y={0.2}>
            <boxGeometry args={[0.08, 0.08, 0.08]} />
            <meshStandardMaterial color="#ff7a1a" emissive="#ff6a00" emissiveIntensity={0.2} />
          </mesh>
        </group>
      ))}
    </group>
  );
}
