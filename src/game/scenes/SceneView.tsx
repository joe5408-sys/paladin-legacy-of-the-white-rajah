import { useGame } from '../core/gameStore';
import { AncientChamber } from './AncientChamber';
import { FamilyHome } from './FamilyHome';
import { VillageSquare } from './VillageSquare';

/** Renders the active scene. The key remounts it so each visit starts fresh at its spawn. */
export function SceneView() {
  const scene = useGame((s) => s.scene);
  const spawn = useGame((s) => s.spawn);
  switch (scene) {
    case 'village':
      return <VillageSquare key="village" spawn={spawn} />;
    case 'home':
      return <FamilyHome key="home" spawn={spawn} />;
    case 'chamber':
      return <AncientChamber key="chamber" spawn={spawn} />;
  }
}
