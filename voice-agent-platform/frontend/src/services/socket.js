/**
 * Socket.IO client for signaling.
 * Connects to backend; used for room join/leave and participant updates.
 * No WebRTC in Step 2.
 */

import { io } from 'socket.io-client';

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || 'http://localhost:3001';

let socket = null;

/**
 * Get or create a single socket connection (singleton).
 */
export function getSocket() {
  if (socket?.connected) return socket;
  socket = io(SOCKET_URL, {
    autoConnect: true,
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 1000,
  });
  return socket;
}

/**
 * Disconnect socket (e.g. on app unmount or logout).
 */
export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export { SOCKET_URL };
