/**
 * Layout registry for every explorable scene. Chapter 0 layouts are built in;
 * later chapters register theirs when their content is loaded.
 */
import type { SceneLayout } from '../game/scenes/layout';
import { CHAMBER_LAYOUT } from './ancientChamber';
import { HOME_LAYOUT } from './familyHome';
import type { SceneId } from './scenes';
import { VILLAGE_LAYOUT } from './villageSquare';

export const LAYOUTS: Partial<Record<SceneId, SceneLayout>> = {
  village: VILLAGE_LAYOUT,
  home: HOME_LAYOUT,
  chamber: CHAMBER_LAYOUT,
};

export function registerLayout(scene: SceneId, layout: SceneLayout) {
  LAYOUTS[scene] = layout;
}

/** The scene's layout, or undefined if its chapter hasn't been loaded yet. */
export function getLayout(scene: SceneId): SceneLayout | undefined {
  return LAYOUTS[scene];
}
