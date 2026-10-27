/**
 * Chapter 3 — the express boat overnight down the Rajang (lazy-loaded scene).
 * The Chapter 2 boat with night lighting: moonlight, a deck lamp, lit cabin
 * windows and lamplit longhouses drifting past on the far bank.
 */
import type { SpawnPoint } from '../../data/scenes';
import { BoatScene } from '../chapter2/Boat';
import { BOAT_NIGHT_LAYOUT } from './boatNightData';

export default function BoatNight({ spawn }: { spawn: SpawnPoint }) {
  return <BoatScene spawn={spawn} layout={BOAT_NIGHT_LAYOUT} time="night" />;
}
