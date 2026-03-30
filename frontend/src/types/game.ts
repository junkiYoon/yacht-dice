export type Category =
  | 'aces'
  | 'deuces'
  | 'threes'
  | 'fours'
  | 'fives'
  | 'sixes'
  | 'choice'
  | 'fourOfKind'
  | 'fullHouse'
  | 'smallStraight'
  | 'largeStraight'
  | 'yacht';

export interface DiceState {
  value: number;
  pinned: boolean;
}

export interface PlayerScores {
  aces: number | null;
  deuces: number | null;
  threes: number | null;
  fours: number | null;
  fives: number | null;
  sixes: number | null;
  choice: number | null;
  fourOfKind: number | null;
  fullHouse: number | null;
  smallStraight: number | null;
  largeStraight: number | null;
  yacht: number | null;
  bonus: number;
  upperTotal: number;
  total: number;
}

export interface GameState {
  id: string;
  currentPlayer: 0 | 1;
  rollCount: number;
  canRoll: boolean;
  dice: DiceState[];
  players: [PlayerScores, PlayerScores];
  potentialScores: Record<Category, number> | null;
  isFinished: boolean;
  winner: number | null;
}
