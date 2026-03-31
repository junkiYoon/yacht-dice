import { useEffect, useRef, useState } from 'react';
import { gameApi } from '../../api/gameApi';
import { useGameAnnouncement } from '../../hooks/useGameAnnouncement';
import { t } from '../../i18n';
import { Category, GameState } from '../../types/game';
import DiceArea from '../DiceArea';
import ScoreSheet from '../ScoreSheet';
import TurnAnnouncement from '../TurnAnnouncement';
import './styles.css';

interface Props {
  playerNames: string[];
  onGameUpdate: (state: GameState) => void;
}

export default function GameBoard({ playerNames, onGameUpdate }: Props) {
  const i18n = t();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gameIdRef = useRef<string | null>(null);
  const { announcement, checkTurnChange } = useGameAnnouncement();

  useEffect(() => {
    gameApi.createGame(playerNames.length).then((state) => {
      gameIdRef.current = state.id;
      setGameState(state);
    });
  }, []);

  function update(state: GameState) {
    setGameState(state);
    checkTurnChange(state.currentPlayer, state.isFinished);
    if (state.isFinished) onGameUpdate(state);
  }

  async function handleRoll() {
    if (!gameIdRef.current || !gameState?.canRoll) return;
    setError(null);
    setRolling(true);
    try {
      const state = await gameApi.roll(gameIdRef.current);
      update(state);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? i18n.errors.serverError);
    } finally {
      setTimeout(() => setRolling(false), 700);
    }
  }

  async function handleTogglePin(index: number) {
    if (!gameIdRef.current) return;
    setError(null);
    try {
      const state = await gameApi.togglePin(gameIdRef.current, index);
      update(state);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? i18n.errors.serverError);
    }
  }

  async function handleScore(category: Category) {
    if (!gameIdRef.current || !gameState) return;
    setError(null);
    try {
      const state = await gameApi.score(gameIdRef.current, category);
      update(state);
    } catch (e: unknown) {
      const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message;
      setError(msg ?? i18n.errors.serverError);
    }
  }

  if (!gameState) {
    return (
      <div className="board-loading">
        <div className="loading-spinner" />
        <p>게임 준비 중...</p>
      </div>
    );
  }

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
          <DiceArea
            gameState={gameState}
            rolling={rolling}
            onRoll={handleRoll}
            onTogglePin={handleTogglePin}
          />
        </main>
      </div>
    </div>
  );
}
