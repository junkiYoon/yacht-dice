import { useEffect, useRef, useState } from 'react';
import { gameApi } from '../../api/gameApi';
import { t } from '../../i18n';
import { Category, GameState } from '../../types/game';
import DiceArea from '../DiceArea';
import ScoreSheet from '../ScoreSheet';
import './styles.css';

interface Props {
  playerNames: [string, string];
  onGameUpdate: (state: GameState) => void;
}

export default function GameBoard({ playerNames, onGameUpdate }: Props) {
  const i18n = t();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [rolling, setRolling] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gameIdRef = useRef<string | null>(null);

  useEffect(() => {
    gameApi.createGame().then((state) => {
      gameIdRef.current = state.id;
      setGameState(state);
    });
  }, []);

  function update(state: GameState) {
    setGameState(state);
    if (state.isFinished) {
      onGameUpdate(state);
    }
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
      setTimeout(() => setRolling(false), 350);
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

  const { currentPlayer, rollCount } = gameState;
  const currentName = playerNames[currentPlayer];

  return (
    <div className="game-board">
      <header className="board-header">
        <h1 className="board-title">{i18n.title}</h1>
        <div className={`turn-indicator turn-indicator--p${currentPlayer + 1}`}>
          {i18n.game.turn(currentName)}
        </div>
      </header>

      {error && (
        <div className="board-error" onClick={() => setError(null)}>
          ⚠️ {error}
        </div>
      )}

      <main className="board-main">
        <section className="board-scores">
          <ScoreSheet
            playerIndex={0}
            playerName={playerNames[0]}
            scores={gameState.players[0]}
            isCurrentPlayer={currentPlayer === 0}
            potentialScores={currentPlayer === 0 ? gameState.potentialScores : null}
            onScore={handleScore}
            rollCount={rollCount}
            gameState={gameState}
          />
          <ScoreSheet
            playerIndex={1}
            playerName={playerNames[1]}
            scores={gameState.players[1]}
            isCurrentPlayer={currentPlayer === 1}
            potentialScores={currentPlayer === 1 ? gameState.potentialScores : null}
            onScore={handleScore}
            rollCount={rollCount}
            gameState={gameState}
          />
        </section>

        <section className="board-dice-section">
          <DiceArea
            gameState={gameState}
            rolling={rolling}
            onRoll={handleRoll}
            onTogglePin={handleTogglePin}
          />
        </section>
      </main>
    </div>
  );
}
