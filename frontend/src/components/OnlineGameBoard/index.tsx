import { useEffect, useRef, useState } from 'react';
import { getSocket } from '../../socket/socketClient';
import { useGameAnnouncement } from '../../hooks/useGameAnnouncement';
import { t } from '../../i18n';
import { Category, GameState } from '../../types/game';
import { OnlineSession } from '../../types/online';
import DiceArea from '../DiceArea';
import ScoreSheet from '../ScoreSheet';
import TurnAnnouncement from '../TurnAnnouncement';
import '../GameBoard/styles.css';
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
  const i18n = t();
  const { roomCode, playerIndex: myIndex } = session;

  const [gameState, setGameState] = useState<GameState>(initialGameState);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { announcement, checkTurnChange } = useGameAnnouncement();
  const initializedRef = useRef(false);

  useEffect(() => {
    // Initialise prevPlayer without triggering an announcement on mount
    initializedRef.current = true;

    const socket = getSocket();

    function onGameUpdated(data: { gameState: GameState }) {
      const state = data.gameState;
      setGameState(state);
      setRolling(false);
      checkTurnChange(state.currentPlayer, state.isFinished);
      if (state.isFinished) onGameEnd(state);
    }

    function onRoomDestroyed(data: { reason: string }) {
      onDestroyed(data.reason);
    }

    function onError(data: { message: string }) {
      setRolling(false);
      setError(data.message);
    }

    socket.on('game-updated', onGameUpdated);
    socket.on('room-destroyed', onRoomDestroyed);
    socket.on('error', onError);

    return () => {
      socket.off('game-updated', onGameUpdated);
      socket.off('room-destroyed', onRoomDestroyed);
      socket.off('error', onError);
    };
  }, [onGameEnd, onDestroyed, checkTurnChange]);

  const isMyTurn = gameState.currentPlayer === myIndex;

  function handleRoll() {
    if (!isMyTurn || !gameState.canRoll || rolling) return;
    setError(null);
    setRolling(true);
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

  const diceAreaState: GameState = {
    ...gameState,
    canRoll: isMyTurn && gameState.canRoll,
  };

  const { currentPlayer } = gameState;

  return (
    <div className="game-board">
      {announcement && (
        <TurnAnnouncement
          key={announcement.key}
          playerName={playerNames[announcement.player]}
          playerIndex={announcement.player}
        />
      )}

      {error && (
        <div className="board-error" onClick={() => setError(null)}>
          ⚠️ {error}
        </div>
      )}

      <div className="board-layout">
        <aside className="board-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">{i18n.title}</span>
            <span className={`turn-badge turn-badge--p${Math.min(currentPlayer + 1, 6)}`}>
              {i18n.game.turn(playerNames[currentPlayer])}
            </span>
          </div>
          <div className="sidebar-sheet">
            <ScoreSheet
              playerNames={playerNames}
              gameState={gameState}
              onScore={handleScore}
            />
          </div>
        </aside>

        <main className="board-table">
          {!isMyTurn && (
            <div className="not-my-turn-overlay">
              <span className="not-my-turn-text">
                {playerNames[currentPlayer]}의 차례를 기다리는 중...
              </span>
            </div>
          )}
          <DiceArea
            gameState={diceAreaState}
            rolling={rolling}
            onRoll={handleRoll}
            onTogglePin={handleTogglePin}
          />
        </main>
      </div>
    </div>
  );
}
