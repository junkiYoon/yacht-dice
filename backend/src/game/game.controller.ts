import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
} from '@nestjs/common';
import { GameService } from './game.service';
import { CreateGameDto } from './dto/create-game.dto';
import { PinDiceDto } from './dto/pin-dice.dto';
import { ScoreDto } from './dto/score.dto';

@Controller('api/game')
export class GameController {
  constructor(private readonly gameService: GameService) {}

  @Post()
  create(@Body() body: CreateGameDto) {
    const playerCount = Math.max(1, Math.min(6, body.playerCount ?? 2));
    return this.gameService.create(playerCount);
  }

  @Get(':id')
  getState(@Param('id') id: string) {
    return this.gameService.getState(id);
  }

  @Post(':id/roll')
  roll(@Param('id') id: string) {
    try {
      return this.gameService.roll(id);
    } catch (e: unknown) {
      throw new BadRequestException(
        e instanceof Error ? e.message : '오류가 발생했습니다.',
      );
    }
  }

  @Post(':id/pin')
  togglePin(@Param('id') id: string, @Body() body: PinDiceDto) {
    try {
      return this.gameService.togglePin(id, body.index);
    } catch (e: unknown) {
      throw new BadRequestException(
        e instanceof Error ? e.message : '오류가 발생했습니다.',
      );
    }
  }

  @Post(':id/score')
  score(@Param('id') id: string, @Body() body: ScoreDto) {
    try {
      return this.gameService.score(id, body.category);
    } catch (e: unknown) {
      throw new BadRequestException(
        e instanceof Error ? e.message : '오류가 발생했습니다.',
      );
    }
  }
}
