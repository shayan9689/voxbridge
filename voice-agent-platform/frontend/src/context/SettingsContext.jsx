'use client';

import { createContext, useContext, useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'voiceagent-settings';

const defaults = {
  colorTheme: 'light',   // 'dark' | 'light' | 'system'
  interfaceDensity: 'default', // 'compact' | 'default'
  audioDeviceId: '',
  videoDeviceId: '',
  micEnabled: true,
  cameraEnabled: true,
};

function loadSaved() {
  if (typeof window === 'undefined') return defaults;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    return { ...defaults, ...parsed };
  } catch {
    return defaults;
  }
}

function save(settings) {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
  } catch (_) {}
}

const SettingsContext = createContext(null);

export function SettingsProvider({ children }) {
  const [isOpen, setIsOpen] = useState(false);
  const [settings, setSettings] = useState(loadSaved);

  useEffect(() => {
    setSettings(loadSaved());
  }, []);

  const openSettings = useCallback(() => setIsOpen(true), []);
  const closeSettings = useCallback(() => setIsOpen(false), []);

  const updateSettings = useCallback((next) => {
    setSettings((prev) => {
      const merged = { ...prev, ...next };
      save(merged);
      return merged;
    });
  }, []);

  // Apply saved theme and density on mount
  useEffect(() => {
    const s = loadSaved();
    if (typeof document === 'undefined' || typeof window === 'undefined') return;
    const resolvedTheme = s.colorTheme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : s.colorTheme;
    document.documentElement.setAttribute('data-theme', resolvedTheme);
    document.documentElement.setAttribute('data-density', s.interfaceDensity);
    applyThemeVars(resolvedTheme);
  }, []);

  const value = {
    isOpen,
    openSettings,
    closeSettings,
    settings,
    updateSettings,
  };

  return (
    <SettingsContext.Provider value={value}>
      {children}
    </SettingsContext.Provider>
  );
}

function applyThemeVars(theme) {
  const root = document.documentElement;
  const resolved = theme === 'system' ? (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light') : theme;
  if (resolved === 'dark') {
    root.style.setProperty('--page-bg', '#1f2937');
    root.style.setProperty('--card-bg', '#111827');
    root.style.setProperty('--card-border', '#374151');
    root.style.setProperty('--text-primary', '#f9fafb');
    root.style.setProperty('--text-secondary', '#9ca3af');
    root.style.setProperty('--accent', '#818cf8');
  } else {
    root.style.setProperty('--page-bg', '#f9f9fb');
    root.style.setProperty('--card-bg', '#ffffff');
    root.style.setProperty('--card-border', '#e5e7eb');
    root.style.setProperty('--text-primary', '#111827');
    root.style.setProperty('--text-secondary', '#6b7280');
    root.style.setProperty('--accent', '#6366f1');
  }
}

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error('useSettings must be used within SettingsProvider');
  return ctx;
}
