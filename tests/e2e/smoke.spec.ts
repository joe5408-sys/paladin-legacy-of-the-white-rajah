import { expect, test } from '@playwright/test';
import { arriveIn, expectLocation, finishDialogue, press, testId, trackErrors, walk } from './helpers';

test.beforeEach(async ({ page }) => {
  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();
});

test('title screen, settings, new game, pause, save and continue', async ({ page }) => {
  const errors = trackErrors(page);

  // Title: no save yet, so no Continue.
  await expect(testId(page, 'title-screen')).toBeVisible();
  await expect(testId(page, 'menu-continue')).toHaveCount(0);

  // Settings persist.
  await testId(page, 'menu-settings').click();
  await testId(page, 'menu-text-speed').click(); // Normal → Fast
  await expect(testId(page, 'menu-text-speed')).toContainText('Fast');
  expect(await page.evaluate(() => localStorage.getItem('paladin.settings'))).toContain('"fast"');
  await press(page, 'Escape');

  // New Game → opening narration over a rendered 3D scene.
  await testId(page, 'menu-new-game').click();
  await expect(page.locator('canvas')).toBeVisible();
  await expect(testId(page, 'dialogue-box')).toBeVisible();
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Find the ancestral family home.');

  // Walk to the family home: north to the path, east, then up to the stairs.
  // A short first step keeps clear of the bench even if a walk runs long on a slow machine;
  // the last one ends against the house stairs.
  await walk(page, 'KeyW', 0.9);
  await walk(page, 'KeyD', 12.4);
  await walk(page, 'KeyW', 3.0);
  await expect(testId(page, 'interaction-prompt')).toContainText('Enter Vale Family Home');
  await press(page, 'KeyE');
  await arriveIn(page, 'Vale Family Home');
  // Arriving autosaved a checkpoint in the house.
  expect(await page.evaluate(() => JSON.parse(localStorage.getItem('paladin.save') ?? '{}').scene)).toBe('home');

  // Pause → Save → back to the title → Continue restores the house.
  await press(page, 'Escape', 300);
  await expect(testId(page, 'pause-menu')).toBeVisible();
  await testId(page, 'menu-save').click();
  await expect(testId(page, 'save-status')).toHaveText('Game saved.');
  await testId(page, 'menu-title').click();
  await testId(page, 'menu-confirm').click();
  await expect(testId(page, 'title-screen')).toBeVisible();

  await page.reload();
  await expect(testId(page, 'menu-continue')).toBeVisible();
  await testId(page, 'menu-continue').click();
  await expectLocation(page, 'Vale Family Home');
  await expect(testId(page, 'objective')).toContainText('Speak with Aunt Mara.');

  expect(errors).toEqual([]);
});

test('corrupt save data does not crash the game', async ({ page }) => {
  const errors = trackErrors(page);
  await page.evaluate(() => localStorage.setItem('paladin.save', '{"schemaVersion":1,"scene":'));
  await page.reload();
  await expect(testId(page, 'title-screen')).toBeVisible();
  await expect(testId(page, 'menu-continue')).toHaveCount(0);
  await expect(testId(page, 'save-warning')).toBeVisible();
  expect(errors).toEqual([]);
});
