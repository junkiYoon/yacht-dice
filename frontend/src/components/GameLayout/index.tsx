import { useState } from 'react';
import { t } from '../../i18n';
import { AnnouncementState } from '../../hooks/useGameAnnouncement';
import { Category, GameState } from '../../types/game';
import DiceArea from '../DiceArea';
import HelpModal from '../HelpModal';
import ScoreSheet from '../ScoreSheet';
import TurnAnnouncement from '../TurnAnnouncement';
import '../GameBoard/styles.css';

interface Props {
  playerNames: string[];
  /** Full game state — used for ScoreSheet and turn badge */
  gameState: GameState;
  /**
   * Overrides canRoll for the DiceArea only.
   * Used in online mode to prevent non-active players from rolling.
   * Defaults to gameState.canRoll when omitted.
   */
  canRollOverride?: boolean;
  serverPending: boolean;
  onRoll: () => void;
  onTogglePin: (index: number) => void;
  onScore: (category: Category) => void;
  /** Called when dice start shaking locally (before server commit) */
  onAnimationStart?: () => void;
  /** Called when a local roll animation is cancelled */
  onAnimationCancel?: () => void;
  announcement: AnnouncementState | null;
  error: string | null;
  onErrorDismiss: () => void;
  /** Optional overlay rendered on top of the dice table (e.g. "not your turn") */
  tableOverlay?: React.ReactNode;
}

export default function GameLayout({
  playerNames,
  gameState,
  canRollOverride,
  serverPending,
  onRoll,
  onTogglePin,
  onScore,
  onAnimationStart,
  onAnimationCancel,
  announcement,
  error,
  onErrorDismiss,
  tableOverlay,
}: Props) {
  const i18n = t();
  const [showHelp, setShowHelp] = useState(false);

  const { currentPlayer } = gameState;

  const diceGameState: GameState =
    canRollOverride !== undefined
      ? { ...gameState, canRoll: canRollOverride }
      : gameState;

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
        <div className="board-error" onClick={onErrorDismiss}>
          ⚠️ {error}
        </div>
      )}

      {showHelp && <HelpModal onClose={() => setShowHelp(false)} />}

      <div className="board-layout">
        <aside className="board-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">{i18n.title}</span>
            <div className="sidebar-header-right">
              <span className={`turn-badge turn-badge--p${Math.min(currentPlayer + 1, 6)}`}>
                {i18n.game.turn(playerNames[currentPlayer])}
              </span>
              <button
                className="help-btn"
                onClick={() => setShowHelp(true)}
                title="규칙 보기"
              >
                ?
              </button>
            </div>
          </div>
          <div className="sidebar-sheet">
            <ScoreSheet
              playerNames={playerNames}
              gameState={gameState}
              onScore={onScore}
            />
          </div>
        </aside>

        <main className="board-table">
          {tableOverlay}
          <DiceArea
            gameState={diceGameState}
            serverPending={serverPending}
            onRoll={onRoll}
            onTogglePin={onTogglePin}
            onAnimationStart={onAnimationStart}
            onAnimationCancel={onAnimationCancel}
          />
        </main>
      </div>
    </div>
  );
}
