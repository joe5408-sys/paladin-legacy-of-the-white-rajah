/**
 * Story flags record one-off events. Add new flags here so typos fail to compile.
 * Story flags only ever go from unset to set. The one exception is puzzle state
 * (the waystation stones, Chapter 2), which a wrong move clears again.
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
  | 'c1_escaped' // escaped through the flood door (end of Chapter 1)
  // Chapter 2: The River Remembers
  | 'chapter2_started'
  | 'c2_arrived' // on the express boat, opening narration played
  | 'c2_talked_mara'
  | 'c2_saw_news' // the survey news on a passenger's phone
  | 'c2_talked_captain'
  | 'c2_reached_jetty' // arrived at Sungai Awan
  | 'c2_village_arrived'
  | 'c2_read_notice' // the Crown survey notice
  | 'c2_talked_lim'
  | 'c2_met_siti'
  | 'c2_met_pell'
  | 'c2_home_talked' // Mara points to the portrait
  | 'c2_found_map' // Elias's map behind the portrait
  | 'c2_went_upriver' // by longboat to the waystation landing
  | 'c2_landing_arrived'
  | 'c2_stone_deep' // puzzle: first stone lit (cleared by a wrong order)
  | 'c2_stone_bright' // puzzle: second stone lit (cleared by a wrong order)
  | 'c2_stones_woken' // all three stones lit; the waystation door opens
  | 'c2_spirit_defeated' // passed the training spirit's test
  | 'c2_learned_ward' // River Ward learned
  | 'c2_entered_hall' // inside the waystation
  | 'c2_read_journal' // Elias's journal
  | 'c2_read_oath' // the Paladin oath carved in full (optional)
  | 'c2_found_charter' // the River Charter of 1921
  | 'c2_daniel_returned'
  | 'c2_warden_seen' // the Hollow Warden on the landing
  | 'c2_warden_defeated' // the Hollow Warden; set off home with the Charter
  | 'c2_dusk_arrived' // back at Sungai Awan at dusk, ahead of the barge
  | 'c2_iron_seen' // confronted Pell; the Iron Warden steps off the barge
  | 'c2_iron_defeated'; // Chapter 2 complete

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
