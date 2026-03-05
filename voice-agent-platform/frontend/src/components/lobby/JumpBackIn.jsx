/**
 * Jump Back In: recently active rooms (mock data for now)
 */

import { useRouter } from 'next/router';

const MOCK_ROOMS = [
  { name: 'Engineering Sync', active: 5, id: 'ENG-204', avatars: 3 },
  { name: 'Product Roadmap', active: 12, id: 'PRD-912', avatars: 2 },
  { name: 'Design Critique', active: 3, id: 'DSN-044', avatars: 2 },
];

export default function JumpBackIn() {
  const router = useRouter();

  const handleJoin = (id) => {
    router.push(`/room/${id}`);
  };

  return (
    <section className="max-w-6xl mx-auto px-6 py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)]">
          <ClockIcon />
          Jump Back In
        </h2>
        <a href="#" className="text-sm text-[var(--accent)] hover:underline">
          View All History
        </a>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {MOCK_ROOMS.map((room) => (
          <button
            key={room.id}
            type="button"
            onClick={() => handleJoin(room.id)}
            className="flex items-center gap-4 rounded-lg border border-[var(--card-border)] bg-white p-4 text-left hover:border-[var(--accent)]/50 hover:shadow-md transition-shadow"
          >
            <div className="flex -space-x-2">
              {[...Array(room.avatars)].map((_, i) => (
                <div
                  key={i}
                  className="w-9 h-9 rounded-full bg-[var(--accent)]/20 border-2 border-white flex items-center justify-center text-xs font-medium text-[var(--accent)]"
                >
                  {i + 1}
                </div>
              ))}
              {room.active > room.avatars && (
                <div className="w-9 h-9 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs text-[var(--text-secondary)]">
                  +{room.active - room.avatars}
                </div>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-medium text-[var(--text-primary)] truncate">{room.name}</p>
              <p className="text-sm text-[var(--text-secondary)]">{room.active} Active</p>
              <p className="text-xs text-[var(--text-secondary)] mt-0.5">ID: {room.id}</p>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
}

function ClockIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
