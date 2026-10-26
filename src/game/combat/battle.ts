/**
 * Deterministic turn-based battle rules. Pure functions, no React or timers:
 * every function takes a state and returns a new one, so the rules are easy
 * to test and the UI can pace the turns however it likes.
 *
 * Turn order: player acts → (victory?) → enemy acts → (defeat?) → player…
 */
import type { EncounterDef, PlayerBattleStats } from '../../data/encounters';

export type Command = 'attack' | 'skill' | 'defend';
export type BattlePhase = 'player' | 'enemy' | 'victory' | 'defeat';

export interface BattleState {
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  skillCharges: number;
  /** Set by Defend; lasts until the end of the enemy's next turn. */
  defending: boolean;
  /** The enemy is winding up a heavy blow for its next turn. */
  charging: boolean;
  phase: BattlePhase;
  /** 1-based round counter (increments after each enemy turn). */
  turn: number;
}

export type BattleEvent =
  | { kind: 'attack' | 'skill'; actor: 'player'; damage: number }
  | { kind: 'defend'; actor: 'player'; damage: 0 }
  | { kind: 'enemy_attack'; actor: 'enemy'; damage: number; defended: boolean; heavy: boolean }
  | { kind: 'enemy_charge'; actor: 'enemy'; damage: 0 };

export interface StepResult {
  state: BattleState;
  event: BattleEvent;
}

export function createBattle(player: PlayerBattleStats, enc: EncounterDef): BattleState {
  return {
    playerHp: player.maxHp,
    playerMaxHp: player.maxHp,
    enemyHp: enc.enemyMaxHp,
    enemyMaxHp: enc.enemyMaxHp,
    skillCharges: player.skillCharges,
    defending: false,
    charging: false,
    phase: 'player', // the player always opens
    turn: 1,
  };
}

export function canUse(state: BattleState, cmd: Command): boolean {
  if (state.phase !== 'player') return false;
  return cmd !== 'skill' || state.skillCharges > 0;
}

/** Player's action. Returns null if the command isn't allowed right now. */
export function playerAction(
  state: BattleState,
  player: PlayerBattleStats,
  cmd: Command,
): StepResult | null {
  if (!canUse(state, cmd)) return null;

  if (cmd === 'defend') {
    return {
      state: { ...state, defending: true, phase: 'enemy' },
      event: { kind: 'defend', actor: 'player', damage: 0 },
    };
  }

  const damage = cmd === 'skill' ? player.skillDamage : player.attack;
  const enemyHp = Math.max(0, state.enemyHp - damage);
  return {
    state: {
      ...state,
      enemyHp,
      skillCharges: cmd === 'skill' ? state.skillCharges - 1 : state.skillCharges,
      phase: enemyHp <= 0 ? 'victory' : 'enemy',
    },
    event: { kind: cmd, actor: 'player', damage },
  };
}

/**
 * Enemy's turn: a normal attack, or with a heavy-attack encounter, a charging
 * turn every Nth round followed by a heavy blow. Returns null if it isn't the enemy's turn.
 */
export function enemyAction(
  state: BattleState,
  player: PlayerBattleStats,
  enc: EncounterDef,
): StepResult | null {
  if (state.phase !== 'enemy') return null;

  if (enc.heavy && !state.charging && state.turn % enc.heavy.every === 0) {
    return {
      state: { ...state, charging: true, defending: false, phase: 'player', turn: state.turn + 1 },
      event: { kind: 'enemy_charge', actor: 'enemy', damage: 0 },
    };
  }

  const heavy = state.charging && !!enc.heavy;
  const base = heavy ? enc.heavy!.damage : enc.enemyAttack;
  const defended = state.defending;
  const guard = heavy ? enc.heavy!.guardedMultiplier : player.defendMultiplier;
  const damage = defended ? Math.round(base * guard) : base;
  const playerHp = Math.max(0, state.playerHp - damage);
  return {
    state: {
      ...state,
      playerHp,
      defending: false,
      charging: false,
      phase: playerHp <= 0 ? 'defeat' : 'player',
      turn: state.turn + 1,
    },
    event: { kind: 'enemy_attack', actor: 'enemy', damage, defended, heavy },
  };
}

/** Battle-log text for an event. */
export function describeEvent(event: BattleEvent, player: PlayerBattleStats, enc: EncounterDef): string {
  switch (event.kind) {
    case 'attack':
      return `Adrian strikes! The ${enc.enemyName} takes ${event.damage} damage.`;
    case 'skill':
      return `${player.skillName}! Light bursts from the blade for ${event.damage} damage.`;
    case 'defend':
      return 'Adrian raises his guard and braces for the next blow.';
    case 'enemy_charge':
      return enc.heavy?.chargeText ?? `The ${enc.enemyName} gathers its strength.`;
    case 'enemy_attack': {
      const verb = event.heavy && enc.heavy ? enc.heavy.attackText : enc.enemyAttackText;
      if (event.defended && event.damage === 0) {
        return `The ${enc.enemyName} ${verb}, but Adrian's guard turns the blow aside!`;
      }
      return event.defended
        ? `The ${enc.enemyName} ${verb}! Adrian's guard holds: only ${event.damage} damage.`
        : `The ${enc.enemyName} ${verb}! Adrian takes ${event.damage} damage.`;
    }
  }
}

export const COMMAND_INFO: Record<Command, { label: string; help: (p: PlayerBattleStats) => string }> = {
  attack: { label: 'Attack', help: (p) => `Strike with the radiant blade for ${p.attack} damage.` },
  skill: {
    label: 'Radiant Strike',
    help: (p) => `A blazing sword strike for ${p.skillDamage} damage. Limited uses per battle.`,
  },
  defend: {
    label: 'Defend',
    help: (p) => `Brace yourself. The next hit deals ${Math.round((1 - p.defendMultiplier) * 100)}% less damage.`,
  },
};
