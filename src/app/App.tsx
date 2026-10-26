import { Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { AudioDirector } from '../game/audio/AudioDirector';
import { gameStore, useGame } from '../game/core/gameStore';
import { useActionKey } from '../game/interaction/useActionKey';
import { AutoSave } from '../game/save/AutoSave';
import { SceneView } from '../game/scenes/SceneView';
import { Hud } from '../game/ui/Hud';
import { PauseMenu, usePauseKey } from '../game/ui/PauseMenu';
import { TitleScreen } from '../game/ui/TitleScreen';
import { ErrorBoundary } from './ErrorBoundary';

if (import.meta.env.DEV) {
  // Lets browser checks and future e2e tests inspect game state.
  (window as unknown as Record<string, unknown>).__PALADIN_STORE__ = gameStore;
}

export function App() {
  const screen = useGame((s) => s.screen);
  useActionKey();
  usePauseKey();

  return (
    <div className="game-shell">
      <div className="game-frame">
        <AudioDirector />
        <ErrorBoundary>
          {screen === 'title' ? (
            <TitleScreen />
          ) : (
            <>
              <Canvas
                orthographic
                shadows={{ type: THREE.PCFShadowMap }}
                dpr={[1, 2]}
                camera={{ near: 0.1, far: 100, position: [0, 15, 15] }}
                gl={{ antialias: true }}
              >
                <SceneView />
              </Canvas>
              <Hud />
              <AutoSave />
              <PauseMenu />
            </>
          )}
        </ErrorBoundary>
      </div>
    </div>
  );
}
