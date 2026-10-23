/**
 * Chapter 0 objectives, in order. Each one completes when its flag is set.
 * Flags can only be set by story interactions that are themselves gated on
 * earlier flags, so objectives cannot be skipped.
 */
import type { StoryFlag } from '../game/core/flags';

export interface Objective {
  id: string;
  text: string;
  completeWhen: StoryFlag;
}

export const PROLOGUE_OBJECTIVES: Objective[] = [
  { id: 'find_home', text: 'Find the ancestral family home.', completeWhen: 'entered_home' },
  { id: 'talk_mara', text: 'Speak with Aunt Mara.', completeWhen: 'met_mara' },
  { id: 'inspect_heirloom', text: 'Inspect the heirloom.', completeWhen: 'heirloom_awakened' },
  { id: 'enter_chamber', text: 'Enter the ancient chamber.', completeWhen: 'entered_chamber' },
  { id: 'defeat_guardian', text: 'Defeat the Guardian.', completeWhen: 'guardian_defeated' },
  { id: 'read_message', text: 'Read the ancestral message.', completeWhen: 'read_message' },
];
