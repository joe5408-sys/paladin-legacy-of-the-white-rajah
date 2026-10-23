import { meetsCondition, type StoryFlags } from '../core/flags';
import type { DialogueRule } from './types';

/** Returns the dialogue id of the first rule that matches the flags, or null. */
export function selectDialogue(rules: readonly DialogueRule[], flags: StoryFlags): string | null {
  return rules.find((rule) => meetsCondition(rule, flags))?.dialogue ?? null;
}
