import { Injectable } from '@nestjs/common';
import { Category } from './domain/board';
import { MultiPlayerGame } from './domain/multi-player-game';

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
  game: MultiPlayerGame | null;
  status: 'waiting' | 'playing';
}

function generateCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () =>
    chars[Math.floor(Math.random() * chars.length)],
  ).join('');
}

@Injectable()
export class RoomService {
  private rooms = new Map<string, GameRoom>();

  createRoom(socketId: string, maxPlayers: number, playerName: string): GameRoom {
    let code: string;
    do {
      code = generateCode();
    } while (this.rooms.has(code));

    const room: GameRoom = {
      code,
      hostSocketId: socketId,
      maxPlayers: Math.max(1, Math.min(6, maxPlayers)),
      players: [{ socketId, name: playerName, playerIndex: 0 }],
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

    room.game = new MultiPlayerGame(room.players.length);
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
    room.game!.togglePin(index);
    return room;
  }

  score(socketId: string, code: string, category: Category): GameRoom {
    const { room, player } = this.getActivePlayer(socketId, code);
    this.validateTurn(room, player);
    room.game!.score(category);
    return room;
  }

  /** Removes the player from any room they are in. Returns the room if found. */
  removePlayerBySocket(socketId: string): { room: GameRoom; player: RoomPlayer } | null {
    for (const room of this.rooms.values()) {
      const player = room.players.find((p) => p.socketId === socketId);
      if (player) {
        this.rooms.delete(room.code);
        return { room, player };
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
