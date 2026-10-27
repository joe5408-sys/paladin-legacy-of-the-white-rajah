/**
 * Chapter 3, Milestone 3.4 — The Petition Hour. Pure data.
 *
 * The audience hall (an invented palace interior): a long white hall with a red
 * carpet to a gilded throne on a dais. The Rajah (fictional and unnamed) on the
 * throne; the Crowned Sentinel standing beside it again, still as a statue;
 * Lord Chamberlain Harrow at the foot of the dais; the Clerk at his desk; the
 * Archivist; Mara, Pell and Daniel on the front benches; petitioners at the back.
 *
 * The hearing: Adrian takes the petitioner's mark and Harrow makes four claims.
 * Each is answered by presenting evidence (dialogue choices). The evidence list
 * comes from flags the player already has. A wrong piece of evidence gets a cool
 * rebuttal and the same choice again; nothing is ever lost. Halfway, Mara speaks
 * for Sungai Awan unasked. At the end Pell testifies, in words that depend on
 * the reply Adrian gave him in 3.2. The Rajah rises to give his ruling →
 * "To Be Continued" (the ruling and Harrow's last move are Milestone 3.5).
 */
import { boxFromCenter, type Box } from '../../game/core/collision';
import type { StoryFlag } from '../../game/core/flags';
import type { DialogueChoice, DialogueDef } from '../../game/dialogue/types';
import type { Interactable } from '../../game/interaction/interaction';
import { NPC_COLLIDER_SIZE, type NpcPlacement, type SceneLayout } from '../../game/scenes/layout';
import type { Objective } from '../../data/quests';

export const HALL3_BOUNDS: Box = { minX: -6, maxX: 6, minZ: -5, maxZ: 4 };
export const DAIS = { x: 0, z: -4.2, width: 4.4, depth: 1.6 };
export const THRONE = { x: 0, z: -4.5 };
/** The Crowned Sentinel, standing beside the throne again. */
export const HALL_SENTINEL = { x: 2.9, z: -4.3, width: 1.0, depth: 0.6 };
export const MARK = { x: 0, z: -1.8 };
export const CLERK_DESK3 = { x: 3.4, z: -2.5, width: 1.2, depth: 0.5 };
export const BENCHES = [
  { x: -4.2, z: 0.4 },
  { x: -4.2, z: 1.8 },
  { x: 4.2, z: 0.4 },
  { x: 4.2, z: 1.8 },
].map((b) => ({ ...b, width: 2.4, depth: 0.5 }));

const npc = (id: string, character: NpcPlacement['character'], x: number, z: number, facing: NpcPlacement['facing']): NpcPlacement => ({
  id,
  character,
  x,
  z,
  facing,
});

export const HALL3_NPCS: NpcPlacement[] = [
  npc('npc-rajah', 'rajah', THRONE.x, THRONE.z, 'south'),
  npc('npc-harrow-hall', 'harrow', -2.6, -2.8, 'east'),
  npc('npc-clerk-hall', 'clerk', CLERK_DESK3.x, -3.1, 'south'),
  npc('npc-archivist-hall', 'archivist', 4.8, -1.0, 'west'),
  npc('npc-mara-hall', 'mara', -1.6, 0.6, 'north'),
  npc('npc-pell-hall', 'pell', 1.6, 0.6, 'north'),
  npc('npc-daniel-hall', 'daniel', -1.6, 2.2, 'north'),
  npc('npc-auntie-hall', 'auntie', -4.2, 2.8, 'north'),
  npc('npc-fisher-hall', 'fisher', -3.0, 2.8, 'north'),
  npc('npc-teacher-hall', 'teacher', 4.2, 2.8, 'north'),
];

const at = (id: string) => HALL3_NPCS.find((n) => n.id === id)!;
const talk = (id: string, label: string, dialogue: Interactable['dialogue'], radius = 1.2): Interactable => ({
  id,
  kind: 'talk',
  label,
  x: at(id).x,
  z: at(id).z,
  radius,
  npc: at(id).character,
  dialogue,
});

export const HALL3_INTERACTABLES: Interactable[] = [
  {
    id: 'petitioner-mark',
    kind: 'activate',
    verb: 'Stand in',
    label: "the Petitioner's Place",
    x: MARK.x,
    z: MARK.z,
    radius: 0.9,
    when: { unless: ['c3_hearing_won'] },
    dialogue: [
      { dialogue: 'c3_hearing_open', unless: ['c3_hearing_started'] },
      // After a reload mid-hearing: carry on from the first unanswered claim.
      { dialogue: 'c3_call_pell', requires: ['c3_claim4_answered'] },
      { dialogue: 'c3_claim4', requires: ['c3_claim3_answered'] },
      { dialogue: 'c3_claim3', requires: ['c3_claim2_answered'] },
      { dialogue: 'c3_claim2', requires: ['c3_claim1_answered'] },
      { dialogue: 'c3_claim1' },
    ],
  },
  talk('npc-rajah', 'His Majesty', [{ dialogue: 'c3_rajah_wait' }], 1.6),
  talk('npc-harrow-hall', 'Lord Chamberlain Harrow', [{ dialogue: 'c3_harrow_wait' }]),
  talk('npc-clerk-hall', 'Clerk of Petitions', [{ dialogue: 'c3_clerk_hall' }], 1.5),
  talk('npc-archivist-hall', 'The Archivist', [{ dialogue: 'c3_archivist_hall' }]),
  talk('npc-mara-hall', 'Aunt Mara', [{ dialogue: 'c3_mara_hall' }]),
  talk('npc-pell-hall', 'Julian Pell', [{ dialogue: 'c3_pell_hall' }]),
  talk('npc-daniel-hall', 'Daniel', [{ dialogue: 'c3_daniel_hall' }]),
  talk('npc-auntie-hall', 'Auntie', [{ dialogue: 'c3_auntie_hall' }]),
  talk('npc-fisher-hall', 'Fisherman', [{ dialogue: 'c3_fisher_hall' }]),
  talk('npc-teacher-hall', 'Schoolteacher', [{ dialogue: 'c3_teacher_hall' }]),
];

const HALL3_COLLIDERS: Box[] = [
  boxFromCenter(DAIS.x, DAIS.z, DAIS.width, DAIS.depth),
  boxFromCenter(HALL_SENTINEL.x, HALL_SENTINEL.z, HALL_SENTINEL.width, HALL_SENTINEL.depth),
  boxFromCenter(CLERK_DESK3.x, CLERK_DESK3.z, CLERK_DESK3.width, CLERK_DESK3.depth),
  ...BENCHES.map((b) => boxFromCenter(b.x, b.z, b.width, b.depth)),
  ...HALL3_NPCS.map((n) => boxFromCenter(n.x, n.z, NPC_COLLIDER_SIZE, NPC_COLLIDER_SIZE)),
];

export const HALL3_LAYOUT: SceneLayout = {
  bounds: HALL3_BOUNDS,
  colliders: () => HALL3_COLLIDERS,
  interactables: HALL3_INTERACTABLES,
  npcs: HALL3_NPCS,
};

export const HEARING_OBJECTIVES: Objective[] = [
  { id: 'c3_hall', text: 'Go through the gate to the audience hall.', completeWhen: 'c3_hall_entered' },
  { id: 'c3_mark', text: "Take the petitioner's place before the throne.", completeWhen: 'c3_hearing_started' },
  { id: 'c3_hearing', text: "Answer the Lord Chamberlain's claims.", completeWhen: 'c3_hearing_won' },
];

// ── Evidence ────────────────────────────────────────────

/** Everything Adrian can present, and the flag that means he has it. */
export const EVIDENCE: Array<{ id: string; label: string; requires: StoryFlag }> = [
  { id: 'charter', label: 'The River Charter of 1921.', requires: 'c2_found_charter' },
  { id: 'letter', label: "The Rajah's letter of 1921, refusing to sign.", requires: 'c1_letter_found' },
  { id: 'journal', label: "Elias Vale's journal.", requires: 'c2_read_journal' },
  { id: 'plate', label: "The plate from the Hollow Warden's chest.", requires: 'c2_warden_defeated' },
  { id: 'pell', label: "Julian Pell's testimony.", requires: 'c3_pell_signed' },
];

/**
 * The evidence menu for one of Harrow's claims: the right evidence leads to its
 * answer; anything else to that claim's rebuttal (which offers the menu again).
 */
export function evidenceChoices(claim: number, answers: Record<string, string>): DialogueChoice[] {
  return EVIDENCE.map((e) => ({
    id: e.id,
    label: e.label,
    requires: [e.requires],
    next: answers[e.id] ?? `c3_rebut${claim}`,
  }));
}

/** A claim: its full statement first, then a short restatement after a wrong answer. */
function claim(n: number, lines: DialogueDef['lines'], again: string, answers: Record<string, string>): DialogueDef[] {
  const choices = evidenceChoices(n, answers);
  return [
    { id: `c3_claim${n}`, lines, choices },
    { id: `c3_claim${n}_again`, lines: [{ speaker: 'harrow', text: again }], choices },
  ];
}

/** A rebuttal to a wrong piece of evidence; the claim is then put again. */
const rebut = (n: number, text: string): DialogueDef => ({
  id: `c3_rebut${n}`,
  lines: [{ speaker: 'harrow', text }],
  next: `c3_claim${n}_again`,
});

/** Pell's testimony, coloured by the reply that persuaded him in 3.2. */
const testimony = (id: string, middle: string): DialogueDef => ({
  id,
  lines: [
    { speaker: 'pell', text: 'Julian Pell, Your Majesty. Manager of Awan Riverlands Development until about six o\'clock this morning.' },
    { speaker: 'pell', text: middle },
    { speaker: null, text: 'He hands the Clerk a folder. The survey orders, on the Lord Chamberlain\'s letterhead.', setFlags: ['c3_pell_testified'] },
  ],
  next: 'c3_rajah_turns',
});

// ── Story ───────────────────────────────────────────────

export const HEARING_DIALOGUE: DialogueDef[] = [
  {
    id: 'c3_hall_arrival',
    lines: [
      { speaker: null, text: 'The audience hall: a long white room, tall windows, and a red carpet running to a gilded throne. Beside it, still as a statue again, stands the Crowned Sentinel.', setFlags: ['c3_hall_entered'] },
      { speaker: null, text: 'On the throne sits the Rajah: younger than Adrian expected, in a plain white uniform, watching everything.' },
      { speaker: null, text: 'At the foot of the dais, in a dark coat and perfect calm, stands Lord Chamberlain Edmund Harrow.' },
      { speaker: 'clerk', text: 'The Petition Hour is open! Adrian Vale, of Sungai Awan, take the petitioner\'s place!' },
      { speaker: 'harrow', text: 'Mr Vale. You have come a long way to be arrested in such a beautiful room.' },
    ],
  },
  {
    id: 'c3_hearing_open',
    lines: [
      { speaker: null, text: 'Adrian steps onto the gold circle in the carpet. The hall goes quiet.', setFlags: ['c3_hearing_started'] },
      { speaker: 'rajah', text: 'Mr Vale. Your petition concerns a River Charter of 1921. Lord Chamberlain, you wished to answer it.' },
      { speaker: 'harrow', text: 'I do, Your Majesty. Briefly, I hope. I have four points, and the law is on the side of every one of them.' },
    ],
    next: 'c3_claim1',
  },

  // Claim 1: the seal. Answer: the Rajah's letter refusing to sign (1.4), backed by the Archivist.
  ...claim(
    1,
    [
      { speaker: 'harrow', text: 'First. In 1921 the river lands were granted to the Harrow and Pell Timber Company. The concession bears the royal seal. It is lawful, and it has been lawful for a century.' },
      { speaker: null, text: 'Every face in the hall turns to Adrian. What will he present?' },
    ],
    'The concession bears the royal seal, Mr Vale. Well?',
    { letter: 'c3_answer1' },
  ),
  rebut(1, 'That does not touch the seal, Mr Vale. The seal is on the concession. Do try again.'),
  {
    id: 'c3_answer1',
    lines: [
      { speaker: 'adrian', text: 'The seal, yes. But not the signature. In 1921 the Rajah refused to sign. I have his letter: "Keep the sign safe until the Crown deserves it again."' },
      { speaker: 'archivist', text: 'If I may, Your Majesty. The Archives\' own copy of the 1921 order. The signature line is blank. It has been blank for a hundred years.' },
      { speaker: 'rajah', text: 'A seal without a signature.' },
      { speaker: 'harrow', text: '...A formality. The Lord Chamberlain keeps the seal for precisely that reason.', setFlags: ['c3_claim1_answered'] },
    ],
    next: 'c3_claim2',
  },

  // Claim 2: no other grant exists. Answer: the River Charter (2.4).
  ...claim(
    2,
    [{ speaker: 'harrow', text: 'Second. Even if my great-grandfather was... efficient, no other grant of those lands exists. They were the Crown\'s to give, and the Crown gave them.' }],
    'No other grant exists, Mr Vale. Unless you have one in your pocket?',
    { charter: 'c3_answer2' },
  ),
  rebut(2, 'Interesting, I\'m sure. But it is not a grant of land. Nothing else was ever granted.'),
  {
    id: 'c3_answer2',
    lines: [
      { speaker: null, text: 'Adrian opens the bronze Charter case. The hall leans forward.' },
      { speaker: 'adrian', text: 'There is another grant. The River Charter, signed and sealed by the Rajah on the third of March, 1921: the river lands, to the people who live on them, forever.' },
      { speaker: null, text: 'The Clerk carries it up the steps of the dais. The Rajah reads it for a long time: his great-grandfather\'s signature, his great-grandfather\'s seal.', setFlags: ['c3_claim2_answered'] },
    ],
    next: 'c3_mara_speaks',
  },
  {
    // Halfway: Mara speaks for Sungai Awan, unasked.
    id: 'c3_mara_speaks',
    lines: [
      { speaker: 'mara', text: 'Your Majesty. Forgive an old woman for speaking out of turn.' },
      { speaker: 'harrow', text: 'Madam, the petitioner is—' },
      { speaker: 'mara', text: 'I have lived on that river for seventy years. So did my mother, and hers. Elias Vale was not a traitor. He was a man who carried a promise up a river and hid it, so it would still be there when someone was ready to keep it.' },
      { speaker: 'mara', text: 'We are only asking you to keep it.', setFlags: ['c3_mara_spoke'] },
      { speaker: null, text: 'Somewhere at the back of the hall, the auntie with the pension form says, very loudly, "Yes."' },
    ],
    next: 'c3_claim3',
  },

  // Claim 3: the Charter is a forgery. Answer: Elias's journal (2.4).
  ...claim(
    3,
    [{ speaker: 'harrow', text: 'Third. Touching. But this "Charter" appears after a hundred years, in the hands of a family convicted of treason. Forgeries are cheap, Your Majesty. Grandmothers\' stories are cheaper.' }],
    'A forgery, Mr Vale, until you show otherwise.',
    { journal: 'c3_answer3' },
  ),
  rebut(3, 'That proves only that you have read it. I said it was forged, Mr Vale, not that it was badly written.'),
  {
    id: 'c3_answer3',
    lines: [
      { speaker: 'adrian', text: 'Then read Elias Vale\'s own journal. He wrote down the day the Rajah signed it, his orders to register it in Kuching, and the men the Lord Chamberlain sent to watch the roads.' },
      { speaker: null, text: 'The Archivist turns the brittle pages and nods. "The hand matches the Paladin rolls in the vault. It is his."' },
      { speaker: 'rajah', text: 'He was charged with treason for refusing an order my great-grandfather never signed.', setFlags: ['c3_claim3_answered'] },
    ],
    next: 'c3_claim4',
  },

  // Claim 4: the palace has nothing to do with Awan Riverlands. Answer: the Warden's plate (2.4) or Pell (3.2).
  ...claim(
    4,
    [{ speaker: 'harrow', text: 'Fourth, and last. Whatever happened in 1921, the Office of the Lord Chamberlain has no part in Awan Riverlands\' survey. It is a private company, about its private business.' }],
    'No part in it whatsoever, Mr Vale.',
    { plate: 'c3_answer4_plate', pell: 'c3_answer4_pell' },
  ),
  rebut(4, 'Old paper again. My office and that company have nothing to do with each other today.'),
  {
    id: 'c3_answer4_plate',
    lines: [
      { speaker: 'adrian', text: 'Then explain the Hollow Warden. It climbed out of the river at the waystation, sent to clear the site. Inside its chest is a plate: AWAN RIVERLANDS DEVELOPMENT, SITE CLEARANCE, under the palace seal.' },
      { speaker: 'daniel', text: 'I saw it too, Your Majesty. So did half of Sungai Awan, when the bigger one fell in their river.', setFlags: ['c3_claim4_answered'] },
    ],
    next: 'c3_call_pell',
  },
  {
    id: 'c3_answer4_pell',
    lines: [{ speaker: 'adrian', text: 'Then ask the company\'s own manager.', setFlags: ['c3_claim4_answered'] }],
    next: 'c3_call_pell',
  },
  {
    // A single reply whose words depend on what persuaded Pell in 3.2.
    id: 'c3_call_pell',
    lines: [{ speaker: null, text: 'Julian Pell is already on his feet before anyone calls him.' }],
    choices: [
      { id: 'pell-village', label: 'Let Julian Pell speak.', requires: ['c3_reason_village'], next: 'c3_pell_testifies_village' },
      { id: 'pell-family', label: 'Let Julian Pell speak.', requires: ['c3_reason_family'], next: 'c3_pell_testifies_family' },
      { id: 'pell-right', label: 'Let Julian Pell speak.', requires: ['c3_reason_right'], next: 'c3_pell_testifies_right' },
      { id: 'pell-plain', label: 'Let Julian Pell speak.', unless: ['c3_reason_village', 'c3_reason_family', 'c3_reason_right'], next: 'c3_pell_testifies_right' },
    ],
  },
  testimony('c3_pell_testifies_village', 'I went to Sungai Awan to buy a village, Your Majesty. I met a shopkeeper, a nurse, and a jetty with a broken rail. The Lord Chamberlain\'s office sent the machine that broke it.'),
  testimony('c3_pell_testifies_family', 'My family put half its name on that concession. I would like to take it off. The survey was ordered by the Lord Chamberlain\'s office, Your Majesty, not by us.'),
  testimony('c3_pell_testifies_right', 'Mr Vale told me I already knew this was wrong. He was correct, which was very annoying. The survey was ordered by the Lord Chamberlain\'s office, Your Majesty.'),
  {
    // The end of Milestone 3.4.
    id: 'c3_rajah_turns',
    lines: [
      { speaker: 'rajah', text: 'Lord Chamberlain. Is any of this untrue?' },
      { speaker: null, text: 'For the first time, Edmund Harrow takes a moment before he answers.' },
      { speaker: 'harrow', text: 'It is all very old, Your Majesty.' },
      { speaker: 'rajah', text: 'So is the Crown.' },
      { speaker: 'rajah', text: 'I have heard the petition. I will give my ruling.' },
      { speaker: null, text: 'The Rajah rises from the throne, and every person in the hall rises with him. Beside the throne, the Crowned Sentinel slowly turns its head.', setFlags: ['c3_hearing_won'] },
    ],
    endChapter: true,
  },

  // Before the hearing: a line from everyone in the hall.
  {
    id: 'c3_rajah_wait',
    lines: [{ speaker: null, text: 'The Rajah meets Adrian\'s eyes, and waits for him to take the petitioner\'s place.' }],
  },
  {
    id: 'c3_harrow_wait',
    lines: [{ speaker: 'harrow', text: 'Take your place, Mr Vale. Let us not keep His Majesty waiting.' }],
  },
  {
    id: 'c3_clerk_hall',
    lines: [{ speaker: 'clerk', text: 'The gold circle on the carpet, Mr Vale! I polished it myself this morning. Twice.' }],
  },
  {
    id: 'c3_archivist_hall',
    lines: [{ speaker: 'archivist', text: 'I have brought the Archives\' copy of the 1921 order. Sensible shoes, Mr Vale, are for standing through long hearings.' }],
  },
  {
    id: 'c3_mara_hall',
    lines: [{ speaker: 'mara', text: 'Go on. I will be right here, glaring at the Lord Chamberlain.' }],
  },
  {
    id: 'c3_pell_hall',
    lines: [{ speaker: 'pell', text: 'I have never sat on this side of the room before. The benches are terrible.' }],
  },
  {
    id: 'c3_daniel_hall',
    lines: [{ speaker: 'daniel', text: 'Every guard in this hall knows my face. Just... be quick, Adrian.' }],
  },
  {
    id: 'c3_auntie_hall',
    lines: [{ speaker: 'auntie', text: 'The Clerk took my pension form! With his own hand! Now go and win, boy.' }],
  },
  {
    id: 'c3_fisher_hall',
    lines: [{ speaker: 'fisher', text: 'If you get your river back, ask about my boundary marker.' }],
  },
  {
    id: 'c3_teacher_hall',
    lines: [{ speaker: 'teacher', text: 'The children drew the Rajah with a very large crown. I hope he likes it.' }],
  },
];
