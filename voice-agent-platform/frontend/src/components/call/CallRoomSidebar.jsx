import { useRouter } from 'next/router';

export default function CallRoomSidebar({ currentRoomId, participantCount = 0, aiInRoom = false, onAddAi }) {
  const router = useRouter();

  return (
    <aside className="w-56 flex-shrink-0 bg-white border-r border-gray-200 flex flex-col">
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rooms</span>
          <button
            type="button"
            onClick={() => router.push('/')}
            className="p-1 text-gray-500 hover:text-indigo-600"
            aria-label="New room"
          >
            +
          </button>
        </div>
      </div>
      <nav className="flex-1 p-2 overflow-auto">
        {currentRoomId && (
          <div className="rounded-lg bg-indigo-600 px-3 py-2 text-sm font-medium text-white flex items-center justify-between">
            <span># {currentRoomId}</span>
            {participantCount > 0 && (
              <span className="text-white/80 text-xs">{participantCount}</span>
            )}
          </div>
        )}
        {/* Only rooms you create/join are shown; no sample rooms */}
      </nav>
      <div className="p-3 border-t border-gray-200 space-y-2">
        {!aiInRoom && onAddAi && (
          <button
            type="button"
            onClick={onAddAi}
            className="w-full flex items-center justify-center gap-2 rounded-lg border-2 border-[var(--accent)] bg-white px-3 py-2 text-sm font-medium text-[var(--accent)] hover:bg-indigo-50"
          >
            Add AI
          </button>
        )}
        <button
          type="button"
          onClick={() => router.push('/')}
          className="w-full flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 hover:bg-gray-50"
        >
          <span className="text-indigo-600">←</span>
          Leave Workspace
        </button>
      </div>
    </aside>
  );
}
