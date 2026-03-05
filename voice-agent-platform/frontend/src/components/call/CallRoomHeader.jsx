import { useSettings } from '../../context/SettingsContext';

/**
 * Call room header: logo, room name, AI pill, nav icons
 */
export default function CallRoomHeader({ roomId, aiActive }) {
  const { openSettings } = useSettings();

  return (
    <header className="relative h-14 flex items-center justify-between px-6 bg-white border-b border-[var(--card-border)] flex-shrink-0">
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-[var(--accent)] flex items-center justify-center text-white text-sm font-bold">
          V
        </div>
        <span className="text-lg font-semibold text-[var(--text-primary)]">VoxBridge</span>
      </div>
      <div className="flex items-center gap-3 absolute left-1/2 -translate-x-1/2">
        <span className="text-[var(--text-primary)] font-medium"># {roomId}</span>
        {aiActive && (
          <span className="rounded-full bg-indigo-100 px-3 py-1 text-xs font-medium text-[var(--accent)]">
            AI ASSISTANT ACTIVE
          </span>
        )}
      </div>
      <nav className="flex items-center gap-2">
        <button type="button" className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" aria-label="Search">
          <SearchIcon />
        </button>
        <button type="button" className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" aria-label="Notifications">
          <BellIcon />
        </button>
        <button type="button" onClick={openSettings} className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)]" aria-label="Settings">
          <SettingsIcon />
        </button>
        <button type="button" className="w-8 h-8 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]" aria-label="Profile">
          <ProfileIcon />
        </button>
      </nav>
    </header>
  );
}

function SearchIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
    </svg>
  );
}
function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
    </svg>
  );
}
function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}
function ProfileIcon() {
  return (
    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
      <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
    </svg>
  );
}
