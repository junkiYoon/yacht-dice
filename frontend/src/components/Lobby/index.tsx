import { useEffect, useState } from 'react';
import { getSocket } from '../../socket/socketClient';
import { OnlineSession, PublicRoom, RoomPlayer } from '../../types/online';
import './styles.css';

interface Props {
  onEnterRoom: (info: OnlineSession) => void;
  onBack: () => void;
  playerName: string;
  initialRoomCode?: string;
}

export default function Lobby({ onEnterRoom, onBack, playerName, initialRoomCode }: Props) {
  const [tab, setTab] = useState<'create' | 'join'>(initialRoomCode ? 'join' : 'create');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [roomCode, setRoomCode] = useState(initialRoomCode ?? '');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [rooms, setRooms] = useState<PublicRoom[]>([]);

  const effectiveName = playerName.trim() || '플레이어';

  useEffect(() => {
    const socket = getSocket();

    function onRoomCreated(data: {
      roomCode: string;
      playerIndex: number;
      isHost: boolean;
      players: RoomPlayer[];
      maxPlayers: number;
    }) {
      setLoading(false);
      onEnterRoom({ ...data, playerName: effectiveName });
    }

    function onRoomJoined(data: {
      roomCode: string;
      playerIndex: number;
      isHost: boolean;
      players: RoomPlayer[];
      maxPlayers: number;
    }) {
      setLoading(false);
      onEnterRoom({ ...data, playerName: effectiveName });
    }

    function onError(data: { message: string }) {
      setLoading(false);
      setError(data.message);
    }

    function onRoomsListed(data: { rooms: PublicRoom[] }) {
      setRooms(data.rooms);
    }

    function onRoomsUpdated(updatedRooms: PublicRoom[]) {
      setRooms(updatedRooms);
    }

    socket.on('room-created', onRoomCreated);
    socket.on('room-joined', onRoomJoined);
    socket.on('error', onError);
    socket.on('rooms-listed', onRoomsListed);
    socket.on('rooms-updated', onRoomsUpdated);

    socket.emit('list-rooms');

    return () => {
      socket.off('room-created', onRoomCreated);
      socket.off('room-joined', onRoomJoined);
      socket.off('error', onError);
      socket.off('rooms-listed', onRoomsListed);
      socket.off('rooms-updated', onRoomsUpdated);
    };
  }, [effectiveName, onEnterRoom]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    getSocket().emit('create-room', { maxPlayers, playerName: effectiveName });
  }

  function handleJoin(e: React.FormEvent) {
    e.preventDefault();
    if (!roomCode.trim()) {
      setError('방 코드를 입력해주세요.');
      return;
    }
    setError(null);
    setLoading(true);
    getSocket().emit('join-room', {
      roomCode: roomCode.trim().toUpperCase(),
      playerName: effectiveName,
    });
  }

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <div className="lobby-header">
          <button className="lobby-back-btn" onClick={onBack}>← 뒤로</button>
          <h1 className="lobby-title">온라인 멀티플레이</h1>
        </div>

        <div className="lobby-tabs">
          <button
            className={`lobby-tab ${tab === 'create' ? 'lobby-tab--active' : ''}`}
            onClick={() => { setTab('create'); setError(null); }}
          >
            방 만들기
          </button>
          <button
            className={`lobby-tab ${tab === 'join' ? 'lobby-tab--active' : ''}`}
            onClick={() => { setTab('join'); setError(null); }}
          >
            방 참가하기
          </button>
        </div>

        {tab === 'create' && (
          <form className="lobby-form" onSubmit={handleCreate}>
            <div className="lobby-count-row">
              <span className="lobby-label">최대 인원</span>
              <div className="lobby-count-ctrl">
                <button
                  type="button"
                  className="count-btn"
                  onClick={() => setMaxPlayers((p) => Math.max(2, p - 1))}
                  disabled={maxPlayers <= 2}
                >−</button>
                <span className="count-value">{maxPlayers}인</span>
                <button
                  type="button"
                  className="count-btn"
                  onClick={() => setMaxPlayers((p) => Math.min(6, p + 1))}
                  disabled={maxPlayers >= 6}
                >+</button>
              </div>
            </div>
            {error && <p className="lobby-error">{error}</p>}
            <button type="submit" className="lobby-submit-btn" disabled={loading}>
              {loading ? '생성 중...' : '방 만들기'}
            </button>
          </form>
        )}

        {tab === 'join' && (
          <form className="lobby-form" onSubmit={handleJoin}>
            <div className="lobby-code-field">
              <label className="lobby-label">방 코드</label>
              <input
                className="lobby-input lobby-code-input"
                type="text"
                value={roomCode}
                onChange={(e) => setRoomCode(e.target.value.toUpperCase())}
                placeholder="예: ABC123"
                maxLength={6}
                autoFocus
              />
            </div>
            {error && <p className="lobby-error">{error}</p>}
            <button type="submit" className="lobby-submit-btn" disabled={loading}>
              {loading ? '참가 중...' : '입장하기'}
            </button>
          </form>
        )}

        <div className="room-list">
          <div className="room-list-header">
            <span>공개 방 목록</span>
            <button
              type="button"
              className="room-list-refresh"
              onClick={() => getSocket().emit('list-rooms')}
            >
              새로고침
            </button>
          </div>
          {rooms.length === 0 ? (
            <p className="room-list-empty">참가 가능한 방이 없습니다</p>
          ) : (
            rooms.map((room) => (
              <button
                key={room.code}
                type="button"
                className="room-item"
                onClick={() => { setTab('join'); setRoomCode(room.code); setError(null); }}
              >
                <span className="room-item-code">{room.code}</span>
                <span className="room-item-count">{room.playerCount} / {room.maxPlayers}명</span>
              </button>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
