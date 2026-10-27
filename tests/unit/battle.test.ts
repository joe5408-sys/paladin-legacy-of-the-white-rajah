/**
 * Phase 4: turn-based battle. Covers every "Combat" acceptance test in
 * MASTER_PROMPT §19, first on the pure rules, then through the store.
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
import { ENCOUNTERS, PLAYER_BATTLE_STATS as P } from '../../src/data/encounters';
import { gameStore } from '../../src/game/core/gameStore';
import { CHAMBER_LAYOUT } from '../../src/data/ancientChamber';
import { currentObjective } from '../../src/game/quests/quests';
import { PROLOGUE_OBJECTIVES } from '../../src/data/quests';
import { SCENES } from '../../src/data/scenes';

const G = ENCOUNTERS.covenant_guardian;
const fresh = () => createBattle(P, G);

/** Player acts, then (if the battle continues) the enemy responds. */
function round(state: BattleState, cmd: Command): BattleState {
  const p = playerAction(state, P, cmd);
  if (!p) throw new Error(`${cmd} not allowed`);
  if (p.state.phase !== 'enemy') return p.state;
  return enemyAction(p.state, P, G)!.state;
}

describe('battle rules', () => {
  it('starts with the configured HP and skill charges, player first', () => {
    const s = fresh();
    expect(s).toMatchObject({ playerHp: 30, enemyHp: 24, skillCharges: 2, phase: 'player', turn: 1 });
  });

  it('Attack reduces enemy HP by the attack value', () => {
    const r = playerAction(fresh(), P, 'attack')!;
    expect(r.state.enemyHp).toBe(24 - 6);
    expect(r.event).toEqual({ kind: 'attack', actor: 'player', damage: 6 });
  });

  it('Radiant Strike deals its damage and uses a charge', () => {
    const r = playerAction(fresh(), P, 'skill')!;
    expect(r.state.enemyHp).toBe(24 - 10);
    expect(r.state.skillCharges).toBe(1);
  });

  it('Radiant Strike is unavailable with no charges left', () => {
    let s = fresh();
    s = round(s, 'skill');
    s = round(s, 'skill');
    expect(s.skillCharges).toBe(0);
    expect(canUse(s, 'skill')).toBe(false);
    expect(playerAction(s, P, 'skill')).toBeNull();
    expect(canUse(s, 'attack')).toBe(true);
  });

  it('the enemy attacks on its turn for its attack value', () => {
    const afterPlayer = playerAction(fresh(), P, 'attack')!.state;
    expect(afterPlayer.phase).toBe('enemy');
    const r = enemyAction(afterPlayer, P, G)!;
    expect(r.state.playerHp).toBe(30 - 4);
    expect(r.state.phase).toBe('player');
    expect(r.state.turn).toBe(2);
  });

  it('Defend halves the next incoming hit, then wears off', () => {
    let s = round(fresh(), 'defend');
    expect(s.playerHp).toBe(30 - 2);
    expect(s.defending).toBe(false);
    s = round(s, 'attack');
    expect(s.playerHp).toBe(28 - 4);
  });

  it('turns alternate: the player cannot act on the enemy turn and vice versa', () => {
    const s = fresh();
    expect(enemyAction(s, P, G)).toBeNull();
    const afterPlayer = playerAction(s, P, 'attack')!.state;
    expect(playerAction(afterPlayer, P, 'attack')).toBeNull();
  });

  it('victory triggers only when enemy HP reaches zero, and stops the enemy', () => {
    let s = fresh();
    s = round(s, 'skill'); // 14
    expect(s.phase).toBe('player');
    s = round(s, 'skill'); // 4
    expect(s.phase).toBe('player');
    const final = playerAction(s, P, 'attack')!; // 4 - 6 → 0
    expect(final.state.enemyHp).toBe(0);
    expect(final.state.phase).toBe('victory');
    expect(enemyAction(final.state, P, G)).toBeNull();
    expect(playerAction(final.state, P, 'attack')).toBeNull();
  });

  it('defeat triggers only when player HP reaches zero', () => {
    // Defend forever: 2 damage per round, never attacking back.
    let s = fresh();
    let rounds = 0;
    while (s.phase === 'player') {
      s = round(s, 'defend');
      rounds++;
      if (s.phase === 'player') expect(s.playerHp).toBeGreaterThan(0);
    }
    expect(s.phase).toBe('defeat');
    expect(s.playerHp).toBe(0);
    expect(rounds).toBe(15);
    expect(playerAction(s, P, 'attack')).toBeNull();
  });

  it('HP never goes below zero', () => {
    const low = { ...fresh(), enemyHp: 3 };
    expect(playerAction(low, P, 'skill')!.state.enemyHp).toBe(0);
  });

  it('describes events for the battle log', () => {
    expect(describeEvent({ kind: 'attack', actor: 'player', damage: 6 }, P, G)).toContain('6 damage');
    expect(describeEvent({ kind: 'enemy_attack', actor: 'enemy', damage: 2, defended: true, heavy: false, warded: false }, P, G)).toContain(
      'guard holds',
    );
  });
});

describe('battle flow in the game', () => {
  const s = () => gameStore.getState();
  const sign = CHAMBER_LAYOUT.interactables.find((t) => t.id === 'chamber-sign')!;

  function finishDialogue() {
    for (let i = 0; i < 100 && s().dialogue; i++) s().pressAction('Enter');
  }
  /** Picks a command and lets both action stages play out. */
  function play(cmd: Command) {
    expect(s().battle?.stage).toBe('command');
    expect(s().chooseCommand(cmd)).toBe(true);
    s().advanceBattle(); // player_action → enemy_action (or victory)
    if (s().battle?.stage === 'enemy_action') s().advanceBattle(); // → command (or defeat)
  }

  beforeEach(() => {
    s().reset();
    // Arrive in the chamber with the story up to that point done.
    s().setFlags(['arrived', 'entered_home', 'met_mara', 'heirloom_awakened', 'passage_open', 'entered_chamber']);
    s().requestScene('chamber', 'stairs');
    s().swapScene();
    s().finishTransition();
  });

  function startFromSign() {
    s().setNearby(sign);
    s().pressAction('KeyE');
    expect(s().dialogue?.def.id).toBe('guardian_awaken');
    finishDialogue();
  }

  it('battle starts from the correct story event (the Guardian awakening)', () => {
    expect(s().battle).toBeNull();
    startFromSign();
    expect(s().mode).toBe('battle');
    expect(s().battle?.encounter.id).toBe('covenant_guardian');
    expect(s().battle?.stage).toBe('intro');
    // Commands are refused until the intro finishes
    expect(s().chooseCommand('attack')).toBe(false);
    s().advanceBattle();
    expect(s().battle?.stage).toBe('command');
  });

  it('exploration keys do nothing during battle', () => {
    startFromSign();
    expect(s().pressAction('KeyE')).toBe(false);
    expect(s().requestScene('home', 'door')).toBe(false);
  });

  it('victory sets the story flag, returns to the chamber and continues the story', () => {
    startFromSign();
    s().advanceBattle();
    play('skill');
    play('skill');
    play('attack');
    expect(s().battle?.stage).toBe('victory');
    expect(s().mode).toBe('battle');
    s().advanceBattle(); // continue
    expect(s().battle).toBeNull();
    expect(s().scene).toBe('chamber');
    expect(s().spawn).toEqual(SCENES.chamber.spawns.after_battle);
    expect(s().flags.guardian_defeated).toBe(true);
    expect(s().dialogue?.def.id).toBe('guardian_defeated');
    finishDialogue();
    expect(currentObjective(PROLOGUE_OBJECTIVES, s().flags)?.id).toBe('read_message');
  });

  it('the Guardian does not return after it is defeated', () => {
    startFromSign();
    s().advanceBattle();
    play('skill');
    play('skill');
    play('attack');
    s().advanceBattle();
    finishDialogue();
    s().setNearby(sign);
    s().pressAction('KeyE');
    expect(s().dialogue?.def.id).toBe('chamber_sign_after');
    finishDialogue();
    expect(s().mode).toBe('explore');
  });

  it('defeat offers a retry that fully resets HP and skill charges', () => {
    startFromSign();
    s().advanceBattle();
    play('skill'); // use a charge so the reset is visible
    while (s().battle?.stage === 'command') play('defend');
    expect(s().battle?.stage).toBe('defeat');
    expect(s().battle?.state.playerHp).toBe(0);
    expect(s().flags.guardian_defeated).toBeUndefined();

    expect(s().retryBattle()).toBe(true);
    expect(s().battle?.stage).toBe('command');
    expect(s().battle?.state).toMatchObject({
      playerHp: 30,
      enemyHp: 24,
      skillCharges: 2,
      defending: false,
      phase: 'player',
      turn: 1,
    });

    // …and the retried battle can still be won, so defeat never blocks the prologue.
    play('skill');
    play('skill');
    play('attack');
    expect(s().battle?.stage).toBe('victory');
  });

  it('retry is only possible after a defeat', () => {
    startFromSign();
    expect(s().retryBattle()).toBe(false);
  });
});
