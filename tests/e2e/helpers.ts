import { expect, type Page } from '@playwright/test';

/** Walking speed in world units per second (matches PLAYER_SPEED). */
const SPEED = 3.2;

export const testId = (page: Page, id: string) => page.locator(`[data-testid="${id}"]`);

/**
 * Holds a movement key until Adrian has walked `units` (or is blocked by something solid).
 * Runs inside the page, frame by frame, reading his position from the game's
 * `window.__PALADIN__` hook, so a slow machine walks the same distance as a fast one. The
 * key events are the same ones the touch controls send. Falls back to timing the key press
 * when the hook is missing.
 */
export async function walk(page: Page, key: 'KeyW' | 'KeyA' | 'KeyS' | 'KeyD', units: number) {
  const hooked = await page.evaluate(() => !!(window as unknown as { __PALADIN__?: unknown }).__PALADIN__);
  if (!hooked) {
    await page.keyboard.down(key);
    await page.waitForTimeout((units / SPEED) * 1000);
    await page.keyboard.up(key);
    await page.waitForTimeout(150);
    return;
  }
  const result = await page.evaluate(
    ({ key, units, speed }) =>
      new Promise<string>((done) => {
        const p = (window as unknown as { __PALADIN__: { x: number; z: number } }).__PALADIN__;
        const axis = key === 'KeyW' || key === 'KeyS' ? 'z' : 'x';
        const start = p[axis];
        const send = (type: string) => window.dispatchEvent(new KeyboardEvent(type, { code: key, key, bubbles: true }));
        const began = performance.now();
        let last = start;
        let lastChange = began;
        let prev = began;
        send('keydown');
        const tick = (now: number) => {
          const dt = now - prev;
          prev = now;
          const moved = Math.abs(p[axis] - start);
          if (Math.abs(p[axis] - last) > 0.005) {
            last = p[axis];
            lastChange = now;
          }
          const stalled = now - lastChange;
          // Far enough (allowing for about half a frame more), or blocked once the walk has
          // had its normal time (a slow machine can stall for a moment, e.g. in a new scene).
          const arrived = moved + (speed * dt) / 2000 >= units;
          const blocked = (stalled > 600 && now - began > (units / speed) * 1000) || stalled > 2500;
          if (arrived || blocked || now - began > (units / speed) * 3000 + 3000) {
            send('keyup');
            done(`${key} ${units}: ${axis} ${start.toFixed(2)} → ${p[axis].toFixed(2)} (${arrived ? 'arrived' : blocked ? 'blocked' : 'timeout'}, ${Math.round(now - began)} ms)`);
          } else requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    { key, units, speed: SPEED },
  );
  const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env;
  if (env?.DEBUG_WALK) console.log(result);
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
