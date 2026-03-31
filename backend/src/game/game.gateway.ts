import {
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
  SubscribeMessage,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { Category } from './domain/board';
import { RoomService } from './room.service';

@WebSocketGateway({ cors: { origin: process.env.CORS_ORIGIN ?? '*' } })
export class GameGateway implements OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  constructor(private readonly roomService: RoomService) {}

  @SubscribeMessage('create-room')
  handleCreateRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { maxPlayers: number; playerName: string },
  ) {
    try {
      const room = this.roomService.createRoom(
        client.id,
        data.maxPlayers,
        data.playerName,
      );
      client.join(room.code);
      client.emit('room-created', {
        roomCode: room.code,
        playerIndex: 0,
        isHost: true,
        players: room.players,
        maxPlayers: room.maxPlayers,
      });
    } catch (e) {
      this.emitError(client, e);
    }
  }

  @SubscribeMessage('join-room')
  handleJoinRoom(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; playerName: string },
  ) {
    try {
      const room = this.roomService.joinRoom(
        client.id,
        data.roomCode,
        data.playerName,
      );
      client.join(room.code);

      const player = room.players.find((p) => p.socketId === client.id)!;
      client.emit('room-joined', {
        roomCode: room.code,
        playerIndex: player.playerIndex,
        isHost: false,
        players: room.players,
        maxPlayers: room.maxPlayers,
      });
      client.to(room.code).emit('room-updated', { players: room.players });
    } catch (e) {
      this.emitError(client, e);
    }
  }

  @SubscribeMessage('start-game')
  handleStartGame(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string },
  ) {
    try {
      const room = this.roomService.startGame(client.id, data.roomCode);
      const playerNames = room.players.map((p) => p.name);
      this.server.to(room.code).emit('game-started', {
        gameState: room.game!.getState(),
        playerNames,
      });
    } catch (e) {
      this.emitError(client, e);
    }
  }

  /**
   * Broadcast to others that this player has started shaking the dice.
   * No game logic — purely a UI sync signal.
   */
  @SubscribeMessage('player-rolling')
  handlePlayerRolling(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string },
  ) {
    client.to(data.roomCode).emit('player-rolling');
  }

  /**
   * Broadcast to others that this player cancelled the roll animation.
   */
  @SubscribeMessage('player-rolling-cancelled')
  handlePlayerRollingCancelled(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string },
  ) {
    client.to(data.roomCode).emit('player-rolling-cancelled');
  }

  @SubscribeMessage('roll')
  handleRoll(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string },
  ) {
    try {
      // Other players are already animating (via player-rolling event), so
      // we process immediately and let the landing animation play for everyone.
      const room = this.roomService.roll(client.id, data.roomCode);
      this.server.to(room.code).emit('game-updated', {
        gameState: room.game!.getState(),
      });
    } catch (e) {
      this.emitError(client, e);
    }
  }

  @SubscribeMessage('toggle-pin')
  handleTogglePin(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; index: number },
  ) {
    try {
      const room = this.roomService.togglePin(
        client.id,
        data.roomCode,
        data.index,
      );
      this.server.to(room.code).emit('game-updated', {
        gameState: room.game!.getState(),
      });
    } catch (e) {
      this.emitError(client, e);
    }
  }

  @SubscribeMessage('score')
  handleScore(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomCode: string; category: Category },
  ) {
    try {
      const room = this.roomService.score(
        client.id,
        data.roomCode,
        data.category,
      );
      this.server.to(room.code).emit('game-updated', {
        gameState: room.game!.getState(),
      });
    } catch (e) {
      this.emitError(client, e);
    }
  }

  handleDisconnect(client: Socket) {
    const result = this.roomService.removePlayerBySocket(client.id);
    if (result) {
      this.server.to(result.room.code).emit('room-destroyed', {
        reason: `'${result.player.name}'의 연결이 끊어졌습니다.`,
      });
    }
  }

  private emitError(client: Socket, e: unknown) {
    client.emit('error', {
      message: e instanceof Error ? e.message : '오류가 발생했습니다.',
    });
  }
}
