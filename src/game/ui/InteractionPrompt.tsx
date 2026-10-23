import { useGame } from '../core/gameStore';
import { promptText } from '../interaction/interaction';

/** "[E] Talk to Uncle Lim" — shown only while exploring and something is in range. */
export function InteractionPrompt() {
  const nearby = useGame((s) => s.nearby);
  const mode = useGame((s) => s.mode);
  if (!nearby || mode !== 'explore') return null;
  return (
    <div className="interaction-prompt pixel-panel" data-testid="interaction-prompt">
      <kbd>[E]</kbd> {promptText(nearby)}
    </div>
  );
}
