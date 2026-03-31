export interface RoomPlayer {
  socketId: string;
  name: string;
  playerIndex: number;
}

export interface OnlineSession {
  roomCode: string;
  playerIndex: number;
  isHost: boolean;
  players: RoomPlayer[];
  maxPlayers: number;
  playerName: string;
}
