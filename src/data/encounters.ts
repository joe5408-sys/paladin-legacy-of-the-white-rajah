/**
 * Battle encounters and player battle stats. Starting balance from the
 * master prompt; tweak numbers here, not in code.
 */
import type { StoryFlag } from '../game/core/flags';

export interface PlayerBattleStats {
  maxHp: number;
  attack: number;
  skillName: string;
  skillDamage: number;
  skillCharges: number;
  /** Multiplier applied to the next enemy hit after Defend (0.5 = half). */
  defendMultiplier: number;
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
  /** Flags set on victory. */
  victoryFlags: StoryFlag[];
  /** Conversation played after returning from a victory. */
  victoryDialogue?: string;
  /** Where the player stands when the battle ends. */
  returnTo: { scene: 'chamber'; spawn: string };
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
    victoryFlags: ['guardian_defeated'],
    victoryDialogue: 'guardian_defeated',
    returnTo: { scene: 'chamber', spawn: 'after_battle' },
  },
};
