/**
 * Create a MediaStream (audio track) from base64-encoded MP3.
 * Used to show AI Assistant as a virtual participant with an audio stream.
 */

/**
 * @param {string} base64 - base64-encoded audio (e.g. MP3)
 * @returns {Promise<MediaStream|null>} stream with one audio track, or null on failure
 */
export async function mediaStreamFromBase64(base64) {
  if (!base64) return null;
  try {
    const binary = atob(base64);
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    const arrayBuffer = bytes.buffer;
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const audioBuffer = await audioContext.decodeAudioData(arrayBuffer.slice(0));
    const destination = audioContext.createMediaStreamDestination();
    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(destination);
    source.start(0);
    return destination.stream;
  } catch (e) {
    console.warn('[audioFromBase64]', e);
    return null;
  }
}
