'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useSettings } from '../../context/SettingsContext';

const GEAR_SVG = (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
  </svg>
);

function MicIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
    </svg>
  );
}
function CameraIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
function PaletteIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
    </svg>
  );
}
function MonitorIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}

function useDeviceList() {
  const [audioDevices, setAudioDevices] = useState([]);
  const [videoDevices, setVideoDevices] = useState([]);

  const refresh = useCallback(async () => {
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      setAudioDevices(devices.filter((d) => d.kind === 'audioinput'));
      setVideoDevices(devices.filter((d) => d.kind === 'videoinput'));
    } catch (_) {
      setAudioDevices([]);
      setVideoDevices([]);
    }
  }, []);

  useEffect(() => {
    refresh();
    navigator.mediaDevices?.addEventListener?.('devicechange', refresh);
    return () => navigator.mediaDevices?.removeEventListener?.('devicechange', refresh);
  }, [refresh]);

  return { audioDevices, videoDevices, refresh };
}

function useMicLevel(deviceId, enabled) {
  const [level, setLevel] = useState(0);
  const streamRef = useRef(null);
  const rafRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (!enabled || !navigator.mediaDevices?.getUserMedia) return;

    let cancelled = false;
    const constraints = {
      audio: deviceId ? { deviceId: { exact: deviceId } } : true,
      video: false,
    };

    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 256;
      analyser.smoothingTimeConstant = 0.8;
      source.connect(analyser);
      analyserRef.current = analyser;
      const data = new Uint8Array(analyser.frequencyBinCount);

      function tick() {
        if (cancelled || !analyserRef.current) return;
        analyserRef.current.getByteFrequencyData(data);
        const sum = data.reduce((a, b) => a + b, 0);
        const avg = data.length ? sum / data.length : 0;
        const pct = Math.min(100, Math.round((avg / 255) * 100));
        setLevel(pct);
        rafRef.current = requestAnimationFrame(tick);
      }
      rafRef.current = requestAnimationFrame(tick);
    }).catch(() => setLevel(0));

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      analyserRef.current = null;
      audioContextRef.current?.close();
    };
  }, [enabled, deviceId]);

  return level;
}

function useCameraPreview(deviceId, enabled) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    if (!enabled || !navigator.mediaDevices?.getUserMedia) return;
    const constraints = {
      video: deviceId ? { deviceId: { exact: deviceId } } : true,
      audio: false,
    };
    let cancelled = false;
    navigator.mediaDevices.getUserMedia(constraints).then((stream) => {
      if (cancelled) {
        stream.getTracks().forEach((t) => t.stop());
        return;
      }
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      else setTimeout(() => { if (videoRef.current && streamRef.current) videoRef.current.srcObject = streamRef.current; }, 50);
    }).catch(() => {});

    return () => {
      cancelled = true;
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [enabled, deviceId]);

  return videoRef;
}

export default function UserSettingsModal() {
  const { isOpen, closeSettings, settings, updateSettings } = useSettings();
  const [colorTheme, setColorTheme] = useState(settings.colorTheme);
  const [interfaceDensity, setInterfaceDensity] = useState(settings.interfaceDensity);
  const [audioDeviceId, setAudioDeviceId] = useState(settings.audioDeviceId);
  const [videoDeviceId, setVideoDeviceId] = useState(settings.videoDeviceId);
  const [micEnabled, setMicEnabled] = useState(settings.micEnabled !== false);
  const [cameraEnabled, setCameraEnabled] = useState(settings.cameraEnabled !== false);

  const { audioDevices, videoDevices, refresh: refreshDevices } = useDeviceList();
  const micLevel = useMicLevel(audioDeviceId || (audioDevices[0]?.deviceId), isOpen && micEnabled);
  const cameraVideoRef = useCameraPreview(videoDeviceId || (videoDevices[0]?.deviceId), isOpen && cameraEnabled);

  // After opening, refresh device list so labels appear once permission is granted (e.g. by mic meter)
  useEffect(() => {
    if (!isOpen) return;
    const t = setTimeout(refreshDevices, 800);
    return () => clearTimeout(t);
  }, [isOpen, refreshDevices]);

  useEffect(() => {
    if (isOpen) {
      setColorTheme(settings.colorTheme);
      setInterfaceDensity(settings.interfaceDensity);
      setAudioDeviceId(settings.audioDeviceId);
      setVideoDeviceId(settings.videoDeviceId);
      setMicEnabled(settings.micEnabled !== false);
      setCameraEnabled(settings.cameraEnabled !== false);
    }
  }, [isOpen, settings.colorTheme, settings.interfaceDensity, settings.audioDeviceId, settings.videoDeviceId, settings.micEnabled, settings.cameraEnabled]);

  const handleSave = () => {
    updateSettings({
      colorTheme,
      interfaceDensity,
      audioDeviceId,
      videoDeviceId,
      micEnabled,
      cameraEnabled,
    });
    applyThemeToDocument(colorTheme);
    applyDensityToDocument(interfaceDensity);
    closeSettings();
  };

  const handleBackdrop = (e) => {
    if (e.target === e.currentTarget) closeSettings();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      onClick={handleBackdrop}
      role="dialog"
      aria-modal="true"
      aria-labelledby="settings-title"
    >
      <div
        className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--card-border)] rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-2">
            <span className="text-[var(--text-secondary)]">{GEAR_SVG}</span>
            <h2 id="settings-title" className="text-lg font-bold text-[var(--text-primary)] uppercase tracking-wide">
              User Settings
            </h2>
          </div>
          <button
            type="button"
            onClick={closeSettings}
            className="p-2 text-[var(--text-secondary)] hover:text-[var(--text-primary)] rounded-xl hover:bg-gray-100"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6 overflow-y-auto scrollbar-invisible flex-1 min-h-0 rounded-b-2xl">
          {/* Audio & Video */}
          <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Audio & Video</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5 mb-4">
              Configure your hardware and test your levels before going live.
            </p>

            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--card-border)] bg-gray-50/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <MicIcon />
                    <label className="text-sm font-medium text-[var(--text-primary)]">Microphone</label>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={micEnabled}
                    onClick={() => setMicEnabled((v) => !v)}
                    className={`inline-flex h-6 w-11 flex-shrink-0 rounded-full p-0.5 transition-colors ${micEnabled ? 'bg-[var(--accent)] justify-end' : 'bg-gray-300 justify-start'}`}
                  >
                    <span className="inline-block h-5 w-5 rounded-full bg-white shadow" />
                  </button>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-2">Select which input device you would like to use.</p>
                <select
                  value={audioDeviceId}
                  onChange={(e) => setAudioDeviceId(e.target.value)}
                  className="w-full rounded-xl border border-[var(--card-border)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                >
                  <option value="">Default - System Mic</option>
                  {audioDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Microphone ${d.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
                {micEnabled && (
                  <>
                    <p className="text-xs text-[var(--text-secondary)] mt-2 mb-1">Mic level</p>
                    <div className="h-2 rounded-full bg-gray-200 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-[var(--accent)] transition-all duration-75"
                        style={{ width: `${micLevel}%` }}
                      />
                    </div>
                    <p className="text-xs text-[var(--text-secondary)] mt-1">Speak to test your volume level</p>
                  </>
                )}
                {!micEnabled && <p className="text-xs text-[var(--text-secondary)] mt-1">Microphone is off. Turn on to test level.</p>}
              </div>

              <div className="rounded-xl border border-[var(--card-border)] bg-gray-50/50 p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <CameraIcon />
                    <label className="text-sm font-medium text-[var(--text-primary)]">Camera</label>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={cameraEnabled}
                    onClick={() => setCameraEnabled((v) => !v)}
                    className={`inline-flex h-6 w-11 flex-shrink-0 rounded-full p-0.5 transition-colors ${cameraEnabled ? 'bg-[var(--accent)] justify-end' : 'bg-gray-300 justify-start'}`}
                  >
                    <span className="inline-block h-5 w-5 rounded-full bg-white shadow" />
                  </button>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-2">The video source used for your feed.</p>
                <select
                  value={videoDeviceId}
                  onChange={(e) => setVideoDeviceId(e.target.value)}
                  className="w-full rounded-xl border border-[var(--card-border)] bg-white px-3 py-2 text-sm text-[var(--text-primary)] focus:ring-2 focus:ring-[var(--accent)] focus:border-transparent"
                >
                  <option value="">Default camera</option>
                  {videoDevices.map((d) => (
                    <option key={d.deviceId} value={d.deviceId}>
                      {d.label || `Camera ${d.deviceId.slice(0, 8)}`}
                    </option>
                  ))}
                </select>
                {cameraEnabled && (
                  <div className="mt-2 rounded-xl overflow-hidden bg-black aspect-video max-h-32">
                    <video ref={cameraVideoRef} autoPlay muted playsInline className="w-full h-full object-cover" />
                  </div>
                )}
                {!cameraEnabled && <p className="text-xs text-[var(--text-secondary)] mt-2">Camera is off. Turn on to see preview.</p>}
              </div>
            </div>
          </section>

          {/* Appearance */}
          <section className="rounded-xl border border-[var(--card-border)] bg-[var(--card-bg)] p-4">
            <h3 className="text-base font-semibold text-[var(--text-primary)]">Appearance</h3>
            <p className="text-sm text-[var(--text-secondary)] mt-0.5 mb-4">
              Personalize the interface to match your workflow and environment.
            </p>

            <div className="space-y-4">
              <div className="rounded-xl border border-[var(--card-border)] bg-gray-50/50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <PaletteIcon />
                  <label className="text-sm font-medium text-[var(--text-primary)]">Color Theme</label>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-2">Switch between light, dark, or follow system settings.</p>
                <div className="flex rounded-xl border border-[var(--card-border)] p-0.5 bg-gray-50">
                  {['dark', 'light', 'system'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setColorTheme(opt)}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg capitalize ${colorTheme === opt ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>

              <div className="rounded-xl border border-[var(--card-border)] bg-gray-50/50 p-3">
                <div className="flex items-center gap-2 mb-1">
                  <MonitorIcon />
                  <label className="text-sm font-medium text-[var(--text-primary)]">Interface Density</label>
                </div>
                <p className="text-xs text-[var(--text-secondary)] mb-2">Choose how much information you want to see on the screen at once.</p>
                <div className="flex rounded-xl border border-[var(--card-border)] p-0.5 bg-gray-50">
                  {['compact', 'default'].map((opt) => (
                    <button
                      key={opt}
                      type="button"
                      onClick={() => setInterfaceDensity(opt)}
                      className={`flex-1 py-2 px-3 text-sm font-medium rounded-lg capitalize ${interfaceDensity === opt ? 'bg-[var(--accent)] text-white shadow-sm' : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'}`}
                    >
                      {opt}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </section>
        </div>

        {/* Footer actions */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--card-border)] bg-gray-50 rounded-b-2xl flex-shrink-0">
          <button
            type="button"
            onClick={closeSettings}
            className="px-5 py-2.5 text-sm font-medium text-[var(--accent)] border-2 border-[var(--accent)] rounded-xl hover:bg-indigo-50 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="px-5 py-2.5 text-sm font-medium text-white bg-[var(--accent)] rounded-xl shadow-md hover:bg-indigo-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
}

function applyThemeToDocument(theme) {
  const root = typeof document !== 'undefined' ? document.documentElement : null;
  if (!root) return;
  const resolved = theme === 'system'
    ? (typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
    : theme;
  root.setAttribute('data-theme', resolved);
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

function applyDensityToDocument(density) {
  const root = typeof document !== 'undefined' ? document.documentElement : null;
  if (!root) return;
  root.setAttribute('data-density', density);
}
