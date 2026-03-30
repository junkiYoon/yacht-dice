import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { GameService } from './game.service';
import { PinDiceDto } from './dto/pin-dice.dto';
import { ScoreDto } from './dto/score.dto';

@Controller('api/game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  create() {
    return this.gameService.create();
  }

  @Get(':id')
  getState(@Param('id') id: string) {
    return this.gameService.getState(id);
  }

  @Post(':id/roll')
  roll(@Param('id') id: string) {
    try {
      return this.gameService.roll(id);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post(':id/pin')
  togglePin(@Param('id') id: string, @Body() body: PinDiceDto) {
    try {
      return this.gameService.togglePin(id, body.index);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }

  @Post(':id/score')
  score(@Param('id') id: string, @Body() body: ScoreDto) {
    try {
      return this.gameService.score(id, body.category);
    } catch (e) {
      throw new BadRequestException(e.message);
    }
  }
}
