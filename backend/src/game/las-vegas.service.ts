import { Injectable, NotFoundException } from '@nestjs/common';
import { LasVegasGame, LasVegasState } from './domain/las-vegas-game';

@Injectable()
export class LasVegasService {
  private games = new Map<string, LasVegasGame>();

  create(playerCount: number, rounds: number): LasVegasState {
    const game = new LasVegasGame(playerCount, rounds);
    this.games.set(game.id, game);
    return game.getState();
  }

  getState(id: string): LasVegasState {
    return this.findGame(id).getState();
  }

  roll(id: string): LasVegasState {
    const game = this.findGame(id);
    game.roll();
    return game.getState();
  }

  place(id: string, value: number): LasVegasState {
    const game = this.findGame(id);
    game.place(value);
    return game.getState();
  }

  private findGame(id: string): LasVegasGame {
    const game = this.games.get(id);
    if (!game) {
      throw new NotFoundException(`게임을 찾을 수 없습니다: ${id}`);
    }
    return game;
  }
}
