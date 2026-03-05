/**
 * HTTP server with Socket.IO attached.
 * Loads env, starts Express, initializes Socket.IO signaling.
 */

const http = require('http');
const { Server: SocketServer } = require('socket.io');
const env = require('./config/env');
const app = require('./app');
const { registerSocketHandlers } = require('./sockets/socketHandler');
const logger = require('./utils/logger');

process.on('uncaughtException', (err) => {
  logger.error('uncaughtException', { err: err.message, stack: err.stack });
});
process.on('unhandledRejection', (reason, p) => {
  logger.error('unhandledRejection', { reason, p });
});

const server = http.createServer(app);

const io = new SocketServer(server, {
  cors: { origin: env.CORS_ORIGIN },
  pingTimeout: 60000,
  pingInterval: 25000,
});

registerSocketHandlers(io);

server.listen(env.PORT, () => {
  logger.info(`Server listening on port ${env.PORT}`, { NODE_ENV: env.NODE_ENV });
});
