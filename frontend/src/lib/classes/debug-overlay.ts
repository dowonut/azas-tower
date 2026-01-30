import {
  Container,
  FederatedPointerEvent,
  Text,
  Ticker,
  type ContainerOptions,
  type PointData,
} from "pixi.js";
import { isometricToCartesian } from "../functions/isometric-to-cartesian";
import { toTextPoint } from "../functions/to-text-point";
import type { World } from "./world";
import type { Server } from "./server";

export class DebugOverlay extends Container {
  debugText: Text;
  ping: string = "";
  mouse: {
    screen: PointData;
    world: PointData;
    tile: PointData;
    PF: PointData;
  } = {
    screen: { x: 0, y: 0 },
    world: { x: 0, y: 0 },
    tile: { x: 0, y: 0 },
    PF: { x: 0, y: 0 },
  };

  constructor({
    ticker,
    world,
    server,
    worldContainer,
    ...options
  }: ContainerOptions & {
    ticker: Ticker;
    world: World;
    server: Server;
    worldContainer: Container;
  }) {
    super(options);

    this.x = 10;

    const debugText = new Text({
      text: "",
    });

    this.debugText = debugText;
    this.addChild(debugText);

    // Handle world mouse movement
    worldContainer.onglobalmousemove = (e: FederatedPointerEvent) => {
      // Capture and round global (screen) point
      const globalPoint = {
        x: Math.round(e.globalX),
        y: Math.round(e.globalY),
      };

      // Convert to local point within the map
      const worldPoint = worldContainer.toLocal(globalPoint) || globalPoint;

      // Round local position
      const roundedPosition = {
        x: Math.floor(worldPoint.x),
        y: Math.floor(worldPoint.y),
      };

      // Calculate tile position
      const tilePosition = isometricToCartesian(roundedPosition);

      // Calculate pathfinding grid position
      const pathfindingGridPosition = isometricToCartesian(roundedPosition, {
        tileRatio: world.pathfindingGridRatio,
      });

      this.mouse.screen = globalPoint;
      this.mouse.world = roundedPosition;
      // this.mousePosition3D = toWorldPoint(roundedPosition);
      this.mouse.tile = tilePosition;
      this.mouse.PF = pathfindingGridPosition;
    };

    // Regularly ping server to set latency
    setInterval(() => {
      if (server.socket.connected) {
        server.ping().then((ping) => (this.ping = `${ping}ms`));
      } else {
        this.ping = "NO CONNECTION";
      }
    }, 1 * 1000);

    const debugTicker = new Ticker();
    debugTicker.minFPS = 1;
    debugTicker.maxFPS = 10;
    debugTicker.add(async (_) => {
      const fpsDisplay = Math.round(ticker.FPS);
      this.debugText.text = `FPS: ${fpsDisplay}
Ping: ${this.ping}
Mouse (Screen): ${toTextPoint(this.mouse.screen)}
Mouse (World): ${toTextPoint(this.mouse.world)}
Mouse (Tile): ${toTextPoint(this.mouse.tile)}
Mouse (PF): ${toTextPoint(this.mouse.PF)}`;
    });
    debugTicker.start();
  }
}
