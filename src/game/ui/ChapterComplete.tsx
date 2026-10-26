import { useEffect, useState } from 'react';
import { gameStore, useGame } from '../core/gameStore';
import { MenuList } from './MenuList';

/** Formats milliseconds as m:ss. */
export function formatPlaytime(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/** End-of-prologue title card. Chapter 1 stays locked until it is developed. */
export function ChapterComplete() {
  const startedAt = useGame((s) => s.startedAt);
  const completedAt = useGame((s) => s.completedAt);
  const [ready, setReady] = useState(false);

  // Let the fade finish before accepting input, so a held key can't skip the card.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="chapter-complete" data-testid="chapter-complete" role="dialog" aria-label="Chapter complete">
      <div className="chapter-sign" aria-hidden="true">✦</div>
      <div className="chapter-kicker">Chapter 0 · The Forgotten Heir</div>
      <h1 className="chapter-title">Chapter 0 Complete</h1>
      <p className="chapter-quote">“The oath was never sworn to the Crown alone.”</p>
      {completedAt !== null && (
        <p className="chapter-time" data-testid="playtime">
          Play time {formatPlaytime(completedAt - startedAt)}
        </p>
      )}
      <div className="chapter-next">
        <span aria-hidden="true">🔒</span> Chapter 1 · Kuching — locked until it is developed
      </div>
      <div className={`chapter-menu${ready ? '' : ' waiting'}`}>
        <MenuList
          label="Chapter complete"
          active={ready}
          items={[
            { id: 'play-again', label: 'Play Again', disabled: !ready, onSelect: () => gameStore.getState().newGame() },
            { id: 'main-menu', label: 'Main Menu', disabled: !ready, onSelect: () => gameStore.getState().returnToTitle() },
          ]}
        />
      </div>
    </div>
  );
}
