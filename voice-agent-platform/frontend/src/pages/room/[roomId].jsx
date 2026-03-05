import { useRouter } from 'next/router';
import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../../services/socket';
import { SOCKET_EVENTS } from '../../constants';
import CallRoom from '../../components/CallRoom';

/**
 * Room page: join by roomId, show CallRoom; re-join on socket reconnect after disconnect.
 */
export default function RoomPage() {
  const router = useRouter();
  const { roomId } = router.query;
  const [initialParticipants, setInitialParticipants] = useState([]);
  const [userName, setUserName] = useState('');
  const [failed, setFailed] = useState(false);
  const hasDisconnectedRef = useRef(false);

  useEffect(() => {
    if (!roomId) return;

    const socket = getSocket();
    const doJoin = () => {
      socket.emit(SOCKET_EVENTS.ROOM_JOIN, { roomId, userName: undefined }, (res) => {
        if (res?.success) {
          setInitialParticipants(res.participants || []);
          setUserName(res.userName || '');
          setFailed(false);
        } else {
          setFailed(true);
        }
      });
    };

    if (socket.connected) doJoin();
    else socket.once('connect', doJoin);

    const onDisconnect = () => {
      hasDisconnectedRef.current = true;
    };
    const onConnect = () => {
      if (hasDisconnectedRef.current && roomId) {
        hasDisconnectedRef.current = false;
        doJoin();
      }
    };
    socket.on('disconnect', onDisconnect);
    socket.on('connect', onConnect);

    return () => {
      socket.off('disconnect', onDisconnect);
      socket.off('connect', onConnect);
    };
  }, [roomId]);

  if (!roomId) {
    return (
      <main className="min-h-[100dvh] flex items-center justify-center p-4">
        <p className="text-slate-400 text-sm sm:text-base">Loading…</p>
      </main>
    );
  }

  if (failed) {
    return (
      <main className="min-h-[100dvh] flex flex-col items-center justify-center p-4">
        <p className="text-red-400 mb-4 text-sm sm:text-base text-center">Could not join room. It may be full or invalid.</p>
        <button
          type="button"
          onClick={() => router.push('/')}
          className="rounded-lg bg-slate-600 px-4 py-2.5 text-white min-h-[44px]"
        >
          Back to home
        </button>
      </main>
    );
  }

  return (
    <main className="min-h-screen">
      <CallRoom roomId={roomId} initialParticipants={initialParticipants} userName={userName} />
    </main>
  );
}
