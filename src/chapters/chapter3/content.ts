/**
 * Chapter 3 entry point for the chapter loader. Importing this module
 * registers the chapter's dialogue, layouts and objectives.
 */
import { registerDialogues } from '../../data/dialogue';
import { registerLayout } from '../../data/layouts';
import { registerObjectives } from '../../data/quests';
import { BOAT_NIGHT_DIALOGUE, BOAT_NIGHT_LAYOUT, CHAPTER3_OBJECTIVES } from './boatNightData';

registerDialogues(BOAT_NIGHT_DIALOGUE);
registerLayout('boat_night', BOAT_NIGHT_LAYOUT);
registerObjectives(3, CHAPTER3_OBJECTIVES);

export const CHAPTER3_LOADED = true;
