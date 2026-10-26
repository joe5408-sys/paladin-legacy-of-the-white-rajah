import { useEffect, useRef, useState, type ReactNode } from 'react';
import { audio } from '../audio/audio';

export interface MenuItem {
  id: string;
  label: ReactNode;
  onSelect?: () => void;
  /** ←/→ adjust (settings rows). */
  onAdjust?: (dir: -1 | 1) => void;
  /** Shown to the right of the label (e.g. a setting's value). */
  value?: ReactNode;
  disabled?: boolean;
  /** Why it's disabled, or extra info; shown under the menu while highlighted. */
  hint?: string;
}

const UP = new Set(['ArrowUp', 'KeyW']);
const DOWN = new Set(['ArrowDown', 'KeyS']);
const LEFT = new Set(['ArrowLeft', 'KeyA']);
const RIGHT = new Set(['ArrowRight', 'KeyD']);
const CONFIRM = new Set(['KeyE', 'Enter', 'Space', 'NumpadEnter']);

/**
 * Keyboard + mouse menu. ↑/↓ (W/S) move, E/Enter/Space select, ←/→ adjust,
 * Esc runs onBack. Disabled items are shown greyed and skipped.
 */
export function MenuList({
  items,
  onBack,
  label,
  active = true,
}: {
  items: MenuItem[];
  onBack?: () => void;
  label: string;
  /** Only the topmost menu listens to the keyboard. */
  active?: boolean;
}) {
  const firstEnabled = Math.max(0, items.findIndex((i) => !i.disabled));
  const [index, setIndex] = useState(firstEnabled);
  const latest = useRef({ items, index, onBack });
  latest.current = { items, index, onBack };

  // Keep the cursor on an enabled item if the list changes.
  useEffect(() => {
    if (items[index]?.disabled || index >= items.length) setIndex(firstEnabled);
  }, [items, index, firstEnabled]);

  useEffect(() => {
    if (!active) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.repeat) return;
      const { items: list, index: i, onBack: back } = latest.current;
      const move = (dir: 1 | -1) => {
        for (let step = 1; step <= list.length; step++) {
          const next = (i + dir * step + list.length) % list.length;
          if (!list[next].disabled) {
            setIndex(next);
            audio.play('select');
            return;
          }
        }
      };
      if (UP.has(e.code)) move(-1);
      else if (DOWN.has(e.code)) move(1);
      else if (LEFT.has(e.code) || RIGHT.has(e.code)) {
        const item = list[i];
        if (!item?.onAdjust || item.disabled) return;
        item.onAdjust(LEFT.has(e.code) ? -1 : 1);
        audio.play('select');
      } else if (CONFIRM.has(e.code)) {
        const item = list[i];
        if (!item || item.disabled || !item.onSelect) return;
        audio.play('confirm');
        item.onSelect();
      } else if (e.code === 'Escape' && back) {
        back();
      } else {
        return;
      }
      e.preventDefault();
      e.stopImmediatePropagation(); // menus own the keyboard while open
    };
    window.addEventListener('keydown', onKey, true);
    return () => window.removeEventListener('keydown', onKey, true);
  }, [active]);

  const hint = items[index]?.hint;
  return (
    <div className="menu" role="menu" aria-label={label}>
      {items.map((item, i) => (
        <button
          key={item.id}
          role="menuitem"
          data-testid={`menu-${item.id}`}
          className={`menu-item${i === index ? ' selected' : ''}`}
          disabled={item.disabled}
          aria-disabled={item.disabled}
          onMouseEnter={() => !item.disabled && setIndex(i)}
          onClick={() => {
            if (item.disabled) return;
            setIndex(i);
            if (item.onSelect) {
              audio.play('confirm');
              item.onSelect();
            } else if (item.onAdjust) {
              item.onAdjust(1);
              audio.play('select');
            }
          }}
        >
          <span>{item.label}</span>
          {item.value !== undefined && <span className="menu-value">◂ {item.value} ▸</span>}
        </button>
      ))}
      <div className="menu-hint" aria-live="polite">
        {hint ?? ' '}
      </div>
    </div>
  );
}
