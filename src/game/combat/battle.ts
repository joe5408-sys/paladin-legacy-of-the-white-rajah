/**
 * Deterministic turn-based battle rules. Pure functions, no React or timers:
 * every function takes a state and returns a new one, so the rules are easy
 * to test and the UI can pace the turns however it likes.
 *
 * Turn order: player acts → (victory?) → enemy acts → (defeat?) → player…
 *
 * Boss phases (Chapter 2): an armoured enemy shrugs off ordinary attacks until
 * Radiant Strike breaks its armour; only then does it start winding up heavy blows.
 */
import type { EncounterDef, PlayerBattleStats } from '../../data/encounters';

export type Command = 'attack' | 'skill' | 'defend' | 'ward';
export type BattlePhase = 'player' | 'enemy' | 'victory' | 'defeat';

export interface BattleState {
  playerHp: number;
  playerMaxHp: number;
  enemyHp: number;
  enemyMaxHp: number;
  skillCharges: number;
  /** River Ward uses left (0 if Adrian hasn't learned it). */
  wardCharges: number;
  /** Set by River Ward; blocks the next enemy hit completely, then wears off. */
  warded: boolean;
  /** Set by Defend; lasts until the end of the enemy's next turn. */
  defending: boolean;
  /** The enemy's armour is still on (phase 1 of a boss): Attack barely scratches it. */
  armored: boolean;
  /** The enemy is winding up a heavy blow for its next turn. */
  charging: boolean;
  phase: BattlePhase;
  /** 1-based round counter (increments after each enemy turn). */
  turn: number;
}

export type BattleEvent =
  | {
      kind: 'attack' | 'skill';
      actor: 'player';
      damage: number;
      /** Set only against armour: the blow glanced off the plates. */
      armored?: true;
      /** Set only when this Radiant Strike broke the enemy's armour. */
      brokeArmor?: true;
    }
  | { kind: 'defend'; actor: 'player'; damage: 0 }
  | { kind: 'ward'; actor: 'player'; damage: 0; heal: number }
  | { kind: 'enemy_attack'; actor: 'enemy'; damage: number; defended: boolean; heavy: boolean; warded: boolean }
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
    wardCharges: player.ward?.charges ?? 0,
    warded: false,
    armored: !!enc.armor,
    defending: false,
    charging: false,
    phase: 'player', // the player always opens
    turn: 1,
  };
}

export function canUse(state: BattleState, cmd: Command): boolean {
  if (state.phase !== 'player') return false;
  if (cmd === 'skill') return state.skillCharges > 0;
  if (cmd === 'ward') return state.wardCharges > 0;
  return true;
}

/**
 * Player's action. Returns null if the command isn't allowed right now.
 * Pass the encounter for armoured enemies (without it, armour has no effect).
 */
export function playerAction(
  state: BattleState,
  player: PlayerBattleStats,
  cmd: Command,
  enc?: EncounterDef,
): StepResult | null {
  if (!canUse(state, cmd)) return null;

  if (cmd === 'defend') {
    return {
      state: { ...state, defending: true, phase: 'enemy' },
      event: { kind: 'defend', actor: 'player', damage: 0 },
    };
  }

  if (cmd === 'ward') {
    const heal = Math.min(player.ward?.heal ?? 0, state.playerMaxHp - state.playerHp);
    return {
      state: { ...state, playerHp: state.playerHp + heal, wardCharges: state.wardCharges - 1, warded: true, phase: 'enemy' },
      event: { kind: 'ward', actor: 'player', damage: 0, heal },
    };
  }

  const armor = state.armored ? enc?.armor : undefined;
  // Radiant Strike cracks armour and lands in full; an ordinary blow glances off.
  const glances = !!armor && cmd === 'attack';
  const breaks = !!armor && cmd === 'skill';
  const damage = cmd === 'skill' ? player.skillDamage : glances ? armor!.attackDamage : player.attack;
  const enemyHp = Math.max(0, state.enemyHp - damage);
  return {
    state: {
      ...state,
      enemyHp,
      armored: breaks ? false : state.armored,
      skillCharges: cmd === 'skill' ? state.skillCharges - 1 : state.skillCharges,
      phase: enemyHp <= 0 ? 'victory' : 'enemy',
    },
    event: {
      kind: cmd,
      actor: 'player',
      damage,
      ...(glances ? { armored: true as const } : {}),
      ...(breaks ? { brokeArmor: true as const } : {}),
    },
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

  // An armoured boss only fights normally; heavy blows start once its armour is broken.
  if (enc.heavy && !state.charging && !state.armored && state.turn % enc.heavy.every === 0) {
    return {
      state: { ...state, charging: true, defending: false, phase: 'player', turn: state.turn + 1 },
      event: { kind: 'enemy_charge', actor: 'enemy', damage: 0 },
    };
  }

  const heavy = state.charging && !!enc.heavy;
  const base = heavy ? enc.heavy!.damage : enc.enemyAttack;
  const defended = state.defending;
  const warded = state.warded;
  const guard = heavy ? enc.heavy!.guardedMultiplier : player.defendMultiplier;
  // River Ward blocks any hit, even a heavy blow; Defend only softens it.
  const damage = warded ? 0 : defended ? Math.round(base * guard) : base;
  const playerHp = Math.max(0, state.playerHp - damage);
  return {
    state: {
      ...state,
      playerHp,
      defending: false,
      warded: false,
      charging: false,
      phase: playerHp <= 0 ? 'defeat' : 'player',
      turn: state.turn + 1,
    },
    event: { kind: 'enemy_attack', actor: 'enemy', damage, defended, heavy, warded },
  };
}

/** Battle-log text for an event. */
export function describeEvent(event: BattleEvent, player: PlayerBattleStats, enc: EncounterDef): string {
  switch (event.kind) {
    case 'attack':
      if (event.armored) {
        return enc.armor?.glanceText ?? `Adrian's blade skids off the ${enc.enemyName}'s armour: only ${event.damage} damage.`;
      }
      return `Adrian strikes! The ${enc.enemyName} takes ${event.damage} damage.`;
    case 'skill':
      if (event.brokeArmor) {
        return `${player.skillName}! ${enc.armor?.breakText ?? 'The armour cracks apart!'} (${event.damage} damage)`;
      }
      return `${player.skillName}! Light bursts from the blade for ${event.damage} damage.`;
    case 'defend':
      return 'Adrian raises his guard and braces for the next blow.';
    case 'ward': {
      const name = player.ward?.name ?? 'River Ward';
      return event.heal > 0
        ? `${name}! Cool river-light wraps around Adrian. He recovers ${event.heal} HP.`
        : `${name}! Cool river-light wraps around Adrian.`;
    }
    case 'enemy_charge':
      return enc.heavy?.chargeText ?? `The ${enc.enemyName} gathers its strength.`;
    case 'enemy_attack': {
      const verb = event.heavy && enc.heavy ? enc.heavy.attackText : enc.enemyAttackText;
      if (event.warded) return `The ${enc.enemyName} ${verb}, but the river-light swallows the blow!`;
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
  ward: {
    label: 'River Ward',
    help: (p) => `Recover ${p.ward?.heal ?? 0} HP and block the next hit completely, even a heavy blow. Once per battle.`,
  },
};
