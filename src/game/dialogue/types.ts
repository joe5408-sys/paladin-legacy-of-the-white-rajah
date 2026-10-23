import type { CharacterId } from '../../data/characters';

/** Story flags record one-off events. Add new flags here so typos fail to compile. */
export type StoryFlag = 'met_lim' | 'saw_family_home';

export type StoryFlags = Partial<Record<StoryFlag, true>>;

export interface DialogueLine {
  /** Speaking character, or null for narration. */
  speaker: CharacterId | null;
  text: string;
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
export interface DialogueRule {
  dialogue: string;
  /** All of these flags must be set. */
  requires?: StoryFlag[];
  /** None of these flags may be set. */
  unless?: StoryFlag[];
}
