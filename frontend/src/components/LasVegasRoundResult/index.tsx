import { RoundResult } from '../../types/lasVegas';
import { formatMoney } from '../../utils/format';
import '../HelpModal/styles.css';

interface Props {
  result: RoundResult;
  playerNames: string[];
  onClose: () => void;
}

export default function LasVegasRoundResult({ result, playerNames, onClose }: Props) {
  return (
    <div className="help-backdrop" onClick={onClose}>
      <div className="help-modal" onClick={(e) => e.stopPropagation()}>
        <div className="help-header">
          <h2 className="help-title">💰 {result.round}라운드 정산</h2>
          <button className="help-close-btn" onClick={onClose}>✕</button>
        </div>

        <div className="help-body">
          {result.payouts.length === 0 ? (
            <p className="help-tip">이번 라운드에는 배당을 받은 사람이 없습니다.</p>
          ) : (
            <div className="help-rules">
              {result.payouts.map((payout, i) => (
                <div key={i} className="help-rule">
                  <span className="help-rule-name">카지노 {payout.casino}</span>
                  <span className="help-rule-desc">{playerNames[payout.player]}</span>
                  <span className="help-rule-score">{formatMoney(payout.bill)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
