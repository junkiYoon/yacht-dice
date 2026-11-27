import { useCallback, useState } from 'react';
import { GameType } from './types/game';
import { AnyGameState, isLasVegasState, LAS_VEGAS_ROUNDS } from './types/lasVegas';
import { OnlineSession } from './types/online';
import { disconnectSocket } from './socket/socketClient';
import NicknamePage from './components/NicknamePage';
import GameSelect from './components/GameSelect';
import ModeSelect from './components/ModeSelect';
import LasVegasBoard from './components/LasVegasBoard';
import OnlineLasVegasBoard from './components/OnlineLasVegasBoard';
import LasVegasResult from './components/LasVegasResult';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import Lobby from './components/Lobby';
import WaitingRoom from './components/WaitingRoom';
import OnlineGameBoard from './components/OnlineGameBoard';
import GameResult from './components/GameResult';
import ProfileBadge from './components/ProfileBadge';

type Screen =
  | 'nickname'
  | 'game-select'
  | 'mode-select'
  | 'setup'
  | 'game'
  | 'lobby'
  | 'waiting'
  | 'online-game'
  | 'result';

const SCREENS_WITH_PROFILE: Screen[] = ['game-select', 'mode-select', 'setup', 'lobby', 'waiting'];

function getInitialScreen(nickname: string | null, pendingRoomCode: string | null): Screen {
  if (!nickname) return 'nickname';
  if (pendingRoomCode) return 'lobby';
  return 'game-select';
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
  const [gameType, setGameType] = useState<GameType>('yacht');

  // Local play state
  const [localPlayerNames, setLocalPlayerNames] = useState<string[]>([]);
  const [localRounds, setLocalRounds] = useState(LAS_VEGAS_ROUNDS.default);

  // Online play state
  const [session, setSession] = useState<OnlineSession | null>(null);
  const [onlinePlayerNames, setOnlinePlayerNames] = useState<string[]>([]);
  const [onlineInitialState, setOnlineInitialState] = useState<AnyGameState | null>(null);

  // Shared result state
  const [resultState, setResultState] = useState<AnyGameState | null>(null);
  const [resultPlayerNames, setResultPlayerNames] = useState<string[]>([]);

  /* ── Nickname flow ───────────────────────────────── */
  function handleNicknameConfirm(name: string) {
    setNickname(name);
    setScreen(pendingRoomCode ? 'lobby' : 'game-select');
  }

  function handleGameSelect(type: GameType) {
    setGameType(type);
    setScreen('mode-select');
  }

  function handleNicknameChange(name: string) {
    setNickname(name);
  }

  /* ── Local flow ──────────────────────────────────── */
  function handleLocalStart(names: string[], rounds: number) {
    setLocalPlayerNames(names);
    setLocalRounds(rounds);
    setIsOnline(false);
    setScreen('game');
  }

  // useCallback: localPlayerNames is a dep because it's captured in the callback body
  const handleLocalGameUpdate = useCallback((state: AnyGameState) => {
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
    setGameType(info.gameType);
    setScreen('waiting');
  }, []);

  const handleGameStart = useCallback((gameState: AnyGameState, playerNames: string[]) => {
    setOnlineInitialState(gameState);
    setOnlinePlayerNames(playerNames);
    setScreen('online-game');
  }, []);

  const handleOnlineGameEnd = useCallback((state: AnyGameState) => {
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

      {screen === 'game-select' && <GameSelect onSelect={handleGameSelect} />}

      {screen === 'mode-select' && (
        <ModeSelect
          gameType={gameType}
          onLocal={() => setScreen('setup')}
          onOnline={() => { setIsOnline(true); setScreen('lobby'); }}
          onBack={() => setScreen('game-select')}
        />
      )}

      {screen === 'setup' && (
        <GameSetup
          gameType={gameType}
          onStart={handleLocalStart}
          onBack={() => setScreen('mode-select')}
          defaultName={nickname}
        />
      )}

      {screen === 'game' && (gameType === 'lasVegas' ? (
        <LasVegasBoard
          playerNames={localPlayerNames}
          rounds={localRounds}
          onGameUpdate={handleLocalGameUpdate}
        />
      ) : (
        <GameBoard
          playerNames={localPlayerNames}
          onGameUpdate={handleLocalGameUpdate}
        />
      ))}

      {screen === 'lobby' && (
        <Lobby
          gameType={gameType}
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

      {screen === 'online-game' && session && onlineInitialState && (isLasVegasState(onlineInitialState) ? (
        <OnlineLasVegasBoard
          session={session}
          initialGameState={onlineInitialState}
          playerNames={onlinePlayerNames}
          onGameEnd={handleOnlineGameEnd}
          onDestroyed={handleRoomDestroyed}
        />
      ) : (
        <OnlineGameBoard
          session={session}
          initialGameState={onlineInitialState}
          playerNames={onlinePlayerNames}
          onGameEnd={handleOnlineGameEnd}
          onDestroyed={handleRoomDestroyed}
        />
      ))}

      {screen === 'result' && resultState && (isLasVegasState(resultState) ? (
        <LasVegasResult
          gameState={resultState}
          playerNames={resultPlayerNames}
          onRestart={handleRestart}
        />
      ) : (
        <GameResult
          gameState={resultState}
          playerNames={resultPlayerNames}
          onRestart={handleRestart}
        />
      ))}
    </div>
  );
}
