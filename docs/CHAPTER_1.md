# Chapter 1 — The Capital's Shadow (design draft)

> Status: **Milestone 1.1 playable.** Story beats below are a working draft and can be changed. All dialogue lives in `src/chapters/chapter1/data.ts`.
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
| 1.2 | **The Royal Archives** | Interior of the Archives at dawn. An archivist NPC. Investigation: inspect three record shelves to find the redacted Vale file (light puzzle using the existing inspect / flag system). | ⬜ Next |
| 1.3 | **The Hollow Sentinel** | A palace construct (original design) guards the sealed vault. Second turn-based battle, reusing the battle system with new tuning, plus one new Paladin skill if it earns its place. | ⬜ |
| 1.4 | **The Redacted Name** | The vault reveals who signed the 1920s order (fictional official), then a confrontation hook with palace security and a cliffhanger into Chapter 2. Chapter 1 complete card. | ⬜ |

## Characters (Chapter 1)
- **Adrian Vale**: protagonist.
- **Aunt Mara**: comes along "whether you like it or not"; knows the city as it was.
- **Daniel Rengas**: Royal Security Office; quietly helping, now cut off from his own systems.
- **Kak Jamilah**: kolo mee stall owner on the waterfront (warm local colour, light humour).
- *(1.2+)* **The Archivist**: neutral keeper of records; knows more than they say.

## Objectives (Milestone 1.1)
1. Meet Daniel at the ferry pier. (`c1_met_daniel`)
2. Go to the Royal Archives. (`c1_archives_reached`) → chapter pauses on "To Be Continued".
