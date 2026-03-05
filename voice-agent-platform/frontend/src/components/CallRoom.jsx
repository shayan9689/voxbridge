/**
 * Call room: header, left sidebar (rooms), main (video grid + control bar), right sidebar (chat), footer.
 * Matches VoxBridge Call Room design; keeps all WebRTC and AI behavior.
 */

import { useEffect, useState, useRef } from 'react';
import { useRouter } from 'next/router';
import { getSocket } from '../services/socket';
import { SOCKET_EVENTS } from '../constants';
import { useWebRTC } from '../hooks/useWebRTC';
import { useLocalMicLevel } from '../hooks/useLocalMicLevel';
import { useSettings } from '../context/SettingsContext';
import VideoTile from './VideoTile';
import { mediaStreamFromBase64 } from '../utils/audioFromBase64';
import CallRoomHeader from './call/CallRoomHeader';
import CallRoomSidebar from './call/CallRoomSidebar';
import CallControlBar from './call/CallControlBar';
import CallRoomChat from './call/CallRoomChat';

export default function CallRoom({ roomId, initialParticipants = [], userName }) {
  const router = useRouter();
  const { settings } = useSettings();
  const [participants, setParticipants] = useState(initialParticipants);
  const [aiInRoom, setAiInRoom] = useState(false);
  const [aiInput, setAiInput] = useState('');
  const [aiStream, setAiStream] = useState(null);
  const [callStartTime] = useState(() => Date.now());
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const audioRef = useRef(null);

  const webrtcOptions = {
    audioDeviceId: settings.audioDeviceId || undefined,
    videoDeviceId: settings.videoDeviceId || undefined,
    micEnabled: settings.micEnabled !== false,
    cameraEnabled: settings.cameraEnabled !== false,
  };

  const {
    connectionCount,
    isMuted,
    toggleMute,
    isVideoEnabled,
    toggleVideo,
    isScreenSharing,
    toggleScreenShare,
    localStream,
    remoteStreams,
    screenStream,
    mediaError,
    socketConnected,
  } = useWebRTC(roomId, webrtcOptions);

  const micLevel = useLocalMicLevel(localStream, !isMuted);

  useEffect(() => {
    const t = setInterval(() => setElapsedSeconds(Math.floor((Date.now() - callStartTime) / 1000)), 1000);
    return () => clearInterval(t);
  }, [callStartTime]);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onJoined = (data) => data?.participants && setParticipants(data.participants);
    const onLeft = (data) => data?.participants && setParticipants(data.participants);
    const onList = (list) => setParticipants(Array.isArray(list) ? list : []);
    socket.on(SOCKET_EVENTS.PARTICIPANT_JOINED, onJoined);
    socket.on(SOCKET_EVENTS.PARTICIPANT_LEFT, onLeft);
    socket.on(SOCKET_EVENTS.PARTICIPANTS_LIST, onList);
    const onAiJoined = () => setAiInRoom(true);
    const onAiLeft = () => setAiInRoom(false);
    socket.on(SOCKET_EVENTS.AI_JOINED, onAiJoined);
    socket.on(SOCKET_EVENTS.AI_LEFT, onAiLeft);
    return () => {
      socket.off(SOCKET_EVENTS.PARTICIPANT_JOINED, onJoined);
      socket.off(SOCKET_EVENTS.PARTICIPANT_LEFT, onLeft);
      socket.off(SOCKET_EVENTS.PARTICIPANTS_LIST, onList);
      socket.off(SOCKET_EVENTS.AI_JOINED, onAiJoined);
      socket.off(SOCKET_EVENTS.AI_LEFT, onAiLeft);
    };
  }, []);

  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;
    const onAiAudio = async (data) => {
      if (!data?.audioBase64) return;
      try {
        if (audioRef.current) {
          const binary = atob(data.audioBase64);
          const bytes = new Uint8Array(binary.length);
          for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
          const blob = new Blob([bytes], { type: 'audio/mpeg' });
          audioRef.current.src = URL.createObjectURL(blob);
          audioRef.current.play().catch(() => {});
        }
        const stream = await mediaStreamFromBase64(data.audioBase64);
        if (stream) setAiStream(stream);
      } catch (e) {
        console.warn('AI audio failed', e);
      }
    };
    socket.on(SOCKET_EVENTS.AI_AUDIO, onAiAudio);
    return () => socket.off(SOCKET_EVENTS.AI_AUDIO, onAiAudio);
  }, []);

  const handleAddAi = () => {
    const socket = getSocket();
    if (socket) socket.emit(SOCKET_EVENTS.ROOM_ADD_AI, { roomId });
  };

  const handleRemoveAi = () => {
    setAiInRoom(false);
    const socket = getSocket();
    if (socket) socket.emit(SOCKET_EVENTS.ROOM_REMOVE_AI, { roomId });
  };

  const handleAiSpeak = (e) => {
    e.preventDefault();
    const text = aiInput.trim();
    if (!text) return;
    const socket = getSocket();
    if (socket) socket.emit(SOCKET_EVENTS.USER_SPEECH, { roomId, text });
    setAiInput('');
  };

  const handleLeave = () => {
    const socket = getSocket();
    if (socket) socket.emit(SOCKET_EVENTS.ROOM_LEAVE);
    router.push('/');
  };

  const getDisplayName = (socketId) => participants.find((p) => p.socketId === socketId)?.userName || socketId;

  const participantCount = participants.length + (aiInRoom ? 1 : 0);

  // Build tiles: your camera only, remotes, AI. Screen share is not a tile — it shows in a floating preview bottom-right.
  const tiles = [];
  if (localStream) {
    tiles.push({ key: 'local-camera', stream: localStream, displayName: userName || 'You', isLocal: true });
  }
  Object.entries(remoteStreams).forEach(([socketId, stream]) => {
    tiles.push({ key: socketId, stream, displayName: getDisplayName(socketId), isLocal: false });
  });
  if (aiInRoom) {
    tiles.push({ key: 'ai', stream: aiStream || undefined, displayName: 'VoiceAssistant AI', isLocal: false });
  }

  const totalTiles = tiles.length;
  const gridClass =
    totalTiles <= 1
      ? 'grid-cols-1 grid-rows-[1fr]'
      : totalTiles === 2
        ? 'grid-cols-2'
        : totalTiles <= 4
          ? 'grid-cols-2'
          : 'grid-cols-3';

  return (
    <div className="page flex flex-col h-screen bg-[#F9F9FB]">
      {Object.entries(remoteStreams).map(([socketId, stream]) => (
        <RemoteAudio key={socketId} stream={stream} />
      ))}
      <audio ref={audioRef} className="hidden" />

      <CallRoomHeader roomId={roomId} aiActive={aiInRoom} />
      <div className="flex flex-1 min-h-0">
        <CallRoomSidebar currentRoomId={roomId} participantCount={participantCount} aiInRoom={aiInRoom} onAddAi={handleAddAi} />
        <section className="flex-1 flex flex-col min-w-0 bg-[#eef1f5] relative">
          {!socketConnected && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 rounded-lg bg-amber-100 border border-amber-300 px-3 py-2 text-sm text-amber-800">
              Reconnecting…
            </div>
          )}
          {mediaError && (
            <div className="absolute top-2 left-1/2 -translate-x-1/2 z-10 rounded-lg bg-amber-100 border border-amber-300 px-3 py-2 text-sm text-amber-800">
              {mediaError}
            </div>
          )}

          <div className="flex-1 flex flex-col min-h-0 overflow-hidden p-2 sm:p-4 relative">
            {totalTiles === 0 ? (
              <div className="flex-1 flex items-center justify-center text-[var(--text-secondary)] text-sm">
                Connecting…
              </div>
            ) : (
            <div className={`flex-1 min-h-0 grid gap-2 sm:gap-3 ${gridClass} w-full max-w-5xl mx-auto`}>
              {tiles.map(({ key, stream, displayName, isLocal }) => (
                <div key={key} className="min-h-0 flex w-full h-full">
                  <VideoTile
                    stream={stream}
                    displayName={displayName}
                    isLocal={isLocal}
                    fill={totalTiles === 1}
                  />
                </div>
              ))}
            </div>
            )}

            {/* Screen share: opens in its own floating div over the camera/tiles view */}
            {isScreenSharing && screenStream && (
              <ScreenSharePreview stream={screenStream} />
            )}

            {/* AI assistant: floating panel when AI is in room (Add AI button is in control bar above Leave) */}
            {aiInRoom && (
              <div className="absolute bottom-2 left-2 right-2 sm:left-4 sm:right-auto z-20 w-auto sm:w-80 max-w-[calc(100vw-1rem)] rounded-xl border-2 border-[var(--accent)] bg-white p-3 shadow-xl">
                <div className="flex items-center justify-between mb-2 gap-2">
                  <span className="text-xs font-semibold text-[var(--text-primary)]">AI Assistant</span>
                  <button
                    type="button"
                    onClick={handleRemoveAi}
                    className="p-2 min-w-[44px] min-h-[44px] rounded-lg text-gray-500 hover:text-red-600 hover:bg-red-50 flex items-center justify-center flex-shrink-0"
                    aria-label="Remove AI assistant"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                <form onSubmit={handleAiSpeak} className="flex gap-2">
                  <input
                    type="text"
                    value={aiInput}
                    onChange={(e) => setAiInput(e.target.value)}
                    placeholder="Ask the AI..."
                    className="flex-1 min-w-0 rounded-lg border border-gray-200 px-3 py-2 text-sm text-gray-900 placeholder-gray-500 focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                  />
                  <button type="submit" className="rounded-lg bg-[var(--accent)] px-3 py-2 text-sm font-medium text-white hover:opacity-90 min-h-[44px] flex-shrink-0">
                    Send
                  </button>
                </form>
              </div>
            )}
          </div>

          <CallControlBar
            isMuted={isMuted}
            toggleMute={toggleMute}
            micLevel={micLevel}
            isVideoEnabled={isVideoEnabled}
            toggleVideo={toggleVideo}
            isScreenSharing={isScreenSharing}
            toggleScreenShare={toggleScreenShare}
            onLeave={handleLeave}
            elapsedSeconds={elapsedSeconds}
          />
        </section>
        <CallRoomChat participantCount={participantCount} participants={participants} />
      </div>

      <footer className="flex-shrink-0 border-t border-[var(--card-border)] bg-[var(--card-bg)] px-3 sm:px-6 py-2 sm:py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs sm:text-sm text-[var(--text-secondary)]">
        <span>© 2026 VoxBridge</span>
        <span className="flex gap-3 sm:gap-4">
          <a href="#" className="text-[var(--accent)] hover:underline py-1">Privacy Policy</a>
          <a href="#" className="text-[var(--accent)] hover:underline py-1">Terms of Service</a>
        </span>
      </footer>
    </div>
  );
}

function RemoteAudio({ stream }) {
  const ref = useRef(null);
  useEffect(() => {
    if (ref.current && stream) ref.current.srcObject = stream;
  }, [stream]);
  return <audio ref={ref} autoPlay playsInline className="hidden" />;
}

/** Floating div over the camera view: shows your screen share in a separate overlay. */
function ScreenSharePreview({ stream }) {
  const videoRef = useRef(null);
  useEffect(() => {
    if (videoRef.current && stream) videoRef.current.srcObject = stream;
    return () => {
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [stream]);
  return (
    <div
      className="absolute bottom-2 right-2 sm:bottom-4 sm:right-4 z-20 w-36 sm:w-52 rounded-xl border-2 border-[var(--accent)] bg-black shadow-2xl overflow-hidden ring-2 ring-black/20"
      aria-label="Screen share preview overlay"
    >
      <p className="text-xs font-medium text-white bg-black/80 px-2 py-1.5">Your screen</p>
      <video ref={videoRef} autoPlay muted playsInline className="w-full aspect-video object-contain" />
    </div>
  );
}
