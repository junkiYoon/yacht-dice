import { useState } from 'react';
import { t } from '../../i18n';
import './styles.css';

interface Props {
  onStart: (names: [string, string]) => void;
}

export default function GameSetup({ onStart }: Props) {
  const i18n = t();
  const [p1, setP1] = useState('');
  const [p2, setP2] = useState('');

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    onStart([
      p1.trim() || i18n.setup.player1Placeholder,
      p2.trim() || i18n.setup.player2Placeholder,
    ]);
  }

  return (
    <div className="setup-container">
      <div className="setup-card">
        <div className="setup-logo">🎲</div>
        <h1 className="setup-title">{i18n.setup.heading}</h1>
        <p className="setup-subtitle">{i18n.setup.subtitle}</p>
        <form className="setup-form" onSubmit={handleSubmit}>
          <div className="setup-field">
            <label className="setup-label p1-label">{i18n.setup.player1Label}</label>
            <input
              className="setup-input p1-input"
              type="text"
              value={p1}
              onChange={(e) => setP1(e.target.value)}
              placeholder={i18n.setup.player1Placeholder}
              maxLength={16}
            />
          </div>
          <div className="setup-vs">VS</div>
          <div className="setup-field">
            <label className="setup-label p2-label">{i18n.setup.player2Label}</label>
            <input
              className="setup-input p2-input"
              type="text"
              value={p2}
              onChange={(e) => setP2(e.target.value)}
              placeholder={i18n.setup.player2Placeholder}
              maxLength={16}
            />
          </div>
          <button type="submit" className="setup-start-btn">
            {i18n.setup.startButton}
          </button>
        </form>
      </div>
    </div>
  );
}
