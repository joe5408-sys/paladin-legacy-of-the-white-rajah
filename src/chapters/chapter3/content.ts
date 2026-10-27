/**
 * Chapter 3 entry point for the chapter loader. Importing this module
 * registers the chapter's dialogue, layouts and objectives.
 */
import { registerDialogues } from '../../data/dialogue';
import { registerLayout } from '../../data/layouts';
import { registerObjectives } from '../../data/quests';
import { BOAT_NIGHT_DIALOGUE, BOAT_NIGHT_LAYOUT, CHAPTER3_OBJECTIVES } from './boatNightData';
import { KUCHING_DIALOGUE, ROOM_LAYOUT, WATERFRONT_NIGHT_LAYOUT } from './kuchingData';
import { GATE_DIALOGUE, GATE_LAYOUT } from './palaceData';
import { HALL3_LAYOUT, HEARING_DIALOGUE } from './audienceData';

registerDialogues(BOAT_NIGHT_DIALOGUE);
registerLayout('boat_night', BOAT_NIGHT_LAYOUT);
registerDialogues(KUCHING_DIALOGUE);
registerLayout('waterfront_night', WATERFRONT_NIGHT_LAYOUT);
registerLayout('jamilah_room', ROOM_LAYOUT);
registerDialogues(GATE_DIALOGUE);
registerLayout('palace_gate', GATE_LAYOUT);
registerDialogues(HEARING_DIALOGUE);
registerLayout('audience_hall', HALL3_LAYOUT);
registerObjectives(3, CHAPTER3_OBJECTIVES);

export const CHAPTER3_LOADED = true;
