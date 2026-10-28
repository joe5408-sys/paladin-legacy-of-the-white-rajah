/**
 * Scene registry: names, spawn points and arrival dialogue.
 * Geometry and colliders live in each scene's own layout file.
 */
import type { Direction } from '../game/core/input';
import type { DialogueRule } from '../game/dialogue/types';

export type SceneId = 'village' | 'home' | 'chamber' | 'waterfront' | 'archives' | 'vault' | 'records' | 'boat' | 'village_c2' | 'home_c2' | 'waystation_landing' | 'waystation_hall' | 'jetty_dusk' | 'boat_night' | 'waterfront_night' | 'jamilah_room' | 'palace_gate' | 'audience_hall' | 'village_epilogue';

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
      vault_door: { x: 0, z: -2.0, facing: 'south' },
    },
    arrival: [{ dialogue: 'c1_archives_arrival', unless: ['c1_entered_archives'] }],
  },
  vault: {
    id: 'vault',
    name: 'Royal Archives — Vault',
    spawns: {
      entrance: { x: 0, z: 1.9, facing: 'north' },
      after_battle: { x: 0, z: 0.2, facing: 'north' },
      inner_gate: { x: 1.0, z: -3.4, facing: 'south' },
    },
    arrival: [{ dialogue: 'c1_vault_arrival', unless: ['c1_entered_vault'] }],
  },
  records: {
    id: 'records',
    name: 'Royal Archives — Sealed Records',
    spawns: {
      entrance: { x: 0, z: 1.8, facing: 'north' },
    },
    arrival: [{ dialogue: 'c1_records_arrival', unless: ['c1_entered_records'] }],
  },
  // Chapter 2. Loaded on demand (src/chapters/chapter2).
  boat: {
    id: 'boat',
    name: 'Express Boat — Rajang River',
    spawns: {
      arrival: { x: -3.4, z: 0, facing: 'east' },
    },
    arrival: [{ dialogue: 'c2_boat_arrival', unless: ['c2_arrived'] }],
  },
  // Sungai Awan again, re-dressed for Chapter 2 (same buildings, new people and props).
  village_c2: {
    id: 'village_c2',
    name: 'Sungai Awan — Village Square',
    spawns: {
      jetty: { x: 1.6, z: -4.6, facing: 'south' },
      from_home: { x: 6.8, z: 3.5, facing: 'south' },
    },
    arrival: [{ dialogue: 'c2_village_arrival', unless: ['c2_village_arrived'] }],
  },
  home_c2: {
    id: 'home_c2',
    name: 'Vale Family Home',
    spawns: {
      door: { x: 0, z: 2.0, facing: 'north' },
    },
  },
  // The Paladin landing above the rapids (src/chapters/chapter2/waystationData.ts).
  waystation_landing: {
    id: 'waystation_landing',
    name: 'The Waystation Landing',
    spawns: {
      arrival: { x: 0, z: 2.9, facing: 'north' },
      after_battle: { x: 0, z: -2.4, facing: 'north' },
      from_hall: { x: 0, z: -2.9, facing: 'south' },
    },
    arrival: [
      { dialogue: 'c2_warden_appears', requires: ['c2_daniel_returned'], unless: ['c2_warden_seen'] },
      { dialogue: 'c2_landing_arrival', unless: ['c2_landing_arrived'] },
    ],
  },
  // Inside the waystation (src/chapters/chapter2/hallData.ts).
  waystation_hall: {
    id: 'waystation_hall',
    name: 'The Waystation',
    spawns: {
      entrance: { x: 0, z: 1.9, facing: 'north' },
    },
    arrival: [{ dialogue: 'c2_hall_arrival', unless: ['c2_entered_hall'] }],
  },
  // Sungai Awan at dusk, with Harrow's barge at the jetty (src/chapters/chapter2/jettyData.ts).
  jetty_dusk: {
    id: 'jetty_dusk',
    name: 'Sungai Awan — The Jetty at Dusk',
    spawns: {
      arrival: { x: -8.4, z: -4.7, facing: 'east' },
      after_battle: { x: 7.2, z: -4.7, facing: 'east' },
    },
    arrival: [{ dialogue: 'c2_dusk_arrival', unless: ['c2_dusk_arrived'] }],
  },
  // Chapter 3. Loaded on demand (src/chapters/chapter3). The express boat again, overnight to Kuching.
  boat_night: {
    id: 'boat_night',
    name: 'Night Express — Down the Rajang',
    spawns: {
      arrival: { x: -3.4, z: 0.2, facing: 'east' },
    },
    arrival: [{ dialogue: 'c3_boat_arrival', unless: ['c3_arrived'] }],
  },
  // The Chapter 1 waterfront an hour before dawn (src/chapters/chapter3/kuchingData.ts).
  waterfront_night: {
    id: 'waterfront_night',
    name: 'Kuching — Waterfront, Before Dawn',
    spawns: {
      arrival: { x: 13.6, z: -4.6, facing: 'west' },
    },
    arrival: [{ dialogue: 'c3_waterfront_arrival', unless: ['c3_kuching_arrived'] }],
  },
  jamilah_room: {
    id: 'jamilah_room',
    name: "Above Kak Jamilah's Stall",
    spawns: {
      arrival: { x: 0, z: 1.3, facing: 'north' },
    },
    arrival: [{ dialogue: 'c3_room_arrival', unless: ['c3_room_entered'] }],
  },
  // The Palace forecourt in the morning (src/chapters/chapter3/palaceData.ts).
  palace_gate: {
    id: 'palace_gate',
    name: 'The Palace — Forecourt',
    spawns: {
      arrival: { x: 0, z: 2.2, facing: 'north' },
      after_battle: { x: 0, z: -1.6, facing: 'north' },
    },
    arrival: [{ dialogue: 'c3_gate_arrival', unless: ['c3_gate_arrived'] }],
  },
  // The audience hall (src/chapters/chapter3/audienceData.ts).
  audience_hall: {
    id: 'audience_hall',
    name: 'The Palace — Audience Hall',
    spawns: {
      entrance: { x: 0, z: 3.0, facing: 'north' },
      after_battle: { x: 0, z: -0.9, facing: 'north' },
    },
    arrival: [{ dialogue: 'c3_hall_arrival', unless: ['c3_hall_entered'] }],
  },
  // The epilogue: Sungai Awan by day (src/chapters/chapter3/epilogueData.ts).
  village_epilogue: {
    id: 'village_epilogue',
    name: 'Sungai Awan — Village Square',
    spawns: {
      jetty: { x: 2.4, z: -4.6, facing: 'south' },
    },
    arrival: [{ dialogue: 'c3_epilogue_arrival', unless: ['c3_epilogue_arrived'] }],
  },
};

/** Chapter a scene belongs to (0 = prologue). */
export const SCENE_CHAPTER: Record<SceneId, number> = {
  village: 0,
  home: 0,
  chamber: 0,
  waterfront: 1,
  archives: 1,
  vault: 1,
  records: 1,
  boat: 2,
  village_c2: 2,
  home_c2: 2,
  waystation_landing: 2,
  waystation_hall: 2,
  jetty_dusk: 2,
  boat_night: 3,
  waterfront_night: 3,
  jamilah_room: 3,
  palace_gate: 3,
  audience_hall: 3,
  village_epilogue: 3,
};

export const NEW_GAME_SCENE: SceneId = 'village';
export const NEW_GAME_SPAWN = 'start';
