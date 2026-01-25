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
  // walkable!: Container;

  constructor(
    options: ContainerOptions = { eventMode: "static", sortableChildren: true },
  ) {
    super(options);
  }

  /** Initialize the world by loading and rendering tiles. */
  async init({ player }: { player: Player }) {
    this.player = player;

    const { tiles } = await parseTilemap({
      map,
      tileset,
    });
    this.tiles = tiles;

    // this.addChild(...tiles);

    // Calculate total layers
    const highestLayer = [...tiles].sort((a, b) => b.layer - a.layer)[0].layer;
    this.highestLayer = highestLayer;

    // Calculate total depth layers
    const highestDepthLayer = [...tiles].sort(
      (a, b) => b.depthLayer - a.depthLayer,
    )[0].depthLayer;
    this.highestDepthLayer = highestDepthLayer;

    // Handle render layers
    for (let i = 0; i <= highestDepthLayer; i++) {
      for (let j = 0; j <= highestLayer; j++) {
        const tilesAtLayer = tiles.filter(
          (x) => x.layer === j && x.depthLayer === i,
        );

        if (tilesAtLayer.length < 1) continue;

        this.addChild(...tilesAtLayer);

        const container = new Container({
          // tint: { h: (360 / highestDepthLayer) * i, s: 100, l: 50 },
        });
        this.addChild(container);
        if (i === 21) this.addChild(container);
        container.addChild(...tilesAtLayer);

        // Add render layer
        const renderLayer = new RenderLayer();
        container.addChild(renderLayer);

        // Update internal state
        if (!this.renderLayers[i]) this.renderLayers[i] = [];
        this.renderLayers[i][j] = {
          tiles: tilesAtLayer,
          renderLayer,
          container,
        };
      }
    }

    // Handle walkable tiles
    // const walkableContainer = new Container({
    //   eventMode: "static",
    //   alpha: 0.5,
    // });
    // this.walkable = walkableContainer;
    // this.addChild(this.walkable);
    // this.walkable.addChild(...walkableTiles);

    const alphaFilter = new AlphaFilter({ alpha: 0.5 });
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

          const isAbovePlayer =
            layer > this.player.layer && depthLayer >= this.player.depthLayer;

          if (isAbovePlayer) {
            renderLayer.container.filters = alphaFilter;
          } else {
            renderLayer.container.filters = null;
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

      if (i === 0 && isWalkable) {
        validTile = tile;
        continue;
      }

      if (isWalkable && !tile.hasTileAbove({ tiles: this.tiles })) {
        validTile = tile;
        continue;
      }
    }

    if (!validTile) return;

    console.log(!!validTile);

    console.log(
      `Moving to desired position...\nScreen: (${globalPoint.x}, ${globalPoint.y})\nLocal: (${desiredPosition.x}, ${desiredPosition.y})\nTile: (${tilePosition.x}, ${tilePosition.y})`,
    );

    this.player.desiredPosition = desiredPosition;
  };
}
