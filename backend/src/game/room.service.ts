import { Injectable } from '@nestjs/common';
import { Category } from './domain/board';
import {
  clampRounds,
  LAS_VEGAS_MAX_PLAYERS,
  LAS_VEGAS_MIN_PLAYERS,
  LasVegasGame,
} from './domain/las-vegas-game';
import { MultiPlayerGame } from './domain/multi-player-game';

export type GameType = 'yacht' | 'lasVegas';

const PLAYER_LIMITS: Record<GameType, { min: number; max: number }> = {
  yacht: { min: 1, max: 6 },
  lasVegas: { min: LAS_VEGAS_MIN_PLAYERS, max: LAS_VEGAS_MAX_PLAYERS },
};

const UNSUPPORTED_ACTION = '이 게임에서 지원하지 않는 동작입니다.';

export interface RoomPlayer {
  socketId: string;
  name: string;
  playerIndex: number;
}

export interface GameRoom {
  code: string;
  hostSocketId: string;
  maxPlayers: number;
  players: RoomPlayer[];
  gameType: GameType;
  rounds: number;
  game: MultiPlayerGame | LasVegasGame | null;
  status: 'waiting' | 'playing';
}

export interface PublicRoom {
  code: string;
  playerCount: number;
  maxPlayers: number;
  gameType: GameType;
  rounds: number;
}

export interface RemoveResult {
  room: GameRoom;
  player: RoomPlayer;
  destroyed: boolean;
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from(
    { length: 6 },
    () => chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

@Injectable()
export class RoomService {
  private rooms = new Map<string, GameRoom>();

  createRoom(
    socketId: string,
    maxPlayers: number,
    playerName: string,
    gameType: GameType,
    rounds: unknown,
  ): GameRoom {
    let code: string;
    do {
      code = generateCode();
    } while (this.rooms.has(code));

    const { min, max } = PLAYER_LIMITS[gameType];
    const room: GameRoom = {
      code,
      hostSocketId: socketId,
      maxPlayers: Math.max(min, Math.min(max, maxPlayers)),
      players: [{ socketId, name: playerName, playerIndex: 0 }],
      gameType,
      rounds: clampRounds(rounds),
      game: null,
      status: 'waiting',
    };
    this.rooms.set(code, room);
    return room;
  }

  joinRoom(socketId: string, code: string, playerName: string): GameRoom {
    const room = this.findRoom(code);
    if (room.status === 'playing') {
      throw new Error('이미 게임이 시작된 방입니다.');
    }
    if (room.players.length >= room.maxPlayers) {
      throw new Error('방이 가득 찼습니다.');
    }
    if (room.players.some((p) => p.socketId === socketId)) {
      throw new Error('이미 참가한 방입니다.');
    }

    const playerIndex = room.players.length;
    room.players.push({ socketId, name: playerName, playerIndex });
    return room;
  }

  startGame(socketId: string, code: string): GameRoom {
    const room = this.findRoom(code);
    if (room.hostSocketId !== socketId) {
      throw new Error('방장만 게임을 시작할 수 있습니다.');
    }
    if (room.status === 'playing') {
      throw new Error('이미 게임이 시작되었습니다.');
    }

    const playerCount = room.players.length;
    room.game =
      room.gameType === 'lasVegas'
        ? new LasVegasGame(playerCount, room.rounds)
        : new MultiPlayerGame(playerCount);
    room.status = 'playing';
    return room;
  }

  roll(socketId: string, code: string): GameRoom {
    const { room, player } = this.getActivePlayer(socketId, code);
    this.validateTurn(room, player);
    room.game!.roll();
    return room;
  }

  togglePin(socketId: string, code: string, index: number): GameRoom {
    const { room, player } = this.getActivePlayer(socketId, code);
    this.validateTurn(room, player);
    if (!(room.game instanceof MultiPlayerGame)) {
      throw new Error(UNSUPPORTED_ACTION);
    }
    room.game.togglePin(index);
    return room;
  }

  score(socketId: string, code: string, category: Category): GameRoom {
    const { room, player } = this.getActivePlayer(socketId, code);
    this.validateTurn(room, player);
    if (!(room.game instanceof MultiPlayerGame)) {
      throw new Error(UNSUPPORTED_ACTION);
    }
    room.game.score(category);
    return room;
  }

  place(socketId: string, code: string, value: number): GameRoom {
    const { room, player } = this.getActivePlayer(socketId, code);
    this.validateTurn(room, player);
    if (!(room.game instanceof LasVegasGame)) {
      throw new Error(UNSUPPORTED_ACTION);
    }
    room.game.place(value);
    return room;
  }

  listRooms(): PublicRoom[] {
    const result: PublicRoom[] = [];
    for (const room of this.rooms.values()) {
      if (room.status === 'waiting') {
        result.push({
          code: room.code,
          playerCount: room.players.length,
          maxPlayers: room.maxPlayers,
          gameType: room.gameType,
          rounds: room.rounds,
        });
      }
    }
    return result;
  }

  /** Removes the player from any room they are in. Returns RemoveResult or null. */
  removePlayerBySocket(socketId: string): RemoveResult | null {
    for (const room of this.rooms.values()) {
      const player = room.players.find((p) => p.socketId === socketId);
      if (player) {
        // If game is playing, destroy the room
        if (room.status === 'playing') {
          this.rooms.delete(room.code);
          return { room, player, destroyed: true };
        }

        // Waiting: if last player, destroy room
        if (room.players.length <= 1) {
          this.rooms.delete(room.code);
          return { room, player, destroyed: true };
        }

        // Waiting: others remain — remove player, reindex, transfer host if needed
        room.players = room.players.filter((p) => p.socketId !== socketId);
        // Reindex player indices to be 0-based sequential
        room.players.forEach((p, i) => {
          p.playerIndex = i;
        });
        // Transfer host if needed
        if (room.hostSocketId === socketId) {
          room.hostSocketId = room.players[0].socketId;
        }
        return { room, player, destroyed: false };
      }
    }
    return null;
  }

  private validateTurn(room: GameRoom, player: RoomPlayer): void {
    if (room.game!.getState().currentPlayer !== player.playerIndex) {
      throw new Error('현재 차례가 아닙니다.');
    }
  }

  private findRoom(code: string): GameRoom {
    const room = this.rooms.get(code.toUpperCase());
    if (!room) throw new Error('방을 찾을 수 없습니다.');
    return room;
  }

  private getActivePlayer(socketId: string, code: string) {
    const room = this.findRoom(code);
    if (!room.game) throw new Error('게임이 시작되지 않았습니다.');
    const player = room.players.find((p) => p.socketId === socketId);
    if (!player) throw new Error('방에 참가하지 않았습니다.');
    return { room, player };
  }
}
