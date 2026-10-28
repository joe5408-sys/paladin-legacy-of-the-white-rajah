# Phase 10 — The First Story, Finished Properly (proposal)

> Status: **Draft for the owner to agree** (2026-10-28). Nothing here is built yet. Decisions to agree are at the end.
> Why this phase: Chapters 0–3 (the first story) are complete and live, but they were built and balanced without a single measured human play-through, on emulated phones only, with no outside read of the Sarawak setting, and with the 3.5 live check still open. Every later chapter stands on those unknowns. This phase measures and fixes the first story before Chapter 4 is designed.

## Goal and acceptance
The first story is ready to show people outside the project:
1. Every browser test passes **against the live site**, and nothing reaches `master` without the unit tests passing.
2. **Real play times and difficulty are measured** with real players, and the worst problems they hit are fixed.
3. The game runs acceptably on **real phones**, with a graphics setting for weak devices.
4. **Someone from the region has read** the characters and dialogue, and their notes are dealt with.
5. A short **credits screen** closes the story.

## Milestones
Small and separately shippable, like the chapter milestones. Each is tested and deployed before the next.

| # | Milestone | Content | Done when |
|---|---|---|---|
| 10.1 | **Verification debt** | Run the browser suite against the live site (from the PC, or after allowing `legacyofwhiterajah.netlify.app` in the cloud environment's network settings) and record it. Make Netlify run the unit tests before building (`npm test && npm run build`), so a failing test stops a deploy. Add a GitHub Actions check: typecheck, unit tests and build on every push. Keep the browser suite on the PC or as a nightly job: on a cloud runner it takes about 25 minutes (see the 3.5 notes on slow machines). | Live suite 5/5 recorded; a deliberately broken test blocks a Netlify deploy (tried once, then reverted). |
| 10.2 | **Play-test kit** | A hidden play-test mode (opened with `?playtest` in the address) that records, on the player's own device only, the time at each objective and each battle's result (win, loss, retries, HP left). The chapter card shows a summary the tester can copy and send. No data leaves the device unless the tester sends it. Plus a one-page script for testers. | Kit used once by the owner on Chapter 0, and the summary reads correctly. |
| 10.3 | **Play-tests and fixes** | Five or more testers, ideally with two or three who don't play many games. Fix what blocks or confuses several testers, and retune battles that most testers lose, or that nobody finds hard. Record play time per chapter against the 15–20 minute target. | Results table in `PROGRESS.md`; every problem found by two or more testers fixed, or written down with a reason it stays. |
| 10.4 | **Real phones and weak devices** | Test on at least one mid-range Android phone and one iPhone, measuring frame rate in the village, the night boat and a battle. Add a **Graphics: Full / Light** setting in the existing Settings panel (Light: no shadows or smaller shadow maps, and a lower pixel ratio), defaulting to Light when the first seconds run slowly. Fix touch problems found. | Measured frame rates recorded per device and setting; the mobile browser test still passes. |
| 10.5 | **Outside read and polish** | A reader from Sarawak reads Chapters 1–3 (characters, dialogue, the palace and the land storyline), as recommended in `CHAPTER_2.md` and `CHAPTER_3.md`. Act on their notes. Bring `ASSET_REGISTER.md` up to date: it stops partway through Chapter 2 (no entries for the waystation spirit, the Hollow and Iron Wardens, or anything in Chapter 3). A short credits screen after the Chapter 3 card, built from the register. A text-speed setting if testers asked for one. | Reader's notes and the changes made are recorded; register complete; credits screen live. |

## Methods notes (what the evidence will and won't show)
- **Five testers is a qualitative check, not a measurement.** It is a common usability rule of thumb that a handful of testers finds most of the serious problems. That is a heuristic, not a law, and it gives no reliable averages. Report play times as each tester's own numbers (range and median), not as a "mean play time".
- **The testers won't be representative.** Friends and family are likely to be kinder and more experienced than strangers. Note who they are (how much they play games, phone or PC), so the results aren't over-read.
- **Battle tuning:** the strategy unit tests already prove that each fight *can* be won and *can* be lost. Play-tests answer a different question: whether real people understand the mechanics from the tips. Retune only when the same problem shows up in several testers.
- **Frame rate:** measure it on the device, not by eye. In this cloud session the game drew about 10–17 frames per second under software-only graphics; that is not a phone measurement, but it suggests weak devices need the Light setting.

## Not in this phase
- New chapters, new systems, new art beyond the credits screen.
- Analytics that send data anywhere. Play-test data stays on the tester's device unless they choose to send it.
- Large refactors. Fix what testing shows; leave the rest.

## After this phase: Chapter 4 (outline only)
A full `CHAPTER_4.md` design comes after 10.3, because the play-test results should shape its length and difficulty. The open hooks from `CHAPTER_3.md` give three candidate directions:
1. **The other erased families:** the sealed records room still holds other families' and villages' tin boxes. Adrian, now a known Paladin, is asked to help one of them. *Strength:* it directly continues the theme (who decides who is remembered). *Risk:* it is the closest of the three to real land and records disputes, so the sensitivity rules matter even more.
2. **Who built the Crowned Sentinel:** the Paladins' own history, other waystations, and whether the Vales were the last. *Strength:* wonder and exploration, less real-world sensitivity. *Risk:* lore-heavy; the master prompt warns against complicated lore.
3. **Harrow's half of the archive:** Harrow is dismissed, not defeated, and kept his family's papers. *Strength:* a clear antagonist. *Risk:* a "villain returns" plot is the most predictable.
**My recommendation:** direction 1 as the main story, with one thread of direction 2 (one other waystation) for wonder and a possible third Paladin art. Harrow stays in the background. Chapter 3 Decision 9 already set the third art aside for Chapter 4.

The two-new-systems rule would still apply. Candidates to decide in the design doc, not now:
- **A third Paladin art.** Low risk; it reuses the battle rules.
- **Choosing the order of two or three places to visit.** This means more freedom but also more states to test, and saves get harder.
- **A second playable fighter.** This breaks the one-on-one battle decision from Chapter 2, so I would not defend it.

## Decisions to agree
1. **Do Phase 10 before designing Chapter 4.** The alternative is to start the Chapter 4 design now and run the play-tests alongside it. I'd advise against that, because the play-tests should set Chapter 4's length and difficulty.
2. **Netlify runs the unit tests before every deploy** (10.1). The unit tests take about 6 seconds here.
3. **A hidden play-test mode that keeps data on the device** (10.2), rather than testers timing themselves.
4. **A Graphics: Full / Light setting** (10.4). The alternative is to make the game lighter for everyone, but that would lose the look on good devices.
5. **A credits screen** (10.5). This needs a decision on whose names go in the credits. Every asset is original project code, but the register has to be brought up to date first (10.5).
6. **Who the outside reader is** (10.5), and whether they are paid or credited. This is for the owner to arrange.
