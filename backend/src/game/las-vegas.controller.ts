import {
  BadRequestException,
  Body,
  Controller,
  Get,
  HttpException,
  Param,
  Post,
} from '@nestjs/common';
import {
  clampRounds,
  LAS_VEGAS_MAX_PLAYERS,
  LAS_VEGAS_MIN_PLAYERS,
  LasVegasState,
} from './domain/las-vegas-game';
import { CreateLasVegasDto } from './dto/create-las-vegas.dto';
import { PlaceDiceDto } from './dto/place-dice.dto';
import { LasVegasService } from './las-vegas.service';

@Controller('api/las-vegas')
export class LasVegasController {
  constructor(private readonly lasVegasService: LasVegasService) {}

  @Post()
  create(@Body() body: CreateLasVegasDto) {
    const playerCount = Math.max(
      LAS_VEGAS_MIN_PLAYERS,
      Math.min(LAS_VEGAS_MAX_PLAYERS, body.playerCount ?? 2),
    );
    const rounds = clampRounds(body.rounds);
    return this.run(() => this.lasVegasService.create(playerCount, rounds));
  }

  @Get(':id')
  getState(@Param('id') id: string) {
    return this.lasVegasService.getState(id);
  }

  @Post(':id/roll')
  roll(@Param('id') id: string) {
    return this.run(() => this.lasVegasService.roll(id));
  }

  @Post(':id/place')
  place(@Param('id') id: string, @Body() body: PlaceDiceDto) {
    return this.run(() => this.lasVegasService.place(id, body.value));
  }

  private run(action: () => LasVegasState): LasVegasState {
    try {
      return action();
    } catch (e: unknown) {
      if (e instanceof HttpException) throw e;
      throw new BadRequestException(
        e instanceof Error ? e.message : '오류가 발생했습니다.',
      );
    }
  }
}
