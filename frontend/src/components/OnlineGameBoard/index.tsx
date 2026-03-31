import { useEffect, useState } from 'react';
import { getSocket } from '../../socket/socketClient';
import { useGameAnnouncement } from '../../hooks/useGameAnnouncement';
import { Category, GameState } from '../../types/game';
import { OnlineSession } from '../../types/online';
import GameLayout from '../GameLayout';
import './styles.css';

interface Props {
  session: OnlineSession;
  initialGameState: GameState;
  playerNames: string[];
  onGameEnd: (state: GameState) => void;
  onDestroyed: (reason: string) => void;
}

export default function OnlineGameBoard({
  session,
  initialGameState,
  playerNames,
  onGameEnd,
  onDestroyed,
}: Props) {
  const { roomCode, playerIndex: myIndex } = session;

  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [serverPending, setServerPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { announcement, checkTurnChange } = useGameAnnouncement();

  useEffect(() => {
    const socket = getSocket();

    function onPlayerRolling() {
      // A non-active player started animating — show rolling state on our side too
      setServerPending(true);
    }

    function onPlayerRollingCancelled() {
      // The active player cancelled before committing — stop our animation
      setServerPending(false);
    }

    function onGameUpdated(data: { gameState: GameState }) {
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
    socket.on('player-rolling-cancelled', onPlayerRollingCancelled);
    socket.on('game-updated', onGameUpdated);
    socket.on('room-destroyed', onRoomDestroyed);
    socket.on('error', onError);

    return () => {
      socket.off('player-rolling', onPlayerRolling);
      socket.off('player-rolling-cancelled', onPlayerRollingCancelled);
      socket.off('game-updated', onGameUpdated);
      socket.off('room-destroyed', onRoomDestroyed);
      socket.off('error', onError);
    };
  }, [onGameEnd, onDestroyed, checkTurnChange]);

  const isMyTurn = gameState.currentPlayer === myIndex;

  function handleRoll() {
    if (!isMyTurn || !gameState.canRoll || serverPending) return;
    setError(null);
    setServerPending(true);
    getSocket().emit('roll', { roomCode });
  }

  function handleTogglePin(index: number) {
    if (!isMyTurn) return;
    setError(null);
    getSocket().emit('toggle-pin', { roomCode, index });
  }

  function handleScore(category: Category) {
    if (!isMyTurn) return;
    setError(null);
    getSocket().emit('score', { roomCode, category });
  }

  /** Notify other players that we started shaking the dice (phase 1) */
  function handleAnimationStart() {
    getSocket().emit('player-rolling', { roomCode });
  }

  /** Notify other players that we cancelled (phase 1 cancelled) */
  function handleAnimationCancel() {
    getSocket().emit('player-rolling-cancelled', { roomCode });
  }

  const { currentPlayer } = gameState;

  const notMyTurnOverlay = !isMyTurn ? (
    <div className="not-my-turn-overlay">
      <span className="not-my-turn-text">
        {playerNames[currentPlayer]}의 차례를 기다리는 중...
      </span>
    </div>
  ) : undefined;

  return (
    <GameLayout
      playerNames={playerNames}
      gameState={gameState}
      canRollOverride={isMyTurn && gameState.canRoll}
      serverPending={serverPending}
      onRoll={handleRoll}
      onTogglePin={handleTogglePin}
      onScore={handleScore}
      onAnimationStart={handleAnimationStart}
      onAnimationCancel={handleAnimationCancel}
      announcement={announcement}
      error={error}
      onErrorDismiss={() => setError(null)}
      tableOverlay={notMyTurnOverlay}
    />
  );
}
