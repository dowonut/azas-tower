import { io, type Socket } from "socket.io-client";

export class Server {
  socket: Socket;

  constructor() {
    this.socket = io(`ws://localhost:3001`);
  }
}

export const server = globalThis.server || new Server();
