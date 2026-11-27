import { GameType } from './game';

export interface RoomPlayer {
  socketId: string;
  name: string;
  playerIndex: number;
}

export interface OnlineSession {
  roomCode: string;
  playerIndex: number;
  isHost: boolean;
  players: RoomPlayer[];
  maxPlayers: number;
  playerName: string;
  gameType: GameType;
  rounds: number;
}

export interface PublicRoom {
  code: string;
  playerCount: number;
  maxPlayers: number;
  gameType: GameType;
  rounds: number;
}
