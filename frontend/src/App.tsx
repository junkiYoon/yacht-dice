import { useState } from 'react';
import { GameState } from './types/game';
import { OnlineSession } from './types/online';
import { disconnectSocket } from './socket/socketClient';
import ModeSelect from './components/ModeSelect';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import Lobby from './components/Lobby';
import WaitingRoom from './components/WaitingRoom';
import OnlineGameBoard from './components/OnlineGameBoard';
import GameResult from './components/GameResult';

type Screen =
  | 'mode-select'
  | 'setup'
  | 'game'
  | 'lobby'
  | 'waiting'
  | 'online-game'
  | 'result';

export default function App() {
  const [screen, setScreen] = useState<Screen>('mode-select');
  const [isOnline, setIsOnline] = useState(false);

  // Local play state
  const [localPlayerNames, setLocalPlayerNames] = useState<string[]>([]);

  // Online play state
  const [session, setSession] = useState<OnlineSession | null>(null);
  const [onlinePlayerNames, setOnlinePlayerNames] = useState<string[]>([]);
  const [onlineInitialState, setOnlineInitialState] = useState<GameState | null>(null);

  // Shared result state
  const [resultState, setResultState] = useState<GameState | null>(null);
  const [resultPlayerNames, setResultPlayerNames] = useState<string[]>([]);

  /* ── Local flow ──────────────────────────────────── */
  function handleLocalStart(names: string[]) {
    setLocalPlayerNames(names);
    setIsOnline(false);
    setScreen('game');
  }

  function handleLocalGameUpdate(state: GameState) {
    if (state.isFinished) {
      setResultState(state);
      setResultPlayerNames(localPlayerNames);
      setScreen('result');
    }
  }

  /* ── Online flow ─────────────────────────────────── */
  function handleEnterRoom(info: OnlineSession) {
    setSession(info);
    setScreen('waiting');
  }

  function handleGameStart(gameState: GameState, playerNames: string[]) {
    setOnlineInitialState(gameState);
    setOnlinePlayerNames(playerNames);
    setScreen('online-game');
  }

  function handleOnlineGameEnd(state: GameState) {
    setResultState(state);
    setResultPlayerNames(onlinePlayerNames);
    setScreen('result');
  }

  function handleRoomDestroyed(reason: string) {
    disconnectSocket();
    alert(`방이 종료되었습니다.\n${reason}`);
    setSession(null);
    setOnlineInitialState(null);
    setScreen('mode-select');
  }

  /* ── Restart ─────────────────────────────────────── */
  function handleRestart() {
    if (isOnline) {
      disconnectSocket();
    }
    setSession(null);
    setOnlineInitialState(null);
    setResultState(null);
    setScreen('mode-select');
  }

  return (
    <div className="app">
      {screen === 'mode-select' && (
        <ModeSelect
          onLocal={() => setScreen('setup')}
          onOnline={() => { setIsOnline(true); setScreen('lobby'); }}
        />
      )}

      {screen === 'setup' && (
        <GameSetup onStart={handleLocalStart} onBack={() => setScreen('mode-select')} />
      )}

      {screen === 'game' && (
        <GameBoard
          playerNames={localPlayerNames}
          onGameUpdate={handleLocalGameUpdate}
        />
      )}

      {screen === 'lobby' && (
        <Lobby
          onEnterRoom={handleEnterRoom}
          onBack={() => setScreen('mode-select')}
        />
      )}

      {screen === 'waiting' && session && (
        <WaitingRoom
          session={session}
          onGameStart={handleGameStart}
          onDestroyed={handleRoomDestroyed}
        />
      )}

      {screen === 'online-game' && session && onlineInitialState && (
        <OnlineGameBoard
          session={session}
          initialGameState={onlineInitialState}
          playerNames={onlinePlayerNames}
          onGameEnd={handleOnlineGameEnd}
          onDestroyed={handleRoomDestroyed}
        />
      )}

      {screen === 'result' && resultState && (
        <GameResult
          gameState={resultState}
          playerNames={resultPlayerNames}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
