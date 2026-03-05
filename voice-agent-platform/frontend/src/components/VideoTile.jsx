/**
 * Single video/audio tile in the call grid. Shows stream (camera or screen) and label.
 * When fill=true, tile fills its cell (for single-participant full-area view).
 */

import { useEffect, useRef } from 'react';

export default function VideoTile({ stream, displayName, isLocal = false, fill = false }) {
  const videoRef = useRef(null);

  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
  }, [stream]);

  const hasVideo = stream?.getVideoTracks?.()?.some((t) => t.enabled) ?? false;

  return (
    <div
      className={`relative rounded-lg bg-white border border-gray-200 overflow-hidden shadow-sm ${
        fill ? 'w-full h-full min-h-0' : 'aspect-video min-h-[100px] sm:min-h-[120px]'
      }`}
    >
      {hasVideo ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isLocal}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center bg-gray-100 min-h-[80px] sm:min-h-[120px]">
          <span className="text-gray-500 text-xs sm:text-sm">{displayName || 'Off'}</span>
        </div>
      )}
      <span className="absolute bottom-1 left-1 px-2 py-0.5 rounded text-[10px] sm:text-xs bg-black/60 text-white truncate max-w-[85%]">
        {displayName || 'Participant'}
        {isLocal && ' (you)'}
      </span>
    </div>
  );
}
