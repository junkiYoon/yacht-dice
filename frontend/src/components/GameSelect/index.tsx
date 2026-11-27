import { t } from '../../i18n';
import { GameType } from '../../types/game';
import '../ModeSelect/styles.css';

const GAME_TYPES: GameType[] = ['yacht', 'lasVegas'];

interface Props {
  onSelect: (gameType: GameType) => void;
}

export default function GameSelect({ onSelect }: Props) {
  const i18n = t();

  return (
    <div className="mode-select-container">
      <div className="mode-select-card">
        <div className="mode-logo">🎲</div>
        <h1 className="mode-title">주사위 게임</h1>
        <p className="mode-subtitle">플레이할 게임을 선택하세요</p>
        <div className="mode-buttons">
          {GAME_TYPES.map((type) => (
            <button
              key={type}
              className={`mode-btn mode-btn--${type}`}
              onClick={() => onSelect(type)}
            >
              <span className="mode-btn-icon">{i18n.games[type].icon}</span>
              <span className="mode-btn-label">{i18n.games[type].name}</span>
              <span className="mode-btn-desc">{i18n.games[type].subtitle}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
