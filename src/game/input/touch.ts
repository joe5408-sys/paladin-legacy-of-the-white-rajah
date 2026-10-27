/**
 * Touch support. The on-screen controls work by sending the same keyboard
 * events a player would type, so every existing listener (movement, the action
 * key, menus, battles, pause) works on touch screens without changes.
 */
import { useSyncExternalStore } from 'react';

function send(type: 'keydown' | 'keyup', code: string) {
  window.dispatchEvent(new KeyboardEvent(type, { code, key: code, bubbles: true, cancelable: true }));
}

/** Holds a key down (e.g. a movement direction while the joystick is pushed). */
export function pressKey(code: string): void {
  send('keydown', code);
}

export function releaseKey(code: string): void {
  send('keyup', code);
}

/** A single press and release (E to interact, Escape for the menu). */
export function tapKey(code: string): void {
  send('keydown', code);
  send('keyup', code);
}

// ── Is this a touch screen? ──────────────────────────────
// True on devices whose main pointer is coarse (phones, tablets), or as soon as
// the player touches the screen on any device (e.g. a laptop with a touchscreen).

let touched = false;
const listeners = new Set<() => void>();
const coarse = () => typeof window !== 'undefined' && !!window.matchMedia?.('(pointer: coarse)').matches;

if (typeof window !== 'undefined') {
  window.addEventListener(
    'touchstart',
    () => {
      if (touched) return;
      touched = true;
      listeners.forEach((l) => l());
    },
    { passive: true, capture: true },
  );
}

export function isTouchDevice(): boolean {
  return touched || coarse();
}

/** React hook: whether to show touch controls and touch wording. */
export function useTouchDevice(): boolean {
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    isTouchDevice,
    () => false,
  );
}

/** Four-way direction key for a joystick offset (screen pixels, +y is down), or null inside the dead zone. */
export function joystickKey(dx: number, dy: number, deadZone: number): string | null {
  if (Math.hypot(dx, dy) < deadZone) return null;
  if (Math.abs(dx) > Math.abs(dy)) return dx > 0 ? 'ArrowRight' : 'ArrowLeft';
  return dy > 0 ? 'ArrowDown' : 'ArrowUp';
}
