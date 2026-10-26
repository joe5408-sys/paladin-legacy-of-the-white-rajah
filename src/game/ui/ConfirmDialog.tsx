import { MenuList } from './MenuList';

/** Yes/No confirmation. "No" is listed first so a stray key press is safe. */
export function ConfirmDialog({
  message,
  confirmLabel,
  onConfirm,
  onCancel,
}: {
  message: string;
  confirmLabel: string;
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="menu-backdrop">
      <div className="menu-panel pixel-panel confirm" role="alertdialog" aria-label={message} data-testid="confirm">
        <p className="confirm-message">{message}</p>
        <MenuList
          label="Confirm"
          onBack={onCancel}
          items={[
            { id: 'cancel', label: 'Cancel', onSelect: onCancel },
            { id: 'confirm', label: confirmLabel, onSelect: onConfirm },
          ]}
        />
      </div>
    </div>
  );
}
