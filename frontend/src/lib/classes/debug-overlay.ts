import {
  Container,
  FederatedPointerEvent,
  Text,
  Ticker,
  type ContainerOptions,
  type PointData,
} from "pixi.js";
import type { World } from "./world";
import { toTextPoint } from "../functions/to-text-point";
import { toTilePosition } from "../functions/to-tile-position";
import type { WorldPoint } from "../types";
import { toWorldPoint } from "../functions/to-world-point";

export class DebugOverlay extends Container {
  debugText: Text;
  mousePosition2D: PointData = { x: 0, y: 0 };
  mousePosition3D: WorldPoint = { x: 0, y: 0, z: 0 };
  mousePositionTile: PointData = { x: 0, y: 0 };

  constructor({
    ticker,
    world,
    worldContainer,
    ...options
  }: ContainerOptions & {
    ticker: Ticker;
    world: World;
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
    worldContainer.onmousemove = (e: FederatedPointerEvent) => {
      // Capture and round global (screen) point
      const globalPoint = {
        x: Math.round(e.globalX),
        y: Math.round(e.globalY),
      };

      // Convert to local point within the map
      const localPoint = worldContainer.toLocal(globalPoint) || globalPoint;

      // Round local position
      const roundedPosition = {
        x: Math.floor(localPoint.x),
        y: Math.floor(localPoint.y),
      };

      // Calculate tile position
      const tilePosition = toTilePosition(roundedPosition);

      this.mousePosition2D = roundedPosition;
      this.mousePosition3D = toWorldPoint(roundedPosition);
      this.mousePositionTile = tilePosition;
    };

    const debugTicker = new Ticker();
    debugTicker.minFPS = 1;
    debugTicker.maxFPS = 5;
    debugTicker.add((_) => {
      const fpsDisplay = Math.round(ticker.FPS);
      this.debugText.text = `FPS: ${fpsDisplay}
Mouse (2D): ${toTextPoint(this.mousePosition2D)}
Mouse (3D): ${toTextPoint(this.mousePosition3D)}
Mouse (Tile): ${toTextPoint(this.mousePositionTile)}`;
    });
    debugTicker.start();
  }
}
