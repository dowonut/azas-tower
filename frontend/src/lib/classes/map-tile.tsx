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
