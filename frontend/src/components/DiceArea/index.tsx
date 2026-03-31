import { useEffect, useState } from 'react';
import { t } from '../../i18n';
import { GameState } from '../../types/game';
import DiceDisplay from '../DiceDisplay';
import './styles.css';

interface Props {
  gameState: GameState;
  /** True while the server is processing the committed roll */
  serverPending: boolean;
  onRoll: () => void;
  onTogglePin: (index: number) => void;
  /** Called when the dice start shaking locally (before server commit) */
  onAnimationStart?: () => void;
  /** Called when a local animation is cancelled before committing */
  onAnimationCancel?: () => void;
}

export default function DiceArea({
  gameState,
  serverPending,
  onRoll,
  onTogglePin,
  onAnimationStart,
  onAnimationCancel,
}: Props) {
  const i18n = t();
  const { dice, rollCount, canRoll } = gameState;

  /** Local animation phase: dice spinning but not yet committed to server */
  const [animating, setAnimating] = useState(false);

  const canPin = rollCount > 0 && rollCount < 3;
  const rollsLeft = 3 - rollCount;

  // Safety: if the turn/canRoll changes externally while we're mid-animation, stop
  useEffect(() => {
    if (!canRoll && !serverPending) setAnimating(false);
  }, [canRoll, serverPending]);

  /** Rolling = local animation OR waiting for server response */
  const rolling = animating || serverPending;

  function handleButtonClick() {
    if (serverPending) return;

    if (!animating) {
      // Phase 1: start local animation
      setAnimating(true);
      onAnimationStart?.();
    } else {
      // Phase 2: commit to server — DiceDisplay keeps spinning via serverPending
      setAnimating(false);
      onRoll();
    }
  }

  function handleCancel() {
    setAnimating(false);
    onAnimationCancel?.();
    // No server call — dice land back on their current values
  }

  const pinnedDice = dice.filter((d) => d.pinned);
  const freeDice = dice.filter((d) => !d.pinned);

  /* ── Button label ──────────────────────────────── */
  let rollLabel: string;
  let rollIcon: string;
  if (serverPending) {
    rollLabel = '결과 확인 중...';
    rollIcon = '⏳';
  } else if (animating) {
    rollLabel = '멈추기';
    rollIcon = '⏹️';
  } else if (rollCount === 0) {
    rollLabel = i18n.game.rollButton;
    rollIcon = '🎲';
  } else {
    rollLabel = i18n.game.rerollButton;
    rollIcon = '🎲';
  }

  /* ── Button disabled ───────────────────────────── */
  const buttonDisabled = serverPending || (!animating && !canRoll);

  return (
    <div className="dice-area">
      {/* Felt tray */}
      <div className={`felt-tray ${rolling ? 'felt-tray--rolling' : ''}`}>

        {/* Kept (pinned) dice */}
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
              const freeIndex = dice.slice(0, i).filter((d) => !d.pinned).length;
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

        {/* Controls */}
        <div className="tray-controls">
          <div className="tray-btn-row">
            <button
              className={`roll-btn ${rolling ? 'roll-btn--rolling' : ''} ${animating ? 'roll-btn--stop' : ''}`}
              onClick={handleButtonClick}
              disabled={buttonDisabled}
            >
              <span className="roll-btn-icon">{rollIcon}</span>
              <span className="roll-btn-label">{rollLabel}</span>
            </button>

            {animating && (
              <button className="cancel-btn" onClick={handleCancel}>
                ✕ 취소
              </button>
            )}
          </div>

          <div className="rolls-status">
            {animating ? (
              <span className="status-hint status-hint--animating">
                멈추면 주사위를 굴립니다
              </span>
            ) : rollCount === 0 ? (
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

      {canPin && !animating && (
        <p className="pin-hint">주사위를 클릭해서 고정 / 해제하세요</p>
      )}
    </div>
  );
}
