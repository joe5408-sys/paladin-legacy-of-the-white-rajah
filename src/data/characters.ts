/**
 * Character definitions: display names and placeholder sprite palettes.
 * All characters are fictional.
 */
import type { CharacterFeatures, CharacterPalette } from '../game/player/pixelSprite';

export type CharacterId = 'adrian' | 'lim' | 'mara' | 'guardian' | 'daniel' | 'jamilah';

export interface CharacterDef {
  id: CharacterId;
  /** Name shown in the dialogue box. */
  name: string;
  /** Walking-sprite palette. Omitted for characters with custom sprites. */
  palette?: CharacterPalette;
  features?: CharacterFeatures;
}

const OUTLINE = '#16111c';

export const CHARACTERS: Record<CharacterId, CharacterDef> = {
  adrian: {
    id: 'adrian',
    name: 'Adrian',
    palette: {
      outline: OUTLINE,
      hair: '#2b1e18',
      hairHi: '#4a342a',
      skin: '#c98e62',
      skinShade: '#a8714c',
      eye: '#1b1420',
      jacket: '#25386f',
      jacketShade: '#1a2850',
      trim: '#d8b24a', // a hint of the family's gold
      belt: '#5a3b22',
      pants: '#3a3a48',
      boots: '#4a2e1f',
    },
  },
  lim: {
    id: 'lim',
    name: 'Uncle Lim',
    palette: {
      outline: OUTLINE,
      hair: '#a9a6a0',
      hairHi: '#d2cfc8',
      skin: '#e0b48a',
      skinShade: '#c09068',
      eye: '#1b1420',
      jacket: '#e9e4d6', // pale short-sleeve shirt
      jacketShade: '#c8c1ae',
      trim: '#3d7f6e',
      belt: '#3b2b20',
      pants: '#6f6450',
      boots: '#2e2620',
    },
    features: { glasses: true },
  },
  mara: {
    id: 'mara',
    name: 'Aunt Mara',
    palette: {
      outline: OUTLINE,
      hair: '#dedad2', // white hair in a bun
      hairHi: '#f4f1ea',
      skin: '#c58f66',
      skinShade: '#a5704c',
      eye: '#1b1420',
      jacket: '#7b2f3b', // deep maroon blouse
      jacketShade: '#5c2029',
      trim: '#d8b24a', // the family gold
      belt: '#3b2b20',
      pants: '#2f3a3a', // long dark skirt
      boots: '#2a2018',
    },
    features: { hairBun: true, longSkirt: true },
  },
  guardian: {
    id: 'guardian',
    name: 'Covenant Guardian',
    // Custom battle sprite: see src/game/combat/guardianSprite.ts
  },
  daniel: {
    id: 'daniel',
    name: 'Daniel Rengas',
    palette: {
      outline: OUTLINE,
      hair: '#141014', // short black hair
      hairHi: '#2c2630',
      skin: '#b07a52',
      skinShade: '#8f5f3e',
      eye: '#1b1420',
      jacket: '#1f2633', // dark security-service suit
      jacketShade: '#151a24',
      trim: '#e8e6e0', // white shirt
      belt: '#0e1016',
      pants: '#1f2633',
      boots: '#0e0c0c',
    },
  },
  jamilah: {
    id: 'jamilah',
    name: 'Kak Jamilah',
    palette: {
      outline: OUTLINE,
      hair: '#3f6e8c', // headscarf
      hairHi: '#5b8fb0',
      skin: '#c48b5f',
      skinShade: '#a26c45',
      eye: '#1b1420',
      jacket: '#e3b04b', // stall apron over a blouse
      jacketShade: '#c08e30',
      trim: '#7a3b5e',
      belt: '#5a3b22',
      pants: '#5a3b5e', // long skirt
      boots: '#2a2018',
    },
    features: { longSkirt: true },
  },
};
