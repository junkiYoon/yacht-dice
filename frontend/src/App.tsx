import { useCallback, useState } from 'react';
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
import ProfileBadge from './components/ProfileBadge';

type Screen =
  | 'nickname'
  | 'mode-select'
  | 'setup'
  | 'game'
  | 'lobby'
  | 'waiting'
  | 'online-game'
  | 'result';

const SCREENS_WITH_PROFILE: Screen[] = ['mode-select', 'setup', 'lobby', 'waiting'];

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
    setScreen(pendingRoomCode ? 'lobby' : 'mode-select');
  }

  function handleNicknameChange(name: string) {
    setNickname(name);
  }

  /* ── Local flow ──────────────────────────────────── */
  function handleLocalStart(names: string[]) {
    setLocalPlayerNames(names);
    setIsOnline(false);
    setScreen('game');
  }

  // useCallback: localPlayerNames is a dep because it's captured in the callback body
  const handleLocalGameUpdate = useCallback((state: GameState) => {
    if (state.isFinished) {
      setResultState(state);
      setResultPlayerNames(localPlayerNames);
      setScreen('result');
    }
  }, [localPlayerNames]);

  /* ── Online flow ─────────────────────────────────── */
  // useCallback with no deps: only uses stable setters
  const handleEnterRoom = useCallback((info: OnlineSession) => {
    setSession(info);
    setScreen('waiting');
  }, []);

  const handleGameStart = useCallback((gameState: GameState, playerNames: string[]) => {
    setOnlineInitialState(gameState);
    setOnlinePlayerNames(playerNames);
    setScreen('online-game');
  }, []);

  const handleOnlineGameEnd = useCallback((state: GameState) => {
    setResultState(state);
    setResultPlayerNames(onlinePlayerNames);
    setScreen('result');
  }, [onlinePlayerNames]);

  const handleRoomDestroyed = useCallback((reason: string) => {
    disconnectSocket();
    alert(`방이 종료되었습니다.\n${reason}`);
    setSession(null);
    setOnlineInitialState(null);
    setScreen('mode-select');
  }, []);

  const handleLeaveWaiting = useCallback(() => {
    disconnectSocket();
    setSession(null);
    setScreen('mode-select');
  }, []);

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
      {SCREENS_WITH_PROFILE.includes(screen) && (
        <ProfileBadge nickname={nickname} onNicknameChange={handleNicknameChange} />
      )}

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
          playerName={nickname}
          initialRoomCode={pendingRoomCode ?? undefined}
        />
      )}

      {screen === 'waiting' && session && (
        <WaitingRoom
          session={session}
          onGameStart={handleGameStart}
          onDestroyed={handleRoomDestroyed}
          onLeave={handleLeaveWaiting}
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
