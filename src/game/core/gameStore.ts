/**
 * Global game state (Zustand). Holds the current scene, mode, story flags,
 * the interactable in range, the active conversation and scene transitions.
 * Per-frame data (positions, animation) stays in refs, not here.
 */
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { DIALOGUES } from '../../data/dialogue';
import {
  NEW_GAME_SCENE,
  NEW_GAME_SPAWN,
  SCENES,
  type SceneId,
  type SpawnPoint,
} from '../../data/scenes';
import { selectDialogue } from '../dialogue/rules';
import type { DialogueDef } from '../dialogue/types';
import type { StoryFlag, StoryFlags } from './flags';
import type { Interactable } from '../interaction/interaction';

export type GameMode = 'explore' | 'dialogue' | 'transition';

export interface ActiveDialogue {
  def: DialogueDef;
  index: number;
  /** True once the current line's typewriter effect has finished. */
  revealed: boolean;
  /** Interactable that started it (e.g. the NPC to turn toward the player). */
  source: Interactable | null;
  onComplete?: () => void;
}

export interface SceneTransition {
  /** 'out' = fading to black, 'in' = fading back from black in the new scene. */
  phase: 'out' | 'in';
  to: SceneId;
  spawn: string;
}

export interface GameState {
  scene: SceneId;
  spawn: SpawnPoint;
  mode: GameMode;
  flags: StoryFlags;
  nearby: Interactable | null;
  dialogue: ActiveDialogue | null;
  transition: SceneTransition | null;

  setNearby(target: Interactable | null): void;
  setFlags(flags: readonly StoryFlag[]): void;
  /** Runs the interaction for a target. Returns true if something happened. */
  interact(target: Interactable): boolean;
  startDialogue(id: string, opts?: { source?: Interactable; onComplete?: () => void }): boolean;
  revealLine(): void;
  advanceDialogue(): void;
  /** Routes an action key press (E / Enter / Space). Returns true if it was used. */
  pressAction(code: string): boolean;
  /** Starts a fade to another scene. */
  requestScene(to: SceneId, spawn: string): boolean;
  /** Called by the fade overlay once the screen is black: swaps the scene. */
  swapScene(): void;
  /** Called by the fade overlay once the new scene is visible. */
  finishTransition(): void;
  /** Plays the current scene's arrival conversation, if one applies. */
  arrive(): boolean;
  reset(): void;
}

const DIALOGUE_KEYS = new Set(['KeyE', 'Enter', 'Space', 'NumpadEnter']);

function spawnPoint(scene: SceneId, spawn: string): SpawnPoint {
  const point = SCENES[scene].spawns[spawn];
  if (!point) throw new Error(`Unknown spawn "${spawn}" in scene "${scene}"`);
  return point;
}

function initialState() {
  return {
    scene: NEW_GAME_SCENE,
    spawn: spawnPoint(NEW_GAME_SCENE, NEW_GAME_SPAWN),
    mode: 'explore' as GameMode,
    flags: {} as StoryFlags,
    nearby: null,
    dialogue: null,
    transition: null,
  };
}

export const gameStore = createStore<GameState>()((set, get) => ({
  ...initialState(),

  setNearby(target) {
    if (get().nearby?.id !== target?.id) set({ nearby: target });
  },

  setFlags(list) {
    if (list.length === 0 || list.every((f) => get().flags[f])) return;
    const flags = { ...get().flags };
    for (const f of list) flags[f] = true;
    set({ flags });
  },

  interact(target) {
    if (get().mode !== 'explore') return false;
    if (target.enter) return get().requestScene(target.enter.scene, target.enter.spawn);
    const id = target.dialogue ? selectDialogue(target.dialogue, get().flags) : null;
    return id ? get().startDialogue(id, { source: target }) : false;
  },

  startDialogue(id, opts = {}) {
    const def = DIALOGUES[id];
    if (!def || def.lines.length === 0 || get().mode !== 'explore') return false;
    set({
      mode: 'dialogue',
      nearby: null,
      dialogue: { def, index: 0, revealed: false, source: opts.source ?? null, onComplete: opts.onComplete },
    });
    get().setFlags(def.lines[0].setFlags ?? []);
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
      const index = d.index + 1;
      set({ dialogue: { ...d, index, revealed: false } });
      get().setFlags(d.def.lines[index].setFlags ?? []);
      return;
    }
    // Finished: apply story effects, return to exploration, then notify.
    set({ mode: 'explore', dialogue: null });
    get().setFlags(d.def.setFlags ?? []);
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
    if (s.mode === 'explore' && code === 'KeyE' && s.nearby) return s.interact(s.nearby);
    return false;
  },

  requestScene(to, spawn) {
    if (get().mode !== 'explore' || !SCENES[to]?.spawns[spawn]) return false;
    set({ mode: 'transition', nearby: null, transition: { phase: 'out', to, spawn } });
    return true;
  },

  swapScene() {
    const t = get().transition;
    if (!t || t.phase !== 'out') return;
    set({ scene: t.to, spawn: spawnPoint(t.to, t.spawn), transition: { ...t, phase: 'in' } });
  },

  finishTransition() {
    const t = get().transition;
    if (!t || t.phase !== 'in') return;
    set({ mode: 'explore', transition: null });
    get().arrive();
  },

  arrive() {
    const rules = SCENES[get().scene].arrival;
    const id = rules ? selectDialogue(rules, get().flags) : null;
    return id ? get().startDialogue(id) : false;
  },

  reset() {
    set(initialState());
  },
}));

/** React hook for components: subscribe to a slice of game state. */
export function useGame<T>(selector: (s: GameState) => T): T {
  return useStore(gameStore, selector);
}
