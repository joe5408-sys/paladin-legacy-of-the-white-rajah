/**
 * Chapter 2, Milestone 2.3 — The Waystation: River Ward's rules, the training
 * spirit's balance, the stone puzzle (including the reset), saves and the ending.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  canUse,
  createBattle,
  describeEvent,
  enemyAction,
  playerAction,
  type BattleState,
  type Command,
} from '../../src/game/combat/battle';
import { ENCOUNTERS, PLAYER_BATTLE_STATS, playerStatsFor, RIVER_WARD } from '../../src/data/encounters';
import { gameStore } from '../../src/game/core/gameStore';
import { loadChapter } from '../../src/chapters/loader';
import { getLayout } from '../../src/data/layouts';
import { SCENES } from '../../src/data/scenes';
import { currentObjective, isAtChapterEnd, objectivesFor } from '../../src/game/quests/quests';
import { isAvailable } from '../../src/game/interaction/interaction';
import { buildSave, isStandable, validateSave } from '../../src/game/save/save';
import type { StoryFlag } from '../../src/game/core/flags';

const T = ENCOUNTERS.training_spirit;
const S = ENCOUNTERS.hollow_sentinel;
const P = PLAYER_BATTLE_STATS;
const PW = { ...P, ward: RIVER_WARD };

// ── Battle rules ────────────────────────────────────────

function play(strategy: (s: BattleState) => Command, player = PW, enc = T): BattleState {
  let s = createBattle(player, enc);
  for (let i = 0; i < 60 && (s.phase === 'player' || s.phase === 'enemy'); i++) {
    const p = playerAction(s, player, strategy(s));
    if (!p) throw new Error('command not allowed');
    s = p.state.phase === 'enemy' ? enemyAction(p.state, player, enc)!.state : p.state;
  }
  return s;
}
const allOut = (s: BattleState): Command => (s.skillCharges > 0 ? 'skill' : 'attack');
const defendWaves = (s: BattleState): Command => (s.charging ? 'defend' : allOut(s));
const wardFirstWave = (s: BattleState): Command => (s.charging && s.wardCharges > 0 ? 'ward' : allOut(s));

describe('River Ward', () => {
  it('only exists once learned, or in the battle that teaches it', () => {
    expect(playerStatsFor({}, S).ward).toBeUndefined();
    expect(playerStatsFor({}, T).ward).toEqual(RIVER_WARD);
    expect(playerStatsFor({ c2_learned_ward: true }, S).ward).toEqual(RIVER_WARD);
    expect(createBattle(P, S).wardCharges).toBe(0);
    expect(canUse(createBattle(P, S), 'ward')).toBe(false);
    expect(canUse(createBattle(PW, T), 'ward')).toBe(true);
  });

  it('heals (never above max HP), then blocks the next hit completely, once per battle', () => {
    let s: BattleState = { ...createBattle(PW, T), playerHp: 12, phase: 'player' };
    const w = playerAction(s, PW, 'ward')!;
    expect(w.event).toEqual({ kind: 'ward', actor: 'player', damage: 0, heal: RIVER_WARD.heal });
    expect(w.state.playerHp).toBe(12 + RIVER_WARD.heal);
    expect(w.state.warded).toBe(true);
    expect(w.state.wardCharges).toBe(0);
    expect(canUse({ ...w.state, phase: 'player' }, 'ward')).toBe(false);

    const hit = enemyAction(w.state, PW, T)!;
    expect(hit.event).toMatchObject({ kind: 'enemy_attack', damage: 0, warded: true });
    expect(hit.state.playerHp).toBe(12 + RIVER_WARD.heal);
    expect(hit.state.warded).toBe(false);

    s = createBattle(PW, T); // full HP: no healing, still a ward
    expect(playerAction(s, PW, 'ward')!.state.playerHp).toBe(P.maxHp);
  });

  it('lasts through a charging turn and swallows the heavy blow', () => {
    let s = createBattle(PW, T);
    s = enemyAction(playerAction(s, PW, 'attack')!.state, PW, T)!.state; // round 1: normal hit
    const w = playerAction(s, PW, 'ward')!.state; // round 2: ward, the spirit charges
    const charge = enemyAction(w, PW, T)!;
    expect(charge.event.kind).toBe('enemy_charge');
    expect(charge.state.warded).toBe(true);
    const heavy = enemyAction(playerAction(charge.state, PW, 'attack')!.state, PW, T)!;
    expect(heavy.event).toMatchObject({ heavy: true, damage: 0, warded: true });
  });

  it('describes itself in the battle log', () => {
    expect(describeEvent({ kind: 'ward', actor: 'player', damage: 0, heal: 10 }, PW, T)).toMatch(/River Ward.*10 HP/);
    expect(
      describeEvent({ kind: 'enemy_attack', actor: 'enemy', damage: 0, defended: false, heavy: true, warded: true }, PW, T),
    ).toMatch(/swallows the blow/);
  });
});

describe('Spirit of the Waystation', () => {
  it('opens with a normal hit, then winds up a wave every other round', () => {
    expect(T.heavy?.every).toBe(2);
    expect(T.teachesWard).toBe(true);
    expect(T.returnTo).toEqual({ scene: 'waystation_landing', spawn: 'after_battle' });
  });

  it('warding a wave and attacking wins with HP to spare', () => {
    const end = play(wardFirstWave);
    expect(end.phase).toBe('victory');
    expect(end.playerHp).toBeGreaterThanOrEqual(12);
  });

  it('ignoring River Ward loses, whether all-out or defending every wave', () => {
    expect(play(allOut).phase).toBe('defeat');
    expect(play(defendWaves).phase).toBe('defeat');
  });

  it('saving the ward for later also wins (the lesson is forgiving)', () => {
    const late = (s: BattleState) => (s.charging && s.wardCharges > 0 && s.playerHp < 15 ? 'ward' : allOut(s));
    expect(play(late).phase).toBe('victory');
  });
});

// ── Story flow ──────────────────────────────────────────

const s = () => gameStore.getState();

const BEFORE_UPRIVER: StoryFlag[] = [
  'prologue_complete', 'chapter1_started', 'c1_escaped', 'chapter2_started', 'c2_arrived', 'c2_talked_mara',
  'c2_saw_news', 'c2_talked_captain', 'c2_reached_jetty', 'c2_village_arrived', 'c2_read_notice', 'c2_talked_lim',
  'c2_met_pell', 'c2_home_talked', 'c2_found_map',
];

function placeIn(scene: 'home_c2' | 'village_c2' | 'waystation_landing', spawn: string, flags: StoryFlag[]) {
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
function touch(id: string) {
  use(id);
  const dialogue = s().dialogue?.def.id;
  finishDialogue();
  return dialogue;
}
const objective = () => currentObjective(objectivesFor(s().flags), s().flags)?.id;

/** Plays the battle through the store with a strategy, like the HUD would. */
function fight(strategy: (st: BattleState) => Command) {
  for (let i = 0; i < 200 && s().battle; i++) {
    const b = s().battle!;
    if (b.stage === 'command') s().chooseCommand(strategy(b.state));
    else if (b.stage === 'defeat') return 'defeat';
    else s().advanceBattle();
  }
  return 'done';
}

describe('Milestone 2.3 flow', () => {
  beforeEach(async () => {
    await loadChapter(2);
  });

  it('a save from the old 2.2 cliffhanger sets off upriver from the portrait', () => {
    placeIn('home_c2', 'door', BEFORE_UPRIVER);
    expect(s().mode).toBe('explore'); // no longer an ending
    expect(objective()).toBe('c2_upriver');
    use('npc-mara-home-c2');
    expect(s().dialogue?.def.id).toBe('c2_mara_home_go');
    finishDialogue();
    use('portrait-c2');
    expect(s().dialogue?.def.id).toBe('c2_portrait_go');
    finishDialogue();
    expect(s().transition?.to).toBe('waystation_landing');
    expect(s().flags.c2_went_upriver).toBe(true);
  });

  it('Ah Hock at the village jetty also takes Adrian upriver once the map is found', () => {
    placeIn('village_c2', 'jetty', BEFORE_UPRIVER);
    finishDialogue();
    use('npc-ahhock-village');
    expect(s().dialogue?.def.id).toBe('c2_ahhock_go');
    finishDialogue();
    expect(s().transition?.to).toBe('waystation_landing');
  });

  it('wakes the stones in order (wrong orders go dark), passes the test and learns River Ward', () => {
    placeIn('home_c2', 'door', BEFORE_UPRIVER);
    use('portrait-c2');
    finishDialogue();
    arrive();
    expect(s().scene).toBe('waystation_landing');
    expect(s().spawn).toEqual(SCENES.waystation_landing.spawns.arrival);
    expect(s().dialogue?.def.id).toBe('c2_landing_arrival');
    finishDialogue();
    expect(objective()).toBe('c2_stones');

    // Talk and look around first; nothing changes.
    expect(touch('npc-mara-landing')).toBe('c2_mara_landing');
    expect(touch('npc-ahhock-landing')).toBe('c2_ahhock_landing');
    expect(touch('waystation-door')).toBe('c2_door_sealed');

    // Wrong starts: nothing lights.
    expect(touch('stone-bright')).toBe('c2_stone_bright_dark');
    expect(touch('stone-waits')).toBe('c2_stone_waits_dark');
    expect(s().flags.c2_stone_deep).toBeUndefined();

    // Deep, then the one that waits: every stone goes dark again.
    expect(touch('stone-deep')).toBe('c2_stone_deep_wake');
    expect(s().flags.c2_stone_deep).toBe(true);
    expect(touch('stone-deep')).toBe('c2_stone_glowing');
    expect(touch('stone-waits')).toBe('c2_stones_reset');
    expect(s().flags.c2_stone_deep).toBeUndefined();
    expect(s().mode).toBe('explore');

    // The right order.
    expect(touch('stone-deep')).toBe('c2_stone_deep_wake');
    expect(touch('stone-bright')).toBe('c2_stone_bright_wake');
    expect(touch('stone-bright')).toBe('c2_stone_glowing');
    use('stone-waits');
    expect(s().dialogue?.def.id).toBe('c2_stone_waits_wake');
    finishDialogue();
    expect(s().flags.c2_stones_woken).toBe(true);
    expect(objective()).toBe('c2_spirit');

    // The training battle, with River Ward on the menu.
    expect(s().mode).toBe('battle');
    expect(s().battle?.encounter.id).toBe('training_spirit');
    expect(s().battle?.player.ward).toEqual(RIVER_WARD);
    expect(fight(wardFirstWave)).toBe('done');
    expect(s().flags.c2_spirit_defeated).toBe(true);
    expect(s().scene).toBe('waystation_landing');
    expect(s().spawn).toEqual(SCENES.waystation_landing.spawns.after_battle);
    expect(s().dialogue?.def.id).toBe('c2_spirit_defeated');
    finishDialogue();
    expect(s().flags.c2_learned_ward).toBe(true);
    expect(s().mode).toBe('ending');
    expect(isAtChapterEnd(s().flags)).toBe(true);
    expect(objective()).toBeUndefined();
  });

  it('a defeat can be retried; closing the game mid-battle lets you face the spirit again', () => {
    placeIn('waystation_landing', 'arrival', [...BEFORE_UPRIVER, 'c2_went_upriver', 'c2_landing_arrived', 'c2_stone_deep', 'c2_stone_bright']);
    use('stone-waits');
    finishDialogue();
    expect(fight(allOut)).toBe('defeat');
    expect(s().retryBattle()).toBe(true);
    expect(s().battle?.state.wardCharges).toBe(1);

    // The battle is never saved: a save taken now reloads on the landing.
    placeIn('waystation_landing', 'after_battle', [...BEFORE_UPRIVER, 'c2_went_upriver', 'c2_landing_arrived', 'c2_stones_woken']);
    expect(s().mode).toBe('explore');
    use('training-spirit');
    expect(s().dialogue?.def.id).toBe('c2_spirit_again');
    finishDialogue();
    expect(s().battle?.encounter.id).toBe('training_spirit');
  });

  it('a half-finished puzzle is kept in a save', () => {
    placeIn('waystation_landing', 'arrival', [...BEFORE_UPRIVER, 'c2_went_upriver', 'c2_landing_arrived', 'c2_stone_deep']);
    expect(s().flags.c2_stone_deep).toBe(true);
    expect(touch('stone-bright')).toBe('c2_stone_bright_wake');
  });

  it('a landing save before going upriver is sent back to the village', () => {
    const r = validateSave({
      schemaVersion: 1,
      scene: 'waystation_landing',
      position: SCENES.waystation_landing.spawns.arrival,
      flags: BEFORE_UPRIVER,
      playTimeMs: 0,
      prologueComplete: true,
    });
    expect(r.ok && r.data.scene).toBe('village');
  });

  it('both spawn points are standable, with or without the spirit in the doorway', () => {
    for (const sp of Object.values(SCENES.waystation_landing.spawns)) {
      expect(isStandable('waystation_landing', sp, {})).toBe(true);
      expect(isStandable('waystation_landing', sp, { c2_stones_woken: true })).toBe(true);
    }
  });
});
