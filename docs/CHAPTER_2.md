# Chapter 2 — The River Remembers

> Status: **Design agreed 2026-10-26** (defaults accepted; see Decisions). **Milestones 2.1–2.3 playable**; 2.4 next.
> Setting reminder: an imagined, alternate-history Sarawak. Sungai Awan, the Paladin order, the Harrow family, the Harrow & Pell Timber Company, its modern successor and every official named here are invented. They do not depict real people, companies, institutions or land disputes.

## Premise
Adrian escapes the capital with the VALE box and two warnings ringing in his ears. Harrow said Sungai Awan is safe only "while it is still there", and Mara said "Elias did not hide everything in a palace." With Mara, he heads home up the river to Sungai Awan.

He finds survey pegs in the village and a Crown notice on the board. A new company, **Awan Riverlands Development**, is reviving the 1921 concession. Its manager is a polite young man named **Julian Pell**, whose family once owned the other half of the Harrow & Pell Timber Company.

Following Elias's trail upriver, Adrian finds an old **Paladin waystation** and learns a second Paladin art. Inside, he finds what Elias died protecting: the **River Charter**, signed and sealed by the Rajah in 1921, granting the river lands to the people who live on them, forever. It was never registered. Harrow has had a century to bury it, and now he sends something to the village to take it back.

**The chapter's question:** what is a Paladin *for* today, when the enemy carries paperwork instead of a sword?

**Tone:** the same as Chapter 1. Warm village life, dry humour from Mara, quiet menace from the palace, and wonder at the old order. The land theme is told through one invented family and one invented village. The game takes the villagers' side without lecturing, and never comments on real-world disputes.

## Scope rules (carried over from MASTER_PROMPT and Chapter 1)
- **Five small milestones**, each playable, tested (unit + Playwright) and deployed before the next one starts.
- **Reuse first:** exploration, dialogue, quests, one-enemy turn-based battles (including the heavy-blow wind-up), saves, and lazy-loaded chapter content (`src/chapters/chapter2`, fetched only when needed).
- **Two new systems at most, each with a story reason:**
  1. **One new Paladin skill**, learned at the waystation (2.3).
  2. **A light puzzle** built only from existing inspect and flag logic, with no new engine code.
- **Target play time:** about 15–20 minutes for the whole chapter. Chapter 1's real play time hasn't been measured yet; a human play-through should set the baseline first.
- **No open world:** each area is a single scene reached by scene transitions, as in Chapters 0 and 1.

## Milestones
| # | Milestone | Content | New tech | Status |
|---|---|---|---|---|
| 2.1 | **Upriver** | A chapter title card, then the deck of an express boat on the wide brown river at dawn, with jungle sliding past. Adrian and Mara talk through what they found. A new character, **Captain Ah Hock** (the boat's skipper, gruff and kind), knows every bend of the river and remembers his grandmother's stories of "the people with the sword sign". On a passenger's phone, a news story: *Royal Household approves Awan Riverlands survey.* The boat arrives at the Sungai Awan jetty → next milestone. | A "moving" scene: a static boat with a scrolling riverbank backdrop (cheap: textured planes that move). | ✅ Done |
| 2.2 | **Home, Changed** | Sungai Awan again, re-dressed for Chapter 2: survey pegs with orange tape, a Crown notice on the board, and a survey boat at the jetty. Uncle Lim is furious and worried; a new villager, **Kak Siti**, the village clinic nurse, hears everything first. **Julian Pell** introduces himself: charming, reasonable, offering "generous relocation packages". In the family home, Mara and Adrian take Elias's portrait off the wall. On its back is a river map with three marks and a verse. Objective: reach the waystation upriver. | A Chapter 2 variant of the village layout (reusing the village scene's pieces with new props and flags). | ✅ Done |
| 2.3 | **The Waystation** | A longboat trip with Ah Hock to a stone landing hidden in the jungle above the rapids. It is an **original** Paladin site: mossy steps, three standing stones carved with the sword-and-river sign, and a sealed door. **Light puzzle:** Elias's verse gives the order to wake the stones with the medallion. Get it wrong and the stones go dark again (no penalty). The door opens on a **training spirit**, a mirror of the prologue Guardian, which teaches the new skill **River Ward** in a short battle. | **River Ward** skill: restores HP and blocks the next hit, with one use per battle (exact numbers to be tuned by tests). | ✅ Done |
| 2.4 | **The River Charter** | Inside the waystation: Elias's journal (his own voice for the first time), the Paladin oath carved in full, and in a sealed case the **River Charter** of 1921 with the Rajah's signature and seal. **Daniel returns.** He was released "for lack of evidence", which he knows means *so they can follow him*. Tension: did he lead them here? He brings news that Harrow's barge is coming upriver tonight with "equipment". Mid-chapter battle on the landing: a **Hollow Warden**, a Sentinel built for the jungle, sent ahead to clear the site. | Second enemy design (reuses the Sentinel's battle rules with new tuning and sprite). | ⬜ |
| 2.5 | **The Iron Warden** | Dusk at the Sungai Awan jetty. The barge arrives with Julian Pell and the **Iron Warden**, Harrow's largest construct, to "secure the survey". Boss battle in **two phases**: armoured (normal attacks barely scratch it; Radiant Strike cracks the armour), then exposed (heavy-blow wind-ups; River Ward matters). Victory: the Warden falls into the river. Pell sees the Charter and, for the first time, is unsure which side he is on. Adrian decides to take the Charter to the capital, to the Rajah himself → **Chapter 2 Complete**. | Boss phases (a small, data-driven extension of `battle.ts`: an `armor` value that Radiant Strike removes). | ⬜ |

## Milestone 2.1 as built
- **Scene:** the open rear deck of an express boat on the Rajang (`src/chapters/chapter2/{Boat.tsx,boatData.ts}`), with the passenger cabin to the west and the engine to the east. The boat stands still; the muddy river's foam streaks and the far bank (jungle and longhouses on stilts) drift past and wrap around.
- **People:** Aunt Mara by the bench; a university **Student** with the news on his phone; an **Auntie** with a basket of rambutans (optional); **Captain Ah Hock** frowning at his engine.
- **Story order:** Mara (Elias went upriver in 1921 with a map he never showed anyone) → the Student (*Royal Household approves Awan Riverlands survey*) → Ah Hock (offers his cousin's longboat from Kapit; his grandmother's story of the sword-over-river people who "kept the floods honest") → collect your things from the cabin → Kapit → by longboat to Sungai Awan, where survey pegs with orange tape line the bank → **To Be Continued**. Each step is locked until the one before it is done.
- **Flags:** `chapter2_started`, `c2_arrived`, `c2_talked_mara`, `c2_saw_news`, `c2_talked_captain`, `c2_reached_jetty` (the current chapter end).

## Milestone 2.2 as built
- **Scenes:** `village_c2` and `home_c2` reuse the prologue village and home (buildings, furniture and colliders), with Chapter 2 people and props: a Crown notice board by the jetty, orange-taped survey pegs along the bank and at the Vale house, the white Awan Riverlands survey boat, and Ah Hock's blue longboat (`src/chapters/chapter2/{VillageC2,HomeC2}.tsx`, `villageData.ts`). The prologue scene components now accept a layout and extra props.
- **Story order:** arrival (Mara heads home "to make tea and be angry") → the notice ("Under the River Lands Concession of 1921…") → Uncle Lim (furious; some villagers want the money) → Julian Pell (polite, sincere, "come and object at the consultation") → Mara at home ("only one thing in this room has hung on that wall since 1921") → behind Elias's portrait, the ink map and the verse: *"Where the river forgets its name, wake the stones as the water woke: first the deep, then the bright, then the one that waits."* → **To Be Continued**.
- **Optional:** Kak Siti (Pell's men are hunting "the stones" at the old landing; a tin of leech balm), Ah Hock at the jetty, survey peg AR-115 at the Vales' front stairs.
- **Flags:** `c2_village_arrived`, `c2_read_notice`, `c2_talked_lim`, `c2_met_siti`, `c2_met_pell`, `c2_home_talked`, `c2_found_map`. Saves from the old 2.1 cliffhanger continue from the boat's cabin straight to the village.

## Milestone 2.3 as built
- **Scene:** `waystation_landing` (`src/chapters/chapter2/{Waystation.tsx,waystationData.ts}`). Stone steps rise from the river to a mossy terrace; jungle on both sides; a sealed slab door in a vine-hung cliff to the north. Mara and Ah Hock stay by the longboat. Like the rest of the Paladin order, the site is invented and not modelled on any real sacred place.
- **Getting there:** the map and verse behind the portrait now run straight into the longboat trip past the rapids ("my grandmother said the river forgets its name up here"). Saves from the old 2.2 cliffhanger can set off from the portrait, Mara, or Ah Hock at the jetty.
- **Puzzle:** the deep stone stands in a river pool (east), the bright stone in a shaft of sunlight (west), and the one that waits beside the door, turned to face it. Right order: each stone lights and threads of light join them; the third opens the door. A wrong first stone stays dark. Deep then the waiting stone puts the lit stone out again (`clearFlags`, the one small engine addition: set-only flags can't express a reset). Mara offers a hint (deep pools first, then the sun).
- **Battle:** the Spirit of the Waystation (the Guardian's sprite in river colours): HP 42, attack 5, a 14-damage wave wound up every other round that Defend only halves. **River Ward:** once per battle, heal 10 and block the next hit completely; it lasts through the enemy's charging turn. It is on the menu only once learned (`c2_learned_ward`) or in the battle that teaches it. Warding a wave and attacking wins with about 16 HP; ignoring River Ward loses. Max HP stays 30.
- **Ending:** the spirit pours its light into the medallion ("A sword protects one moment. A ward protects what comes after.") and returns to the river; the door stands open → **To Be Continued** (the inside is 2.4).
- **Flags:** `c2_went_upriver`, `c2_landing_arrived`, `c2_stone_deep`, `c2_stone_bright` (both cleared by a wrong order), `c2_stones_woken`, `c2_spirit_defeated`, `c2_learned_ward` (the current chapter end).

## Characters
**Returning**
- **Adrian Vale**: now carries the VALE box and knows his great-grandfather's name. He grows from investigator to protector.
- **Aunt Mara**: knows the river better than the city. She was a child when the last people who remembered Elias died. She is the comic relief, and she is also hiding grief.
- **Daniel Rengas**: released from custody and possibly being used as bait. He has to choose between his badge and the village.
- **Uncle Lim**: the prologue's neighbour, now angry at the survey and the first villager to stand with Adrian.
- **Lord Chamberlain Edmund Harrow**: mostly off-screen (calls, letters, the barge). He stays a presence, not a fight.

**New**
- **Captain Ah Hock**: express boat and longboat skipper; gruff, generous, superstitious about the rapids. He gets the party upriver in 2.1 and 2.3.
- **Kak Siti**: the village clinic nurse (changed from shopkeeper, since Uncle Lim already runs the kedai). She is warm and nosy, the village's information network, and a source of light humour.
- **Julian Pell**: manager of Awan Riverlands Development. He is great-grandson of Harrow's 1921 partner. Polite, idealistic in his own way, and not evil, which makes him a possible ally later.
- **Elias Vale** *(through his journal and the waystation)*: speaks to Adrian across a century.
- **Enemies (all original constructs, all built by the palace, never tied to any real group):**
  - **The training spirit**: friendly, a mirror of the Covenant Guardian.
  - **The Hollow Warden**: a jungle-going Sentinel.
  - **The Iron Warden**: a barge-borne boss.

## Objectives (draft)
1. Talk to Mara on the express boat. → 2. Disembark at Sungai Awan.
3. Read the notice on the village board. → 4. Talk to Uncle Lim. → 5. Meet the survey manager. → 6. Search the family home for Elias's trail.
7. Travel upriver with Ah Hock. → 8. Wake the three stones in the right order. → 9. Face the waystation's guardian (learn River Ward).
10. Search the waystation. → 11. Defeat the Hollow Warden.
12. Return to the village before the barge. → 13. Stop the Iron Warden. → **Chapter 2 Complete**.

## Battle and balance notes
- **Player stats:** stay the same until 2.3. River Ward then gives Adrian a defensive option instead of more raw damage. Consider raising max HP from 30 to 36 at that point as a visible "growth" moment.
- **Difficulty curve:** training spirit (easy, teaches River Ward) → Hollow Warden (about Sentinel level) → Iron Warden (needs Radiant Strike for the armour and River Ward or Defend for the heavy blows).
- **Tests:** like `sentinel.test.ts`, every fight gets strategy tests: the intended play wins with some HP to spare, and ignoring the mechanic loses.

## Technical notes
- New module `src/chapters/chapter2` (data, scenes, content registration); `loader.ts` gains chapter 2, and the Chapter 1 card gains "Continue to Chapter 2".
- **New scenes:** `boat` (2.1), `village_c2` (2.2; reuses village pieces), `waystation_landing` and `waystation_hall` (2.3–2.4), `jetty_dusk` (2.5; possibly a lighting variant of `village_c2`).
- **New characters:** `ahhock`, `siti`, `pell` (palettes in `characters.ts`). **New sprites:** the training spirit, the Hollow Warden and the Iron Warden (pixel art drawn in code).
- **Saves:** extend the flag list and per-scene requirements; migrate a save at the Chapter 1 Complete card into Chapter 2 via "Continue".
- **Audio:** river and boat engine ambience, waystation ambience, and a boss variant of the battle loop.

## Cultural and sensitivity notes
- **Kapit and the upper river** are home to Iban, Orang Ulu, Chinese, Malay and other communities. Show this through everyday environmental detail (boats, jetty, shophouse, longhouse silhouettes on the far bank, food, languages in passing). Don't use invented customs.
- **The waystation and its stones belong to the invented Paladin order.** They are not based on any real sacred site, ritual or belief, and the game must not present them as authentic local tradition.
- **Land and development** are real and sensitive topics in Sarawak. The story stays inside its fiction: an invented company, a fictional 1921 concession, a fictional charter. No real laws, cases, companies or politicians are referenced or imitated.
- **Names:** Ah Hock and Siti are common, everyday names. Before release, it would be worth having someone from the region read the new characters and dialogue.
- **The real river and towns** (Rajang, Sibu, Kapit) can appear as place names only, without specific real landmarks being depicted.

## Decisions (agreed 2026-10-26)
1. **Title:** "The River Remembers".
2. **Land theme:** kept: the fictional development and relocation storyline, as described above.
3. **New skill:** **River Ward** (heal plus block), learned in 2.3.
4. **Daniel:** a story ally, not a second fighter. Battles stay one-on-one.
5. **Julian Pell:** redeemable, an ally hook for Chapter 3.
6. **Real places:** the Rajang, Sibu and Kapit may be named in dialogue, as place names only.
7. **Scope:** five milestones (2.1–2.5).
