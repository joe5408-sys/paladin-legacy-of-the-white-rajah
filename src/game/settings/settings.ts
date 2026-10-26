/**
 * Player settings, stored separately from the save so they survive New Game.
 * Like saves, stored values are validated and fall back to defaults.
 */
import { createStore } from 'zustand/vanilla';
import { useStore } from 'zustand';
import { defaultStorage, type SaveStorage } from '../save/save';

export const SETTINGS_KEY = 'paladin.settings';

export type TextSpeed = 'slow' | 'normal' | 'fast' | 'instant';

export interface Settings {
  textSpeed: TextSpeed;
  /** 0..1 */
  volume: number;
  muted: boolean;
}

export const DEFAULT_SETTINGS: Settings = { textSpeed: 'normal', volume: 0.7, muted: false };

/** Characters per second for the dialogue typewriter (Infinity = instant). */
export const TEXT_SPEED_CPS: Record<TextSpeed, number> = {
  slow: 25,
  normal: 45,
  fast: 90,
  instant: Infinity,
};

export function validateSettings(raw: unknown): Settings {
  const s = typeof raw === 'object' && raw !== null ? (raw as Record<string, unknown>) : {};
  return {
    textSpeed: (['slow', 'normal', 'fast', 'instant'] as const).includes(s.textSpeed as TextSpeed)
      ? (s.textSpeed as TextSpeed)
      : DEFAULT_SETTINGS.textSpeed,
    volume:
      typeof s.volume === 'number' && Number.isFinite(s.volume)
        ? Math.min(1, Math.max(0, s.volume))
        : DEFAULT_SETTINGS.volume,
    muted: typeof s.muted === 'boolean' ? s.muted : DEFAULT_SETTINGS.muted,
  };
}

export function loadSettings(storage: SaveStorage | null = defaultStorage()): Settings {
  try {
    const text = storage?.getItem(SETTINGS_KEY);
    return text ? validateSettings(JSON.parse(text)) : { ...DEFAULT_SETTINGS };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export interface SettingsState extends Settings {
  update(patch: Partial<Settings>): void;
}

export const settingsStore = createStore<SettingsState>()((set, get) => ({
  ...loadSettings(),
  update(patch) {
    const next = validateSettings({ ...get(), ...patch });
    set(next);
    try {
      defaultStorage()?.setItem(SETTINGS_KEY, JSON.stringify(next));
    } catch {
      // Settings still apply for this session.
    }
  },
}));

export function useSettings<T>(selector: (s: SettingsState) => T): T {
  return useStore(settingsStore, selector);
}
