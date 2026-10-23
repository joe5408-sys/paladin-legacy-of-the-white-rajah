import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { gameStore } from '../game/core/gameStore';
import { useActionKey } from '../game/interaction/useActionKey';
import { VillageSquare } from '../game/scenes/VillageSquare';
import { Hud } from '../game/ui/Hud';

if (import.meta.env.DEV) {
  // Lets browser checks and future e2e tests inspect game state.
  (window as unknown as Record<string, unknown>).__PALADIN_STORE__ = gameStore;
}

export function App() {
  useActionKey();
  return (
    <div className="game-shell">
      <div className="game-frame">
        <Canvas
          orthographic
          shadows={{ type: THREE.PCFShadowMap }}
          dpr={[1, 2]}
          camera={{ near: 0.1, far: 100, position: [0, 15, 15] }}
          gl={{ antialias: true }}
        >
          <VillageSquare />
        </Canvas>
        <Hud location="Sungai Awan — Village Square" />
      </div>
    </div>
  );
}
