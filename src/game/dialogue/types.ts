import type { CharacterId } from '../../data/characters';
import type { Condition, StoryFlag } from '../core/flags';

export type { StoryFlag, StoryFlags } from '../core/flags';

export interface DialogueLine {
  /** Speaking character, or null for narration. */
  speaker: CharacterId | null;
  text: string;
  /** Flags set the moment this line appears (e.g. trigger a visual effect mid-scene). */
  setFlags?: StoryFlag[];
}

export interface DialogueDef {
  id: string;
  lines: DialogueLine[];
  /** Flags set when the conversation finishes. */
  setFlags?: StoryFlag[];
}

/**
 * Picks a conversation based on story state. Rules are checked in order;
 * the first rule whose conditions pass wins.
 */
export interface DialogueRule extends Condition {
  dialogue: string;
}
