/**
 * WebRTC connection monitoring and diagnostics.
 * Tracks ICE/peer state, packet loss, latency, bitrate. Logs in development.
 */

const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';

/**
 * Log diagnostic message only in development.
 */
function log(label, data) {
  if (isDev && typeof console !== 'undefined') {
    console.log(`[WebRTC Monitor] ${label}`, data ?? '');
  }
}

/**
 * Attach ICE connection state logging to a peer connection.
 * @param {RTCPeerConnection} pc
 * @param {string} peerId - e.g. remote socket id
 */
export function attachIceConnectionStateLogging(pc, peerId) {
  if (!pc) return;
  const handler = () => {
    const state = pc.iceConnectionState;
    log('ICE connection state', { peerId, state });
    if (state === 'checking' || state === 'connected' || state === 'failed' || state === 'disconnected') {
      log(`ICE: ${state}`, peerId);
    }
  };
  pc.addEventListener('iceconnectionstatechange', handler);
  return () => pc.removeEventListener('iceconnectionstatechange', handler);
}

/**
 * Attach peer connection state logging.
 */
export function attachConnectionStateLogging(pc, peerId) {
  if (!pc) return;
  const handler = () => log('Peer connection state', { peerId, state: pc.connectionState });
  pc.addEventListener('connectionstatechange', handler);
  return () => pc.removeEventListener('connectionstatechange', handler);
}

/**
 * Extract metrics from getStats(): packets lost, RTT, outgoing bitrate.
 * @param {RTCPeerConnection} pc
 * @returns {Promise<{ packetsLost, rttMs, outgoingBitrate }>}
 */
export async function getPeerStats(pc) {
  if (!pc || typeof pc.getStats !== 'function') return null;
  try {
    const stats = await pc.getStats();
    let packetsLost = null;
    let rttMs = null;
    let bytesSent = null;

    stats.forEach((report) => {
      if (report.type === 'inbound-rtp' && report.packetsLost != null) {
        packetsLost = (packetsLost ?? 0) + report.packetsLost;
      }
      if (report.type === 'candidate-pair' && report.state === 'succeeded') {
        if (report.currentRoundTripTime != null) rttMs = Math.round(report.currentRoundTripTime * 1000);
      }
      if (report.type === 'outbound-rtp' && report.bytesSent != null) {
        bytesSent = report.bytesSent;
      }
    });

    return { packetsLost: packetsLost ?? undefined, rttMs: rttMs ?? undefined, bytesSent: bytesSent ?? undefined };
  } catch (e) {
    log('getStats error', e);
    return null;
  }
}

/**
 * Start periodic stats collection and logging for a peer (dev only).
 * @param {RTCPeerConnection} pc
 * @param {string} peerId
 * @param {number} intervalMs
 * @returns {() => void} stop function
 */
export function startStatsLogging(pc, peerId, intervalMs = 5000) {
  if (!isDev || !pc) return () => {};
  const interval = setInterval(async () => {
    if (pc.connectionState !== 'connected') return;
    const metrics = await getPeerStats(pc);
    if (metrics) log('Stats', { peerId, ...metrics });
  }, intervalMs);
  return () => clearInterval(interval);
}

/**
 * Attach all monitoring to a peer connection (ICE state, connection state, optional stats).
 */
export function attachMonitor(pc, peerId, options = {}) {
  const cleanup = [];
  cleanup.push(attachIceConnectionStateLogging(pc, peerId));
  cleanup.push(attachConnectionStateLogging(pc, peerId));
  if (options.statsIntervalMs) {
    cleanup.push(startStatsLogging(pc, peerId, options.statsIntervalMs));
  }
  return () => cleanup.forEach((fn) => fn());
}
