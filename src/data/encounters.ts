/**
 * Battle encounters and player battle stats. Starting balance from the
 * master prompt; tweak numbers here, not in code.
 */
import type { StoryFlag, StoryFlags } from '../game/core/flags';
import type { SceneId } from './scenes';

export interface PlayerBattleStats {
  maxHp: number;
  attack: number;
  skillName: string;
  skillDamage: number;
  skillCharges: number;
  /** Multiplier applied to the next enemy hit after Defend (0.5 = half). */
  defendMultiplier: number;
  /** River Ward (learned in Chapter 2): heals and blocks the next hit. */
  ward?: WardDef;
}

export interface WardDef {
  name: string;
  heal: number;
  charges: number;
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

/** Boss armour (phase 1): ordinary attacks barely scratch it; Radiant Strike breaks it. */
export interface ArmorDef {
  /** Damage an ordinary Attack does while the armour holds. */
  attackDamage: number;
  /** Battle-log text when an Attack glances off. */
  glanceText: string;
  /** Battle-log text when Radiant Strike breaks the armour. */
  breakText: string;
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
  /** Optional telegraphed heavy blow (for an armoured enemy, only once the armour is broken). */
  heavy?: HeavyAttackDef;
  /** Optional armour: a two-phase boss. */
  armor?: ArmorDef;
  /**
   * The enemy stops fighting at this HP or below: the battle ends in victory with
   * it still standing (it withdraws or yields). Its victoryText describes that.
   */
  yieldAt?: number;
  /** On yielding it kneels where it stands (the battle sprite stays, kneeling), rather than withdrawing. */
  kneels?: boolean;
  /** Message when the enemy's HP reaches zero. */
  victoryText?: string;
  /** Which enemy sprite and battle backdrop to show. */
  sprite: 'guardian' | 'sentinel' | 'spirit' | 'warden' | 'iron' | 'crowned';
  arena: 'chamber' | 'vault' | 'waystation' | 'jetty' | 'palace';
  /** Adrian may use River Ward here before he has learned it: this battle is the lesson. */
  teachesWard?: boolean;
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

/** Chapter 2, Milestone 2.3: the second Paladin art. Tuned in waystation.test.ts. */
export const RIVER_WARD: WardDef = { name: 'River Ward', heal: 10, charges: 1 };

/** Chapter 3: Adrian has grown (the "growth moment" Chapter 2 deferred). Earlier battles keep 30. */
export const CHAPTER3_MAX_HP = 36;

/** Adrian's stats for an encounter: with River Ward once learned (or while it is being taught), and more HP from Chapter 3. */
export function playerStatsFor(flags: StoryFlags, enc: EncounterDef): PlayerBattleStats {
  const base = flags.chapter3_started ? { ...PLAYER_BATTLE_STATS, maxHp: CHAPTER3_MAX_HP } : PLAYER_BATTLE_STATS;
  return flags.c2_learned_ward || enc.teachesWard ? { ...base, ward: RIVER_WARD } : base;
}

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
  // Chapter 2, Milestone 2.3. A friendly test that teaches River Ward: its
  // heavy blow comes early and often, and Defend only halves it. Warding one
  // and attacking wins with about 16 HP left; ignoring River Ward loses
  // (all-out or defending every wave). See waystation.test.ts.
  training_spirit: {
    id: 'training_spirit',
    enemyName: 'Spirit of the Waystation',
    enemyMaxHp: 42,
    enemyAttack: 5,
    enemyAttackText: 'sweeps a fist of river-water',
    intro: 'The spirit lifts its hands, and the river answers. Light gathers in Adrian\'s hand once more!',
    tutorial: false,
    tip: 'New art: River Ward. Use it when the spirit gathers the river: it heals you and blocks the heavy blow completely. Defend only halves it. Once per battle.',
    heavy: {
      every: 2,
      damage: 14,
      guardedMultiplier: 0.5,
      chargeText: 'The spirit draws the river up into a towering wave. A heavy blow is coming!',
      attackText: 'brings the wave crashing down',
    },
    victoryText: 'The spirit lowers its hands. The wave sinks back into the river.',
    sprite: 'spirit',
    arena: 'waystation',
    teachesWard: true,
    victoryFlags: ['c2_spirit_defeated'],
    victoryDialogue: 'c2_spirit_defeated',
    returnTo: { scene: 'waystation_landing', spawn: 'after_battle' },
  },
  // Chapter 2, Milestone 2.4. The Sentinel's rules, retuned for the jungle:
  // more HP and a harder heavy blow. Going all-out loses; defending every
  // heavy blow only just scrapes through (about 2 HP); defending heavy blows
  // and using River Ward when hurt wins with about 12 HP. See warden.test.ts.
  hollow_warden: {
    id: 'hollow_warden',
    enemyName: 'Hollow Warden',
    enemyMaxHp: 48,
    enemyAttack: 7,
    enemyAttackText: 'swings its moss-green arm',
    intro: "The Hollow Warden levels its long arms at the waystation door. Light gathers in Adrian's hand!",
    tutorial: false,
    tip: 'Like the Sentinel, it winds up heavy blows: Defend blocks them. Save River Ward for when you are hurt.',
    heavy: {
      every: 3,
      damage: 18,
      guardedMultiplier: 0,
      chargeText: 'The Hollow Warden plants its feet in the moss. The flame in its chest roars orange. A heavy blow is coming!',
      attackText: 'brings both arms crashing down',
    },
    victoryText: 'The Hollow Warden staggers back to the edge of the landing. Its flame gutters!',
    sprite: 'warden',
    arena: 'waystation',
    victoryFlags: ['c2_warden_defeated'],
    victoryDialogue: 'c2_warden_defeated',
    returnTo: { scene: 'waystation_landing', spawn: 'after_battle' },
  },
  // Chapter 2, Milestone 2.5: the chapter boss, in two phases. Armoured, Attack
  // does 1 damage and it never winds up; Radiant Strike breaks the armour. Then
  // it swings heavy blows that Defend only halves, so River Ward matters.
  // Breaking the armour at once, warding the first heavy blow and defending the
  // rest wins with about 13 HP. Going all-out, ignoring the armour or never
  // warding loses; warding late or breaking the armour late only just scrapes
  // through. See ironWarden.test.ts.
  iron_warden: {
    id: 'iron_warden',
    enemyName: 'Iron Warden',
    enemyMaxHp: 50,
    enemyAttack: 4,
    enemyAttackText: 'swings an iron fist',
    intro: "The Iron Warden steps off the barge, and the boardwalk groans under it. Light gathers in Adrian's hand!",
    tutorial: false,
    tip: 'Iron plates cover it: ordinary attacks will barely scratch them. Radiant Strike can crack armour. Then watch for its heavy blows.',
    armor: {
      attackDamage: 1,
      glanceText: "Adrian's blade rings off the iron plates. Only 1 damage. Ordinary blows won't get through.",
      breakText: 'The blade bites deep, and the iron plates split and crash into the river! The furnace inside blazes.',
    },
    heavy: {
      every: 3,
      damage: 18,
      guardedMultiplier: 0.5,
      chargeText: 'The Iron Warden opens its furnace. Fire roars up its arms. A heavy blow is coming!',
      attackText: 'brings a blazing fist down',
    },
    victoryText: 'The Iron Warden reels back to the edge of the boardwalk. Its furnace gutters!',
    sprite: 'iron',
    arena: 'jetty',
    victoryFlags: ['c2_iron_defeated'],
    victoryDialogue: 'c2_iron_defeated',
    returnTo: { scene: 'jetty_dusk', spawn: 'after_battle' },
  },
  // Chapter 3, Milestone 3.3: the first fight with the Crowned Sentinel, at the
  // Palace gate. About Hollow Warden difficulty for a 36-HP Adrian: heavy blows
  // that Defend blocks, River Ward for when hurt. It never falls: at 16 HP it
  // withdraws (yieldAt), which counts as a win. Going all-out loses; defending
  // the heavy blows wins with about 15 HP. See palaceGate.test.ts.
  crowned_sentinel_gate: {
    id: 'crowned_sentinel_gate',
    enemyName: 'Crowned Sentinel',
    enemyMaxHp: 56,
    enemyAttack: 7,
    enemyAttackText: 'sweeps its halberd',
    intro: "The Crowned Sentinel lowers its halberd across the gateway. Light gathers in Adrian's hand!",
    tutorial: false,
    tip: 'The palace\'s oldest guard. Defend when it raises its halberd: Adrian\'s guard blocks the heavy blow. It may not fight to the end.',
    heavy: {
      every: 3,
      damage: 20,
      guardedMultiplier: 0,
      chargeText: 'The Crowned Sentinel raises its halberd high. The gold on its crown flares. A heavy blow is coming!',
      attackText: 'brings its halberd down',
    },
    yieldAt: 16,
    victoryText: 'The Crowned Sentinel stops in mid-swing. It looks at the medallion for a long moment, then steps back.',
    sprite: 'crowned',
    arena: 'palace',
    victoryFlags: ['c3_sentinel_withdrew'],
    victoryDialogue: 'c3_sentinel_withdraws',
    returnTo: { scene: 'palace_gate', spawn: 'after_battle' },
  },
  // Chapter 3, Milestone 3.5: the final battle, in the audience hall. Three phases
  // from existing pieces: armour (as the Iron Warden: Attack does 1, Radiant
  // Strike breaks it), then heavy blows that Defend only softens (to a quarter)
  // and only River Ward blocks completely, then it yields at 20 HP and kneels.
  // Harder than the Iron Warden for a 36-HP Adrian. Breaking the armour at once,
  // warding the first heavy blow and defending the rest wins with about 12 HP;
  // breaking it late or warding late still wins. Going all-out, ignoring the
  // armour, never warding or never defending loses. See crownedSentinel.test.ts.
  crowned_sentinel_final: {
    id: 'crowned_sentinel_final',
    enemyName: 'Crowned Sentinel',
    enemyMaxHp: 72,
    enemyAttack: 5,
    enemyAttackText: 'sweeps its halberd',
    intro: 'The Crowned Sentinel steps down from the dais between Adrian and the Charter. Light gathers in Adrian\'s hand!',
    tutorial: false,
    tip: 'Its ceremonial plate turns ordinary blows: Radiant Strike can break it. Then watch the halberd. Defend only softens its heavy blows; River Ward blocks one completely.',
    armor: {
      attackDamage: 1,
      glanceText: 'Adrian\'s blade rings off the ivory plate. Only 1 damage. Ordinary blows won\'t get through.',
      breakText: 'The blade bites into the royal seal, and the gold disc tears loose and rings across the floor! Beneath it, an older sign begins to glow.',
    },
    heavy: {
      every: 3,
      damage: 26,
      guardedMultiplier: 0.25,
      chargeText: 'The Crowned Sentinel raises its halberd high over the hall. The sign on its chest blazes. A heavy blow is coming!',
      attackText: 'brings its halberd down like a falling gate',
    },
    yieldAt: 20,
    kneels: true,
    victoryText: 'The Crowned Sentinel stops. The sign on its chest answers the medallion, light for light, and slowly it sinks to one knee.',
    sprite: 'crowned',
    arena: 'palace',
    victoryFlags: ['c3_sentinel_knelt'],
    victoryDialogue: 'c3_sentinel_kneels',
    returnTo: { scene: 'audience_hall', spawn: 'after_battle' },
  },
};
