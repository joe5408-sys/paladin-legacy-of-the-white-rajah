/**
 * All dialogue text lives here, never inside scene components.
 * Keep lines short: the whole prologue should play in 5–10 minutes.
 * The setting is fictional: the Paladin order, its oath and its history are invented.
 */
import type { DialogueDef } from '../game/dialogue/types';

const defs: DialogueDef[] = [
  // ── Scene 1: Arrival ─────────────────────────────────────────────
  {
    id: 'village_arrival',
    lines: [
      { speaker: null, text: 'Sungai Awan. The longboat from Kapit pulls away, its engine fading upriver.' },
      { speaker: 'adrian', text: 'Twelve years. Same river, same boardwalk... and I still feel like a visitor.' },
      { speaker: 'adrian', text: 'Aunt Mara\'s message just said: "Come home. It is time." No explanation.' },
    ],
    setFlags: ['arrived'],
  },
  {
    id: 'lim_intro',
    lines: [
      { speaker: 'lim', text: 'Eh? Adrian? Adrian Vale! Last time I saw you, you were shorter than my counter.' },
      { speaker: 'adrian', text: 'Uncle Lim. You still remember me?' },
      { speaker: 'lim', text: 'Of course! Your Aunt Mara asks every morning whether the boat from Kapit brought you yet.' },
      { speaker: 'adrian', text: 'She sent me a message. Said it was important, but she would not explain over the phone.' },
      { speaker: 'lim', text: 'That is Mara. Her house is the one on stilts, east side. Go on, before she comes looking for you herself.' },
    ],
    setFlags: ['met_lim'],
  },
  {
    id: 'lim_repeat',
    lines: [
      { speaker: 'lim', text: 'Mara\'s house is east, the one on stilts. She repaints that gold trim every year, you cannot miss it.' },
    ],
  },
  {
    id: 'lim_after_home',
    lines: [
      { speaker: 'lim', text: 'You saw Mara already? Good. She has been keeping that house exactly the way your grandfather left it.' },
    ],
  },

  // ── Scene 2: The Family Secret ───────────────────────────────────
  {
    id: 'home_arrival',
    lines: [
      { speaker: null, text: 'Inside, the house smells of camphor and old wood.', setFlags: ['entered_home'] },
      { speaker: 'adrian', text: 'Aunty? It\'s me. Adrian.' },
      { speaker: 'mara', text: 'Over here, child. Come where these old eyes can see you.' },
    ],
  },
  {
    id: 'mara_intro',
    lines: [
      { speaker: 'mara', text: 'Adrian. You have your grandfather\'s stubborn jaw. Good. You will need it.' },
      { speaker: 'adrian', text: 'Aunty, your message worried me. Are you unwell?' },
      { speaker: 'mara', text: 'Unwell? I am eighty-one, not dying. Listen carefully.' },
      { speaker: 'mara', text: 'Our family once served the White Rajah. Not as clerks or soldiers. As Paladins.' },
      { speaker: 'mara', text: 'Sworn guardians of the Covenant. They protected the Crown, and the people beneath it.' },
      { speaker: 'adrian', text: 'Paladins? I have never seen the Vale name in any history book.' },
      { speaker: 'mara', text: 'Because it was removed. Your great-grandfather was accused of treason, and the palace struck our name from every record.' },
      { speaker: 'mara', text: 'But one thing they could not take. The heirloom, on the pedestal by the window.' },
      { speaker: 'mara', text: 'It has waited a long time for a Vale whose blood is awake. Go. Touch it.' },
    ],
    setFlags: ['met_mara'],
  },
  {
    id: 'mara_repeat',
    lines: [
      { speaker: 'mara', text: 'Go on. The heirloom, by the window. It will not bite... I think.' },
    ],
  },
  {
    id: 'mara_after_awaken',
    lines: [
      { speaker: 'mara', text: 'So it is true. The oath still lives in you.' },
      { speaker: 'mara', text: 'That passage has been sealed since before I was born. Whatever waits below, it waits for you.' },
      { speaker: 'mara', text: 'Be careful, Adrian. The Covenant tested every Vale who came before you.' },
    ],
  },
  {
    id: 'portrait',
    lines: [
      { speaker: null, text: 'A faded photograph: a stern man in a white uniform, standing beside a young Rajah.' },
      { speaker: null, text: 'The brass nameplate beneath it has been scratched completely blank.' },
      { speaker: 'adrian', text: 'Someone really wanted his name gone.' },
    ],
  },

  // ── Scene 3: The Awakening ───────────────────────────────────────
  {
    id: 'heirloom_locked',
    lines: [
      { speaker: null, text: 'A bronze medallion rests on a carved pedestal. A sword crosses a river on its face.' },
      { speaker: 'adrian', text: 'I should say hello to Aunt Mara first. She is watching me like a hawk.' },
    ],
  },
  {
    id: 'heirloom_awaken',
    lines: [
      { speaker: null, text: 'Adrian\'s fingertips brush the cold bronze.' },
      {
        speaker: null,
        text: 'The medallion flares white-gold. Light spills across the floor, tracing the sign of the sword and the river.',
        setFlags: ['heirloom_awakened'],
      },
      { speaker: 'adrian', text: 'It\'s warm. It\'s... answering me.' },
      {
        speaker: null,
        text: 'With a deep grinding sound, the floorboards by the west wall slide apart. Stone steps lead down into the dark.',
        setFlags: ['passage_open'],
      },
    ],
  },
  {
    id: 'heirloom_after',
    lines: [{ speaker: null, text: 'The medallion hums softly, warm as a living thing.' }],
  },

  // ── Scene 4 (lead-in): The Ancient Chamber ───────────────────────
  {
    id: 'chamber_arrival',
    lines: [
      { speaker: null, text: 'The steps, far older than the house above, end in a round stone chamber.', setFlags: ['entered_chamber'] },
      { speaker: null, text: 'At its centre, the sword-and-river sign glows in the floor.' },
      { speaker: 'adrian', text: 'This place has been waiting. Just like Aunt Mara said.' },
    ],
  },
  // ── Scene 4: First Battle ────────────────────────────────────────
  {
    id: 'guardian_awaken',
    lines: [
      { speaker: null, text: 'The sign blazes. Stone grinds on stone as a towering figure rises out of the light.' },
      { speaker: 'guardian', text: 'BLOOD OF VALE. YOU CARRY THE OATH... BUT DO YOU UNDERSTAND IT?' },
      { speaker: 'adrian', text: 'I don\'t even know what the oath is!' },
      { speaker: 'guardian', text: 'THEN LEARN IT AS YOUR ANCESTORS DID. STAND, AND BE TESTED.' },
    ],
    startBattle: 'covenant_guardian',
  },
  {
    id: 'guardian_defeated',
    lines: [
      { speaker: null, text: 'The Guardian kneels. Cracks of gold light spread across its stone body.' },
      { speaker: 'guardian', text: 'YOU STRUCK TO PROVE YOURSELF, NOT TO DESTROY. GOOD. THAT IS THE FIRST LESSON.' },
      { speaker: 'guardian', text: 'READ WHAT YOUR ANCESTORS LEFT BEHIND, HEIR OF VALE.' },
      { speaker: null, text: 'The Guardian crumbles into drifting motes of light. On the far wall, words begin to glow.' },
    ],
  },
  {
    id: 'chamber_sign_after',
    lines: [{ speaker: null, text: 'The sign is quiet now, its light steady and calm.' }],
  },

  // ── Scene 5: Revelation ──────────────────────────────────────────
  {
    id: 'ancestral_message',
    lines: [
      { speaker: null, text: 'The carving is old, but the glowing words are perfectly clear.' },
      { speaker: null, style: 'inscription', text: 'The oath was never sworn to the Crown alone.' },
      {
        speaker: null,
        style: 'inscription',
        text: 'When the palace ordered the river villages emptied, the Paladins of Vale refused. We stood with the people, and for that we were named traitors.',
      },
      {
        speaker: null,
        style: 'inscription',
        text: 'Let the heir who reads this decide what loyalty means.  — Elias Vale',
      },
      { speaker: 'adrian', text: 'So that was the treason. They protected the people from the Crown\'s own order.' },
      { speaker: 'adrian', text: 'And someone made sure nobody would ever find out.' },
    ],
    setFlags: ['read_message'],
    next: 'daniel_arrives',
  },

  // ── Scene 6: Royal Attention ─────────────────────────────────────
  {
    id: 'daniel_arrives',
    lines: [
      {
        speaker: null,
        text: 'Footsteps echo down the stone stairs. A torch beam sweeps across the chamber.',
        setFlags: ['daniel_arrived'],
      },
      { speaker: 'daniel', text: 'Easy. I am not here to hurt you. Daniel Rengas, Royal Security Office.' },
      { speaker: 'adrian', text: 'Royal security? How did you even find this place?' },
      {
        speaker: 'daniel',
        text: 'An hour ago, every old warding sensor in the palace lit up at once. They were built a century ago to watch for one thing: a Vale awakening.',
      },
      { speaker: 'daniel', text: 'Officially, I am here to bring you in. Unofficially... some of us never believed your family were traitors.' },
      { speaker: 'adrian', text: 'Then read that wall. That is what really happened.' },
      { speaker: 'daniel', text: 'I see it. And soon, people who would rather it stayed buried will know you saw it too.' },
      { speaker: 'daniel', text: 'Come to Kuching. The answers, and whoever erased your name, are in the capital.' },
      { speaker: 'adrian', text: 'Kuching, then. Aunt Mara will insist on coming. Good luck stopping her.' },
    ],
    setFlags: ['met_daniel'],
    endChapter: true,
  },
];

/** All loaded dialogue by id. Later chapters add theirs with registerDialogues(). */
export const DIALOGUES: Record<string, DialogueDef> = Object.fromEntries(defs.map((d) => [d.id, d]));

export function registerDialogues(more: readonly DialogueDef[]) {
  for (const d of more) DIALOGUES[d.id] = d;
}
