import { useEffect } from 'react';
import { gameStore, useGame } from '../core/gameStore';

export const FADE_MS = 350;

/**
 * Black overlay for scene changes. Drives the store's transition:
 * fade out → swapScene() → fade in → finishTransition().
 */
export function SceneFade() {
  const phase = useGame((s) => s.transition?.phase ?? null);

  useEffect(() => {
    if (!phase) return;
    const next = phase === 'out' ? gameStore.getState().swapScene : gameStore.getState().finishTransition;
    const t = setTimeout(next, FADE_MS + 30);
    return () => clearTimeout(t);
  }, [phase]);

  return (
    <div
      className="scene-fade"
      style={{ opacity: phase === 'out' ? 1 : 0, transitionDuration: `${FADE_MS}ms` }}
      aria-hidden="true"
    />
  );
}
