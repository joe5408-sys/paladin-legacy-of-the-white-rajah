import { expect, type Page } from '@playwright/test';

/** Walking speed in world units per second (matches PLAYER_SPEED). */
const SPEED = 3.2;

export const testId = (page: Page, id: string) => page.locator(`[data-testid="${id}"]`);

type Pos = { x: number; z: number };
/** Where each page's walks should have left Adrian, so one walk's error is corrected by the next. */
const intended = new WeakMap<Page, { aim: Pos; last: Pos }>();

/**
 * Walks Adrian `units` in one direction (or until something solid blocks him).
 *
 * Runs inside the page, frame by frame, reading his position from the game's
 * `window.__PALADIN__` hook and releasing the key on the frame closest to the target, so
 * a slow machine walks the same distance as a fast one. On a slow machine a frame can move
 * him 0.2 units or more, so the helper also remembers where the walks so far should have left
 * him and aims each walk at that spot plus `units`: errors don't add up over a route. (It
 * starts afresh after a scene change or a blocked walk.) The key events are the same ones the
 * touch controls send. Without the hook it falls back to timing the key press.
 */
export async function walk(page: Page, key: 'KeyW' | 'KeyA' | 'KeyS' | 'KeyD', units: number) {
  const pos = await page.evaluate(() => {
    const p = (window as unknown as { __PALADIN__?: Pos }).__PALADIN__;
    return p ? { x: p.x, z: p.z } : null;
  });
  if (!pos) {
    await page.keyboard.down(key);
    await page.waitForTimeout((units / SPEED) * 1000);
    await page.keyboard.up(key);
    await page.waitForTimeout(150);
    return;
  }
  const axis: 'x' | 'z' = key === 'KeyW' || key === 'KeyS' ? 'z' : 'x';
  const sign = key === 'KeyS' || key === 'KeyD' ? 1 : -1;
  let state = intended.get(page);
  // A new scene (or anything else that moved him): start again from where he is.
  if (!state || Math.abs(pos.x - state.last.x) > 0.3 || Math.abs(pos.z - state.last.z) > 0.3) {
    state = { aim: { ...pos }, last: { ...pos } };
  }
  const other: 'x' | 'z' = axis === 'x' ? 'z' : 'x';
  if (Math.abs(pos[other] - state.aim[other]) > 0.4) state.aim[other] = pos[other];
  const target = state.aim[axis] + sign * units;

  const result = await page.evaluate(
    ({ key, axis, sign, target, units, speed }) =>
      new Promise<{ end: Pos; blocked: boolean; log: string }>((done) => {
        const p = (window as unknown as { __PALADIN__: Pos }).__PALADIN__;
        const start = p[axis];
        const send = (type: string) => window.dispatchEvent(new KeyboardEvent(type, { code: key, key, bubbles: true }));
        const began = performance.now();
        const finish = (why: string) => {
          send('keyup');
          done({
            end: { x: p.x, z: p.z },
            blocked: why === 'blocked',
            log: `${key} ${units}: ${axis} ${start.toFixed(2)} → ${p[axis].toFixed(2)}, aim ${target.toFixed(2)} (${why}, ${Math.round(performance.now() - began)} ms)`,
          });
        };
        const expected = (Math.abs(target - start) / speed) * 1000;
        if ((target - start) * sign <= 0.02) return finish('already there');
        let last = start;
        let lastChange = began;
        let prev = began;
        send('keydown');
        const tick = () => {
          // performance.now(), not the frame's own timestamp (which can be earlier than `began`).
          const now = performance.now();
          const dt = Math.max(16, now - prev); // the expected length of the next frame
          prev = now;
          if (Math.abs(p[axis] - last) > 0.005) {
            last = p[axis];
            lastChange = now;
          }
          const stalled = now - lastChange;
          // Stop on the frame closest to the target: now, if one more frame would overshoot by more.
          if ((target - p[axis]) * sign <= (speed * dt) / 2000) return finish('arrived');
          // Blocked: no progress for a while, once the walk has had its normal time
          // (a slow machine can stall for a moment, e.g. while a new scene starts).
          if ((stalled > 600 && now - began > expected) || stalled > 2500) return finish('blocked');
          if (now - began > expected * 3 + 3000) return finish('timeout');
          requestAnimationFrame(tick);
        };
        requestAnimationFrame(tick);
      }),
    { key, axis, sign, target, units, speed: SPEED },
  );
  state.aim[axis] = result.blocked ? result.end[axis] : target;
  state.last = result.end;
  intended.set(page, state);
  const env = (globalThis as { process?: { env: Record<string, string | undefined> } }).process?.env;
  if (env?.DEBUG_WALK) console.log(result.log);
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
