import { useState } from 'react';
import { GameState } from './types/game';
import { OnlineSession } from './types/online';
import { disconnectSocket } from './socket/socketClient';
import NicknamePage from './components/NicknamePage';
import ModeSelect from './components/ModeSelect';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import Lobby from './components/Lobby';
import WaitingRoom from './components/WaitingRoom';
import OnlineGameBoard from './components/OnlineGameBoard';
import GameResult from './components/GameResult';

type Screen =
  | 'nickname'
  | 'mode-select'
  | 'setup'
  | 'game'
  | 'lobby'
  | 'waiting'
  | 'online-game'
  | 'result';

function getInitialScreen(nickname: string | null, pendingRoomCode: string | null): Screen {
  if (!nickname) return 'nickname';
  if (pendingRoomCode) return 'lobby';
  return 'mode-select';
}

export default function App() {
  const [nickname, setNickname] = useState<string>(() => localStorage.getItem('nickname') ?? '');
  const [pendingRoomCode] = useState<string | null>(() => {
    const params = new URLSearchParams(window.location.search);
    return params.get('room');
  });

  const [screen, setScreen] = useState<Screen>(() =>
    getInitialScreen(localStorage.getItem('nickname'), new URLSearchParams(window.location.search).get('room'))
  );
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

  /* ── Nickname flow ───────────────────────────────── */
  function handleNicknameConfirm(name: string) {
    setNickname(name);
    if (pendingRoomCode) {
      setScreen('lobby');
    } else {
      setScreen('mode-select');
    }
  }

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
      {screen === 'nickname' && (
        <NicknamePage onConfirm={handleNicknameConfirm} />
      )}

      {screen === 'mode-select' && (
        <ModeSelect
          onLocal={() => setScreen('setup')}
          onOnline={() => { setIsOnline(true); setScreen('lobby'); }}
        />
      )}

      {screen === 'setup' && (
        <GameSetup
          onStart={handleLocalStart}
          onBack={() => setScreen('mode-select')}
          defaultName={nickname}
        />
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
          defaultPlayerName={nickname}
          initialRoomCode={pendingRoomCode ?? undefined}
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
