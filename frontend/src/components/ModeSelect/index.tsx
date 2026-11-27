import { t } from '../../i18n';
import { GameType } from '../../types/game';
import './styles.css';

interface Props {
  gameType: GameType;
  onLocal: () => void;
  onOnline: () => void;
  onBack: () => void;
}

export default function ModeSelect({ gameType, onLocal, onOnline, onBack }: Props) {
  const game = t().games[gameType];

  return (
    <div className="mode-select-container">
      <div className="mode-select-card">
        <button className="mode-back-btn" onClick={onBack}>← 게임 선택</button>
        <div className="mode-logo">{game.icon}</div>
        <h1 className="mode-title">{game.name}</h1>
        <p className="mode-subtitle">게임 모드를 선택하세요</p>
        <div className="mode-buttons">
          <button className="mode-btn mode-btn--local" onClick={onLocal}>
            <span className="mode-btn-icon">🖥️</span>
            <span className="mode-btn-label">로컬 게임</span>
            <span className="mode-btn-desc">같은 기기에서 번갈아 플레이</span>
          </button>
          <button className="mode-btn mode-btn--online" onClick={onOnline}>
            <span className="mode-btn-icon">🌐</span>
            <span className="mode-btn-label">온라인 멀티플레이</span>
            <span className="mode-btn-desc">다른 기기의 친구와 함께</span>
          </button>
        </div>
      </div>
    </div>
  );
}
