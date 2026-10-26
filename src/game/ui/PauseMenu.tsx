import { useEffect, useState } from 'react';
import { audio } from '../audio/audio';
import { gameStore, useGame } from '../core/gameStore';
import { playerTracker } from '../core/playerTracker';
import { buildSave, writeSave } from '../save/save';
import { ConfirmDialog } from './ConfirmDialog';
import { MenuList } from './MenuList';
import { SettingsPanel } from './SettingsPanel';

/** Opens the pause menu with Esc whenever pausing is allowed. */
export function usePauseKey() {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code !== 'Escape' || e.repeat) return;
      const s = gameStore.getState();
      if (!s.paused && s.canPause()) {
        e.preventDefault();
        s.setPaused(true);
        audio.play('confirm');
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);
}

/** Saves at the player's current position. Only allowed while exploring. */
export function saveCurrentGame(): boolean {
  const s = gameStore.getState();
  if (s.mode !== 'explore') return false;
  return writeSave(buildSave(s, { ...playerTracker }));
}

/** Resume / Save / Settings / Return to Main Menu. */
export function PauseMenu() {
  const paused = useGame((s) => s.paused);
  const mode = useGame((s) => s.mode);
  const [view, setView] = useState<'menu' | 'settings' | 'confirm-quit'>('menu');
  const [status, setStatus] = useState<string | null>(null);

  useEffect(() => {
    if (!paused) {
      setView('menu');
      setStatus(null);
    }
  }, [paused]);

  if (!paused) return null;
  const resume = () => gameStore.getState().setPaused(false);
  const canSave = mode === 'explore';
  const saveHint =
    mode === 'battle'
      ? 'You cannot save during a battle.'
      : mode === 'dialogue'
        ? 'Finish the conversation to save.'
        : 'Save your progress at this spot.';

  return (
    <div className="menu-backdrop pause" data-testid="pause-menu">
      {view === 'menu' && (
        <div className="menu-panel pixel-panel">
          <div className="menu-title">Paused</div>
          <MenuList
            label="Pause menu"
            onBack={resume}
            items={[
              { id: 'resume', label: 'Resume', onSelect: resume },
              {
                id: 'save',
                label: 'Save',
                disabled: !canSave,
                hint: saveHint,
                onSelect: () => {
                  const ok = saveCurrentGame();
                  setStatus(ok ? 'Game saved.' : 'Could not save: browser storage is unavailable.');
                  if (ok) audio.play('save');
                },
              },
              { id: 'settings', label: 'Settings', onSelect: () => setView('settings') },
              { id: 'title', label: 'Return to Main Menu', onSelect: () => setView('confirm-quit') },
            ]}
          />
          {status && (
            <p className="menu-status" data-testid="save-status">
              {status}
            </p>
          )}
        </div>
      )}
      {view === 'settings' && <SettingsPanel onBack={() => setView('menu')} />}
      {view === 'confirm-quit' && (
        <ConfirmDialog
          message="Return to the main menu? Progress since your last save will be lost."
          confirmLabel="Return to menu"
          onCancel={() => setView('menu')}
          onConfirm={() => gameStore.getState().returnToTitle()}
        />
      )}
    </div>
  );
}
