/**
 * Minimal linear quest logic. The active objective is derived from story flags
 * (the first objective not yet complete), so there is no separate quest state
 * to save or keep in sync, and completed objectives can never re-trigger.
 * Side quests or branches can later become additional objective lists.
 */
import type { Objective } from '../../data/quests';
import type { StoryFlags } from '../core/flags';

export function currentObjectiveIndex(objectives: readonly Objective[], flags: StoryFlags): number {
  const i = objectives.findIndex((o) => !flags[o.completeWhen]);
  return i === -1 ? objectives.length : i;
}

/** The objective to show, or null when the list is finished. */
export function currentObjective(objectives: readonly Objective[], flags: StoryFlags): Objective | null {
  return objectives[currentObjectiveIndex(objectives, flags)] ?? null;
}
