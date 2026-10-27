import { gameStore, useGame } from '../core/gameStore';
import { promptText } from '../interaction/interaction';
import { useTouchDevice } from '../input/touch';

/**
 * "[E] Talk to Uncle Lim" — shown only while exploring and something is in range.
 * It can also be tapped or clicked (on touch screens it reads "Tap: Talk to ...").
 */
export function InteractionPrompt() {
  const nearby = useGame((s) => s.nearby);
  const mode = useGame((s) => s.mode);
  const touch = useTouchDevice();
  if (!nearby || mode !== 'explore') return null;
  return (
    <button
      type="button"
      className="interaction-prompt pixel-panel"
      data-testid="interaction-prompt"
      onClick={() => gameStore.getState().pressAction('KeyE')}
    >
      <kbd>{touch ? 'Tap' : '[E]'}</kbd> {promptText(nearby)}
    </button>
  );
}
