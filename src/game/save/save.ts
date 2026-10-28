/**
 * Save system (browser localStorage). Everything loaded from storage is treated
 * as untrusted: it is validated, repaired where safe, or rejected with a reason,
 * and nothing here ever throws to the caller.
 *
 * Battles are never saved mid-turn: saving is only allowed while exploring, and
 * the automatic checkpoints are taken on scene arrival and after a victory.
 */
import { getLayout } from '../../data/layouts';
import { SCENES, type SceneId, type SpawnPoint } from '../../data/scenes';
import { circleOverlapsBox } from '../core/collision';
import { PLAYER_RADIUS } from '../core/constants';
import type { StoryFlag, StoryFlags } from '../core/flags';
import type { Direction } from '../core/input';

export const SAVE_KEY = 'paladin.save';
export const SCHEMA_VERSION = 1;

export interface SaveData {
  schemaVersion: typeof SCHEMA_VERSION;
  /** ISO timestamp. */
  savedAt: string;
  scene: SceneId;
  position: SpawnPoint;
  flags: StoryFlag[];
  playTimeMs: number;
  prologueComplete: boolean;
}

export type LoadResult =
  | { ok: true; data: SaveData; repaired: boolean }
  | { ok: false; reason: 'missing' | 'corrupt' | 'incompatible' | 'invalid' | 'unavailable' };

/** Minimal storage interface so tests can use an in-memory fake. */
export interface SaveStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

const ALL_FLAGS: readonly StoryFlag[] = [
  'arrived', 'met_lim', 'entered_home', 'met_mara', 'heirloom_awakened', 'passage_open',
  'entered_chamber', 'guardian_defeated', 'read_message', 'daniel_arrived', 'met_daniel',
  'prologue_complete', 'chapter1_started', 'c1_arrived', 'c1_met_daniel', 'c1_archives_reached',
  'c1_entered_archives', 'c1_met_archivist', 'c1_clue_gap', 'c1_hint_household', 'c1_file_found',
  'c1_vault_found', 'c1_entered_vault', 'c1_sentinel_defeated', 'c1_inner_gate_open',
  'c1_entered_records', 'c1_box_read', 'c1_letter_found', 'c1_security_arrived', 'c1_lights_out', 'c1_escaped',
  'chapter2_started', 'c2_arrived', 'c2_talked_mara', 'c2_saw_news', 'c2_talked_captain', 'c2_reached_jetty',
  'c2_village_arrived', 'c2_read_notice', 'c2_talked_lim', 'c2_met_siti', 'c2_met_pell', 'c2_home_talked', 'c2_found_map',
  'c2_went_upriver', 'c2_landing_arrived', 'c2_stone_deep', 'c2_stone_bright', 'c2_stones_woken', 'c2_spirit_defeated',
  'c2_learned_ward', 'c2_entered_hall', 'c2_read_journal', 'c2_read_oath', 'c2_found_charter', 'c2_daniel_returned',
  'c2_warden_seen', 'c2_warden_defeated', 'c2_dusk_arrived', 'c2_iron_seen', 'c2_iron_defeated',
  'chapter3_started', 'c3_arrived', 'c3_talked_pell', 'c3_saw_news', 'c3_daniel_called', 'c3_reached_kuching',
  'c3_kuching_arrived', 'c3_met_jamilah', 'c3_room_entered', 'c3_read_note', 'c3_reason_village', 'c3_reason_family',
  'c3_reason_right', 'c3_pell_signed', 'c3_daniel_arrived', 'c3_plan_made',
  'c3_gate_arrived', 'c3_petition_registered', 'c3_sentinel_woken', 'c3_sentinel_withdrew', 'c3_gate_open',
  'c3_hall_entered', 'c3_hearing_started', 'c3_claim1_answered', 'c3_claim2_answered', 'c3_claim3_answered',
  'c3_mara_spoke', 'c3_claim4_answered', 'c3_pell_testified', 'c3_hearing_won',
  'c3_ruling_given', 'c3_sentinel_ordered', 'c3_sentinel_knelt', 'c3_charter_registered', 'c3_harrow_dismissed',
  'c3_name_restored', 'c3_epilogue_arrived', 'c3_pegs_pulled',
];
const DIRECTIONS: readonly Direction[] = ['north', 'south', 'east', 'west'];

/** A scene is only reachable once these flags exist; anything else is a tampered save. */
const SCENE_REQUIRES: Record<SceneId, StoryFlag[]> = {
  village: [],
  home: ['entered_home'],
  chamber: ['passage_open'],
  waterfront: ['chapter1_started'],
  archives: ['c1_archives_reached'],
  vault: ['c1_vault_found'],
  records: ['c1_inner_gate_open'],
  boat: ['chapter2_started'],
  village_c2: ['c2_reached_jetty'],
  home_c2: ['c2_reached_jetty'],
  waystation_landing: ['c2_went_upriver'],
  waystation_hall: ['c2_spirit_defeated'],
  jetty_dusk: ['c2_warden_defeated'],
  boat_night: ['chapter3_started'],
  waterfront_night: ['c3_reached_kuching'],
  jamilah_room: ['c3_met_jamilah'],
  palace_gate: ['c3_plan_made'],
  audience_hall: ['c3_gate_open'],
  village_epilogue: ['c3_name_restored'],
};

/** Browser localStorage, or null where it's unavailable (private mode, blocked, tests). */
export function defaultStorage(): SaveStorage | null {
  try {
    if (typeof localStorage === 'undefined') return null;
    const probe = '__paladin_probe__';
    localStorage.setItem(probe, '1');
    localStorage.removeItem(probe);
    return localStorage;
  } catch {
    return null;
  }
}

function isObject(v: unknown): v is Record<string, unknown> {
  return typeof v === 'object' && v !== null && !Array.isArray(v);
}

function firstSpawn(scene: SceneId): SpawnPoint {
  return Object.values(SCENES[scene].spawns)[0];
}

/** Is this a legal standing spot in the scene (in bounds and not inside an obstacle)? */
export function isStandable(scene: SceneId, p: { x: number; z: number }, flags: StoryFlags): boolean {
  const layout = getLayout(scene);
  if (!layout) return false; // chapter not loaded: can't check, so use the spawn point
  const b = layout.bounds;
  if (
    p.x < b.minX + PLAYER_RADIUS - 1e-6 ||
    p.x > b.maxX - PLAYER_RADIUS + 1e-6 ||
    p.z < b.minZ + PLAYER_RADIUS - 1e-6 ||
    p.z > b.maxZ - PLAYER_RADIUS + 1e-6
  ) {
    return false;
  }
  return !layout.colliders(flags).some((box) => circleOverlapsBox(p, PLAYER_RADIUS, box));
}

/** Validates (and where safe, repairs) untrusted save data. */
export function validateSave(raw: unknown): LoadResult {
  if (!isObject(raw)) return { ok: false, reason: 'invalid' };
  if (raw.schemaVersion !== SCHEMA_VERSION) {
    return { ok: false, reason: typeof raw.schemaVersion === 'number' ? 'incompatible' : 'invalid' };
  }
  if (typeof raw.scene !== 'string' || !(raw.scene in SCENES)) return { ok: false, reason: 'invalid' };
  if (!Array.isArray(raw.flags)) return { ok: false, reason: 'invalid' };

  let repaired = false;
  let scene = raw.scene as SceneId;

  // Keep only known flags (drop anything unrecognised).
  const flags = [...new Set(raw.flags.filter((f): f is StoryFlag => ALL_FLAGS.includes(f as StoryFlag)))];
  if (flags.length !== raw.flags.length) repaired = true;
  const flagSet: StoryFlags = Object.fromEntries(flags.map((f) => [f, true]));

  // A scene the story hasn't unlocked yet → back to the village.
  if (!SCENE_REQUIRES[scene].every((f) => flagSet[f])) {
    scene = 'village';
    repaired = true;
  }

  // Position must be finite numbers on a walkable spot; otherwise use the scene's spawn.
  let position = firstSpawn(scene);
  const pos = raw.position;
  if (
    scene === raw.scene &&
    isObject(pos) &&
    Number.isFinite(pos.x) &&
    Number.isFinite(pos.z) &&
    isStandable(scene, { x: pos.x as number, z: pos.z as number }, flagSet)
  ) {
    const facing = DIRECTIONS.includes(pos.facing as Direction) ? (pos.facing as Direction) : 'south';
    if (facing !== pos.facing) repaired = true;
    position = { x: pos.x as number, z: pos.z as number, facing };
  } else {
    repaired = true;
  }

  const playTimeMs =
    typeof raw.playTimeMs === 'number' && Number.isFinite(raw.playTimeMs) && raw.playTimeMs >= 0
      ? raw.playTimeMs
      : 0;
  if (playTimeMs !== raw.playTimeMs) repaired = true;

  const prologueComplete = raw.prologueComplete === true && !!flagSet.prologue_complete;

  return {
    ok: true,
    repaired,
    data: {
      schemaVersion: SCHEMA_VERSION,
      savedAt: typeof raw.savedAt === 'string' ? raw.savedAt : new Date(0).toISOString(),
      scene,
      position,
      flags,
      playTimeMs,
      prologueComplete,
    },
  };
}

export function loadSave(storage: SaveStorage | null = defaultStorage()): LoadResult {
  if (!storage) return { ok: false, reason: 'unavailable' };
  let text: string | null;
  try {
    text = storage.getItem(SAVE_KEY);
  } catch {
    return { ok: false, reason: 'unavailable' };
  }
  if (text === null) return { ok: false, reason: 'missing' };
  let raw: unknown;
  try {
    raw = JSON.parse(text);
  } catch {
    return { ok: false, reason: 'corrupt' };
  }
  return validateSave(raw);
}

/** Writes a save. Returns false if storage is unavailable or full. */
export function writeSave(data: SaveData, storage: SaveStorage | null = defaultStorage()): boolean {
  if (!storage) return false;
  try {
    storage.setItem(SAVE_KEY, JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

export function deleteSave(storage: SaveStorage | null = defaultStorage()): void {
  try {
    storage?.removeItem(SAVE_KEY);
  } catch {
    // Nothing useful to do; a stale save is still validated on load.
  }
}

/** Builds save data from game state plus a player position. */
export function buildSave(
  state: { scene: SceneId; flags: StoryFlags; startedAt: number; completedAt: number | null },
  position: SpawnPoint,
  now = Date.now(),
): SaveData {
  return {
    schemaVersion: SCHEMA_VERSION,
    savedAt: new Date(now).toISOString(),
    scene: state.scene,
    position: { x: position.x, z: position.z, facing: position.facing },
    flags: ALL_FLAGS.filter((f) => state.flags[f]),
    playTimeMs: Math.max(0, (state.completedAt ?? now) - state.startedAt),
    prologueComplete: !!state.flags.prologue_complete,
  };
}

/** Story flags from the stored save without validating it (used to preload chapters). */
export function peekSavedFlags(storage: SaveStorage | null = defaultStorage()): string[] {
  try {
    const text = storage?.getItem(SAVE_KEY);
    const raw: unknown = text ? JSON.parse(text) : null;
    const flags = isObject(raw) ? raw.flags : null;
    return Array.isArray(flags) ? flags.filter((f): f is string => typeof f === 'string') : [];
  } catch {
    return [];
  }
}
