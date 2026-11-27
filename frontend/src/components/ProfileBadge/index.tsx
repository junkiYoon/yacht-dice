import { useState, useRef, useEffect } from 'react';
import './styles.css';

interface Props {
  nickname: string;
  onNicknameChange: (name: string) => void;
}

export default function ProfileBadge({ nickname, onNicknameChange }: Props) {
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(nickname);
  const inputRef = useRef<HTMLInputElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (open) {
      setDraft(nickname);
      setTimeout(() => inputRef.current?.focus(), 30);
    }
  }, [open, nickname]);

  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (!wrapperRef.current?.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = draft.trim();
    if (!trimmed) return;
    localStorage.setItem('nickname', trimmed);
    onNicknameChange(trimmed);
    setOpen(false);
  }

  const initial = nickname ? nickname[0].toUpperCase() : '?';

  return (
    <div className="profile-badge-wrapper" ref={wrapperRef}>
      <button
        className={`profile-badge-btn ${open ? 'profile-badge-btn--open' : ''}`}
        onClick={() => setOpen((o) => !o)}
        title="닉네임 수정"
      >
        <span className="profile-avatar">{initial}</span>
        <span className="profile-name">{nickname}</span>
        <span className="profile-caret">▾</span>
      </button>

      {open && (
        <div className="profile-panel">
          <p className="profile-panel-label">닉네임 수정</p>
          <form onSubmit={handleSave} className="profile-panel-form">
            <input
              ref={inputRef}
              className="profile-panel-input"
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              maxLength={16}
              placeholder="닉네임 입력"
            />
            <button
              type="submit"
              className="profile-panel-save"
              disabled={!draft.trim()}
            >
              저장
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
