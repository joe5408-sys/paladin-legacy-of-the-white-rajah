import { useEffect, useRef } from 'react';
import { DirectionalInput } from './input';

/** Binds a DirectionalInput to window keyboard events for the component's lifetime. */
export function useDirectionalInput(): DirectionalInput {
  const ref = useRef<DirectionalInput>(null);
  if (!ref.current) ref.current = new DirectionalInput();

  useEffect(() => {
    const input = ref.current!;
    const down = (e: KeyboardEvent) => {
      if (input.press(e.code)) e.preventDefault(); // stop arrow keys scrolling the page
    };
    const up = (e: KeyboardEvent) => {
      input.release(e.code);
    };
    const reset = () => input.clear(); // avoid stuck keys when the tab loses focus
    window.addEventListener('keydown', down);
    window.addEventListener('keyup', up);
    window.addEventListener('blur', reset);
    return () => {
      window.removeEventListener('keydown', down);
      window.removeEventListener('keyup', up);
      window.removeEventListener('blur', reset);
    };
  }, []);

  return ref.current;
}
