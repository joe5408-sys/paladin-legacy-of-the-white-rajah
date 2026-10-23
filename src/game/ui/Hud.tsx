import { useGame } from '../core/gameStore';
import { DialogueBox } from './DialogueBox';
import { InteractionPrompt } from './InteractionPrompt';

/** Exploration HUD: location label, interaction prompt, dialogue and controls hint. */
export function Hud({ location }: { location: string }) {
  const mode = useGame((s) => s.mode);
  return (
    <div className="hud">
      <div className="hud-location pixel-panel">{location}</div>
      <InteractionPrompt />
      <DialogueBox />
      {mode === 'explore' && (
        <div className="hud-controls pixel-panel">
          <kbd>WASD</kbd> / <kbd>Arrows</kbd> Move · <kbd>E</kbd> Interact
        </div>
      )}
    </div>
  );
}
