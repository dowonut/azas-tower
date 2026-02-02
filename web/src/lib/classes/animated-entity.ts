import { AnimatedSprite, type AnimatedSpriteOptions } from "pixi.js";
import { Entity, type EntityOptions } from "./entity";

export type AnimatedEntityOptions = Omit<EntityOptions, "sprite"> & {
  sprite: AnimatedSpriteOptions;
};

export class AnimatedEntity extends Entity {
  declare sprite: AnimatedSprite;

  constructor(options: AnimatedEntityOptions) {
    super(options);
  }

  createSprite(options: AnimatedSpriteOptions) {
    const sprite = new AnimatedSprite(options);
    this.sprite = sprite;
    this.addChild(sprite);
  }
}
