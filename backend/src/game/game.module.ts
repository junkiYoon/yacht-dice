import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { RoomService } from './room.service';

@Module({
  controllers: [GameController],
  providers: [GameService, RoomService, GameGateway],
})
export class GameModule {}
