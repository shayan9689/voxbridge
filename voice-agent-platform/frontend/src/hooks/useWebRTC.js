/**
 * WebRTC hook: peer connections, audio/video, screen share, offer/answer/ICE.
 * Production: dynamic STUN/TURN from env, ICE state logging, video bitrate/simulcast,
 * single getUserMedia, monitor integration, proper cleanup.
 */

import { useEffect, useRef, useState, useCallback } from 'react';
import { getSocket } from '../services/socket';
import { SOCKET_EVENTS } from '../constants';
import { attachMonitor, getPeerStats } from '../utils/webrtcMonitor';

function getIceServers() {
  const iceServers = [
    { urls: 'stun:stun.l.google.com:19302' },
    { urls: 'stun:stun1.l.google.com:19302' },
  ];
  const turnUrl = process.env.NEXT_PUBLIC_TURN_URL;
  if (turnUrl) {
    iceServers.push({
      urls: turnUrl,
      username: process.env.NEXT_PUBLIC_TURN_USERNAME || '',
      credential: process.env.NEXT_PUBLIC_TURN_PASSWORD || '',
    });
  }
  return iceServers;
}

function createPeerConnection(remoteSocketId, iceServers) {
  const configuration = { iceServers: iceServers || getIceServers() };
  const pc = new RTCPeerConnection(configuration);
  pc.addTransceiver('audio', { direction: 'sendrecv' });
  pc.addTransceiver('video', { direction: 'sendrecv' });
  return pc;
}

/**
 * Apply video sender constraints: max bitrate and optional simulcast.
 */
function applyVideoSenderParams(pc) {
  const sender = pc.getSenders().find((s) => s.track?.kind === 'video');
  if (!sender) return;
  try {
    const params = sender.getParameters();
    if (!params.encodings) params.encodings = [{}];
    params.encodings[0].maxBitrate = 1500000; // 1.5 Mbps
    if (params.encodings.length >= 1) {
      params.encodings[0].maxBitrate = 1500000;
    }
    sender.setParameters(params).catch(() => {});
  } catch (_) {}
}

function getMediaConstraints(opts = {}) {
  const {
    audioDeviceId = '',
    videoDeviceId = '',
    micEnabled = true,
    cameraEnabled = true,
  } = opts;
  const needAudio = micEnabled;
  const needVideo = cameraEnabled;
  return {
    audio: needAudio ? (audioDeviceId ? { deviceId: { exact: audioDeviceId } } : true) : true, // always request audio so we have a stream; we mute if !micEnabled
    video: needVideo
      ? videoDeviceId
        ? { deviceId: { exact: videoDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
        : { width: { ideal: 1280 }, height: { ideal: 720 } }
      : false,
  };
}

export function useWebRTC(roomId, options = {}) {
  const socket = getSocket();
  const peersRef = useRef({});
  const localStreamRef = useRef(null);
  const remoteStreamsRef = useRef({});
  const screenStreamRef = useRef(null);
  const iceServersRef = useRef(getIceServers());

  const micEnabled = options.micEnabled !== false;
  const cameraEnabled = options.cameraEnabled !== false;

  const [connectionCount, setConnectionCount] = useState(0);
  const [localStream, setLocalStreamState] = useState(null);
  const [remoteStreams, setRemoteStreams] = useState({});
  const [screenStream, setScreenStream] = useState(null);
  const [isMuted, setIsMuted] = useState(!micEnabled);
  const [isVideoEnabled, setIsVideoEnabled] = useState(cameraEnabled);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [mediaError, setMediaError] = useState(null);
  const [socketConnected, setSocketConnected] = useState(() => !!socket?.connected);
  const [connectionStats, setConnectionStats] = useState(null);

  const toggleMute = useCallback(() => {
    const stream = localStreamRef.current;
    const track = stream?.getAudioTracks?.()?.[0];
    if (track) {
      track.enabled = !track.enabled;
      setIsMuted((m) => !m);
    }
  }, []);

  const toggleVideo = useCallback(async () => {
    const stream = localStreamRef.current;
    const currentVideoTrack = stream?.getVideoTracks?.()?.[0];

    if (isVideoEnabled) {
      // Turning off: just disable the track so UI shows placeholder
      if (currentVideoTrack) {
        currentVideoTrack.enabled = false;
        setIsVideoEnabled(false);
      }
      return;
    }

    // Turning on: get a new video track so the live video shows again without refresh
    try {
      const videoConstraints = options.videoDeviceId
        ? { deviceId: { exact: options.videoDeviceId }, width: { ideal: 1280 }, height: { ideal: 720 } }
        : { width: { ideal: 1280 }, height: { ideal: 720 } };
      const newStream = await navigator.mediaDevices.getUserMedia({ video: videoConstraints, audio: false });
      const newVideoTrack = newStream.getVideoTracks()[0];
      newStream.getTracks().forEach((t) => {
        if (t !== newVideoTrack) t.stop();
      });

      if (!stream) {
        setIsVideoEnabled(true);
        return;
      }

      if (currentVideoTrack) {
        stream.removeTrack(currentVideoTrack);
        currentVideoTrack.stop();
      }
      stream.addTrack(newVideoTrack);
      setLocalStreamState(new MediaStream(stream.getTracks()));

      for (const entry of Object.values(peersRef.current)) {
        const sender = entry.pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender && !screenStreamRef.current) sender.replaceTrack(newVideoTrack).catch(() => {});
      }
      setIsVideoEnabled(true);
    } catch (err) {
      console.error('[useWebRTC] getUserMedia (video) error', err);
    }
  }, [isVideoEnabled, options.videoDeviceId]);

  const toggleScreenShare = useCallback(async () => {
    if (isScreenSharing) {
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      setScreenStream(null);
      const videoTrack = localStreamRef.current?.getVideoTracks?.()?.[0];
      for (const entry of Object.values(peersRef.current)) {
        const sender = entry.pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender && videoTrack) sender.replaceTrack(videoTrack).catch(() => {});
      }
      setIsScreenSharing(false);
      return;
    }
    try {
      const newScreenStream = await navigator.mediaDevices.getDisplayMedia({ video: true, audio: false });
      screenStreamRef.current = newScreenStream;
      setScreenStream(newScreenStream);
      newScreenStream.getVideoTracks()[0].onended = () => {
        screenStreamRef.current?.getTracks().forEach((t) => t.stop());
        screenStreamRef.current = null;
        setScreenStream(null);
        const vt = localStreamRef.current?.getVideoTracks?.()?.[0];
        for (const entry of Object.values(peersRef.current)) {
          const sender = entry.pc.getSenders().find((s) => s.track?.kind === 'video');
          if (sender && vt) sender.replaceTrack(vt).catch(() => {});
        }
        setIsScreenSharing(false);
      };
      const track = newScreenStream.getVideoTracks()[0];
      for (const entry of Object.values(peersRef.current)) {
        const sender = entry.pc.getSenders().find((s) => s.track?.kind === 'video');
        if (sender) sender.replaceTrack(track).catch(() => {});
      }
      setIsScreenSharing(true);
    } catch (err) {
      console.error('[useWebRTC] getDisplayMedia error', err);
    }
  }, [isScreenSharing]);

  const flushIceQueue = (pc, queue) => {
    if (!pc.remoteDescription || !queue.length) return;
    queue.forEach((candidate) => {
      pc.addIceCandidate(candidate).catch((e) => console.warn('[useWebRTC] addIceCandidate', e));
    });
    queue.length = 0;
  };

  const addLocalTracksToPc = (pc) => {
    const stream = localStreamRef.current;
    const screenStream = screenStreamRef.current;
    const audioTrack = stream?.getAudioTracks?.()?.[0];
    const videoTrack = screenStream?.getVideoTracks?.()?.[0] || stream?.getVideoTracks?.()?.[0];
    if (audioTrack && stream) pc.addTrack(audioTrack, stream);
    if (videoTrack) pc.addTrack(videoTrack, stream || screenStream || new MediaStream());
  };

  const cleanupPeersAndRemoteStreams = () => {
    Object.values(peersRef.current).forEach(({ pc, cleanupMonitor }) => {
      if (cleanupMonitor) cleanupMonitor();
      pc.close();
    });
    Object.keys(peersRef.current).forEach((k) => delete peersRef.current[k]);
    Object.keys(remoteStreamsRef.current).forEach((k) => delete remoteStreamsRef.current[k]);
    setRemoteStreams({});
    setConnectionCount(0);
  };

  useEffect(() => {
    if (!roomId || !socket) return;

    iceServersRef.current = getIceServers();
    const peers = peersRef.current;
    let listenersRegistered = false;

    const sendOffer = (toSocketId, pc) => {
      pc.createOffer()
        .then((offer) => pc.setLocalDescription(offer))
        .then(() => {
          applyVideoSenderParams(pc);
          socket.emit(SOCKET_EVENTS.WEBRTC_OFFER, { to: toSocketId, sdp: pc.localDescription });
        })
        .catch((err) => console.error('[useWebRTC] createOffer error', err));
    };

    const setupPcWithLoggingAndMonitor = (pc, peerId) => {
      pc.oniceconnectionstatechange = () => {
        const state = pc.iceConnectionState;
        if (process.env.NODE_ENV === 'development') {
          console.log('[useWebRTC] ICE connection state', { peerId, state });
        }
        if (state === 'failed' && pc.restartIce) {
          try {
            pc.restartIce();
          } catch (_) {}
        }
      };
      const cleanupMonitor = attachMonitor(pc, peerId, { statsIntervalMs: 5000 });
      return cleanupMonitor;
    };

    let removeListeners = () => {};
    let statsInterval = null;

    const addLocalTracksToExistingPeersAndRenegotiate = () => {
      const stream = localStreamRef.current;
      if (!stream) return;
      const audioTrack = stream.getAudioTracks?.()?.[0];
      const screenStream = screenStreamRef.current;
      const videoTrack = screenStream?.getVideoTracks?.()?.[0] || stream.getVideoTracks?.()?.[0];
      Object.entries(peersRef.current).forEach(([remoteId, { pc }]) => {
        const hasAudio = pc.getSenders().some((s) => s.track?.kind === 'audio');
        const hasVideo = pc.getSenders().some((s) => s.track?.kind === 'video');
        if (audioTrack && !hasAudio) pc.addTrack(audioTrack, stream);
        if (videoTrack && !hasVideo) pc.addTrack(videoTrack, stream || screenStream || new MediaStream());
        const needsRenegotiate = (audioTrack && !hasAudio) || (videoTrack && !hasVideo);
        if (needsRenegotiate) {
          pc.createOffer()
            .then((offer) => pc.setLocalDescription(offer))
            .then(() => {
              applyVideoSenderParams(pc);
              socket.emit(SOCKET_EVENTS.WEBRTC_OFFER, { to: remoteId, sdp: pc.localDescription });
            })
            .catch((err) => console.error('[useWebRTC] renegotiate offer error', err));
        }
      });
    };

    const registerListeners = () => {
      if (listenersRegistered) return;
      listenersRegistered = true;

      const onParticipantJoined = (data) => {
        const remoteId = data?.socketId;
        if (!remoteId || remoteId === socket.id || peers[remoteId]) return;
        const pc = createPeerConnection(remoteId, iceServersRef.current);
        addLocalTracksToPc(pc);
        const iceQueue = [];
        const cleanupMonitor = setupPcWithLoggingAndMonitor(pc, remoteId);
        peers[remoteId] = { pc, iceQueue, cleanupMonitor };
        pc.onicecandidate = (e) => {
          if (e.candidate) socket.emit(SOCKET_EVENTS.WEBRTC_ICE, { to: remoteId, candidate: e.candidate });
        };
        pc.onconnectionstatechange = () => {
          setConnectionCount((n) =>
            pc.connectionState === 'connected' ? n + 1 : pc.connectionState === 'closed' || pc.connectionState === 'failed' ? n - 1 : n
          );
        };
        pc.ontrack = (e) => {
          const stream =
            e.streams?.[0] ||
            (() => {
              const s = remoteStreamsRef.current[remoteId] || new MediaStream();
              s.addTrack(e.track);
              return s;
            })();
          remoteStreamsRef.current[remoteId] = stream;
          setRemoteStreams((prev) => ({ ...prev, [remoteId]: stream }));
        };
        sendOffer(remoteId, pc);
      };

      const onOffer = async (data) => {
        const fromId = data?.from;
        const sdp = data?.sdp;
        if (!fromId || !sdp || fromId === socket.id) return;
        let pc = peers[fromId]?.pc;
        const isRenegotiation = !!pc;
        if (!pc) {
          pc = createPeerConnection(fromId, iceServersRef.current);
          addLocalTracksToPc(pc);
          const iceQueue = [];
          const cleanupMonitor = setupPcWithLoggingAndMonitor(pc, fromId);
          peers[fromId] = { pc, iceQueue, cleanupMonitor };
          pc.onicecandidate = (e) => {
            if (e.candidate) socket.emit(SOCKET_EVENTS.WEBRTC_ICE, { to: fromId, candidate: e.candidate });
          };
          pc.onconnectionstatechange = () => {
            setConnectionCount((n) =>
              pc.connectionState === 'connected' ? n + 1 : pc.connectionState === 'closed' || pc.connectionState === 'failed' ? n - 1 : n
            );
          };
          pc.ontrack = (e) => {
            const stream =
              e.streams?.[0] ||
              (() => {
                const s = remoteStreamsRef.current[fromId] || new MediaStream();
                s.addTrack(e.track);
                return s;
              })();
            remoteStreamsRef.current[fromId] = stream;
            setRemoteStreams((prev) => ({ ...prev, [fromId]: stream }));
          };
        }
        const iceQueue = peers[fromId].iceQueue;
        try {
          await pc.setRemoteDescription(new RTCSessionDescription(sdp));
          flushIceQueue(pc, iceQueue);
          const answer = await pc.createAnswer();
          await pc.setLocalDescription(answer);
          applyVideoSenderParams(pc);
          socket.emit(SOCKET_EVENTS.WEBRTC_ANSWER, { to: fromId, sdp: pc.localDescription });
        } catch (err) {
          console.error('[useWebRTC] handle offer error', err);
        }
      };

      const onAnswer = async (data) => {
        const fromId = data?.from;
        const sdp = data?.sdp;
        const entry = peers[fromId];
        if (!fromId || !sdp || !entry) return;
        try {
          await entry.pc.setRemoteDescription(new RTCSessionDescription(sdp));
          flushIceQueue(entry.pc, entry.iceQueue);
        } catch (err) {
          console.error('[useWebRTC] setRemoteDescription (answer) error', err);
        }
      };

      const onIce = async (data) => {
        const fromId = data?.from;
        const candidate = data?.candidate;
        const entry = peers[fromId];
        if (!fromId || !entry) return;
        const rtcCandidate = candidate ? new RTCIceCandidate(candidate) : null;
        if (entry.pc.remoteDescription) {
          await entry.pc.addIceCandidate(rtcCandidate).catch((e) => console.warn('[useWebRTC] addIceCandidate', e));
        } else {
          if (rtcCandidate) entry.iceQueue.push(rtcCandidate);
        }
      };

      const onParticipantLeft = (data) => {
        const leftId = data?.socketId;
        if (!leftId || !peers[leftId]) return;
        const entry = peers[leftId];
        if (entry.cleanupMonitor) entry.cleanupMonitor();
        entry.pc.close();
        delete peers[leftId];
        if (remoteStreamsRef.current[leftId]) delete remoteStreamsRef.current[leftId];
        setRemoteStreams((prev) => {
          const next = { ...prev };
          delete next[leftId];
          return next;
        });
        setConnectionCount((n) => Math.max(0, n - 1));
      };

      socket.on(SOCKET_EVENTS.PARTICIPANT_JOINED, onParticipantJoined);
      socket.on(SOCKET_EVENTS.WEBRTC_OFFER, onOffer);
      socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, onAnswer);
      socket.on(SOCKET_EVENTS.WEBRTC_ICE, onIce);
      socket.on(SOCKET_EVENTS.PARTICIPANT_LEFT, onParticipantLeft);
      const onDisconnect = () => {
        setSocketConnected(false);
        cleanupPeersAndRemoteStreams();
      };
      const onConnect = () => setSocketConnected(true);
      socket.on('disconnect', onDisconnect);
      socket.on('connect', onConnect);
      setSocketConnected(socket.connected);

      statsInterval = setInterval(async () => {
        const first = Object.values(peers)[0];
        if (!first?.pc || first.pc.connectionState !== 'connected') {
          setConnectionStats(null);
          return;
        }
        try {
          const metrics = await getPeerStats(first.pc);
          setConnectionStats(metrics || null);
        } catch {
          setConnectionStats(null);
        }
      }, 3000);

      removeListeners = () => {
        socket.off(SOCKET_EVENTS.PARTICIPANT_JOINED, onParticipantJoined);
        socket.off(SOCKET_EVENTS.WEBRTC_OFFER, onOffer);
        socket.off(SOCKET_EVENTS.WEBRTC_ANSWER, onAnswer);
        socket.off(SOCKET_EVENTS.WEBRTC_ICE, onIce);
        socket.off(SOCKET_EVENTS.PARTICIPANT_LEFT, onParticipantLeft);
        socket.off('disconnect', onDisconnect);
        socket.off('connect', onConnect);
        if (statsInterval) clearInterval(statsInterval);
      };
    };

    registerListeners();

    (async () => {
      const constraints = getMediaConstraints(options);
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraints);
        localStreamRef.current = stream;
        setLocalStreamState(stream);
        setMediaError(null);
        if (!options.micEnabled && stream.getAudioTracks()[0]) stream.getAudioTracks()[0].enabled = false;
        if (!options.cameraEnabled && stream.getVideoTracks()[0]) stream.getVideoTracks()[0].enabled = false;
        addLocalTracksToExistingPeersAndRenegotiate();
      } catch (err) {
        console.error('[useWebRTC] getUserMedia error', err);
        setMediaError(err.message || 'Microphone/camera access failed');
        try {
          const fallback = await navigator.mediaDevices.getUserMedia({ audio: true });
          localStreamRef.current = fallback;
          setLocalStreamState(fallback);
          setMediaError('Camera denied; audio only.');
          if (!options.micEnabled && fallback.getAudioTracks()[0]) fallback.getAudioTracks()[0].enabled = false;
          addLocalTracksToExistingPeersAndRenegotiate();
        } catch {
          setMediaError(err.message || 'Microphone access failed');
        }
      }
    })();

    return () => {
      removeListeners();
      screenStreamRef.current?.getTracks().forEach((t) => t.stop());
      screenStreamRef.current = null;
      if (localStreamRef.current) {
        localStreamRef.current.getTracks().forEach((t) => t.stop());
        localStreamRef.current = null;
      }
      setLocalStreamState(null);
      Object.values(peers).forEach(({ pc, cleanupMonitor }) => {
        if (cleanupMonitor) cleanupMonitor();
        pc.close();
      });
      Object.keys(peers).forEach((k) => delete peers[k]);
      Object.keys(remoteStreamsRef.current).forEach((k) => delete remoteStreamsRef.current[k]);
      setRemoteStreams({});
      setConnectionCount(0);
    };
  }, [roomId, options.audioDeviceId, options.videoDeviceId, options.micEnabled, options.cameraEnabled]);

  return {
    localStream,
    remoteStreams,
    screenStream,
    connectionCount,
    isMuted,
    toggleMute,
    isVideoEnabled,
    toggleVideo,
    isScreenSharing,
    toggleScreenShare,
    mediaError,
    socketConnected,
    connectionStats,
    peerConnections: peersRef.current,
  };
}
