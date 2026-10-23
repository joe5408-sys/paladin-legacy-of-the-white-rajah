import { SCENES } from '../../data/scenes';
import { BattleHud } from '../combat/BattleHud';
import { useGame } from '../core/gameStore';
import { DialogueBox } from './DialogueBox';
import { InteractionPrompt } from './InteractionPrompt';
import { ObjectiveTracker } from './ObjectiveTracker';
import { SceneFade } from './SceneFade';

/** Exploration HUD (location, objective, prompt, dialogue) or the battle HUD. */
export function Hud() {
  const mode = useGame((s) => s.mode);
  const scene = useGame((s) => s.scene);

  if (mode === 'battle') {
    return (
      <div className="hud">
        <BattleHud />
      </div>
    );
  }

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
