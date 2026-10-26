/**
 * Battle encounters and player battle stats. Starting balance from the
 * master prompt; tweak numbers here, not in code.
 */
import type { StoryFlag } from '../game/core/flags';
import type { SceneId } from './scenes';

export interface PlayerBattleStats {
  maxHp: number;
  attack: number;
  skillName: string;
  skillDamage: number;
  skillCharges: number;
  /** Multiplier applied to the next enemy hit after Defend (0.5 = half). */
  defendMultiplier: number;
}

/** A telegraphed heavy blow: the enemy spends a turn charging, then strikes hard. */
export interface HeavyAttackDef {
  /** The enemy charges on every Nth round (3 = rounds 3, 6, 9...) and strikes on the next. */
  every: number;
  damage: number;
  /** Damage multiplier when Adrian defends against it (0 = blocked completely). */
  guardedMultiplier: number;
  /** Message for the charging turn. */
  chargeText: string;
  /** Verb phrase for the heavy blow. */
  attackText: string;
}

export interface EncounterDef {
  id: string;
  enemyName: string;
  enemyMaxHp: number;
  enemyAttack: number;
  /** Verb phrase for the enemy's attack, e.g. "slams its stone fist". */
  enemyAttackText: string;
  /** First message shown when the battle opens. */
  intro: string;
  /** Show the command tutorial tip on the first turn. */
  tutorial: boolean;
  /** Short hint shown on the first turn instead of the tutorial. */
  tip?: string;
  /** Optional telegraphed heavy blow. */
  heavy?: HeavyAttackDef;
  /** Message when the enemy's HP reaches zero. */
  victoryText?: string;
  /** Which enemy sprite and battle backdrop to show. */
  sprite: 'guardian' | 'sentinel';
  arena: 'chamber' | 'vault';
  /** Flags set on victory. */
  victoryFlags: StoryFlag[];
  /** Conversation played after returning from a victory. */
  victoryDialogue?: string;
  /** Where the player stands when the battle ends. */
  returnTo: { scene: SceneId; spawn: string };
}

export const PLAYER_BATTLE_STATS: PlayerBattleStats = {
  maxHp: 30,
  attack: 6,
  skillName: 'Radiant Strike',
  skillDamage: 10,
  skillCharges: 2,
  defendMultiplier: 0.5,
};

export const ENCOUNTERS: Record<string, EncounterDef> = {
  covenant_guardian: {
    id: 'covenant_guardian',
    enemyName: 'Covenant Guardian',
    enemyMaxHp: 24,
    enemyAttack: 4,
    enemyAttackText: 'slams its stone fist',
    intro: 'The medallion blazes, and light gathers in Adrian\'s hand into the shape of a blade!',
    tutorial: true,
    sprite: 'guardian',
    arena: 'chamber',
    victoryFlags: ['guardian_defeated'],
    victoryDialogue: 'guardian_defeated',
    returnTo: { scene: 'chamber', spawn: 'after_battle' },
  },
  // Chapter 1, Milestone 1.3. Tougher than the Guardian: going all-out and
  // ignoring the wind-up loses (37 damage vs 30 HP). Defending when it charges
  // blocks the heavy blow and wins with about 9 HP left. See sentinel.test.ts.
  hollow_sentinel: {
    id: 'hollow_sentinel',
    enemyName: 'Hollow Sentinel',
    enemyMaxHp: 42,
    enemyAttack: 7,
    enemyAttackText: 'slashes with its brass arm',
    intro: "The Hollow Sentinel unfolds its long brass arms. Light gathers in Adrian's hand once more!",
    tutorial: false,
    tip: 'This construct hits hard and winds up heavy blows. When it starts charging, Defend: Adrian\'s guard will block the blow completely.',
    heavy: {
      every: 3,
      damage: 16,
      guardedMultiplier: 0,
      chargeText: 'The Hollow Sentinel draws back its arm. The flame in its chest flares white. A heavy blow is coming!',
      attackText: 'brings its arm crashing down',
    },
    victoryText: 'The Hollow Sentinel staggers. The flame in its chest gutters out!',
    sprite: 'sentinel',
    arena: 'vault',
    victoryFlags: ['c1_sentinel_defeated'],
    victoryDialogue: 'c1_sentinel_defeated',
    returnTo: { scene: 'vault', spawn: 'after_battle' },
  },
};
