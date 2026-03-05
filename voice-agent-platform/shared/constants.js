/**
 * Shared constants for backend and frontend.
 * Room limits, event names, and config keys.
 */

// Room capacity (5-6 users per room)
const MAX_PARTICIPANTS_PER_ROOM = 6;

// Socket.IO event names (signaling - no WebRTC in Step 1)
const SOCKET_EVENTS = {
  // Room lifecycle
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_PARTICIPANTS: 'room:participants',

  // Participant broadcast (who is in the room)
  PARTICIPANT_JOINED: 'participant:joined',
  PARTICIPANT_LEFT: 'participant:left',
  PARTICIPANTS_LIST: 'participants:list',

  // Connection
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',

  // WebRTC signaling (Step 3)
  WEBRTC_OFFER: 'webrtc:offer',
  WEBRTC_ANSWER: 'webrtc:answer',
  WEBRTC_ICE: 'webrtc:ice',

  // AI voice agent (Step 8)
  ROOM_ADD_AI: 'room:add-ai',
  ROOM_REMOVE_AI: 'room:remove-ai',
  USER_SPEECH: 'user:speech',
  AI_AUDIO: 'ai:audio',
  AI_JOINED: 'ai:joined',
  AI_LEFT: 'ai:left',
};

module.exports = {
  MAX_PARTICIPANTS_PER_ROOM,
  SOCKET_EVENTS,
};
