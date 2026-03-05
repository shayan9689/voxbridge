/**
 * Toast shown when a room is created: Join Now, Copy Link, close
 */

export default function RoomCreatedToast({ roomName, roomId, onJoin, onCopy, onClose }) {
  if (!roomId) return null;
  return (
    <div className="fixed bottom-6 right-6 z-50 w-[360px] rounded-lg border border-[var(--card-border)] bg-white p-4 shadow-lg">
      <div className="flex items-start justify-between gap-2">
        <div>
          <h3 className="font-semibold text-[var(--text-primary)]">ROOM CREATED!</h3>
          <p className="mt-1 text-sm text-[var(--text-secondary)]">
            &quot;{roomName || 'Room'}&quot; is ready. Share ID {roomId} with your team.
          </p>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 text-[var(--text-secondary)] hover:text-[var(--text-primary)]"
          aria-label="Close"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
      <div className="mt-4 flex gap-2">
        <button
          type="button"
          onClick={onJoin}
          className="flex-1 rounded-lg bg-[var(--btn-primary)] py-2 text-sm font-medium text-white hover:bg-[var(--btn-primary-hover)]"
        >
          Join Now
        </button>
        <button
          type="button"
          onClick={onCopy}
          className="flex-1 rounded-lg border border-[var(--btn-primary)] py-2 text-sm font-medium text-[var(--btn-primary)] hover:bg-indigo-50"
        >
          Copy Link
        </button>
      </div>
    </div>
  );
}
