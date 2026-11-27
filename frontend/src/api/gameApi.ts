import axios from 'axios';
import { BACKEND_URL } from '../config';
import { Category, GameState } from '../types/game';
import { LasVegasState } from '../types/lasVegas';

const api = axios.create({
  baseURL: `${BACKEND_URL}/api`,
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

export const lasVegasApi = {
  createGame: (playerCount: number, rounds: number): Promise<LasVegasState> =>
    api.post<LasVegasState>('/las-vegas', { playerCount, rounds }).then((r) => r.data),

  roll: (id: string): Promise<LasVegasState> =>
    api.post<LasVegasState>(`/las-vegas/${id}/roll`).then((r) => r.data),

  place: (id: string, value: number): Promise<LasVegasState> =>
    api.post<LasVegasState>(`/las-vegas/${id}/place`, { value }).then((r) => r.data),
};
