/**
 * Loads a chapter's content on demand, so later chapters are not part of the
 * initial download. Loading registers the chapter's dialogue, layouts and
 * objectives with the shared registries. Safe to call repeatedly.
 */
import type { StoryFlag } from '../game/core/flags';

const loaded = new Map<number, Promise<void>>();

export function loadChapter(chapter: number): Promise<void> {
  let p = loaded.get(chapter);
  if (!p) {
    switch (chapter) {
      case 1:
        p = import('./chapter1/content').then(() => undefined);
        break;
      case 2:
        p = import('./chapter2/content').then(() => undefined);
        break;
      case 3:
        p = import('./chapter3/content').then(() => undefined);
        break;
      default:
        p = Promise.resolve(); // chapter 0 is built in
    }
    // A failed load (e.g. offline) can be retried later.
    p.catch(() => loaded.delete(chapter));
    loaded.set(chapter, p);
  }
  return p;
}

/** Chapters a save or flag list needs before it can be validated or played. */
export function chaptersNeededFor(flags: readonly string[]): number[] {
  if (flags.includes('chapter3_started' satisfies StoryFlag)) return [3];
  if (flags.includes('chapter2_started' satisfies StoryFlag)) return [2];
  return flags.includes('chapter1_started' satisfies StoryFlag) ? [1] : [];
}

export async function loadChaptersFor(flags: readonly string[]): Promise<void> {
  await Promise.all(chaptersNeededFor(flags).map(loadChapter));
}

/** Whether a newer chapter exists to continue into after the given one. */
export function hasChapterAfter(chapter: number): boolean {
  return chapter === 0 || chapter === 1 || chapter === 2;
}
