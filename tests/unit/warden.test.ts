/**
 * Chapter 2, Milestone 2.4 — The River Charter: the waystation hall (journal,
 * oath, Charter), Daniel's return, the Hollow Warden's balance and battle,
 * saves and the "to be continued" ending.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { createBattle, enemyAction, playerAction, type BattleState, type Command } from '../../src/game/combat/battle';
import { ENCOUNTERS, PLAYER_BATTLE_STATS, playerStatsFor, RIVER_WARD } from '../../src/data/encounters';
import { gameStore } from '../../src/game/core/gameStore';
import { loadChapter } from '../../src/chapters/loader';
import { getLayout } from '../../src/data/layouts';
import { SCENES } from '../../src/data/scenes';
import { currentObjective, isAtChapterEnd, objectivesFor } from '../../src/game/quests/quests';
import { isAvailable } from '../../src/game/interaction/interaction';
import { buildSave, validateSave } from '../../src/game/save/save';
import type { StoryFlag } from '../../src/game/core/flags';

const W = ENCOUNTERS.hollow_warden;
const S = ENCOUNTERS.hollow_sentinel;
const PW = { ...PLAYER_BATTLE_STATS, ward: RIVER_WARD };

function play(strategy: (s: BattleState) => Command, player = PW): BattleState {
  let s = createBattle(player, W);
  for (let i = 0; i < 60 && (s.phase === 'player' || s.phase === 'enemy'); i++) {
    const p = playerAction(s, player, strategy(s));
    if (!p) throw new Error('command not allowed');
    s = p.state.phase === 'enemy' ? enemyAction(p.state, player, W)!.state : p.state;
  }
  return s;
}
const allOut = (s: BattleState): Command => (s.skillCharges > 0 ? 'skill' : 'attack');
const defendHeavy = (s: BattleState): Command => (s.charging ? 'defend' : allOut(s));
const wardWhenHurt = (s: BattleState): Command =>
  s.charging ? 'defend' : s.wardCharges > 0 && s.playerHp < 15 ? 'ward' : allOut(s);

describe('Hollow Warden', () => {
  it('is the Sentinel retuned: tougher, with a harder heavy blow', () => {
    expect(W.enemyMaxHp).toBeGreaterThan(S.enemyMaxHp);
    expect(W.heavy!.damage).toBeGreaterThan(S.heavy!.damage);
    expect(W.heavy!.every).toBe(S.heavy!.every);
    expect(W.heavy!.guardedMultiplier).toBe(0); // Defend still blocks it
    expect(W.teachesWard).toBeUndefined();
    expect(W.returnTo).toEqual({ scene: 'waystation_landing', spawn: 'after_battle' });
  });

  it('River Ward is available here because Adrian has learned it', () => {
    expect(playerStatsFor({}, W).ward).toBeUndefined();
    expect(playerStatsFor({ c2_learned_ward: true }, W).ward).toEqual(RIVER_WARD);
  });

  it('going all-out loses', () => {
    expect(play(allOut).phase).toBe('defeat');
  });

  it('defending every heavy blow only just scrapes through; adding River Ward wins comfortably', () => {
    const tight = play(defendHeavy);
    expect(tight.phase).toBe('victory');
    expect(tight.playerHp).toBeLessThanOrEqual(5);
    const comfy = play(wardWhenHurt);
    expect(comfy.phase).toBe('victory');
    expect(comfy.playerHp).toBeGreaterThanOrEqual(10);
  });
});

// ── Story flow ──────────────────────────────────────────

const s = () => gameStore.getState();

const AFTER_SPIRIT: StoryFlag[] = [
  'prologue_complete', 'chapter1_started', 'c1_escaped', 'chapter2_started', 'c2_arrived', 'c2_talked_mara',
  'c2_saw_news', 'c2_talked_captain', 'c2_reached_jetty', 'c2_village_arrived', 'c2_read_notice', 'c2_talked_lim',
  'c2_met_pell', 'c2_home_talked', 'c2_found_map', 'c2_went_upriver', 'c2_landing_arrived', 'c2_stone_deep',
  'c2_stone_bright', 'c2_stones_woken', 'c2_spirit_defeated', 'c2_learned_ward',
];

function placeIn(scene: 'waystation_landing' | 'waystation_hall', spawn: string, flags: StoryFlag[]) {
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

function fight(strategy: (st: BattleState) => Command) {
  for (let i = 0; i < 200 && s().battle; i++) {
    const b = s().battle!;
    if (b.stage === 'command') s().chooseCommand(strategy(b.state));
    else if (b.stage === 'defeat') return 'defeat';
    else s().advanceBattle();
  }
  return 'done';
}

describe('Milestone 2.4 flow', () => {
  beforeEach(async () => {
    await loadChapter(2);
  });

  it('a save from the old 2.3 cliffhanger walks through the open door', () => {
    placeIn('waystation_landing', 'after_battle', AFTER_SPIRIT);
    expect(s().mode).toBe('explore');
    expect(objective()).toBe('c2_search');
    use('waystation-enter');
    expect(s().transition?.to).toBe('waystation_hall');
  });

  it('journal → Charter → Daniel → the Hollow Warden → To Be Continued', () => {
    placeIn('waystation_landing', 'after_battle', AFTER_SPIRIT);
    use('waystation-enter');
    arrive();
    expect(s().scene).toBe('waystation_hall');
    expect(s().dialogue?.def.id).toBe('c2_hall_arrival');
    finishDialogue();

    // The case stays shut until the journal says how to open it.
    expect(look('charter-case')).toBe('c2_case_sealed');
    expect(look('oath-wall')).toBe('c2_oath'); // optional
    expect(s().flags.c2_read_oath).toBe(true);
    expect(look('hall-basin')).toBe('c2_basin');
    expect(look('elias-journal')).toBe('c2_journal');
    expect(s().flags.c2_read_journal).toBe(true);
    expect(look('elias-journal')).toBe('c2_journal_again');
    expect(objective()).toBe('c2_search');

    use('charter-case');
    expect(s().dialogue?.def.id).toBe('c2_charter');
    finishDialogue(); // the Charter, then straight into Daniel's return
    expect(s().flags.c2_found_charter).toBe(true);
    expect(s().flags.c2_daniel_returned).toBe(true);
    expect(objective()).toBe('c2_warden');
    expect(s().transition?.to).toBe('waystation_landing');

    // Out on the landing, the Warden climbs out of the river and the battle begins.
    arrive();
    expect(s().spawn).toEqual(SCENES.waystation_landing.spawns.from_hall);
    expect(s().dialogue?.def.id).toBe('c2_warden_appears');
    finishDialogue();
    expect(s().flags.c2_warden_seen).toBe(true);
    expect(s().battle?.encounter.id).toBe('hollow_warden');
    expect(s().battle?.player.ward).toEqual(RIVER_WARD);
    expect(fight(wardWhenHurt)).toBe('done');
    expect(s().flags.c2_warden_defeated).toBe(true);
    expect(s().dialogue?.def.id).toBe('c2_warden_defeated');
    finishDialogue();
    expect(s().mode).toBe('ending');
    expect(isAtChapterEnd(s().flags)).toBe(true);
    expect(objective()).toBeUndefined();
  });

  it('Daniel stands on the landing once he is back, and the Warden can be faced again after a reload', () => {
    placeIn('waystation_landing', 'from_hall', [
      ...AFTER_SPIRIT, 'c2_entered_hall', 'c2_read_journal', 'c2_found_charter', 'c2_daniel_returned', 'c2_warden_seen',
    ]);
    expect(s().mode).toBe('explore');
    expect(look('npc-daniel-landing')).toBe('c2_daniel_landing');
    use('hollow-warden');
    expect(s().dialogue?.def.id).toBe('c2_warden_again');
    finishDialogue();
    expect(fight(allOut)).toBe('defeat');
    expect(s().retryBattle()).toBe(true);
    expect(s().battle?.state.wardCharges).toBe(1);
  });

  it('a hall save before the spirit is beaten is sent back to the village', () => {
    const r = validateSave({
      schemaVersion: 1,
      scene: 'waystation_hall',
      position: SCENES.waystation_hall.spawns.entrance,
      flags: AFTER_SPIRIT.filter((f) => f !== 'c2_spirit_defeated' && f !== 'c2_learned_ward'),
      playTimeMs: 0,
      prologueComplete: true,
    });
    expect(r.ok && r.data.scene).toBe('village');
  });

  it('a save at the end reopens the To Be Continued card', () => {
    placeIn('waystation_landing', 'after_battle', [
      ...AFTER_SPIRIT, 'c2_entered_hall', 'c2_read_journal', 'c2_found_charter', 'c2_daniel_returned', 'c2_warden_seen',
      'c2_warden_defeated',
    ]);
    expect(s().mode).toBe('ending');
  });
});
