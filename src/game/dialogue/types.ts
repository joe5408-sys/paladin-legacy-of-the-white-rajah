import type { CharacterId } from '../../data/characters';
import type { Condition, StoryFlag } from '../core/flags';

export type { StoryFlag, StoryFlags } from '../core/flags';

export interface DialogueLine {
  /** Speaking character, or null for narration. */
  speaker: CharacterId | null;
  text: string;
  /** Flags set the moment this line appears (e.g. trigger a visual effect mid-scene). */
  setFlags?: StoryFlag[];
  /** Presentation style. 'inscription' = words read from an ancient carving. */
  style?: 'inscription';
}

export interface DialogueDef {
  id: string;
  lines: DialogueLine[];
  /** Flags set when the conversation finishes. */
  setFlags?: StoryFlag[];
  /** Encounter id to start when the conversation finishes. */
  startBattle?: string;
  /** Conversation that follows immediately when this one finishes. */
  next?: string;
  /** Finishing this conversation completes the chapter. */
  endChapter?: boolean;
}

/**
 * Picks a conversation based on story state. Rules are checked in order;
 * the first rule whose conditions pass wins.
 */
export interface DialogueRule extends Condition {
  dialogue: string;
}
