/**
 * Global game state (Zustand). Holds the current mode, story flags,
 * the interactable in range, and the active conversation.
 * Per-frame data (positions, animation) stays in refs, not here.
 */
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { DIALOGUES } from '../../data/dialogue';
import { selectDialogue } from '../dialogue/rules';
import type { DialogueDef, StoryFlag, StoryFlags } from '../dialogue/types';
import type { Interactable } from '../interaction/interaction';

export type GameMode = 'explore' | 'dialogue';

export interface ActiveDialogue {
  def: DialogueDef;
  index: number;
  /** True once the current line's typewriter effect has finished. */
  revealed: boolean;
  /** Interactable that started it (e.g. the NPC to turn toward the player). */
  source: Interactable | null;
  onComplete?: () => void;
}

export interface GameState {
  mode: GameMode;
  flags: StoryFlags;
  nearby: Interactable | null;
  dialogue: ActiveDialogue | null;

  setNearby(target: Interactable | null): void;
  setFlag(flag: StoryFlag): void;
  /** Runs the interaction for a target. Returns true if something happened. */
  interact(target: Interactable): boolean;
  startDialogue(id: string, opts?: { source?: Interactable; onComplete?: () => void }): boolean;
  revealLine(): void;
  advanceDialogue(): void;
  /** Routes an action key press (E / Enter / Space). Returns true if it was used. */
  pressAction(code: string): boolean;
  reset(): void;
}

const DIALOGUE_KEYS = new Set(['KeyE', 'Enter', 'Space', 'NumpadEnter']);

const initial = {
  mode: 'explore' as GameMode,
  flags: {} as StoryFlags,
  nearby: null,
  dialogue: null,
};

export const gameStore = createStore<GameState>()((set, get) => ({
  ...initial,

  setNearby(target) {
    if (get().nearby?.id !== target?.id) set({ nearby: target });
  },

  setFlag(flag) {
    set((s) => ({ flags: { ...s.flags, [flag]: true } }));
  },

  interact(target) {
    if (get().mode !== 'explore') return false;
    switch (target.kind) {
      case 'talk':
      case 'inspect': {
        const id = target.dialogue ? selectDialogue(target.dialogue, get().flags) : null;
        return id ? get().startDialogue(id, { source: target }) : false;
      }
      default:
        // collect / activate / enter arrive with later phases.
        return false;
    }
  },

  startDialogue(id, opts = {}) {
    const def = DIALOGUES[id];
    if (!def || def.lines.length === 0 || get().mode !== 'explore') return false;
    set({
      mode: 'dialogue',
      dialogue: { def, index: 0, revealed: false, source: opts.source ?? null, onComplete: opts.onComplete },
    });
    return true;
  },

  revealLine() {
    const d = get().dialogue;
    if (d && !d.revealed) set({ dialogue: { ...d, revealed: true } });
  },

  advanceDialogue() {
    const d = get().dialogue;
    if (!d) return;
    if (d.index + 1 < d.def.lines.length) {
      set({ dialogue: { ...d, index: d.index + 1, revealed: false } });
      return;
    }
    // Finished: apply story effects, return to exploration, then notify.
    const flags = { ...get().flags };
    for (const f of d.def.setFlags ?? []) flags[f] = true;
    set({ mode: 'explore', dialogue: null, flags });
    d.onComplete?.();
  },

  pressAction(code) {
    const s = get();
    if (s.mode === 'dialogue') {
      if (!DIALOGUE_KEYS.has(code)) return false;
      if (s.dialogue?.revealed) s.advanceDialogue();
      else s.revealLine(); // first press skips the typewriter
      return true;
    }
    if (code === 'KeyE' && s.nearby) return s.interact(s.nearby);
    return false;
  },

  reset() {
    set({ ...initial, flags: {} });
  },
}));

/** React hook for components: subscribe to a slice of game state. */
export function useGame<T>(selector: (s: GameState) => T): T {
  return useStore(gameStore, selector);
}
