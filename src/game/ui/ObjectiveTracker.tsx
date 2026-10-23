import { useEffect, useRef, useState } from 'react';
import { PROLOGUE_OBJECTIVES } from '../../data/quests';
import { useGame } from '../core/gameStore';
import { currentObjective } from '../quests/quests';

/** Shows the active objective; flashes briefly when it changes. */
export function ObjectiveTracker() {
  const flags = useGame((s) => s.flags);
  const objective = currentObjective(PROLOGUE_OBJECTIVES, flags);
  const [flash, setFlash] = useState(false);
  const lastId = useRef(objective?.id);

  useEffect(() => {
    if (lastId.current === objective?.id) return;
    lastId.current = objective?.id;
    setFlash(true);
    const t = setTimeout(() => setFlash(false), 1600);
    return () => clearTimeout(t);
  }, [objective?.id]);

  if (!objective) return null;
  return (
    <div
      className={`hud-objective pixel-panel${flash ? ' updated' : ''}`}
      data-testid="objective"
      aria-live="polite"
    >
      <div className="hud-objective-title">{flash ? 'New Objective' : 'Objective'}</div>
      <div>{objective.text}</div>
    </div>
  );
}
