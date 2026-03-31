import { useEffect, useState } from 'react';
import { getSocket } from '../../socket/socketClient';
import { OnlineSession, RoomPlayer } from '../../types/online';
import './styles.css';

interface Props {
  onEnterRoom: (info: OnlineSession) => void;
  onBack: () => void;
}

export default function Lobby({ onEnterRoom, onBack }: Props) {
  const [tab, setTab] = useState<'create' | 'join'>('create');
  const [playerName, setPlayerName] = useState('');
  const [maxPlayers, setMaxPlayers] = useState(2);
  const [roomCode, setRoomCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

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
      onEnterRoom({ ...data, playerName: playerName.trim() || '플레이어 1' });
    }

    function onRoomJoined(data: {
      roomCode: string;
      playerIndex: number;
      isHost: boolean;
      players: RoomPlayer[];
      maxPlayers: number;
    }) {
      setLoading(false);
      onEnterRoom({ ...data, playerName: playerName.trim() || `플레이어 ${data.playerIndex + 1}` });
    }

    function onError(data: { message: string }) {
      setLoading(false);
      setError(data.message);
    }

    socket.on('room-created', onRoomCreated);
    socket.on('room-joined', onRoomJoined);
    socket.on('error', onError);

    return () => {
      socket.off('room-created', onRoomCreated);
      socket.off('room-joined', onRoomJoined);
      socket.off('error', onError);
    };
  }, [playerName, onEnterRoom]);

  function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    getSocket().emit('create-room', {
      maxPlayers,
      playerName: playerName.trim() || '플레이어 1',
    });
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
      playerName: playerName.trim() || '플레이어',
    });
  }

  return (
    <div className="lobby-container">
      <div className="lobby-card">
        <div className="lobby-header">
          <button className="lobby-back-btn" onClick={onBack}>← 뒤로</button>
          <h1 className="lobby-title">온라인 멀티플레이</h1>
        </div>

        <div className="lobby-name-field">
          <label className="lobby-label">내 이름</label>
          <input
            className="lobby-input"
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            placeholder="이름을 입력하세요"
            maxLength={16}
            autoFocus
          />
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
              />
            </div>
            {error && <p className="lobby-error">{error}</p>}
            <button type="submit" className="lobby-submit-btn" disabled={loading}>
              {loading ? '참가 중...' : '입장하기'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
