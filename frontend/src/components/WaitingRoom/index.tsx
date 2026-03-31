import { useEffect, useState } from 'react';
import { getSocket } from '../../socket/socketClient';
import { OnlineSession, RoomPlayer } from '../../types/online';
import { GameState } from '../../types/game';
import './styles.css';

interface Props {
  session: OnlineSession;
  onGameStart: (gameState: GameState, playerNames: string[]) => void;
  onDestroyed: (reason: string) => void;
}

export default function WaitingRoom({ session, onGameStart, onDestroyed }: Props) {
  const [players, setPlayers] = useState<RoomPlayer[]>(session.players);
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { roomCode, isHost, maxPlayers } = session;

  // Update URL on mount; restore on unmount
  useEffect(() => {
    history.replaceState(null, '', `?room=${roomCode}`);
    return () => {
      history.replaceState(null, '', window.location.pathname);
    };
  }, [roomCode]);

  useEffect(() => {
    const socket = getSocket();

    function onRoomUpdated(data: { players: RoomPlayer[] }) {
      setPlayers(data.players);
    }

    function onGameStarted(data: { gameState: GameState; playerNames: string[] }) {
      onGameStart(data.gameState, data.playerNames);
    }

    function onRoomDestroyed(data: { reason: string }) {
      onDestroyed(data.reason);
    }

    function onError(data: { message: string }) {
      setError(data.message);
    }

    socket.on('room-updated', onRoomUpdated);
    socket.on('game-started', onGameStarted);
    socket.on('room-destroyed', onRoomDestroyed);
    socket.on('error', onError);

    return () => {
      socket.off('room-updated', onRoomUpdated);
      socket.off('game-started', onGameStarted);
      socket.off('room-destroyed', onRoomDestroyed);
      socket.off('error', onError);
    };
  }, [onGameStart, onDestroyed]);

  function handleCopy() {
    const shareUrl = `${window.location.origin}?room=${roomCode}`;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function handleStart() {
    setError(null);
    getSocket().emit('start-game', { roomCode });
  }

  const canStart = isHost && players.length >= 2;

  return (
    <div className="waiting-container">
      <div className="waiting-card">
        <h2 className="waiting-title">대기실</h2>

        <div className="room-code-box">
          <span className="room-code-label">방 코드</span>
          <div className="room-code-row">
            <span className="room-code">{roomCode}</span>
            <button className="copy-btn" onClick={handleCopy}>
              {copied ? '✓ 링크 복사됨' : '링크 복사'}
            </button>
          </div>
          <span className="room-code-hint">친구에게 이 코드를 알려주세요</span>
        </div>

        <div className="waiting-players">
          <div className="players-header">
            <span className="players-label">참가자</span>
            <span className="players-count">{players.length} / {maxPlayers}</span>
          </div>
          <ul className="players-list">
            {players.map((p) => (
              <li key={p.socketId} className={`player-item player-item--p${Math.min(p.playerIndex + 1, 6)}`}>
                <span className="player-item-name">{p.name}</span>
                {p.playerIndex === 0 && (
                  <span className="player-item-badge">방장</span>
                )}
                {p.socketId === getSocket().id && (
                  <span className="player-item-me">나</span>
                )}
              </li>
            ))}
            {Array.from({ length: maxPlayers - players.length }, (_, i) => (
              <li key={`empty-${i}`} className="player-item player-item--empty">
                <span className="player-item-name">대기 중...</span>
              </li>
            ))}
          </ul>
        </div>

        {error && <p className="waiting-error">{error}</p>}

        {isHost ? (
          <button
            className="start-btn"
            onClick={handleStart}
            disabled={!canStart}
          >
            {players.length < 2 ? '한 명 이상 더 필요합니다' : '게임 시작'}
          </button>
        ) : (
          <p className="waiting-hint">방장이 게임을 시작할 때까지 기다려주세요...</p>
        )}
      </div>
    </div>
  );
}
