import { t } from '../../i18n';
import { LasVegasState } from '../../types/lasVegas';
import { formatMoney } from '../../utils/format';
import '../GameResult/styles.css';

interface Props {
  gameState: LasVegasState;
  playerNames: string[];
  onRestart: () => void;
}

export default function LasVegasResult({ gameState, playerNames, onRestart }: Props) {
  const i18n = t();
  const winners = gameState.winners ?? [];
  const isTie = winners.length > 1;
  const winnerNames = winners.map((i) => playerNames[i]).join(' & ');
  const ranking = gameState.players
    .map((player, index) => ({ index, money: player.money }))
    .sort((a, b) => b.money - a.money);

  return (
    <div className="result-container">
      <div className="result-card">
        <div className="result-trophy">{isTie ? '🤝' : '🏆'}</div>
        <h1 className="result-headline">
          {isTie ? i18n.result.winners(winnerNames) : i18n.result.winner(winnerNames)}
        </h1>

        <div className="result-scores">
          {ranking.map(({ index, money }) => {
            const isWinner = winners.includes(index);
            return (
              <div
                key={index}
                className={['result-player', `result-p${index + 1}`, isWinner ? 'result-player--winner' : '']
                  .filter(Boolean)
                  .join(' ')}
              >
                {isWinner && <span className="result-crown">👑</span>}
                <span className="result-player-name">{playerNames[index]}</span>
                <span className="result-player-score">{formatMoney(money)}</span>
              </div>
            );
          })}
        </div>

        <button className="result-restart-btn" onClick={onRestart}>
          {i18n.result.playAgain}
        </button>
      </div>
    </div>
  );
}
