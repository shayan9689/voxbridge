/**
 * Floating call control bar: status, timer, mic (with intensity), video, screen share, leave
 */

export default function CallControlBar({
  isMuted,
  toggleMute,
  micLevel = 0,
  isVideoEnabled,
  toggleVideo,
  isScreenSharing,
  toggleScreenShare,
  onLeave,
  elapsedSeconds,
}) {
  const mm = String(Math.floor(elapsedSeconds / 60)).padStart(2, '0');
  const ss = String(elapsedSeconds % 60).padStart(2, '0');
  const hh = Math.floor(elapsedSeconds / 3600);
  const timer = hh > 0 ? `${String(hh).padStart(2, '0')}:${mm}:${ss}` : `00:${mm}:${ss}`;

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex items-center gap-4 rounded-xl bg-white px-6 py-3 shadow-lg border border-[var(--card-border)]">
      <div className="flex items-center gap-2 text-sm text-[var(--text-secondary)]">
        <span className="font-medium text-[var(--text-primary)]">VoiceAssist</span>
        <span className="w-2 h-2 rounded-full bg-emerald-500" aria-hidden />
        <span className="tabular-nums">{timer}</span>
      </div>
      <div className="flex items-center gap-1">
        <button
          type="button"
          onClick={toggleMute}
          title={isMuted ? 'Unmute' : 'Mute'}
          className={`p-2.5 rounded-lg flex items-center gap-1 ${isMuted ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-[var(--text-primary)] hover:bg-gray-200'}`}
        >
          <MicIcon muted={isMuted} level={isMuted ? 0 : micLevel} />
        </button>
        <button
          type="button"
          onClick={toggleVideo}
          title={isVideoEnabled ? 'Turn off camera' : 'Turn on camera'}
          className={`p-2.5 rounded-lg ${!isVideoEnabled ? 'bg-amber-100 text-amber-700' : 'bg-gray-100 text-[var(--text-primary)] hover:bg-gray-200'}`}
        >
          <VideoIcon off={!isVideoEnabled} />
        </button>
        <button
          type="button"
          onClick={toggleScreenShare}
          title={isScreenSharing ? 'Stop sharing' : 'Share screen'}
          className={`p-2.5 rounded-lg ${isScreenSharing ? 'bg-[var(--accent)] text-white' : 'bg-gray-100 text-[var(--text-primary)] hover:bg-gray-200'}`}
        >
          <ScreenShareIcon />
        </button>
        <button type="button" className="p-2.5 rounded-lg bg-gray-100 text-[var(--text-primary)] hover:bg-gray-200" title="Raise hand">
          <HandIcon />
        </button>
        <button type="button" className="p-2.5 rounded-lg bg-gray-100 text-[var(--text-primary)] hover:bg-gray-200" title="Chat">
          <ChatIcon />
        </button>
        <button type="button" className="p-2.5 rounded-lg bg-gray-100 text-[var(--text-primary)] hover:bg-gray-200" title="Reactions">
          <ReactionIcon />
        </button>
      </div>
      <button
        type="button"
        onClick={onLeave}
        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 flex items-center justify-center gap-1.5"
      >
        <LeaveIcon />
        Leave
      </button>
    </div>
  );
}

function MicIcon({ muted, level = 0 }) {
  const barHeight = Math.max(4, (level / 100) * 14);
  const showLevel = !muted && level > 0;
  if (muted) {
    return (
      <span className="flex items-center gap-0.5">
        <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
        </svg>
      </span>
    );
  }
  return (
    <span className="flex items-center gap-1">
      <svg className="w-5 h-5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 013-3V5a3 3 0 116 0v6a3 3 0 013 3z" />
      </svg>
      <span className="flex items-end gap-0.5 h-4" aria-hidden>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`w-1 rounded-full transition-all duration-75 ${showLevel ? 'bg-[var(--accent)]' : 'bg-gray-300'}`}
            style={{ height: `${showLevel ? barHeight : 4}px` }}
          />
        ))}
      </span>
    </span>
  );
}
function VideoIcon({ off }) {
  if (off) {
    return (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
      </svg>
    );
  }
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
    </svg>
  );
}
function ScreenShareIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
    </svg>
  );
}
function HandIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 00-3 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1m0 0V11m0-5.5a1.5 1.5 0 013 0v3m0 0V11" />
    </svg>
  );
}
function ChatIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
    </svg>
  );
}
function ReactionIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
    </svg>
  );
}
function LeaveIcon() {
  return (
    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  );
}
