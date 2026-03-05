/**
 * Socket.IO event handler: room creation, join, leave, participant broadcast.
 * No WebRTC signaling in Step 1.
 */

const { SOCKET_EVENTS } = require('../../../shared/constants');
const roomService = require('../services/roomService');
const aiService = require('../services/aiService');
const logger = require('../utils/logger');

/**
 * Register all socket handlers on the given IO instance.
 * @param {import('socket.io').Server} io
 */
function registerSocketHandlers(io) {
  io.on(SOCKET_EVENTS.CONNECTION, (socket) => {
    logger.info('Client connected', { socketId: socket.id });

    /**
     * Join or create room.
     * Payload: { roomId?: string, userName?: string }
     * - If roomId provided and exists: join it.
     * - If roomId provided and does not exist: create and join.
     * - If no roomId: create new room and join.
     */
    socket.on(SOCKET_EVENTS.ROOM_JOIN, (payload, callback) => {
      const roomId = payload?.roomId?.trim() || null;
      const userName = payload?.userName?.trim() || null;

      let targetRoomId = roomId;
      if (!roomId) {
        targetRoomId = roomService.createRoom();
      } else if (!roomService.getRoom(roomId)) {
        roomService.createRoom(roomId);
      }

      const result = roomService.addParticipant(targetRoomId, socket.id, {
        userName: userName || undefined,
      });

      if (!result.success) {
        const err = result.error === 'ROOM_FULL' ? 'Room is full' : 'Room not found';
        logger.warn('Room join failed', { socketId: socket.id, roomId: targetRoomId, error: result.error });
        if (typeof callback === 'function') callback({ success: false, error: err });
        return;
      }

      const alreadyInRoom = result.isNew === false;
      if (!alreadyInRoom) {
        socket.join(targetRoomId);
      }
      socket.data.roomId = targetRoomId;
      socket.data.userName = result.userName;

      const participants = roomService.getParticipants(targetRoomId);

      // Tell this socket they joined and current participant list
      if (typeof callback === 'function') {
        callback({
          success: true,
          roomId: targetRoomId,
          participants,
          userName: result.userName,
        });
      }

      // Broadcast to others only when this is a new join (not idempotent re-join)
      if (result.isNew !== false) {
        socket.to(targetRoomId).emit(SOCKET_EVENTS.PARTICIPANT_JOINED, {
          socketId: socket.id,
          userName: result.userName,
          participants,
        });
      }

      socket.emit(SOCKET_EVENTS.PARTICIPANTS_LIST, participants);

      logger.info('User joined room', {
        socketId: socket.id,
        roomId: targetRoomId,
        userName: result.userName,
        total: participants.length,
      });
    });

    /**
     * Explicit leave room (optional; disconnect also cleans up).
     */
    /**
     * WebRTC signaling: relay offer/answer/ICE to the target peer.
     * Payload must include { to: targetSocketId }; server adds { from: socket.id }.
     */
    socket.on(SOCKET_EVENTS.WEBRTC_OFFER, (payload) => {
      const to = payload?.to;
      if (!to || typeof to !== 'string') return;
      io.to(to).emit(SOCKET_EVENTS.WEBRTC_OFFER, {
        from: socket.id,
        sdp: payload.sdp,
      });
    });

    socket.on(SOCKET_EVENTS.WEBRTC_ANSWER, (payload) => {
      const to = payload?.to;
      if (!to || typeof to !== 'string') return;
      io.to(to).emit(SOCKET_EVENTS.WEBRTC_ANSWER, {
        from: socket.id,
        sdp: payload.sdp,
      });
    });

    socket.on(SOCKET_EVENTS.WEBRTC_ICE, (payload) => {
      const to = payload?.to;
      if (!to || typeof to !== 'string') return;
      io.to(to).emit(SOCKET_EVENTS.WEBRTC_ICE, {
        from: socket.id,
        candidate: payload.candidate,
      });
    });

    /** Add AI voice agent to the room (caller must be in room). */
    socket.on(SOCKET_EVENTS.ROOM_ADD_AI, (payload) => {
      const roomId = payload?.roomId?.trim() || socket.data.roomId;
      if (!roomId || socket.data.roomId !== roomId) return;
      const room = roomService.getRoom(roomId);
      if (!room) return;
      room.hasAi = true;
      io.to(roomId).emit(SOCKET_EVENTS.AI_JOINED, { roomId });
      logger.info('AI added to room', { roomId });
    });

    /** Remove AI from the room (caller must be in room). */
    socket.on(SOCKET_EVENTS.ROOM_REMOVE_AI, (payload) => {
      const roomId = payload?.roomId?.trim() || socket.data.roomId;
      if (!roomId || socket.data.roomId !== roomId) return;
      const room = roomService.getRoom(roomId);
      if (!room) return;
      room.hasAi = false;
      io.to(roomId).emit(SOCKET_EVENTS.AI_LEFT, { roomId });
      logger.info('AI removed from room', { roomId });
    });

    /** User speech (text) -> OpenAI -> TTS -> broadcast ai:audio to room. */
    socket.on(SOCKET_EVENTS.USER_SPEECH, async (payload) => {
      const roomId = payload?.roomId?.trim() || socket.data.roomId;
      const text = payload?.text?.trim();
      if (!roomId || !text) return;
      if (socket.data.roomId !== roomId) return;
      const room = roomService.getRoom(roomId);
      if (!room?.hasAi) return;
      try {
        const result = await aiService.processUserSpeech(text);
        if (result?.audioBase64) io.to(roomId).emit(SOCKET_EVENTS.AI_AUDIO, { audioBase64: result.audioBase64, text: result.text });
      } catch (err) {
        logger.error('AI speech error', { err: err.message });
      }
    });

    socket.on(SOCKET_EVENTS.ROOM_LEAVE, () => {
      const roomId = socket.data.roomId;
      if (!roomId) {
        if (typeof callback === 'function') callback({ success: false });
        return;
      }
      const participant = roomService.removeParticipant(roomId, socket.id);
      socket.leave(roomId);
      socket.data.roomId = null;
      socket.data.userName = null;

      const participants = roomService.getParticipants(roomId);
      socket.to(roomId).emit(SOCKET_EVENTS.PARTICIPANT_LEFT, {
        socketId: socket.id,
        userName: participant?.userName,
        participants,
      });
      logger.info('User left room', { socketId: socket.id, roomId });
    });

    socket.on(SOCKET_EVENTS.DISCONNECT, (reason) => {
      const roomId = socket.data.roomId;
      if (roomId) {
        const participant = roomService.removeParticipant(roomId, socket.id);
        const participants = roomService.getParticipants(roomId);
        socket.to(roomId).emit(SOCKET_EVENTS.PARTICIPANT_LEFT, {
          socketId: socket.id,
          userName: participant?.userName,
          participants,
        });
      }
      logger.info('Client disconnected', { socketId: socket.id, reason });
    });

    socket.on(SOCKET_EVENTS.ERROR, (err) => {
      logger.error('Socket error', { socketId: socket.id, err });
    });
  });
}

module.exports = { registerSocketHandlers };
