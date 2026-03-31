import axios from 'axios';
import { Category, GameState } from '../types/game';

const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

export const gameApi = {
  createGame: (playerCount: number): Promise<GameState> =>
    api.post<GameState>('/game', { playerCount }).then((r) => r.data),

  getState: (id: string): Promise<GameState> =>
    api.get<GameState>(`/game/${id}`).then((r) => r.data),

  roll: (id: string): Promise<GameState> =>
    api.post<GameState>(`/game/${id}/roll`).then((r) => r.data),

  togglePin: (id: string, index: number): Promise<GameState> =>
    api.post<GameState>(`/game/${id}/pin`, { index }).then((r) => r.data),

  score: (id: string, category: Category): Promise<GameState> =>
    api.post<GameState>(`/game/${id}/score`, { category }).then((r) => r.data),
};
