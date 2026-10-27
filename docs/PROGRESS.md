# Progress

**Current phase:** Phase 9 — Chapter 3: The Crown's Word (design agreed, `docs/CHAPTER_3.md`). Milestones 3.1 (The Long Way Down), 3.2 (A Wanted Man), 3.3 (The Palace Gate) and 3.4 (The Petition Hour) ✅ done; 3.5 (The Crown Remembers) next. Chapter 2 is complete (`docs/CHAPTER_2.md`).
**MVP:** ✅ complete (phases 0–6); Chapter 0 is live.
**Live site:** https://legacyofwhiterajah.netlify.app
**Repository:** https://github.com/joe5408-sys/paladin-legacy-of-the-white-rajah (public, `master`; Netlify auto-deploys on push)
**Last updated:** 2026-10-27

### Phase 9 — Chapter 3, Milestone 3.4: The Petition Hour (2026-10-27) ✅
- The 3.3 ending now leaves the gates held open: walk through them into **the audience hall** (a new invented palace interior: white columns, tall windows, a red carpet to a gilded throne, banners, benches, and the Crowned Sentinel standing beside the throne again).
- **New character: the Rajah**, fictional and unnamed, young, in a plain white uniform.
- **The hearing:** stand in the petitioner's place; Lord Chamberlain Harrow makes four claims (the royal seal; no other grant; a forgery; the palace has nothing to do with the company), and Adrian answers each by **presenting evidence** from everything found across the game: the Rajah's 1921 letter, the River Charter, Elias's journal, the Hollow Warden's plate, or Pell's testimony. A wrong piece of evidence gets a rebuttal and another try. Mara speaks up for Sungai Awan halfway; the Archivist backs up the letter and the journal; Pell testifies in words that depend on how Adrian persuaded him in 3.2. "It is all very old, Your Majesty." "So is the Crown." The Rajah rises to rule → **To Be Continued**.
- Small engine addition: an interactable can override its prompt verb ("Stand in the Petitioner's Place").
- **Bug fix (from 3.2):** dialogue replies could not be clicked with the mouse, because the HUD layer ignores the mouse and the reply buttons didn't opt back in (the 3.2 browser test only used the keyboard). The Chapter 3 browser test now picks the hearing's evidence by mouse.
- A reload mid-hearing resumes at the first unanswered claim.
- **Test results:** `npm test` 273/273 (new `hearing.test.ts`, 7 tests: the evidence menu, the full hearing trying every wrong answer before each right one, Pell's evidence accepted for claim 4, all four versions of Pell's testimony, resuming after a reload at each stage, the end save and a too-early hall save; 3.3's tests now end at the open gate). `npm run e2e` 4/4: the Chapter 3 browser test now also walks into the hall and wins the hearing, trying one wrong piece of evidence first (1.4 min); full story unchanged (4.8 min). Visual check by screenshot of the hall with the evidence menu.
- **Live:** not yet checked on the live site.

### Phase 9 — Chapter 3, Milestone 3.3: The Palace Gate (2026-10-27) ✅
- **New system: yield.** An enemy can stop fighting at a set HP; the battle ends in victory with it still standing. First used here, gently.
- Daniel's plan now leads straight to the morning ferry (old 3.2 saves take the stairs in Kak Jamilah's room).
- **The Palace forecourt** (new scene, an invented palace): white walls, gold-tipped gates, the Palace and its dome beyond, hedges, the Clerk of Petitions' desk and register, and the river steps.
- **New people:** the Clerk of Petitions, Sergeant Nadia Osman (Daniel's former partner), and petitioners with small requests: the auntie from the Chapter 2 boat, a fisherman and a schoolteacher.
- **Story:** the Clerk registers the petition → Osman has orders to detain Adrian; Daniel faces her → the **Crowned Sentinel** walks out of the gate → battle → it withdraws at the sight of the medallion → the petitioners hold the gates open, the Clerk invokes custom, Osman lets them through → **To Be Continued**.
- **The Crowned Sentinel:** a new ivory-and-gold sprite with a crowned helm and halberd, on a new palace battle backdrop. HP 56, withdraws at 16; going all-out loses, defending its heavy blows wins with 15/36 HP.
- **Test results:** `npm test` 262/262 (new `palaceGate.test.ts`, 9 tests: the yield rule, the fight's balance by strategy, the full 3.3 flow, a reload mid-battle with a retry, the end save, a too-early forecourt save; 3.2's tests now end on the ferry). `npm run e2e` 4/4: the Chapter 3 browser test now also crosses the forecourt, registers the petition and fights the Sentinel until it withdraws (1.2 min); full story unchanged (4.7 min). Visual checks by screenshots of the forecourt and the Sentinel; the first forecourt screenshot showed the lawn covering the river steps and the Palace off-screen, so the lawn now stops at the steps and the arrival point moved north.
- **Live:** deployed as `35bb970`; `E2E_BASE_URL=https://legacyofwhiterajah.netlify.app npx playwright test` 4/4 against the live site (6.3 min).

### Phase 9 — Chapter 3, Milestone 3.2: A Wanted Man (2026-10-27) ✅
- **New system: dialogue choices.** A conversation can end in a list of replies, chosen with ↑/↓ + E/Enter or the mouse; it waits until one is picked. First used for Pell's decision. No fail states: every reply leads on.
- The night boat's cabin now leads ashore at Kuching instead of ending the chapter (old 3.1 saves step ashore from the cabin).
- **The waterfront before dawn:** the Chapter 1 waterfront (now a reusable `WaterfrontScene`) darker, with shutters down, wanted posters on the lamp posts and Royal Security on the pier. Cross the plaza to Kak Jamilah's stall.
- **Kak Jamilah's room** (new interior above her stall): the Archivist's note about the Petition Hour, then **Pell's choice** (three replies, each with its own answer, all ending with Pell sealing the petition and losing his job), then **Daniel** arrives with a plan for the palace → **To Be Continued**.
- **Test results:** `npm test` 249/249 (`chapter3.test.ts` now 14 tests: the choice rules, keyboard choosing with wrap-around, ignoring bad picks, the full 3.2 flow, all three replies, old-cliffhanger and mid-milestone saves, too-early saves). `npm run e2e` 4/4: the Chapter 3 browser test now also crosses the waterfront, reads the note and picks Pell's second reply with the keyboard (39 s); the full-story test is unchanged (4.8 min). Visual checks by screenshots of the waterfront and of Pell's choice.
- **Live:** deployed as `b4387c1`; `E2E_BASE_URL=https://legacyofwhiterajah.netlify.app npx playwright test` 4/4 against the live site (5.8 min).

### Phase 9 — Chapter 3, Milestone 3.1: The Long Way Down (2026-10-27) ✅
- **Design:** `docs/CHAPTER_3.md` agreed with all its draft defaults (the first story ends with Chapter 3; the Rajah on screen, fictional and unnamed; dialogue choices and a battle yield as the two new systems; max HP 36; Pell a story ally; Harrow never fights; no new Paladin art; five milestones).
- **Chapter hand-off:** the Chapter 2 Complete card now offers **Continue to Chapter 3**, which downloads Chapter 3 on demand and shows the title card "Chapter 3 · The Crown's Word".
- **The night boat** (`src/chapters/chapter3/`): the Chapter 2 express boat with a new night palette (moon, deck lamp, lit windows, lamplit longhouses), not a copy. Pell came aboard unasked; the Student from the 2.1 boat shows Adrian the news (*Vale heir sought over Royal Archives break-in*); Daniel calls (suspended; the Petition Hour; go to Kak Jamilah's); rest in the cabin → Kuching before dawn → **To Be Continued**.
- **Max HP 30 → 36** for every battle from Chapter 3 on; earlier chapters keep 30.
- **Test results:** `npm test` 235/235 (new `chapter3.test.ts`, 7 tests: lazy loading, the card hand-off, the max-HP raise, the whole flow in order with locked steps, saves mid-boat and at the end, a too-early boat save). New browser test `chapter3.spec.ts` (starts from a Chapter 2 Complete save; 19 s). `npm run e2e` 4/4 (the full-story test still plays Chapters 0–2 in 4.8 min). Visual check by screenshot of the night deck.
- **Live:** deployed as `04646ca`; `E2E_BASE_URL=https://legacyofwhiterajah.netlify.app npx playwright test` 4/4 against the live site (5.5 min).

### Phase 8 — Chapter 2, Milestone 2.5: The Iron Warden (2026-10-27) ✅ Chapter 2 complete
- The Hollow Warden's defeat now leads into **the race downriver** (no ending). Saves from the old 2.4 cliffhanger set off from Mara or Ah Hock on the landing.
- **Sungai Awan at dusk** (`src/chapters/chapter2/JettyDusk.tsx` + `jettyData.ts`, lazy-loaded): the Chapter 2 village with a new `lighting="dusk"` option on `VillageSquare` (low red sun, lamps lit). The villagers are out on the boardwalk; **Harrow's black barge** (orange stripe, floodlights on a crane) ties up at the east end with a great shape under a tarpaulin on deck.
- **Story:** "We beat it. Just." → Julian Pell at the gangway (he didn't order it: "I ordered a consultation and a tea urn!") → the **Iron Warden** steps off the barge → boss battle → it topples through the rail into the river → Pell reads the River Charter and, for the first time, doesn't know which side he's on → Adrian will take the Charter to the capital, to the Rajah himself → **Chapter 2 Complete** (a real card; "Chapter 3 arrives in a future update"). Everyone on the boardwalk has an optional line.
- **Boss phases** (a small, data-driven addition to `battle.ts`): an encounter can have `armor`. While it holds, Attack does 1 damage ("Clang!") and the boss never winds up. The first Radiant Strike breaks it (full damage, iron plates flying off), and only then do heavy blows start. The HUD shows "Armoured", and the sprite changes from bolted plates to an open furnace.
- **The Iron Warden:** a new 40×52 pixel-art construct (`ironWardenSprite.ts`) on a dusk boardwalk backdrop with the barge behind, and a deeper, faster **boss battle loop**. HP 50, hits for 4, and once exposed an 18-damage heavy blow every 3rd round that Defend only halves. Break the armour at once, ward the first heavy blow, defend the second: wins with 13/30 HP. Going all-out, ignoring the armour, or never using River Ward all lose. Max HP stays 30.
- **Test results:** `npm test` 224/224 (new `ironWarden.test.ts`, 16 tests: armour rules, four balance strategies, the full 2.5 story to the card, retrying a defeat, a reload mid-battle, the end save, a too-early jetty save; 2.4 tests now end on the trip home). `npm run e2e` 3/3: the full-story test now plays all three chapters to the Chapter 2 Complete card (4.8 min; its limit was raised to 8 min). Visual checks by screenshots of the jetty, the barge and both boss phases; after them I brightened the dusk light, shrank the boss sprite slightly and shortened the "Armoured" label so the boss's head isn't hidden behind the status panel.
- **Live:** deployed as `91e592a`; `E2E_BASE_URL=https://legacyofwhiterajah.netlify.app npx playwright test` 3/3 against the live site (5.1 min). Chapter 2 is live end to end.

### Phase 8 — Chapter 2, Milestone 2.4: The River Charter (2026-10-27) ✅
- After the spirit's test the door stays open (no ending): **Enter Waystation** leads into **the waystation hall** (`src/chapters/chapter2/Hall.tsx` + `hallData.ts`, lazy-loaded), a round hall cut into the cliff with roots through the ceiling and river-light from a stone basin. Saves from the old 2.3 cliffhanger can walk straight in.
- **Elias's journal** (his own voice for the first time): the Rajah signed the Charter in March 1921 and gave it to Elias to register in Kuching; Harrow's men watched the roads, so Elias hid it here and sealed the case "to the sign". Reading it is what lets the medallion open the case.
- **The River Charter** of 1921: the river lands granted to the people who live on them, forever, with the Rajah's (unnamed) signature and seal. All invented. The **Paladin oath** is carved in full on the north wall (optional); its last line is the chapter card's new quote.
- **Daniel returns** straight after: released "for lack of evidence", possibly followed, with news that Harrow's barge is coming upriver tonight carrying "equipment". Then a crash outside.
- **The Hollow Warden** (the Sentinel's sprite recoloured in verdigris and moss-green, with an orange flame) climbs out of the river onto the steps, stencilled "AR · SITE CLEARANCE", and the battle starts. Same rules as the Sentinel, retuned: HP 48, hits for 7, an 18-damage heavy blow every 3rd round that Defend blocks. **River Ward is now on the menu in every battle.** All-out loses; defending every heavy blow scrapes through with about 2 HP; defending and using River Ward when hurt wins with 12. Victory → a plate in its chest ties Awan Riverlands to the palace → Mara: "we go home and get there first" → **To Be Continued**.
- Daniel stands on the landing after his return. If the game is closed mid-battle, the Warden can be faced again from the landing.
- **Test results:** `npm test` 204/204 (new `warden.test.ts`, 9 tests: the Warden's tuning and three strategies, the hall's order (the case stays shut until the journal is read), Daniel's return, the battle and ending, a reload mid-battle, a too-early hall save, and the end save; the shared layout checks cover the hall). `npm run e2e` 3/3: the full-story test now also plays the hall and wins the Warden battle with River Ward (4.2 min for the whole game). Visual checks by screenshots of the hall and the Warden's arrival.
- **Live:** deployed as `f1a4b37`; `E2E_BASE_URL=https://legacyofwhiterajah.netlify.app npx playwright test` 3/3 against the live site (4.5 min).

### Phase 8 — Chapter 2, Milestone 2.3: The Waystation (2026-10-27) ✅
- Finding the map behind Elias's portrait now leads straight into **the longboat trip** with Ah Hock (no ending). Saves from the old 2.2 cliffhanger set off from the portrait, from Mara, or from Ah Hock at the jetty.
- **The waystation landing** (`src/chapters/chapter2/Waystation.tsx` + `waystationData.ts`, lazy-loaded): an invented Paladin site with mossy steps up from the river, a paved terrace, jungle on both sides, Ah Hock's longboat, and a sealed door in a vine-hung cliff. Mara and Ah Hock wait by the water.
- **Light puzzle:** three standing stones: one standing in a river pool (the deep), one in a shaft of sunlight (the bright), and one beside the door, turned to face it (the one that waits). Touching them in the verse's order lights each stone and joins them with threads of light; the third opens the door. A wrong start does nothing, and a wrong order puts out the lit stones (no other penalty). Mara gives a gentle hint if asked.
- **Small engine addition:** conversations can now *clear* flags (`clearFlags`), used only for the stones going dark. The design doc had said "no new engine code" for the puzzle, but a true reset isn't possible with set-only flags. Story progress flags are still never cleared.
- **River Ward** (the chapter's one new battle feature): once per battle, heal 10 HP and block the next hit completely, even a heavy blow, and the ward lasts through the enemy's charging turn. It appears on the battle menu (with a pip and a "Warded" status) only once learned, or during the battle that teaches it. Each battle now carries its own player stats.
- **The training spirit** (the Covenant Guardian's sprite recoloured as river-water, on a mossy terrace backdrop): HP 42, hits for 5, and winds up a 14-damage wave every other round that Defend only halves. Warding a wave and attacking wins with about 16 HP left; going all-out, or defending every wave, loses. Victory → the spirit teaches River Ward ("The river does not fight the rock. It keeps the valley.") → **To Be Continued**.
- Max HP stays at 30 (the design doc's optional raise to 36 was left out, to keep the change small).
- **Test results:** `npm test` 191/191 (new `waystation.test.ts`, 15 tests: River Ward's rules, the spirit's balance by strategy, the puzzle including both wrong-order cases and the reset, retrying a defeat, a save closed mid-battle, a half-finished puzzle in a save, old-cliffhanger saves, and a too-early landing save). `npm run e2e` 3/3: the full-story test now also does the puzzle and wins the spirit battle with River Ward (3.5 min for the whole game; its time limit was raised to 6 min). Visual checks by screenshots of the landing and the River Ward turn.
- **Live:** deployed as `dbcffc7`; `E2E_BASE_URL=https://legacyofwhiterajah.netlify.app npx playwright test` 3/3 against the live site (3.8 min).

### Phase 8 — Chapter 2, Milestone 2.2: Home, Changed (2026-10-27) ✅
- The boat's cabin now leads on to **Sungai Awan, changed**: the prologue village and family home reused with Chapter 2 layouts and props (a Crown notice board, survey pegs with orange tape, the Awan Riverlands survey boat, Ah Hock's blue longboat). The prologue scene components now take a layout and extra props, so no geometry was copied.
- **New characters:** Kak Siti (the clinic nurse) and Julian Pell (the survey manager). Returning: Uncle Lim, Aunt Mara, Captain Ah Hock.
- **Story:** the notice → Lim → Pell → Mara at home → the map and verse behind Elias's portrait (the portrait then lies on the table, map side up) → "To Be Continued". Each step is locked until the one before it is done; Siti, Ah Hock and a survey peg are optional.
- Kak Siti became the clinic nurse rather than the shopkeeper, because Uncle Lim already runs the kedai (noted in `CHAPTER_2.md`).
- **Test results:** `npm test` 172/172 (new: the full 2.2 flow including out-of-order attempts, Mara waiting until Pell, the old-2.1-save migration, and a too-early village save; the shared layout checks cover both new scenes). `npm run e2e` 3/3: the full-story test now also walks Sungai Awan and the house to the portrait (2.8 min for the whole game). While extending it I moved the boat's auntie slightly so the walk to the cabin isn't a tight squeeze, and fixed two test-route mistakes. Visual check by screenshots: hid the wall portrait once it's on the table.
- **Live:** deployed as `4f86d29`; `E2E_BASE_URL=https://legacyofwhiterajah.netlify.app npx playwright test` 3/3 against the live site (2.9 min).

### Phase 8 — Chapter 2, Milestone 2.1: Upriver (2026-10-26) ✅
- **Design:** `docs/CHAPTER_2.md` agreed with its default choices: River Ward, Daniel as a story ally, a redeemable Julian Pell, real place names allowed, five milestones.
- **Chapter hand-off:** the Chapter 1 Complete card now offers **Continue to Chapter 2** (its default choice), which downloads Chapter 2 on demand and shows the title card "Chapter 2 · The River Remembers". The chapter-start code is now shared (`startChapter(1 | 2)`), and the loader, quests, saves and title screen know about Chapter 2.
- **Express boat scene** (`src/chapters/chapter2/Boat.tsx` + `boatData.ts`, lazy-loaded): a white-and-blue express boat with cabin, rails, bench, cargo and engine housing on the brown Rajang. The jungle bank, longhouses on stilts and river foam drift past to suggest travel, and two foam lines trail behind the stern. New engine-and-river ambience.
- **New characters:** Captain Ah Hock, a university student and an auntie with rambutans.
- **Story:** four objectives in a fixed order (Mara → the news on the student's phone → the captain → the cabin), ending at the Sungai Awan jetty with fresh survey pegs on the bank → "To Be Continued".
- **Test results:** `npm test` 161/161. The new `chapter2.test.ts` (6 tests) covers lazy loading, the hand-off from Chapter 1, the boat conversations and their locks, saves, and a save claiming the boat too early. The shared layout, spawn and dialogue checks now include the boat. `npm run e2e` 3/3: the full-story test continues from Chapter 1 Complete into Chapter 2, checks its files download only then, and plays 2.1 to the card (2.4 min for the whole game). Visual check by screenshots: removed fog that washed the scene out, brought the far bank into view, and replaced a slab-like wake with foam lines.
- **Live:** deployed as `b0ced46`; `E2E_BASE_URL=https://legacyofwhiterajah.netlify.app npx playwright test` 3/3 against the live site (2.5 min).

### Phase 7 — Chapter 1, Milestone 1.4: The Redacted Name (2026-10-26) ✅ Chapter 1 complete
- The vault's inner gate now leads on (no ending): **the sealed records** (`src/chapters/chapter1/Records.tsx` + `recordsData.ts`, lazy-loaded), a low room of wooden floorboards, hanging bulbs, shelves of stencilled tin record boxes, a reading table with the VALE box, and a rusted flood door. Saves from the old 1.3 cliffhanger get "Enter Sealed Records" at the open gate.
- **The reveal:** the VALE box (lid opens, wax seal breaks) holds the river-lands timber concession, Harrow's half-share, and the one unredacted charge sheet naming **Elias Vale**. The Private Office shelf holds the Rajah's misfiled reply refusing to sign. All names, companies and documents are fictional; the Rajah is never named.
- **The confrontation:** reading the letter runs straight into Harrow's arrival. **New characters:** Lord Chamberlain Edmund Harrow (silver hair, dark morning coat, gold chain of office) and two Royal Security officers, who appear in the room and block the way back. The medallion flares and the lights fade out: only the Archivist's lantern by the now-open flood door and the officers' torchlight from the vault remain. Harrow and Daniel have short lines in the dark.
- **Ending:** the Archivist reveals she knew Elias's name all along; Daniel stays behind; Mara waits in a sampan → **Chapter 1 Complete** card ("Keep the sign safe until the Crown deserves it again"), pointing to Chapter 2. On this card Main Menu is the default choice, so a stray key press can't start a new game. The title screen's Continue hint reads "Chapter 1 complete".
- New ambience for the records room. People only count as obstacles while they are in the room (colliders follow story flags).
- **Test results:** `npm test` 151/151 (8 new: the full 1.4 flow, who stands in the room when, old-save migration, a save taken in the dark, and the Chapter 1 Complete save; the spawn and reachability checks cover the new room and caught a spawn point sitting on the exit prompt). `npm run e2e` 3/3: the full-story test now plays **the whole game**, Chapter 0 through Chapter 1 Complete, with real input (2.1 min). Visual check by screenshots: fixed box labels glowing in the dark and Harrow facing away from Adrian.
- **Live:** deployed as `586b4d4`; `E2E_BASE_URL=https://legacyofwhiterajah.netlify.app npx playwright test` 3/3 against the live site (the whole game in 2.1 min).

### Phase 7 — Chapter 1, Milestone 1.3: The Hollow Sentinel (2026-10-26) ✅
- The iron door now opens (no ending): **the vault** (`src/chapters/chapter1/Vault.tsx` + `vaultData.ts`, lazy-loaded), a narrow stone hall with sealed cabinets, flickering oil lamps and a barred inner gate. After the door opens, the Archives offer a plain "Enter Vault"; saves from the old 1.2 cliffhanger continue from there.
- **The Hollow Sentinel** (original pixel art, `src/game/combat/sentinelSprite.ts`): a palace construct of brass and ironwood. It stands dormant before the gate and blocks the way until it falls; afterwards its wreckage lies on the floor.
- **Second battle**, reusing the battle system. Encounters now choose their sprite and backdrop (the vault arena has a cold stone floor and the inner gate behind the enemy). New, data-driven **heavy attack**: every 3rd round the Sentinel charges ("Charging a heavy blow!" in its panel, rears back, pulses white-blue), then strikes for 16. Defend blocks that blow completely ("Blocked!"); Defend still halves normal hits. A first-turn tip explains it, and it shows again after a retry.
- **Balance** (checked by unit tests): HP 42, slash 7. Going all-out and ignoring the wind-up loses (37 damage vs 30 HP); defending whenever it charges wins with about 9 HP left; even plain Attacks win if every heavy blow is defended. The Covenant Guardian is unchanged. No new Paladin skill: the scope rule said only if the fight needed one, and it doesn't.
- Victory → the brass plate from its chest unlocks the inner gate (the bars sink into the floor) → rows of sealed boxes, one marked VALE → "To Be Continued". The chapter end moved to `c1_inner_gate_open`. New vault ambience (low drone, dripping water).
- **Test results:** `npm test` 143/143 (new `sentinel.test.ts` for the battle rules and balance; `chapter1.test.ts` covers the vault flow, the battle, defeat and retry, the Sentinel's collider, and old-save migration and save validation for the vault). `npm run e2e` 3/3: the full-story test now also walks into the vault, wins the Sentinel fight by defending its heavy blows, and opens the gate (1.8 min). I checked the vault and battle visually with screenshots: brightened the hall, moved the lamps out of the cabinets, removed a jagged wall shadow, and made the gate bars sink into the floor instead of rising through the ceiling.
- **Live:** deployed as `fb2669a`; `E2E_BASE_URL=https://legacyofwhiterajah.netlify.app npx playwright test` 3/3 against the live site (full story 1.9 min).

### Phase 7 — Chapter 1, Milestone 1.2: The Royal Archives (2026-10-26) ✅
- The Archives door no longer ends the chapter: a night passes ("Aunt Mara snores, gently") and the doors open at dawn. Dialogue can now move the player to another scene when it ends (`enterScene`).
- **Royal Archives interior** (`src/chapters/chapter1/Archives.tsx` + `archivesData.ts`, lazy-loaded): a checkered floor; four themed bookcases plus back-wall stacks; high windows with dawn light shafts; the Archivist's desk with a green lamp; and a riveted iron door bearing the Paladin sign, which glows faintly once the file is found and blazes when it wakes.
- **New character:** the Archivist (grey bun, glasses, olive cardigan). Daniel guards the entrance.
- **Investigation (4 new objectives):** Treason Proceedings (a gap under V) → ask the Archivist (embarrassments were filed with the household accounts) → Household Ledgers (the redacted file: Lord Chamberlain R. Harrow's order under the royal seal, with the Rajah's signature line blank) → the iron door wakes → "To Be Continued". Optional lore on the Land Grants shelf.
- **Saves and migration:** after dawn the waterfront door becomes a plain "Enter Royal Archives". Saves from the old 1.1 cliffhanger now continue into the Archives instead of the ending card. The chapter end moved to `c1_vault_found`.
- New ambience: a hushed hall with a slow clock tick.
- **Test results:** `npm test` 123/123 (6 new, including the full 1.2 flow and old-save migration; the reachability and spawn checks now cover the Archives too). `npm run e2e` 3/3: the full-story test now plays Chapter 0 → waterfront → the whole Archives investigation → "To Be Continued" with real input (1.3 min). I checked the Archives visually with screenshots and added a front fill light so the book spines read clearly.

### Phase 7 — Chapter 1, Milestone 1.1: Arrival in Kuching (2026-10-26) ✅
- **Chapter system:** chapter content is **lazy-loaded** (`src/chapters/loader.ts`), so Chapter 1's dialogue and 3D scene are separate downloads (about 4 KB gzip) fetched only when the player reaches Chapter 1 or continues a Chapter 1 save.
  - Registries for dialogue, layouts and objectives (`registerDialogues`, `registerLayout`, `registerObjectives`).
  - Chapter-aware objectives (`objectivesFor`), save validation, title "Continue" hint and closing cards.
- **Chapter 0 → 1:** the Chapter 0 card now offers **Continue to Chapter 1** (keeps story flags and play time). A full-screen chapter title card follows ("Chapter 1 · The Capital's Shadow").
- **Kuching waterfront** (`src/chapters/chapter1/`): dusk lighting; a row of four shophouses; the columned Royal Archives; the river boardwalk with a ferry pier and moored boat; the Palace and old fort lit across the river; Kak Jamilah's kolo mee stall; a bandstand; lamps and palms.
  - NPCs: Daniel (pier), Aunt Mara (bench) and Kak Jamilah (new character).
  - Objectives: Meet Daniel → Go to the Royal Archives → **To Be Continued** card (saved, and reopens on Continue).
  - New ambience: evening river with night insects.
- **Automated browser tests (Playwright)**, run in the locally installed **Edge** (no browser download), against the production build:
  - `npm run e2e` builds and runs them. `E2E_BASE_URL=https://legacyofwhiterajah.netlify.app npx playwright test` tests the live site.
  - `smoke.spec.ts`: title, settings, New Game, walk into the house, autosave, pause, Save, return to the title, refresh, Continue; corrupt save.
  - `full-story.spec.ts`: **plays all of Chapter 0 and Chapter 1 milestone 1.1 with real keyboard input**, and checks that Chapter 1 isn't downloaded before it's reached.
- **Live:** deployed with commit `401eeeb`. The full Playwright suite also passed **against the live site** (3/3, full-story run 1.0 min).
- **Test results:** `npm test` 117/117 (12 new). `npx playwright test` 3/3 passed against the production build (the full-story run takes about 58 s). The build splits Chapter 1 into its own files. I also checked the waterfront visually with Playwright screenshots and fixed three things: the Palace was out of view, the boat was facing the wrong way, and the south edge was empty.

### Post-launch: sword combat visuals (2026-10-26) ✅
Playtest feedback said attacks showed no sword action. In battle, Adrian now holds the **blade of light** the heirloom forms.
- **New 40×32 battle poses** (`src/game/combat/heroBattleSprite.ts`, original pixel art): ready (two breathing frames), wind-up (blade drawn back over the shoulder) and strike (arm and blade thrust forward). Victory raises the blade.
- **Attack timeline:** wind-up and pull back → dash in → strike lands at 0.2 s → **hit-stop** (both sides freeze 0.1 s) → step back. Sound and damage numbers stay in sync.
- **Slash trail:** a white arc sweeps across the Guardian on Attack. Radiant Strike gets a bigger golden double arc on top of the existing burst. The blade also casts a soft glow that flares on each strike.
- **Unchanged:** battle rules and numbers, and exploration (Adrian is unarmed outside battle).
- **Verified in the browser** by freezing frames at impact for both Attack and Radiant Strike, plus the wind-up pose. 105/105 tests pass; the build succeeds.

### Deployment verification (2026-10-26, live site) ✅
- HTTP 200. The JS and CSS files are byte-identical to the local production build (same content hashes). Hashed assets are served with `max-age=31536000, immutable`; the favicon loads.
- **The full prologue was played on the live site:**
  - New Game → opening narration → walk to the house → home (autosaved) → Aunt Mara → heirloom awakening → hidden passage → chamber → Guardian battle.
  - Pausing mid-battle shows Save greyed out. Resume continued the fight.
  - VICTORY (Guardian 0/24, Adrian 22/30) → back in the chamber, objective "Read the ancestral message" → inscription → Daniel Rengas → **CHAPTER 0 COMPLETE** (automated run 0:55, text skipped instantly).
- **Save/load on the live site:** the completed game was autosaved. After a browser refresh the title showed "Continue · Chapter 0 complete · 0:55"; Continue reopened the completion card, and Main Menu returned to the title.
- **Console:** no errors; only the known harmless `THREE.Clock` deprecation warning from React Three Fiber.
- **Still for a human to check:** sound by ear, and a real-speed play-through to measure true play time (estimate 4–6½ min).

### Phase 6 — Save, menus, audio, deploy prep 🟡
- **Save system** (`src/game/save/save.ts`): localStorage key `paladin.save`, schema v1. It stores scene, position and facing, story flags (quest state is derived from them), play time and prologue completion.
  - Everything loaded is validated: corrupt JSON, other schema versions, unknown scenes, unknown flags, NaN or out-of-bounds positions, positions inside furniture, and scenes the story hasn't unlocked are all rejected or repaired. Nothing throws, even if storage is blocked or full.
  - No mid-battle saves: manual Save works only while exploring, and battle state is never stored.
- **Autosave checkpoints** (`AutoSave.tsx`): on arriving in a scene (after arrival dialogue sets its flags), after beating the Guardian, and at chapter end. A small "✦ Saved" toast shows each time.
- **Title screen:** New Game; Continue only when a valid save exists, showing location and play time; Settings. New Game asks before erasing an existing save. Invalid saves show a warning instead of crashing. A footer states the setting is fiction and alternate history.
- **Pause menu** (Esc): Resume, Save (greyed out with a reason during dialogue or battle), Settings, Return to Main Menu (asks first; Cancel is the default). Pausing freezes movement, dialogue keys and battle pacing.
- **Settings** (persisted separately): text speed (Slow / Normal / Fast / Instant), volume, sound on/off.
- **Chapter complete card:** Play Again and Main Menu.
- **Audio** (`src/game/audio/`): synthesized at runtime with Web Audio, so no files and no licensing.
  - Ambience per scene: river and birds in the village, a warm pad at home, a low drone in the chamber, a heartbeat pulse in battle, plus title and ending pads.
  - SFX for menu moves, dialogue lines, doors, objectives, the heirloom awakening, every battle action, victory, defeat and saving.
  - Starts on the first key or click (browser autoplay rules). `AudioDirector` listens to game state, so gameplay code knows nothing about sound.
- **Robustness:** an error boundary offers "Return to Main Menu" instead of a blank page.
- **Deploy prep:**
  - `netlify.toml`: build `npm run build`, publish `dist`, Node 22, immutable caching for hashed assets, revalidated HTML, basic security headers.
  - SVG favicon, meta description, `<noscript>` message.
  - `.claude/launch.json` gains `paladin-prod` (vite preview on :4173).

**Phase 6 test results (2026-10-26):**
- `npm test`: 105/105 pass, 20 new. They cover save validation and repair, corrupt, incompatible and blocked storage, the save → "refresh" → Continue round trip, completed saves reopening on the ending card, pre-battle checkpoint restore, pause rules and settings validation.
- `npm run build`: OK.
- **Verified in the browser on the production build** (`vite preview`, the same files Netlify would serve):
  - Title with no save (Continue hidden).
  - Settings change saved to storage.
  - New Game: the confirming E didn't skip the first line.
  - Walked into the house: autosave toast, save written.
  - Esc → pause → Save ("Game saved.") → Return to Main Menu → confirm (default Cancel) → title shows Continue with "Vale Family Home · 0:19".
  - **Browser refresh → Continue** restored the home at the exact saved position, with the correct objective and no arrival-scene replay.
  - Corrupted save and incompatible-version save: no crash, Continue hidden, warning shown.
- **Not yet verified in the browser on the production build:**
  - Pausing mid-battle (Save greyed out) and the finished-game save reopening on the ending card. Both pass unit tests.
  - Audio is untested by ear: I can't hear the browser. Needs a quick listen.
  - The automated run stopped because the app window went out of view, which throttles the page to about 1 frame/s.
  - The battle and ending were fully browser-tested in Phases 4–5 on the dev build.
- **Not done:** GitHub push and Netlify deploy (waiting for the owner's go-ahead), and Playwright e2e (not installed, to avoid a large browser download).

### Phase 5 — Complete prologue ✅
- **Scene 5, Revelation:** after the Guardian falls, abstract glowing script fades in on the chamber's back wall. "Inspect Glowing Inscription" plays the message:
  - The required line appears exactly, in a centred gold inscription style: **"The oath was never sworn to the Crown alone."**
  - It continues: the Vale Paladins refused a palace order to empty the river villages and were branded traitors for standing with the people, signed by Elias Vale (fictional).
  - Sets `read_message`.
- **Scene 6, Royal Attention:** the message chains straight into Daniel Rengas (Royal Security Office, fictional) coming down the stairs. His sprite appears on the first line (an NPC gated by `daniel_arrived`). He explains the old palace sensors detected the awakening, hints that some in the palace doubt the treason story, and points Adrian to **Kuching**.
- **CHAPTER 0 COMPLETE:** the screen fades in with the chapter title, the key quote, the play time, a locked "Chapter 1 · Kuching" notice and **Play Again**, which starts a fresh New Game. All input is frozen in `mode: 'ending'`.
- **Engine additions:**
  - Dialogue `next` (chain conversations) and `endChapter`.
  - Line `style: 'inscription'`.
  - NPC `when` conditions.
  - Store `endChapter()`, `newGame()`, and `startedAt` / `completedAt` for the play-time readout.
- **Pacing pass:**
  - Estimated from the actual dialogue (45 required lines, 575 words, at 200 wpm or typewriter speed plus key presses), walking routes and battle pacing: **about 4:00 rushing through required content, about 6:20 reading everything and exploring.**
  - That sits at the low end of the 5–10 min target. I didn't pad it; a first-time player who reads and looks around should land around 5–6½ minutes. **This needs a real human play-through to confirm.** The end screen shows the measured time.
  - Pacing changes made: the message flows straight into Daniel (no dead walk back), Daniel stands in view during his scene, and arrival points sit away from exits.

**Phase 5 test results (2026-10-23):**
- `npm test`: 85/85 pass, 8 new. One test plays the **entire prologue** from New Game to CHAPTER 0 COMPLETE and checks objectives in order. Others cover inscription gating, the exact required line, Daniel's visibility, chaining, input lock on the ending, and Play Again.
- `npm run build`: OK.
- **Full browser play-through** with keyboard and mouse input, from opening narration to the ending screen: every objective updated in order, the inscription and Daniel rendered, the ending card showed, and Play Again restarted cleanly. No console errors.
- The automated run took 0:50 because it skips text instantly; that's only the mechanical floor.

**Dev-server note:** on this Windows machine Vite's file watcher sometimes missed several quick back-to-back writes to one file (made by a script), so it served stale modules and caused errors that weren't really in the code. If the browser behaves differently from the tests, restart `npm run dev`. The production build is unaffected.

### Phase 4 — Turn-based battle ✅
- **Rules** (`src/game/combat/battle.ts`): pure and deterministic. The player goes first; turns alternate; Attack 6, Radiant Strike 10 (2 charges), Defend halves the next hit; victory at enemy HP 0, defeat at player HP 0. HP never goes below 0. Numbers live in `src/data/encounters.ts`.
- **Store flow:** the `guardian_awaken` dialogue ends with `startBattle`, which switches to `mode: 'battle'`. Stages run intro → command → player_action → enemy_action → command…, then victory or defeat.
  - Victory sets `guardian_defeated`, returns to the chamber (`after_battle` spawn) and plays `guardian_defeated`. The objective becomes "Read the ancestral message."
  - Defeat offers Retry, which fully resets HP and charges. The retried battle is winnable, so defeat can't block the prologue.
  - The Guardian never re-triggers after defeat.
- **Arena** (`BattleArena.tsx`): a close fixed framing of the chamber with Adrian on the left and the Guardian on the right.
  - Adrian lunges on Attack and Skill; the Guardian lunges on its attack.
  - Whoever takes a hit shakes and flashes red.
  - Radiant Strike adds a gold ring burst and a light flash.
  - Defend shows a blue shield until the next hit.
  - Floating damage numbers and "Guard!".
  - On victory the Guardian sinks and fades; on defeat Adrian collapses.
- **Guardian sprite:** original 32×40 stone sentinel drawn in code (`guardianSprite.ts`), with gold eyes and the sword-over-river emblem.
- **Battle HUD** (`BattleHud.tsx`):
  - Enemy and player HP bars, Radiant Strike charge pips and a "Guarding" status.
  - A message log with help text for the highlighted command.
  - Command menu: ↑/↓ or W/S and E/Enter/Space, or mouse. Radiant Strike is greyed out and skipped at 0 charges.
  - A first-turn tutorial tip.
  - A VICTORY banner with Continue, and a DEFEAT panel with Retry Battle.
  - Automatic pacing (~1.1 s per action, which E can skip).

**Phase 4 test results (2026-10-23):**
- `npm test`: 77/77 pass, 17 new, covering every §19 Combat rule plus the in-game flow (start from story event, victory return, no re-trigger, defeat → retry → win).
- `npm run build`: OK.
- Browser play-through:
  - The sign starts the Guardian's speech, then the battle.
  - Radiant Strike showed the burst, "-10" and 14/24.
  - The enemy hit for 4 (26/30). Defend showed the shield, then "guard holds: only 2 damage".
  - The second Radiant Strike left ×0 and greyed out. Attack brought the Guardian to 0/24 → VICTORY → back to the chamber, farewell dialogue, objective "Read the ancestral message."
  - Defeat path: defending repeatedly reached 0/30 → DEFEAT → Retry restored 30/30, 24/24 and ×2.
  - No console errors after a clean reload.

**Balance note:** with the master-prompt starting values, the battle is very forgiving. The Guardian deals 4 a turn against 30 HP, so you only lose by defending about 15 times in a row. Fine for a tutorial; tune in `encounters.ts` if desired.

### Phase 3 — Story objectives ✅
- **Quests:** a linear objective list (`src/data/quests.ts`) derived from story flags (`src/game/quests/quests.ts`). The active objective is the first incomplete one, so there's no quest state to sync, completed steps can't re-trigger, and later flags can't skip earlier objectives. A HUD tracker sits top-right and flashes "New Objective" on change.
- **Flags and conditions** (`src/game/core/flags.ts`): one typed list of flags, plus `requires` / `unless` conditions shared by dialogue rules and interactables.
- **Scenes:** a registry (`src/data/scenes.ts`) with names, spawn points and arrival dialogue. The store handles `requestScene → swapScene → finishTransition` with a 350 ms black fade (`SceneFade`). Input is blocked mid-transition. The HUD location label follows the scene.
- **Shared rig** (`ExplorationRig`): player, NPCs, interactions and camera for any scene. Colliders can depend on flags (the open hatch blocks the hole).
- **Scene 1:** opening narration plays on load (`village_arrival`).
- **Area B (family home):** plank floor, cut-away front wall, back wall with windows and the family portrait (blank nameplate, inspectable), table with teapot and stools, cabinet, bookshelf, plants.
- **Aunt Mara:** a new sprite (white bun, maroon blouse, long skirt) with an intro, a repeat line and a post-awakening line.
- **Heirloom:** a bronze medallion on a pedestal with three interactables gated by story state:
  - Before Mara: inspect → "say hello first".
  - After Mara: Touch → the awakening.
  - After awakening: inspect.
- **Awakening:** individual dialogue lines can set flags, so the medallion flares mid-conversation (pulsing glow, gold light, the sign traced on the floor). The final line opens the floor hatch (dark stairwell, steps, warm light from below).
- **Paladin sign:** an original sword-over-river insignia drawn in code (`insignia.ts`), used on the medallion, the home floor and the chamber.
- **Area C (ancient chamber), minimal:** stone floor, pillars, flickering braziers, a glowing floor sign, a wall relief and stairs back up. The arrival narration sets `entered_chamber`. The Guardian comes in Phase 4.
- Uncle Lim gets a new line after you've been home.

**Phase 3 test results (2026-10-23):**
- `npm test`: 60/60 pass, 23 new. They cover the whole discovery sequence through store actions, objective order and no-skip, transitions, arrival-once, heirloom gating, spawn safety, exit targets, dialogue references, and on-foot reachability of every interactable in all 3 scenes.
- `npm run build`: OK.
- Browser play-through in the pane: opening narration → walk to the house → fade → home arrival (objective: Speak with Aunt Mara) → Mara intro (objective: Inspect the heirloom) → Touch Heirloom (glow and floor sign visible) → passage opens → Enter Hidden Passage → chamber arrival (objective: Defeat the Guardian) → stairs back up → exit to village.
- No console errors after a clean reload.

### Phase 2 — NPC and dialogue ✅
- Zustand store (`src/game/core/gameStore.ts`): mode (`explore` / `dialogue`), story flags, interactable in range, active dialogue. Exposed in dev as `window.__PALADIN_STORE__`.
- Reusable interactions (`src/game/interaction/`): kinds talk / inspect / collect / activate / enter (only talk and inspect do anything yet). Nearest target within its radius wins. Prompt reads `[E] Talk to Uncle Lim`.
- One action-key handler: E interacts while exploring; E / Enter / Space advance dialogue. Held keys (repeat) are ignored, so one press can't both open and skip.
- Data-driven dialogue (`src/data/dialogue.ts`): speaker or narration, a typewriter effect (first press reveals the full line, the next advances), a ▼/■ continue marker, flags set on completion, an optional completion callback.
- Story-state rules choose the conversation (`selectDialogue`): Uncle Lim gives his intro once (sets `met_lim`), then a short repeat line.
- NPC: Uncle Lim, shopkeeper outside the kedai. Generated sprite with his own palette and glasses, idle animation, collider, and he turns to face the player while talking.
- The family home stairs are an "Inspect" point with narration (sets `saw_family_home`). It becomes the door to the interior in Phase 3.
- Player movement is frozen while dialogue is open.
- Character sprite code is shared (`spriteBody.tsx`); palettes live in `src/data/characters.ts`.

**Phase 2 test results (2026-10-23):** `npm test` 37/37 pass; build succeeds. Browser check: prompt hidden at spawn and shown in range; E opens Lim's intro with the correct speaker; typewriter, reveal and advance work through all 5 lines; player can't move during dialogue; `met_lim` is set; the second talk plays the repeat line; Lim turns to face Adrian from the side; family home narration shows no name plate and italic text; no console errors on a clean load.

## Completed

### Phase 0 — Project foundation ✅
- Vite 8 + React 19 + TypeScript + Three.js 0.186 + React Three Fiber 9 + Zustand (installed, not yet used) + Vitest.
- Scripts: `dev`, `build`, `preview`, `test`, `typecheck`.
- `netlify.toml` (build `npm run build`, publish `dist`). Relative asset base (`./`).
- `.claude/launch.json` for the desktop preview pane.

### Phase 1 — HD-2D exploration (first deliverable) ✅
- Real 3D village square (Area A, Sungai Awan): ground, dirt paths, river, plank boardwalk with railing, far riverbank tree line.
- Three low-poly buildings with gabled roofs, doors and lit windows; the Vale family home is on stilts with a veranda and stairs.
- Props: palms, crates, barrel, bench, lamp posts, planters.
- 2D pixel-art placeholder hero (Adrian Vale), drawn in code: 16×24 frames, idle + walk, four facings (west mirrors east), auto outline, nearest-neighbour sampling.
- Upright sprite with 1/cos(pitch) height correction, alpha-tested so depth works against 3D geometry; blob shadow.
- Fixed orthographic camera, 42° pitch, frame-rate-independent smooth follow, constant world height at any window size.
- WASD + arrow keys, four-direction movement (most recently pressed key wins), delta-time movement, stuck-key reset on window blur.
- Collision: circle vs. axis-aligned boxes with per-axis sliding and anti-tunnelling sub-steps; world bounds keep the player off the river.
- Warm directional light with shadows, hemisphere fill, fog.
- Minimal HUD: location label, controls hint. 16:9 letterboxed frame.

## Test status (actual results, 2026-10-23)
- `npm test`: **16/16 passed** (collision, bounds, village layout, input, animation frames).
- `npm run build`: **succeeds** (JS bundle 1.15 MB / 315 kB gzip; mostly three.js).
- Manual browser check (desktop app browser pane, dev server):
  - Moves in all four directions; facing updates to match (checked through the dev-only `window.__PALADIN__` state).
  - Measured speed ≈ 3.2 units/s, matching `PLAYER_SPEED`.
  - Stops against the shop wall (z ≈ 0.21 = wall + radius) and at the south map edge.
  - Bench correctly hides the sprite's legs when the player stands behind it (depth sorting works).
  - No console errors on a clean load.
  - ~144 FPS measured in the pane on the dev machine (display-capped). **Not yet measured on low-end hardware.**

## Known issues / notes
- `THREE.Clock` deprecation warning comes from inside React Three Fiber; harmless.
- Bundle-size warning limit raised to 1.5 MB; code-split when more scenes exist.
- Player sprite is hidden behind palm fronds when directly behind a palm. That is correct depth, but may need fading later.
- The family home stairs are blocked by a collider until the interior scene exists.
- Playwright is not installed yet (deferred so we don't download browsers before e2e tests are needed).
- Not deployed to Netlify yet; no GitHub remote yet.
