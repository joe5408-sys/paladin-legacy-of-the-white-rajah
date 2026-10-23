/**
 * All dialogue text lives here, never inside scene components.
 * Keep lines short: the whole prologue should play in 5–10 minutes.
 */
import type { DialogueDef } from '../game/dialogue/types';

const defs: DialogueDef[] = [
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
    id: 'family_home_exterior',
    lines: [
      { speaker: null, text: 'The old Vale house. Fresh gold paint gleams around the windows.' },
      { speaker: 'adrian', text: 'Twelve years... It looks smaller than I remember.' },
      { speaker: null, text: 'Floorboards creak somewhere inside. Someone is home.' },
    ],
    setFlags: ['saw_family_home'],
  },
];

export const DIALOGUES: Record<string, DialogueDef> = Object.fromEntries(defs.map((d) => [d.id, d]));
