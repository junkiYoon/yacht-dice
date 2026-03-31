import { useCallback, useEffect, useRef, useState } from 'react';
import { gameApi } from '../../api/gameApi';
import { useGameAnnouncement } from '../../hooks/useGameAnnouncement';
import { t } from '../../i18n';
import { Category, GameState } from '../../types/game';
import { extractApiError } from '../../utils/error';
import GameLayout from '../GameLayout';
import './styles.css';

interface Props {
  playerNames: string[];
  onGameUpdate: (state: GameState) => void;
}

export default function GameBoard({ playerNames, onGameUpdate }: Props) {
  const i18n = t();
  const [gameState, setGameState] = useState<GameState | null>(null);
  const [serverPending, setServerPending] = useState(false);
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

  const handleRoll = useCallback(async () => {
    if (!gameIdRef.current || !gameState?.canRoll) return;
    setError(null);
    setServerPending(true);
    try {
      const state = await gameApi.roll(gameIdRef.current);
      update(state);
    } catch (e) {
      setError(extractApiError(e, i18n.errors.serverError));
    } finally {
      setServerPending(false);
    }
  }, [gameState?.canRoll]);

  const handleTogglePin = useCallback(async (index: number) => {
    if (!gameIdRef.current) return;
    setError(null);
    try {
      const state = await gameApi.togglePin(gameIdRef.current, index);
      update(state);
    } catch (e) {
      setError(extractApiError(e, i18n.errors.serverError));
    }
  }, []);

  const handleScore = useCallback(async (category: Category) => {
    if (!gameIdRef.current) return;
    setError(null);
    try {
      const state = await gameApi.score(gameIdRef.current, category);
      update(state);
    } catch (e) {
      setError(extractApiError(e, i18n.errors.serverError));
    }
  }, []);

  if (!gameState) {
    return (
      <div className="board-loading">
        <div className="loading-spinner" />
        <p>게임 준비 중...</p>
      </div>
    );
  }

  return (
    <GameLayout
      playerNames={playerNames}
      gameState={gameState}
      serverPending={serverPending}
      onRoll={handleRoll}
      onTogglePin={handleTogglePin}
      onScore={handleScore}
      announcement={announcement}
      error={error}
      onErrorDismiss={() => setError(null)}
    />
  );
}
