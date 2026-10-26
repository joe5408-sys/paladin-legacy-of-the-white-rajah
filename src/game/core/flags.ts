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
  | 'c1_vault_found' // the sealed iron door woke and opened
  | 'c1_entered_vault'
  | 'c1_sentinel_defeated' // won the battle against the Hollow Sentinel
  | 'c1_inner_gate_open' // opened the inner vault
  | 'c1_entered_records'
  | 'c1_box_read' // read the VALE box: the concession and Elias Vale's charge sheet
  | 'c1_letter_found' // found the Rajah's reply
  | 'c1_security_arrived' // Lord Chamberlain Harrow and palace security arrive
  | 'c1_lights_out'
  | 'c1_escaped'; // escaped through the flood door (end of Chapter 1)

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
