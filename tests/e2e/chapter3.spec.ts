/**
 * Chapter 3 so far, with real keyboard input in a real browser. Starts from a
 * saved game on the Chapter 2 Complete card (the full-story test plays every
 * chapter before that), continues into Chapter 3, and plays Milestones 3.1 (the
 * night boat to Kuching) and 3.2 (the waterfront before dawn, Kak Jamilah's
 * room, and Pell's choice, picked with the keyboard) and 3.3 (the Palace
 * forecourt and the first Crowned Sentinel fight, which ends when it withdraws)
 * and 3.4 (the hearing: one wrong piece of evidence, then the right one for each
 * of Harrow's claims, chosen with the mouse) and 3.5 (the ruling, the final
 * Crowned Sentinel battle in three phases, the Charter registered, the epilogue
 * at Sungai Awan) to the Chapter 3 Complete card. Also checks that Chapter 3's
 * files are only downloaded when needed.
 */
import { expect, test } from '@playwright/test';
import { arriveIn, finishDialogue, press, testId, trackErrors, walk } from './helpers';

const CHAPTER2_DONE = [
  'arrived', 'entered_home', 'met_mara', 'heirloom_awakened', 'passage_open', 'entered_chamber',
  'guardian_defeated', 'read_message', 'daniel_arrived', 'met_daniel', 'prologue_complete',
  'chapter1_started', 'c1_arrived', 'c1_met_daniel', 'c1_archives_reached', 'c1_entered_archives',
  'c1_met_archivist', 'c1_clue_gap', 'c1_hint_household', 'c1_file_found', 'c1_vault_found',
  'c1_entered_vault', 'c1_sentinel_defeated', 'c1_inner_gate_open', 'c1_entered_records',
  'c1_box_read', 'c1_letter_found', 'c1_security_arrived', 'c1_lights_out', 'c1_escaped',
  'chapter2_started', 'c2_arrived', 'c2_talked_mara', 'c2_saw_news', 'c2_talked_captain', 'c2_reached_jetty',
  'c2_village_arrived', 'c2_read_notice', 'c2_talked_lim', 'c2_met_pell', 'c2_home_talked', 'c2_found_map',
  'c2_went_upriver', 'c2_landing_arrived', 'c2_stone_deep', 'c2_stone_bright', 'c2_stones_woken',
  'c2_spirit_defeated', 'c2_learned_ward', 'c2_entered_hall', 'c2_read_journal', 'c2_found_charter',
  'c2_daniel_returned', 'c2_warden_seen', 'c2_warden_defeated', 'c2_dusk_arrived', 'c2_iron_seen', 'c2_iron_defeated',
];

test('Chapter 3: the night boat, the waterfront, Pell\'s choice, the Palace gate, the hearing, the finale', async ({ page }) => {
  test.setTimeout(420_000);
  const errors = trackErrors(page);
  const requested: string[] = [];
  page.on('request', (r) => requested.push(r.url()));
  const chapter3Requested = () => requested.some((u) => /\/assets\/(BoatNight|boatNightData)-/.test(u));

  // A save on the Chapter 2 Complete card.
  await page.goto('/');
  await page.evaluate((flags) => {
    localStorage.clear();
    localStorage.setItem(
      'paladin.save',
      JSON.stringify({
        schemaVersion: 1,
        scene: 'jetty_dusk',
        position: { x: 7.2, z: -4.7, facing: 'east' },
        flags,
        playTimeMs: 1_200_000,
        prologueComplete: true,
      }),
    );
  }, CHAPTER2_DONE);
  await page.reload();
  await expect(page.locator('.menu-hint')).toContainText('Chapter 2 complete');
  await testId(page, 'menu-continue').click();
  await expect(testId(page, 'chapter2-complete')).toBeVisible({ timeout: 10_000 });
  expect(chapter3Requested()).toBe(false);

  // ── Milestone 3.1: the night boat ────────────────────
  await expect(testId(page, 'menu-next-chapter')).toBeEnabled({ timeout: 5_000 });
  await testId(page, 'menu-next-chapter').click();
  await expect(testId(page, 'chapter-card')).toBeVisible();
  await expect(testId(page, 'chapter-card')).toContainText("The Crown's Word");
  expect(chapter3Requested()).toBe(true);
  await arriveIn(page, 'Night Express — Down the Rajang');
  await expect(testId(page, 'objective')).toContainText('Find Julian Pell on deck.');
  await page.screenshot({ path: 'test-results/boat-night.png' });

  // Pell at the south rail
  await walk(page, 'KeyD', 2.6);
  await walk(page, 'KeyS', 0.3);
  await expect(testId(page, 'interaction-prompt')).toContainText('Talk to Julian Pell');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Find out why the student keeps staring.');

  // The student's phone, then Daniel's call
  await walk(page, 'KeyW', 0.6);
  await walk(page, 'KeyD', 1.5);
  await expect(testId(page, 'interaction-prompt')).toContainText('Talk to Student');
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Rest in the cabin until Kuching.');

  // The cabin → Kuching before dawn
  await walk(page, 'KeyS', 0.45); // into the lane between Mara's bench and Pell
  await walk(page, 'KeyA', 4.8);
  await expect(testId(page, 'interaction-prompt')).toContainText('Inspect Cabin');
  await press(page, 'KeyE');
  await finishDialogue(page);

  // ── Milestone 3.2: the waterfront before dawn ────────
  await arriveIn(page, 'Kuching — Waterfront, Before Dawn');
  await expect(testId(page, 'objective')).toContainText("Get to Kak Jamilah's stall.");
  await page.screenshot({ path: 'test-results/waterfront-night.png' });
  // South off the boardwalk, then west across the plaza, well away from the pier.
  await walk(page, 'KeyS', 4.9);
  await walk(page, 'KeyA', 18.1);
  await expect(testId(page, 'interaction-prompt')).toContainText('Talk to Kak Jamilah');
  await press(page, 'KeyE');
  await finishDialogue(page);

  // Up the back stairs
  await arriveIn(page, "Above Kak Jamilah's Stall");
  await expect(testId(page, 'objective')).toContainText("Read the Archivist's note.");
  await walk(page, 'KeyW', 0.4);
  await expect(testId(page, 'interaction-prompt')).toContainText("Archivist's Note");
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'objective')).toContainText('Ask Pell to sponsor the petition.');

  // Pell's choice: the replies appear after his last line.
  await walk(page, 'KeyD', 1.5);
  await walk(page, 'KeyW', 1.0);
  await expect(testId(page, 'interaction-prompt')).toContainText('Talk to Julian Pell');
  await press(page, 'KeyE');
  const choices = testId(page, 'dialogue-choices');
  for (let i = 0; i < 60 && (await choices.count()) === 0; i++) await press(page, 'Enter', 120);
  await expect(choices).toBeVisible();
  await expect(choices).toContainText('For Sungai Awan.');
  await expect(testId(page, 'choice-village')).toHaveClass(/selected/);
  await press(page, 'ArrowDown');
  await expect(testId(page, 'choice-family')).toHaveClass(/selected/);
  await page.screenshot({ path: 'test-results/pell-choice.png' });
  await press(page, 'Enter');
  await expect(testId(page, 'dialogue-text')).toContainText('Half of that name', { timeout: 5_000 });
  await finishDialogue(page); // Pell signs, Daniel arrives, then the morning ferry

  // ── Milestone 3.3: the Palace forecourt ──────────────
  await arriveIn(page, 'The Palace — Forecourt');
  await expect(testId(page, 'objective')).toContainText('Give the petition to the Clerk of Petitions.');
  await page.screenshot({ path: 'test-results/palace-gate.png' });
  // North up the middle of the forecourt, then west to the Clerk's desk.
  await walk(page, 'KeyW', 4.7);
  await walk(page, 'KeyA', 2.6);
  await expect(testId(page, 'interaction-prompt')).toContainText('Talk to Clerk of Petitions');
  await press(page, 'KeyE');
  await finishDialogue(page); // registered, Sergeant Osman, then the Crowned Sentinel

  // The Crowned Sentinel: defend its heavy blows until it withdraws.
  await expect(testId(page, 'battle-ui')).toBeVisible();
  await expect(testId(page, 'enemy-status')).toContainText('Crowned Sentinel');
  await expect(testId(page, 'player-hp')).toHaveText('36/36');
  for (const cmd of ['skill', 'skill', 'attack', 'defend', 'attack', 'attack', 'defend', 'attack']) {
    await expect(testId(page, `cmd-${cmd}`)).toBeEnabled({ timeout: 15_000 });
    if (cmd === 'defend') await expect(testId(page, 'enemy-charging')).toBeVisible();
    if (cmd === 'attack' && (await testId(page, 'battle-victory').count()) > 0) break;
    await testId(page, `cmd-${cmd}`).click();
    if (cmd === 'skill') await page.screenshot({ path: 'test-results/crowned-sentinel.png' });
  }
  await expect(testId(page, 'battle-victory')).toBeVisible({ timeout: 15_000 });
  await expect(testId(page, 'enemy-hp')).toHaveText('12/56'); // it withdrew, still standing
  await expect(testId(page, 'player-hp')).toHaveText('15/36');
  await press(page, 'KeyE', 600);
  await finishDialogue(page); // it withdraws; the petitioners hold the gates open

  // ── Milestone 3.4: the Petition Hour ─────────────────
  await expect(testId(page, 'objective')).toContainText('Go through the gate to the audience hall.');
  await walk(page, 'KeyW', 1.6);
  await expect(testId(page, 'interaction-prompt')).toContainText('Enter Audience Hall');
  await press(page, 'KeyE');
  await arriveIn(page, 'The Palace — Audience Hall');
  await page.screenshot({ path: 'test-results/audience-hall.png' });
  await walk(page, 'KeyW', 4.2);
  await expect(testId(page, 'interaction-prompt')).toContainText("Stand in the Petitioner's Place");
  await press(page, 'KeyE');

  const untilChoices = async () => {
    for (let i = 0; i < 80 && (await choices.count()) === 0; i++) await press(page, 'Enter', 150);
    await expect(choices).toBeVisible();
  };
  // Claim 1 (the seal): a wrong piece of evidence first, then the right one.
  await untilChoices();
  await expect(choices).toContainText("The Rajah's letter of 1921, refusing to sign.");
  await page.screenshot({ path: 'test-results/hearing-evidence.png' });
  await testId(page, 'choice-charter').click();
  await expect(testId(page, 'dialogue-text')).toContainText('That does not touch the seal', { timeout: 5_000 });
  await untilChoices();
  await testId(page, 'choice-letter').click();
  // Claims 2–4: the Charter, Elias's journal, the Warden's plate.
  for (const evidence of ['charter', 'journal', 'plate']) {
    await untilChoices();
    await testId(page, `choice-${evidence}`).click();
  }
  // Pell testifies in his own words: Adrian persuaded him with "For your family's name."
  await untilChoices();
  await testId(page, 'choice-pell-family').click();
  await expect(testId(page, 'dialogue-text')).toContainText('Julian Pell, Your Majesty', { timeout: 5_000 });
  await finishDialogue(page); // "So is the Crown." The Rajah rises and rules; Harrow orders the Sentinel.

  // ── Milestone 3.5: the final battle ──────────────────
  // Armour (Radiant Strike breaks it) → heavy blows (River Ward the first, Defend the rest) → it kneels.
  await expect(testId(page, 'battle-ui')).toBeVisible({ timeout: 10_000 });
  await expect(testId(page, 'enemy-status')).toContainText('Crowned Sentinel');
  await expect(testId(page, 'enemy-armored')).toBeVisible();
  await expect(testId(page, 'player-hp')).toHaveText('36/36');
  await expect(testId(page, 'enemy-hp')).toHaveText('72/72');
  await page.screenshot({ path: 'test-results/final-armoured.png' });
  const plan = ['skill', 'skill', 'attack', 'ward', 'attack', 'attack', 'defend', 'attack', 'attack', 'defend', 'attack'];
  for (const [i, cmd] of plan.entries()) {
    await expect(testId(page, `cmd-${cmd}`)).toBeEnabled({ timeout: 15_000 });
    if (cmd === 'ward' || cmd === 'defend') await expect(testId(page, 'enemy-charging')).toBeVisible();
    await testId(page, `cmd-${cmd}`).click();
    if (i === 0) {
      await expect(testId(page, 'enemy-armored')).toHaveCount(0, { timeout: 10_000 });
      await page.waitForTimeout(1200);
      await page.screenshot({ path: 'test-results/final-unsealed.png' });
    }
  }
  await expect(testId(page, 'battle-victory')).toBeVisible({ timeout: 15_000 });
  await expect(testId(page, 'enemy-hp')).toHaveText('16/72'); // it kneels, still standing
  await expect(testId(page, 'player-hp')).toHaveText('12/36');
  await page.waitForTimeout(1200);
  await page.screenshot({ path: 'test-results/final-kneels.png' });
  await press(page, 'KeyE', 600);

  // The Charter registered, Harrow dismissed, Elias's name restored.
  await expect(testId(page, 'dialogue-box')).toBeVisible({ timeout: 10_000 });
  await page.waitForTimeout(800);
  await page.screenshot({ path: 'test-results/hall-kneeling.png' });
  await finishDialogue(page);

  // The epilogue: Sungai Awan by day; pull up the last survey peg.
  await arriveIn(page, 'Sungai Awan — Village Square');
  await expect(testId(page, 'objective')).toContainText('Pull up the last survey peg');
  await page.screenshot({ path: 'test-results/epilogue.png' });
  // South to the edge of the village, east, then north until the Vale house stops Adrian.
  await walk(page, 'KeyS', 13);
  await walk(page, 'KeyD', 2.9);
  await walk(page, 'KeyW', 8);
  await expect(testId(page, 'interaction-prompt')).toContainText('Pull up the Last Survey Peg');
  await page.screenshot({ path: 'test-results/epilogue-peg.png' });
  await press(page, 'KeyE');
  await finishDialogue(page);
  await expect(testId(page, 'chapter3-complete')).toBeVisible({ timeout: 10_000 });
  await expect(testId(page, 'menu-next-chapter')).toHaveCount(0); // the first story ends here
  await expect(testId(page, 'menu-main-menu')).toBeEnabled({ timeout: 5_000 });
  await page.screenshot({ path: 'test-results/chapter3-complete.png' });

  // Saved; after a refresh, Continue says so.
  await page.waitForTimeout(500);
  await page.reload();
  await expect(testId(page, 'menu-continue')).toBeVisible({ timeout: 10_000 });
  await expect(page.locator('.menu-hint')).toContainText('Chapter 3');

  expect(errors).toEqual([]);
});
