import { t } from '../../i18n';
import './styles.css';

interface Props {
  playerName: string;
  playerIndex: number;
}

export default function TurnAnnouncement({ playerName, playerIndex }: Props) {
  const i18n = t();
  const colorClass = `announcement-p${Math.min(playerIndex + 1, 6)}`;

  return (
    <div className="turn-announcement">
      <div className={`announcement-box ${colorClass}`}>
        <div className="announcement-label">다음 차례</div>
        <div className="announcement-name">
          {i18n.announcement.nextTurn(playerName)}
        </div>
      </div>
    </div>
  );
}
