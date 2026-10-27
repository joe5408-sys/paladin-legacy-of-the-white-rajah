/**
 * Chapter 3, Milestone 3.4 — The Petition Hour: the hearing in the audience hall.
 * The evidence menu, the right answer to each of Harrow's four claims, every
 * wrong answer rebutted and offered again, Mara's interruption, Pell's testimony
 * coloured by his 3.2 reply, resuming after a reload, saves and the ending.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { choicesOnScreen, gameStore } from '../../src/game/core/gameStore';
import { loadChapter } from '../../src/chapters/loader';
import { DIALOGUES } from '../../src/data/dialogue';
import { getLayout } from '../../src/data/layouts';
import { SCENES } from '../../src/data/scenes';
import { currentObjective, isAtChapterEnd, objectivesFor } from '../../src/game/quests/quests';
import { isAvailable } from '../../src/game/interaction/interaction';
import { buildSave, validateSave } from '../../src/game/save/save';
import type { StoryFlag } from '../../src/game/core/flags';
import { EVIDENCE } from '../../src/chapters/chapter3/audienceData';
import { HALL_LAYOUT } from '../../src/chapters/chapter2/hallData';

const s = () => gameStore.getState();

/** The right evidence for each claim. */
const RIGHT: Record<number, string> = { 1: 'letter', 2: 'charter', 3: 'journal', 4: 'plate' };

const AT_GATE_OPEN: StoryFlag[] = [
  'prologue_complete', 'chapter1_started', 'c1_letter_found', 'c1_escaped', 'chapter2_started', 'c2_learned_ward',
  'c2_read_journal', 'c2_found_charter', 'c2_warden_defeated', 'c2_iron_defeated', 'chapter3_started', 'c3_arrived',
  'c3_talked_pell', 'c3_saw_news', 'c3_daniel_called', 'c3_reached_kuching', 'c3_kuching_arrived', 'c3_met_jamilah',
  'c3_room_entered', 'c3_read_note', 'c3_reason_village', 'c3_pell_signed', 'c3_daniel_arrived', 'c3_plan_made',
  'c3_gate_arrived', 'c3_petition_registered', 'c3_sentinel_woken', 'c3_sentinel_withdrew', 'c3_gate_open',
];
const IN_HALL: StoryFlag[] = [...AT_GATE_OPEN, 'c3_hall_entered'];

function placeIn(scene: 'palace_gate' | 'audience_hall', spawn: string, flags: StoryFlag[]) {
  s().reset();
  s().setFlags(flags);
  const r = validateSave(JSON.parse(JSON.stringify(buildSave({ ...s(), scene }, SCENES[scene].spawns[spawn]))));
  expect(r.ok).toBe(true);
  if (r.ok) s().loadGame(r.data);
}
function arrive() {
  s().swapScene();
  s().finishTransition();
}
function finishDialogue() {
  for (let i = 0; i < 100 && s().dialogue; i++) s().pressAction('Enter');
}
/** Plays lines until the conversation ends or stops on a choice. */
function playLines() {
  for (let i = 0; i < 100 && s().dialogue && choicesOnScreen(s().dialogue, s().flags).length === 0; i++) {
    s().pressAction('Enter');
  }
}
const onScreen = () => choicesOnScreen(s().dialogue, s().flags).map((c) => c.id);
function present(id: string) {
  const i = onScreen().indexOf(id);
  expect(i, `${id} on screen`).toBeGreaterThanOrEqual(0);
  expect(s().chooseOption(i)).toBe(true);
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

describe('the evidence menu', () => {
  beforeEach(async () => {
    await loadChapter(3);
  });

  it('offers only evidence Adrian has found', () => {
    const claim = DIALOGUES.c3_claim1;
    expect(claim.choices?.map((c) => c.id)).toEqual(EVIDENCE.map((e) => e.id));
    placeIn('audience_hall', 'entrance', IN_HALL.filter((f) => f !== 'c2_warden_defeated'));
    use('petitioner-mark');
    playLines(); // the opening, then claim 1
    expect(s().dialogue?.def.id).toBe('c3_claim1');
    expect(onScreen()).toEqual(['charter', 'letter', 'journal', 'pell']);
  });

  it('the Charter can only have been found after the journal was read (2.4), so claim 3 always has its answer', () => {
    // In the waystation hall the Charter case only opens once the journal has been read.
    const charterCase = HALL_LAYOUT.interactables.find((t) => t.id === 'charter-case')!;
    const opens = charterCase.dialogue!.find((r) => r.dialogue === 'c2_charter')!;
    expect(opens.requires).toContain('c2_read_journal');
    expect(EVIDENCE.find((e) => e.id === 'journal')!.requires).toBe('c2_read_journal');
  });
});

describe('Milestone 3.4 flow', () => {
  beforeEach(async () => {
    await loadChapter(3);
  });

  it('through the gate → the hall → four claims (every wrong answer first) → Mara → Pell → the Rajah rises', () => {
    placeIn('palace_gate', 'after_battle', AT_GATE_OPEN);
    use('palace-enter');
    arrive();
    expect(s().scene).toBe('audience_hall');
    expect(s().dialogue?.def.id).toBe('c3_hall_arrival');
    finishDialogue();
    expect(objective()).toBe('c3_mark');

    // Everyone has a line before the hearing (all optional).
    for (const [id, d] of [
      ['npc-rajah', 'c3_rajah_wait'], ['npc-harrow-hall', 'c3_harrow_wait'], ['npc-clerk-hall', 'c3_clerk_hall'],
      ['npc-archivist-hall', 'c3_archivist_hall'], ['npc-mara-hall', 'c3_mara_hall'], ['npc-pell-hall', 'c3_pell_hall'],
      ['npc-daniel-hall', 'c3_daniel_hall'], ['npc-auntie-hall', 'c3_auntie_hall'], ['npc-fisher-hall', 'c3_fisher_hall'],
      ['npc-teacher-hall', 'c3_teacher_hall'],
    ]) expect(look(id), id).toBe(d);

    use('petitioner-mark');
    expect(s().dialogue?.def.id).toBe('c3_hearing_open');
    playLines();
    expect(s().flags.c3_hearing_started).toBe(true);
    expect(objective()).toBe('c3_hearing');

    for (const n of [1, 2, 3, 4]) {
      expect(s().dialogue?.def.id).toBe(`c3_claim${n}`);
      // Every wrong piece of evidence: a rebuttal, then the claim again. Nothing is lost.
      for (const wrong of EVIDENCE.map((e) => e.id).filter((id) => id !== RIGHT[n] && !(n === 4 && id === 'pell'))) {
        present(wrong);
        expect(s().dialogue?.def.id, `claim ${n}: ${wrong}`).toBe(`c3_rebut${n}`);
        playLines();
        expect(s().dialogue?.def.id).toBe(`c3_claim${n}_again`);
        expect(s().flags[`c3_claim${n}_answered` as StoryFlag]).toBeUndefined();
      }
      present(RIGHT[n]);
      playLines(); // the answer, Mara after claim 2, then the next claim (or Pell after claim 4)
      expect(s().flags[`c3_claim${n}_answered` as StoryFlag]).toBe(true);
    }
    expect(s().flags.c3_mara_spoke).toBe(true);

    // Pell: one reply on screen, chosen by what persuaded him in 3.2.
    expect(s().dialogue?.def.id).toBe('c3_call_pell');
    expect(onScreen()).toEqual(['pell-village']);
    present('pell-village');
    expect(s().dialogue?.def.id).toBe('c3_pell_testifies_village');
    finishDialogue(); // → the Rajah turns to Harrow and rises
    expect(s().flags.c3_pell_testified).toBe(true);
    expect(s().flags.c3_hearing_won).toBe(true);
    expect(s().mode).toBe('ending');
    expect(isAtChapterEnd(s().flags)).toBe(true);
    expect(objective()).toBeUndefined();
  });

  it("Pell's testimony to claim 4 is also accepted", () => {
    placeIn('audience_hall', 'entrance', [...IN_HALL, 'c3_hearing_started', 'c3_claim1_answered', 'c3_claim2_answered', 'c3_mara_spoke', 'c3_claim3_answered']);
    use('petitioner-mark');
    playLines();
    expect(s().dialogue?.def.id).toBe('c3_claim4');
    present('pell');
    expect(s().dialogue?.def.id).toBe('c3_answer4_pell');
    playLines();
    expect(s().flags.c3_claim4_answered).toBe(true);
    expect(s().dialogue?.def.id).toBe('c3_call_pell');
  });

  it('Pell testifies in words that match each 3.2 reply (and plainly without one)', () => {
    for (const [reason, testimony] of [
      ['c3_reason_village', 'c3_pell_testifies_village'],
      ['c3_reason_family', 'c3_pell_testifies_family'],
      ['c3_reason_right', 'c3_pell_testifies_right'],
      [null, 'c3_pell_testifies_right'],
    ] as const) {
      const flags = IN_HALL.filter((f) => f !== 'c3_reason_village');
      placeIn('audience_hall', 'entrance', [
        ...flags, ...(reason ? [reason] : []), 'c3_hearing_started', 'c3_claim1_answered', 'c3_claim2_answered',
        'c3_mara_spoke', 'c3_claim3_answered', 'c3_claim4_answered',
      ]);
      use('petitioner-mark'); // resumes at Pell
      playLines();
      expect(onScreen()).toHaveLength(1);
      s().chooseOption(0);
      expect(s().dialogue?.def.id, String(reason)).toBe(testimony);
    }
  });

  it('a reload mid-hearing resumes at the first unanswered claim', () => {
    for (const [answered, next] of [
      [[], 'c3_claim1'],
      [['c3_claim1_answered'], 'c3_claim2'],
      [['c3_claim1_answered', 'c3_claim2_answered', 'c3_mara_spoke'], 'c3_claim3'],
      [['c3_claim1_answered', 'c3_claim2_answered', 'c3_mara_spoke', 'c3_claim3_answered'], 'c3_claim4'],
    ] as const) {
      placeIn('audience_hall', 'entrance', [...IN_HALL, 'c3_hearing_started', ...answered]);
      expect(s().mode).toBe('explore');
      expect(objective()).toBe('c3_hearing');
      use('petitioner-mark');
      expect(s().dialogue?.def.id).toBe(next);
    }
  });

  it('a save at the end reopens the card; a hall save before the gate opened is sent back to the village', () => {
    placeIn('audience_hall', 'entrance', [
      ...IN_HALL, 'c3_hearing_started', 'c3_claim1_answered', 'c3_claim2_answered', 'c3_mara_spoke', 'c3_claim3_answered',
      'c3_claim4_answered', 'c3_pell_testified', 'c3_hearing_won',
    ]);
    expect(s().mode).toBe('ending');

    const r = validateSave({
      schemaVersion: 1,
      scene: 'audience_hall',
      position: SCENES.audience_hall.spawns.entrance,
      flags: AT_GATE_OPEN.filter((f) => f !== 'c3_gate_open'),
      playTimeMs: 0,
      prologueComplete: true,
    });
    expect(r.ok && r.data.scene).toBe('village');
  });
});
