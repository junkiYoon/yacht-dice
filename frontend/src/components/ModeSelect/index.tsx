import './styles.css';

interface Props {
  onLocal: () => void;
  onOnline: () => void;
}

export default function ModeSelect({ onLocal, onOnline }: Props) {
  return (
    <div className="mode-select-container">
      <div className="mode-select-card">
        <div className="mode-logo">🎲</div>
        <h1 className="mode-title">요트 다이스</h1>
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
