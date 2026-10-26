/**
 * Chapter 1, Milestone 1.3: the Hollow Sentinel's battle rules. Its telegraphed
 * heavy blow, how Defend answers it, and the intended difficulty.
 */
import { describe, expect, it } from 'vitest';
import {
  createBattle,
  describeEvent,
  enemyAction,
  playerAction,
  type BattleEvent,
  type BattleState,
  type Command,
} from '../../src/game/combat/battle';
import { ENCOUNTERS, PLAYER_BATTLE_STATS as P } from '../../src/data/encounters';

const S = ENCOUNTERS.hollow_sentinel;
const G = ENCOUNTERS.covenant_guardian;

/** Player acts, then (if the battle continues) the enemy responds. */
function round(state: BattleState, cmd: Command): { state: BattleState; enemy: BattleEvent | null } {
  const p = playerAction(state, P, cmd);
  if (!p) throw new Error(`${cmd} not allowed`);
  if (p.state.phase !== 'enemy') return { state: p.state, enemy: null };
  const e = enemyAction(p.state, P, S)!;
  return { state: e.state, enemy: e.event };
}

/** Plays a whole battle with a strategy; returns the final state. */
function play(strategy: (s: BattleState) => Command): BattleState {
  let s = createBattle(P, S);
  for (let i = 0; i < 50 && (s.phase === 'player' || s.phase === 'enemy'); i++) s = round(s, strategy(s)).state;
  return s;
}

const allOut = (s: BattleState): Command => (s.skillCharges > 0 ? 'skill' : 'attack');
const defendHeavy = (s: BattleState): Command => (s.charging ? 'defend' : allOut(s));

describe('Hollow Sentinel', () => {
  it('is tougher than the Covenant Guardian', () => {
    expect(S.enemyMaxHp).toBeGreaterThan(G.enemyMaxHp);
    expect(S.enemyAttack).toBeGreaterThan(G.enemyAttack);
    expect(S.heavy).toBeDefined();
    expect(S.returnTo).toEqual({ scene: 'vault', spawn: 'after_battle' });
  });

  it('charges on round 3 (no damage), then lands a heavy blow on round 4', () => {
    let s = createBattle(P, S);
    const events: BattleEvent[] = [];
    for (let i = 0; i < 4; i++) {
      const r = round(s, 'attack');
      s = r.state;
      events.push(r.enemy!);
    }
    expect(events.map((e) => e.kind)).toEqual(['enemy_attack', 'enemy_attack', 'enemy_charge', 'enemy_attack']);
    expect(events[2].damage).toBe(0);
    expect(events[3]).toMatchObject({ heavy: true, damage: S.heavy!.damage, defended: false });
    expect(s.charging).toBe(false);
    expect(s.playerHp).toBe(P.maxHp - 2 * S.enemyAttack - S.heavy!.damage);
  });

  it('shows it is charging between the wind-up and the blow', () => {
    let s = createBattle(P, S);
    for (let i = 0; i < 3; i++) s = round(s, 'attack').state;
    expect(s.charging).toBe(true);
    expect(s.phase).toBe('player');
  });

  it('Defend blocks the heavy blow completely', () => {
    let s = createBattle(P, S);
    for (let i = 0; i < 3; i++) s = round(s, 'attack').state;
    const before = s.playerHp;
    const r = round(s, 'defend');
    expect(r.enemy).toMatchObject({ kind: 'enemy_attack', heavy: true, defended: true, damage: 0 });
    expect(r.state.playerHp).toBe(before);
    expect(describeEvent(r.enemy!, P, S)).toMatch(/turns the blow aside/);
  });

  it("Defend against the Sentinel's normal slash still only halves it", () => {
    const r = round(createBattle(P, S), 'defend');
    expect(r.enemy).toMatchObject({ heavy: false, defended: true, damage: Math.round(S.enemyAttack * P.defendMultiplier) });
  });

  it('a Defend spent on the charging turn is wasted', () => {
    let s = createBattle(P, S);
    for (let i = 0; i < 2; i++) s = round(s, 'attack').state;
    s = round(s, 'defend').state; // the Sentinel only charges this round
    expect(s.defending).toBe(false);
    const r = round(s, 'attack');
    expect(r.enemy).toMatchObject({ heavy: true, defended: false, damage: S.heavy!.damage });
  });

  it('going all-out without ever defending loses', () => {
    expect(play(allOut).phase).toBe('defeat');
  });

  it('following the tip (Defend whenever it charges) wins, with some HP to spare', () => {
    const end = play(defendHeavy);
    expect(end.phase).toBe('victory');
    expect(end.playerHp).toBeGreaterThanOrEqual(5);
    expect(end.playerHp).toBeLessThan(P.maxHp / 2); // still a real fight
  });

  it('even plain Attacks win if every heavy blow is defended', () => {
    const end = play((s) => (s.charging ? 'defend' : 'attack'));
    expect(end.phase).toBe('victory');
  });

  it('the Covenant Guardian never charges (prologue balance unchanged)', () => {
    let s = createBattle(P, G);
    for (let i = 0; i < 3; i++) {
      const p = playerAction(s, P, 'defend')!;
      const e = enemyAction(p.state, P, G)!;
      expect(e.event.kind).toBe('enemy_attack');
      s = e.state;
    }
  });

  it('describes the wind-up and the heavy blow', () => {
    expect(describeEvent({ kind: 'enemy_charge', actor: 'enemy', damage: 0 }, P, S)).toMatch(/heavy blow is coming/);
    expect(describeEvent({ kind: 'enemy_attack', actor: 'enemy', damage: 14, defended: false, heavy: true }, P, S)).toMatch(
      /crashing down.*14 damage/,
    );
  });
});
