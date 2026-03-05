/**
 * AI voice agent service: receives user text, calls OpenAI chat, converts response to speech.
 * Streams audio buffer back (base64) for real-time playback in the call.
 * Uses existing aiService for chat + TTS; this module provides the voice-agent API surface.
 */

const aiService = require('./aiService');
const logger = require('../utils/logger');

/**
 * Process user text: OpenAI chat -> TTS -> return audio for streaming to clients.
 * @param {string} userText
 * @returns {Promise<{ text: string, audioBase64: string } | null>}
 */
async function processUserSpeech(userText) {
  if (!userText || typeof userText !== 'string') return null;
  const trimmed = userText.trim();
  if (!trimmed) return null;
  try {
    const result = await aiService.processUserSpeech(trimmed);
    return result;
  } catch (err) {
    logger.error('aiVoiceAgent processUserSpeech error', { err: err.message });
    return null;
  }
}

/**
 * Get TTS audio for a text string (e.g. for streaming AI responses).
 * @param {string} text
 * @returns {Promise<string|null>} base64 audio
 */
async function textToSpeech(text) {
  return aiService.textToSpeech(text);
}

/**
 * Chat only (no TTS). For compatibility or text-only flows.
 */
async function chat(userText) {
  return aiService.chat(userText);
}

module.exports = {
  processUserSpeech,
  textToSpeech,
  chat,
};
