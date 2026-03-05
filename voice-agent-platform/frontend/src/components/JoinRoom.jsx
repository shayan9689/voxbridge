/**
 * Room Lobby card: CREATE ROOM / Join Room tabs, form, Start Voice Room, policy notice.
 * On create success shows RoomCreatedToast; Join Now or Copy Link.
 */

import { useState } from 'react';
import { useRouter } from 'next/router';
import { getSocket } from '../services/socket';
import { SOCKET_EVENTS } from '../constants';
import RoomCreatedToast from './lobby/RoomCreatedToast';

export default function JoinRoom() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('create');
  const [roomIdentity, setRoomIdentity] = useState('');
  const [roomPurpose, setRoomPurpose] = useState('');
  const [joinRoomId, setJoinRoomId] = useState('');
  const [userName, setUserName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [createdRoom, setCreatedRoom] = useState(null); // { roomId, roomName }

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const socket = getSocket();
    const payload = {
      userName: userName.trim() || roomIdentity.trim() || undefined,
      roomId: activeTab === 'join' ? joinRoomId.trim().toUpperCase() : undefined,
    };

    socket.emit(SOCKET_EVENTS.ROOM_JOIN, payload, (res) => {
      setLoading(false);
      if (res?.success && res?.roomId) {
        if (activeTab === 'create') {
          setCreatedRoom({ roomId: res.roomId, roomName: roomIdentity.trim() || 'Room' });
        } else {
          router.push(`/room/${res.roomId}`);
        }
        return;
      }
      setError(res?.error || 'Failed to join room');
    });
  };

  const handleJoinNow = () => {
    if (createdRoom?.roomId) {
      router.push(`/room/${createdRoom.roomId}`);
      setCreatedRoom(null);
    }
  };

  const handleCopyLink = () => {
    if (createdRoom?.roomId && typeof window !== 'undefined') {
      const url = `${window.location.origin}/room/${createdRoom.roomId}`;
      navigator.clipboard.writeText(url).then(() => {}, () => {});
    }
  };

  const handleCloseToast = () => setCreatedRoom(null);

  return (
    <>
      <div className="max-w-lg mx-auto rounded-lg border border-[var(--card-border)] bg-[var(--card-bg)] shadow-sm overflow-hidden">
        {/* Tabs */}
        <div className="flex border-b border-[var(--card-border)] rounded-t-lg overflow-hidden">
          <button
            type="button"
            onClick={() => { setActiveTab('create'); setError(''); }}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-tl-lg transition-colors ${activeTab === 'create' ? 'bg-[var(--accent)] text-white border-b-2 border-[var(--accent)]' : 'text-[var(--text-secondary)] bg-[var(--card-bg)] hover:bg-gray-100 hover:text-[var(--text-primary)]'}`}
          >
            CREATE ROOM
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('join'); setError(''); }}
            className={`flex-1 py-3 px-4 text-sm font-medium rounded-tr-lg transition-colors ${activeTab === 'join' ? 'bg-[var(--accent)] text-white border-b-2 border-[var(--accent)]' : 'text-[var(--text-secondary)] bg-[var(--card-bg)] hover:bg-gray-100 hover:text-[var(--text-primary)]'}`}
          >
            Join Room
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {activeTab === 'create' ? (
            <>
              <div>
                <label htmlFor="roomIdentity" className="block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] mb-1">
                  Room Identity <span className="text-red-500">*</span>
                </label>
                <input
                  id="roomIdentity"
                  type="text"
                  value={roomIdentity}
                  onChange={(e) => setRoomIdentity(e.target.value)}
                  placeholder="e.g. Weekly Strategy Sync"
                  required
                  className="w-full rounded-lg border border-[var(--card-border)] bg-white px-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
              <div>
                <label htmlFor="roomPurpose" className="block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] mb-1">
                  Room Purpose (optional)
                </label>
                <textarea
                  id="roomPurpose"
                  value={roomPurpose}
                  onChange={(e) => setRoomPurpose(e.target.value)}
                  placeholder="What are we focusing on today?"
                  rows={3}
                  className="w-full rounded-lg border border-[var(--card-border)] bg-white px-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] resize-none"
                />
              </div>
            </>
          ) : (
            <>
              <div>
                <label htmlFor="joinRoomId" className="block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] mb-1">
                  Room ID <span className="text-red-500">*</span>
                </label>
                <input
                  id="joinRoomId"
                  type="text"
                  value={joinRoomId}
                  onChange={(e) => setJoinRoomId(e.target.value.toUpperCase())}
                  placeholder="e.g. ABC123"
                  maxLength={6}
                  required
                  className="w-full rounded-lg border border-[var(--card-border)] bg-white px-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)] uppercase"
                />
              </div>
              <div>
                <label htmlFor="userNameJoin" className="block text-xs font-medium uppercase tracking-wide text-[var(--text-secondary)] mb-1">
                  Your name (optional)
                </label>
                <input
                  id="userNameJoin"
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  placeholder="e.g. Alex"
                  className="w-full rounded-lg border border-[var(--card-border)] bg-white px-3 py-2.5 text-[var(--text-primary)] placeholder-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
                />
              </div>
            </>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          <button
            type="submit"
            disabled={
              loading ||
              (activeTab === 'create' && !roomIdentity.trim()) ||
              (activeTab === 'join' && !joinRoomId.trim())
            }
            className="w-full rounded-lg bg-[var(--btn-primary)] py-3 text-sm font-medium text-white hover:bg-[var(--btn-primary-hover)] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Please wait…' : activeTab === 'create' ? 'Start Room' : 'Join Room'}
          </button>
        </form>

        <div className="px-6 pb-6 flex items-start gap-2 text-xs text-[var(--text-secondary)]">
          <span className="mt-0.5 flex-shrink-0 w-4 h-4 rounded-full border border-[var(--text-secondary)] flex items-center justify-center text-[10px]">i</span>
          <p>
            Rooms are encrypted end-to-end. By creating a room, you agree to our{' '}
            <a href="#" className="text-[var(--accent)] hover:underline">Communication Safety Policy</a>.
          </p>
        </div>
      </div>

      {createdRoom && (
        <RoomCreatedToast
          roomName={createdRoom.roomName}
          roomId={createdRoom.roomId}
          onJoin={handleJoinNow}
          onCopy={handleCopyLink}
          onClose={handleCloseToast}
        />
      )}
    </>
  );
}
