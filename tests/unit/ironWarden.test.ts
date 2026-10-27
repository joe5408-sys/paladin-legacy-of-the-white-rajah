/**
 * Chapter 2, Milestone 2.5 — The Iron Warden: the armour phase in battle.ts,
 * the boss's balance, the jetty at dusk, saves and the Chapter 2 Complete card.
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
import { hasChapterAfter, loadChapter } from '../../src/chapters/loader';
import { getLayout } from '../../src/data/layouts';
import { SCENES } from '../../src/data/scenes';
import { currentObjective, isAtChapterEnd, objectivesFor } from '../../src/game/quests/quests';
import { isAvailable } from '../../src/game/interaction/interaction';
import { buildSave, validateSave } from '../../src/game/save/save';
import type { StoryFlag } from '../../src/game/core/flags';

const I = ENCOUNTERS.iron_warden;
const PW = { ...PLAYER_BATTLE_STATS, ward: RIVER_WARD };

// ── Battle rules ────────────────────────────────────────

describe('armour (boss phase 1)', () => {
  it('starts armoured; other enemies never are', () => {
    expect(createBattle(PW, I).armored).toBe(true);
    expect(createBattle(PW, ENCOUNTERS.hollow_warden).armored).toBe(false);
  });

  it('an ordinary attack glances off for 1 damage and leaves the armour on', () => {
    const r = playerAction(createBattle(PW, I), PW, 'attack', I)!;
    expect(r.event).toEqual({ kind: 'attack', actor: 'player', damage: I.armor!.attackDamage, armored: true });
    expect(r.state.enemyHp).toBe(I.enemyMaxHp - I.armor!.attackDamage);
    expect(r.state.armored).toBe(true);
    expect(describeEvent(r.event, PW, I)).toBe(I.armor!.glanceText);
  });

  it('Radiant Strike breaks the armour and lands in full; then attacks hit normally', () => {
    const r = playerAction(createBattle(PW, I), PW, 'skill', I)!;
    expect(r.event).toEqual({ kind: 'skill', actor: 'player', damage: PW.skillDamage, brokeArmor: true });
    expect(r.state.armored).toBe(false);
    expect(describeEvent(r.event, PW, I)).toContain(I.armor!.breakText);
    const next = enemyAction(r.state, PW, I)!.state;
    const hit = playerAction(next, PW, 'attack', I)!;
    expect(hit.event).toEqual({ kind: 'attack', actor: 'player', damage: PW.attack });
  });

  it('only the first Radiant Strike breaks it', () => {
    let st = playerAction(createBattle(PW, I), PW, 'skill', I)!.state;
    st = enemyAction(st, PW, I)!.state;
    expect(playerAction(st, PW, 'skill', I)!.event).toEqual({ kind: 'skill', actor: 'player', damage: PW.skillDamage });
  });

  it('never winds up a heavy blow while armoured; does once the armour is off', () => {
    let st = createBattle(PW, I);
    for (let i = 0; i < 6; i++) {
      const e = enemyAction(playerAction(st, PW, 'defend', I)!.state, PW, I)!;
      expect(e.event.kind).toBe('enemy_attack');
      st = e.state;
    }
    st = enemyAction(playerAction(st, PW, 'skill', I)!.state, PW, I)!.state; // round 7: the armour breaks
    const kinds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const e = enemyAction(playerAction(st, PW, 'defend', I)!.state, PW, I)!;
      kinds.push(e.event.kind);
      st = e.state;
    }
    expect(kinds).toContain('enemy_charge');
  });

  it('without the encounter, playerAction ignores armour (old callers keep working)', () => {
    const r = playerAction(createBattle(PW, I), PW, 'attack')!;
    expect(r.event).toEqual({ kind: 'attack', actor: 'player', damage: PW.attack });
  });
});

// ── Balance ─────────────────────────────────────────────

function play(strategy: (s: BattleState) => Command, player = PW): BattleState {
  let s = createBattle(player, I);
  for (let i = 0; i < 80 && (s.phase === 'player' || s.phase === 'enemy'); i++) {
    const cmd = strategy(s);
    expect(canUse(s, cmd), cmd).toBe(true);
    const p = playerAction(s, player, cmd, I)!;
    s = p.state.phase === 'enemy' ? enemyAction(p.state, player, I)!.state : p.state;
  }
  return s;
}
const allOut = (s: BattleState): Command => (s.skillCharges > 0 ? 'skill' : 'attack');
/** Break the armour at once, ward the first heavy blow, defend the rest. */
const intended = (s: BattleState): Command =>
  s.armored ? 'skill' : s.charging ? (s.wardCharges > 0 ? 'ward' : 'defend') : allOut(s);
const neverWard = (s: BattleState): Command => (s.armored ? 'skill' : s.charging ? 'defend' : allOut(s));
const ignoreArmor = (s: BattleState): Command =>
  s.charging ? (s.wardCharges > 0 ? 'ward' : 'defend') : s.wardCharges > 0 && s.playerHp < 12 ? 'ward' : 'attack';

describe('Iron Warden balance', () => {
  it('is the chapter boss: armoured, with a heavy blow Defend only halves', () => {
    expect(I.armor).toBeDefined();
    expect(I.heavy!.guardedMultiplier).toBe(0.5);
    expect(I.heavy!.damage).toBeGreaterThanOrEqual(ENCOUNTERS.hollow_warden.heavy!.damage);
    expect(I.returnTo).toEqual({ scene: 'jetty_dusk', spawn: 'after_battle' });
    expect(playerStatsFor({ c2_learned_ward: true }, I).ward).toEqual(RIVER_WARD);
  });

  it('going all-out loses', () => {
    expect(play(allOut).phase).toBe('defeat');
  });

  it('ignoring the armour loses', () => {
    expect(play(ignoreArmor).phase).toBe('defeat');
  });

  it('never using River Ward loses', () => {
    expect(play(neverWard).phase).toBe('defeat');
  });

  it('breaking the armour and warding the first heavy blow wins with HP to spare', () => {
    const end = play(intended);
    expect(end.phase).toBe('victory');
    expect(end.playerHp).toBeGreaterThanOrEqual(10);
  });
});

// ── Story flow ──────────────────────────────────────────

const s = () => gameStore.getState();

const AFTER_HOLLOW_WARDEN: StoryFlag[] = [
  'prologue_complete', 'chapter1_started', 'c1_escaped', 'chapter2_started', 'c2_arrived', 'c2_talked_mara',
  'c2_saw_news', 'c2_talked_captain', 'c2_reached_jetty', 'c2_village_arrived', 'c2_read_notice', 'c2_talked_lim',
  'c2_met_pell', 'c2_home_talked', 'c2_found_map', 'c2_went_upriver', 'c2_landing_arrived', 'c2_stone_deep',
  'c2_stone_bright', 'c2_stones_woken', 'c2_spirit_defeated', 'c2_learned_ward', 'c2_entered_hall',
  'c2_read_journal', 'c2_found_charter', 'c2_daniel_returned', 'c2_warden_seen', 'c2_warden_defeated',
];

function placeIn(scene: 'waystation_landing' | 'jetty_dusk', spawn: string, flags: StoryFlag[]) {
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

describe('Milestone 2.5 flow', () => {
  beforeEach(async () => {
    await loadChapter(2);
  });

  it('home at dusk → Pell → the Iron Warden → Chapter 2 Complete', () => {
    placeIn('waystation_landing', 'after_battle', AFTER_HOLLOW_WARDEN);
    use('npc-mara-landing');
    finishDialogue();
    arrive();
    expect(s().scene).toBe('jetty_dusk');
    expect(s().spawn).toEqual(SCENES.jetty_dusk.spawns.arrival);
    expect(s().dialogue?.def.id).toBe('c2_dusk_arrival');
    finishDialogue();
    expect(s().flags.c2_dusk_arrived).toBe(true);
    expect(objective()).toBe('c2_pell_barge');

    // Everyone has a line while Adrian walks to the barge (all optional).
    expect(look('npc-mara-dusk')).toBe('c2_mara_dusk');
    expect(look('npc-daniel-dusk')).toBe('c2_daniel_dusk');
    expect(look('npc-lim-dusk')).toBe('c2_lim_dusk');
    expect(look('npc-siti-dusk')).toBe('c2_siti_dusk');
    expect(look('npc-ahhock-dusk')).toBe('c2_ahhock_dusk');
    expect(look('notice-board-dusk')).toBe('c2_notice_dusk');

    use('npc-pell-dusk');
    expect(s().dialogue?.def.id).toBe('c2_pell_dusk');
    finishDialogue();
    expect(s().flags.c2_iron_seen).toBe(true);
    expect(objective()).toBe('c2_iron');
    expect(s().battle?.encounter.id).toBe('iron_warden');
    expect(s().battle?.state.armored).toBe(true);
    expect(s().battle?.player.ward).toEqual(RIVER_WARD);

    expect(fight(intended)).toBe('done');
    expect(s().flags.c2_iron_defeated).toBe(true);
    expect(s().spawn).toEqual(SCENES.jetty_dusk.spawns.after_battle);
    expect(s().dialogue?.def.id).toBe('c2_iron_defeated');
    finishDialogue();
    expect(s().mode).toBe('ending');
    expect(isAtChapterEnd(s().flags)).toBe(true);
    expect(objective()).toBeUndefined();
    expect(hasChapterAfter(2)).toBe(false); // no Chapter 3 yet
  });

  it('a defeat can be retried at full strength, armour and all', () => {
    placeIn('jetty_dusk', 'arrival', [...AFTER_HOLLOW_WARDEN, 'c2_dusk_arrived']);
    use('npc-pell-dusk');
    finishDialogue();
    expect(fight(allOut)).toBe('defeat');
    expect(s().retryBattle()).toBe(true);
    expect(s().battle?.state).toMatchObject({ armored: true, wardCharges: 1, skillCharges: 2, playerHp: PW.maxHp });
  });

  it('the Iron Warden can be faced again after a reload mid-battle, and blocks the boardwalk until then', () => {
    placeIn('jetty_dusk', 'arrival', [...AFTER_HOLLOW_WARDEN, 'c2_dusk_arrived', 'c2_iron_seen']);
    expect(s().mode).toBe('explore');
    const layout = getLayout('jetty_dusk')!;
    expect(layout.colliders(s().flags).length).toBe(layout.colliders({ ...s().flags, c2_iron_seen: undefined }).length + 1);
    expect(look('npc-pell-dusk')).toBe('c2_pell_dusk_after');
    use('iron-warden');
    expect(s().dialogue?.def.id).toBe('c2_iron_again');
    finishDialogue();
    expect(s().battle?.encounter.id).toBe('iron_warden');
  });

  it('a save at the end reopens the Chapter 2 Complete card', () => {
    placeIn('jetty_dusk', 'after_battle', [...AFTER_HOLLOW_WARDEN, 'c2_dusk_arrived', 'c2_iron_seen', 'c2_iron_defeated']);
    expect(s().mode).toBe('ending');
  });

  it('a jetty save before the Hollow Warden is beaten is sent back to the village', () => {
    const r = validateSave({
      schemaVersion: 1,
      scene: 'jetty_dusk',
      position: SCENES.jetty_dusk.spawns.arrival,
      flags: AFTER_HOLLOW_WARDEN.filter((f) => f !== 'c2_warden_defeated'),
      playTimeMs: 0,
      prologueComplete: true,
    });
    expect(r.ok && r.data.scene).toBe('village');
  });
});
