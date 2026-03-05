/**
 * Room Lobby footer: copyright left, buttons center, policies right
 */

export default function Footer() {
  return (
    <footer className="border-t border-[var(--card-border)] bg-[var(--card-bg)] mt-auto flex-shrink-0">
      <div className="w-full max-w-[1400px] mx-auto px-3 sm:px-6 py-3 sm:py-4 flex flex-col sm:flex-row items-center justify-between gap-3 sm:gap-4">
        <div className="flex-shrink-0 text-xs sm:text-sm text-[var(--text-secondary)] order-2 sm:order-1">
          © 2026 VoxBridge
        </div>
        <div className="flex flex-wrap items-center justify-center gap-2 flex-1 min-w-0 order-1 sm:order-2">
          <button type="button" className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white bg-indigo-500 hover:bg-indigo-600 shadow-sm transition-colors min-h-[44px] sm:min-h-0">
            App Tutorial
          </button>
          <button type="button" className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white bg-emerald-500 hover:bg-emerald-600 shadow-sm transition-colors min-h-[44px] sm:min-h-0 hidden sm:inline-flex">
            SERVER STATUS
          </button>
          <button type="button" className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white bg-violet-500 hover:bg-violet-600 shadow-sm transition-colors min-h-[44px] sm:min-h-0">
            Community
          </button>
          <button type="button" className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-medium text-white bg-amber-500 hover:bg-amber-600 shadow-sm transition-colors min-h-[44px] sm:min-h-0 hidden sm:inline-flex">
            GET DESKTOP
          </button>
        </div>
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm flex-shrink-0 order-3">
          <a href="#" className="text-[var(--accent)] hover:underline py-2">Privacy Policy</a>
          <a href="#" className="text-[var(--accent)] hover:underline py-2">Terms of Service</a>
        </div>
      </div>
    </footer>
  );
}
