import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { VillageSquare } from '../game/scenes/VillageSquare';
import { Hud } from '../game/ui/Hud';

export function App() {
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
