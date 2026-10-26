/**
 * Phase 6: save/load, settings and menu-related store behaviour.
 * MASTER_PROMPT §13 + §19 "Save/load".
 */
import { beforeEach, describe, expect, it } from 'vitest';
import {
  buildSave,
  deleteSave,
  isStandable,
  loadSave,
  SAVE_KEY,
  SCHEMA_VERSION,
  validateSave,
  writeSave,
  type SaveData,
  type SaveStorage,
} from '../../src/game/save/save';
import { DEFAULT_SETTINGS, loadSettings, SETTINGS_KEY, validateSettings } from '../../src/game/settings/settings';
import { gameStore } from '../../src/game/core/gameStore';
import { SCENES } from '../../src/data/scenes';

/** In-memory stand-in for localStorage. */
class MemoryStorage implements SaveStorage {
  data = new Map<string, string>();
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
}

/** Storage that throws on every call (e.g. blocked or private browsing). */
const broken: SaveStorage = {
  getItem() {
    throw new Error('blocked');
  },
  setItem() {
    throw new Error('quota');
  },
  removeItem() {
    throw new Error('blocked');
  },
};

const s = () => gameStore.getState();

function homeSave(overrides: Partial<Record<keyof SaveData, unknown>> = {}) {
  return {
    schemaVersion: SCHEMA_VERSION,
    savedAt: '2026-10-26T10:00:00.000Z',
    scene: 'home',
    position: { x: 0.5, z: 1.5, facing: 'west' },
    flags: ['arrived', 'entered_home', 'met_mara'],
    playTimeMs: 125_000,
    prologueComplete: false,
    ...overrides,
  };
}

let store: MemoryStorage;
beforeEach(() => {
  store = new MemoryStorage();
  s().reset();
});

describe('save validation', () => {
  it('accepts a valid save unchanged', () => {
    const r = validateSave(homeSave());
    expect(r.ok).toBe(true);
    if (!r.ok) return;
    expect(r.repaired).toBe(false);
    expect(r.data.scene).toBe('home');
    expect(r.data.position).toEqual({ x: 0.5, z: 1.5, facing: 'west' });
    expect(r.data.flags).toEqual(['arrived', 'entered_home', 'met_mara']);
  });

  it('reports a missing save', () => {
    expect(loadSave(store)).toEqual({ ok: false, reason: 'missing' });
  });

  it('reports corrupt JSON without throwing', () => {
    store.setItem(SAVE_KEY, '{not json');
    expect(loadSave(store)).toEqual({ ok: false, reason: 'corrupt' });
  });

  it('rejects other schema versions as incompatible', () => {
    expect(validateSave(homeSave({ schemaVersion: 99 }))).toEqual({ ok: false, reason: 'incompatible' });
  });

  it('rejects non-objects, unknown scenes and bad flag lists', () => {
    for (const bad of [null, 42, 'save', [], homeSave({ scene: 'kuching' }), homeSave({ flags: 'all' })]) {
      expect(validateSave(bad).ok).toBe(false);
    }
  });

  it('drops unknown flags', () => {
    const r = validateSave(homeSave({ flags: ['arrived', 'entered_home', 'godmode', 'arrived'] }));
    expect(r.ok && r.data.flags).toEqual(['arrived', 'entered_home']);
    expect(r.ok && r.repaired).toBe(true);
  });

  it('moves an out-of-bounds or blocked position back to the scene spawn', () => {
    const outside = validateSave(homeSave({ position: { x: 50, z: 50, facing: 'north' } }));
    expect(outside.ok && outside.data.position).toEqual(Object.values(SCENES.home.spawns)[0]);
    const inTable = validateSave(homeSave({ position: { x: -2.2, z: 1.2, facing: 'north' } }));
    expect(inTable.ok && inTable.data.position).toEqual(Object.values(SCENES.home.spawns)[0]);
    const nan = validateSave(homeSave({ position: { x: Number.NaN, z: 0, facing: 'north' } }));
    expect(nan.ok && nan.repaired).toBe(true);
  });

  it('sends a scene the story has not unlocked back to the village', () => {
    const r = validateSave(homeSave({ scene: 'chamber', flags: ['arrived'] }));
    expect(r.ok && r.data.scene).toBe('village');
    expect(r.ok && r.data.position).toEqual(SCENES.village.spawns.start);
  });

  it('repairs a bad play time and facing', () => {
    const r = validateSave(homeSave({ playTimeMs: -5, position: { x: 0.5, z: 1.5, facing: 'up' } }));
    expect(r.ok && r.data.playTimeMs).toBe(0);
    expect(r.ok && r.data.position.facing).toBe('south');
  });

  it('never throws when storage is blocked or full', () => {
    expect(loadSave(broken)).toEqual({ ok: false, reason: 'unavailable' });
    expect(loadSave(null)).toEqual({ ok: false, reason: 'unavailable' });
    const valid = validateSave(homeSave()) as { ok: true; data: SaveData };
    expect(writeSave(valid.data, broken)).toBe(false);
    expect(() => deleteSave(broken)).not.toThrow();
  });

  it('every scene spawn point is a standable position', () => {
    for (const scene of Object.values(SCENES)) {
      for (const p of Object.values(scene.spawns)) {
        expect(isStandable(scene.id, p, { passage_open: true }), `${scene.id}`).toBe(true);
      }
    }
  });
});

describe('save round trip', () => {
  it('persists the scene, position, quest flags and play time, and restores them', () => {
    // Play into the home and talk to Mara.
    s().setFlags(['arrived', 'entered_home', 'met_mara']);
    s().requestScene('home', 'door');
    s().swapScene();
    s().finishTransition();
    const now = s().startedAt + 200_000;
    const data = buildSave(s(), { x: 1, z: 1.5, facing: 'east' }, now);
    expect(writeSave(data, store)).toBe(true);

    // "Refresh the browser": wipe state, then Continue.
    s().returnToTitle();
    expect(s().screen).toBe('title');
    expect(s().flags).toEqual({});
    const loaded = loadSave(store);
    expect(loaded.ok).toBe(true);
    if (!loaded.ok) return;
    s().loadGame(loaded.data);

    expect(s().screen).toBe('game');
    expect(s().scene).toBe('home');
    expect(s().spawn).toEqual({ x: 1, z: 1.5, facing: 'east' });
    expect(s().flags).toEqual({ arrived: true, entered_home: true, met_mara: true });
    expect(s().mode).toBe('explore');
    expect(Date.now() - s().startedAt).toBeGreaterThanOrEqual(200_000);
  });

  it('a completed save reopens on the chapter-complete card', () => {
    s().setFlags(['arrived', 'entered_home', 'passage_open', 'prologue_complete']);
    const data = buildSave({ ...s(), scene: 'chamber', completedAt: s().startedAt + 1000 }, { x: 0, z: 1.9, facing: 'north' });
    expect(data.prologueComplete).toBe(true);
    s().returnToTitle();
    const r = validateSave(JSON.parse(JSON.stringify(data)));
    expect(r.ok).toBe(true);
    if (r.ok) s().loadGame(r.data);
    expect(s().mode).toBe('ending');
  });

  it('a save made before the battle restores to the pre-battle checkpoint (no battle state)', () => {
    s().setFlags(['arrived', 'entered_home', 'met_mara', 'heirloom_awakened', 'passage_open', 'entered_chamber']);
    s().requestScene('chamber', 'stairs');
    s().swapScene();
    s().finishTransition();
    const data = buildSave(s(), SCENES.chamber.spawns.stairs);
    s().startBattle('covenant_guardian');
    expect(s().mode).toBe('battle');
    // Whatever happens next, loading puts us back in the chamber, exploring, battle not started.
    s().returnToTitle();
    const restored = validateSave(JSON.parse(JSON.stringify(data)));
    expect(restored.ok).toBe(true);
    if (restored.ok) s().loadGame(restored.data);
    expect(s().scene).toBe('chamber');
    expect(s().mode).toBe('explore');
    expect(s().battle).toBeNull();
    expect(s().flags.guardian_defeated).toBeUndefined();
  });
});

describe('pause and menus', () => {
  it('starts on the title screen and New Game opens the game with the opening scene', () => {
    s().returnToTitle();
    expect(s().screen).toBe('title');
    s().startNewGame();
    expect(s().screen).toBe('game');
    expect(s().dialogue?.def.id).toBe('village_arrival');
  });

  it('pausing freezes interaction; resume restores it', () => {
    s().startNewGame();
    for (let i = 0; i < 20 && s().dialogue; i++) s().pressAction('Enter');
    expect(s().setPaused(true)).toBe(true);
    expect(s().pressAction('KeyE')).toBe(false);
    expect(s().setPaused(false)).toBe(false);
  });

  it('pause is unavailable on the title screen, mid-transition and on the ending card', () => {
    s().returnToTitle();
    expect(s().canPause()).toBe(false);
    s().startNewGame();
    for (let i = 0; i < 20 && s().dialogue; i++) s().pressAction('Enter');
    s().requestScene('home', 'door');
    expect(s().canPause()).toBe(false);
    expect(s().setPaused(true)).toBe(false);
    s().reset();
    s().endChapter();
    expect(s().canPause()).toBe(false);
  });

  it('dialogue keys do nothing while paused', () => {
    s().startNewGame();
    s().setPaused(true);
    const index = s().dialogue?.index;
    s().pressAction('Enter');
    s().pressAction('Enter');
    expect(s().dialogue?.index).toBe(index);
  });
});

describe('settings', () => {
  it('fills in defaults for missing or invalid values', () => {
    expect(validateSettings(null)).toEqual(DEFAULT_SETTINGS);
    expect(validateSettings({ textSpeed: 'warp', volume: 7, muted: 'yes' })).toEqual({
      ...DEFAULT_SETTINGS,
      volume: 1,
    });
    expect(validateSettings({ textSpeed: 'fast', volume: 0.3, muted: true })).toEqual({
      textSpeed: 'fast',
      volume: 0.3,
      muted: true,
    });
  });

  it('loads from storage and survives corrupt data', () => {
    store.setItem(SETTINGS_KEY, JSON.stringify({ textSpeed: 'slow', volume: 0.5, muted: false }));
    expect(loadSettings(store).textSpeed).toBe('slow');
    store.setItem(SETTINGS_KEY, '}{');
    expect(loadSettings(store)).toEqual(DEFAULT_SETTINGS);
    expect(loadSettings(broken)).toEqual(DEFAULT_SETTINGS);
  });
});
