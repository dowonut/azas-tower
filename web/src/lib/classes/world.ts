import PF from "pathfinding";
import {
  AlphaFilter,
  Container,
  FederatedPointerEvent,
  Graphics,
  GraphicsContext,
  RenderLayer,
  Ticker,
  type ContainerOptions,
} from "pixi.js";

import map from "../../assets/maps/map-1.json";
import tileset from "../../assets/tilesets/background-tileset.json";
import { findPath } from "../functions/find-path";
import { getWalkableTileAt } from "../functions/get-walkable-tile-at";
import { parseTilemap } from "../functions/parse-tilemap";
import { toTextPoint } from "../functions/to-text-point";
import type { Player } from "./player";
import type { WorldTile } from "./world-tile";
import { isometricToCartesian } from "../functions/isometric-to-cartesian";
import { cartesianToIsometric } from "../functions/cartesian-to-isometric";
import type { Server } from "./server";

export class World extends Container {
  player!: Player;
  server!: Server;
  tiles: WorldTile[] = [];
  renderLayers: {
    renderLayer: RenderLayer;
    tiles: WorldTile[];
  }[][] = [];
  highestLayer: number = 0;
  highestDepthLayer: number = 0;
  abovePlayerContainer: Container;
  tileContainer: Container;
  pathfindingGrid: PF.Grid;
  pathfindingGridScale: number = 5;
  pathfindingGridRatio: number;

  constructor(
    options: ContainerOptions = { eventMode: "static", sortableChildren: true },
  ) {
    super(options);

    const alphaFilter = new AlphaFilter({ alpha: 0.33 });
    this.abovePlayerContainer = new Container({
      filters: alphaFilter,
      label: "abovePlayerContainer",
    });
    this.tileContainer = new Container({ label: "tileContainer" });

    this.pathfindingGrid = new PF.Grid(
      map.width * this.pathfindingGridScale,
      map.height * this.pathfindingGridScale,
    );
    this.pathfindingGridRatio = map.width / this.pathfindingGrid.width;
  }

  /** Initialize the world by loading and rendering tiles. */
  async init({
    player: _player,
    server: _server,
  }: {
    player: Player;
    server: Server;
  }) {
    this.player = _player;
    this.server = _server;

    const { tiles } = await parseTilemap({
      map,
      tileset,
    });
    this.tiles = tiles;

    // Generate pathfinding grid
    this.generatePathfindingGrid();

    // Calculate total layers
    const highestLayer = [...tiles].sort((a, b) => b.layer - a.layer)[0].layer;
    this.highestLayer = highestLayer;

    // Calculate total depth layers
    const highestDepthLayer = [...tiles].sort(
      (a, b) => b.depthLayer - a.depthLayer,
    )[0].depthLayer;
    this.highestDepthLayer = highestDepthLayer;

    // Handle render layers
    for (let depthLayer = 0; depthLayer <= highestDepthLayer; depthLayer++) {
      for (let layer = 0; layer <= highestLayer; layer++) {
        const tilesAtLayer = tiles.filter(
          (x) => x.layer === layer && x.depthLayer === depthLayer,
        );

        if (tilesAtLayer.length < 1) continue;
        this.tileContainer.addChild(...tilesAtLayer);

        // Add render layer
        const renderLayer = new RenderLayer();
        renderLayer.attach(...tilesAtLayer);
        this.tileContainer.addChild(renderLayer);

        // Update internal state
        if (!this.renderLayers[depthLayer]) this.renderLayers[depthLayer] = [];
        this.renderLayers[depthLayer][layer] = {
          tiles: tilesAtLayer,
          renderLayer,
        };
      }
    }

    this.addChild(this.tileContainer);
    this.addChild(this.abovePlayerContainer);

    // Show pathfinding grid
    // this.attachPathfindingGrid();

    const worldTicker = new Ticker();
    worldTicker.minFPS = 1;
    worldTicker.maxFPS = 5;
    worldTicker.add(() => {
      for (
        let depthLayer = 0;
        depthLayer <= this.highestDepthLayer;
        depthLayer++
      ) {
        for (let layer = 0; layer <= this.highestLayer; layer++) {
          const renderLayer = this.renderLayers[depthLayer]?.[layer];
          if (!renderLayer) continue;

          const isAbovePlayer =
            layer > this.player.layer && depthLayer >= this.player.depthLayer;

          for (const tile of renderLayer.tiles) {
            const isWithinRange =
              Math.abs(tile.x + 16 - this.player.x) < 64 &&
              Math.abs(tile.y + 64 - this.player.y) < 64;

            if (isAbovePlayer && isWithinRange) {
              this.abovePlayerContainer.addChild(tile);
              renderLayer.renderLayer.attach(this.abovePlayerContainer);
            } else {
              this.tileContainer.addChild(tile);
              renderLayer.renderLayer.attach(tile);
            }
          }
        }
      }
    });
    worldTicker.start();
  }

  /** Handle click events */
  onpointerup = (e: FederatedPointerEvent) => {
    // Ignore non-primary clicks
    if (e.button !== 0) return;
    e.stopPropagation();

    // Capture and round global (screen) point
    const globalPoint = {
      x: Math.round(e.globalX),
      y: Math.round(e.globalY),
    };

    // Convert to local point within the map
    const worldPoint = this.toLocal(globalPoint) || globalPoint;

    // Round to get desired map position
    const desiredPosition = {
      x: Math.floor(worldPoint.x),
      y: Math.floor(worldPoint.y),
    };

    this.server.socket.emit("player:move", desiredPosition);

    // const validTile = getWalkableTileAt({
    //   player: this.player,
    //   point: desiredPosition,
    //   tiles: this.tiles,
    // });

    // if (!validTile) return;

    // // Run pathfinding algorithm
    // const fromPoint = isometricToCartesian(this.player.position, {
    //   tileRatio: this.pathfindingGridRatio,
    // });
    // const toPoint = isometricToCartesian(desiredPosition, {
    //   tileRatio: this.pathfindingGridRatio,
    // });
    // console.log(
    //   `Attempting to pathfind from ${toTextPoint(fromPoint)} to ${toTextPoint(toPoint)}`,
    // );
    // const ratio = map.width / this.pathfindingGrid.width;
    // const path = findPath({
    //   from: fromPoint,
    //   to: toPoint,
    //   grid: this.pathfindingGrid,
    // });

    // if (!path) {
    //   console.log(`Unable to find path`);
    //   return;
    // }

    // // Map to map coordinates
    // const desiredPositions = path.map((point) =>
    //   cartesianToIsometric(point, { tileRatio: ratio, withTileOffset: false }),
    // );

    // // Set final position to the actual position wanted by the player
    // desiredPositions[desiredPositions.length - 1] = desiredPosition;

    // // console.log(
    // //   `Moving to desired position...\nScreen: (${globalPoint.x}, ${globalPoint.y})\nLocal: (${desiredPosition.x}, ${desiredPosition.y})\nTile: (${tilePosition.x}, ${tilePosition.y})`,
    // // );

    // this.player.desiredPositions = desiredPositions;
  };

  /** Generate the world's pathfinding grid */
  private generatePathfindingGrid() {
    const ratio = this.pathfindingGridRatio;
    for (let y = 0; y < this.pathfindingGrid.height; y++) {
      for (let x = 0; x < this.pathfindingGrid.width; x++) {
        const worldPoint = cartesianToIsometric(
          { x, y },
          { tileRatio: ratio, withTileOffset: false },
        );
        const validTile = getWalkableTileAt({
          player: this.player,
          point: worldPoint,
          tiles: this.tiles,
          onlyCurrentLayer: true,
        });
        const isWalkable = !!validTile && validTile.isWalkable;
        this.pathfindingGrid.setWalkableAt(x, y, isWalkable);
      }
    }
  }

  /** Attach the pathfinding grid to visualize it */
  // @ts-ignore
  private attachPathfindingGrid() {
    const gridContainer = new Container({ eventMode: "none", alpha: 0.5 });
    this.addChild(gridContainer);

    const ratio = this.pathfindingGridRatio;
    const nodeRadius = 4 * ratio;
    const walkableNode = new GraphicsContext()
      .circle(0, 0, nodeRadius)
      .fill("green");
    const obstructedNode = new GraphicsContext()
      .circle(0, 0, nodeRadius)
      .fill("red");

    // this.pathfindingGrid.height
    // this.pathfindingGrid.width
    for (let y = 0; y < this.pathfindingGrid.height; y++) {
      for (let x = 0; x < this.pathfindingGrid.width; x++) {
        const node = this.pathfindingGrid.getNodeAt(x, y);
        const worldPosition = cartesianToIsometric(
          { x, y },
          {
            tileRatio: ratio,
            withTileOffset: false,
          },
        );
        const nodeGraphics = new Graphics({
          context: node.walkable ? walkableNode : obstructedNode,
          position: worldPosition,
        });
        gridContainer.addChild(nodeGraphics);
      }
    }
  }
}
