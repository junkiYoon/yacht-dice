import { t } from '../../i18n';
import { Category, GameState, PlayerScores } from '../../types/game';
import './styles.css';

const UPPER_CATEGORIES: Category[] = ['aces', 'deuces', 'threes', 'fours', 'fives', 'sixes'];
const LOWER_CATEGORIES: Category[] = ['choice', 'fourOfKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yacht'];
interface Props {
  playerNames: string[];
  gameState: GameState;
  onScore: (category: Category) => void;
}

function ScoreCell({
  category,
  playerIndex,
  scores,
  isCurrentPlayer,
  potentialScores,
  rollCount,
  onScore,
}: {
  category: Category;
  playerIndex: number;
  scores: PlayerScores;
  isCurrentPlayer: boolean;
  potentialScores: Record<Category, number> | null;
  rollCount: number;
  onScore: (c: Category) => void;
}) {
  const scored = scores[category];
  const potential = potentialScores?.[category];
  const canScore = isCurrentPlayer && scored === null && rollCount > 0;

  return (
    <td
      className={[
        'cell-score',
        `cell-p${Math.min(playerIndex + 1, 6)}`,
        scored !== null ? 'cell-scored' : '',
        canScore ? 'cell-available' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => canScore && onScore(category)}
      title={canScore ? `${potential ?? 0}점 등록` : undefined}
    >
      {scored !== null ? (
        <span className="val-scored">{scored}</span>
      ) : canScore && potential !== undefined ? (
        <span className="val-potential">{potential}</span>
      ) : (
        <span className="val-empty">—</span>
      )}
    </td>
  );
}

export default function ScoreSheet({ playerNames, gameState, onScore }: Props) {
  const i18n = t();
  const { players, currentPlayer, rollCount, potentialScores } = gameState;
  const n = players.length;

  function renderCategoryRows(categories: Category[]) {
    return categories.map((cat) => (
      <tr key={cat} className="score-row">
        <td className="cell-label">{i18n.categories[cat]}</td>
        {players.map((scores, pi) => (
          <ScoreCell
            key={pi}
            category={cat}
            playerIndex={pi}
            scores={scores}
            isCurrentPlayer={pi === currentPlayer}
            potentialScores={pi === currentPlayer ? potentialScores : null}
            rollCount={rollCount}
            onScore={onScore}
          />
        ))}
      </tr>
    ));
  }

  return (
    <div className="score-sheet">
      <table className="score-table">
        <thead>
          <tr>
            <th className="cell-label cell-header-label">{i18n.scoreSheet.category}</th>
            {playerNames.map((name, pi) => (
              <th
                key={pi}
                className={[
                  'cell-player-header',
                  `cell-p${Math.min(pi + 1, 6)}`,
                  pi === currentPlayer ? 'cell-player-header--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                <span className="player-header-name">{name}</span>
                {pi === currentPlayer && (
                  <span className="player-header-badge">차례</span>
                )}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="row-section-hd">
            <td colSpan={n + 1}>{i18n.scoreSheet.upper}</td>
          </tr>

          {renderCategoryRows(UPPER_CATEGORIES)}

          {/* Subtotal + Bonus */}
          <tr className="row-subtotal">
            <td className="cell-label cell-label--muted">{i18n.scoreSheet.subtotal}</td>
            {players.map((scores, pi) => (
              <td key={pi} className={`cell-score cell-p${Math.min(pi + 1, 6)} cell-subtotal`}>
                {scores.upperTotal}
                <span className="subtotal-of">/63</span>
              </td>
            ))}
          </tr>
          <tr className="row-bonus">
            <td className="cell-label">
              {i18n.categories.bonus}
              <span className="bonus-note">{i18n.scoreSheet.bonusNote}</span>
            </td>
            {players.map((scores, pi) => (
              <td key={pi} className={`cell-score cell-p${Math.min(pi + 1, 6)} ${scores.bonus > 0 ? 'cell-bonus-earned' : ''}`}>
                {scores.bonus > 0 ? `+${scores.bonus}` : '—'}
              </td>
            ))}
          </tr>

          <tr className="row-section-hd">
            <td colSpan={n + 1}>{i18n.scoreSheet.lower}</td>
          </tr>

          {renderCategoryRows(LOWER_CATEGORIES)}
        </tbody>
        <tfoot>
          <tr className="row-total">
            <td className="cell-label">{i18n.scoreSheet.total}</td>
            {players.map((scores, pi) => (
              <td key={pi} className={`cell-score cell-total cell-p${Math.min(pi + 1, 6)}`}>
                {scores.total}
              </td>
            ))}
          </tr>
        </tfoot>
      </table>
    </div>
  );
}
