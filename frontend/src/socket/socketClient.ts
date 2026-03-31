import { io, Socket } from 'socket.io-client';
import { BACKEND_URL } from '../config';

let socket: Socket | null = null;

export function getSocket(): Socket {
  if (!socket) {
    socket = io(BACKEND_URL, {
      reconnection: false, // room is destroyed on disconnect — no point retrying
    });
  }
  return socket;
}

export function disconnectSocket() {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
}

export type { Socket };
