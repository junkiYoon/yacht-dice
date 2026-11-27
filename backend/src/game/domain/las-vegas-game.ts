import { randomInt, randomUUID } from 'crypto';

export const LAS_VEGAS_MIN_PLAYERS = 2;
export const LAS_VEGAS_MAX_PLAYERS = 5;
export const LAS_VEGAS_MIN_ROUNDS = 1;
export const LAS_VEGAS_MAX_ROUNDS = 10;
export const LAS_VEGAS_DEFAULT_ROUNDS = 4;

const CASINO_COUNT = 6;
const DICE_PER_PLAYER = 8;
const MIN_CASINO_PAYOUT = 50_000;

const BILL_COUNTS: [bill: number, count: number][] = [
  [10_000, 6],
  [20_000, 8],
  [30_000, 8],
  [40_000, 6],
  [50_000, 6],
  [60_000, 5],
  [70_000, 5],
  [80_000, 5],
  [90_000, 5],
];

export interface CasinoState {
  bills: number[];
  dice: number[];
}

export interface LasVegasPlayer {
  money: number;
  diceLeft: number;
}

export interface Payout {
  casino: number;
  player: number;
  bill: number;
}

export interface RoundResult {
  round: number;
  payouts: Payout[];
}

export interface LasVegasState {
  id: string;
  playerCount: number;
  round: number;
  totalRounds: number;
  startPlayer: number;
  currentPlayer: number;
  roll: number[] | null;
  casinos: CasinoState[];
  players: LasVegasPlayer[];
  lastRound: RoundResult | null;
  isFinished: boolean;
  winners: number[] | null;
}

export function clampRounds(value: unknown): number {
  const rounds = Math.round(Number(value));
  if (!Number.isFinite(rounds)) return LAS_VEGAS_DEFAULT_ROUNDS;
  return Math.max(LAS_VEGAS_MIN_ROUNDS, Math.min(LAS_VEGAS_MAX_ROUNDS, rounds));
}

function rollDie(): number {
  return randomInt(1, 7);
}

function sum(values: number[]): number {
  return values.reduce((acc, v) => acc + v, 0);
}

function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = randomInt(0, i + 1);
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

function createDeck(): number[] {
  return shuffle(
    BILL_COUNTS.flatMap(([bill, count]) => Array<number>(count).fill(bill)),
  );
}

export function settleCasino(
  bills: number[],
  diceByOwner: [owner: number, count: number][],
): { player: number; bill: number }[] {
  const placed = diceByOwner.filter(([, count]) => count > 0);
  const ranked = placed
    .filter(
      ([, count]) => placed.filter(([, other]) => other === count).length === 1,
    )
    .sort((a, b) => b[1] - a[1]);
  const sortedBills = [...bills].sort((a, b) => b - a);
  return ranked
    .slice(0, sortedBills.length)
    .map(([player], i) => ({ player, bill: sortedBills[i] }));
}

export class LasVegasGame {
  readonly id: string;
  readonly playerCount: number;
  readonly totalRounds: number;
  private deck: number[];
  private players: LasVegasPlayer[];
  private casinos: CasinoState[] = [];
  private round = 1;
  private startPlayer = 0;
  private currentPlayer = 0;
  private currentRoll: number[] | null = null;
  private lastRound: RoundResult | null = null;
  private finished = false;

  constructor(playerCount: number, totalRounds = LAS_VEGAS_DEFAULT_ROUNDS) {
    if (
      !Number.isInteger(playerCount) ||
      playerCount < LAS_VEGAS_MIN_PLAYERS ||
      playerCount > LAS_VEGAS_MAX_PLAYERS
    ) {
      throw new Error(
        `라스베가스는 ${LAS_VEGAS_MIN_PLAYERS}~${LAS_VEGAS_MAX_PLAYERS}명이 플레이할 수 있습니다.`,
      );
    }
    if (
      !Number.isInteger(totalRounds) ||
      totalRounds < LAS_VEGAS_MIN_ROUNDS ||
      totalRounds > LAS_VEGAS_MAX_ROUNDS
    ) {
      throw new Error(
        `라운드 수는 ${LAS_VEGAS_MIN_ROUNDS}~${LAS_VEGAS_MAX_ROUNDS} 사이여야 합니다.`,
      );
    }
    this.id = randomUUID();
    this.playerCount = playerCount;
    this.totalRounds = totalRounds;
    this.deck = createDeck();
    this.players = Array.from({ length: playerCount }, () => ({
      money: 0,
      diceLeft: 0,
    }));
    this.startRound();
  }

  roll(): void {
    this.assertInProgress();
    if (this.currentRoll) {
      throw new Error('이미 굴렸습니다. 주사위를 놓을 카지노를 선택해주세요.');
    }
    const { diceLeft } = this.players[this.currentPlayer];
    this.currentRoll = Array.from({ length: diceLeft }, () => rollDie());
  }

  place(value: number): void {
    this.assertInProgress();
    if (!this.currentRoll) {
      throw new Error('주사위를 먼저 굴려야 합니다.');
    }
    const count = this.currentRoll.filter((v) => v === value).length;
    if (count === 0) {
      throw new Error('굴려서 나온 눈만 선택할 수 있습니다.');
    }

    this.casinos[value - 1].dice[this.currentPlayer] += count;
    this.players[this.currentPlayer].diceLeft -= count;
    this.currentRoll = null;

    const next = this.nextPlayerWithDice();
    if (next === null) {
      this.endRound();
    } else {
      this.currentPlayer = next;
    }
  }

  getState(): LasVegasState {
    return {
      id: this.id,
      playerCount: this.playerCount,
      round: this.round,
      totalRounds: this.totalRounds,
      startPlayer: this.startPlayer,
      currentPlayer: this.currentPlayer,
      roll: this.currentRoll ? [...this.currentRoll] : null,
      casinos: this.casinos.map((c) => ({
        bills: [...c.bills],
        dice: [...c.dice],
      })),
      players: this.players.map((p) => ({ ...p })),
      lastRound: this.lastRound,
      isFinished: this.finished,
      winners: this.finished ? this.getWinners() : null,
    };
  }

  private startRound(): void {
    this.casinos = Array.from({ length: CASINO_COUNT }, () => ({
      bills: this.dealBills(),
      dice: Array<number>(this.playerCount).fill(0),
    }));
    for (const player of this.players) {
      player.diceLeft = DICE_PER_PLAYER;
    }
    this.startPlayer = (this.round - 1) % this.playerCount;
    this.currentPlayer = this.startPlayer;
    this.currentRoll = null;
  }

  private dealBills(): number[] {
    const bills: number[] = [];
    while (sum(bills) < MIN_CASINO_PAYOUT) {
      // shortcut: a fresh deck can repeat bills players already hold, reshuffle only unclaimed bills if exact counts ever matter
      if (this.deck.length === 0) this.deck = createDeck();
      bills.push(this.deck.pop()!);
    }
    return bills.sort((a, b) => b - a);
  }

  private endRound(): void {
    const payouts = this.casinos.flatMap((casino, i) =>
      settleCasino(
        casino.bills,
        casino.dice.map((count, p): [number, number] => [p, count]),
      ).map((result) => ({ casino: i + 1, ...result })),
    );
    for (const { player, bill } of payouts) {
      this.players[player].money += bill;
    }
    this.lastRound = { round: this.round, payouts };

    if (this.round === this.totalRounds) {
      this.finished = true;
      return;
    }
    this.round++;
    this.startRound();
  }

  private nextPlayerWithDice(): number | null {
    for (let step = 1; step <= this.playerCount; step++) {
      const i = (this.currentPlayer + step) % this.playerCount;
      if (this.players[i].diceLeft > 0) return i;
    }
    return null;
  }

  private assertInProgress(): void {
    if (this.finished) {
      throw new Error('게임이 종료되었습니다.');
    }
  }

  private getWinners(): number[] {
    const maxMoney = Math.max(...this.players.map((p) => p.money));
    return this.players.flatMap((p, i) => (p.money === maxMoney ? [i] : []));
  }
}
