/**
 * In-memory room store and room logic.
 * Handles room creation, join/leave, and participant list.
 * No persistence (rooms disappear on server restart).
 */

const { MAX_PARTICIPANTS_PER_ROOM } = require('../../../shared/constants');
const logger = require('../utils/logger');

// roomId -> { participants: Map<socketId, { socketId, userName, joinedAt }> }
const rooms = new Map();

/**
 * Generate a short unique room ID (e.g. for shareable links).
 */
function generateRoomId() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return rooms.has(id) ? generateRoomId() : id;
}

/**
 * Create a new room. Returns roomId.
 */
function createRoom(roomId = null) {
  const id = roomId && !rooms.has(roomId) ? roomId : generateRoomId();
  if (rooms.has(id)) {
    return null;
  }
  rooms.set(id, {
    participants: new Map(),
    createdAt: Date.now(),
  });
  logger.info('Room created', { roomId: id });
  return id;
}

/**
 * Get room by id. Returns undefined if not found.
 */
function getRoom(roomId) {
  return rooms.get(roomId);
}

/**
 * Add participant to room. Returns { success, userName, isNew? }.
 * Idempotent: if already in room, returns success without re-adding (for page refresh / redirect).
 */
function addParticipant(roomId, socketId, payload = {}) {
  const room = rooms.get(roomId);
  if (!room) {
    return { success: false, error: 'ROOM_NOT_FOUND' };
  }
  const existing = room.participants.get(socketId);
  if (existing) {
    return { success: true, userName: existing.userName, isNew: false };
  }
  if (room.participants.size >= MAX_PARTICIPANTS_PER_ROOM) {
    return { success: false, error: 'ROOM_FULL' };
  }
  const userName = payload.userName || `User-${socketId.slice(0, 6)}`;
  room.participants.set(socketId, {
    socketId,
    userName,
    joinedAt: Date.now(),
  });
  logger.info('Participant joined', { roomId, socketId, userName });
  return { success: true, userName, isNew: true };
}

/**
 * Remove participant from room. Returns the removed participant info or null.
 */
function removeParticipant(roomId, socketId) {
  const room = rooms.get(roomId);
  if (!room) return null;
  const participant = room.participants.get(socketId);
  room.participants.delete(socketId);
  if (participant) {
    logger.info('Participant left', { roomId, socketId, userName: participant.userName });
  }
  if (room.participants.size === 0) {
    rooms.delete(roomId);
    logger.info('Room deleted (empty)', { roomId });
  }
  return participant;
}

/**
 * Get list of participants in room (array of { socketId, userName, joinedAt }).
 */
function getParticipants(roomId) {
  const room = rooms.get(roomId);
  if (!room) return [];
  return Array.from(room.participants.values());
}

/**
 * Get socket's current room id (for disconnect cleanup).
 */
function findRoomBySocketId(socketId) {
  for (const [roomId, room] of rooms.entries()) {
    if (room.participants.has(socketId)) return roomId;
  }
  return null;
}

/**
 * Set or clear AI in room (for voice agent).
 */
function setRoomAi(roomId, value) {
  const room = rooms.get(roomId);
  if (room) room.hasAi = !!value;
}

module.exports = {
  createRoom,
  getRoom,
  addParticipant,
  removeParticipant,
  getParticipants,
  findRoomBySocketId,
  setRoomAi,
};
