/**
 * Chapter 2 entry point for the chapter loader. Importing this module
 * registers the chapter's dialogue, layouts and objectives.
 */
import { registerDialogues } from '../../data/dialogue';
import { registerLayout } from '../../data/layouts';
import { registerObjectives } from '../../data/quests';
import { BOAT_DIALOGUE, BOAT_LAYOUT, CHAPTER2_OBJECTIVES } from './boatData';
import { HOME_C2_LAYOUT, VILLAGE_C2_DIALOGUE, VILLAGE_C2_LAYOUT } from './villageData';
import { LANDING_DIALOGUE, LANDING_LAYOUT } from './waystationData';
import { HALL_DIALOGUE, HALL_LAYOUT } from './hallData';

registerDialogues(BOAT_DIALOGUE);
registerDialogues(VILLAGE_C2_DIALOGUE);
registerDialogues(LANDING_DIALOGUE);
registerLayout('waystation_landing', LANDING_LAYOUT);
registerDialogues(HALL_DIALOGUE);
registerLayout('waystation_hall', HALL_LAYOUT);
registerLayout('boat', BOAT_LAYOUT);
registerLayout('village_c2', VILLAGE_C2_LAYOUT);
registerLayout('home_c2', HOME_C2_LAYOUT);
registerObjectives(2, CHAPTER2_OBJECTIVES);

export const CHAPTER2_LOADED = true;
