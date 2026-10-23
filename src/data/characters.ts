/**
 * Character definitions: display names and placeholder sprite palettes.
 * All characters are fictional.
 */
import type { CharacterFeatures, CharacterPalette } from '../game/player/pixelSprite';

export type CharacterId = 'adrian' | 'lim';

export interface CharacterDef {
  id: CharacterId;
  /** Name shown in the dialogue box. */
  name: string;
  palette: CharacterPalette;
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
};
