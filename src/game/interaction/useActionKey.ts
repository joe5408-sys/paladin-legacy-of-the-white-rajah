import { useEffect } from 'react';
import { gameStore } from '../core/gameStore';

/**
 * One window-level handler for the action keys (E, plus Enter/Space in dialogue).
 * A single handler means one key press can never both open and advance a conversation.
 */
export function useActionKey() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return; // holding E must not skip through dialogue
      if (gameStore.getState().pressAction(e.code)) e.preventDefault();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}
