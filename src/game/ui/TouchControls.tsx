import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { gameStore, useGame } from '../core/gameStore';
import { joystickKey, pressKey, releaseKey, tapKey, useTouchDevice } from '../input/touch';

/**
 * On-screen controls for touch screens: a joystick (bottom left), an action
 * button (bottom right, the E key) and a menu button (top centre, Esc). Shown
 * only while exploring; dialogue, menus and battles are tapped directly.
 */
export function TouchControls() {
  const touch = useTouchDevice();
  const mode = useGame((s) => s.mode);
  const paused = useGame((s) => s.paused);
  const card = useGame((s) => s.chapterCard);
  const nearby = useGame((s) => s.nearby);
  if (!touch || paused || card) return null;

  return (
    <div className="touch-controls" data-testid="touch-controls">
      {(mode === 'explore' || mode === 'dialogue') && (
        <button
          type="button"
          className="touch-menu pixel-panel"
          data-testid="touch-menu"
          aria-label="Menu"
          onClick={() => tapKey('Escape')}
        >
          ☰ Menu
        </button>
      )}
      {mode === 'explore' && (
        <>
          <Joystick />
          <button
            type="button"
            className={`touch-action${nearby ? ' ready' : ''}`}
            data-testid="touch-action"
            aria-label={nearby ? 'Interact' : 'Action'}
            onClick={() => tapKey('KeyE')}
          >
            {nearby ? '!' : 'E'}
          </button>
        </>
      )}
    </div>
  );
}

/** A drag pad: push the knob in a direction to walk that way (four directions, like the arrow keys). */
function Joystick() {
  const base = useRef<HTMLDivElement>(null);
  const held = useRef<string | null>(null);
  const [knob, setKnob] = useState({ x: 0, y: 0 });

  const hold = (code: string | null) => {
    if (code === held.current) return;
    if (held.current) releaseKey(held.current);
    if (code) pressKey(code);
    held.current = code;
  };

  // Let go of any held direction when the joystick disappears (dialogue, battle...).
  useEffect(() => () => hold(null), []);

  const move = (e: ReactPointerEvent) => {
    const rect = base.current!.getBoundingClientRect();
    const r = rect.width / 2;
    let dx = e.clientX - (rect.left + r);
    let dy = e.clientY - (rect.top + r);
    const len = Math.hypot(dx, dy);
    if (len > r) {
      dx = (dx / len) * r;
      dy = (dy / len) * r;
    }
    setKnob({ x: dx, y: dy });
    hold(joystickKey(dx, dy, r * 0.25));
  };
  const end = () => {
    setKnob({ x: 0, y: 0 });
    hold(null);
  };

  return (
    <div
      ref={base}
      className="touch-joystick"
      data-testid="touch-joystick"
      role="application"
      aria-label="Movement pad: drag to walk"
      onPointerDown={(e) => {
        e.currentTarget.setPointerCapture(e.pointerId);
        move(e);
      }}
      onPointerMove={(e) => {
        if (e.currentTarget.hasPointerCapture(e.pointerId)) move(e);
      }}
      onPointerUp={end}
      onPointerCancel={end}
      onLostPointerCapture={end}
    >
      <div className="touch-knob" style={{ transform: `translate(${knob.x}px, ${knob.y}px)` }} />
    </div>
  );
}

/** Whether a tap on the dialogue box should advance it (shared with DialogueBox). */
export function advanceDialogueByTap(): void {
  gameStore.getState().pressAction('Enter');
}
