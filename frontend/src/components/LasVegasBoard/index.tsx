import { useEffect, useRef, useState } from 'react';
import { lasVegasApi } from '../../api/gameApi';
import { useGameAnnouncement } from '../../hooks/useGameAnnouncement';
import { t } from '../../i18n';
import { LasVegasState } from '../../types/lasVegas';
import { extractApiError } from '../../utils/error';
import LasVegasLayout from '../LasVegasLayout';
import '../GameBoard/styles.css';

interface Props {
  playerNames: string[];
  rounds: number;
  onGameUpdate: (state: LasVegasState) => void;
}

export default function LasVegasBoard({ playerNames, rounds, onGameUpdate }: Props) {
  const i18n = t();
  const [gameState, setGameState] = useState<LasVegasState | null>(null);
  const [serverPending, setServerPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const gameIdRef = useRef<string | null>(null);
  const { announcement, checkTurnChange } = useGameAnnouncement();

  useEffect(() => {
    lasVegasApi
      .createGame(playerNames.length, rounds)
      .then((state) => {
        gameIdRef.current = state.id;
        setGameState(state);
      })
      .catch((e) => setError(extractApiError(e, i18n.errors.serverError)));
  }, []);

  async function send(request: (id: string) => Promise<LasVegasState>) {
    if (!gameIdRef.current || serverPending) return;
    setError(null);
    setServerPending(true);
    try {
      const state = await request(gameIdRef.current);
      setGameState(state);
      checkTurnChange(state.currentPlayer, state.isFinished);
      if (state.isFinished) onGameUpdate(state);
    } catch (e) {
      setError(extractApiError(e, i18n.errors.serverError));
    } finally {
      setServerPending(false);
    }
  }

  if (!gameState) {
    return (
      <div className="board-loading">
        <div className="loading-spinner" />
        <p>{error ?? '게임 준비 중...'}</p>
      </div>
    );
  }

  return (
    <LasVegasLayout
      playerNames={playerNames}
      gameState={gameState}
      canAct
      serverPending={serverPending}
      onRoll={() => send(lasVegasApi.roll)}
      onPlace={(value) => send((id) => lasVegasApi.place(id, value))}
      announcement={announcement}
      error={error}
      onErrorDismiss={() => setError(null)}
    />
  );
}
