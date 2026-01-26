import {
  AlphaFilter,
  Container,
  FederatedPointerEvent,
  RenderLayer,
  Ticker,
  type ContainerOptions,
} from "pixi.js";
import PF from "pathfinding";

import map from "../../assets/maps/map-1.json";
import tileset from "../../assets/tilesets/background-tileset.json";
import { getTilesAt } from "../functions/get-tiles-at";
import { parseTilemap } from "../functions/parse-tilemap";
import { toTilePosition } from "../functions/to-tile-position";
import type { Player } from "./player";
import type { WorldTile } from "./world-tile";
import { toTextPoint } from "../functions/to-text-point";
import { findPath } from "../functions/find-path";
import { toGlobalPosition } from "../functions/to-global-position";

export class World extends Container {
  player!: Player;
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
  // walkable!: Container;

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

    this.pathfindingGrid = new PF.Grid(map.width * 1, map.height * 1);
  }

  /** Initialize the world by loading and rendering tiles. */
  async init({ player: _player }: { player: Player }) {
    this.player = _player;

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

        // const container = new Container({
        //   // tint: { h: (360 / highestDepthLayer) * depthLayer, s: 100, l: 50 },
        // });
        // this.behindPlayer.addChild(container);
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

    const worldTicker = new Ticker();
    worldTicker.minFPS = 1;
    worldTicker.maxFPS = 5;
    worldTicker.add(() => {
      // if (this.player.desiredPositions.length < 1) return;

      // const oneTileOverlapsPlayer = this.tiles.some(
      //   (tile) =>
      //     Math.abs(tile.x + 16 - this.player.x) < 16 &&
      //     Math.abs(tile.y + 16 - this.player.y) < 16 &&
      //     tile.layer > this.player.layer &&
      //     tile.depthLayer >= this.player.depthLayer,
      // );
      // console.log(oneTileOverlapsPlayer);

      for (
        let depthLayer = 0;
        depthLayer <= this.highestDepthLayer;
        depthLayer++
      ) {
        for (let layer = 0; layer <= this.highestLayer; layer++) {
          const renderLayer = this.renderLayers[depthLayer]?.[layer];
          if (!renderLayer) continue;

          // Get tiles that are close to the player
          // const tilesNearPlayer = renderLayer.tiles.filter(
          //   (tile) =>
          // Math.abs(this.player.x - tile.x) < 128 &&
          // Math.abs(this.player.y - tile.y) < 128,
          // );
          // if (tilesNearPlayer.length < 1) return;

          // const isWithinRange = depthLayer < this.player.depthLayer + 15;
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

          // if (isAbovePlayer) {
          // this.abovePlayerContainer.addChild(...tilesNearPlayer);
          // } else {
          // this.tileContainer.addChild(...tilesNearPlayer);
          // renderLayer.renderLayer.attach(...tilesNearPlayer);
          // }
        }
      }
    });
    worldTicker.start();
  }

  /** Create a new render layer and attach an entity */
  // createRenderLayer({ entity }: { entity: Entity }) {
  //   const renderLayer = new RenderLayer();
  //   renderLayer.attach(entity);
  //   this.addChild(renderLayer);
  //   return renderLayer;
  // }

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
    const localPoint = this.toLocal(globalPoint) || globalPoint;

    // Round to get desired map position
    const desiredPosition = {
      x: Math.round(localPoint.x),
      y: Math.round(localPoint.y),
    };

    // Calculate tile position
    const tilePosition = toTilePosition(desiredPosition);

    // Get tile at exact point
    const tilesAtPoint = getTilesAt({
      point: globalPoint,
      tilePosition,
      tiles: this.tiles,
    });
    if (!tilesAtPoint || tilesAtPoint.length < 1) return;

    // Check if point within tile is walkable
    let validTile: WorldTile | undefined;
    for (let i = 0; i < tilesAtPoint.length && !validTile; i++) {
      const tile = tilesAtPoint[i];
      const localTilePoint = tile.walkable.toLocal(globalPoint);
      const isWalkable = tile.walkable.containsPoint(localTilePoint);
      const isAbovePlayer = tile.parent?.parent?.label === "abovePlayer";

      if (isAbovePlayer) {
        // console.log(`Tile ${i} is above player`);
        continue;
      }

      if (i == 0 && isWalkable) {
        // console.log(`Tile ${i} is walkable`);
        validTile = tile;
        continue;
      }

      if (isWalkable && !tile.hasTileAbove({ tiles: this.tiles })) {
        // console.log(`Tile ${i} is walkable and has nothing above`);
        validTile = tile;
        continue;
      }
    }

    if (!validTile) return;

    // Run pathfinding algorithm
    console.log(
      `Attempting to pathfind from ${toTextPoint(this.player.tilePosition)} to ${toTextPoint(tilePosition)}`,
    );
    const scale = 1;
    const path = findPath({
      from: {
        x: this.player.tilePosition.x * scale,
        y: this.player.tilePosition.y * scale,
      },
      to: { x: tilePosition.x * scale, y: tilePosition.y * scale },
      grid: this.pathfindingGrid,
    });

    if (!path) {
      console.log(`Unable to find path`);
      return;
    }

    // Map to map coordinates
    const desiredPositions = path.map((point) =>
      toGlobalPosition(
        { x: point.x / scale, y: point.y / scale },
        { offset: { x: 16, y: 8 } },
      ),
    );

    // Set final position to the actual position wanted by the player
    desiredPositions[desiredPositions.length - 1] = desiredPosition;

    // console.log(
    //   `Moving to desired position...\nScreen: (${globalPoint.x}, ${globalPoint.y})\nLocal: (${desiredPosition.x}, ${desiredPosition.y})\nTile: (${tilePosition.x}, ${tilePosition.y})`,
    // );

    this.player.desiredPositions = desiredPositions;
    // this.player.desiredPosition = desiredPosition;
  };

  /** Generate the world's pathfinding grid */
  private generatePathfindingGrid() {
    for (const tile of this.tiles.filter((x) => x.layer === 1)) {
      if (tile.hasTileAbove({ tiles: this.tiles })) {
        this.pathfindingGrid.setWalkableAt(
          tile.tilePosition.x,
          tile.tilePosition.y,
          false,
        );
      }
    }
  }
}
