import { io, type Socket } from "socket.io-client";

export type ServerMessageAuthorType = "user" | "server" | "other";

export type ServerMessage = {
  authorType: ServerMessageAuthorType;
  authorName: string | null;
  content: string;
};

export type ClientMessage = {
  content: string;
};

export type ServerToClientEvents = {
  ping: () => void;
  message: (message: ServerMessage) => void;
};

export type ClientToServerEvents = {
  pong: () => void;
  message: (message: ClientMessage) => void;
};

export class Server {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  constructor() {
    this.socket = io(import.meta.env.VITE_SERVER_URL, {
      autoConnect: false,
    });

    this.socket.on("connect", () => {
      console.info(`Connected to server`);
    });

    this.socket.on("connect_error", (err) => {
      console.error(`Failed to connect to server`, err);
    });

    this.socket.on("disconnect", (reason) => {
      console.warn(`Disconnected from server`, reason);
    });
  }

  /** Tell the server that the client is done initializing */
  connect() {
    return this.socket.connect();
  }

  /** Listen to messages from the server */
  onMessage(callback: ServerToClientEvents["message"]) {
    return this.socket.on("message", callback);
  }

  /** Send a message to the server */
  sendMessage(...data: Parameters<ClientToServerEvents["message"]>) {
    return this.socket.emit("message", ...data);
  }
}
