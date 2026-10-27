import { useEffect, useState } from 'react';
import { useTouchDevice } from '../input/touch';

const PORTRAIT_PHONE = '(orientation: portrait) and (max-width: 700px)';

/**
 * On a phone held upright the 16:9 game would be a thin strip, so ask the player
 * to turn it sideways. Tablets in portrait still have room, so they are left alone.
 * "Play anyway" hides the notice for this visit.
 */
export function RotateNotice() {
  const touch = useTouchDevice();
  const [portrait, setPortrait] = useState(() => window.matchMedia?.(PORTRAIT_PHONE).matches ?? false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia?.(PORTRAIT_PHONE);
    if (!mq) return;
    const update = () => setPortrait(mq.matches);
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);

  if (!touch || !portrait || dismissed) return null;
  return (
    <div className="rotate-notice" data-testid="rotate-notice" role="dialog" aria-label="Turn your device">
      <div className="rotate-icon" aria-hidden="true">
        ⟳
      </div>
      <p>Turn your phone sideways to play.</p>
      <button type="button" className="menu-item selected" onClick={() => setDismissed(true)}>
        Play anyway
      </button>
    </div>
  );
}
