import { t } from '../../i18n';
import { Category, GameState, PlayerScores } from '../../types/game';
import './styles.css';

const UPPER_CATEGORIES: Category[] = ['aces', 'deuces', 'threes', 'fours', 'fives', 'sixes'];
const LOWER_CATEGORIES: Category[] = ['choice', 'fourOfKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yacht'];

interface Props {
  playerIndex: 0 | 1;
  playerName: string;
  scores: PlayerScores;
  isCurrentPlayer: boolean;
  potentialScores: Record<Category, number> | null;
  onScore: (category: Category) => void;
  rollCount: number;
  gameState: GameState;
}

function ScoreRow({
  category,
  scores,
  isCurrentPlayer,
  potentialScores,
  rollCount,
  onScore,
}: {
  category: Category;
  scores: PlayerScores;
  isCurrentPlayer: boolean;
  potentialScores: Record<Category, number> | null;
  rollCount: number;
  onScore: (c: Category) => void;
}) {
  const i18n = t();
  const label = i18n.categories[category];
  const scored = scores[category];
  const potential = potentialScores?.[category];
  const canScore = isCurrentPlayer && scored === null && rollCount > 0;

  return (
    <tr
      className={[
        'score-row',
        scored !== null ? 'score-row--scored' : '',
        canScore ? 'score-row--available' : '',
      ].join(' ')}
      onClick={() => canScore && onScore(category)}
      title={canScore ? `${label}: ${potential ?? 0}점` : undefined}
    >
      <td className="score-label">{label}</td>
      <td className="score-value">
        {scored !== null ? (
          <span className="score-final">{scored}</span>
        ) : canScore && potential !== undefined ? (
          <span className="score-potential">{potential}</span>
        ) : (
          <span className="score-empty">—</span>
        )}
      </td>
    </tr>
  );
}

export default function ScoreSheet({
  playerIndex,
  playerName,
  scores,
  isCurrentPlayer,
  potentialScores,
  onScore,
  rollCount,
  gameState,
}: Props) {
  const i18n = t();
  const colorClass = playerIndex === 0 ? 'sheet--p1' : 'sheet--p2';

  const scoredCount = Object.values(gameState.players[playerIndex]).filter(
    (v, i) => i < 12 && v !== null
  ).length;

  return (
    <div className={`score-sheet ${colorClass} ${isCurrentPlayer ? 'sheet--active' : ''}`}>
      <div className="sheet-header">
        <span className="sheet-player-name">{playerName}</span>
        {isCurrentPlayer && <span className="sheet-turn-badge">현재 차례</span>}
        <span className="sheet-progress">{i18n.game.round(scoredCount)}</span>
      </div>

      <table className="score-table">
        <tbody>
          <tr className="score-section-header">
            <td colSpan={2}>{i18n.scoreSheet.upper}</td>
          </tr>
          {UPPER_CATEGORIES.map((cat) => (
            <ScoreRow
              key={cat}
              category={cat}
              scores={scores}
              isCurrentPlayer={isCurrentPlayer}
              potentialScores={potentialScores}
              rollCount={rollCount}
              onScore={onScore}
            />
          ))}
          <tr className="score-row score-bonus-row">
            <td className="score-label">
              {i18n.categories.bonus}
              <span className="bonus-note">{i18n.scoreSheet.bonusNote}</span>
            </td>
            <td className="score-value">
              <span className={`score-final ${scores.bonus > 0 ? 'bonus-earned' : ''}`}>
                {scores.bonus > 0 ? `+${scores.bonus}` : `${scores.upperTotal} / 63`}
              </span>
            </td>
          </tr>

          <tr className="score-section-header">
            <td colSpan={2}>{i18n.scoreSheet.lower}</td>
          </tr>
          {LOWER_CATEGORIES.map((cat) => (
            <ScoreRow
              key={cat}
              category={cat}
              scores={scores}
              isCurrentPlayer={isCurrentPlayer}
              potentialScores={potentialScores}
              rollCount={rollCount}
              onScore={onScore}
            />
          ))}
        </tbody>
        <tfoot>
          <tr className="score-total-row">
            <td>{i18n.scoreSheet.total}</td>
            <td className="score-total-value">{scores.total}</td>
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
