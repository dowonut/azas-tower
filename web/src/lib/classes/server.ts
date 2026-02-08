import type {
  ClientMessage,
  ClientSyncPacket,
  GameState,
  ServerMessage,
} from "@generated/server.ts";
import type { PointData } from "pixi.js";
import { io, type Socket } from "socket.io-client";

export type ServerToClientEvents = {
  message: (message: ServerMessage) => void;
  messages: (messages: ServerMessage[]) => void;
  state: (state: GameState) => void;
  sync: (sync: ClientSyncPacket) => void;
};

export type ClientToServerEvents = {
  ping: (callback: (value: "pong") => void) => void;
  message: (message: ClientMessage) => void;
  "player:move": (point: PointData) => void;
};

export class Server {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;

  constructor() {
    this.socket = io(import.meta.env.VITE_SERVER_URL, {
      path: "/ws",
      autoConnect: false,
      transports: ["websocket"],
    });

    this.socket.on("connect", () => {
      console.info(`Connected to server`);
    });

    this.socket.on("connect_error", (err) => {
      console.error(`Failed to connect to server:`, err);
    });

    this.socket.on("disconnect", (reason) => {
      console.warn(`Disconnected from server:`, reason);
    });
  }

  /** Tell the server that the client is done initializing */
  connect() {
    return this.socket.connect();
  }

  /** Ping the server and return latency in ms */
  async ping() {
    const start = Date.now();
    await this.socket.emitWithAck("ping");
    const duration = Date.now() - start;
    return duration;
  }

  /** Listen to messages from the server */
  onMessage(callback: ServerToClientEvents["message"]) {
    return this.socket.on("message", callback);
  }

  /** Listen to messages from the server */
  onMessages(callback: ServerToClientEvents["messages"]) {
    return this.socket.on("messages", callback);
  }

  /** Send a message to the server */
  sendMessage(...data: Parameters<ClientToServerEvents["message"]>) {
    return this.socket.emit("message", ...data);
  }

  /** Listen to game state changes from the server */
  onState(callback: ServerToClientEvents["state"]) {
    return this.socket.on("state", callback);
  }

  /** Listen to sync events from the server */
  onSync(callback: ServerToClientEvents["sync"]) {
    return this.socket.on("sync", callback);
  }
}
