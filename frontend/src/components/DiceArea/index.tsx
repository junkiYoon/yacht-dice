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

  const pinnedDice = dice.filter((d) => d.pinned);
  const freeDice = dice.filter((d) => !d.pinned);

  let rollLabel: string;
  if (rolling) {
    rollLabel = '굴리는 중...';
  } else if (rollCount === 0) {
    rollLabel = i18n.game.rollButton;
  } else {
    rollLabel = i18n.game.rerollButton;
  }

  return (
    <div className="dice-area">
      {/* Felt tray */}
      <div className={`felt-tray ${rolling ? 'felt-tray--rolling' : ''}`}>

        {/* Kept (pinned) dice — shown at top when any are pinned */}
        {pinnedDice.length > 0 && (
          <div className="tray-zone tray-zone--kept">
            <span className="zone-label">고정됨</span>
            <div className="dice-row">
              {dice.map((die, i) =>
                die.pinned ? (
                  <DiceDisplay
                    key={i}
                    value={die.value}
                    pinned={true}
                    rolling={rolling}
                    canPin={canPin}
                    rollDelay={0}
                    onClick={() => onTogglePin(i)}
                  />
                ) : null
              )}
            </div>
          </div>
        )}

        {/* Rolling dice */}
        <div className="tray-zone tray-zone--roll">
          {pinnedDice.length > 0 && freeDice.length > 0 && (
            <span className="zone-label">굴릴 주사위</span>
          )}
          <div className="dice-row">
            {dice.map((die, i) => {
              if (die.pinned) return null;
              const freeIndex = dice
                .slice(0, i)
                .filter((d) => !d.pinned).length;
              return (
                <DiceDisplay
                  key={i}
                  value={die.value}
                  pinned={false}
                  rolling={rolling}
                  canPin={canPin}
                  rollDelay={freeIndex * 70}
                  onClick={() => onTogglePin(i)}
                />
              );
            })}
          </div>
        </div>

        {/* Roll button — inside tray for immersion */}
        <div className="tray-controls">
          <button
            className={`roll-btn ${rolling ? 'roll-btn--rolling' : ''}`}
            onClick={onRoll}
            disabled={!canRoll || rolling}
          >
            <span className="roll-btn-icon">🎲</span>
            <span className="roll-btn-label">{rollLabel}</span>
          </button>

          <div className="rolls-status">
            {rollCount === 0 ? (
              <span className="status-hint">주사위를 굴려 시작하세요</span>
            ) : rollCount >= 3 ? (
              <span className="status-hint status-hint--must">
                ⚠ 점수를 선택해주세요
              </span>
            ) : (
              <span className="status-hint">
                {i18n.game.rollsLeft(rollsLeft)} · 지금 점수를 등록하거나 계속 굴리세요
              </span>
            )}
          </div>
        </div>
      </div>

      {canPin && (
        <p className="pin-hint">주사위를 클릭해서 고정 / 해제하세요</p>
      )}
    </div>
  );
}
