import {
  Container,
  FederatedPointerEvent,
  RenderLayer,
  type ContainerOptions,
} from "pixi.js";

import map from "../../assets/maps/map-1.json";
import tileset from "../../assets/tilesets/background-tileset.json";
import { parseTilemap } from "../functions/parse-tilemap";
import { toTilePosition } from "../functions/to-tile-position";
import type { Player } from "./player";
import type { WorldTile } from "./world-tile";

export class World extends Container {
  tiles: WorldTile[] = [];
  renderLayers: {
    container: Container;
    renderLayer: RenderLayer;
    tiles: WorldTile[];
  }[] = [];

  constructor(options: ContainerOptions = { eventMode: "static" }) {
    super(options);
  }

  /** Initialize the world by loading and rendering tiles. */
  async init({ player }: { player: Player }) {
    const tiles = await parseTilemap({ map, tileset });
    this.tiles = tiles;

    // Calculate total depth layers
    const highestDepthLayer = [...tiles].sort(
      (a, b) => b.depthLayer - a.depthLayer,
    )[0].depthLayer;

    // Handle render layers
    for (let i = 0; i <= highestDepthLayer; i++) {
      const tilesAtLayer = tiles.filter((x) => x.depthLayer === i);

      if (tilesAtLayer.length < 1) continue;

      const container = new Container({
        tint: { h: (360 / highestDepthLayer) * i, s: 100, l: 50 },
      });
      this.addChild(container);
      // if (i === 21) this.addChild(container);
      container.addChild(...tilesAtLayer);

      // Add render layer
      const renderLayer = new RenderLayer();
      container.addChild(renderLayer);

      // Update internal state
      this.renderLayers[i] = {
        tiles: tilesAtLayer,
        renderLayer,
        container,
      };
    }

    // Handle click events
    this.onpointerup = (e: FederatedPointerEvent) => {
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

      console.log(
        `Moving to desired position...\nScreen: (${globalPoint.x}, ${globalPoint.y})\nLocal: (${desiredPosition.x}, ${desiredPosition.y})\nTile: (${tilePosition.x}, ${tilePosition.y})`,
      );

      // const selectedTiles = getTilesAt({
      //   point: globalPoint,
      //   tilePosition,
      //   tiles,
      // })?.map((x) => `(${x.tilePosition.x}, ${x.tilePosition.y})`);
      // console.log(selectedTiles);

      // console.log(
      //   !!selectedTile
      //     ? `Selected tile: (${selectedTile.tilePosition.x}, ${selectedTile.tilePosition.y})`
      //     : `No tile at point.`,
      // );

      player.desiredPosition = desiredPosition;
    };
  }

  /** Initialize ticker */
  ticker({ player }: { player: Player }) {
    // Only update world when player is moving
    if (!player.desiredPosition) return;

    // Iterate through tiles
    // for (const tile of this.tiles) {
    //   if (tile.isBehindPlayer({ player })) {
    //     renderLayers.behindPlayer.attach(tile);
    //   } else {
    //     renderLayers.abovePlayer.attach(tile);
    //   }
    // }

    // Filter tiles based on whether they're behind or in front of the player
    // const tilesBehind = this.tiles.filter((x) => x.isBehindPlayer({ player }));
    // renderLayers.behindPlayer.attach(...tilesBehind);

    // const tilesAbove = this.tiles.filter((x) => !x.isBehindPlayer({ player }));
    // renderLayers.abovePlayer.attach(...tilesAbove);
  }
}
