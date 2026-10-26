import { useSettings, settingsStore, type TextSpeed } from '../settings/settings';
import { MenuList } from './MenuList';

const SPEEDS: TextSpeed[] = ['slow', 'normal', 'fast', 'instant'];
const SPEED_LABEL: Record<TextSpeed, string> = {
  slow: 'Slow',
  normal: 'Normal',
  fast: 'Fast',
  instant: 'Instant',
};

/** Text speed, volume and sound toggle. Changes apply and save immediately. */
export function SettingsPanel({ onBack, active = true }: { onBack: () => void; active?: boolean }) {
  const textSpeed = useSettings((s) => s.textSpeed);
  const volume = useSettings((s) => s.volume);
  const muted = useSettings((s) => s.muted);
  const update = settingsStore.getState().update;

  const cycleSpeed = (dir: -1 | 1) => {
    const i = SPEEDS.indexOf(textSpeed);
    update({ textSpeed: SPEEDS[(i + dir + SPEEDS.length) % SPEEDS.length] });
  };

  return (
    <div className="menu-panel pixel-panel" data-testid="settings">
      <div className="menu-title">Settings</div>
      <MenuList
        label="Settings"
        active={active}
        onBack={onBack}
        items={[
          {
            id: 'text-speed',
            label: 'Text speed',
            value: SPEED_LABEL[textSpeed],
            onAdjust: cycleSpeed,
            hint: 'How fast dialogue text appears. ←/→ to change.',
          },
          {
            id: 'volume',
            label: 'Volume',
            value: `${Math.round(volume * 100)}%`,
            onAdjust: (dir) => update({ volume: Math.round((volume + dir * 0.1) * 10) / 10 }),
            hint: '←/→ to change.',
          },
          {
            id: 'sound',
            label: 'Sound',
            value: muted ? 'Off' : 'On',
            onAdjust: () => update({ muted: !muted }),
            onSelect: () => update({ muted: !muted }),
          },
          { id: 'back', label: 'Back', onSelect: onBack },
        ]}
      />
    </div>
  );
}
