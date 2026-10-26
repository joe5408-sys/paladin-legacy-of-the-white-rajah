/**
 * Scene registry: names, spawn points and arrival dialogue.
 * Geometry and colliders live in each scene's own layout file.
 */
import type { Direction } from '../game/core/input';
import type { DialogueRule } from '../game/dialogue/types';

export type SceneId = 'village' | 'home' | 'chamber' | 'waterfront' | 'archives';

export interface SpawnPoint {
  x: number;
  z: number;
  facing: Direction;
}

export interface SceneDef {
  id: SceneId;
  /** Location label shown in the HUD. */
  name: string;
  spawns: Record<string, SpawnPoint>;
  /** Conversation that plays automatically on arrival (first matching rule). */
  arrival?: DialogueRule[];
}

export const SCENES: Record<SceneId, SceneDef> = {
  village: {
    id: 'village',
    name: 'Sungai Awan — Village Square',
    spawns: {
      start: { x: -6, z: 5.5, facing: 'north' },
      from_home: { x: 6.8, z: 3.5, facing: 'south' },
    },
    arrival: [{ dialogue: 'village_arrival', unless: ['arrived'] }],
  },
  home: {
    id: 'home',
    name: 'Vale Family Home',
    spawns: {
      door: { x: 0, z: 2.0, facing: 'north' },
      from_passage: { x: -1.2, z: -0.6, facing: 'east' },
    },
    arrival: [{ dialogue: 'home_arrival', unless: ['entered_home'] }],
  },
  chamber: {
    id: 'chamber',
    name: 'Ancient Chamber',
    spawns: {
      stairs: { x: 0, z: 1.9, facing: 'north' },
      after_battle: { x: 0, z: 1.2, facing: 'north' },
    },
    arrival: [{ dialogue: 'chamber_arrival', unless: ['entered_chamber'] }],
  },
  // Chapter 1. Its dialogue, layout and 3D scene are loaded on demand (src/chapters/chapter1).
  waterfront: {
    id: 'waterfront',
    name: 'Kuching — Waterfront',
    spawns: {
      arrival: { x: 7, z: 4.5, facing: 'north' },
      archives_door: { x: -1.5, z: 0.3, facing: 'south' },
    },
    arrival: [{ dialogue: 'c1_arrival', unless: ['c1_arrived'] }],
  },
  archives: {
    id: 'archives',
    name: 'Royal Archives',
    spawns: {
      entrance: { x: 0, z: 2.2, facing: 'north' },
    },
    arrival: [{ dialogue: 'c1_archives_arrival', unless: ['c1_entered_archives'] }],
  },
};

/** Chapter a scene belongs to (0 = prologue). */
export const SCENE_CHAPTER: Record<SceneId, number> = {
  village: 0,
  home: 0,
  chamber: 0,
  waterfront: 1,
  archives: 1,
};

export const NEW_GAME_SCENE: SceneId = 'village';
export const NEW_GAME_SPAWN = 'start';
