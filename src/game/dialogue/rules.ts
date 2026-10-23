import type { DialogueRule, StoryFlags } from './types';

/** Returns the dialogue id of the first rule that matches the flags, or null. */
export function selectDialogue(rules: readonly DialogueRule[], flags: StoryFlags): string | null {
  for (const rule of rules) {
    const hasAll = (rule.requires ?? []).every((f) => flags[f]);
    const hasNone = (rule.unless ?? []).every((f) => !flags[f]);
    if (hasAll && hasNone) return rule.dialogue;
  }
  return null;
}
