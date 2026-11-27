import { useEffect, useState } from 'react';
import { getSocket } from '../../socket/socketClient';
import { useGameAnnouncement } from '../../hooks/useGameAnnouncement';
import { LasVegasState } from '../../types/lasVegas';
import { OnlineSession } from '../../types/online';
import LasVegasLayout from '../LasVegasLayout';
import '../OnlineGameBoard/styles.css';

interface Props {
  session: OnlineSession;
  initialGameState: LasVegasState;
  playerNames: string[];
  onGameEnd: (state: LasVegasState) => void;
  onDestroyed: (reason: string) => void;
}

export default function OnlineLasVegasBoard({
  session,
  initialGameState,
  playerNames,
  onGameEnd,
  onDestroyed,
}: Props) {
  const { roomCode, playerIndex: myIndex } = session;

  const [gameState, setGameState] = useState<LasVegasState>(initialGameState);
  const [serverPending, setServerPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { announcement, checkTurnChange } = useGameAnnouncement();

  useEffect(() => {
    const socket = getSocket();

    function onPlayerRolling() {
      setServerPending(true);
    }

    function onGameUpdated(data: { gameState: LasVegasState }) {
      const state = data.gameState;
      setGameState(state);
      setServerPending(false);
      checkTurnChange(state.currentPlayer, state.isFinished);
      if (state.isFinished) onGameEnd(state);
    }

    function onRoomDestroyed(data: { reason: string }) {
      onDestroyed(data.reason);
    }

    function onError(data: { message: string }) {
      setServerPending(false);
      setError(data.message);
    }

    socket.on('player-rolling', onPlayerRolling);
    socket.on('game-updated', onGameUpdated);
    socket.on('room-destroyed', onRoomDestroyed);
    socket.on('error', onError);

    return () => {
      socket.off('player-rolling', onPlayerRolling);
      socket.off('game-updated', onGameUpdated);
      socket.off('room-destroyed', onRoomDestroyed);
      socket.off('error', onError);
    };
  }, [onGameEnd, onDestroyed, checkTurnChange]);

  const isMyTurn = gameState.currentPlayer === myIndex;

  function handleRoll() {
    setError(null);
    setServerPending(true);
    const socket = getSocket();
    socket.emit('player-rolling', { roomCode });
    socket.emit('roll', { roomCode });
  }

  function handlePlace(value: number) {
    setError(null);
    setServerPending(true);
    getSocket().emit('place', { roomCode, value });
  }

  const notMyTurnOverlay = !isMyTurn ? (
    <div className="not-my-turn-overlay">
      <span className="not-my-turn-text">
        {playerNames[gameState.currentPlayer]}의 차례를 기다리는 중...
      </span>
    </div>
  ) : undefined;

  return (
    <LasVegasLayout
      playerNames={playerNames}
      gameState={gameState}
      canAct={isMyTurn}
      serverPending={serverPending}
      onRoll={handleRoll}
      onPlace={handlePlace}
      announcement={announcement}
      error={error}
      onErrorDismiss={() => setError(null)}
      tableOverlay={notMyTurnOverlay}
    />
  );
}
