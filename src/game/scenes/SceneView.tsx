import { lazy, Suspense } from 'react';
import { BattleArena } from '../combat/BattleArena';
import { useGame } from '../core/gameStore';
import { AncientChamber } from './AncientChamber';
import { FamilyHome } from './FamilyHome';
import { VillageSquare } from './VillageSquare';

// Chapter 1 scenes are split into their own download, fetched only when needed.
const Waterfront = lazy(() => import('../../chapters/chapter1/Waterfront'));
const Archives = lazy(() => import('../../chapters/chapter1/Archives'));
const Vault = lazy(() => import('../../chapters/chapter1/Vault'));
const Records = lazy(() => import('../../chapters/chapter1/Records'));

/**
 * Renders the active scene, or the battle arena during a battle.
 * The key remounts a scene so each visit starts fresh at its spawn.
 */
export function SceneView() {
  const scene = useGame((s) => s.scene);
  const spawn = useGame((s) => s.spawn);
  const inBattle = useGame((s) => s.battle !== null);
  if (inBattle) return <BattleArena key="battle" />;
  switch (scene) {
    case 'village':
      return <VillageSquare key="village" spawn={spawn} />;
    case 'home':
      return <FamilyHome key="home" spawn={spawn} />;
    case 'chamber':
      return <AncientChamber key="chamber" spawn={spawn} />;
    case 'waterfront':
      return (
        <Suspense fallback={null}>
          <Waterfront key="waterfront" spawn={spawn} />
        </Suspense>
      );
    case 'archives':
      return (
        <Suspense fallback={null}>
          <Archives key="archives" spawn={spawn} />
        </Suspense>
      );
    case 'vault':
      return (
        <Suspense fallback={null}>
          <Vault key="vault" spawn={spawn} />
        </Suspense>
      );
    case 'records':
      return (
        <Suspense fallback={null}>
          <Records key="records" spawn={spawn} />
        </Suspense>
      );
  }
}
