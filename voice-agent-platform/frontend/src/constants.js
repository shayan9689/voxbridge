/**
 * Socket event names (mirrors shared/constants.js for frontend use).
 * Keep in sync with backend shared/constants.js.
 */

export const MAX_PARTICIPANTS_PER_ROOM = 6;

export const SOCKET_EVENTS = {
  ROOM_CREATE: 'room:create',
  ROOM_JOIN: 'room:join',
  ROOM_LEAVE: 'room:leave',
  ROOM_PARTICIPANTS: 'room:participants',
  PARTICIPANT_JOINED: 'participant:joined',
  PARTICIPANT_LEFT: 'participant:left',
  PARTICIPANTS_LIST: 'participants:list',
  CONNECTION: 'connection',
  DISCONNECT: 'disconnect',
  ERROR: 'error',
  WEBRTC_OFFER: 'webrtc:offer',
  WEBRTC_ANSWER: 'webrtc:answer',
  WEBRTC_ICE: 'webrtc:ice',
  ROOM_ADD_AI: 'room:add-ai',
  ROOM_REMOVE_AI: 'room:remove-ai',
  USER_SPEECH: 'user:speech',
  AI_AUDIO: 'ai:audio',
  AI_JOINED: 'ai:joined',
  AI_LEFT: 'ai:left',
};
