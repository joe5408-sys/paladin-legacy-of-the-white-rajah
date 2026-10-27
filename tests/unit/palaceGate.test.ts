/**
 * Chapter 3, Milestone 3.3 — The Palace Gate: the yield rule in battle.ts, the
 * first Crowned Sentinel fight's balance, the forecourt story, saves and the
 * "to be continued" ending.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { createBattle, describeEvent, enemyAction, playerAction, type BattleState, type Command } from '../../src/game/combat/battle';
import { ENCOUNTERS, PLAYER_BATTLE_STATS, playerStatsFor, RIVER_WARD, CHAPTER3_MAX_HP } from '../../src/data/encounters';
import { gameStore } from '../../src/game/core/gameStore';
import { loadChapter } from '../../src/chapters/loader';
import { getLayout } from '../../src/data/layouts';
import { SCENES } from '../../src/data/scenes';
import { currentObjective, isAtChapterEnd, objectivesFor } from '../../src/game/quests/quests';
import { isAvailable } from '../../src/game/interaction/interaction';
import { buildSave, validateSave } from '../../src/game/save/save';
import type { StoryFlag } from '../../src/game/core/flags';

const G = ENCOUNTERS.crowned_sentinel_gate;
const P3 = { ...PLAYER_BATTLE_STATS, maxHp: CHAPTER3_MAX_HP, ward: RIVER_WARD };

// ── The yield rule ──────────────────────────────────────

describe('yield (new system 2)', () => {
  it('ends the battle in victory when a blow brings the enemy to its yield point, still standing', () => {
    const st: BattleState = { ...createBattle(P3, G), enemyHp: G.yieldAt! + P3.attack };
    const r = playerAction(st, P3, 'attack', G)!;
    expect(r.state.enemyHp).toBe(G.yieldAt);
    expect(r.state.phase).toBe('victory');
    expect(r.event).toEqual({ kind: 'attack', actor: 'player', damage: P3.attack, yielded: true });
    expect(describeEvent(r.event, P3, G)).toContain('takes');
  });

  it('does not trigger above the yield point, and a knockout still counts as an ordinary win', () => {
    const above = playerAction({ ...createBattle(P3, G), enemyHp: G.yieldAt! + P3.attack + 1 }, P3, 'attack', G)!;
    expect(above.state.phase).toBe('enemy');
    expect(above.event).not.toHaveProperty('yielded');
    const ko = playerAction({ ...createBattle(P3, G), enemyHp: 3 }, P3, 'skill', G)!;
    expect(ko.state).toMatchObject({ enemyHp: 0, phase: 'victory' });
    expect(ko.event).not.toHaveProperty('yielded');
  });

  it('other enemies have no yield point', () => {
    for (const enc of Object.values(ENCOUNTERS)) if (enc.id !== G.id) expect(enc.yieldAt, enc.id).toBeUndefined();
  });
});

// ── Balance ─────────────────────────────────────────────

function play(strategy: (s: BattleState) => Command, player = P3): BattleState {
  let s = createBattle(player, G);
  for (let i = 0; i < 80 && (s.phase === 'player' || s.phase === 'enemy'); i++) {
    const p = playerAction(s, player, strategy(s), G)!;
    s = p.state.phase === 'enemy' ? enemyAction(p.state, player, G)!.state : p.state;
  }
  return s;
}
const allOut = (s: BattleState): Command => (s.skillCharges > 0 ? 'skill' : 'attack');
const defendHeavy = (s: BattleState): Command => (s.charging ? 'defend' : allOut(s));
const wardWhenHurt = (s: BattleState): Command =>
  s.charging ? 'defend' : s.wardCharges > 0 && s.playerHp < 18 ? 'ward' : allOut(s);

describe('Crowned Sentinel at the gate: balance', () => {
  it('is a palace construct with a blockable heavy blow, fought with Chapter 3 stats', () => {
    expect(G.heavy!.guardedMultiplier).toBe(0);
    expect(G.armor).toBeUndefined(); // the armour comes in Milestone 3.5
    expect(G.yieldAt).toBeGreaterThan(0);
    expect(G.returnTo).toEqual({ scene: 'palace_gate', spawn: 'after_battle' });
    const stats = playerStatsFor({ chapter3_started: true, c2_learned_ward: true }, G);
    expect(stats.maxHp).toBe(36);
    expect(stats.ward).toEqual(RIVER_WARD);
  });

  it('going all-out loses', () => {
    expect(play(allOut).phase).toBe('defeat');
  });

  it('defending the heavy blows wins; River Ward when hurt wins with more to spare', () => {
    const d = play(defendHeavy);
    expect(d.phase).toBe('victory');
    expect(d.playerHp).toBeGreaterThanOrEqual(10);
    expect(d.enemyHp).toBeLessThanOrEqual(G.yieldAt!); // it withdrew, still standing
    expect(d.enemyHp).toBeGreaterThan(0);
    const w = play(wardWhenHurt);
    expect(w.phase).toBe('victory');
    expect(w.playerHp).toBeGreaterThanOrEqual(d.playerHp);
  });
});

// ── Story flow ──────────────────────────────────────────

const s = () => gameStore.getState();

const BEFORE_GATE: StoryFlag[] = [
  'prologue_complete', 'chapter1_started', 'c1_escaped', 'chapter2_started', 'c2_learned_ward', 'c2_found_charter',
  'c2_warden_defeated', 'c2_iron_defeated', 'chapter3_started', 'c3_arrived', 'c3_talked_pell', 'c3_saw_news',
  'c3_daniel_called', 'c3_reached_kuching', 'c3_kuching_arrived', 'c3_met_jamilah', 'c3_room_entered',
  'c3_read_note', 'c3_reason_family', 'c3_pell_signed', 'c3_daniel_arrived', 'c3_plan_made',
];

function placeIn(scene: 'jamilah_room' | 'palace_gate', spawn: string, flags: StoryFlag[]) {
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

describe('Milestone 3.3 flow', () => {
  beforeEach(async () => {
    await loadChapter(3);
  });

  it('the forecourt → the Clerk → Sergeant Osman → the Crowned Sentinel withdraws → To Be Continued', () => {
    placeIn('jamilah_room', 'arrival', BEFORE_GATE);
    use('room-stairs');
    finishDialogue();
    arrive();
    expect(s().scene).toBe('palace_gate');
    expect(s().dialogue?.def.id).toBe('c3_gate_arrival');
    finishDialogue();
    expect(objective()).toBe('c3_clerk');

    // Everyone in the forecourt has a line (all optional).
    expect(look('npc-teacher')).toBe('c3_teacher');
    expect(look('npc-fisher')).toBe('c3_fisher');
    expect(look('npc-auntie-gate')).toBe('c3_auntie_gate');
    expect(look('npc-daniel-gate')).toBe('c3_daniel_gate');
    expect(look('npc-mara-gate')).toBe('c3_mara_gate');
    expect(look('npc-pell-gate')).toBe('c3_pell_gate');
    expect(look('npc-gate-officer')).toBe('c3_gate_officer');
    expect(look('npc-sergeant')).toBe('c3_sergeant_early');
    expect(look('palace-gate')).toBe('c3_gate_closed');

    use('npc-clerk');
    expect(s().dialogue?.def.id).toBe('c3_clerk');
    finishDialogue(); // registered, then straight into the sergeant and the Sentinel
    expect(s().flags.c3_petition_registered).toBe(true);
    expect(s().flags.c3_sentinel_woken).toBe(true);
    expect(objective()).toBe('c3_gate');
    expect(s().battle?.encounter.id).toBe('crowned_sentinel_gate');
    expect(s().battle?.state.playerMaxHp).toBe(36);

    expect(fight(defendHeavy)).toBe('done');
    expect(s().flags.c3_sentinel_withdrew).toBe(true);
    expect(s().spawn).toEqual(SCENES.palace_gate.spawns.after_battle);
    expect(s().dialogue?.def.id).toBe('c3_sentinel_withdraws');
    finishDialogue();
    expect(s().flags.c3_gate_open).toBe(true);
    expect(s().mode).toBe('ending');
    expect(isAtChapterEnd(s().flags)).toBe(true);
    expect(objective()).toBeUndefined();
  });

  it('the Sentinel blocks the gateway after a reload mid-battle, and can be faced again', () => {
    placeIn('palace_gate', 'arrival', [...BEFORE_GATE, 'c3_gate_arrived', 'c3_petition_registered', 'c3_sentinel_woken']);
    expect(s().mode).toBe('explore');
    const layout = getLayout('palace_gate')!;
    expect(layout.colliders(s().flags).length).toBe(layout.colliders({ ...s().flags, c3_sentinel_woken: undefined }).length + 1);
    expect(look('npc-clerk')).toBe('c3_clerk_after');
    expect(look('npc-sergeant')).toBe('c3_sergeant_after');
    use('crowned-sentinel');
    expect(s().dialogue?.def.id).toBe('c3_sentinel_again');
    finishDialogue();
    expect(fight(allOut)).toBe('defeat');
    expect(s().retryBattle()).toBe(true);
    expect(s().battle?.state).toMatchObject({ playerHp: 36, enemyHp: G.enemyMaxHp, wardCharges: 1 });
  });

  it('a save at the end reopens the card; a forecourt save before the plan is sent back to the village', () => {
    placeIn('palace_gate', 'after_battle', [
      ...BEFORE_GATE, 'c3_gate_arrived', 'c3_petition_registered', 'c3_sentinel_woken', 'c3_sentinel_withdrew', 'c3_gate_open',
    ]);
    expect(s().mode).toBe('ending');

    const r = validateSave({
      schemaVersion: 1,
      scene: 'palace_gate',
      position: SCENES.palace_gate.spawns.arrival,
      flags: BEFORE_GATE.filter((f) => f !== 'c3_plan_made'),
      playTimeMs: 0,
      prologueComplete: true,
    });
    expect(r.ok && r.data.scene).toBe('village');
  });
});
