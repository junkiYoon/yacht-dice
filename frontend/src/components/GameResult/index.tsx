import { t } from '../../i18n';
import { GameState } from '../../types/game';
import './styles.css';

interface Props {
  gameState: GameState;
  playerNames: [string, string];
  onRestart: () => void;
}

export default function GameResult({ gameState, playerNames, onRestart }: Props) {
  const i18n = t();
  const { winner, players } = gameState;

  const winnerName =
    winner === 0 ? playerNames[0] : winner === 1 ? playerNames[1] : null;

  const p1Score = players[0].total;
  const p2Score = players[1].total;

  return (
    <div className="result-container">
      <div className="result-card">
        <div className="result-trophy">{winner === -1 ? '🤝' : '🏆'}</div>
        <h1 className="result-headline">
          {winner === -1
            ? i18n.result.tie
            : i18n.result.winner(winnerName!)}
        </h1>

        <div className="result-scores">
          <div className={`result-player ${winner === 0 ? 'result-player--winner' : ''}`}>
            <span className="result-player-name result-p1">{playerNames[0]}</span>
            <span className="result-player-score">{p1Score}점</span>
          </div>
          <div className="result-separator">vs</div>
          <div className={`result-player ${winner === 1 ? 'result-player--winner' : ''}`}>
            <span className="result-player-name result-p2">{playerNames[1]}</span>
            <span className="result-player-score">{p2Score}점</span>
          </div>
        </div>

        <div className="result-breakdown">
          <h3>최종 점수판</h3>
          <table className="result-table">
            <thead>
              <tr>
                <th>카테고리</th>
                <th className="result-p1">{playerNames[0]}</th>
                <th className="result-p2">{playerNames[1]}</th>
              </tr>
            </thead>
            <tbody>
              {(['aces', 'deuces', 'threes', 'fours', 'fives', 'sixes'] as const).map((cat) => (
                <tr key={cat}>
                  <td>{i18n.categories[cat]}</td>
                  <td>{players[0][cat] ?? 0}</td>
                  <td>{players[1][cat] ?? 0}</td>
                </tr>
              ))}
              <tr className="result-bonus-row">
                <td>{i18n.categories.bonus}</td>
                <td className={players[0].bonus > 0 ? 'bonus-cell' : ''}>{players[0].bonus}</td>
                <td className={players[1].bonus > 0 ? 'bonus-cell' : ''}>{players[1].bonus}</td>
              </tr>
              {(['choice', 'fourOfKind', 'fullHouse', 'smallStraight', 'largeStraight', 'yacht'] as const).map((cat) => (
                <tr key={cat}>
                  <td>{i18n.categories[cat]}</td>
                  <td>{players[0][cat] ?? 0}</td>
                  <td>{players[1][cat] ?? 0}</td>
                </tr>
              ))}
            </tbody>
            <tfoot>
              <tr>
                <td>합계</td>
                <td className="result-total">{p1Score}</td>
                <td className="result-total">{p2Score}</td>
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
