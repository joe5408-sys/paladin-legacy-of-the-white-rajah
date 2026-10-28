/**
 * Chapter 3, Milestone 3.5 — The Crown Remembers: the final Crowned Sentinel
 * battle (armour → heavy blows → yield), its balance, the ruling and the
 * aftermath in the audience hall, the epilogue at Sungai Awan, saves (including
 * saves from the old 3.4 card) and the Chapter 3 Complete card.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { canUse, createBattle, enemyAction, playerAction, type BattleState, type Command } from '../../src/game/combat/battle';
import { CHAPTER3_MAX_HP, ENCOUNTERS, PLAYER_BATTLE_STATS, playerStatsFor, RIVER_WARD } from '../../src/data/encounters';
import { gameStore } from '../../src/game/core/gameStore';
import { hasChapterAfter, loadChapter } from '../../src/chapters/loader';
import { getLayout } from '../../src/data/layouts';
import { SCENES } from '../../src/data/scenes';
import { currentObjective, isAtChapterEnd, objectivesFor } from '../../src/game/quests/quests';
import { isAvailable } from '../../src/game/interaction/interaction';
import { buildSave, validateSave } from '../../src/game/save/save';
import type { StoryFlag } from '../../src/game/core/flags';
import { hallSentinelAt, HALL_SENTINEL, SENTINEL_ON_FLOOR } from '../../src/chapters/chapter3/audienceData';

const F = ENCOUNTERS.crowned_sentinel_final;
const P3 = { ...PLAYER_BATTLE_STATS, maxHp: CHAPTER3_MAX_HP, ward: RIVER_WARD };

// ── Balance ─────────────────────────────────────────────

function play(strategy: (s: BattleState) => Command, enc = F, player = P3): BattleState {
  let s = createBattle(player, enc);
  for (let i = 0; i < 100 && (s.phase === 'player' || s.phase === 'enemy'); i++) {
    const cmd = strategy(s);
    expect(canUse(s, cmd), cmd).toBe(true);
    const p = playerAction(s, player, cmd, enc)!;
    s = p.state.phase === 'enemy' ? enemyAction(p.state, player, enc)!.state : p.state;
  }
  return s;
}
const allOut = (s: BattleState): Command => (s.skillCharges > 0 ? 'skill' : 'attack');
/** Break the armour at once, ward the first heavy blow, defend the rest. */
const intended = (s: BattleState): Command =>
  s.armored ? 'skill' : s.charging ? (s.wardCharges > 0 ? 'ward' : 'defend') : allOut(s);
// Imperfect play that still respects every mechanic:
const breakLate = (s: BattleState): Command => (s.armored && s.turn < 3 ? 'attack' : intended(s));
const wardSecondBlow = (s: BattleState): Command =>
  s.armored ? 'skill' : s.charging ? (s.wardCharges > 0 && s.playerHp < 28 ? 'ward' : 'defend') : allOut(s);
const wardWhenHurt = (s: BattleState): Command =>
  s.armored ? 'skill' : s.charging ? 'defend' : s.wardCharges > 0 && s.playerHp < 14 ? 'ward' : allOut(s);
const saveSecondStrike = (s: BattleState): Command =>
  s.armored ? 'skill' : s.charging ? (s.wardCharges > 0 ? 'ward' : 'defend') : 'attack';
// Ignoring one mechanic:
const ignoreArmor = (s: BattleState): Command => (s.charging ? (s.wardCharges > 0 ? 'ward' : 'defend') : 'attack');
const neverWard = (s: BattleState): Command => (s.armored ? 'skill' : s.charging ? 'defend' : allOut(s));
const neverDefend = (s: BattleState): Command =>
  s.armored ? 'skill' : s.charging && s.wardCharges > 0 ? 'ward' : allOut(s);

describe('Crowned Sentinel, final battle: rules', () => {
  it('has all three phases, built from existing pieces: armour, heavy blows only River Ward blocks, and a yield', () => {
    expect(F.armor).toBeDefined();
    expect(F.heavy!.guardedMultiplier).toBeGreaterThan(0); // Defend never blocks it completely
    expect(F.heavy!.guardedMultiplier).toBeLessThan(1);
    expect(F.yieldAt).toBeGreaterThan(0);
    expect(F.kneels).toBe(true);
    expect(F.sprite).toBe('crowned');
    expect(F.arena).toBe('palace');
    expect(F.returnTo).toEqual({ scene: 'audience_hall', spawn: 'after_battle' });
    const stats = playerStatsFor({ chapter3_started: true, c2_learned_ward: true }, F);
    expect(stats.maxHp).toBe(36);
    expect(stats.ward).toEqual(RIVER_WARD);
  });

  it('starts armoured; Radiant Strike breaks the armour; heavy blows only start after that', () => {
    let st = createBattle(P3, F);
    expect(st.armored).toBe(true);
    for (let i = 0; i < 4; i++) {
      const e = enemyAction(playerAction(st, P3, 'defend', F)!.state, P3, F)!;
      expect(e.event.kind).toBe('enemy_attack');
      st = e.state;
    }
    const hit = playerAction(st, P3, 'skill', F)!;
    expect(hit.event).toMatchObject({ kind: 'skill', brokeArmor: true });
    st = enemyAction(hit.state, P3, F)!.state;
    const kinds: string[] = [];
    for (let i = 0; i < 3; i++) {
      const e = enemyAction(playerAction(st, P3, 'defend', F)!.state, P3, F)!;
      kinds.push(e.event.kind);
      st = e.state;
    }
    expect(kinds).toContain('enemy_charge');
  });

  it('River Ward blocks a heavy blow completely; Defend only softens it', () => {
    const charging: BattleState = { ...createBattle(P3, F), armored: false, charging: true };
    const warded = enemyAction(playerAction(charging, P3, 'ward', F)!.state, P3, F)!;
    expect(warded.event).toMatchObject({ heavy: true, damage: 0, warded: true });
    const defended = enemyAction(playerAction(charging, P3, 'defend', F)!.state, P3, F)!;
    expect(defended.event).toMatchObject({ heavy: true, defended: true });
    expect((defended.event as { damage: number }).damage).toBeGreaterThan(0);
  });

  it('yields (kneels) still standing; it never needs to be knocked out', () => {
    const end = play(intended);
    expect(end.phase).toBe('victory');
    expect(end.enemyHp).toBeGreaterThan(0);
    expect(end.enemyHp).toBeLessThanOrEqual(F.yieldAt!);
  });
});

describe('Crowned Sentinel, final battle: balance at 36 HP with River Ward', () => {
  it('the intended play wins with HP to spare', () => {
    const end = play(intended);
    expect(end.phase).toBe('victory');
    expect(end.playerHp).toBeGreaterThanOrEqual(10);
  });

  it('is harder than the Iron Warden (fought at the same 36 HP)', () => {
    const iron = play(intended, ENCOUNTERS.iron_warden);
    expect(iron.phase).toBe('victory');
    expect(play(intended).playerHp).toBeLessThan(iron.playerHp);
  });

  it('never needs perfect play: breaking the armour late, warding late or saving a strike still wins', () => {
    for (const [name, strategy] of [
      ['breakLate', breakLate],
      ['wardSecondBlow', wardSecondBlow],
      ['wardWhenHurt', wardWhenHurt],
      ['saveSecondStrike', saveSecondStrike],
    ] as const) {
      expect(play(strategy).phase, name).toBe('victory');
    }
  });

  it('ignoring a mechanic loses: all-out, ignoring the armour, never warding, never defending', () => {
    for (const [name, strategy] of [
      ['allOut', allOut],
      ['ignoreArmor', ignoreArmor],
      ['neverWard', neverWard],
      ['neverDefend', neverDefend],
    ] as const) {
      expect(play(strategy).phase, name).toBe('defeat');
    }
  });
});

// ── Story flow ──────────────────────────────────────────

const s = () => gameStore.getState();

/** Flags on the old Milestone 3.4 "To Be Continued" card. */
const HEARING_WON: StoryFlag[] = [
  'prologue_complete', 'chapter1_started', 'c1_letter_found', 'c1_escaped', 'chapter2_started', 'c2_learned_ward',
  'c2_read_journal', 'c2_found_charter', 'c2_warden_defeated', 'c2_iron_defeated', 'chapter3_started', 'c3_arrived',
  'c3_talked_pell', 'c3_saw_news', 'c3_daniel_called', 'c3_reached_kuching', 'c3_kuching_arrived', 'c3_met_jamilah',
  'c3_room_entered', 'c3_read_note', 'c3_reason_village', 'c3_pell_signed', 'c3_daniel_arrived', 'c3_plan_made',
  'c3_gate_arrived', 'c3_petition_registered', 'c3_sentinel_woken', 'c3_sentinel_withdrew', 'c3_gate_open',
  'c3_hall_entered', 'c3_hearing_started', 'c3_claim1_answered', 'c3_claim2_answered', 'c3_mara_spoke',
  'c3_claim3_answered', 'c3_claim4_answered', 'c3_pell_testified', 'c3_hearing_won',
];
const AFTER_RESTORED: StoryFlag[] = [
  ...HEARING_WON, 'c3_ruling_given', 'c3_sentinel_ordered', 'c3_sentinel_knelt', 'c3_charter_registered',
  'c3_harrow_dismissed', 'c3_name_restored',
];

function placeIn(scene: 'audience_hall' | 'village_epilogue', spawn: string, flags: StoryFlag[]) {
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
  for (let i = 0; i < 200 && s().dialogue; i++) s().pressAction('Enter');
}
function use(id: string) {
  const t = getLayout(s().scene)!.interactables.find((x) => x.id === id)!;
  expect(t, id).toBeDefined();
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
  for (let i = 0; i < 300 && s().battle; i++) {
    const b = s().battle!;
    if (b.stage === 'command') s().chooseCommand(strategy(b.state));
    else if (b.stage === 'defeat') return 'defeat';
    else s().advanceBattle();
  }
  return 'done';
}

describe('Milestone 3.5 flow', () => {
  beforeEach(async () => {
    await loadChapter(3);
  });

  it('a save from the old 3.4 card → the ruling → the final battle → it kneels → the Charter registered → the epilogue → Chapter 3 Complete', () => {
    placeIn('audience_hall', 'entrance', HEARING_WON);
    expect(s().mode).toBe('explore'); // no longer the chapter's end
    expect(isAtChapterEnd(s().flags)).toBe(false);
    expect(objective()).toBe('c3_ruling');
    expect(look('npc-rajah')).toBe('c3_rajah_rising');
    expect(hallSentinelAt(s().flags)).toBe(HALL_SENTINEL);

    use('petitioner-mark');
    expect(s().dialogue?.def.id).toBe('c3_ruling');
    finishDialogue();
    expect(s().flags.c3_ruling_given).toBe(true);
    expect(s().flags.c3_sentinel_ordered).toBe(true);
    expect(hallSentinelAt(s().flags)).toBe(SENTINEL_ON_FLOOR);
    expect(objective()).toBe('c3_protect');
    expect(s().battle?.encounter.id).toBe('crowned_sentinel_final');
    expect(s().battle?.state).toMatchObject({ armored: true, playerHp: 36, wardCharges: 1 });

    expect(fight(intended)).toBe('done');
    expect(s().flags.c3_sentinel_knelt).toBe(true);
    expect(s().spawn).toEqual(SCENES.audience_hall.spawns.after_battle);
    expect(s().dialogue?.def.id).toBe('c3_sentinel_kneels');
    finishDialogue();
    expect(s().flags.c3_charter_registered).toBe(true);
    expect(s().flags.c3_harrow_dismissed).toBe(true);
    expect(s().flags.c3_name_restored).toBe(true);
    expect(s().transition?.to).toBe('village_epilogue');

    arrive();
    expect(s().scene).toBe('village_epilogue');
    expect(s().spawn).toEqual(SCENES.village_epilogue.spawns.jetty);
    expect(s().dialogue?.def.id).toBe('c3_epilogue_arrival');
    finishDialogue();
    expect(s().flags.c3_epilogue_arrived).toBe(true);
    expect(objective()).toBe('c3_last_peg');

    // Everyone in the village has a line (all optional).
    for (const [id, d] of [
      ['npc-mara-epi', 'c3_mara_epi'], ['npc-ahhock-epi', 'c3_ahhock_epi'], ['npc-lim-epi', 'c3_lim_epi'],
      ['npc-siti-epi', 'c3_siti_epi'], ['npc-daniel-epi', 'c3_daniel_epi'], ['npc-pell-epi', 'c3_pell_epi'],
      ['notice-board-epi', 'c3_notice_epi'],
    ]) expect(look(id), id).toBe(d);

    use('last-peg');
    expect(s().dialogue?.def.id).toBe('c3_last_peg');
    finishDialogue();
    expect(s().flags.c3_pegs_pulled).toBe(true);
    expect(s().mode).toBe('ending');
    expect(isAtChapterEnd(s().flags)).toBe(true);
    expect(objective()).toBeUndefined();
    expect(hasChapterAfter(3)).toBe(false); // Chapter 3 closes the first story
  });

  it('a defeat can be retried at full strength, armour and all', () => {
    placeIn('audience_hall', 'entrance', HEARING_WON);
    use('petitioner-mark');
    finishDialogue();
    expect(fight(allOut)).toBe('defeat');
    expect(s().retryBattle()).toBe(true);
    expect(s().battle?.state).toMatchObject({ armored: true, wardCharges: 1, skillCharges: 2, playerHp: 36, enemyHp: F.enemyMaxHp });
  });

  it('after a reload mid-battle, the Sentinel (or the petitioner\'s place) starts the fight again', () => {
    for (const id of ['hall-sentinel', 'petitioner-mark']) {
      placeIn('audience_hall', 'after_battle', [...HEARING_WON, 'c3_ruling_given', 'c3_sentinel_ordered']);
      expect(s().mode).toBe('explore');
      use(id);
      expect(s().dialogue?.def.id, id).toBe('c3_sentinel_final_again');
      finishDialogue();
      expect(s().battle?.encounter.id).toBe('crowned_sentinel_final');
    }
  });

  it('after a reload between the kneel and the epilogue, the petitioner\'s place replays the aftermath', () => {
    placeIn('audience_hall', 'after_battle', [...HEARING_WON, 'c3_ruling_given', 'c3_sentinel_ordered', 'c3_sentinel_knelt']);
    expect(getLayout('audience_hall')!.interactables.find((t) => t.id === 'hall-sentinel')).toBeDefined();
    expect(isAvailable(getLayout('audience_hall')!.interactables.find((t) => t.id === 'hall-sentinel')!, s().flags)).toBe(false);
    use('petitioner-mark');
    expect(s().dialogue?.def.id).toBe('c3_sentinel_kneels');
    finishDialogue();
    expect(s().flags.c3_name_restored).toBe(true);
    expect(s().transition?.to).toBe('village_epilogue');
  });

  it('a save in the village before the last peg carries on; a save at the end reopens the Chapter 3 Complete card', () => {
    placeIn('village_epilogue', 'jetty', [...AFTER_RESTORED, 'c3_epilogue_arrived']);
    expect(s().mode).toBe('explore');
    expect(objective()).toBe('c3_last_peg');
    placeIn('village_epilogue', 'jetty', [...AFTER_RESTORED, 'c3_epilogue_arrived', 'c3_pegs_pulled']);
    expect(s().mode).toBe('ending');
  });

  it('an epilogue save before Elias\'s name is restored is sent back to the village', () => {
    const r = validateSave({
      schemaVersion: 1,
      scene: 'village_epilogue',
      position: SCENES.village_epilogue.spawns.jetty,
      flags: AFTER_RESTORED.filter((f) => f !== 'c3_name_restored'),
      playTimeMs: 0,
      prologueComplete: true,
    });
    expect(r.ok && r.data.scene).toBe('village');
  });

  it('the new flags are saved', () => {
    placeIn('village_epilogue', 'jetty', [...AFTER_RESTORED, 'c3_epilogue_arrived', 'c3_pegs_pulled']);
    const saved = buildSave(s(), s().spawn).flags;
    for (const f of ['c3_ruling_given', 'c3_sentinel_ordered', 'c3_sentinel_knelt', 'c3_charter_registered', 'c3_harrow_dismissed', 'c3_name_restored', 'c3_epilogue_arrived', 'c3_pegs_pulled'] as StoryFlag[]) {
      expect(saved, f).toContain(f);
    }
  });
});
