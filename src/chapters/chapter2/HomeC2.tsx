/**
 * Chapter 2 — the Vale family home again (lazy-loaded scene). The prologue room;
 * once the map is found, the portrait lies face-down on the table showing it.
 */
import type { SpawnPoint } from '../../data/scenes';
import { useGame } from '../../game/core/gameStore';
import { FamilyHome } from '../../game/scenes/FamilyHome';
import { HOME_C2_LAYOUT } from './villageData';

export default function HomeC2({ spawn }: { spawn: SpawnPoint }) {
  const found = useGame((s) => !!s.flags.c2_found_map);
  return (
    <FamilyHome spawn={spawn} layout={HOME_C2_LAYOUT} showPortrait={!found}>
      <PortraitOnTable />
    </FamilyHome>
  );
}

/** The portrait's back, with Elias's ink map, laid on the table. */
function PortraitOnTable() {
  const found = useGame((s) => !!s.flags.c2_found_map);
  if (!found) return null;
  return (
    <group position={[-2.2, 0.8, 1.15]} rotation-y={0.12}>
      <mesh>
        <boxGeometry args={[0.95, 0.04, 0.7]} />
        <meshStandardMaterial color="#b8913f" />
      </mesh>
      <mesh position-y={0.025} rotation-x={-Math.PI / 2}>
        <planeGeometry args={[0.82, 0.58]} />
        <meshStandardMaterial color="#d8c8a0" />
      </mesh>
      {/* The river line and three ink marks */}
      <mesh position={[0, 0.028, 0]} rotation={[-Math.PI / 2, 0, 0.5]}>
        <planeGeometry args={[0.7, 0.03]} />
        <meshStandardMaterial color="#3a5a7a" />
      </mesh>
      {[[-0.15, -0.12], [0.08, 0.1], [0.22, -0.08]].map(([x, z], i) => (
        <mesh key={i} position={[x, 0.03, z]} rotation-x={-Math.PI / 2}>
          <circleGeometry args={[0.03, 8]} />
          <meshStandardMaterial color="#5a2a1a" />
        </mesh>
      ))}
    </group>
  );
}
