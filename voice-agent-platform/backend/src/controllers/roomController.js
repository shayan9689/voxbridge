/**
 * REST API for rooms (optional health and room info).
 * Room creation and join are handled via Socket.IO in socketHandler.
 */

const roomService = require('../services/roomService');
const logger = require('../utils/logger');

/**
 * GET /api/rooms/:roomId
 * Returns whether the room exists and participant count.
 */
function getRoomInfo(req, res) {
  const { roomId } = req.params;
  const room = roomService.getRoom(roomId);
  if (!room) {
    return res.status(404).json({ exists: false, roomId });
  }
  const participants = roomService.getParticipants(roomId);
  res.json({
    exists: true,
    roomId,
    participantCount: participants.length,
    participants: participants.map((p) => ({ socketId: p.socketId, userName: p.userName })),
  });
}

/**
 * GET /api/health
 * Simple health check for deployment.
 */
function health(req, res) {
  res.json({ ok: true, timestamp: new Date().toISOString() });
}

module.exports = {
  getRoomInfo,
  health,
};
