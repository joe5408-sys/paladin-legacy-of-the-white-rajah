/**
 * Chapter 1 entry point for the chapter loader. Importing this module
 * registers the chapter's dialogue, layouts and objectives.
 */
import { registerDialogues } from '../../data/dialogue';
import { registerLayout } from '../../data/layouts';
import { registerObjectives } from '../../data/quests';
import { CHAPTER1_DIALOGUE, CHAPTER1_OBJECTIVES, WATERFRONT_LAYOUT } from './data';

registerDialogues(CHAPTER1_DIALOGUE);
registerLayout('waterfront', WATERFRONT_LAYOUT);
registerObjectives(1, CHAPTER1_OBJECTIVES);

export const CHAPTER1_LOADED = true;
