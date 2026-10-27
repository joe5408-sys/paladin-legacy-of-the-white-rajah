import type { CharacterId } from '../../data/characters';
import type { SceneId } from '../../data/scenes';
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

/**
 * A reply the player can pick after a conversation's last line (Chapter 3).
 * Choosing it applies its flags and starts its conversation. Choices never fail:
 * a wrong answer simply leads to a conversation that offers the choice again.
 */
export interface DialogueChoice extends Condition {
  id: string;
  label: string;
  /** Conversation that follows. */
  next: string;
  setFlags?: StoryFlag[];
}

export interface DialogueDef {
  id: string;
  lines: DialogueLine[];
  /**
   * Replies offered after the last line. The conversation's own setFlags apply
   * first; its startBattle/next/endChapter/enterScene are not used when a choice is made.
   * Only choices whose conditions pass are shown; with none, the conversation ends normally.
   */
  choices?: DialogueChoice[];
  /** Flags set when the conversation finishes. */
  setFlags?: StoryFlag[];
  /** Puzzle flags unset when the conversation finishes (e.g. stones going dark again). */
  clearFlags?: StoryFlag[];
  /** Encounter id to start when the conversation finishes. */
  startBattle?: string;
  /** Conversation that follows immediately when this one finishes. */
  next?: string;
  /** Finishing this conversation completes the chapter. */
  endChapter?: boolean;
  /** Scene to move to when the conversation finishes (e.g. a time skip into a building). */
  enterScene?: { scene: SceneId; spawn: string };
}

/**
 * Picks a conversation based on story state. Rules are checked in order;
 * the first rule whose conditions pass wins.
 */
export interface DialogueRule extends Condition {
  dialogue: string;
}
