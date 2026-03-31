import { useEffect, useRef, useState } from 'react';
import { t } from '../../i18n';
import { Category, GameState, LOWER_CATEGORIES, PlayerScores, UPPER_CATEGORIES } from '../../types/game';
import './styles.css';

const ALL_CATEGORIES = [...UPPER_CATEGORIES, ...LOWER_CATEGORIES];

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
  isNew,
  onScore,
}: {
  category: Category;
  playerIndex: number;
  scores: PlayerScores;
  isCurrentPlayer: boolean;
  potentialScores: Record<Category, number> | null;
  rollCount: number;
  isNew: boolean;
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
        canScore && (potential ?? 0) > 0 ? 'cell-available' : canScore && potential !== undefined ? 'cell-sacrifice' : '',
        isNew ? 'cell-newly-scored' : '',
      ].filter(Boolean).join(' ')}
      onClick={() => canScore && onScore(category)}
      title={canScore ? `${potential ?? 0}점 등록` : undefined}
    >
      {scored !== null ? (
        <span className={`val-scored ${isNew ? 'val-newly-written' : ''}`}>
          {scored}
        </span>
      ) : canScore && potential !== undefined && potential > 0 ? (
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

  // Track newly scored cells for animation
  const [newlyScored, setNewlyScored] = useState<Set<string>>(new Set());
  const prevPlayersRef = useRef<PlayerScores[] | null>(null);

  useEffect(() => {
    if (prevPlayersRef.current) {
      const fresh = new Set<string>();
      players.forEach((scores, pi) => {
        ALL_CATEGORIES.forEach((cat) => {
          if (prevPlayersRef.current![pi]?.[cat] === null && scores[cat] !== null) {
            fresh.add(`${pi}-${cat}`);
          }
        });
      });
      if (fresh.size > 0) {
        setNewlyScored(fresh);
        const timerId = setTimeout(() => setNewlyScored(new Set()), 1600);
        return () => clearTimeout(timerId);
      }
    }
    prevPlayersRef.current = players.map((s) => ({ ...s }));
  }, [players]);

  function renderRows(categories: Category[]) {
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
            isNew={newlyScored.has(`${pi}-${cat}`)}
            onScore={onScore}
          />
        ))}
      </tr>
    ));
  }

  return (
    <div className="score-sheet">
      {/* Spiral binding decoration */}
      <div className="sheet-binding">
        {Array.from({ length: 9 }, (_, i) => (
          <div key={i} className="binding-ring" />
        ))}
      </div>

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
                ].filter(Boolean).join(' ')}
              >
                <span className="player-header-name">{name}</span>
                {pi === currentPlayer && <span className="player-header-badge">차례</span>}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr className="row-section-hd"><td colSpan={n + 1}>{i18n.scoreSheet.upper}</td></tr>
          {renderRows(UPPER_CATEGORIES)}

          {/* Subtotal */}
          <tr className="row-subtotal">
            <td className="cell-label cell-label--muted">{i18n.scoreSheet.subtotal}</td>
            {players.map((scores, pi) => (
              <td key={pi} className={`cell-score cell-p${Math.min(pi + 1, 6)} cell-subtotal`}>
                {scores.upperTotal}
                <span className="subtotal-of">/63</span>
              </td>
            ))}
          </tr>

          {/* Bonus */}
          <tr className="row-bonus">
            <td className="cell-label">
              {i18n.categories.bonus}
              <span className="bonus-note">{i18n.scoreSheet.bonusNote}</span>
            </td>
            {players.map((scores, pi) => (
              <td
                key={pi}
                className={`cell-score cell-p${Math.min(pi + 1, 6)} ${scores.bonus > 0 ? 'cell-bonus-earned' : ''}`}
              >
                {scores.bonus > 0 ? `+${scores.bonus}` : '—'}
              </td>
            ))}
          </tr>

          <tr className="row-section-hd"><td colSpan={n + 1}>{i18n.scoreSheet.lower}</td></tr>
          {renderRows(LOWER_CATEGORIES)}
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
