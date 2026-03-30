import './styles.css';

interface Props {
  value: number;
  pinned: boolean;
  rolling: boolean;
  canPin: boolean;
  onClick: () => void;
}

const DOT_LAYOUTS: Record<number, number[][]> = {
  1: [[1, 1]],
  2: [[0, 0], [2, 2]],
  3: [[0, 0], [1, 1], [2, 2]],
  4: [[0, 0], [0, 2], [2, 0], [2, 2]],
  5: [[0, 0], [0, 2], [1, 1], [2, 0], [2, 2]],
  6: [[0, 0], [0, 2], [1, 0], [1, 2], [2, 0], [2, 2]],
};

export default function DiceDisplay({ value, pinned, rolling, canPin, onClick }: Props) {
  const dots = DOT_LAYOUTS[value] ?? [];

  return (
    <button
      className={[
        'die',
        pinned ? 'die--pinned' : '',
        rolling ? 'die--rolling' : '',
        canPin ? 'die--clickable' : '',
      ].join(' ')}
      onClick={onClick}
      disabled={!canPin}
      title={canPin ? (pinned ? '고정 해제' : '고정') : undefined}
    >
      <div className="die-grid">
        {dots.map(([row, col], i) => (
          <span
            key={i}
            className="die-dot"
            style={{
              gridRow: row + 1,
              gridColumn: col + 1,
            }}
          />
        ))}
      </div>
      {pinned && <span className="die-pin-badge">🔒</span>}
    </button>
  );
}
