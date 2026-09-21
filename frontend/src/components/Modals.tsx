export function IdleWarningModal({ onStay, onDismiss }: { onStay: () => void; onDismiss: () => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h1 className="h-compact" style={{ fontSize: 20 }}>
          Still there?
        </h1>
        <p className="body-text">
          You'll be signed out and your report cleared in 2 minutes — stay signed in?
        </p>
        <div className="modal-actions">
          <button className="btn btn-primary" onClick={onStay}>
            Stay signed in
          </button>
        </div>
      </div>
    </div>
  );
}

export function SignOutConfirmModal({ onConfirm, onCancel }: { onConfirm: () => void; onCancel: () => void }) {
  return (
    <div className="modal-backdrop" role="dialog" aria-modal="true">
      <div className="modal-card">
        <h1 className="h-compact" style={{ fontSize: 20 }}>
          End your session?
        </h1>
        <p className="body-text">Your report will be cleared from memory. Nothing remains on our side.</p>
        <div className="modal-actions">
          <button className="btn btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="btn btn-primary" onClick={onConfirm}>
            End session
          </button>
        </div>
      </div>
    </div>
  );
}
