import { beforeEach, describe, expect, it, vi } from 'vitest';
import { gameStore } from '../../src/game/core/gameStore';
import { selectDialogue } from '../../src/game/dialogue/rules';
import { INTERACTABLES } from '../../src/data/villageSquare';
import { DIALOGUES } from '../../src/data/dialogue';

const lim = INTERACTABLES.find((t) => t.id === 'npc-lim')!;
const s = () => gameStore.getState();

/** Press the action key until the conversation closes; returns presses used. */
function finishDialogue(max = 50): number {
  let presses = 0;
  while (s().dialogue && presses < max) {
    s().pressAction('KeyE');
    presses++;
  }
  return presses;
}

beforeEach(() => s().reset());

describe('selectDialogue', () => {
  const rules = [
    { dialogue: 'first', unless: ['met_lim' as const] },
    { dialogue: 'needs', requires: ['saw_family_home' as const] },
    { dialogue: 'fallback' },
  ];

  it('picks the first matching rule', () => {
    expect(selectDialogue(rules, {})).toBe('first');
    expect(selectDialogue(rules, { met_lim: true })).toBe('fallback');
    expect(selectDialogue(rules, { met_lim: true, saw_family_home: true })).toBe('needs');
  });

  it('returns null when nothing matches', () => {
    expect(selectDialogue([{ dialogue: 'x', requires: ['met_lim'] }], {})).toBeNull();
  });
});

describe('dialogue flow', () => {
  it('does nothing when E is pressed with nothing in range', () => {
    expect(s().pressAction('KeyE')).toBe(false);
    expect(s().mode).toBe('explore');
  });

  it('opens with E when an NPC is in range, with the correct first speaker', () => {
    s().setNearby(lim);
    expect(s().pressAction('KeyE')).toBe(true);
    expect(s().mode).toBe('dialogue');
    expect(s().dialogue?.def.id).toBe('lim_intro');
    expect(s().dialogue?.def.lines[0].speaker).toBe('lim');
    expect(s().dialogue?.index).toBe(0);
  });

  it('only E opens a conversation; Enter and Space do not', () => {
    s().setNearby(lim);
    expect(s().pressAction('Enter')).toBe(false);
    expect(s().pressAction('Space')).toBe(false);
    expect(s().mode).toBe('explore');
  });

  it('first press reveals the full line, second press advances', () => {
    s().setNearby(lim);
    s().pressAction('KeyE');
    s().pressAction('Space');
    expect(s().dialogue?.revealed).toBe(true);
    expect(s().dialogue?.index).toBe(0);
    s().pressAction('Enter');
    expect(s().dialogue?.index).toBe(1);
    expect(s().dialogue?.revealed).toBe(false);
  });

  it('closes after the last line, sets story flags, and returns to exploration', () => {
    s().setNearby(lim);
    s().pressAction('KeyE');
    const presses = finishDialogue();
    expect(presses).toBe(DIALOGUES.lim_intro.lines.length * 2);
    expect(s().mode).toBe('explore');
    expect(s().dialogue).toBeNull();
    expect(s().flags.met_lim).toBe(true);
  });

  it('uses the repeat dialogue on later conversations (intro does not replay)', () => {
    s().setNearby(lim);
    s().pressAction('KeyE');
    finishDialogue();
    s().pressAction('KeyE');
    expect(s().dialogue?.def.id).toBe('lim_repeat');
  });

  it('ignores movement keys and unrelated keys during dialogue', () => {
    s().setNearby(lim);
    s().pressAction('KeyE');
    expect(s().pressAction('KeyW')).toBe(false);
    expect(s().pressAction('Escape')).toBe(false);
    expect(s().dialogue?.index).toBe(0);
    expect(s().dialogue?.revealed).toBe(false);
  });

  it('cannot start a second conversation while one is open', () => {
    s().setNearby(lim);
    s().pressAction('KeyE');
    expect(s().startDialogue('family_home_exterior')).toBe(false);
    expect(s().dialogue?.def.id).toBe('lim_intro');
  });

  it('calls the completion callback once the conversation ends', () => {
    const done = vi.fn();
    s().startDialogue('lim_repeat', { onComplete: done });
    expect(done).not.toHaveBeenCalled();
    finishDialogue();
    expect(done).toHaveBeenCalledTimes(1);
  });

  it('rejects unknown dialogue ids without changing mode', () => {
    expect(s().startDialogue('does_not_exist')).toBe(false);
    expect(s().mode).toBe('explore');
  });
});
