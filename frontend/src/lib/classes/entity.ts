import {
  Container,
  Ticker,
  type ContainerOptions,
  type SpriteOptions,
} from "pixi.js";
import { PerfectSprite } from "./perfect-sprite";
import type { World } from "./world";
import { toTilePosition } from "../functions/to-tile-position";

export type EntityOptions = ContainerOptions & {
  world: World;
  sprite?: SpriteOptions;
};

/**
 * A game world entity
 */
export class Entity extends Container {
  sprite: PerfectSprite;
  layer: number = 0;
  depthLayer: number = 0;

  constructor({ world, sprite: spriteOptions, ...options }: EntityOptions) {
    super(options);

    const sprite = new PerfectSprite(spriteOptions);
    this.sprite = sprite;
    this.addChild(sprite);

    const entityTicker = new Ticker();
    // entityTicker.maxFPS = 10;

    entityTicker.add(() => {
      const renderLayer = world.renderLayers[this.depthLayer];
      if (!renderLayer) return;
      renderLayer.renderLayer.attach(this);
    });

    entityTicker.start();
  }

  get tilePosition() {
    return toTilePosition(this.position);
  }
}
