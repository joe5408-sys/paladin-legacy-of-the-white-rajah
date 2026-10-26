import { useEffect, useState } from 'react';
import { CHARACTERS } from '../../data/characters';
import { gameStore, useGame } from '../core/gameStore';
import { TEXT_SPEED_CPS, useSettings } from '../settings/settings';
import type { DialogueLine } from '../dialogue/types';


/** Classic bottom-of-screen RPG dialogue box with a typewriter effect. */
export function DialogueBox() {
  const dialogue = useGame((s) => s.dialogue);
  if (!dialogue) return null;
  const line = dialogue.def.lines[dialogue.index];
  const speaker = line.speaker ? CHARACTERS[line.speaker].name : null;
  const isLast = dialogue.index === dialogue.def.lines.length - 1;

  return (
    <div className="dialogue-box pixel-panel" role="dialog" aria-label="Dialogue" data-testid="dialogue-box">
      {speaker && (
        <div className="dialogue-speaker pixel-panel" data-testid="dialogue-speaker">
          {speaker}
        </div>
      )}
      {/* key resets the typewriter for each new line */}
      <TypedLine key={`${dialogue.def.id}:${dialogue.index}`} line={line} revealed={dialogue.revealed} />
      {dialogue.revealed && (
        <div className="dialogue-continue" aria-hidden="true">
          {isLast ? '■' : '▼'}
        </div>
      )}
    </div>
  );
}

function TypedLine({ line, revealed }: { line: DialogueLine; revealed: boolean }) {
  const [shown, setShown] = useState(0);
  const cps = TEXT_SPEED_CPS[useSettings((s) => s.textSpeed)];

  useEffect(() => {
    if (revealed) return;
    if (!Number.isFinite(cps)) {
      gameStore.getState().revealLine(); // "instant" text speed
      return;
    }
    const start = performance.now();
    let raf = 0;
    const tick = () => {
      const n = Math.floor(((performance.now() - start) / 1000) * cps);
      if (n >= line.text.length) {
        gameStore.getState().revealLine();
        return;
      }
      setShown(n);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [line, revealed, cps]);

  const text = revealed ? line.text : line.text.slice(0, shown);
  const style =
    line.style === 'inscription' ? ' inscription' : line.speaker ? '' : ' narration';
  return (
    <p className={`dialogue-text${style}`} data-testid="dialogue-text">
      {text}
      {/* Reserve the full line's space so the box doesn't reflow while typing */}
      <span className="dialogue-ghost">{revealed ? '' : line.text.slice(text.length)}</span>
    </p>
  );
}
