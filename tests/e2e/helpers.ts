import { expect, type Page } from '@playwright/test';

/** Walking speed in world units per second (matches PLAYER_SPEED). */
const SPEED = 3.2;

export const testId = (page: Page, id: string) => page.locator(`[data-testid="${id}"]`);

/** Holds a movement key long enough to cover `units` of distance. */
export async function walk(page: Page, key: 'KeyW' | 'KeyA' | 'KeyS' | 'KeyD', units: number) {
  await page.keyboard.down(key);
  await page.waitForTimeout((units / SPEED) * 1000);
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
