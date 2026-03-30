import { Category } from './board';

export const SMALL_STRAIGHT_SCORE = 15;
export const LARGE_STRAIGHT_SCORE = 30;
export const YACHT_SCORE = 50;

export class Calculator {
  calculate(category: Category, dice: number[]): number {
    switch (category) {
      case 'aces':
        return this.sumOf(dice, 1);
      case 'deuces':
        return this.sumOf(dice, 2);
      case 'threes':
        return this.sumOf(dice, 3);
      case 'fours':
        return this.sumOf(dice, 4);
      case 'fives':
        return this.sumOf(dice, 5);
      case 'sixes':
        return this.sumOf(dice, 6);
      case 'choice':
        return dice.reduce((s, d) => s + d, 0);
      case 'fourOfKind':
        return this.fourOfKind(dice);
      case 'fullHouse':
        return this.fullHouse(dice);
      case 'smallStraight':
        return this.smallStraight(dice) ? SMALL_STRAIGHT_SCORE : 0;
      case 'largeStraight':
        return this.largeStraight(dice) ? LARGE_STRAIGHT_SCORE : 0;
      case 'yacht':
        return this.yacht(dice) ? YACHT_SCORE : 0;
    }
  }

  calculateAll(dice: number[]): Record<Category, number> {
    return {
      aces: this.sumOf(dice, 1),
      deuces: this.sumOf(dice, 2),
      threes: this.sumOf(dice, 3),
      fours: this.sumOf(dice, 4),
      fives: this.sumOf(dice, 5),
      sixes: this.sumOf(dice, 6),
      choice: dice.reduce((s, d) => s + d, 0),
      fourOfKind: this.fourOfKind(dice),
      fullHouse: this.fullHouse(dice),
      smallStraight: this.smallStraight(dice) ? SMALL_STRAIGHT_SCORE : 0,
      largeStraight: this.largeStraight(dice) ? LARGE_STRAIGHT_SCORE : 0,
      yacht: this.yacht(dice) ? YACHT_SCORE : 0,
    };
  }

  private sumOf(dice: number[], target: number): number {
    return dice.filter((d) => d === target).length * target;
  }

  private getCounts(dice: number[]): Record<number, number> {
    const counts: Record<number, number> = {};
    for (const d of dice) {
      counts[d] = (counts[d] || 0) + 1;
    }
    return counts;
  }

  private fourOfKind(dice: number[]): number {
    const counts = this.getCounts(dice);
    const hasFour = Object.values(counts).some((c) => c >= 4);
    return hasFour ? dice.reduce((s, d) => s + d, 0) : 0;
  }

  private fullHouse(dice: number[]): number {
    const counts = this.getCounts(dice);
    const vals = Object.values(counts);
    const hasThree = vals.some((c) => c === 3);
    const hasTwo = vals.some((c) => c === 2);
    return hasThree && hasTwo ? dice.reduce((s, d) => s + d, 0) : 0;
  }

  private smallStraight(dice: number[]): boolean {
    const unique = Array.from(new Set(dice)).sort((a, b) => a - b);
    const sequences = [
      [1, 2, 3, 4],
      [2, 3, 4, 5],
      [3, 4, 5, 6],
    ];
    return sequences.some((seq) =>
      seq.every((n) => unique.includes(n)),
    );
  }

  private largeStraight(dice: number[]): boolean {
    const unique = Array.from(new Set(dice)).sort((a, b) => a - b);
    if (unique.length !== 5) return false;
    const sequences = [
      [1, 2, 3, 4, 5],
      [2, 3, 4, 5, 6],
    ];
    return sequences.some((seq) => seq.every((n, i) => unique[i] === n));
  }

  private yacht(dice: number[]): boolean {
    return dice.every((d) => d === dice[0]);
  }
}
