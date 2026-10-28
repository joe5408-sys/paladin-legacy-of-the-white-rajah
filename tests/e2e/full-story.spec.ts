/**
 * Plays the whole game as it stands, with real keyboard input in a real browser:
 * Chapter 0 from New Game to CHAPTER 0 COMPLETE, all of Chapter 1 (the Kuching
 * waterfront, the Royal Archives, the vault battle, the sealed records), then
 * all of Chapter 2 (the express boat, Sungai Awan, the waystation's stone puzzle
 * and River Ward battle, the hall and the Hollow Warden, then the jetty at dusk
 * and the Iron Warden boss) to the CHAPTER 2 COMPLETE card. Also checks that
 * each chapter's files are only downloaded when the player reaches them.
 */
import { expect, test } from '@playwright/test';
import { arriveIn, expectLocation, finishDialogue, press, testId, trackErrors, walk } from './helpers';

test('full story: Chapters 0, 1 and 2', async ({ page }) => {
  test.setTimeout(480_000); // the whole game, played in real time
  const errors = trackErrors(page);
  const requested: string[] = [];
  page.on('request', (r) => requested.push(r.url()));
  const chapter1Requested = () => requested.some((u) => /\/assets\/(Waterfront|content)-/.test(u));
  const chapter2Requested = () => requested.some((u) => /\/assets\/(Boat|boatData)-/.test(u));
  const waystationRequested = () => requested.some((u) => /\/assets\/Waystation-/.test(u));

  await page.goto('/');
  await page.evaluate(() => localStorage.clear());
  await page.reload();

  // ── Chapter 0 ────────────────────────────────────────
  await testId(page, 'menu-new-game').click();
  await finishDialogue(page);

  // A short first step keeps clear of the bench even if a walk runs long on a slow machine;
  // the last one ends against the house stairs.
  await walk(page, 'KeyW', 0.9);
  await walk(page, 'KeyD', 12.4);
  await walk(page, 'KeyW', 3.0);
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

  // ── Chapter 1.3: the vault and the Hollow Sentinel ─────
  await arriveIn(page, 'Royal Archives — Vault');
  await expect(testId(page, 'objective')).toContainText('Get past the brass figure in the vault.');
  await walk(page, 'KeyW', 2.4);
  await expect(testId(page, 'interaction-prompt')).toContainText('Inspect Brass Figure');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'battle-ui')).toBeVisible();
  await expect(testId(page, 'battle-tip')).toBeVisible({ timeout: 15_000 });
  await expect(testId(page, 'enemy-status')).toContainText('Hollow Sentinel');

  // Defend whenever it charges; the heavy blow is blocked.
  for (const cmd of ['skill', 'skill', 'attack', 'defend', 'attack', 'attack', 'defend', 'attack']) {
    await expect(testId(page, `cmd-${cmd}`)).toBeEnabled({ timeout: 15_000 });
    if (cmd === 'defend') await expect(testId(page, 'enemy-charging')).toBeVisible();
    await testId(page, `cmd-${cmd}`).click();
  }
  await expect(testId(page, 'battle-victory')).toBeVisible({ timeout: 15_000 });
  await expect(testId(page, 'enemy-hp')).toHaveText('0/42');
  await press(page, 'KeyE', 600);
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Open the inner gate.');

  // Past the fallen Sentinel to the inner gate
  await walk(page, 'KeyW', 4.0);
  await expect(testId(page, 'interaction-prompt')).toContainText('Inspect Inner Gate');
  await press(page, 'KeyE');
  await finishDialogue(page);

  // ── Chapter 1.4: the sealed records ────────────────────
  await arriveIn(page, 'Royal Archives — Sealed Records');
  await expect(testId(page, 'objective')).toContainText('Open the VALE box.');
  await walk(page, 'KeyW', 0.8);
  await expect(testId(page, 'interaction-prompt')).toContainText('Inspect VALE Box');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText("Find the Rajah's reply.");

  // The Private Office shelf on the east wall; the letter leads straight into Harrow's arrival.
  await walk(page, 'KeyD', 2.8);
  await walk(page, 'KeyW', 1.3);
  await expect(testId(page, 'interaction-prompt')).toContainText('Inspect Private Office Records');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Escape through the flood door.');

  // In the dark: along the back of the room to the flood door.
  await walk(page, 'KeyW', 2.3);
  await walk(page, 'KeyA', 5.6);
  await expect(testId(page, 'interaction-prompt')).toContainText('Inspect Flood Door');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'chapter1-complete')).toBeVisible({ timeout: 10_000 });

  // ── Chapter 2.1: upriver on the express boat ─────────
  expect(chapter2Requested()).toBe(false); // only downloaded when needed
  await expect(testId(page, 'menu-next-chapter')).toBeEnabled({ timeout: 5_000 });
  await testId(page, 'menu-next-chapter').click();
  await expect(testId(page, 'chapter-card')).toBeVisible();
  await expect(testId(page, 'chapter-card')).toContainText('The River Remembers');
  expect(chapter2Requested()).toBe(true);
  await arriveIn(page, 'Express Boat — Rajang River');
  await expect(testId(page, 'objective')).toContainText('Talk to Aunt Mara.');

  await walk(page, 'KeyS', 0.25);
  await walk(page, 'KeyD', 0.8);
  await expect(testId(page, 'interaction-prompt')).toContainText('Talk to Aunt Mara');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Find out what the other passengers are talking about.');

  await walk(page, 'KeyD', 3.3);
  await walk(page, 'KeyW', 0.3);
  await expect(testId(page, 'interaction-prompt')).toContainText('Talk to Student');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Ask the captain about Sungai Awan.');

  await walk(page, 'KeyD', 1.8);
  await expect(testId(page, 'interaction-prompt')).toContainText('Talk to Captain Ah Hock');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Collect your things from the cabin.');

  await walk(page, 'KeyS', 0.3);
  await walk(page, 'KeyA', 7);
  await expect(testId(page, 'interaction-prompt')).toContainText('Inspect Cabin');
  await press(page, 'KeyE');
  await finishDialogue(page);

  // ── Chapter 2.2: Sungai Awan, changed ─────────────────
  await arriveIn(page, 'Sungai Awan — Village Square');
  await expect(testId(page, 'objective')).toContainText('Read the notice on the village board.');
  await expect(testId(page, 'interaction-prompt')).toContainText('Inspect Notice Board');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Talk to Uncle Lim at the kedai.');

  // West along the boardwalk, south between the clinic and the crates, to the kedai.
  await walk(page, 'KeyA', 5.4);
  await walk(page, 'KeyS', 5.9);
  await walk(page, 'KeyA', 1.2);
  await expect(testId(page, 'interaction-prompt')).toContainText('Talk to Uncle Lim');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Find the man in charge of the survey.');

  // Back east across the square, up to the boardwalk, along to the survey boat.
  await walk(page, 'KeyD', 7.4);
  await walk(page, 'KeyW', 5.9);
  await walk(page, 'KeyD', 5.8);
  await expect(testId(page, 'interaction-prompt')).toContainText('Talk to Survey Manager');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Go home to Aunt Mara.');

  // Step back from Pell, round the east side of the Vale house to its front stairs.
  await walk(page, 'KeyS', 1.0);
  await walk(page, 'KeyD', 2.4);
  await walk(page, 'KeyS', 6.2);
  await walk(page, 'KeyA', 3.4);
  await expect(testId(page, 'interaction-prompt')).toContainText('Enter Vale Family Home');
  await press(page, 'KeyE');
  await arriveIn(page, 'Vale Family Home', false);
  await page.waitForTimeout(1200); // no arrival speech here: wait out the fade-in before walking
  await walk(page, 'KeyW', 2.3);
  await walk(page, 'KeyD', 1.8);
  await expect(testId(page, 'interaction-prompt')).toContainText('Talk to Aunt Mara');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText("Look behind Elias's portrait.");
  await walk(page, 'KeyA', 1.8);
  await walk(page, 'KeyW', 1.6);
  await expect(testId(page, 'interaction-prompt')).toContainText("Inspect Elias's Portrait");
  await press(page, 'KeyE');
  await finishDialogue(page); // the map, then straight on upriver with Ah Hock

  // ── Chapter 2.3: the waystation ───────────────────────
  expect(waystationRequested()).toBe(false);
  await arriveIn(page, 'The Waystation Landing');
  expect(waystationRequested()).toBe(true);
  await expect(testId(page, 'objective')).toContainText('Wake the three stones in the right order.');

  // The deep stone, in its pool by the water (round Aunt Mara).
  await walk(page, 'KeyW', 0.5);
  await walk(page, 'KeyD', 3.6);
  await walk(page, 'KeyS', 0.6);
  await walk(page, 'KeyD', 1.0);
  await expect(testId(page, 'interaction-prompt')).toContainText('Touch Stone by the Water');
  await press(page, 'KeyE');
  await finishDialogue(page);

  // The bright stone, in the sunbeam on the far side of the terrace.
  await walk(page, 'KeyA', 1.0);
  await walk(page, 'KeyW', 3.65);
  await walk(page, 'KeyA', 8.0);
  await expect(testId(page, 'interaction-prompt')).toContainText('Touch Sunlit Stone');
  await press(page, 'KeyE');
  await finishDialogue(page);

  // The one that waits, beside the door: the door opens and the spirit steps out.
  await walk(page, 'KeyD', 1.0);
  await walk(page, 'KeyW', 2.5);
  await walk(page, 'KeyD', 5.5);
  await expect(testId(page, 'interaction-prompt')).toContainText('Touch Stone by the Door');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'battle-ui')).toBeVisible();
  await expect(testId(page, 'battle-tip')).toBeVisible({ timeout: 15_000 });
  await expect(testId(page, 'enemy-status')).toContainText('Spirit of the Waystation');
  await expect(testId(page, 'cmd-ward')).toBeVisible();

  // River Ward against the first wave, then keep attacking.
  for (const cmd of ['skill', 'skill', 'ward', 'attack', 'attack', 'attack', 'attack']) {
    await expect(testId(page, `cmd-${cmd}`)).toBeEnabled({ timeout: 15_000 });
    if (cmd === 'ward') await expect(testId(page, 'enemy-charging')).toBeVisible();
    await testId(page, `cmd-${cmd}`).click();
    if (cmd === 'ward') {
      await expect(testId(page, 'warded')).toBeVisible();
      await page.screenshot({ path: 'test-results/waystation-river-ward.png' });
    }
  }
  await expect(testId(page, 'battle-victory')).toBeVisible({ timeout: 15_000 });
  await expect(testId(page, 'enemy-hp')).toHaveText('0/42');
  await press(page, 'KeyE', 600);
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Search the waystation.');

  // ── Chapter 2.4: the River Charter ─────────────────────
  await walk(page, 'KeyW', 1.0);
  await expect(testId(page, 'interaction-prompt')).toContainText('Enter Waystation');
  await press(page, 'KeyE');
  await arriveIn(page, 'The Waystation');

  // Elias's journal on the desk (west), then the Charter case (east).
  await walk(page, 'KeyW', 2.5);
  await walk(page, 'KeyA', 2.2);
  await expect(testId(page, 'interaction-prompt')).toContainText("Inspect Elias's Journal");
  await press(page, 'KeyE');
  await finishDialogue(page);
  await walk(page, 'KeyD', 4.4);
  await expect(testId(page, 'interaction-prompt')).toContainText('Inspect Sealed Case');
  await press(page, 'KeyE');
  for (let i = 0; i < 4; i++) await press(page, 'Enter', 400); // into the Charter text
  await page.screenshot({ path: 'test-results/waystation-hall.png' });
  await finishDialogue(page); // the Charter, then Daniel, then out onto the landing

  // The Hollow Warden climbs out of the river.
  await expectLocation(page, 'The Waystation Landing');
  await expect(testId(page, 'dialogue-box')).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'test-results/waystation-warden.png' });
  await finishDialogue(page);
  await expect(testId(page, 'battle-ui')).toBeVisible();
  await expect(testId(page, 'enemy-status')).toContainText('Hollow Warden');
  // Defend the heavy blows; River Ward once Adrian is hurt.
  for (const cmd of ['skill', 'skill', 'attack', 'defend', 'attack', 'ward', 'defend', 'attack', 'attack', 'defend', 'attack']) {
    await expect(testId(page, `cmd-${cmd}`)).toBeEnabled({ timeout: 15_000 });
    if (cmd === 'defend') await expect(testId(page, 'enemy-charging')).toBeVisible();
    await testId(page, `cmd-${cmd}`).click();
  }
  await expect(testId(page, 'battle-victory')).toBeVisible({ timeout: 15_000 });
  await expect(testId(page, 'enemy-hp')).toHaveText('0/48');
  await expect(testId(page, 'player-hp')).toHaveText('12/30');
  await press(page, 'KeyE', 600);
  await finishDialogue(page); // the plate in its chest, then the race downriver

  // ── Milestone 2.5: the jetty at dusk ─────────────────
  await expectLocation(page, 'Sungai Awan — The Jetty at Dusk');
  await expect(testId(page, 'dialogue-box')).toBeVisible({ timeout: 10_000 });
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Confront Julian Pell at the barge.');
  await page.screenshot({ path: 'test-results/jetty-dusk.png' });
  // Let the game hand control back after the arrival speech (one live run's walk was lost here).
  await page.waitForTimeout(600);
  // East along the boardwalk, past the villagers, to Pell at the gangway.
  await walk(page, 'KeyD', 15.6);
  await expect(testId(page, 'interaction-prompt')).toContainText('Julian Pell');
  await press(page, 'KeyE');
  await finishDialogue(page);

  // The Iron Warden: break the armour, ward the first heavy blow, defend the next.
  await expect(testId(page, 'battle-ui')).toBeVisible();
  await expect(testId(page, 'enemy-status')).toContainText('Iron Warden');
  await expect(testId(page, 'enemy-armored')).toBeVisible();
  for (const cmd of ['skill', 'skill', 'attack', 'ward', 'attack', 'attack', 'defend', 'attack', 'attack']) {
    await expect(testId(page, `cmd-${cmd}`)).toBeEnabled({ timeout: 15_000 });
    if (cmd === 'ward' || cmd === 'defend') await expect(testId(page, 'enemy-charging')).toBeVisible();
    if (cmd === 'attack') await expect(testId(page, 'enemy-armored')).toHaveCount(0);
    await testId(page, `cmd-${cmd}`).click();
  }
  await expect(testId(page, 'battle-victory')).toBeVisible({ timeout: 15_000 });
  await expect(testId(page, 'enemy-hp')).toHaveText('0/50');
  await expect(testId(page, 'player-hp')).toHaveText('13/30');
  await press(page, 'KeyE', 600);
  await finishDialogue(page);
  await expect(testId(page, 'chapter2-complete')).toBeVisible({ timeout: 10_000 });
  await expect(testId(page, 'menu-next-chapter')).toBeVisible(); // Chapter 3 is played in chapter3.spec.ts

  // The end is saved; after a refresh, Continue says so.
  await page.waitForTimeout(500);
  await page.reload();
  await expect(testId(page, 'menu-continue')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('.menu-hint')).toContainText('Chapter 2 complete');

  expect(errors).toEqual([]);
});
