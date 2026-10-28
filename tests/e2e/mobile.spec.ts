/**
 * Phones and tablets: plays the opening of the game on a phone-sized touch
 * screen held sideways, using only taps and the on-screen joystick. Checks the
 * title menu, tapping through dialogue, walking with the joystick, the action
 * button, the menu button, and the "turn your phone sideways" notice.
 */
import { expect, test, type Page } from '@playwright/test';
import { expectLocation, testId, trackErrors } from './helpers';

test.use({ viewport: { width: 844, height: 390 }, hasTouch: true, isMobile: true });

const SPEED = 3.2; // world units per second, as in helpers.ts

/** Taps the dialogue box until the conversation is over. */
async function tapThroughDialogue(page: Page) {
  const box = testId(page, 'dialogue-box');
  for (let i = 0; i < 150 && (await box.count()) > 0; i++) {
    await box.tap({ force: true }).catch(() => undefined); // it may vanish mid-tap
    await page.waitForTimeout(100);
  }
  await expect(box).toHaveCount(0);
}

/** Pushes the joystick in a direction long enough to cover the given distance. */
async function stick(page: Page, dir: 'up' | 'down' | 'left' | 'right', units: number) {
  const box = (await testId(page, 'touch-joystick').boundingBox())!;
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  const r = box.width * 0.4;
  const [dx, dy] = { up: [0, -r], down: [0, r], left: [-r, 0], right: [r, 0] }[dir];
  await page.mouse.move(cx, cy);
  await page.mouse.down();
  // One step, so the walk starts when the timer does (several steps add walking time on slow machines).
  await page.mouse.move(cx + dx, cy + dy);
  await page.waitForTimeout((units / SPEED) * 1000);
  await page.mouse.up();
  await page.waitForTimeout(150);
}

test('mobile: the opening, played with touch controls', async ({ page }) => {
  test.setTimeout(120_000);
  const errors = trackErrors(page);
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // Title: touch wording, tappable menu
  await expect(page.locator('.title-controls')).toContainText('Tap to choose');
  await testId(page, 'menu-new-game').tap();
  await expect(testId(page, 'dialogue-box')).toBeVisible({ timeout: 10_000 });
  await tapThroughDialogue(page);

  // Touch controls while exploring; no keyboard hint
  await expect(testId(page, 'touch-joystick')).toBeVisible();
  await expect(testId(page, 'touch-action')).toBeVisible();
  await expect(testId(page, 'touch-menu')).toBeVisible();
  await expect(page.locator('.hud-controls')).toHaveCount(0);
  await page.screenshot({ path: 'test-results/mobile-explore.png' });

  // Walk to the family home with the joystick (the keyboard test's route, with more room
  // for a push that runs long on a slow machine: a short first push keeps clear of the
  // bench, and the last one ends against the house stairs).
  await stick(page, 'up', 0.9);
  await stick(page, 'right', 12.4);
  await stick(page, 'up', 3.0);
  await expect(testId(page, 'interaction-prompt')).toContainText('Tap');
  await expect(testId(page, 'touch-action')).toHaveClass(/ready/);
  await testId(page, 'touch-action').tap();
  await expectLocation(page, 'Vale Family Home');
  await expect(testId(page, 'dialogue-box')).toBeVisible({ timeout: 10_000 });
  await page.screenshot({ path: 'test-results/mobile-dialogue.png' });
  await tapThroughDialogue(page);

  // The menu button opens the pause menu
  await testId(page, 'touch-menu').tap();
  await expect(testId(page, 'menu-resume')).toBeVisible();
  await page.waitForTimeout(300); // let the fade-in finish
  await page.screenshot({ path: 'test-results/mobile-pause.png' });
  await testId(page, 'menu-resume').tap();
  await expect(testId(page, 'menu-resume')).toHaveCount(0);
  await expect(testId(page, 'touch-joystick')).toBeVisible();

  // Held upright, a phone asks to be turned sideways (and can play anyway)
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(testId(page, 'rotate-notice')).toBeVisible();
  await page.screenshot({ path: 'test-results/mobile-portrait.png' });
  await page.getByRole('button', { name: 'Play anyway' }).tap();
  await expect(testId(page, 'rotate-notice')).toHaveCount(0);

  expect(errors).toEqual([]);
});
