/**
 * Minimal linear quest logic. The active objective is derived from story flags
 * (the first objective not yet complete), so there is no separate quest state
 * to save or keep in sync, and completed objectives can never re-trigger.
 * Side quests or branches can later become additional objective lists.
 */
import { OBJECTIVES_BY_CHAPTER, type Objective } from '../../data/quests';
import type { StoryFlags } from '../core/flags';

export function currentObjectiveIndex(objectives: readonly Objective[], flags: StoryFlags): number {
  const i = objectives.findIndex((o) => !flags[o.completeWhen]);
  return i === -1 ? objectives.length : i;
}

/** The objective to show, or null when the list is finished. */
export function currentObjective(objectives: readonly Objective[], flags: StoryFlags): Objective | null {
  return objectives[currentObjectiveIndex(objectives, flags)] ?? null;
}

/** The chapter the story is currently in, from story flags. */
export function activeChapter(flags: StoryFlags): number {
  return flags.chapter1_started ? 1 : 0;
}

/** Objectives for the current chapter (empty if that chapter's content isn't loaded). */
export function objectivesFor(flags: StoryFlags): readonly Objective[] {
  return OBJECTIVES_BY_CHAPTER[activeChapter(flags)] ?? [];
}

/** True when the story sits on a chapter's closing card. */
export function isAtChapterEnd(flags: StoryFlags): boolean {
  if (flags.chapter1_started) return !!flags.c1_archives_reached;
  return !!flags.prologue_complete;
}
