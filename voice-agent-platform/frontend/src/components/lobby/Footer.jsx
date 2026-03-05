/**
 * Room Lobby footer: copyright left, buttons center, policies right
 */

export default function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--card-bg)] mt-auto flex-shrink-0">
      <div className="w-full max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between gap-4">
        <div className="flex-shrink-0 text-sm text-[var(--text-secondary)]">
          © 2026 VoxBridge
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 flex-1 min-w-0">
          <button type="button" className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 shadow-sm transition-colors">
            App Tutorial
          </button>
          <button type="button" className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm transition-colors">
            SERVER STATUS
          </button>
          <button type="button" className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 shadow-sm transition-colors">
            Community
          </button>
          <button type="button" className="px-4 py-2 rounded-xl text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 shadow-sm transition-colors">
            GET DESKTOP
          </button>
        </div>
        <div className="flex items-center gap-4 text-sm flex-shrink-0">
          <a href="#" className="text-[var(--accent)] hover:underline">Privacy Policy</a>
          <a href="#" className="text-[var(--accent)] hover:underline">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
