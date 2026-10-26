/** Lookup of every explorable scene's layout by id. */
import type { SceneLayout } from '../game/scenes/layout';
import { CHAMBER_LAYOUT } from './ancientChamber';
import { HOME_LAYOUT } from './familyHome';
import type { SceneId } from './scenes';
import { VILLAGE_LAYOUT } from './villageSquare';

export const LAYOUTS: Record<SceneId, SceneLayout> = {
  village: VILLAGE_LAYOUT,
  home: HOME_LAYOUT,
  chamber: CHAMBER_LAYOUT,
};
