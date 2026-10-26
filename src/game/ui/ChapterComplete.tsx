import { useEffect, useState } from 'react';
import { hasChapterAfter, loadChapter } from '../../chapters/loader';
import { gameStore, useGame } from '../core/gameStore';
import { activeChapter } from '../quests/quests';
import { MenuList, type MenuItem } from './MenuList';

/** Formats milliseconds as m:ss. */
export function formatPlaytime(ms: number): string {
  const total = Math.max(0, Math.round(ms / 1000));
  const m = Math.floor(total / 60);
  const s = total % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

/**
 * Closing card for a chapter. Chapter 0 offers "Continue to Chapter 1";
 * the in-progress Chapter 1 ends on a "to be continued" card.
 */
export function ChapterComplete() {
  const startedAt = useGame((s) => s.startedAt);
  const completedAt = useGame((s) => s.completedAt);
  const chapter = useGame((s) => activeChapter(s.flags));
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Let the fade finish before accepting input, so a held key can't skip the card.
  useEffect(() => {
    const t = setTimeout(() => setReady(true), 2200);
    return () => clearTimeout(t);
  }, []);

  const continueToChapter1 = async () => {
    setLoading(true);
    setError(null);
    try {
      await loadChapter(1);
      gameStore.getState().startChapter1();
    } catch {
      setError('Could not load Chapter 1. Check your connection and try again.');
      setLoading(false);
    }
  };

  const items: MenuItem[] = [];
  if (chapter === 0 && hasChapterAfter(0)) {
    items.push({
      id: 'next-chapter',
      label: loading ? 'Loading Chapter 1…' : 'Continue to Chapter 1',
      disabled: !ready || loading,
      onSelect: () => void continueToChapter1(),
    });
  }
  if (chapter === 0) {
    items.push({ id: 'play-again', label: 'Play Again', disabled: !ready || loading, onSelect: () => gameStore.getState().newGame() });
  }
  items.push({ id: 'main-menu', label: 'Main Menu', disabled: !ready || loading, onSelect: () => gameStore.getState().returnToTitle() });

  const playtime = completedAt !== null && (
    <p className="chapter-time" data-testid="playtime">
      Play time {formatPlaytime(completedAt - startedAt)}
    </p>
  );

  return (
    <div className="chapter-complete" data-testid="chapter-complete" role="dialog" aria-label="Chapter complete">
      <div className="chapter-sign" aria-hidden="true">✦</div>
      {chapter === 0 ? (
        <>
          <div className="chapter-kicker">Chapter 0 · The Forgotten Heir</div>
          <h1 className="chapter-title">Chapter 0 Complete</h1>
          <p className="chapter-quote">“The oath was never sworn to the Crown alone.”</p>
          {playtime}
          <div className="chapter-next">Next: Chapter 1 · The Capital's Shadow</div>
        </>
      ) : (
        <>
          <div className="chapter-kicker">Chapter 1 · The Capital's Shadow</div>
          <h1 className="chapter-title" data-testid="to-be-continued">To Be Continued</h1>
          <p className="chapter-quote">Every box has a name on it. One of them is yours.</p>
          {playtime}
          <div className="chapter-next">The rest of Chapter 1 arrives in a future update. Your progress is saved.</div>
        </>
      )}
      <div className={`chapter-menu${ready ? '' : ' waiting'}`}>
        <MenuList label="Chapter complete" active={ready && !loading} items={items} />
        {error && <p className="title-warning">{error}</p>}
      </div>
    </div>
  );
}
