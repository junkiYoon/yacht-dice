import { randomUUID } from 'crypto';
import { ALL_CATEGORIES, Board, Category, PlayerScores } from './board';
import { Calculator } from './calculator';
import { Die } from './die';

export interface DiceState {
  value: number;
  pinned: boolean;
}

export interface GameState {
  id: string;
  playerCount: number;
  currentPlayer: number;
  rollCount: number;
  canRoll: boolean;
  dice: DiceState[];
  players: PlayerScores[];
  potentialScores: Record<Category, number> | null;
  isFinished: boolean;
  winners: number[] | null;
}

export class MultiPlayerGame {
  private readonly MAX_ROLLS = 3;

  readonly id: string;
  readonly playerCount: number;
  private dice: Die[];
  private boards: Board[];
  private calculator: Calculator;
  private currentPlayer: number;
  private rollCount: number;

  constructor(playerCount: number) {
    if (playerCount < 1) {
      throw new Error('인원 수는 최소 1명이어야 합니다.');
    }
    this.id = randomUUID();
    this.playerCount = playerCount;
    this.dice = Array.from({ length: 5 }, () => new Die());
    this.boards = Array.from({ length: playerCount }, () => new Board());
    this.calculator = new Calculator();
    this.currentPlayer = 0;
    this.rollCount = 0;
  }

  roll(): void {
    if (this.isFinished()) {
      throw new Error('게임이 종료되었습니다.');
    }
    if (this.rollCount >= this.MAX_ROLLS) {
      throw new Error('이미 3회 굴렸습니다. 점수를 선택해주세요.');
    }
    this.dice.forEach((d) => d.roll());
    this.rollCount++;
  }

  togglePin(index: number): void {
    if (index < 0 || index >= 5) {
      throw new Error('유효하지 않은 주사위 인덱스입니다.');
    }
    if (this.rollCount === 0) {
      throw new Error('주사위를 먼저 굴려야 합니다.');
    }
    if (this.rollCount >= this.MAX_ROLLS) {
      throw new Error('마지막 굴림 후에는 주사위를 고정할 수 없습니다.');
    }
    this.dice[index].togglePin();
  }

  score(category: Category): void {
    if (this.rollCount === 0) {
      throw new Error('주사위를 먼저 굴려야 합니다.');
    }
    if (this.boards[this.currentPlayer].isScored(category)) {
      throw new Error(`${category}는 이미 점수가 등록되었습니다.`);
    }

    const diceValues = this.dice.map((d) => d.value);
    const points = this.calculator.calculate(category, diceValues);
    this.boards[this.currentPlayer].score(category, points);

    this.dice.forEach((d) => d.unpin());
    this.rollCount = 0;
    this.currentPlayer = (this.currentPlayer + 1) % this.playerCount;
  }

  getState(): GameState {
    const diceValues = this.dice.map((d) => d.value);
    const potentialScores =
      this.rollCount > 0 ? this.calculator.calculateAll(diceValues) : null;

    const finished = this.isFinished();

    return {
      id: this.id,
      playerCount: this.playerCount,
      currentPlayer: this.currentPlayer,
      rollCount: this.rollCount,
      canRoll: this.rollCount < this.MAX_ROLLS && !finished,
      dice: this.dice.map((d) => ({ value: d.value, pinned: d.pinned })),
      players: this.boards.map((b) => b.getInfo()),
      potentialScores,
      isFinished: finished,
      winners: finished ? this.getWinners() : null,
    };
  }

  isFinished(): boolean {
    return this.boards.every((b) => b.isComplete());
  }

  private getWinners(): number[] {
    const totals = this.boards.map((b) => b.total);
    const maxScore = Math.max(...totals);
    return totals.reduce<number[]>((acc, score, i) => {
      if (score === maxScore) acc.push(i);
      return acc;
    }, []);
  }
}
