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
// Chapter 2
const Boat = lazy(() => import('../../chapters/chapter2/Boat'));
const VillageC2 = lazy(() => import('../../chapters/chapter2/VillageC2'));
const HomeC2 = lazy(() => import('../../chapters/chapter2/HomeC2'));
const Waystation = lazy(() => import('../../chapters/chapter2/Waystation'));
const Hall = lazy(() => import('../../chapters/chapter2/Hall'));
const JettyDusk = lazy(() => import('../../chapters/chapter2/JettyDusk'));
const BoatNight = lazy(() => import('../../chapters/chapter3/BoatNight'));
const WaterfrontNight = lazy(() => import('../../chapters/chapter3/WaterfrontNight'));
const JamilahRoom = lazy(() => import('../../chapters/chapter3/JamilahRoom'));
const PalaceGate = lazy(() => import('../../chapters/chapter3/PalaceGate'));

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
    case 'boat':
      return (
        <Suspense fallback={null}>
          <Boat key="boat" spawn={spawn} />
        </Suspense>
      );
    case 'village_c2':
      return (
        <Suspense fallback={null}>
          <VillageC2 key="village_c2" spawn={spawn} />
        </Suspense>
      );
    case 'home_c2':
      return (
        <Suspense fallback={null}>
          <HomeC2 key="home_c2" spawn={spawn} />
        </Suspense>
      );
    case 'waystation_landing':
      return (
        <Suspense fallback={null}>
          <Waystation key="waystation_landing" spawn={spawn} />
        </Suspense>
      );
    case 'waystation_hall':
      return (
        <Suspense fallback={null}>
          <Hall key="waystation_hall" spawn={spawn} />
        </Suspense>
      );
    case 'jetty_dusk':
      return (
        <Suspense fallback={null}>
          <JettyDusk key="jetty_dusk" spawn={spawn} />
        </Suspense>
      );
    case 'boat_night':
      return (
        <Suspense fallback={null}>
          <BoatNight key="boat_night" spawn={spawn} />
        </Suspense>
      );
    case 'waterfront_night':
      return (
        <Suspense fallback={null}>
          <WaterfrontNight key="waterfront_night" spawn={spawn} />
        </Suspense>
      );
    case 'jamilah_room':
      return (
        <Suspense fallback={null}>
          <JamilahRoom key="jamilah_room" spawn={spawn} />
        </Suspense>
      );
    case 'palace_gate':
      return (
        <Suspense fallback={null}>
          <PalaceGate key="palace_gate" spawn={spawn} />
        </Suspense>
      );
  }
}
