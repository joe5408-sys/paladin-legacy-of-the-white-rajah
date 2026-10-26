# Chapter 1 — The Capital's Shadow

> Status: **Complete: milestones 1.1–1.4 playable from start to finish.** Story beats below are a working draft and can be changed. Dialogue lives in `src/chapters/chapter1/{data,archivesData,vaultData,recordsData}.ts`.
> Setting reminder: an imagined, alternate-history Kuching. The Palace, Royal Archives, Royal Security Office and all officials are invented and are not real institutions or people.

## Premise
Adrian, Aunt Mara and Daniel Rengas follow the trail of the erased treason record to the capital. Someone inside the palace is already covering the awakening up. The chapter asks who rewrote the Vale family's history, and why the Crown's archive still carries the Paladin sign.

## Scope rules (MASTER_PROMPT §23)
- Each milestone is small, playable, tested and deployed before the next begins.
- Reuse existing systems (exploration, dialogue, quests, one-on-one battles, saves). New systems need a clear story reason.
- Chapter content is lazy-loaded (`src/chapters/loader.ts`), so it never slows the first load.

## Milestones
| # | Milestone | Content | Status |
|---|---|---|---|
| 1.1 | **Arrival in Kuching** | Waterfront area at dusk (shophouses, Royal Archives, boardwalk and pier, the Palace and old fort across the river, kolo mee stall, bandstand). Chapter title card. Meet Daniel at the pier; find the Archives sealed until dawn → "To Be Continued". | ✅ Done |
| 1.2 | **The Royal Archives** | A night passes; the Archives open at dawn. Interior with tall stacks, dawn light and the sealed iron door. The Archivist (new). Investigation: Treason Proceedings shows a gap where the Vale folder should be → the Archivist hints that embarrassments were filed with the household accounts → the Household Ledgers hold the redacted file: the 1921 order was signed by **Lord Chamberlain R. Harrow** under the royal seal, but the **Rajah's signature line is blank**. The iron door's Paladin sign wakes → "To Be Continued". | ✅ Done |
| 1.3 | **The Hollow Sentinel** | The iron door opens onto a cold vault hall lined with sealed cabinets. The **Hollow Sentinel** (original design: a brass-and-ironwood palace construct in livery, crowned faceless mask, empty cage for a chest holding a cold blue flame) guards a barred inner gate: "BY ORDER OF THE LORD CHAMBERLAIN. NO VALE SHALL PASS." Second battle, reusing the battle system: HP 42, slash 7, and a **telegraphed heavy blow** (charges every 3rd round, then strikes for 16). Defending against the heavy blow blocks it completely. No new Paladin skill was needed: the wind-up gives Defend its job. Victory leaves a brass plate (royal seal over a scratched-out Paladin sign) in its chest, which unlocks the inner gate: rows of sealed boxes, one marked VALE → "To Be Continued". | ✅ Done |
| 1.4 | **The Redacted Name** | The inner gate opens onto the sealed records: shelves of tin boxes, each a family or village erased from the map. The **VALE box** holds Harrow's motive: a concession of the river lands to the Harrow & Pell Timber Company (half of it his), and the one unredacted charge sheet: **ELIAS VALE**, Paladin of the Crown, charged with treason for refusing a lawful order. In the Private Office records, a misfiled letter: the Rajah refused to sign ("Keep the sign safe until the Crown deserves it again"). Then **Lord Chamberlain Edmund Harrow**, the 1921 Harrow's great-grandson, arrives with Royal Security and demands the box and the medallion, hinting that Sungai Awan is in danger. The medallion flares, the lights die, the Archivist opens the old flood door, and Daniel stays behind to stall them. Mara waits below in a sampan → upriver → **Chapter 1 Complete**. | ✅ Done |

## Characters (Chapter 1)
- **Adrian Vale**: protagonist.
- **Aunt Mara**: comes along "whether you like it or not"; knows the city as it was.
- **Daniel Rengas**: Royal Security Office; quietly helping, now cut off from his own systems.
- **Kak Jamilah**: kolo mee stall owner on the waterfront (warm local colour, light humour).
- **The Archivist**: dry, exact keeper of the Royal Archives for thirty years. She knows more than she says, and the iron door has never made a sound for her.
- **The Hollow Sentinel**: a palace-built construct that bears the royal seal over a scratched-out Paladin sign. Not a character so much as an order that kept running.
- **Lord Chamberlain Edmund Harrow**: today's holder of his great-grandfather's office. Polite, certain, and convinced that paper, not swords, keeps a crown. Fictional.
- **Royal Security officers**: Harrow's escort (unnamed).
- *(mentioned)* **Elias Vale**: Adrian's great-grandfather, the Paladin whose name was redacted. He refused the 1921 order and was charged with treason.
- *(mentioned)* **Lord Chamberlain R. Harrow** (1921): signed the order to empty the river villages under the royal seal, without the Rajah's signature. Fictional.

## Objectives
1. Meet Daniel at the ferry pier. (`c1_met_daniel`)
2. Go to the Royal Archives. (`c1_archives_reached`): the night passes and the doors open at dawn.
3. Find the treason records. (`c1_clue_gap`)
4. Ask the Archivist about the missing folder. (`c1_hint_household`)
5. Search the household ledgers. (`c1_file_found`)
6. Investigate the iron door. (`c1_vault_found`): it opens into the vault.
7. Get past the brass figure in the vault. (`c1_sentinel_defeated`): the Hollow Sentinel battle.
8. Open the inner gate. (`c1_inner_gate_open`): into the sealed records.
9. Open the VALE box. (`c1_box_read`)
10. Find the Rajah's reply. (`c1_letter_found`): Harrow arrives (`c1_security_arrived`), the lights go out (`c1_lights_out`).
11. Escape through the flood door. (`c1_escaped`) → **Chapter 1 Complete**.

Optional: Kak Jamilah, Aunt Mara's lines, the Land Grants shelf (an 1898 grant to the Vale family, struck out in 1921), Daniel in the Archives, the vault's sealed cabinets, the erased villages' boxes, and Harrow and Daniel in the dark.

## Hooks for Chapter 2
- Harrow's threat: Sungai Awan, "while it is still there". The concession may be revived.
- Daniel stayed behind in Royal Security custody.
- "Elias did not hide everything in a palace": what Elias left upriver.
- The Rajah's letter: the Crown itself was on the Paladins' side once. What does the palace look like today?
