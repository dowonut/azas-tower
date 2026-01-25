import {
  AlphaFilter,
  Container,
  FederatedPointerEvent,
  RenderLayer,
  Ticker,
  type ContainerOptions,
} from "pixi.js";

import map from "../../assets/maps/map-1.json";
import tileset from "../../assets/tilesets/background-tileset.json";
import { getTilesAt } from "../functions/get-tiles-at";
import { parseTilemap } from "../functions/parse-tilemap";
import { toTilePosition } from "../functions/to-tile-position";
import type { Player } from "./player";
import type { WorldTile } from "./world-tile";

export class World extends Container {
  player!: Player;
  tiles: WorldTile[] = [];
  renderLayers: {
    container: Container;
    renderLayer: RenderLayer;
    tiles: WorldTile[];
  }[][] = [];
  highestLayer: number = 0;
  highestDepthLayer: number = 0;
  abovePlayer: Container;
  behindPlayer: Container;
  // walkable!: Container;

  constructor(
    options: ContainerOptions = { eventMode: "static", sortableChildren: true },
  ) {
    super(options);

    const alphaFilter = new AlphaFilter({ alpha: 0.8 });
    this.abovePlayer = new Container({
      filters: alphaFilter,
      label: "abovePlayer",
    });
    this.behindPlayer = new Container({ label: "behindPlayer" });
  }

  /** Initialize the world by loading and rendering tiles. */
  async init({ player: _player }: { player: Player }) {
    this.player = _player;

    const { tiles } = await parseTilemap({
      map,
      tileset,
    });
    this.tiles = tiles;

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

        const container = new Container({
          // tint: { h: (360 / highestDepthLayer) * depthLayer, s: 100, l: 50 },
        });
        this.behindPlayer.addChild(container);
        container.addChild(...tilesAtLayer);

        // Add render layer
        const renderLayer = new RenderLayer();
        container.addChild(renderLayer);

        // Update internal state
        if (!this.renderLayers[depthLayer]) this.renderLayers[depthLayer] = [];
        this.renderLayers[depthLayer][layer] = {
          tiles: tilesAtLayer,
          renderLayer,
          container,
        };
      }
    }

    this.addChild(this.behindPlayer);
    this.addChild(this.abovePlayer);

    const worldTicker = new Ticker();
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

          // const isWithinRange = depthLayer < this.player.depthLayer + 15;
          const isAbovePlayer =
            layer > this.player.layer && depthLayer >= this.player.depthLayer;

          if (isAbovePlayer) {
            this.abovePlayer.addChild(renderLayer.container);
          } else {
            this.behindPlayer.addChild(renderLayer.container);
          }
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
        console.log(`Tile ${i} is above player`);
        continue;
      }

      if (i == 0 && isWalkable) {
        console.log(`Tile ${i} is walkable`);
        validTile = tile;
        continue;
      }

      if (isWalkable && !tile.hasTileAbove({ tiles: this.tiles })) {
        validTile = tile;
        continue;
      }
    }

    if (!validTile) return;

    console.log(
      `Moving to desired position...\nScreen: (${globalPoint.x}, ${globalPoint.y})\nLocal: (${desiredPosition.x}, ${desiredPosition.y})\nTile: (${tilePosition.x}, ${tilePosition.y})`,
    );

    this.player.desiredPosition = desiredPosition;
  };
}
