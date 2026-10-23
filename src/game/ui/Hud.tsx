import { SCENES } from '../../data/scenes';
import { useGame } from '../core/gameStore';
import { DialogueBox } from './DialogueBox';
import { InteractionPrompt } from './InteractionPrompt';
import { ObjectiveTracker } from './ObjectiveTracker';
import { SceneFade } from './SceneFade';

/** Exploration HUD: location, objective, interaction prompt, dialogue, controls hint. */
export function Hud() {
  const mode = useGame((s) => s.mode);
  const scene = useGame((s) => s.scene);
  return (
    <div className="hud">
      <div className="hud-location pixel-panel" data-testid="location">
        {SCENES[scene].name}
      </div>
      <ObjectiveTracker />
      <InteractionPrompt />
      <DialogueBox />
      {mode === 'explore' && (
        <div className="hud-controls pixel-panel">
          <kbd>WASD</kbd> / <kbd>Arrows</kbd> Move · <kbd>E</kbd> Interact
        </div>
      )}
      <SceneFade />
    </div>
  );
}
