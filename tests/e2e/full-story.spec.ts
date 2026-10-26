/**
 * Plays the whole game as it stands, with real keyboard input in a real browser:
 * Chapter 0 from New Game to CHAPTER 0 COMPLETE, then Chapter 1 (Milestones 1.1–1.2:
 * the Kuching waterfront and the Royal Archives) to its "to be continued" card. Also checks that Chapter 1 is only downloaded
 * when the player reaches it.
 */
import { expect, test } from '@playwright/test';
import { arriveIn, expectLocation, finishDialogue, press, testId, trackErrors, walk } from './helpers';

test('full story: Chapter 0 and Chapter 1 milestones 1.1–1.2', async ({ page }) => {
  const errors = trackErrors(page);
  const requested: string[] = [];
  page.on('request', (r) => requested.push(r.url()));
  const chapter1Requested = () => requested.some((u) => /\/assets\/(Waterfront|content)-/.test(u));

  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // ── Chapter 0 ────────────────────────────────────────
  await testId(page, 'menu-new-game').click();
  await finishDialogue(page);

  await walk(page, 'KeyW', 1.6);
  await walk(page, 'KeyD', 12.8);
  await walk(page, 'KeyW', 2.4);
  await press(page, 'KeyE');
  await arriveIn(page, 'Vale Family Home');

  // Aunt Mara
  await walk(page, 'KeyD', 2.6);
  await walk(page, 'KeyW', 3.5);
  await expect(testId(page, 'interaction-prompt')).toContainText('Talk to Aunt Mara');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Inspect the heirloom.');

  // Heirloom → passage opens
  await walk(page, 'KeyA', 5.2);
  await walk(page, 'KeyW', 2.5);
  await expect(testId(page, 'interaction-prompt')).toContainText('Touch Heirloom');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Enter the ancient chamber.');

  await walk(page, 'KeyS', 1.5);
  await walk(page, 'KeyA', 0.3);
  await expect(testId(page, 'interaction-prompt')).toContainText('Enter Hidden Passage');
  await press(page, 'KeyE');
  await arriveIn(page, 'Ancient Chamber');

  // The Guardian
  await walk(page, 'KeyW', 2.2);
  await expect(testId(page, 'interaction-prompt')).toContainText('Inspect Paladin Sign');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'battle-ui')).toBeVisible();

  // Pausing in battle: Save is unavailable.
  await press(page, 'Escape', 300);
  await expect(testId(page, 'menu-save')).toBeDisabled();
  await press(page, 'Escape', 300);

  for (const cmd of ['skill', 'skill', 'attack']) {
    await expect(testId(page, `cmd-${cmd}`)).toBeEnabled({ timeout: 15_000 });
    await testId(page, `cmd-${cmd}`).click();
  }
  await expect(testId(page, 'battle-victory')).toBeVisible({ timeout: 15_000 });
  await expect(testId(page, 'enemy-hp')).toHaveText('0/24');
  await press(page, 'KeyE', 600);
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Read the ancestral message.');

  // Inscription → Daniel → Chapter 0 complete
  await walk(page, 'KeyW', 5.4);
  await expect(testId(page, 'interaction-prompt')).toContainText('Inspect Glowing Inscription');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'chapter-complete')).toBeVisible();
  await expect(page.getByText('Chapter 0 Complete')).toBeVisible();

  // Chapter 1 must not have been downloaded yet.
  expect(chapter1Requested()).toBe(false);

  // ── Chapter 1 ────────────────────────────────────────
  await expect(testId(page, 'menu-next-chapter')).toBeEnabled({ timeout: 5_000 });
  await testId(page, 'menu-next-chapter').click();
  await expect(testId(page, 'chapter-card')).toBeVisible();
  await expect(testId(page, 'chapter-card')).toContainText("The Capital's Shadow");
  expect(chapter1Requested()).toBe(true);

  await expect(testId(page, 'dialogue-box')).toBeVisible({ timeout: 10_000 });
  await expectLocation(page, 'Kuching — Waterfront');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Meet Daniel at the ferry pier.');

  // To the pier: east, then north up the promenade.
  await walk(page, 'KeyD', 2);
  await walk(page, 'KeyW', 8.5);
  await expect(testId(page, 'interaction-prompt')).toContainText('Talk to Daniel');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Go to the Royal Archives.');

  // To the Archives: back south a little, west along the plaza, then up to the doors.
  await walk(page, 'KeyS', 3.2);
  await walk(page, 'KeyA', 10.5);
  await walk(page, 'KeyW', 1.5);
  await expect(testId(page, 'interaction-prompt')).toContainText('Inspect Royal Archives');
  await press(page, 'KeyE');
  await finishDialogue(page);

  // ── Chapter 1.2: inside the Royal Archives ─────────────
  await arriveIn(page, 'Royal Archives');
  await expect(testId(page, 'objective')).toContainText('Find the treason records.');

  // The Archivist, across her desk
  await walk(page, 'KeyW', 1.6);
  await expect(testId(page, 'interaction-prompt')).toContainText('Talk to the Archivist');
  await press(page, 'KeyE');
  await finishDialogue(page);

  // Treason Proceedings (east stacks, back)
  await walk(page, 'KeyD', 3.4);
  await walk(page, 'KeyW', 2.0);
  await expect(testId(page, 'interaction-prompt')).toContainText('Inspect Treason Proceedings');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Ask the Archivist about the missing folder.');

  // Back to the Archivist for the hint
  await walk(page, 'KeyS', 1.75);
  await walk(page, 'KeyA', 3.4);
  await expect(testId(page, 'interaction-prompt')).toContainText('Talk to the Archivist');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Search the household ledgers.');

  // Household Ledgers (west stacks, front): the hidden Vale file
  await walk(page, 'KeyS', 1.6);
  await walk(page, 'KeyA', 3.4);
  await expect(testId(page, 'interaction-prompt')).toContainText('Inspect Household Ledgers');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Investigate the iron door.');

  // The iron door at the back of the hall
  await walk(page, 'KeyD', 1.9);
  await walk(page, 'KeyW', 6.2);
  await walk(page, 'KeyD', 1.5);
  await expect(testId(page, 'interaction-prompt')).toContainText('Inspect Iron Door');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'to-be-continued')).toBeVisible({ timeout: 10_000 });

  // The cliffhanger is saved; after a refresh, Continue says so.
  await page.waitForTimeout(500);
  await page.reload();
  await expect(testId(page, 'menu-continue')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('.menu-hint')).toContainText('Chapter 1');

  expect(errors).toEqual([]);
});
