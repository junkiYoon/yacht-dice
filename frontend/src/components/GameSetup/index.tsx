import { useState } from 'react';
import { t } from '../../i18n';
import './styles.css';

const MIN_PLAYERS = 1;
const MAX_PLAYERS = 6;
const PLAYER_COLORS = ['p1', 'p2', 'p3', 'p4', 'p5', 'p6'];

interface Props {
  onStart: (names: string[]) => void;
  onBack: () => void;
  defaultName?: string;
}

export default function GameSetup({ onStart, onBack, defaultName }: Props) {
  const i18n = t();
  const [playerCount, setPlayerCount] = useState(2);
  const [names, setNames] = useState<string[]>([defaultName ?? '', '', '', '', '', '']);

  function setName(index: number, value: string) {
    setNames((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
  }

  function handleCountChange(delta: number) {
    setPlayerCount((prev) => Math.max(MIN_PLAYERS, Math.min(MAX_PLAYERS, prev + delta)));
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const playerNames = Array.from({ length: playerCount }, (_, i) =>
      names[i].trim() || i18n.setup.playerNamePlaceholder(i + 1)
    );
    onStart(playerNames);
  }

  return (
    <div className="setup-container">
      <div className="setup-card">
        <button className="setup-back-btn" onClick={onBack}>← 뒤로</button>
        <div className="setup-logo">🎲</div>
        <h1 className="setup-title">{i18n.setup.heading}</h1>
        <p className="setup-subtitle">{i18n.setup.subtitle}</p>

        <form className="setup-form" onSubmit={handleSubmit}>
          <div className="setup-count-row">
            <span className="setup-count-label">{i18n.setup.playerCountLabel}</span>
            <div className="setup-count-ctrl">
              <button
                type="button"
                className="count-btn"
                onClick={() => handleCountChange(-1)}
                disabled={playerCount <= MIN_PLAYERS}
              >
                −
              </button>
              <span className="count-value">{playerCount}인</span>
              <button
                type="button"
                className="count-btn"
                onClick={() => handleCountChange(1)}
                disabled={playerCount >= MAX_PLAYERS}
              >
                +
              </button>
            </div>
          </div>

          <div className="setup-players">
            {Array.from({ length: playerCount }, (_, i) => (
              <div key={i} className="setup-field">
                <label className={`setup-label player-label--${PLAYER_COLORS[i]}`}>
                  {i18n.setup.playerNameLabel(i + 1)}
                </label>
                <input
                  className={`setup-input player-input--${PLAYER_COLORS[i]}`}
                  type="text"
                  value={names[i]}
                  onChange={(e) => setName(i, e.target.value)}
                  placeholder={i18n.setup.playerNamePlaceholder(i + 1)}
                  maxLength={16}
                />
              </div>
            ))}
          </div>

          <button type="submit" className="setup-start-btn">
            {i18n.setup.startButton}
          </button>
        </form>
      </div>
    </div>
  );
}
