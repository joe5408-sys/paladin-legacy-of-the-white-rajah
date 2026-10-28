import { expect, type Page } from '@playwright/test';

/** Walking speed in world units per second (matches PLAYER_SPEED). */
const SPEED = 3.2;

export const testId = (page: Page, id: string) => page.locator(`[data-testid="${id}"]`);

type Pos = { x: number; z: number };
const position = (page: Page) =>
  page.evaluate(() => {
    const p = (window as unknown as { __PALADIN__?: Pos }).__PALADIN__;
    return p ? { x: p.x, z: p.z } : null;
  });

/**
 * Holds a movement key until Adrian has walked `units` (or is blocked by something solid).
 * Reads his position from the game's `window.__PALADIN__` hook, so slow machines walk
 * the same distance as fast ones; falls back to timing the key press without it.
 */
export async function walk(page: Page, key: 'KeyW' | 'KeyA' | 'KeyS' | 'KeyD', units: number) {
  const axis = key === 'KeyW' || key === 'KeyS' ? 'z' : 'x';
  const start = await position(page);
  await page.keyboard.down(key);
  if (!start) {
    await page.waitForTimeout((units / SPEED) * 1000);
  } else {
    const began = Date.now();
    const limit = (units / SPEED) * 3000 + 2000;
    let last = start[axis];
    let lastChange = began;
    for (;;) {
      await page.waitForTimeout(15);
      const p = (await position(page)) ?? start;
      const now = Date.now();
      if (Math.abs(p[axis] - start[axis]) >= units - 0.08) break; // far enough
      if (Math.abs(p[axis] - last) > 0.005) {
        last = p[axis];
        lastChange = now;
      }
      const started = last !== start[axis];
      // Blocked: no progress for a while (allow longer before the first step, e.g. a fade).
      if (now - lastChange > (started ? 500 : 2000)) break;
      if (now - began > limit) break;
    }
  }
  await page.keyboard.up(key);
  await page.waitForTimeout(150);
}

export async function press(page: Page, key: string, wait = 150) {
  await page.keyboard.press(key);
  await page.waitForTimeout(wait);
}

/** Presses Enter until no dialogue box is open (also skips typewriter text). */
export async function finishDialogue(page: Page) {
  const box = testId(page, 'dialogue-box');
  for (let i = 0; i < 150 && (await box.count()) > 0; i++) await press(page, 'Enter', 100);
  await expect(box).toHaveCount(0);
  // Give the game a moment to return to exploring: on slow machines a walk started at once can be lost.
  await page.waitForTimeout(400);
}

/** Waits until the given location label is showing (scene changes fade for ~0.7s). */
export async function expectLocation(page: Page, name: string) {
  await expect(testId(page, 'location')).toHaveText(name, { timeout: 15_000 });
}

/** Collects console errors and uncaught page errors for later assertions. */
export function trackErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(`pageerror: ${e.message}`));
  page.on('console', (m) => {
    if (m.type() === 'error') errors.push(`console: ${m.text()}`);
  });
  return errors;
}

/**
 * After a scene change: waits for the new location and, on a first visit, for the
 * arrival conversation (it opens only once the fade-in finishes), then plays it out.
 */
export async function arriveIn(page: Page, name: string, withArrivalDialogue = true) {
  await expectLocation(page, name);
  if (withArrivalDialogue) {
    await expect(testId(page, 'dialogue-box')).toBeVisible({ timeout: 10_000 });
    await finishDialogue(page);
  }
}
