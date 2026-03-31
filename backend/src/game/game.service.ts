import { Injectable, NotFoundException } from '@nestjs/common';
import { Category } from './domain/board';
import { GameState, MultiPlayerGame } from './domain/multi-player-game';

@Injectable()
export class GameService {
  private games = new Map<string, MultiPlayerGame>();

  create(playerCount: number): GameState {
    const game = new MultiPlayerGame(playerCount);
    this.games.set(game.id, game);
    return game.getState();
  }

  getState(id: string): GameState {
    const game = this.findGame(id);
    return game.getState();
  }

  roll(id: string): GameState {
    const game = this.findGame(id);
    game.roll();
    return game.getState();
  }

  togglePin(id: string, index: number): GameState {
    const game = this.findGame(id);
    game.togglePin(index);
    return game.getState();
  }

  score(id: string, category: Category): GameState {
    const game = this.findGame(id);
    game.score(category);
    return game.getState();
  }

  private findGame(id: string): MultiPlayerGame {
    const game = this.games.get(id);
    if (!game) {
      throw new NotFoundException(`게임을 찾을 수 없습니다: ${id}`);
    }
    return game;
  }
}
