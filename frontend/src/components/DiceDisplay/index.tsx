import { useEffect, useRef, useState } from 'react';
import './styles.css';

interface Props {
  value: number;
  pinned: boolean;
  rolling: boolean;
  canPin: boolean;
  rollDelay?: number;
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

function randomFace() {
  return Math.floor(Math.random() * 6) + 1;
}

type Anim = 'idle' | 'rolling' | 'landing';

export default function DiceDisplay({
  value,
  pinned,
  rolling,
  canPin,
  rollDelay = 0,
  onClick,
}: Props) {
  const [displayValue, setDisplayValue] = useState(value);
  const [anim, setAnim] = useState<Anim>('idle');
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const wasRollingRef = useRef(false);

  useEffect(() => {
    if (rolling && !pinned) {
      wasRollingRef.current = true;
      setAnim('rolling');
      const id = setInterval(() => setDisplayValue(randomFace()), 80);
      intervalRef.current = id;
      return () => clearInterval(id);
    }

    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }

    if (wasRollingRef.current && !pinned) {
      wasRollingRef.current = false;
      let t2: ReturnType<typeof setTimeout>;
      const t1 = setTimeout(() => {
        setDisplayValue(value);
        setAnim('landing');
        t2 = setTimeout(() => setAnim('idle'), 450);
      }, rollDelay);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }

    wasRollingRef.current = false;
    setDisplayValue(value);
    setAnim('idle');
  }, [rolling, pinned, value, rollDelay]);

  const dots = DOT_LAYOUTS[displayValue] ?? [];

  return (
    <button
      className={[
        'die',
        pinned ? 'die--pinned' : '',
        anim === 'rolling' ? 'die--rolling' : '',
        anim === 'landing' ? 'die--landing' : '',
        canPin ? 'die--clickable' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={onClick}
      disabled={!canPin}
      title={canPin ? (pinned ? '고정 해제' : '고정') : undefined}
    >
      <div className="die-grid">
        {dots.map(([row, col], i) => (
          <span
            key={i}
            className="die-dot"
            style={{ gridRow: row + 1, gridColumn: col + 1 }}
          />
        ))}
      </div>
      {pinned && <span className="die-pin-badge">🔒</span>}
    </button>
  );
}
