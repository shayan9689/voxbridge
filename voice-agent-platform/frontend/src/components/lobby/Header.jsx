import { useSettings } from '../../context/SettingsContext';

/**
 * Room Lobby header: logo + nav icons
 */
export default function Header() {
  const { openSettings } = useSettings();

  return (
    <header className="border-b border-[var(--accent)]/30 bg-[var(--card-bg)]">
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 py-3 sm:py-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-lg bg-[var(--accent)] flex items-center justify-center text-white font-bold text-base sm:text-lg flex-shrink-0">
            V
          </div>
          <span className="text-base sm:text-xl font-semibold text-[var(--text-primary)] truncate">VoxBridge</span>
        </div>
        <nav className="flex items-center gap-1 sm:gap-4 flex-shrink-0">
          <button type="button" className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]" aria-label="Search">
            <SearchIcon />
          </button>
          <button type="button" className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 hidden sm:flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]" aria-label="Notifications">
            <BellIcon />
          </button>
          <button type="button" onClick={openSettings} className="p-2.5 sm:p-2 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 flex items-center justify-center text-[var(--text-secondary)] hover:text-[var(--text-primary)]" aria-label="Settings">
            <SettingsIcon />
          </button>
          <button type="button" className="w-8 h-8 sm:w-9 sm:h-9 min-w-[44px] min-h-[44px] sm:min-w-0 sm:min-h-0 rounded-full bg-[var(--accent)]/20 flex items-center justify-center text-[var(--accent)]" aria-label="Profile">
            <ProfileIcon />
          </button>
        </nav>
      </div>
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
