/**
 * Phase 5: revelation, Daniel Rengas and chapter completion, plus a single
 * test that plays the entire prologue from New Game to CHAPTER 0 COMPLETE.
 */
import { beforeEach, describe, expect, it } from 'vitest';
import { gameStore } from '../../src/game/core/gameStore';
import { CHAMBER_LAYOUT } from '../../src/data/ancientChamber';
import { WATERFRONT_LAYOUT } from '../../src/chapters/chapter1/data';
import { HOME_C2_LAYOUT, VILLAGE_C2_LAYOUT } from '../../src/chapters/chapter2/villageData';
import { BOAT_LAYOUT } from '../../src/chapters/chapter2/boatData';
import { LANDING_LAYOUT } from '../../src/chapters/chapter2/waystationData';
import { HALL_LAYOUT } from '../../src/chapters/chapter2/hallData';
import { JETTY_LAYOUT } from '../../src/chapters/chapter2/jettyData';
import { BOAT_NIGHT_LAYOUT } from '../../src/chapters/chapter3/boatNightData';
import { ROOM_LAYOUT, WATERFRONT_NIGHT_LAYOUT } from '../../src/chapters/chapter3/kuchingData';
import { RECORDS_LAYOUT } from '../../src/chapters/chapter1/recordsData';
import { VAULT_LAYOUT } from '../../src/chapters/chapter1/vaultData';
import { ARCHIVES_LAYOUT } from '../../src/chapters/chapter1/archivesData';
import '../../src/chapters/chapter1/content'; // registers Chapter 1 dialogue and objectives
import '../../src/chapters/chapter2/content';
import { HOME_LAYOUT } from '../../src/data/familyHome';
import { VILLAGE_LAYOUT } from '../../src/data/villageSquare';
import { DIALOGUES } from '../../src/data/dialogue';
import { PROLOGUE_OBJECTIVES } from '../../src/data/quests';
import { currentObjective } from '../../src/game/quests/quests';
import { isAvailable } from '../../src/game/interaction/interaction';
import { meetsCondition } from '../../src/game/core/flags';
import { formatPlaytime } from '../../src/game/ui/ChapterComplete';
import type { SceneId } from '../../src/data/scenes';
import type { SceneLayout } from '../../src/game/scenes/layout';
import type { Command } from '../../src/game/combat/battle';

const s = () => gameStore.getState();
const LAYOUTS: Record<SceneId, SceneLayout> = {
  village: VILLAGE_LAYOUT,
  home: HOME_LAYOUT,
  chamber: CHAMBER_LAYOUT,
  waterfront: WATERFRONT_LAYOUT,
  archives: ARCHIVES_LAYOUT,
  vault: VAULT_LAYOUT,
  records: RECORDS_LAYOUT,
  boat: BOAT_LAYOUT,
  village_c2: VILLAGE_C2_LAYOUT,
  home_c2: HOME_C2_LAYOUT,
  waystation_landing: LANDING_LAYOUT,
  waystation_hall: HALL_LAYOUT,
  jetty_dusk: JETTY_LAYOUT,
  boat_night: BOAT_NIGHT_LAYOUT,
  waterfront_night: WATERFRONT_NIGHT_LAYOUT,
  jamilah_room: ROOM_LAYOUT,
};

function finishDialogue() {
  for (let i = 0; i < 200 && s().dialogue; i++) s().pressAction('Enter');
}
/** Finishes only the conversation currently open (not any that it chains into). */
function finishCurrent() {
  const id = s().dialogue?.def.id;
  for (let i = 0; i < 200 && s().dialogue && s().dialogue?.def.id === id; i++) s().pressAction('Enter');
}
function use(id: string) {
  const t = LAYOUTS[s().scene].interactables.find((x) => x.id === id)!;
  expect(isAvailable(t, s().flags), `${id} available`).toBe(true);
  s().setNearby(t);
  return s().pressAction('KeyE');
}
function completeTransition() {
  s().swapScene();
  s().finishTransition();
  finishDialogue();
}
function battle(cmd: Command) {
  s().chooseCommand(cmd);
  s().advanceBattle();
  if (s().battle?.stage === 'enemy_action') s().advanceBattle();
}

beforeEach(() => s().reset());

describe('ancestral message', () => {
  const message = CHAMBER_LAYOUT.interactables.find((t) => t.id === 'ancestral-message')!;

  it('only appears after the Guardian is defeated, and only until it is read', () => {
    expect(isAvailable(message, { entered_chamber: true })).toBe(false);
    expect(isAvailable(message, { guardian_defeated: true })).toBe(true);
    expect(isAvailable(message, { guardian_defeated: true, read_message: true })).toBe(false);
  });

  it('contains the exact required line, shown as an inscription', () => {
    const line = DIALOGUES.ancestral_message.lines.find((l) => l.style === 'inscription');
    expect(line?.text).toBe('The oath was never sworn to the Crown alone.');
  });

  it('Daniel only appears once he has arrived', () => {
    const daniel = CHAMBER_LAYOUT.npcs.find((n) => n.character === 'daniel')!;
    expect(meetsCondition(daniel.when, { read_message: true })).toBe(false);
    expect(meetsCondition(daniel.when, { daniel_arrived: true })).toBe(true);
  });
});

describe('ending sequence', () => {
  beforeEach(() => {
    s().setFlags([
      'arrived', 'entered_home', 'met_mara', 'heirloom_awakened',
      'passage_open', 'entered_chamber', 'guardian_defeated',
    ]);
    s().requestScene('chamber', 'stairs');
    s().swapScene();
    s().finishTransition();
  });

  it('reading the message chains straight into Daniel, then completes the chapter', () => {
    use('ancestral-message');
    expect(s().dialogue?.def.id).toBe('ancestral_message');
    finishCurrent();
    expect(s().flags.read_message).toBe(true);
    expect(currentObjective(PROLOGUE_OBJECTIVES, s().flags)).toBeNull(); // all objectives done
    // Chained, no extra input needed
    expect(s().dialogue?.def.id).toBe('daniel_arrives');
    expect(s().flags.daniel_arrived).toBe(true); // set on his first line → sprite appears
    expect(s().dialogue?.def.lines.some((l) => /Kuching/.test(l.text))).toBe(true);
    finishDialogue();
    expect(s().flags.met_daniel).toBe(true);
    expect(s().flags.prologue_complete).toBe(true);
    expect(s().mode).toBe('ending');
    expect(s().completedAt).not.toBeNull();
  });

  it('nothing can be triggered on the ending screen', () => {
    use('ancestral-message');
    finishDialogue();
    finishDialogue();
    expect(s().mode).toBe('ending');
    s().setNearby(CHAMBER_LAYOUT.interactables[0]);
    expect(s().pressAction('KeyE')).toBe(false);
    expect(s().requestScene('home', 'door')).toBe(false);
    expect(s().startBattle('covenant_guardian')).toBe(false);
    s().endChapter(); // idempotent
    expect(s().mode).toBe('ending');
  });

  it('Play Again starts a fresh game with the opening narration', () => {
    use('ancestral-message');
    finishDialogue();
    finishDialogue();
    s().newGame();
    expect(s().scene).toBe('village');
    expect(s().flags).toEqual({});
    expect(s().completedAt).toBeNull();
    expect(s().dialogue?.def.id).toBe('village_arrival');
  });
});

describe('formatPlaytime', () => {
  it('formats m:ss', () => {
    expect(formatPlaytime(0)).toBe('0:00');
    expect(formatPlaytime(65_000)).toBe('1:05');
    expect(formatPlaytime(7 * 60_000 + 9_400)).toBe('7:09');
  });
});

describe('full prologue', () => {
  it('can be completed from New Game to CHAPTER 0 COMPLETE, with objectives in order', () => {
    const seen: string[] = [];
    const note = () => {
      const o = currentObjective(PROLOGUE_OBJECTIVES, s().flags)?.id ?? 'done';
      if (seen[seen.length - 1] !== o) seen.push(o);
    };

    s().newGame();
    finishDialogue(); // Scene 1
    note();
    use('npc-lim'); // optional chat
    finishDialogue();
    use('family-home-door');
    completeTransition(); // Scene 2
    note();
    use('npc-mara');
    finishDialogue();
    note();
    use('heirloom'); // Scene 3
    finishDialogue();
    note();
    use('hidden-passage');
    completeTransition();
    note();
    use('chamber-sign'); // Scene 4
    finishDialogue();
    expect(s().mode).toBe('battle');
    s().advanceBattle(); // intro
    battle('skill');
    battle('skill');
    battle('attack');
    s().advanceBattle(); // continue after victory
    finishDialogue();
    note();
    use('ancestral-message'); // Scene 5 → Scene 6
    finishDialogue();
    finishDialogue();
    note();

    expect(s().mode).toBe('ending');
    expect(seen).toEqual([
      'find_home', 'talk_mara', 'inspect_heirloom', 'enter_chamber',
      'defeat_guardian', 'read_message', 'done',
    ]);
  });
});
