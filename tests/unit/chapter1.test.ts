/**
 * Chapter 1, Milestones 1.1 (Arrival in Kuching), 1.2 (The Royal Archives) and 1.3 (The Hollow Sentinel):
 * lazy loading, the transition from Chapter 0, the objective chain, saves and the "to be continued" ending.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { gameStore } from '../../src/game/core/gameStore';
import { chaptersNeededFor, loadChapter } from '../../src/chapters/loader';
import { DIALOGUES } from '../../src/data/dialogue';
import { getLayout } from '../../src/data/layouts';
import { OBJECTIVES_BY_CHAPTER } from '../../src/data/quests';
import { SCENES } from '../../src/data/scenes';
import { currentObjective, isAtChapterEnd, objectivesFor } from '../../src/game/quests/quests';
import { isAvailable } from '../../src/game/interaction/interaction';
import { buildSave, validateSave } from '../../src/game/save/save';
import type { StoryFlag } from '../../src/game/core/flags';

const s = () => gameStore.getState();

const UP_TO_FILE: StoryFlag[] = [
  'chapter1_started', 'c1_arrived', 'c1_met_daniel', 'c1_archives_reached', 'c1_entered_archives',
  'c1_met_archivist', 'c1_clue_gap', 'c1_hint_household', 'c1_file_found',
];

const PROLOGUE_DONE: StoryFlag[] = [
  'arrived', 'entered_home', 'met_mara', 'heirloom_awakened', 'passage_open',
  'entered_chamber', 'guardian_defeated', 'read_message', 'daniel_arrived', 'met_daniel', 'prologue_complete',
];

function finishDialogue() {
  for (let i = 0; i < 100 && s().dialogue; i++) s().pressAction('Enter');
}
/** Loads a save placed in a scene with the given flags (as if the player had played there). */
function placeIn(scene: 'archives' | 'vault', flags: StoryFlag[]) {
  s().setFlags(flags);
  const r = validateSave(JSON.parse(JSON.stringify(buildSave({ ...s(), scene }, SCENES[scene].spawns.entrance))));
  expect(r.ok).toBe(true);
  if (r.ok) s().loadGame(r.data);
  finishDialogue();
}
/** Wins the current battle the intended way: Defend whenever the enemy charges. */
function winBattle() {
  for (let i = 0; i < 200 && s().battle; i++) {
    const b = s().battle!;
    if (b.stage === 'defeat') throw new Error('lost the battle');
    if (b.stage === 'command') {
      const cmd = b.state.charging ? 'defend' : b.state.skillCharges > 0 ? 'skill' : 'attack';
      s().chooseCommand(cmd);
    } else {
      s().advanceBattle();
    }
  }
}
function use(id: string) {
  const t = getLayout(s().scene)!.interactables.find((x) => x.id === id)!;
  expect(isAvailable(t, s().flags), `${id} available`).toBe(true);
  s().setNearby(t);
  return s().pressAction('KeyE');
}

describe('chapter loading', () => {
  it('Chapter 1 content is not registered until it is loaded', async () => {
    // This test file never imports chapter 1 statically, so it starts unloaded.
    expect(DIALOGUES.c1_arrival).toBeUndefined();
    expect(getLayout('waterfront')).toBeUndefined();
    expect(OBJECTIVES_BY_CHAPTER[1]).toBeUndefined();

    await loadChapter(1);
    expect(DIALOGUES.c1_arrival).toBeDefined();
    expect(getLayout('waterfront')).toBeDefined();
    expect(OBJECTIVES_BY_CHAPTER[1]?.length).toBeGreaterThan(0);

    // Loading again is a no-op.
    await loadChapter(1);
  });

  it('knows which chapters a save needs', () => {
    expect(chaptersNeededFor(['arrived', 'prologue_complete'])).toEqual([]);
    expect(chaptersNeededFor(['prologue_complete', 'chapter1_started'])).toEqual([1]);
  });
});

describe('Chapter 1 flow', () => {
  beforeEach(async () => {
    await loadChapter(1);
    s().reset();
    s().setFlags(PROLOGUE_DONE);
    s().endChapter();
  });

  it('continues from the Chapter 0 ending into Kuching with a title card', () => {
    expect(s().mode).toBe('ending');
    const startedAt = s().startedAt;
    s().startChapter1();
    expect(s().scene).toBe('waterfront');
    expect(s().spawn).toEqual(SCENES.waterfront.spawns.arrival);
    expect(s().chapterCard).toMatch(/Chapter 1/);
    expect(s().mode).toBe('transition'); // input locked under the card
    expect(s().canPause()).toBe(false);
    expect(s().startedAt).toBe(startedAt); // play time carries over
    expect(s().flags.prologue_complete).toBe(true); // prologue progress is kept
    expect(s().flags.chapter1_started).toBe(true);

    s().dismissChapterCard();
    expect(s().chapterCard).toBeNull();
    expect(s().dialogue?.def.id).toBe('c1_arrival');
  });

  it('switches the objective list to Chapter 1', () => {
    s().startChapter1();
    s().dismissChapterCard();
    finishDialogue();
    expect(objectivesFor(s().flags)).toBe(OBJECTIVES_BY_CHAPTER[1]);
    expect(currentObjective(objectivesFor(s().flags), s().flags)?.id).toBe('c1_meet_daniel');
  });

  it('plays through Milestone 1.1 to the "to be continued" card', () => {
    s().startChapter1();
    s().dismissChapterCard();
    finishDialogue();

    // The Archives are shut until Adrian has met Daniel.
    use('archives-door');
    expect(s().dialogue?.def.id).toBe('c1_archives_early');
    finishDialogue();
    expect(s().mode).toBe('explore');

    use('npc-jamilah'); // optional
    finishDialogue();
    use('npc-mara-bench');
    expect(s().dialogue?.def.id).toBe('c1_mara_before');
    finishDialogue();

    use('npc-daniel-pier');
    expect(s().dialogue?.def.id).toBe('c1_daniel_pier');
    finishDialogue();
    expect(currentObjective(objectivesFor(s().flags), s().flags)?.id).toBe('c1_archives');

    use('npc-daniel-pier');
    expect(s().dialogue?.def.id).toBe('c1_daniel_repeat');
    finishDialogue();
    use('npc-mara-bench');
    expect(s().dialogue?.def.id).toBe('c1_mara_after');
    finishDialogue();

    use('archives-door');
    expect(s().dialogue?.def.id).toBe('c1_archives_door');
    finishDialogue();
    expect(s().flags.c1_archives_reached).toBe(true);
    // The night passes and the doors open: a scene change into the Archives, not an ending.
    expect(s().mode).toBe('transition');
    expect(s().transition?.to).toBe('archives');
    expect(isAtChapterEnd(s().flags)).toBe(false);
  });

  it('plays through Milestone 1.2: the Archives investigation to the iron door', () => {
    s().startChapter1();
    s().dismissChapterCard();
    finishDialogue();
    use('npc-daniel-pier');
    finishDialogue();
    use('archives-door');
    finishDialogue();
    s().swapScene();
    s().finishTransition();
    expect(s().scene).toBe('archives');
    expect(s().dialogue?.def.id).toBe('c1_archives_arrival');
    finishDialogue();
    const objective = () => currentObjective(objectivesFor(s().flags), s().flags)?.id;
    expect(objective()).toBe('c1_treason');

    // The ledgers and the iron door give nothing away yet.
    use('shelf-household');
    expect(s().dialogue?.def.id).toBe('c1_shelf_household_early');
    finishDialogue();
    use('vault-door');
    expect(s().dialogue?.def.id).toBe('c1_vault_early');
    finishDialogue();
    expect(s().mode).toBe('explore');

    use('npc-archivist');
    expect(s().dialogue?.def.id).toBe('c1_archivist_intro');
    finishDialogue();
    use('shelf-grants'); // optional lore
    expect(s().dialogue?.def.id).toBe('c1_shelf_grants');
    finishDialogue();

    use('shelf-treason');
    expect(s().dialogue?.def.id).toBe('c1_shelf_treason');
    finishDialogue();
    expect(objective()).toBe('c1_ask');

    use('npc-archivist');
    expect(s().dialogue?.def.id).toBe('c1_archivist_hint');
    finishDialogue();
    expect(objective()).toBe('c1_ledgers');

    use('shelf-household');
    expect(s().dialogue?.def.id).toBe('c1_shelf_household_file');
    expect(s().dialogue?.def.lines.some((l) => /Lord Chamberlain/.test(l.text))).toBe(true);
    finishDialogue();
    expect(objective()).toBe('c1_vault');

    use('vault-door');
    expect(s().dialogue?.def.id).toBe('c1_vault_door');
    finishDialogue();
    expect(s().flags.c1_vault_found).toBe(true);
    // The door opens into the vault (Milestone 1.3) instead of ending the chapter.
    expect(s().mode).toBe('transition');
    expect(s().transition?.to).toBe('vault');
    expect(isAtChapterEnd(s().flags)).toBe(false);
  });

  it('plays through Milestone 1.3: the Hollow Sentinel and the inner gate', () => {
    s().startChapter1();
    s().dismissChapterCard();
    finishDialogue();
    placeIn('archives', UP_TO_FILE);
    use('vault-door');
    finishDialogue();
    s().swapScene();
    s().finishTransition();
    expect(s().scene).toBe('vault');
    expect(s().spawn).toEqual(SCENES.vault.spawns.entrance);
    expect(s().dialogue?.def.id).toBe('c1_vault_arrival');
    finishDialogue();
    const objective = () => currentObjective(objectivesFor(s().flags), s().flags)?.id;
    expect(objective()).toBe('c1_sentinel');

    // Optional and early interactions
    use('vault-cabinets');
    finishDialogue();
    use('inner-gate');
    expect(s().dialogue?.def.id).toBe('c1_inner_gate_early');
    finishDialogue();
    expect(s().mode).toBe('explore');

    // The Sentinel wakes: a battle against the new encounter
    use('sentinel');
    expect(s().dialogue?.def.id).toBe('c1_sentinel_wake');
    finishDialogue();
    expect(s().mode).toBe('battle');
    expect(s().battle?.encounter.id).toBe('hollow_sentinel');
    winBattle();
    expect(s().flags.c1_sentinel_defeated).toBe(true);
    expect(s().scene).toBe('vault');
    expect(s().spawn).toEqual(SCENES.vault.spawns.after_battle);
    expect(s().dialogue?.def.id).toBe('c1_sentinel_defeated');
    finishDialogue();
    expect(objective()).toBe('c1_inner_gate');

    use('sentinel');
    expect(s().dialogue?.def.id).toBe('c1_sentinel_remains');
    finishDialogue();

    use('inner-gate');
    expect(s().dialogue?.def.id).toBe('c1_inner_gate');
    finishDialogue();
    expect(s().flags.c1_inner_gate_open).toBe(true);
    expect(s().mode).toBe('ending');
    expect(isAtChapterEnd(s().flags)).toBe(true);
  });

  it('the Sentinel blocks the way to the inner gate until it falls', () => {
    const vault = getLayout('vault')!;
    const flags = Object.fromEntries(UP_TO_FILE.map((f) => [f, true]));
    const before = vault.colliders(flags).length;
    expect(vault.colliders({ ...flags, c1_sentinel_defeated: true }).length).toBe(before - 1);
  });

  it('losing to the Sentinel offers a retry from full HP', () => {
    s().startChapter1();
    s().dismissChapterCard();
    finishDialogue();
    placeIn('vault', [...UP_TO_FILE, 'c1_vault_found']);
    use('sentinel');
    finishDialogue();
    for (let i = 0; i < 200 && s().battle?.stage !== 'defeat'; i++) {
      if (s().battle!.stage === 'command') s().chooseCommand('attack'); // ignores the wind-up
      else s().advanceBattle();
    }
    expect(s().battle?.stage).toBe('defeat');
    expect(s().retryBattle()).toBe(true);
    expect(s().battle?.state).toMatchObject({ playerHp: 30, enemyHp: 42, charging: false, turn: 1 });
    expect(s().flags.c1_sentinel_defeated).toBeUndefined();
  });

  it('a save from the old 1.2 cliffhanger reloads in the Archives with the vault open', () => {
    s().startChapter1();
    s().dismissChapterCard();
    finishDialogue();
    placeIn('archives', [...UP_TO_FILE, 'c1_vault_found']);
    expect(s().mode).toBe('explore');
    expect(s().scene).toBe('archives');
    const ids = getLayout('archives')!.interactables.filter((t) => t.id.startsWith('vault-') && isAvailable(t, s().flags)).map((t) => t.id);
    expect(ids).toEqual(['vault-enter']);
    use('vault-enter');
    expect(s().transition?.to).toBe('vault');
  });

  it('a save in the vault before the battle reloads there; one claiming the vault too early goes to the village', () => {
    const ok = validateSave({
      schemaVersion: 1,
      scene: 'vault',
      position: { x: 0, z: 0.5, facing: 'north' },
      flags: [...PROLOGUE_DONE, ...UP_TO_FILE, 'c1_vault_found', 'c1_entered_vault'],
      playTimeMs: 0,
      prologueComplete: true,
    });
    expect(ok.ok && ok.data.scene).toBe('vault');
    expect(ok.ok && ok.data.position).toEqual({ x: 0, z: 0.5, facing: 'north' });
    // Standing inside the Sentinel is not allowed; the position falls back to the spawn.
    const inside = validateSave({
      schemaVersion: 1,
      scene: 'vault',
      position: { x: 0, z: -2.7, facing: 'north' },
      flags: [...PROLOGUE_DONE, ...UP_TO_FILE, 'c1_vault_found'],
      playTimeMs: 0,
      prologueComplete: true,
    });
    expect(inside.ok && inside.data.position).toEqual(SCENES.vault.spawns.entrance);
    const early = validateSave({
      schemaVersion: 1,
      scene: 'vault',
      position: { x: 0, z: 0.5, facing: 'north' },
      flags: [...PROLOGUE_DONE, ...UP_TO_FILE],
      playTimeMs: 0,
      prologueComplete: true,
    });
    expect(early.ok && early.data.scene).toBe('village');
  });

  it('after dawn, the Archives door leads straight inside (also for saves from the old 1.1 cliffhanger)', () => {
    s().startChapter1();
    s().dismissChapterCard();
    finishDialogue();
    s().setFlags(['c1_met_daniel', 'c1_archives_reached']);
    const door = getLayout('waterfront')!.interactables;
    expect(door.filter((t) => t.id.startsWith('archives-') && isAvailable(t, s().flags)).map((t) => t.id)).toEqual([
      'archives-enter',
    ]);
    expect(isAtChapterEnd(s().flags)).toBe(false); // the old cliffhanger flag no longer ends the chapter
    use('archives-enter');
    expect(s().transition?.to).toBe('archives');
  });

  it('a mid-chapter save reloads into the waterfront, not the ending card', () => {
    s().startChapter1();
    s().dismissChapterCard();
    finishDialogue();
    const data = buildSave(s(), { x: 5, z: 2, facing: 'west' });
    const r = validateSave(JSON.parse(JSON.stringify(data)));
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.data.scene).toBe('waterfront');
    expect(r.data.position).toEqual({ x: 5, z: 2, facing: 'west' });
    s().returnToTitle();
    s().loadGame(r.data);
    expect(s().scene).toBe('waterfront');
    expect(s().mode).toBe('explore'); // prologue_complete alone must not reopen the Chapter 0 card
  });

  it('a save at the Chapter 1 cliffhanger reopens on the "to be continued" card', () => {
    s().startChapter1();
    s().setFlags([
      ...UP_TO_FILE, 'c1_vault_found', 'c1_entered_vault', 'c1_sentinel_defeated', 'c1_inner_gate_open',
    ]);
    const r = validateSave(JSON.parse(JSON.stringify(buildSave({ ...s(), scene: 'vault' }, SCENES.vault.spawns.after_battle))));
    expect(r.ok).toBe(true);
    if (r.ok) s().loadGame(r.data);
    expect(s().mode).toBe('ending');
  });

  it('a save claiming the waterfront without starting Chapter 1 is sent back to the village', () => {
    const r = validateSave({
      schemaVersion: 1,
      scene: 'waterfront',
      position: { x: 5, z: 2, facing: 'west' },
      flags: ['arrived'],
      playTimeMs: 0,
      prologueComplete: false,
    });
    expect(r.ok && r.data.scene).toBe('village');
  });
});
