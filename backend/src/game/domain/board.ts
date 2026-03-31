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

export const ALL_CATEGORIES: Category[] = [
  'aces',
  'deuces',
  'threes',
  'fours',
  'fives',
  'sixes',
  'choice',
  'fourOfKind',
  'fullHouse',
  'smallStraight',
  'largeStraight',
  'yacht',
];

export const UPPER_CATEGORIES: Category[] = [
  'aces',
  'deuces',
  'threes',
  'fours',
  'fives',
  'sixes',
];

const BONUS_THRESHOLD = 63;
const BONUS_SCORE = 35;

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

export class Board {
  private scores: Record<Category, number | null> = {
    aces: null,
    deuces: null,
    threes: null,
    fours: null,
    fives: null,
    sixes: null,
    choice: null,
    fourOfKind: null,
    fullHouse: null,
    smallStraight: null,
    largeStraight: null,
    yacht: null,
  };

  score(category: Category, value: number): void {
    if (this.scores[category] !== null) {
      throw new Error(`${category}는 이미 점수가 등록되었습니다.`);
    }
    this.scores[category] = value;
  }

  isScored(category: Category): boolean {
    return this.scores[category] !== null;
  }

  isComplete(): boolean {
    return ALL_CATEGORIES.every((cat) => this.scores[cat] !== null);
  }

  get upperTotal(): number {
    return UPPER_CATEGORIES.reduce(
      (sum, cat) => sum + (this.scores[cat] ?? 0),
      0,
    );
  }

  get bonus(): number {
    return this.upperTotal >= BONUS_THRESHOLD ? BONUS_SCORE : 0;
  }

  get total(): number {
    return (
      ALL_CATEGORIES.reduce((sum, cat) => sum + (this.scores[cat] ?? 0), 0) +
      this.bonus
    );
  }

  getInfo(): PlayerScores {
    return {
      ...this.scores,
      bonus: this.bonus,
      upperTotal: this.upperTotal,
      total: this.total,
    } as PlayerScores;
  }
}
