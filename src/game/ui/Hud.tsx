/** Exploration HUD: location label and controls hint. Kept deliberately minimal. */
export function Hud({ location }: { location: string }) {
  return (
    <div className="hud" aria-live="polite">
      <div className="hud-location pixel-panel">{location}</div>
      <div className="hud-controls pixel-panel">
        <kbd>WASD</kbd> / <kbd>Arrows</kbd> Move
      </div>
    </div>
  );
}
