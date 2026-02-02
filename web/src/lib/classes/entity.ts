import {
  AnimatedSprite,
  Container,
  Sprite,
  Ticker,
  type AnimatedSpriteOptions,
  type ContainerOptions,
  type SpriteOptions,
} from "pixi.js";
import { PerfectSprite } from "./perfect-sprite";
import type { World } from "./world";
import { isometricToCartesian } from "../functions/isometric-to-cartesian";

export type EntityOptions = ContainerOptions & {
  world: World;
  sprite: SpriteOptions;
};

/**
 * A game world entity
 */
export class Entity extends Container {
  sprite!: Sprite;
  world: World;
  layer: number = 1;

  constructor({ world, sprite: spriteOptions, ...options }: EntityOptions) {
    super(options);
    this.world = world;

    this.createSprite(spriteOptions);

    const entityTicker = new Ticker();
    entityTicker.maxFPS = 30;

    entityTicker.add(() => {
      const renderLayer = world.renderLayers[this.depthLayer]?.[this.layer];
      if (!renderLayer) return;
      renderLayer.renderLayer.attach(this);
    });

    entityTicker.start();
  }

  createSprite(options: SpriteOptions) {
    const sprite = new PerfectSprite(options);
    this.sprite = sprite;
    this.addChild(sprite);
  }

  get tilePosition() {
    return isometricToCartesian(this.position);
  }

  get depthLayer() {
    return Math.floor(this.position.y / 8 + 2 * this.layer);
  }
}
