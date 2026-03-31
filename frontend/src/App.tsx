import { useState } from 'react';
import { GameState } from './types/game';
import GameSetup from './components/GameSetup';
import GameBoard from './components/GameBoard';
import GameResult from './components/GameResult';

type Screen = 'setup' | 'game' | 'result';

export default function App() {
  const [screen, setScreen] = useState<Screen>('setup');
  const [playerNames, setPlayerNames] = useState<string[]>(['플레이어 1', '플레이어 2']);
  const [gameState, setGameState] = useState<GameState | null>(null);

  function handleStart(names: string[]) {
    setPlayerNames(names);
    setScreen('game');
  }

  function handleGameUpdate(state: GameState) {
    setGameState(state);
    if (state.isFinished) {
      setScreen('result');
    }
  }

  function handleRestart() {
    setGameState(null);
    setScreen('setup');
  }

  return (
    <div className="app">
      {screen === 'setup' && (
        <GameSetup onStart={handleStart} />
      )}
      {screen === 'game' && (
        <GameBoard
          playerNames={playerNames}
          onGameUpdate={handleGameUpdate}
        />
      )}
      {screen === 'result' && gameState && (
        <GameResult
          gameState={gameState}
          playerNames={playerNames}
          onRestart={handleRestart}
        />
      )}
    </div>
  );
}
