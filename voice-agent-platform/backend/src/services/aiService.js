/**
 * AI voice agent: chat completion + TTS. Uses OpenAI API.
 * Requires OPENAI_API_KEY in env.
 */

const OpenAI = require('openai');
const logger = require('../utils/logger');

let openai = null;

function getClient() {
  if (openai) return openai;
  const key = process.env.OPENAI_API_KEY;
  if (!key) {
    logger.warn('OPENAI_API_KEY not set; AI features disabled');
    return null;
  }
  openai = new OpenAI({ apiKey: key });
  return openai;
}

const SYSTEM_PROMPT = 'You are a helpful voice assistant in a group call. Keep replies concise and natural for speech (1-3 sentences).';

/**
 * Get chat completion for user text. Returns response text or null.
 */
async function chat(userText) {
  const client = getClient();
  if (!client) return null;
  try {
    const completion = await client.chat.completions.create({
      model: process.env.OPENAI_MODEL || 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: userText },
      ],
      max_tokens: 150,
    });
    const text = completion.choices?.[0]?.message?.content?.trim();
    return text || null;
  } catch (err) {
    logger.error('OpenAI chat error', { err: err.message });
    return null;
  }
}

/**
 * Convert text to speech (MP3). Returns base64 string or null.
 */
async function textToSpeech(text) {
  const client = getClient();
  if (!client) return null;
  if (!text) return null;
  try {
    const response = await client.audio.speech.create({
      model: process.env.OPENAI_TTS_MODEL || 'tts-1',
      voice: process.env.OPENAI_TTS_VOICE || 'alloy',
      input: text.slice(0, 4096),
    });
    const buffer = Buffer.from(await response.arrayBuffer());
    return buffer.toString('base64');
  } catch (err) {
    logger.error('OpenAI TTS error', { err: err.message });
    return null;
  }
}

/**
 * Process user text: chat then TTS. Returns { text, audioBase64 } or null.
 */
async function processUserSpeech(userText) {
  const text = await chat(userText);
  if (!text) return null;
  const audioBase64 = await textToSpeech(text);
  return { text, audioBase64 };
}

module.exports = { chat, textToSpeech, processUserSpeech, getClient };
