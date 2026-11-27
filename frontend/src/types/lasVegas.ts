import { GameState } from './game';

export const LAS_VEGAS_ROUNDS = { min: 1, max: 10, default: 4 };

export interface Casino {
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
  casinos: Casino[];
  players: LasVegasPlayer[];
  lastRound: RoundResult | null;
  isFinished: boolean;
  winners: number[] | null;
}

export type AnyGameState = GameState | LasVegasState;

export function isLasVegasState(state: AnyGameState): state is LasVegasState {
  return 'casinos' in state;
}
