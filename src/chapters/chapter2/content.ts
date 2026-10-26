/**
 * Chapter 2 entry point for the chapter loader. Importing this module
 * registers the chapter's dialogue, layouts and objectives.
 */
import { registerDialogues } from '../../data/dialogue';
import { registerLayout } from '../../data/layouts';
import { registerObjectives } from '../../data/quests';
import { BOAT_DIALOGUE, BOAT_LAYOUT, CHAPTER2_OBJECTIVES } from './boatData';

registerDialogues(BOAT_DIALOGUE);
registerLayout('boat', BOAT_LAYOUT);
registerObjectives(2, CHAPTER2_OBJECTIVES);

export const CHAPTER2_LOADED = true;
