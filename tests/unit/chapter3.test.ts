/**
 * Chapter 3, Milestones 3.1 (The Long Way Down) and 3.2 (A Wanted Man): lazy
 * loading, the hand-off from the Chapter 2 Complete card, the night boat, the
 * max-HP raise, dialogue choices, the waterfront and Kak Jamilah's room, Pell's
 * choice, saves and the "to be continued" ending.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { choicesOnScreen, gameStore } from '../../src/game/core/gameStore';
import { availableChoices } from '../../src/game/dialogue/rules';
import type { DialogueDef } from '../../src/game/dialogue/types';
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

function placeIn(scene: 'boat_night' | 'waterfront_night' | 'jamilah_room', flags: StoryFlag[]) {
  s().reset();
  s().setFlags(flags);
  const r = validateSave(JSON.parse(JSON.stringify(buildSave({ ...s(), scene }, SCENES[scene].spawns.arrival))));
  expect(r.ok).toBe(true);
  if (r.ok) s().loadGame(r.data);
}
const placeOnBoat = (flags: StoryFlag[]) => placeIn('boat_night', flags);
function arrive() {
  s().swapScene();
  s().finishTransition();
}
/** Plays lines until the conversation ends or stops on a choice. */
function playLines() {
  for (let i = 0; i < 100 && s().dialogue && choicesOnScreen(s().dialogue, s().flags).length === 0; i++) {
    s().pressAction('Enter');
  }
}

const BOAT_DONE: StoryFlag[] = [
  ...CHAPTER2_DONE, 'chapter3_started', 'c3_arrived', 'c3_talked_pell', 'c3_saw_news', 'c3_daniel_called', 'c3_reached_kuching',
];
const IN_ROOM: StoryFlag[] = [...BOAT_DONE, 'c3_kuching_arrived', 'c3_met_jamilah', 'c3_room_entered'];

describe('Chapter 3 loading', () => {
  it('is not registered until loaded', async () => {
    expect(DIALOGUES.c3_boat_arrival).toBeUndefined();
    expect(getLayout('boat_night')).toBeUndefined();
    await loadChapter(3);
    expect(DIALOGUES.c3_boat_arrival).toBeDefined();
    expect(getLayout('boat_night')).toBeDefined();
    expect(OBJECTIVES_BY_CHAPTER[3]?.length).toBe(6);
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

  it('Pell → the student\'s phone → Daniel\'s call → the cabin → ashore in Kuching', () => {
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
    expect(isAtChapterEnd(s().flags)).toBe(false);
    expect(s().transition?.to).toBe('waterfront_night');
    expect(objective()).toBe('c3_jamilah');
  });
});

describe('dialogue choices', () => {
  const def: DialogueDef = {
    id: 'test_choice',
    lines: [{ speaker: null, text: 'Pick one.' }],
    choices: [
      { id: 'a', label: 'A', next: 'c3_window' },
      { id: 'b', label: 'B', next: 'c3_window', requires: ['c3_read_note'] },
      { id: 'c', label: 'C', next: 'c3_window', unless: ['c3_read_note'] },
    ],
  };

  it('only offers replies whose conditions pass', () => {
    expect(availableChoices(def, {}).map((c) => c.id)).toEqual(['a', 'c']);
    expect(availableChoices(def, { c3_read_note: true }).map((c) => c.id)).toEqual(['a', 'b']);
    expect(availableChoices({ id: 'x', lines: [] }, {})).toEqual([]);
  });

  it('wait for a reply; arrow keys move (wrapping), Enter picks; flags apply and the reply\'s conversation starts', async () => {
    await loadChapter(3);
    placeIn('jamilah_room', [...IN_ROOM, 'c3_read_note']);
    use('npc-pell-room');
    expect(s().dialogue?.def.id).toBe('c3_pell_ask');
    expect(choicesOnScreen(s().dialogue, s().flags)).toEqual([]); // not before the last line is shown
    playLines();
    expect(choicesOnScreen(s().dialogue, s().flags).map((c) => c.id)).toEqual(['village', 'family', 'right']);
    s().advanceDialogue(); // does not end the conversation without a reply
    expect(s().dialogue?.def.id).toBe('c3_pell_ask');
    expect(s().pressAction('ArrowUp')).toBe(true);
    expect(s().dialogue?.choice).toBe(2); // wrapped round to the last reply
    s().pressAction('ArrowDown');
    s().pressAction('ArrowDown');
    expect(s().dialogue?.choice).toBe(1);
    expect(s().pressAction('KeyX')).toBe(false);
    s().pressAction('Enter');
    expect(s().flags.c3_reason_family).toBe(true);
    expect(s().flags.c3_reason_village).toBeUndefined();
    expect(s().dialogue?.def.id).toBe('c3_pell_family');
  });

  it('chooseOption ignores an index that is not on screen', async () => {
    await loadChapter(3);
    placeIn('jamilah_room', [...IN_ROOM, 'c3_read_note']);
    use('npc-pell-room');
    expect(s().chooseOption(0)).toBe(false); // the first line is still showing
    playLines();
    expect(s().chooseOption(7)).toBe(false);
    expect(s().chooseOption(2)).toBe(true);
    expect(s().dialogue?.def.id).toBe('c3_pell_right');
  });
});

describe('Milestone 3.2 flow', () => {
  beforeEach(async () => {
    await loadChapter(3);
  });

  it('the waterfront → Kak Jamilah → her room → the note → Pell signs → Daniel → To Be Continued', () => {
    placeOnBoat([...BOAT_DONE.filter((f) => f !== 'c3_reached_kuching')]);
    use('boat-night-cabin');
    finishDialogue();
    arrive();
    expect(s().scene).toBe('waterfront_night');
    expect(s().dialogue?.def.id).toBe('c3_waterfront_arrival');
    finishDialogue();
    expect(objective()).toBe('c3_jamilah');

    // Optional on the way: the officers, a poster, Mara and Pell.
    expect(look('officer-pier-1')).toBe('c3_officer');
    expect(look('officer-pier-2')).toBe('c3_officer');
    expect(look('wanted-poster')).toBe('c3_poster');
    expect(look('npc-mara-wf')).toBe('c3_mara_wf');
    expect(look('npc-pell-wf')).toBe('c3_pell_wf');

    use('npc-jamilah-night');
    expect(s().dialogue?.def.id).toBe('c3_jamilah');
    finishDialogue();
    expect(s().flags.c3_met_jamilah).toBe(true);
    expect(s().transition?.to).toBe('jamilah_room');
    arrive();
    expect(s().dialogue?.def.id).toBe('c3_room_arrival');
    finishDialogue();
    expect(objective()).toBe('c3_note');

    // Pell waits for the note.
    expect(look('npc-pell-room')).toBe('c3_pell_wait');
    expect(look('npc-mara-room')).toBe('c3_mara_room');
    expect(look('room-window')).toBe('c3_window');
    expect(look('archivist-note')).toBe('c3_note');
    expect(s().flags.c3_read_note).toBe(true);
    expect(objective()).toBe('c3_sponsor');
    expect(look('archivist-note')).toBe('c3_note_again');
    expect(look('npc-mara-room')).toBe('c3_mara_room_after');

    use('npc-pell-room');
    playLines();
    expect(s().chooseOption(0)).toBe(true); // "For Sungai Awan."
    expect(s().dialogue?.def.id).toBe('c3_pell_village');
    finishDialogue(); // → Pell signs → Daniel arrives
    expect(s().flags.c3_reason_village).toBe(true);
    expect(s().flags.c3_pell_signed).toBe(true);
    expect(s().flags.c3_daniel_arrived).toBe(true);
    expect(s().flags.c3_plan_made).toBe(true);
    expect(s().mode).toBe('ending');
    expect(isAtChapterEnd(s().flags)).toBe(true);
    expect(objective()).toBeUndefined();
  });

  it('every reply to Pell leads to him signing', () => {
    for (const [i, reply] of [[0, 'c3_pell_village'], [1, 'c3_pell_family'], [2, 'c3_pell_right']] as const) {
      placeIn('jamilah_room', [...IN_ROOM, 'c3_read_note']);
      use('npc-pell-room');
      playLines();
      s().chooseOption(i);
      expect(s().dialogue?.def.id).toBe(reply);
      finishDialogue();
      expect(s().flags.c3_pell_signed, reply).toBe(true);
      expect(s().mode).toBe('ending');
    }
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

    // A save from the old 3.1 cliffhanger: the cabin leads ashore.
    placeOnBoat(BOAT_DONE);
    expect(s().mode).toBe('explore');
    use('boat-night-cabin');
    finishDialogue();
    expect(s().transition?.to).toBe('waterfront_night');

    placeIn('waterfront_night', [...BOAT_DONE, 'c3_kuching_arrived']);
    expect(s().mode).toBe('explore');
    expect(objective()).toBe('c3_jamilah');

    placeIn('jamilah_room', [...IN_ROOM, 'c3_read_note', 'c3_reason_right', 'c3_pell_signed', 'c3_daniel_arrived', 'c3_plan_made']);
    expect(s().mode).toBe('ending');
  });

  it('a room save before meeting Jamilah, or a waterfront save before landing, is sent back to the village', () => {
    for (const [scene, flags] of [
      ['jamilah_room', BOAT_DONE],
      ['waterfront_night', BOAT_DONE.filter((f) => f !== 'c3_reached_kuching')],
    ] as const) {
      const r = validateSave({
        schemaVersion: 1,
        scene,
        position: SCENES[scene].spawns.arrival,
        flags: [...flags],
        playTimeMs: 0,
        prologueComplete: true,
      });
      expect(r.ok && r.data.scene, scene).toBe('village');
    }
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
