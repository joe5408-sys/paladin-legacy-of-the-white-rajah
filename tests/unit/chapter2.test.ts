/**
 * Chapter 2, Milestones 2.1 (Upriver) and 2.2 (Home, Changed): lazy loading, the
 * hand-off from the Chapter 1 Complete card, the conversations in order, saves
 * and the Chapter 2 Complete ending.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { gameStore } from '../../src/game/core/gameStore';
import { chaptersNeededFor, hasChapterAfter, loadChapter } from '../../src/chapters/loader';
import { DIALOGUES } from '../../src/data/dialogue';
import { getLayout } from '../../src/data/layouts';
import { OBJECTIVES_BY_CHAPTER } from '../../src/data/quests';
import { SCENES } from '../../src/data/scenes';
import { activeChapter, currentObjective, isAtChapterEnd, objectivesFor } from '../../src/game/quests/quests';
import { isAvailable } from '../../src/game/interaction/interaction';
import { buildSave, validateSave } from '../../src/game/save/save';
import type { StoryFlag } from '../../src/game/core/flags';

const s = () => gameStore.getState();

const CHAPTER1_DONE: StoryFlag[] = [
  'arrived', 'entered_home', 'met_mara', 'heirloom_awakened', 'passage_open', 'entered_chamber',
  'guardian_defeated', 'read_message', 'daniel_arrived', 'met_daniel', 'prologue_complete',
  'chapter1_started', 'c1_arrived', 'c1_met_daniel', 'c1_archives_reached', 'c1_entered_archives',
  'c1_met_archivist', 'c1_clue_gap', 'c1_hint_household', 'c1_file_found', 'c1_vault_found',
  'c1_entered_vault', 'c1_sentinel_defeated', 'c1_inner_gate_open', 'c1_entered_records',
  'c1_box_read', 'c1_letter_found', 'c1_security_arrived', 'c1_lights_out', 'c1_escaped',
];

const BOAT_DONE: StoryFlag[] = ['chapter2_started', 'c2_arrived', 'c2_talked_mara', 'c2_saw_news', 'c2_talked_captain', 'c2_reached_jetty'];

/** Loads a save placed in a Chapter 2 scene with the given flags. */
function placeIn(scene: 'boat' | 'village_c2' | 'home_c2', spawn: string, flags: StoryFlag[]) {
  s().setFlags(flags);
  const r = validateSave(JSON.parse(JSON.stringify(buildSave({ ...s(), scene }, SCENES[scene].spawns[spawn]))));
  expect(r.ok).toBe(true);
  if (r.ok) s().loadGame(r.data);
}
/** Plays a pending scene change (fade out, swap, fade in, arrival). */
function arrive() {
  s().swapScene();
  s().finishTransition();
}

function finishDialogue() {
  for (let i = 0; i < 100 && s().dialogue; i++) s().pressAction('Enter');
}
function use(id: string) {
  const t = getLayout(s().scene)!.interactables.find((x) => x.id === id)!;
  expect(isAvailable(t, s().flags), `${id} available`).toBe(true);
  s().setNearby(t);
  return s().pressAction('KeyE');
}
const objective = () => currentObjective(objectivesFor(s().flags), s().flags)?.id;

describe('Chapter 2 loading', () => {
  it('is not registered until loaded', async () => {
    expect(DIALOGUES.c2_boat_arrival).toBeUndefined();
    expect(getLayout('boat')).toBeUndefined();
    await loadChapter(2);
    expect(DIALOGUES.c2_boat_arrival).toBeDefined();
    expect(getLayout('boat')).toBeDefined();
    expect(OBJECTIVES_BY_CHAPTER[2]?.length).toBe(17);
  });

  it('knows that Chapter 1 now leads on, and which chapter a save needs', () => {
    expect(hasChapterAfter(1)).toBe(true);
    expect(hasChapterAfter(2)).toBe(false);
    expect(chaptersNeededFor([...CHAPTER1_DONE, 'chapter2_started'])).toEqual([2]);
  });
});

describe('Chapter 2 flow', () => {
  beforeEach(async () => {
    await loadChapter(2);
    s().reset();
    s().setFlags(CHAPTER1_DONE);
    s().endChapter();
  });

  it('continues from the Chapter 1 card onto the express boat with a title card', () => {
    expect(s().mode).toBe('ending');
    const startedAt = s().startedAt;
    s().startChapter(2);
    expect(s().scene).toBe('boat');
    expect(s().spawn).toEqual(SCENES.boat.spawns.arrival);
    expect(s().chapterCard).toBe('Chapter 2 · The River Remembers');
    expect(s().mode).toBe('transition');
    expect(s().startedAt).toBe(startedAt);
    expect(s().flags.c1_escaped).toBe(true); // Chapter 1 progress is kept
    expect(activeChapter(s().flags)).toBe(2);
    expect(isAtChapterEnd(s().flags)).toBe(false); // c1_escaped no longer ends anything

    s().dismissChapterCard();
    expect(s().dialogue?.def.id).toBe('c2_boat_arrival');
    finishDialogue();
    expect(objectivesFor(s().flags)).toBe(OBJECTIVES_BY_CHAPTER[2]);
    expect(objective()).toBe('c2_mara');
  });

  it('plays through Milestone 2.1 in order, then on to Sungai Awan', () => {
    s().startChapter(2);
    s().dismissChapterCard();
    finishDialogue();

    // Nothing moves on before its turn.
    use('npc-passenger');
    expect(s().dialogue?.def.id).toBe('c2_passenger_busy');
    finishDialogue();
    use('npc-ahhock');
    expect(s().dialogue?.def.id).toBe('c2_captain_busy');
    finishDialogue();
    use('boat-cabin');
    expect(s().dialogue?.def.id).toBe('c2_cabin_early');
    finishDialogue();
    use('npc-auntie'); // optional
    finishDialogue();
    expect(s().mode).toBe('explore');

    use('npc-mara-boat');
    expect(s().dialogue?.def.id).toBe('c2_mara_talk');
    finishDialogue();
    expect(objective()).toBe('c2_news');

    use('npc-passenger');
    expect(s().dialogue?.def.id).toBe('c2_passenger_news');
    expect(s().dialogue?.def.lines.some((l) => /AWAN RIVERLANDS/.test(l.text))).toBe(true);
    finishDialogue();
    expect(objective()).toBe('c2_captain');
    use('npc-mara-boat');
    expect(s().dialogue?.def.id).toBe('c2_mara_news');
    finishDialogue();

    use('npc-ahhock');
    expect(s().dialogue?.def.id).toBe('c2_captain');
    finishDialogue();
    expect(objective()).toBe('c2_jetty');
    use('npc-ahhock');
    expect(s().dialogue?.def.id).toBe('c2_captain_after');
    finishDialogue();

    use('boat-cabin');
    expect(s().dialogue?.def.id).toBe('c2_disembark');
    finishDialogue();
    expect(s().flags.c2_reached_jetty).toBe(true);
    expect(s().mode).toBe('transition');
    expect(s().transition?.to).toBe('village_c2');
    expect(isAtChapterEnd(s().flags)).toBe(false);
  });

  it('plays through Milestone 2.2: the notice, Lim, Pell, Mara and the map', () => {
    s().startChapter(2);
    s().dismissChapterCard();
    finishDialogue();
    placeIn('boat', 'arrival', BOAT_DONE);
    // A save from the old 2.1 cliffhanger: the cabin leads straight to the village.
    use('boat-cabin');
    expect(s().dialogue?.def.id).toBe('c2_to_jetty');
    finishDialogue();
    arrive();
    expect(s().scene).toBe('village_c2');
    expect(s().spawn).toEqual(SCENES.village_c2.spawns.jetty);
    expect(s().dialogue?.def.id).toBe('c2_village_arrival');
    finishDialogue();
    expect(objective()).toBe('c2_notice');

    // Out of order: Lim and Pell point you onward, Mara sends you back out.
    use('npc-lim-c2');
    expect(s().dialogue?.def.id).toBe('c2_lim_early');
    finishDialogue();
    use('npc-pell');
    expect(s().dialogue?.def.id).toBe('c2_pell_busy');
    finishDialogue();
    use('npc-ahhock-village');
    finishDialogue();
    use('survey-peg');
    finishDialogue();

    use('notice-board');
    expect(s().dialogue?.def.id).toBe('c2_notice');
    finishDialogue();
    expect(objective()).toBe('c2_lim');

    use('npc-lim-c2');
    expect(s().dialogue?.def.id).toBe('c2_lim');
    finishDialogue();
    expect(objective()).toBe('c2_pell');
    use('npc-siti'); // optional
    expect(s().dialogue?.def.id).toBe('c2_siti');
    finishDialogue();
    use('npc-siti');
    expect(s().dialogue?.def.id).toBe('c2_siti_after');
    finishDialogue();

    use('npc-pell');
    expect(s().dialogue?.def.id).toBe('c2_pell');
    finishDialogue();
    expect(objective()).toBe('c2_home');

    use('family-home-door-c2');
    arrive();
    expect(s().scene).toBe('home_c2');
    expect(s().dialogue).toBeNull(); // no arrival speech at home
    use('portrait-c2');
    expect(s().dialogue?.def.id).toBe('c2_portrait_elias');
    finishDialogue();
    use('npc-mara-home-c2');
    expect(s().dialogue?.def.id).toBe('c2_mara_home');
    finishDialogue();
    expect(objective()).toBe('c2_map');

    use('portrait-c2');
    expect(s().dialogue?.def.id).toBe('c2_portrait_map');
    finishDialogue();
    expect(s().flags.c2_found_map).toBe(true);
    // Straight on upriver with Ah Hock (Milestone 2.3, waystation.test.ts).
    expect(s().flags.c2_went_upriver).toBe(true);
    expect(s().transition?.to).toBe('waystation_landing');
    expect(isAtChapterEnd(s().flags)).toBe(false);
  });

  it('Mara at home waits until Adrian has met Pell', () => {
    s().startChapter(2);
    s().dismissChapterCard();
    placeIn('home_c2', 'door', [...BOAT_DONE, 'c2_village_arrived', 'c2_read_notice']);
    expect(s().scene).toBe('home_c2');
    use('npc-mara-home-c2');
    expect(s().dialogue?.def.id).toBe('c2_mara_home_early');
    finishDialogue();
    use('home-exit-c2');
    expect(s().transition?.to).toBe('village_c2');
  });

  it('a mid-boat save reloads on the boat; a finished one reopens the card', () => {
    s().startChapter(2);
    s().dismissChapterCard();
    finishDialogue();
    s().setFlags(['c2_talked_mara']);
    const r = validateSave(JSON.parse(JSON.stringify(buildSave(s(), { x: 0, z: 0, facing: 'west' }))));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.scene).toBe('boat');
    s().returnToTitle();
    s().loadGame(r.data);
    expect(s().scene).toBe('boat');
    expect(s().mode).toBe('explore');
    expect(objective()).toBe('c2_news');

    s().setFlags([
      ...BOAT_DONE, 'c2_village_arrived', 'c2_read_notice', 'c2_talked_lim', 'c2_met_pell', 'c2_home_talked', 'c2_found_map',
      'c2_went_upriver', 'c2_landing_arrived', 'c2_stones_woken', 'c2_spirit_defeated', 'c2_learned_ward',
      'c2_entered_hall', 'c2_read_journal', 'c2_found_charter', 'c2_daniel_returned', 'c2_warden_seen', 'c2_warden_defeated',
      'c2_dusk_arrived', 'c2_iron_seen', 'c2_iron_defeated',
    ]);
    const end = validateSave(
      JSON.parse(JSON.stringify(buildSave({ ...s(), scene: 'jetty_dusk' }, SCENES.jetty_dusk.spawns.after_battle))),
    );
    if (end.ok) s().loadGame(end.data);
    expect(s().mode).toBe('ending');
  });

  it('a save in the Chapter 2 village before reaching the jetty is sent back to the prologue village', () => {
    const r = validateSave({
      schemaVersion: 1,
      scene: 'village_c2',
      position: { x: 1.6, z: -4.6, facing: 'south' },
      flags: [...CHAPTER1_DONE, 'chapter2_started'],
      playTimeMs: 0,
      prologueComplete: true,
    });
    expect(r.ok && r.data.scene).toBe('village');
  });

  it('a save claiming the boat without starting Chapter 2 is sent back to the village', () => {
    const r = validateSave({
      schemaVersion: 1,
      scene: 'boat',
      position: { x: 0, z: 0, facing: 'west' },
      flags: CHAPTER1_DONE,
      playTimeMs: 0,
      prologueComplete: true,
    });
    expect(r.ok && r.data.scene).toBe('village');
  });
});
