/**
 * Express application: CORS, JSON, API routes.
 * Socket.IO is attached in server.js.
 */

const express = require('express');
const cors = require('cors');
const env = require('./config/env');
const roomController = require('./controllers/roomController');

const app = express();

app.use(cors({ origin: env.CORS_ORIGIN }));
app.use(express.json());

// Health check
app.get('/api/health', roomController.health);

// Room info (exists, participant count)
app.get('/api/rooms/:roomId', roomController.getRoomInfo);

module.exports = app;
