# Chapter 3 — The Crown's Word (working title)

> Status: **Design agreed 2026-10-27** (all draft defaults accepted; see Decisions). **Milestones 3.1–3.4 playable**; 3.5 next.
> Setting reminder: an imagined, alternate-history Kuching and Sarawak. The Palace, its Rajah, the Petition Hour, the Register of Royal Grants, Royal Security, the Harrow family, Awan Riverlands Development and every official named here are invented. They do not depict real people, institutions, ceremonies or legal processes.

## Premise
Adrian has the **River Charter** of 1921: signed and sealed by the Rajah, granting the river lands to the people who live on them, and never registered because Elias Vale was hunted down before he could carry it to Kuching. Adrian has decided to finish Elias's journey and put the Charter in front of the Rajah himself.

Lord Chamberlain Harrow knows the Charter exists now. By the time Adrian reaches the capital, he is a wanted man ("theft from the Royal Archives"), Daniel has been suspended, and the only door to the Rajah that Harrow doesn't control is an old right nobody has used in decades: **the Petition Hour**, when any subject may stand before the Rajah in person, if someone with a Crown charter will sponsor them.

The one person they know who holds a Crown charter is **Julian Pell**.

**The chapter's question:** the game's theme, answered at last. *The Crown remembers its heroes. History remembers its traitors. But who decides which is which?* In Chapter 3 the Crown has to decide, in public, with the evidence in front of it.

**Tone:** the same warmth and humour as before, with more tension: a city at night, a wanted poster with a bad photo of Adrian, and a palace that is beautiful and slightly frightening. The climax is a hearing, not a war: Adrian wins by telling the truth well, and then by protecting the people in the room.

## Scope rules (carried over from MASTER_PROMPT and Chapters 1–2)
- **Five small milestones**, each playable, tested (unit + Playwright) and deployed before the next one starts.
- **Reuse first:** exploration, dialogue, quests, one-on-one battles (heavy-blow wind-ups, River Ward, boss armour), saves, lazy-loaded chapter content (`src/chapters/chapter3`), and scene lighting variants (the dusk village from 2.5).
- **Two new systems at most, each with a story reason:**
  1. **Dialogue choices**: a short list of replies, chosen with ↑/↓ and E. Used sparingly: Pell's decision in 3.2 and, above all, **presenting evidence** at the hearing in 3.4. A wrong choice is never a fail state: Harrow rebuts it, and Adrian can try again.
  2. **A battle that ends in a yield**: the final construct stops fighting at a set HP and the battle ends in victory (a small, data-driven extension of `battle.ts`, like the 2.5 armour).
- **Target play time:** about 15–20 minutes, like Chapter 2. Chapter 2's real play time should be measured by a human play-through first.
- **No open world:** each area is a single scene reached by scene transitions.
- **Battles stay one-on-one** (Chapter 2 Decision 4). Daniel and Pell are story allies.

## Milestones
| # | Milestone | Content | New tech | Status |
|---|---|---|---|---|
| 3.1 | **The Long Way Down** | Chapter title card. Night on the express boat down the Rajang (the 2.1 boat scene with night lighting). Pell came aboard at Sungai Awan without being asked: he says he wants to "see the Charter properly registered", and nobody quite believes him yet. On a passenger's phone: *Vale heir sought over Archives break-in*, with a terrible photo. Daniel calls: he has been suspended, and Harrow has the Petition Hour list "under review". Mara sleeps sitting up, holding the Charter case. Arrival at Kuching at night → next milestone. | A night lighting variant of the boat scene (as the dusk village in 2.5). Max HP 30 → 36 (see Decisions). | ✅ Done |
| 3.2 | **A Wanted Man** | The Kuching waterfront at night (the 1.1 scene re-dressed): wanted posters, Royal Security on the pier, shutters down. **Kak Jamilah** hides them in the room above her stall (a new small interior). The Archivist sends a note: the Petition Hour is tomorrow morning, and a petition needs the seal of a Crown charter-holder. **Pell's choice**: Awan Riverlands holds a Crown charter; sponsoring the petition ends his career. Adrian makes the case (the first dialogue choice: what to say to him); Pell signs. Daniel arrives late, out of uniform, with a plan to get them past the gate. | **Dialogue choices** (new system 1), first used here with low stakes: every reply leads to Pell signing, but each says something different about Adrian. | ✅ Done |
| 3.3 | **The Palace Gate** | Morning at the Palace forecourt across the river (a new scene: gates, gardens, a queue of petitioners with their own small problems, ceremonial guards). Harrow's Royal Security turn Adrian away despite the sealed petition. Daniel faces down his own former colleague. Behind the gate, Harrow has woken the palace's oldest guard: the **Crowned Sentinel**, built by Paladins in the 1890s, with the royal seal riveted over their sign. First fight with it, in the forecourt. It doesn't fall; it withdraws through the inner door, and the gate opens because the petitioners won't let it close. | Reuses battle rules (heavy blows). | ✅ Done |
| 3.4 | **The Petition Hour** | The audience hall (a new scene). The Rajah (fictional and unnamed; young, cautious, and bound by the Lord Chamberlain's paperwork) hears the petition. **The hearing:** Harrow argues that the 1921 concession is lawful and the Vales are thieves. Adrian answers each claim by **presenting evidence** from what the player has found: the River Charter (2.4), the Rajah's 1921 letter refusing to sign (1.4), the Warden's plate tying Awan Riverlands to the palace (2.4), Elias's journal (2.4), and Pell's testimony (3.2). Four claims, four rebuttals; a wrong piece of evidence gets a cool reply from Harrow and another try. Halfway through, Mara speaks for Sungai Awan, without being asked. | **Presenting evidence** with dialogue choices (system 1). | ✅ Done |
| 3.5 | **The Crown Remembers** | The Rajah rules for the Charter. Harrow's last move: he orders the Crowned Sentinel to "secure the Crown's documents", which means the Charter, in a hall full of people. Final battle: armoured, then heavy blows, then, as its armour breaks and the old Paladin sign shows through, the medallion answers and the Sentinel **yields** and kneels. The Rajah registers the Charter at last, dismisses Harrow from office, and restores Elias Vale's name to the record: "The Crown remembers its heroes." Epilogue at Sungai Awan: the survey pegs come out of the ground. → **Chapter 3 Complete**. | **A yield threshold** in battle (new system 2), on top of the 2.5 armour. | ⬜ |

## Milestone 3.1 as built
- **Hand-off:** the Chapter 2 Complete card now offers **Continue to Chapter 3** (its default choice), which downloads Chapter 3 on demand (`src/chapters/chapter3`) and shows the title card "Chapter 3 · The Crown's Word". The loader, quests, saves and title screen know about Chapter 3.
- **Scene:** `boat_night` (`src/chapters/chapter3/{BoatNight.tsx,boatNightData.ts}`): the Chapter 2 express boat reused, not copied. `Boat.tsx` now exports `BoatScene`, which takes a layout and a `time` of day; night means moonlight, a deck lamp, lit cabin windows, lamplit longhouses drifting past and a dark river. A quieter night ambience with insects on the bank.
- **People:** Mara asleep on the bench with the Charter case ("I am awake. Go away."); **Julian Pell** at the south rail; the **Student** from the 2.1 morning boat, going back for term; **Ah Hock** running the night boat himself.
- **Story order:** arrival (Max HP 30 → 36, told in the arrival text) → Pell ("Harrow knows everything. It's very tiring.") → the Student's phone: *Vale heir sought over Royal Archives break-in*, with Adrian's old university-card photo → straight into **Daniel's call** (suspended; the Petition Hour exists, and Harrow has put its list "under review"; go to Kak Jamilah's stall) → rest in the cabin → before dawn, Ah Hock drifts in to a fuel jetty; the Palace is lit across the river; "Then that's where we're going." → **To Be Continued**. Each step is locked until the one before it is done; Mara and Ah Hock have lines before and after the call.
- **Max HP 36** from `chapter3_started` on (`CHAPTER3_MAX_HP` in `data/encounters.ts`); earlier battles keep 30.
- **Flags:** `chapter3_started`, `c3_arrived`, `c3_talked_pell`, `c3_saw_news`, `c3_daniel_called`, `c3_reached_kuching` (the chapter end until 3.2).
- **Tests:** a new browser test, `tests/e2e/chapter3.spec.ts`, starts from a saved game on the Chapter 2 Complete card instead of replaying the whole game (as the 2.5 handoff suggested).

## Milestone 3.2 as built
- **Dialogue choices** (new system 1): a conversation can end in a list of replies (`choices` on `DialogueDef`: id, label, next conversation, optional `requires`/`unless` and `setFlags`). They appear above the dialogue box after the last line; ↑/↓ (or W/S) and E/Enter, or the mouse. The conversation waits for a reply; picking one applies its flags and starts its conversation. Logic in `gameStore.ts` (`choicesOnScreen`, `moveChoice`, `chooseOption`) and `dialogue/rules.ts` (`availableChoices`); UI in `DialogueBox.tsx`. Saves are unaffected.
- **Getting there:** the night boat no longer ends the chapter: the cabin leads ashore at the fuel jetty. Saves from the old 3.1 cliffhanger can step ashore from the cabin.
- **Waterfront before dawn** (`waterfront_night`, `src/chapters/chapter3/{WaterfrontNight.tsx,kuchingData.ts}`): the Chapter 1 waterfront reused through a new `WaterfrontScene` (layout, `time="night"`, extra props), with roller shutters down on the shophouses, a wanted poster on every lamp post and two Royal Security officers on the ferry pier. Adrian lands at the east end and crosses the plaza to Kak Jamilah's stall. The officers, the poster ("Someone has drawn a moustache on it, which honestly helps"), Mara and Pell are optional.
- **Kak Jamilah's room** (`jamilah_room`, `JamilahRoom.tsx`): a small room above the stall with a low table and oil lamp, two sleeping mats, old newspapers on the wall and a window onto the Palace.
- **Story order:** Jamilah ("Your face is on every lamp post in Kuching, and it is not your good side") → up the back stairs → the **Archivist's note** (the Petition Hour opens at nine; it needs a Crown charter-holder's seal; "He cannot strike a sponsor") → **Pell's choice**: "For Sungai Awan" / "For your family's name" / "Because you already know it's right". Each reply gets its own answer and sets a flag for later callbacks (`c3_reason_village` / `_family` / `_right`), and all lead to Pell sealing the petition ("I am now unemployed. How exciting.") → **Daniel** arrives out of uniform with kaya buns and a plan (cross with the petitioners on the first ferry) → **To Be Continued**. Pell waits for the note to be read first.
- **Flags:** `c3_kuching_arrived`, `c3_met_jamilah`, `c3_room_entered`, `c3_read_note`, `c3_reason_village`, `c3_reason_family`, `c3_reason_right`, `c3_pell_signed`, `c3_daniel_arrived`, `c3_plan_made` (the chapter end until 3.3).

## Milestone 3.3 as built
- **Yield** (new system 2): an encounter may have `yieldAt`. When a blow brings the enemy to that HP or below, the battle ends in victory with the enemy still standing (`yielded` on the event; the encounter's `victoryText` says what happens). A knockout below zero still counts as an ordinary win. Data-driven in `battle.ts`, like the 2.5 armour.
- **Getting there:** Daniel's plan now runs straight into a time skip ("Nobody sleeps much") and the first ferry across with the petitioners. Saves from the old 3.2 cliffhanger can take the stairs in Kak Jamilah's room.
- **Scene:** `palace_gate` (`src/chapters/chapter3/{PalaceGate.tsx,palaceData.ts}`): an invented palace forecourt in the morning: white walls with gold-tipped gates and gateposts, the long white Palace front with a gold dome beyond, clipped hedges, blue-and-gold pennants (an invented banner), the Clerk's desk with a huge open register, and stone steps down to the river.
- **People:** the **Clerk of Petitions** (forty years of empty Petition Hours; thrilled); **Sergeant Nadia Osman**, Daniel's former partner of nine years, and another officer at the gate; three **petitioners** in the queue with small human requests (the auntie from the 2.1 boat with a pension form, a fisherman whose boundary marker was moved into his river, a schoolteacher with forty children's drawings about their cancelled school bus); Daniel, Mara and Pell.
- **Story order:** arrival → the Clerk writes the petition into the register ("It is written, and nobody may unwrite it") → Osman has orders to detain Adrian; Daniel faces her ("you never once lied to me in nine years") → the **Crowned Sentinel** walks out of the gate ("It's on postcards. It isn't supposed to move!" / "Neither was the last one.") → battle → it stops at the sight of the medallion and walks back into the Palace ("It knew that sign") → the gates begin to close; the petitioners stand in the gateway; the Clerk: "By custom, no gate may be closed on a petitioner!"; Osman lets them through → **To Be Continued**.
- **The Crowned Sentinel** (new 36×52 sprite, `crownedSentinelSprite.ts`: ivory plate with gold trim, crowned helm with a T-visor, royal-blue tabard, ceremonial halberd; the royal seal riveted over its chest, with a second look where the Paladin sign shows through, for 3.5) on a new palace backdrop (white stone, gilded gate bars). HP 56, hits for 7, a 20-damage heavy blow every 3rd round that Defend blocks, and it withdraws at 16 HP. With 36 HP and River Ward: going all-out loses; defending the heavy blows wins with 15 HP.
- **Flags:** `c3_gate_arrived`, `c3_petition_registered`, `c3_sentinel_woken`, `c3_sentinel_withdrew`, `c3_gate_open` (the chapter end until 3.4).

## Milestone 3.4 as built
- **Getting there:** the 3.3 ending now leaves the player in the forecourt with the gates held open; **Enter Audience Hall** at the gate (also how saves from the old 3.3 cliffhanger carry on).
- **Scene:** `audience_hall` (`src/chapters/chapter3/{AudienceHall.tsx,audienceData.ts}`): an invented palace hall: white walls and columns, tall east windows, a red carpet to a gilded throne on a low dais, blue-and-gold banners, benches, the Clerk's desk, a gold circle in the carpet for the petitioner, and the Crowned Sentinel standing beside the throne again, still as a statue.
- **People:** **the Rajah** (new character: fictional and unnamed, young, in a plain white uniform with a blue sash), Lord Chamberlain Harrow, the Clerk, the Archivist, Mara, Pell, Daniel, and the three petitioners at the back.
- **The hearing:** stand in the petitioner's place (a small engine addition: an interactable can override its prompt verb, so the prompt reads "Stand in the Petitioner's Place"). Harrow makes four claims, each answered by presenting evidence from a five-item menu built from flags the player already has (the River Charter, the Rajah's 1921 letter, Elias's journal, the Warden's plate, Pell's testimony; only what has been found is listed):
  1. *The concession bears the royal seal.* → the Rajah's 1921 letter refusing to sign; the Archivist confirms the Archives' copy has a blank signature line.
  2. *No other grant exists.* → the River Charter, signed and sealed two months earlier.
  3. *The Charter is a forgery from a family of traitors.* → Elias's journal; the Archivist matches his hand to the Paladin rolls.
  4. *The palace has no part in Awan Riverlands' survey.* → the Hollow Warden's plate (Daniel backs it up), or Pell's testimony.
  A wrong piece of evidence gets a cool rebuttal from Harrow and the same menu again; nothing is ever lost. Between claims 2 and 3, **Mara speaks for Sungai Awan** unasked ("We are only asking you to keep it"). Then **Pell testifies**, in words that depend on the reply that persuaded him in 3.2 (a single "Let Julian Pell speak." reply whose conversation is picked by `c3_reason_*`; a plain version if none is set). The Rajah: "Lord Chamberlain. Is any of this untrue?" Harrow: "It is all very old, Your Majesty." The Rajah: "So is the Crown." He rises to give his ruling, and the Crowned Sentinel turns its head → **To Be Continued**.
- **Saves:** a reload mid-hearing resumes at the first unanswered claim from the petitioner's place.
- **Flags:** `c3_hall_entered`, `c3_hearing_started`, `c3_claim1_answered`, `c3_claim2_answered`, `c3_mara_spoke`, `c3_claim3_answered`, `c3_claim4_answered`, `c3_pell_testified`, `c3_hearing_won` (the current chapter end).

## Story beats in order
1. Title card → the night boat. Pell aboard; the news story; Daniel's call. → Kuching.
2. The waterfront at night: the poster, the patrol at the pier, Kak Jamilah's back stairs.
3. Above the stall: the Archivist's note, Pell's choice (dialogue choice), Daniel's plan.
4. Morning: the Palace forecourt, the petitioners, the gate turned against them.
5. The Crowned Sentinel (first fight); it withdraws; the petitioners hold the gate.
6. The audience hall: the Rajah, Harrow, the hearing (present evidence ×4); Mara speaks.
7. The ruling; Harrow's last order; the Crowned Sentinel (final fight, three phases, yields).
8. The Charter registered; Harrow dismissed; Elias's name restored; epilogue → **Chapter 3 Complete**.

## Characters
**Returning**
- **Adrian Vale**: has stopped asking what the family did, and starts asking what the family is for. His arc ends with him speaking for other people, not only for the Vales.
- **Aunt Mara**: travels with the Charter case on her lap and trusts nobody in a uniform. Her speech at the hearing is the emotional peak of the chapter.
- **Daniel Rengas**: suspended. Out of uniform for the first time in the story, and making his choice between the badge and what it was for.
- **Julian Pell**: comes downriver unasked. Signs the petition and loses his job in the same morning. An ally from here on.
- **Kak Jamilah**: the kolo mee stall owner from Chapter 1. Hides fugitives "because my mother would have".
- **The Archivist**: sends the note about the Petition Hour; appears at the hearing with the Archives' own copy of the 1921 file.
- **Lord Chamberlain Edmund Harrow**: on-screen at last for most of a chapter. Never fights; he argues, and he is very good at it. His defeat is legal and public, not physical.

**New**
- **The Rajah**: fictional and unnamed ("His Majesty"), young, the great-grandson of the Rajah who signed the Charter. Not modelled on any real person. Not a villain and not a saint: someone who has never had a reason to doubt his Lord Chamberlain until now.
- **The Clerk of Petitions**: an elderly palace clerk who has opened the Petition Hour every month for forty years to an empty hall. Thrilled.
- **Royal Security officers**: one is Daniel's former partner, who lets him through in the end (the "badge" side of Daniel's choice, seen from outside).
- **The petitioners** at the gate: a few small, human requests (a pension form, a school bus, a fishing licence), so the forecourt feels lived-in.
- **The Crowned Sentinel**: the palace's ceremonial guardian, Paladin-built and Crown-sealed: the Hollow Sentinel's ancestor. Gold and ivory, with a crowned helm. An original design.

## Objectives (draft)
1. Talk to Pell on the night boat. → 2. Arrive in Kuching.
3. Reach Kak Jamilah's stall unseen. → 4. Read the Archivist's note. → 5. Ask Pell to sponsor the petition.
6. Go to the Palace at the Petition Hour. → 7. Get past the gate (the Crowned Sentinel, first fight).
8. Enter the audience hall. → 9. Answer Harrow's claims (four pieces of evidence).
10. Protect the hall (the Crowned Sentinel, final fight). → **Chapter 3 Complete**.

## Battle and balance notes
- **Player growth:** max HP 30 → 36 from the start of Chapter 3 (Decision 5), the "growth moment" Chapter 2 deferred. Earlier battles keep 30 so their tests and balance don't change.
- **Crowned Sentinel, first fight (3.3):** heavy blows that Defend blocks, River Ward for when hurt. About Hollow Warden difficulty. It withdraws at low HP, which the game counts as a win (the yield system's first, gentle use).
- **Crowned Sentinel, final fight (3.5):** three phases: armoured (Radiant Strike breaks it) → exposed with heavy blows (River Ward matters) → it yields at a set HP when the Paladin sign shows. Harder than the Iron Warden, but never needing perfect play.
- **Tests:** as in Chapters 1–2: strategy tests for every fight (the intended play wins with HP to spare; ignoring the mechanic loses), plus unit tests for dialogue choices and the full hearing, including wrong answers.

## Technical notes
- New module `src/chapters/chapter3` (data, scenes, content registration); `loader.ts` gains Chapter 3; `hasChapterAfter(2)` becomes true, and the Chapter 2 card gains "Continue to Chapter 3".
- **New scenes:** `boat_night` (lighting variant of `boat`), `waterfront_night` (variant of `waterfront`), `jamilah_room` (small interior), `palace_gate`, `audience_hall`.
- **Dialogue choices:** a `choices` list on a dialogue line (label, the conversation it leads to, optional `requires` flags so evidence only appears once found). Keyboard ↑/↓ + E and mouse, like the battle menu. Saves are unaffected: choices only lead to conversations and flags.
- **Evidence:** the evidence list is derived from flags the player already has (`c2_found_charter`, `c1_letter_found`, `c2_warden_defeated`, `c2_read_journal`, `c3_pell_signed`). There is no separate inventory.
- **Yield:** an optional `yieldAt` HP on an encounter. When the enemy drops to it, the battle ends in victory with its own text. Data-driven, tested like the armour.
- **New characters:** `rajah`, `clerk`, plus palette variants for officers and petitioners. **New sprite:** the Crowned Sentinel (pixel art drawn in code, armoured and exposed).
- **Saves:** extend the flag list and per-scene requirements; a save on the Chapter 2 Complete card continues into Chapter 3.
- **Audio:** night river ambience, a palace ambience, and the boss loop from 2.5 for the final fight.

## Cultural and sensitivity notes
- **The monarchy is fiction.** The game's Brooke-descended constitutional monarchy is alternate history. The Rajah is invented and unnamed; no real member of any royal family, past or present, is depicted or referenced by name. The Palace is an invented building; the real Astana and other real Kuching landmarks are not depicted.
- **The Petition Hour, the Register of Royal Grants and the hearing** are invented processes. They do not imitate any real Sarawak or Malaysian court, assembly, law or ceremony.
- **Kuching** is home to Malay, Chinese, Iban, Bidayuh, Melanau, Orang Ulu and other communities. Show this through the city's everyday life: food, shop signs, languages in passing, the petitioners' small requests. No invented customs.
- **Land and development** remain real and sensitive topics. The story stays inside its fiction (one invented village, one invented charter, one invented company) and doesn't comment on real disputes, cases or politicians.
- **Royal Security** is a fictional institution. The officers are people with a job, not villains; Daniel's former partner should be sympathetic.
- Before release, someone from the region could read the chapter's characters and dialogue (as recommended for Chapter 2).

## Hooks left open (for a possible Chapter 4)
- The sealed records room held **other erased families and villages** (Chapter 1). The Charter protects Sungai Awan; the others are still in their tin boxes.
- **The Paladin order:** were the Vales the last? The Crowned Sentinel was built by Paladins, so who built it, and where are their waystations?
- **Harrow** is dismissed, not defeated forever. He keeps his family's other half of the archive.

## Decisions to agree (draft defaults)
1. **Title:** "The Crown's Word". Alternatives: "The Petition Hour", "The Crown Remembers".
2. **Arc:** Chapter 3 **closes the first story** (the Charter, Harrow, Elias's name), with an epilogue and the open hooks above, rather than ending on a cliffhanger.
3. **The Rajah on screen:** yes, fictional and unnamed, as described above.
4. **New system 1, dialogue choices** (including presenting evidence): yes, with no fail states.
5. **Max HP 30 → 36** from the start of Chapter 3: yes. Earlier fights unchanged.
6. **New system 2, a yield threshold** for the Crowned Sentinel: yes. The alternative is no second system and a normal victory.
7. **Julian Pell:** becomes a story ally (sponsor of the petition and a witness), not a fighter.
8. **Harrow:** never fights; his defeat is the hearing and the Rajah's ruling.
9. **No new Paladin art** this chapter (the growth is the HP raise and the yield ending); a third art could wait for Chapter 4.
10. **Scope:** five milestones (3.1–3.5).
