/**
 * Chapter 2, Milestone 2.1 (Upriver): lazy loading, the hand-off from the Chapter 1
 * Complete card, the express-boat conversations in order, saves and the
 * "to be continued" ending.
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
    expect(OBJECTIVES_BY_CHAPTER[2]?.length).toBe(4);
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

  it('plays through Milestone 2.1 in order, to the "to be continued" card', () => {
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
    expect(s().mode).toBe('ending');
    expect(isAtChapterEnd(s().flags)).toBe(true);
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

    s().setFlags(['c2_saw_news', 'c2_talked_captain', 'c2_reached_jetty']);
    const end = validateSave(JSON.parse(JSON.stringify(buildSave(s(), SCENES.boat.spawns.arrival))));
    if (end.ok) s().loadGame(end.data);
    expect(s().mode).toBe('ending');
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
