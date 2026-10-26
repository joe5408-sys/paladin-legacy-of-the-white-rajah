import { useEffect, useState } from 'react';
import { gameStore } from '../core/gameStore';
import { buildSave, writeSave } from './save';

/**
 * Automatic checkpoints:
 *  - on arriving in a scene (after any arrival conversation has set its flags),
 *  - after winning the battle (back in the chamber, never mid-battle),
 *  - when the chapter is completed.
 * Shows a small "Saved" indicator.
 */
export function AutoSave() {
  const [shownAt, setShownAt] = useState(0);

  useEffect(() => {
    const checkpoint = () => {
      // Defer a tick so arrival dialogue can set its flags first.
      setTimeout(() => {
        const s = gameStore.getState();
        if (s.screen !== 'game' || s.battle) return;
        if (writeSave(buildSave(s, s.spawn))) setShownAt(Date.now());
      }, 0);
    };
    return gameStore.subscribe((s, prev) => {
      if (s.screen !== 'game' || prev.screen !== 'game') return;
      const arrived = prev.mode === 'transition' && s.mode !== 'transition';
      const wonBattle = !!s.flags.guardian_defeated && !prev.flags.guardian_defeated;
      const finished = s.mode === 'ending' && prev.mode !== 'ending';
      if (arrived || wonBattle || finished) checkpoint();
    });
  }, []);

  useEffect(() => {
    if (!shownAt) return;
    const t = setTimeout(() => setShownAt(0), 1800);
    return () => clearTimeout(t);
  }, [shownAt]);

  return shownAt ? (
    <div className="autosave pixel-panel" data-testid="autosave" aria-live="polite">
      ✦ Saved
    </div>
  ) : null;
}
