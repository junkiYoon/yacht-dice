import { Module } from '@nestjs/common';
import { GameController } from './game.controller';
import { GameGateway } from './game.gateway';
import { GameService } from './game.service';
import { LasVegasController } from './las-vegas.controller';
import { LasVegasService } from './las-vegas.service';
import { RoomService } from './room.service';

@Module({
  controllers: [GameController, LasVegasController],
  providers: [GameService, LasVegasService, RoomService, GameGateway],
})
export class GameModule {}
