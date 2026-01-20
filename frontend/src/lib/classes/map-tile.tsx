import type { PointData, Texture } from "pixi.js";
import type { TileProperties } from "../types/tiled";

export type MapTileOptions = {
  position: PointData;
  tilePosition: PointData;
  texture: Texture;
  layer: number;
  id: number;
  spriteId: number;
  properties?: TileProperties[];
};

export class MapTile implements MapTileOptions {
  position!: PointData;
  tilePosition!: PointData;
  texture!: Texture;
  layer!: number;
  id!: number;
  spriteId!: number;
  properties?: TileProperties[];

  constructor(options: MapTileOptions) {
    Object.assign(this, options);
  }

  get key() {
    return `${this.layer}-${this.position.x}-${this.position.y}`;
  }

  get realY() {
    return this.position.y + this.layer * 16;
  }

  get isWalkable() {
    return this.properties?.find((p) => p.name === "walkable")?.value ?? false;
  }

  /** Check if the tile has another tile directly above it */
  hasTileAbove({ tiles }: { tiles: MapTile[] }) {
    const tilesAboveLayer = tiles.filter(
      (tile) => tile.layer === this.layer + 1
    );
    const tileAboveCurrent = tilesAboveLayer.find(
      (tile) =>
        tile.tilePosition.x === this.tilePosition.x - 1 &&
        tile.tilePosition.y === this.tilePosition.y - 1
    );
    return !!tileAboveCurrent;
  }

  /** Get the upmost tile above the current one */
  getTileAbove({ tiles }: { tiles: MapTile[] }) {
    let highestTile: MapTile | undefined;
    let tileAbove: MapTile | undefined;

    for (let i = 0; tileAbove === undefined && i < 20; i++) {
      const layer = i + this.layer;
      const tile = tiles.find(
        (tile) =>
          tile.layer === layer &&
          tile.tilePosition.x === this.tilePosition.x - i &&
          tile.tilePosition.y === this.tilePosition.y - i &&
          tile.isWalkable
      );
      if (!!tile) {
        highestTile = tile;
      } else {
        tileAbove = highestTile;
      }
    }

    return tileAbove;
  }

  /** Is the tile behind the player? */
  isBehindPlayer({
    playerPosition,
    playerLayer,
    scale = 1,
  }: {
    playerPosition: PointData;
    playerLayer: number;
    scale?: number;
  }) {
    const isLowerY = this.realY - playerLayer * 16 < playerPosition.y / scale;

    return this.layer <= playerLayer || isLowerY;
  }

  /** Convert the tile into a Sprite component */
  toSprite() {
    return (
      <pixiSprite
        key={this.key}
        position={this.position}
        texture={this.texture}
      />
    );
  }
}
