import { useEffect } from 'react';
import { gameStore, type GameState } from '../core/gameStore';
import { activeChapter, currentObjectiveIndex, objectivesFor } from '../quests/quests';
import { settingsStore } from '../settings/settings';
import { audio, type AmbienceName } from './audio';

function ambienceFor(s: GameState): AmbienceName {
  if (s.screen === 'title') return 'title';
  if (s.mode === 'ending') return 'ending';
  if (s.battle) return 'battle';
  return s.scene;
}

/**
 * Listens to game state and plays the matching sounds. Keeps audio out of
 * gameplay code: the store never knows sound exists.
 */
export function AudioDirector() {
  useEffect(() => {
    // Unlock audio on the first user gesture (browser autoplay rules).
    const unlock = () => audio.unlock();
    window.addEventListener('keydown', unlock);
    window.addEventListener('pointerdown', unlock);

    const applySettings = () => {
      const { volume, muted } = settingsStore.getState();
      audio.setVolume(volume, muted);
    };
    applySettings();
    const unsubSettings = settingsStore.subscribe(applySettings);

    audio.setAmbience(ambienceFor(gameStore.getState()));
    const unsub = gameStore.subscribe((s, prev) => {
      audio.setAmbience(ambienceFor(s));

      if (s.transition?.phase === 'out' && prev.transition?.phase !== 'out') audio.play('door');

      // Dialogue: a soft tick per new line
      if (s.dialogue && (s.dialogue.index !== prev.dialogue?.index || s.dialogue.def !== prev.dialogue?.def)) {
        audio.play('text');
      }

      // Story beats
      if (s.flags.heirloom_awakened && !prev.flags.heirloom_awakened) audio.play('awaken');
      else if (s.screen === 'game' && prev.screen === 'game' && s.flags !== prev.flags) {
        const list = objectivesFor(s.flags);
        const sameChapter = activeChapter(s.flags) === activeChapter(prev.flags);
        const before = currentObjectiveIndex(list, prev.flags);
        const after = currentObjectiveIndex(list, s.flags);
        if (sameChapter && after > before && after < list.length) audio.play('objective');
      }

      // Battle
      const b = s.battle;
      const pb = prev.battle;
      if (b && b.seq !== pb?.seq && b.lastEvent) {
        const sfx = { attack: 'hit', skill: 'radiant', defend: 'guard', enemy_attack: 'enemy_hit' } as const;
        audio.play(sfx[b.lastEvent.kind]);
      }
      if (b?.stage === 'victory' && pb?.stage !== 'victory') audio.play('victory');
      if (b?.stage === 'defeat' && pb?.stage !== 'defeat') audio.play('defeat');
    });

    return () => {
      unsub();
      unsubSettings();
      window.removeEventListener('keydown', unlock);
      window.removeEventListener('pointerdown', unlock);
    };
  }, []);

  return null;
}
