import { useState } from 'react';
import './styles.css';

interface Props {
  onConfirm: (nickname: string) => void;
}

export default function NicknamePage({ onConfirm }: Props) {
  const [name, setName] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) return;
    localStorage.setItem('nickname', trimmed);
    onConfirm(trimmed);
  }

  return (
    <div className="nickname-container">
      <div className="nickname-card">
        <div className="nickname-logo">🎲</div>
        <h1 className="nickname-title">요트 다이스</h1>
        <p className="nickname-subtitle">게임을 시작하기 전에 닉네임을 입력해주세요</p>
        <form className="nickname-form" onSubmit={handleSubmit}>
          <input
            className="nickname-input"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="닉네임 입력"
            maxLength={16}
            autoFocus
          />
          <button type="submit" className="nickname-submit-btn" disabled={!name.trim()}>
            시작하기
          </button>
        </form>
      </div>
    </div>
  );
}
