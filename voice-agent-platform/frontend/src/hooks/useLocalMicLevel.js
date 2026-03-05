/**
 * Returns current mic level (0-100) from a MediaStream for visual feedback.
 * Only runs when stream is present and enabled is true.
 */

import { useEffect, useState, useRef } from 'react';

export function useLocalMicLevel(stream, enabled) {
  const [level, setLevel] = useState(0);
  const rafRef = useRef(null);
  const analyserRef = useRef(null);
  const audioContextRef = useRef(null);
  const sourceRef = useRef(null);

  useEffect(() => {
    if (!enabled || !stream) {
      setLevel(0);
      return;
    }
    const audioTrack = stream.getAudioTracks?.()?.[0];
    if (!audioTrack || !audioTrack.enabled) {
      setLevel(0);
      return;
    }

    let cancelled = false;
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      audioContextRef.current = ctx;
      const source = ctx.createMediaStreamSource(stream);
      sourceRef.current = source;
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
    } catch (_) {
      setLevel(0);
    }

    return () => {
      cancelled = true;
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      analyserRef.current = null;
      sourceRef.current = null;
      try {
        audioContextRef.current?.close();
      } catch (_) {}
      audioContextRef.current = null;
      setLevel(0);
    };
  }, [stream, enabled]);

  return level;
}
