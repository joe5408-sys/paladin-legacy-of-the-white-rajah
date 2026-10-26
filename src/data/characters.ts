/**
 * Character definitions: display names and placeholder sprite palettes.
 * All characters are fictional.
 */
import type { CharacterFeatures, CharacterPalette } from '../game/player/pixelSprite';

export type CharacterId = 'adrian' | 'lim' | 'mara' | 'guardian' | 'daniel' | 'jamilah' | 'archivist' | 'harrow' | 'officer' | 'ahhock' | 'passenger' | 'auntie' | 'siti' | 'pell';

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
  archivist: {
    id: 'archivist',
    name: 'The Archivist',
    palette: {
      outline: OUTLINE,
      hair: '#b9b4ab', // grey hair pinned up
      hairHi: '#dcd8d0',
      skin: '#d3a57c',
      skinShade: '#b38660',
      eye: '#1b1420',
      jacket: '#5d6b45', // olive cardigan
      jacketShade: '#465233',
      trim: '#e8e2d0', // blouse collar
      belt: '#3a3026',
      pants: '#3a3530', // long dark skirt
      boots: '#221c16',
    },
    features: { glasses: true, hairBun: true, longSkirt: true },
  },
  harrow: {
    id: 'harrow',
    name: 'Lord Chamberlain Harrow',
    palette: {
      outline: OUTLINE,
      hair: '#c9c6c0', // swept-back silver hair
      hairHi: '#eceae4',
      skin: '#e3bfa0',
      skinShade: '#c49c7c',
      eye: '#1b1420',
      jacket: '#1c1a26', // dark morning coat
      jacketShade: '#111019',
      trim: '#e0b850', // gold chain of office
      belt: '#3a3040',
      pants: '#4a4650', // striped grey trousers
      boots: '#0c0a0c',
    },
  },
  officer: {
    id: 'officer',
    name: 'Security Officer',
    palette: {
      outline: OUTLINE,
      hair: '#1a1416',
      hairHi: '#30282c',
      skin: '#b98a62',
      skinShade: '#986c48',
      eye: '#1b1420',
      jacket: '#3b4a5e', // slate-blue Royal Security uniform
      jacketShade: '#2b3747',
      trim: '#c9a24a', // badge
      belt: '#141414',
      pants: '#2b3747',
      boots: '#0e0c0c',
    },
  },
  // Chapter 2
  ahhock: {
    id: 'ahhock',
    name: 'Captain Ah Hock',
    palette: {
      outline: OUTLINE,
      hair: '#5e5a56', // greying crew cut
      hairHi: '#86817b',
      skin: '#d0a070',
      skinShade: '#ae8052',
      eye: '#1b1420',
      jacket: '#e8e2d2', // faded white singlet over a short-sleeved shirt
      jacketShade: '#c4bca8',
      trim: '#3d6b8a',
      belt: '#3a2c20',
      pants: '#4a4a3e', // work shorts
      boots: '#2a2622', // rubber boots
    },
  },
  passenger: {
    id: 'passenger',
    name: 'Student',
    palette: {
      outline: OUTLINE,
      hair: '#16121a',
      hairHi: '#2e2834',
      skin: '#b88358',
      skinShade: '#976640',
      eye: '#1b1420',
      jacket: '#8a2f3a', // university hoodie
      jacketShade: '#6a222c',
      trim: '#e6e0d0',
      belt: '#2a2a30',
      pants: '#2f3e5a', // jeans
      boots: '#d8d4cc', // white trainers
    },
  },
  auntie: {
    id: 'auntie',
    name: 'Auntie',
    palette: {
      outline: OUTLINE,
      hair: '#2a2228',
      hairHi: '#463a42',
      skin: '#c48c60',
      skinShade: '#a26e46',
      eye: '#1b1420',
      jacket: '#c46a3a', // patterned orange blouse
      jacketShade: '#a0522a',
      trim: '#f0d890',
      belt: '#5a3a2a',
      pants: '#3e5a48', // sarong
      boots: '#5a3a2a', // sandals
    },
    features: { longSkirt: true },
  },
  siti: {
    id: 'siti',
    name: 'Kak Siti',
    palette: {
      outline: OUTLINE,
      hair: '#2c3e5c', // navy headscarf
      hairHi: '#3e5476',
      skin: '#c8946a',
      skinShade: '#a6744c',
      eye: '#1b1420',
      jacket: '#e8f0f4', // clinic nurse's uniform
      jacketShade: '#c4d2da',
      trim: '#5a9ab8',
      belt: '#7a8a96',
      pants: '#e8f0f4',
      boots: '#f2f2ee',
    },
    features: { longSkirt: true },
  },
  pell: {
    id: 'pell',
    name: 'Julian Pell',
    palette: {
      outline: OUTLINE,
      hair: '#8a6a3a', // neat sandy hair
      hairHi: '#b08c54',
      skin: '#e6c2a0',
      skinShade: '#c8a07c',
      eye: '#1b1420',
      jacket: '#efe9dc', // pressed linen shirt
      jacketShade: '#d2cab6',
      trim: '#3a6a8a', // company lanyard
      belt: '#5a4632',
      pants: '#b8a47a', // chinos
      boots: '#6a4a30',
    },
  },
};
