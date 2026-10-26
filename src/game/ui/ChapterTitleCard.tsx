import { useEffect } from 'react';
import { gameStore, useGame } from '../core/gameStore';

const SHOW_MS = 3200;

/** Full-screen chapter title shown when a new chapter begins, then hands over to the game. */
export function ChapterTitleCard() {
  const card = useGame((s) => s.chapterCard);

  useEffect(() => {
    if (!card) return;
    const t = setTimeout(() => gameStore.getState().dismissChapterCard(), SHOW_MS);
    return () => clearTimeout(t);
  }, [card]);

  if (!card) return null;
  const [kicker, title] = card.includes(' · ') ? card.split(' · ') : ['', card];
  return (
    <div className="chapter-card" data-testid="chapter-card" role="status">
      {kicker && <div className="chapter-kicker">{kicker}</div>}
      <div className="chapter-title">{title}</div>
    </div>
  );
}
