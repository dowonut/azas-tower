import {
  ClientServerEvent,
  ServerClientEvent,
  type ClientMessage,
  type ClientServerEventData,
  type ClientSyncPacket,
  type GameState,
  type ServerClientEventData,
  type ServerMessage,
} from "@generated/server.ts";
import type { PointData } from "pixi.js";
import { io, type Socket } from "socket.io-client";

type ServerToClientEvents = {
  [key in ServerClientEvent]: (
    data: Extract<ServerClientEventData, { type: `${key}` }>["content"],
  ) => void;
};

type ClientToServerEvents = {
  [key in ClientServerEvent]: (
    data: Extract<ClientServerEventData, { type: `${key}` }>["content"],
  ) => void;
};

export class Server {
  socket: Socket<ServerToClientEvents, ClientToServerEvents>;
  // socket: Socket;

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
    await this.socket.emitWithAck(ClientServerEvent.Ping);
    const duration = Date.now() - start;
    return duration;
  }

  on<E extends ServerClientEvent>(event: E, callback: ServerToClientEvents[E]) {
    return this.socket.on(event, callback as any);
  }

  emit<E extends ClientServerEvent>(
    event: E,
    ...data: Parameters<ClientToServerEvents[E]>
  ) {
    return this.socket.emit(event, ...data);
  }

  /** Listen to messages from the server */
  onMessage(callback: ServerToClientEvents[ServerClientEvent.Message]) {
    return this.socket.on(ServerClientEvent.Message, callback);
  }

  /** Send a message to the server */
  sendMessage(
    ...data: Parameters<ClientToServerEvents[ClientServerEvent.Message]>
  ) {
    return this.socket.emit(ClientServerEvent.Message, ...data);
  }

  /** Listen to sync events from the server */
  onSync(callback: ServerToClientEvents[ServerClientEvent.Sync]) {
    return this.socket.on(ServerClientEvent.Sync, callback);
  }
}
