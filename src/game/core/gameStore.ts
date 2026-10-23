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
import { ENCOUNTERS, PLAYER_BATTLE_STATS, type EncounterDef } from '../../data/encounters';
import {
  createBattle,
  describeEvent,
  enemyAction,
  playerAction,
  type BattleEvent,
  type BattleState,
  type Command,
} from '../combat/battle';
import { selectDialogue } from '../dialogue/rules';
import type { DialogueDef } from '../dialogue/types';
import type { StoryFlag, StoryFlags } from './flags';
import type { Interactable } from '../interaction/interaction';

export type GameMode = 'explore' | 'dialogue' | 'transition' | 'battle' | 'ending';

/**
 * UI pacing of a battle. The rules live in combat/battle.ts; stages only
 * decide what the screen shows and when the next step runs.
 */
export type BattleStage =
  | 'intro' // opening message
  | 'command' // waiting for the player's choice
  | 'player_action' // showing the player's action
  | 'enemy_action' // showing the enemy's action
  | 'victory'
  | 'defeat';

export interface ActiveBattle {
  encounter: EncounterDef;
  state: BattleState;
  stage: BattleStage;
  message: string;
  /** Increments with every action so animations can detect new events. */
  seq: number;
  lastEvent: BattleEvent | null;
}

const PROMPT_MESSAGE = 'What will Adrian do?';

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
  battle: ActiveBattle | null;
  /** Wall-clock time (ms) when this playthrough started and when the chapter ended. */
  startedAt: number;
  completedAt: number | null;

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
  /** Switches to battle mode for an encounter. */
  startBattle(encounterId: string): boolean;
  /** Player picks a command (only during the 'command' stage). */
  chooseCommand(cmd: Command): boolean;
  /** Moves the battle to its next stage (called by the UI's pacing timer or a key press). */
  advanceBattle(): void;
  /** Restarts the encounter from full HP and charges after a defeat. */
  retryBattle(): boolean;
  /** Ends the chapter: freezes play and shows the completion screen. */
  endChapter(): void;
  /** Fresh playthrough from the opening scene. */
  newGame(): void;
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
    battle: null,
    startedAt: Date.now(),
    completedAt: null,
  };
}

function freshBattle(encounter: EncounterDef, stage: BattleStage, message: string): ActiveBattle {
  return {
    encounter,
    state: createBattle(PLAYER_BATTLE_STATS, encounter),
    stage,
    message,
    seq: 0,
    lastEvent: null,
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
    if (d.def.startBattle) get().startBattle(d.def.startBattle);
    else if (d.def.next) get().startDialogue(d.def.next);
    else if (d.def.endChapter) get().endChapter();
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

  startBattle(encounterId) {
    const encounter = ENCOUNTERS[encounterId];
    if (!encounter || get().mode !== 'explore') return false;
    set({
      mode: 'battle',
      nearby: null,
      battle: freshBattle(encounter, 'intro', encounter.intro),
      // Where the exploration scene resumes once the battle ends.
      spawn: spawnPoint(encounter.returnTo.scene, encounter.returnTo.spawn),
    });
    return true;
  },

  chooseCommand(cmd) {
    const b = get().battle;
    if (!b || b.stage !== 'command') return false;
    const result = playerAction(b.state, PLAYER_BATTLE_STATS, cmd);
    if (!result) return false; // e.g. no Radiant Strike charges left
    set({
      battle: {
        ...b,
        state: result.state,
        stage: 'player_action',
        message: describeEvent(result.event, PLAYER_BATTLE_STATS, b.encounter),
        seq: b.seq + 1,
        lastEvent: result.event,
      },
    });
    return true;
  },

  advanceBattle() {
    const b = get().battle;
    if (!b) return;
    switch (b.stage) {
      case 'intro':
        set({ battle: { ...b, stage: 'command', message: PROMPT_MESSAGE } });
        return;
      case 'player_action': {
        if (b.state.phase === 'victory') {
          set({
            battle: { ...b, stage: 'victory', message: `The ${b.encounter.enemyName} falls to one knee!` },
          });
          return;
        }
        const result = enemyAction(b.state, PLAYER_BATTLE_STATS, b.encounter);
        if (!result) return;
        set({
          battle: {
            ...b,
            state: result.state,
            stage: 'enemy_action',
            message: describeEvent(result.event, PLAYER_BATTLE_STATS, b.encounter),
            seq: b.seq + 1,
            lastEvent: result.event,
          },
        });
        return;
      }
      case 'enemy_action':
        set({
          battle:
            b.state.phase === 'defeat'
              ? { ...b, stage: 'defeat', message: 'Adrian collapses to the stone floor...' }
              : { ...b, stage: 'command', message: PROMPT_MESSAGE },
        });
        return;
      case 'victory': {
        // Back to exploration, then the story continues.
        set({ mode: 'explore', battle: null });
        get().setFlags(b.encounter.victoryFlags);
        if (b.encounter.victoryDialogue) get().startDialogue(b.encounter.victoryDialogue);
        return;
      }
      default:
        return; // 'command' waits for chooseCommand, 'defeat' waits for retryBattle
    }
  },

  retryBattle() {
    const b = get().battle;
    if (!b || b.stage !== 'defeat') return false;
    set({
      battle: freshBattle(b.encounter, 'command', `The ${b.encounter.enemyName} waits. Steady yourself and try again.`),
    });
    return true;
  },

  endChapter() {
    if (get().mode === 'ending') return;
    set({ mode: 'ending', nearby: null, completedAt: Date.now() });
    get().setFlags(['prologue_complete']);
  },

  newGame() {
    set(initialState());
    get().arrive();
  },

  reset() {
    set(initialState());
  },
}));

/** React hook for components: subscribe to a slice of game state. */
export function useGame<T>(selector: (s: GameState) => T): T {
  return useStore(gameStore, selector);
}
