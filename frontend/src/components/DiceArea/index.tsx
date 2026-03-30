import { t } from '../../i18n';
import { GameState } from '../../types/game';
import DiceDisplay from '../DiceDisplay';
import './styles.css';

interface Props {
  gameState: GameState;
  rolling: boolean;
  onRoll: () => void;
  onTogglePin: (index: number) => void;
}

export default function DiceArea({ gameState, rolling, onRoll, onTogglePin }: Props) {
  const i18n = t();
  const { dice, rollCount, canRoll } = gameState;
  const canPin = rollCount > 0 && rollCount < 3;
  const rollsLeft = 3 - rollCount;

  return (
    <div className="dice-area">
      <div className="dice-row">
        {dice.map((die, i) => (
          <DiceDisplay
            key={i}
            value={die.value}
            pinned={die.pinned}
            rolling={rolling}
            canPin={canPin}
            onClick={() => onTogglePin(i)}
          />
        ))}
      </div>

      <div className="dice-controls">
        <button
          className="roll-btn"
          onClick={onRoll}
          disabled={!canRoll || rolling}
        >
          {rolling ? '굴리는 중...' : rollCount === 0 ? i18n.game.rollButton : '다시 굴리기'}
        </button>

        <div className="rolls-info">
          {rollCount === 0 ? (
            <span className="rolls-hint">{i18n.game.selectCategory}</span>
          ) : rollCount >= 3 ? (
            <span className="rolls-hint must-score">{i18n.game.mustScore}</span>
          ) : (
            <span className="rolls-hint">{i18n.game.rollsLeft(rollsLeft)}</span>
          )}
        </div>
      </div>

      {canPin && (
        <p className="pin-hint">주사위를 클릭해서 고정/해제하세요</p>
      )}
    </div>
  );
}
