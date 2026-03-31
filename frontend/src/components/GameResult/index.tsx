import { t } from '../../i18n';
import { GameState, LOWER_CATEGORIES, UPPER_CATEGORIES } from '../../types/game';
import './styles.css';

interface Props {
  gameState: GameState;
  playerNames: string[];
  onRestart: () => void;
}

export default function GameResult({ gameState, playerNames, onRestart }: Props) {
  const i18n = t();
  const { winners, players } = gameState;

  const isTie = winners && winners.length > 1;
  const winnerNames = (winners ?? []).map((i) => playerNames[i]);

  let headlineEmoji = '🏆';
  let headlineText: string;
  if (!winners || winners.length === 0) {
    headlineText = i18n.result.tie;
  } else if (isTie) {
    headlineEmoji = '🤝';
    headlineText = i18n.result.winners(winnerNames.join(' & '));
  } else {
    headlineText = i18n.result.winner(winnerNames[0]);
  }

  return (
    <div className="result-container">
      <div className="result-card">
        <div className="result-trophy">{headlineEmoji}</div>
        <h1 className="result-headline">{headlineText}</h1>

        {/* Score summary */}
        <div className="result-scores">
          {players.map((scores, pi) => {
            const isWinner = winners?.includes(pi);
            return (
              <div
                key={pi}
                className={[
                  'result-player',
                  `result-p${Math.min(pi + 1, 6)}`,
                  isWinner ? 'result-player--winner' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
              >
                {isWinner && <span className="result-crown">👑</span>}
                <span className="result-player-name">{playerNames[pi]}</span>
                <span className="result-player-score">{scores.total}점</span>
              </div>
            );
          })}
        </div>

        {/* Score breakdown */}
        <div className="result-breakdown">
          <h3>{i18n.result.finalScore}</h3>
          <table className="result-table">
            <thead>
              <tr>
                <th>카테고리</th>
                {playerNames.map((name, pi) => (
                  <th key={pi} className={`result-p${Math.min(pi + 1, 6)}`}>
                    {name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {UPPER_CATEGORIES.map((cat) => (
                <tr key={cat}>
                  <td>{i18n.categories[cat]}</td>
                  {players.map((s, pi) => (
                    <td key={pi}>{s[cat] ?? 0}</td>
                  ))}
                </tr>
              ))}
              <tr className="result-bonus-row">
                <td>{i18n.categories.bonus}</td>
                {players.map((s, pi) => (
                  <td key={pi} className={s.bonus > 0 ? 'bonus-cell' : ''}>
                    {s.bonus > 0 ? `+${s.bonus}` : '—'}
                  </td>
                ))}
              </tr>
              {LOWER_CATEGORIES.map((cat) => (
                <tr key={cat}>
                  <td>{i18n.categories[cat]}</td>
                  {players.map((s, pi) => (
                    <td key={pi}>{s[cat] ?? 0}</td>
                  ))}
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>합계</td>
                {players.map((s, pi) => (
                  <td key={pi} className={`result-total result-p${Math.min(pi + 1, 6)}`}>
                    {s.total}
                  </td>
                ))}
              </tr>
            </tfoot>
          </table>
        </div>

        <button className="result-restart-btn" onClick={onRestart}>
          {i18n.result.playAgain}
        </button>
      </div>
    </div>
  );
}
