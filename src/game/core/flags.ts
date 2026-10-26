/**
 * Story flags record one-off events. Add new flags here so typos fail to compile.
 * Flags only ever go from unset to set; nothing in the prologue unsets them.
 */
export type StoryFlag =
  | 'arrived' // opening narration in the village has played
  | 'met_lim'
  | 'entered_home'
  | 'met_mara'
  | 'heirloom_awakened'
  | 'passage_open'
  | 'entered_chamber'
  | 'guardian_defeated'
  | 'read_message'
  | 'daniel_arrived'
  | 'met_daniel'
  | 'prologue_complete'
  // Chapter 1: The Capital's Shadow
  | 'chapter1_started'
  | 'c1_arrived'
  | 'c1_met_daniel'
  | 'c1_archives_reached' // waited for dawn at the Archives door
  | 'c1_entered_archives'
  | 'c1_met_archivist'
  | 'c1_clue_gap' // found the gap where the Vale folder should be
  | 'c1_hint_household' // the Archivist pointed to the household ledgers
  | 'c1_file_found' // read the redacted Vale file
  | 'c1_vault_found'; // the sealed iron door woke (milestone 1.2 cliffhanger)

export type StoryFlags = Partial<Record<StoryFlag, true>>;

/** A requirement on story state, used by dialogue rules and interactables. */
export interface Condition {
  /** All of these flags must be set. */
  requires?: StoryFlag[];
  /** None of these flags may be set. */
  unless?: StoryFlag[];
}

export function meetsCondition(cond: Condition | undefined, flags: StoryFlags): boolean {
  if (!cond) return true;
  return (
    (cond.requires ?? []).every((f) => flags[f]) && (cond.unless ?? []).every((f) => !flags[f])
  );
}
