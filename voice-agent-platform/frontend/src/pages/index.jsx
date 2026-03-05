import { useEffect, useState } from 'react';
import Header from '../components/lobby/Header';
import Footer from '../components/lobby/Footer';
import JoinRoom from '../components/JoinRoom';
import { useSettings } from '../context/SettingsContext';

/**
 * Room Lobby: VoxBridge home with Create/Join card, side panels, footer. No scroll.
 */
export default function Home() {
  const { settings, updateSettings } = useSettings();
  const [resolvedTheme, setResolvedTheme] = useState('light');
  useEffect(() => {
    const t = settings.colorTheme === 'system'
      ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
      : settings.colorTheme;
    setResolvedTheme(t);
  }, [settings.colorTheme]);

  const setTheme = (value) => {
    updateSettings({ colorTheme: value });
    if (typeof document !== 'undefined') {
      const resolved = value === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : value;
      document.documentElement.setAttribute('data-theme', resolved);
      if (resolved === 'dark') {
        document.documentElement.style.setProperty('--page-bg', '#1f2937');
        document.documentElement.style.setProperty('--card-bg', '#111827');
        document.documentElement.style.setProperty('--card-border', '#374151');
        document.documentElement.style.setProperty('--text-primary', '#f9fafb');
        document.documentElement.style.setProperty('--text-secondary', '#9ca3af');
        document.documentElement.style.setProperty('--accent', '#818cf8');
      } else {
        document.documentElement.style.setProperty('--page-bg', '#f9f9fb');
        document.documentElement.style.setProperty('--card-bg', '#ffffff');
        document.documentElement.style.setProperty('--card-border', '#e5e7eb');
        document.documentElement.style.setProperty('--text-primary', '#111827');
        document.documentElement.style.setProperty('--text-secondary', '#6b7280');
        document.documentElement.style.setProperty('--accent', '#6366f1');
      }
    }
  };

  return (
    <div className="page flex flex-col h-screen overflow-hidden">
      <Header />

      <main className="flex-1 flex min-h-0 overflow-auto w-full max-w-[1400px] mx-auto">
        {/* Left panel: uses side space */}
        <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 pt-8 px-6 border-r border-[var(--card-border)]">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3">Features</h3>
          <ul className="space-y-2 text-sm text-[var(--text-primary)]">
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent)] mt-0.5">•</span>
              <span>Real-time voice & video rooms</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent)] mt-0.5">•</span>
              <span>Screen sharing</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent)] mt-0.5">•</span>
              <span>Optional AI assistant</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-[var(--accent)] mt-0.5">•</span>
              <span>End-to-end encrypted</span>
            </li>
          </ul>
        </aside>

        {/* Center: theme + Join card */}
        <div className="flex-1 flex flex-col items-center justify-center pt-4 sm:pt-6 pb-4 sm:pb-6 min-w-0 px-3 sm:px-4 w-full">
          <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-3 mb-4 sm:mb-6 w-full max-w-lg">
            <span className="rounded-full bg-[var(--card-border)] px-3 py-1 text-xs font-medium text-[var(--text-secondary)]">
              v2.4.0 Stable
            </span>
            <div className="flex items-center gap-1 rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-0.5">
              <button
                type="button"
                onClick={() => setTheme('light')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${resolvedTheme === 'light' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Light
              </button>
              <button
                type="button"
                onClick={() => setTheme('dark')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${resolvedTheme === 'dark' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                Dark
              </button>
              <button
                type="button"
                onClick={() => setTheme('system')}
                className={`rounded-lg px-3 py-1.5 text-xs font-medium ${settings.colorTheme === 'system' ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
              >
                System
              </button>
            </div>
          </div>

          <JoinRoom />
        </div>

        {/* Right panel: uses side space */}
        <aside className="hidden lg:flex flex-col w-64 flex-shrink-0 pt-8 px-6 border-l border-[var(--card-border)]">
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)] mb-3">Quick start</h3>
          <ol className="space-y-2 text-sm text-[var(--text-primary)] list-decimal list-inside">
            <li>Create or join a room above</li>
            <li>Allow mic & camera when prompted</li>
            <li>Invite others via the room link</li>
          </ol>
          <h3 className="text-sm font-semibold uppercase tracking-wide text-[var(--text-secondary)] mt-6 mb-3">Resources</h3>
          <ul className="space-y-1.5 text-sm">
            <li><a href="#" className="text-[var(--accent)] hover:underline">Documentation</a></li>
            <li><a href="#" className="text-[var(--accent)] hover:underline">Support</a></li>
          </ul>
        </aside>
      </main>

      <Footer />
    </div>
  );
}
