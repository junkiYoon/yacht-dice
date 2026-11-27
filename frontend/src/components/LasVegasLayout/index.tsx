import { useEffect, useState } from 'react';
import { AnnouncementState } from '../../hooks/useGameAnnouncement';
import { t } from '../../i18n';
import { LasVegasState } from '../../types/lasVegas';
import { formatMoney } from '../../utils/format';
import DiceDisplay from '../DiceDisplay';
import LasVegasHelpModal from '../LasVegasHelpModal';
import LasVegasRoundResult from '../LasVegasRoundResult';
import TurnAnnouncement from '../TurnAnnouncement';
import '../GameBoard/styles.css';
import '../DiceArea/styles.css';
import './styles.css';

const DIE_FACES = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
const DEAL_STAGGER_MS = 180;
const DEAL_ANIMATION_MS = 550;
const GRID_COLUMNS = 3;
const BANK_GAP_PX = 130;
const CASINO_ROW_PX = 170;
const BILL_ROW_PX = 34;

function dealOrigin(casinoIndex: number, billIndex: number): React.CSSProperties {
  const column = casinoIndex % GRID_COLUMNS;
  const row = Math.floor(casinoIndex / GRID_COLUMNS);
  return {
    '--deal-from-x': `${(1 - column) * 120}%`,
    '--deal-from-y': `${-(BANK_GAP_PX + row * CASINO_ROW_PX + billIndex * BILL_ROW_PX)}px`,
  } as React.CSSProperties;
}

interface Props {
  playerNames: string[];
  gameState: LasVegasState;
  canAct: boolean;
  serverPending: boolean;
  onRoll: () => void;
  onPlace: (value: number) => void;
  announcement: AnnouncementState | null;
  error: string | null;
  onErrorDismiss: () => void;
  tableOverlay?: React.ReactNode;
}

export default function LasVegasLayout({
  playerNames,
  gameState,
  canAct,
  serverPending,
  onRoll,
  onPlace,
  announcement,
  error,
  onErrorDismiss,
  tableOverlay,
}: Props) {
  const i18n = t();
  const [showHelp, setShowHelp] = useState(false);
  const [seenRound, setSeenRound] = useState(0);
  const [dealtRound, setDealtRound] = useState(0);

  const { round, totalRounds, currentPlayer, startPlayer, roll, casinos, players, lastRound } =
    gameState;
  const current = players[currentPlayer];

  const showRoundResult = lastRound !== null && lastRound.round > seenRound && !gameState.isFinished;
  const totalBills = casinos.reduce((sum, casino) => sum + casino.bills.length, 0);
  const isDealing = dealtRound !== round;

  useEffect(() => {
    if (showRoundResult) return;
    const id = setTimeout(
      () => setDealtRound(round),
      totalBills * DEAL_STAGGER_MS + DEAL_ANIMATION_MS,
    );
    return () => clearTimeout(id);
  }, [round, showRoundResult, totalBills]);

  const rolling = serverPending && !roll;
  const canRoll = canAct && !roll && !serverPending && !isDealing && !gameState.isFinished;
  const canPlace = canAct && !!roll && !serverPending;
  const trayDice = roll ?? Array.from({ length: current.diceLeft }, (_, i) => (i % 6) + 1);
  const countRolled = (value: number) => roll?.filter((v) => v === value).length ?? 0;

  let hint: string;
  if (isDealing) {
    hint = '카지노에 지폐를 나누는 중...';
  } else if (rolling) {
    hint = '주사위를 굴리는 중...';
  } else if (roll) {
    hint = '카지노나 주사위를 눌러 같은 눈의 주사위를 모두 거세요';
  } else {
    hint = `주사위 ${trayDice.length}개를 굴리세요`;
  }

  let dealOrder = 0;

  return (
    <div className="game-board">
      {announcement && (
        <TurnAnnouncement
          key={announcement.key}
          playerName={playerNames[announcement.player]}
          playerIndex={announcement.player}
        />
      )}

      {error && (
        <div className="board-error" onClick={onErrorDismiss}>
          ⚠️ {error}
        </div>
      )}

      {showHelp && <LasVegasHelpModal onClose={() => setShowHelp(false)} />}

      {showRoundResult && (
        <LasVegasRoundResult
          result={lastRound}
          playerNames={playerNames}
          onClose={() => setSeenRound(lastRound.round)}
        />
      )}

      <div className="board-layout">
        <aside className="board-sidebar">
          <div className="sidebar-header">
            <span className="sidebar-title">{i18n.games.lasVegas.name}</span>
            <div className="sidebar-header-right">
              <span className={`turn-badge turn-badge--p${currentPlayer + 1}`}>
                {i18n.game.turn(playerNames[currentPlayer])}
              </span>
              <button className="help-btn" onClick={() => setShowHelp(true)} title="규칙 보기">
                ?
              </button>
            </div>
          </div>
          <div className="lv-sidebar">
            <p className="lv-round">라운드 {round} / {totalRounds}</p>
            <ul className="lv-players">
              {players.map((player, i) => (
                <li
                  key={i}
                  className={`lv-player lv-color--p${i + 1} ${i === currentPlayer ? 'lv-player--active' : ''}`}
                >
                  <span className="lv-player-name">
                    {playerNames[i]}
                    {i === startPlayer && <span className="lv-start-badge">선</span>}
                  </span>
                  <span className="lv-player-money">{formatMoney(player.money)}</span>
                  <span className="lv-player-dice">남은 주사위 {player.diceLeft}개</span>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <main className="board-table">
          {tableOverlay}
          <div className="lv-table">
            <div className={`lv-bank ${isDealing ? 'lv-bank--dealing' : ''}`}>
              <span className="lv-bank-stack" />
              <span className="lv-bank-label">
                {isDealing ? '지폐를 나누는 중...' : `${round}라운드 배당`}
              </span>
            </div>
            <div className="lv-casinos">
              {casinos.map((casino, i) => {
                const value = i + 1;
                const matching = countRolled(value);
                const placeable = canPlace && matching > 0;
                return (
                  <button
                    key={value}
                    type="button"
                    className={`lv-casino lv-casino--${value} ${placeable ? 'lv-casino--placeable' : ''}`}
                    disabled={!placeable}
                    onClick={() => onPlace(value)}
                  >
                    <span className="lv-casino-head">
                      <span className="lv-casino-face">{DIE_FACES[i]}</span>
                      <span className="lv-casino-name">카지노 {value}</span>
                      {placeable && <span className="lv-casino-preview">+{matching}</span>}
                    </span>
                    <span className="lv-bills">
                      {!showRoundResult &&
                        casino.bills.map((bill, j) => (
                          <span
                            key={`${round}-${j}`}
                            className={`lv-bill lv-bill--${bill / 10_000}`}
                            data-short={`$${bill / 1000}K`}
                            style={{
                              ...dealOrigin(i, j),
                              animationDelay: `${dealOrder++ * DEAL_STAGGER_MS}ms`,
                            }}
                          >
                            {formatMoney(bill)}
                          </span>
                        ))}
                    </span>
                    <span className="lv-casino-dice">
                      {casino.dice.map(
                        (count, p) =>
                          count > 0 && (
                            <span key={p} className={`lv-chip lv-color--p${p + 1}`} title={playerNames[p]}>
                              {count}
                            </span>
                          ),
                      )}
                    </span>
                  </button>
                );
              })}
            </div>

            <div
              className={[
                'felt-tray',
                'lv-tray',
                rolling ? 'felt-tray--rolling' : '',
                !roll && !rolling ? 'lv-tray--idle' : '',
              ]
                .filter(Boolean)
                .join(' ')}
            >
              <div className="dice-row">
                {trayDice.map((value, i) => (
                  <span key={i} className={`lv-die lv-color--p${currentPlayer + 1}`}>
                    <DiceDisplay
                      value={value}
                      pinned={false}
                      rolling={rolling}
                      canPin={canPlace}
                      rollDelay={i * 40}
                      title={canPlace ? `${value}번 카지노에 걸기` : undefined}
                      onClick={() => onPlace(value)}
                    />
                  </span>
                ))}
              </div>
              <div className="tray-controls">
                <button
                  className={`roll-btn ${rolling ? 'roll-btn--rolling' : ''}`}
                  onClick={onRoll}
                  disabled={!canRoll}
                >
                  <span className="roll-btn-icon">🎲</span>
                  <span className="roll-btn-label">{i18n.game.rollButton}</span>
                </button>
                <div className="rolls-status">
                  <span className="status-hint">{hint}</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
