import {
  Container,
  type PointData,
  type SpriteOptions,
  type Texture,
} from "pixi.js";
import type { TileProperties } from "../types/tiled";
import { PerfectSprite } from "./perfect-sprite";
import type { Player } from "./player";

export type WorldTileOptions = {
  tilePosition: PointData;
  layer: number;
  tileId: number;
  spriteId: number;
  position: PointData;
  texture: Texture;
  walkableTexture: Texture;
  properties?: TileProperties[];
  highlighted?: boolean;
};

export class WorldTile extends Container {
  sprite: PerfectSprite;
  walkable!: PerfectSprite;
  tilePosition!: PointData;
  layer!: number;
  tileId!: number;
  spriteId!: number;
  properties?: TileProperties[];
  highlighted?: boolean;

  constructor({
    sprite: spriteOptions,
    position,
    texture,
    walkableTexture,
    ...options
  }: WorldTileOptions & { sprite?: SpriteOptions | Texture }) {
    super({ eventMode: "static", position });
    Object.assign(this, options);

    const sprite = new PerfectSprite({ texture, ...spriteOptions });
    this.sprite = sprite;
    this.addChild(sprite);

    const walkableSprite = new PerfectSprite({
      texture: walkableTexture,
      alpha: 0.5,
      visible: false,
      ...spriteOptions,
    });
    this.walkable = walkableSprite;
    this.addChild(walkableSprite);

    this.onpointerover = () => {
      sprite.tint = "red";
    };

    this.onpointerout = () => {
      sprite.tint = 0xffffff;
    };

    // const text = new Text({
    //   text: `${this.layer}:${this.depthLayer}`,
    //   // text: `${this.tilePosition.x}, ${this.tilePosition.y}`,
    //   scale: 0.2,
    //   anchor: 0.5,
    //   x: 16,
    //   y: 8,
    //   alpha: 0.5,
    //   eventMode: "none",
    // });
    // this.addChild(text);
  }

  get realY() {
    return this.position.y + this.layer * 16;
  }

  get isWalkable() {
    return this.properties?.find((p) => p.name === "walkable")?.value ?? false;
  }

  get depthLayer() {
    return this.tilePosition.x + this.tilePosition.y + 2 * this.layer;
  }

  getKey() {
    return `${this.layer}-${this.position.x}-${this.position.y}`;
  }

  /** Check if the tile has another tile directly above it */
  hasTileAbove({ tiles }: { tiles: WorldTile[] }) {
    const tilesAboveLayer = tiles.filter(
      (tile) => tile.layer === this.layer + 1,
    );
    const tileAboveCurrent = tilesAboveLayer.find(
      (tile) =>
        tile.tilePosition.x === this.tilePosition.x - 1 &&
        tile.tilePosition.y === this.tilePosition.y - 1,
    );
    return !!tileAboveCurrent;
  }

  /** Get the upmost tile above the current one */
  getTileAbove({ tiles }: { tiles: WorldTile[] }) {
    let highestTile: WorldTile | undefined;
    let tileAbove: WorldTile | undefined;

    for (let i = 0; tileAbove === undefined && i < 20; i++) {
      const layer = i + this.layer;
      const tile = tiles.find(
        (tile) =>
          tile.layer === layer &&
          tile.tilePosition.x === this.tilePosition.x - i &&
          tile.tilePosition.y === this.tilePosition.y - i &&
          tile.isWalkable,
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
  isBehindPlayer({ player }: { player: Player }) {
    const isLowerY = this.realY + 8 - player.layer * 16 < player.position.y;

    return this.layer <= player.layer || isLowerY;
  }
}
