import { useCallback, useRef, useState } from 'react';

export interface AnnouncementState {
  player: number;
  key: number;
}

export function useGameAnnouncement() {
  const [announcement, setAnnouncement] = useState<AnnouncementState | null>(null);
  const prevPlayerRef = useRef<number | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkTurnChange = useCallback((currentPlayer: number, isFinished: boolean) => {
    if (
      !isFinished &&
      prevPlayerRef.current !== null &&
      prevPlayerRef.current !== currentPlayer
    ) {
      if (timerRef.current) clearTimeout(timerRef.current);
      setAnnouncement((prev) => ({
        player: currentPlayer,
        key: (prev?.key ?? 0) + 1,
      }));
      timerRef.current = setTimeout(() => setAnnouncement(null), 2200);
    }
    prevPlayerRef.current = currentPlayer;
  }, []);

  return { announcement, checkTurnChange };
}
