/**
 * Chapter 3, Milestone 3.1 (The Long Way Down): lazy loading, the hand-off from
 * the Chapter 2 Complete card, the night boat's conversations in order, the
 * max-HP raise, saves and the "to be continued" ending.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { gameStore } from '../../src/game/core/gameStore';
import { chaptersNeededFor, hasChapterAfter, loadChapter } from '../../src/chapters/loader';
import { DIALOGUES } from '../../src/data/dialogue';
import { getLayout } from '../../src/data/layouts';
import { OBJECTIVES_BY_CHAPTER } from '../../src/data/quests';
import { SCENES } from '../../src/data/scenes';
import { CHAPTER3_MAX_HP, ENCOUNTERS, PLAYER_BATTLE_STATS, playerStatsFor, RIVER_WARD } from '../../src/data/encounters';
import { activeChapter, currentObjective, isAtChapterEnd, objectivesFor } from '../../src/game/quests/quests';
import { isAvailable } from '../../src/game/interaction/interaction';
import { buildSave, validateSave } from '../../src/game/save/save';
import type { StoryFlag } from '../../src/game/core/flags';

const s = () => gameStore.getState();

/** Every flag of a finished game up to the Chapter 2 Complete card. */
const CHAPTER2_DONE: StoryFlag[] = [
  'arrived', 'entered_home', 'met_mara', 'heirloom_awakened', 'passage_open', 'entered_chamber',
  'guardian_defeated', 'read_message', 'daniel_arrived', 'met_daniel', 'prologue_complete',
  'chapter1_started', 'c1_arrived', 'c1_met_daniel', 'c1_archives_reached', 'c1_entered_archives',
  'c1_met_archivist', 'c1_clue_gap', 'c1_hint_household', 'c1_file_found', 'c1_vault_found',
  'c1_entered_vault', 'c1_sentinel_defeated', 'c1_inner_gate_open', 'c1_entered_records',
  'c1_box_read', 'c1_letter_found', 'c1_security_arrived', 'c1_lights_out', 'c1_escaped',
  'chapter2_started', 'c2_arrived', 'c2_talked_mara', 'c2_saw_news', 'c2_talked_captain', 'c2_reached_jetty',
  'c2_village_arrived', 'c2_read_notice', 'c2_talked_lim', 'c2_met_pell', 'c2_home_talked', 'c2_found_map',
  'c2_went_upriver', 'c2_landing_arrived', 'c2_stone_deep', 'c2_stone_bright', 'c2_stones_woken',
  'c2_spirit_defeated', 'c2_learned_ward', 'c2_entered_hall', 'c2_read_journal', 'c2_found_charter',
  'c2_daniel_returned', 'c2_warden_seen', 'c2_warden_defeated', 'c2_dusk_arrived', 'c2_iron_seen', 'c2_iron_defeated',
];

function finishDialogue() {
  for (let i = 0; i < 100 && s().dialogue; i++) s().pressAction('Enter');
}
function use(id: string) {
  const t = getLayout(s().scene)!.interactables.find((x) => x.id === id)!;
  expect(isAvailable(t, s().flags), `${id} available`).toBe(true);
  s().setNearby(t);
  return s().pressAction('KeyE');
}
function look(id: string) {
  use(id);
  const d = s().dialogue?.def.id;
  finishDialogue();
  return d;
}
const objective = () => currentObjective(objectivesFor(s().flags), s().flags)?.id;

function placeOnBoat(flags: StoryFlag[]) {
  s().reset();
  s().setFlags(flags);
  const r = validateSave(JSON.parse(JSON.stringify(buildSave({ ...s(), scene: 'boat_night' }, SCENES.boat_night.spawns.arrival))));
  expect(r.ok).toBe(true);
  if (r.ok) s().loadGame(r.data);
}

describe('Chapter 3 loading', () => {
  it('is not registered until loaded', async () => {
    expect(DIALOGUES.c3_boat_arrival).toBeUndefined();
    expect(getLayout('boat_night')).toBeUndefined();
    await loadChapter(3);
    expect(DIALOGUES.c3_boat_arrival).toBeDefined();
    expect(getLayout('boat_night')).toBeDefined();
    expect(OBJECTIVES_BY_CHAPTER[3]?.length).toBe(3);
  });

  it('follows Chapter 2, is the latest chapter, and a Chapter 3 save needs it', () => {
    expect(hasChapterAfter(2)).toBe(true);
    expect(hasChapterAfter(3)).toBe(false);
    expect(chaptersNeededFor([...CHAPTER2_DONE, 'chapter3_started'])).toEqual([3]);
  });
});

describe('max HP raise', () => {
  it('is 36 from the start of Chapter 3, with River Ward kept; earlier chapters keep 30', () => {
    const enc = ENCOUNTERS.iron_warden;
    expect(playerStatsFor({ c2_learned_ward: true }, enc).maxHp).toBe(PLAYER_BATTLE_STATS.maxHp);
    const ch3 = playerStatsFor({ c2_learned_ward: true, chapter3_started: true }, enc);
    expect(ch3.maxHp).toBe(CHAPTER3_MAX_HP);
    expect(CHAPTER3_MAX_HP).toBe(36);
    expect(ch3.ward).toEqual(RIVER_WARD);
    expect(ch3.attack).toBe(PLAYER_BATTLE_STATS.attack);
  });
});

describe('Milestone 3.1 flow', () => {
  beforeEach(async () => {
    await loadChapter(3);
    s().reset();
    s().setFlags(CHAPTER2_DONE);
    s().endChapter();
  });

  it('continues from the Chapter 2 card onto the night boat with a title card', () => {
    expect(s().mode).toBe('ending');
    const startedAt = s().startedAt;
    s().startChapter(3);
    expect(s().scene).toBe('boat_night');
    expect(s().spawn).toEqual(SCENES.boat_night.spawns.arrival);
    expect(s().chapterCard).toBe("Chapter 3 · The Crown's Word");
    expect(s().startedAt).toBe(startedAt);
    expect(s().flags.c2_iron_defeated).toBe(true); // Chapter 2 progress is kept
    expect(activeChapter(s().flags)).toBe(3);
    expect(isAtChapterEnd(s().flags)).toBe(false);

    s().dismissChapterCard();
    expect(s().dialogue?.def.id).toBe('c3_boat_arrival');
    expect(s().dialogue?.def.lines.some((l) => /Max HP 30 → 36/.test(l.text))).toBe(true);
    finishDialogue();
    expect(objective()).toBe('c3_pell');
  });

  it('Pell → the student\'s phone → Daniel\'s call → the cabin → To Be Continued', () => {
    s().startChapter(3);
    s().dismissChapterCard();
    finishDialogue();

    // Nothing moves on before its turn.
    expect(look('npc-student-night')).toBe('c3_student_shy');
    expect(look('boat-night-cabin')).toBe('c3_cabin_early');
    expect(look('npc-mara-night')).toBe('c3_mara_asleep');
    expect(look('npc-ahhock-night')).toBe('c3_ahhock');
    expect(s().mode).toBe('explore');

    expect(look('npc-pell-night')).toBe('c3_pell');
    expect(s().flags.c3_talked_pell).toBe(true);
    expect(objective()).toBe('c3_news');
    expect(look('npc-pell-night')).toBe('c3_pell_repeat');
    expect(look('boat-night-cabin')).toBe('c3_cabin_early');

    use('npc-student-night');
    expect(s().dialogue?.def.id).toBe('c3_student_news');
    expect(s().dialogue?.def.lines.some((l) => /Vale heir sought/.test(l.text))).toBe(true);
    finishDialogue(); // and straight into Daniel's call
    expect(s().flags.c3_saw_news).toBe(true);
    expect(s().flags.c3_daniel_called).toBe(true);
    expect(objective()).toBe('c3_rest');

    expect(look('npc-student-night')).toBe('c3_student_after');
    expect(look('npc-mara-night')).toBe('c3_mara_after');
    expect(look('npc-ahhock-night')).toBe('c3_ahhock_after');
    expect(look('npc-pell-night')).toBe('c3_pell_after');

    use('boat-night-cabin');
    expect(s().dialogue?.def.id).toBe('c3_to_kuching');
    finishDialogue();
    expect(s().flags.c3_reached_kuching).toBe(true);
    expect(s().mode).toBe('ending');
    expect(isAtChapterEnd(s().flags)).toBe(true);
    expect(objective()).toBeUndefined();
  });
});

describe('Chapter 3 saves', () => {
  beforeEach(async () => {
    await loadChapter(3);
  });

  it('a mid-boat save reloads on the night boat; a finished one reopens the card', () => {
    placeOnBoat([...CHAPTER2_DONE, 'chapter3_started', 'c3_arrived', 'c3_talked_pell']);
    expect(s().scene).toBe('boat_night');
    expect(s().mode).toBe('explore');
    expect(objective()).toBe('c3_news');

    placeOnBoat([
      ...CHAPTER2_DONE, 'chapter3_started', 'c3_arrived', 'c3_talked_pell', 'c3_saw_news', 'c3_daniel_called',
      'c3_reached_kuching',
    ]);
    expect(s().mode).toBe('ending');
  });

  it('a night-boat save without Chapter 3 started is sent back to the village', () => {
    const r = validateSave({
      schemaVersion: 1,
      scene: 'boat_night',
      position: SCENES.boat_night.spawns.arrival,
      flags: CHAPTER2_DONE,
      playTimeMs: 0,
      prologueComplete: true,
    });
    expect(r.ok && r.data.scene).toBe('village');
  });
});
