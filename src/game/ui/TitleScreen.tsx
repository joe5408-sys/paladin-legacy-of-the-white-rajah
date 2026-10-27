import { useEffect, useMemo, useState } from 'react';
import { loadChaptersFor } from '../../chapters/loader';
import { SCENES } from '../../data/scenes';
import { gameStore } from '../core/gameStore';
import { deleteSave, loadSave, peekSavedFlags, type SaveData } from '../save/save';
import { getInsigniaTexture } from '../scenes/insignia';
import { formatPlaytime } from './ChapterComplete';
import { ConfirmDialog } from './ConfirmDialog';
import { MenuList } from './MenuList';
import { SettingsPanel } from './SettingsPanel';
import { useTouchDevice } from '../input/touch';

/** Fullscreen is offered on touch devices that support it (most Android browsers; not iPhone Safari). */
const canFullscreen = () => typeof document !== 'undefined' && !!document.documentElement.requestFullscreen && !document.fullscreenElement;

async function goFullscreen() {
  try {
    await document.documentElement.requestFullscreen();
    // Landscape, where the browser allows locking it (Android). Ignored elsewhere.
    await (screen.orientation as ScreenOrientation & { lock?: (o: string) => Promise<void> }).lock?.('landscape');
  } catch {
    // Not allowed here: the game still works in the browser window.
  }
}

const LOAD_PROBLEM: Record<string, string> = {
  corrupt: 'A saved game was found but could not be read.',
  incompatible: 'A saved game from an incompatible version was found.',
  invalid: 'A saved game was found but its data was invalid.',
};

/** Main menu: New Game, Continue (only with a valid save), Settings. */
export function TitleScreen() {
  const [view, setView] = useState<'menu' | 'settings' | 'confirm-new'>('menu');
  const [chaptersReady, setChaptersReady] = useState(false);
  const touch = useTouchDevice();
  const [fullscreenOffered, setFullscreenOffered] = useState(canFullscreen);

  // A save from a later chapter needs that chapter's content before it can be checked.
  useEffect(() => {
    let alive = true;
    loadChaptersFor(peekSavedFlags())
      .catch(() => undefined) // offline: the save will show as unreadable instead of crashing
      .finally(() => alive && setChaptersReady(true));
    return () => {
      alive = false;
    };
  }, []);

  // Re-read the save whenever we come back to the main menu view.
  const save = useMemo(
    () => (chaptersReady ? loadSave() : ({ ok: false, reason: 'missing' } as const)),
    [view, chaptersReady],
  );
  const emblem = useMemo(() => (getInsigniaTexture('#ffe08a').image as HTMLCanvasElement).toDataURL(), []);

  const hasSave = save.ok;
  const newGame = () => {
    if (hasSave) setView('confirm-new');
    else gameStore.getState().startNewGame();
  };

  return (
    <div className="title-screen" data-testid="title-screen">
      <div className="title-sky" aria-hidden="true" />
      <div className="title-river" aria-hidden="true" />
      <div className="title-content">
        <img className="title-emblem" src={emblem} alt="" aria-hidden="true" />
        <h1 className="title-name">Paladin</h1>
        <div className="title-sub">Legacy of the White Rajah</div>
        <div className="title-chapter">Chapter 0 · The Forgotten Heir</div>

        {view === 'menu' && (
          <div className="title-menu pixel-panel">
            <MenuList
              label="Main menu"
              items={[
                ...(hasSave
                  ? [
                      {
                        id: 'continue',
                        label: 'Continue',
                        onSelect: () => save.ok && gameStore.getState().loadGame(save.data),
                        hint: save.ok ? `${describeSave(save.data)} · ${formatPlaytime(save.data.playTimeMs)}` : undefined,
                      },
                    ]
                  : []),
                { id: 'new-game', label: 'New Game', onSelect: newGame },
                { id: 'settings', label: 'Settings', onSelect: () => setView('settings') },
                ...(touch && fullscreenOffered
                  ? [
                      {
                        id: 'fullscreen',
                        label: 'Full Screen',
                        hint: 'Play without the browser bars',
                        onSelect: () => {
                          setFullscreenOffered(false);
                          void goFullscreen();
                        },
                      },
                    ]
                  : []),
              ]}
            />
            {!save.ok && LOAD_PROBLEM[save.reason] && (
              <p className="title-warning" data-testid="save-warning">
                {LOAD_PROBLEM[save.reason]} Starting a New Game will replace it.
              </p>
            )}
          </div>
        )}
        {view === 'settings' && <SettingsPanel onBack={() => setView('menu')} />}
      </div>

      {view === 'confirm-new' && (
        <ConfirmDialog
          message="Start a new game? Your saved progress will be erased."
          confirmLabel="Erase and start"
          onCancel={() => setView('menu')}
          onConfirm={() => {
            deleteSave();
            gameStore.getState().startNewGame();
          }}
        />
      )}

      <footer className="title-footer">
        A work of fiction set in an imagined, alternate-history Sarawak. Its monarchy, Paladin order and
        events are invented and do not depict real history.
        <span className="title-controls">
          {touch ? 'Tap to choose · drag the pad to walk' : '↑/↓ choose · E / Enter select · Esc back'}
        </span>
      </footer>
    </div>
  );
}

/** Short description of where a save is, for the Continue hint. */
function describeSave(data: SaveData): string {
  const flags = new Set(data.flags);
  if (flags.has('c3_hearing_won')) return "Chapter 3 · The Crown's Word (to be continued)";
  if (flags.has('chapter3_started')) return `Chapter 3 · ${SCENES[data.scene].name}`;
  if (flags.has('c2_iron_defeated')) return 'Chapter 2 complete';
  if (flags.has('chapter2_started')) return `Chapter 2 · ${SCENES[data.scene].name}`;
  if (flags.has('c1_escaped')) return 'Chapter 1 complete';
  if (flags.has('chapter1_started')) return `Chapter 1 · ${SCENES[data.scene].name}`;
  if (data.prologueComplete) return 'Chapter 0 complete';
  return SCENES[data.scene].name;
}
