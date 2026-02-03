import {
  AnimatedSprite,
  Container,
  Sprite,
  Texture,
  Ticker,
  type AnimatedSpriteOptions,
  type ContainerOptions,
  type SpriteOptions,
} from "pixi.js";
import { PerfectSprite } from "./perfect-sprite";
import type { World } from "./world";
import { isometricToCartesian } from "../functions/isometric-to-cartesian";
import type { Heading } from "../types";
import { AnimatedEntity } from "./animated-entity";

export type EntityAnimation = "idle" | "walking";

type StateTextureOptions = { state: EntityAnimation } & (
  | { textures: { [key in Heading]: Texture | Texture[] } }
  | { heading: Heading; texture: Texture | Texture[] }
);

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

  protected _state: EntityAnimation = "idle";
  protected _heading: Heading = "N";

  /**
   * Entity textures for all possible states including animations and headings
   */
  protected _stateTextures: {
    [key in EntityAnimation]?: {
      [key in Heading]?: Texture | Texture[];
    };
  } = {};

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

  protected createSprite(options: SpriteOptions) {
    const sprite = new PerfectSprite(options);
    this.sprite = sprite;
    this.addChild(sprite);
  }

  public get tilePosition() {
    return isometricToCartesian(this.position);
  }

  public get depthLayer() {
    return Math.floor(this.position.y / 8 + 2 * this.layer);
  }

  get state() {
    return this._state;
  }

  get heading() {
    return this._heading;
  }

  /**
   * Entity textures for all possible states including animations and headings
   */
  public get stateTextures() {
    return this._stateTextures;
  }

  /** Entity texture for a specific state and heading */
  public getStateTexture(state?: EntityAnimation, heading?: Heading) {
    const _state = state ?? this.state;
    const _heading = heading ?? this.heading;
    return this._stateTextures[_state]?.[_heading] ?? Texture.EMPTY;
  }

  /**
   * Set state textures for this entity
   */
  public setStateTextures(stateTextures: Partial<typeof this._stateTextures>) {
    this._stateTextures = {
      ...this._stateTextures,
      ...stateTextures,
    };
  }

  /**
   * Set one or more state textures for this entity
   */
  public setStateTexture(options: StateTextureOptions) {
    const { state } = options;
    if ("textures" in options) {
      this._stateTextures[state] = {
        ...this._stateTextures[state],
        ...options.textures,
      };
    } else {
      if (!this._stateTextures[state]) this._stateTextures[state] = {};
      this._stateTextures[state][options.heading] = options.texture;
    }
  }

  /** Update the entity's texture given a new state */
  public updateState(state: EntityAnimation, heading?: Heading) {
    const animationSpeed = {
      idle: 0.02,
      walking: 0.06,
    };
    if (this.heading === heading && this.state === state) return;
    if (heading) this._heading = heading;
    this._state = state;
    const texture = this.getStateTexture(state, heading);
    const isArray = Array.isArray(texture);
    if (this instanceof AnimatedEntity) {
      this.sprite.textures = isArray ? texture : [texture];
      this.sprite.animationSpeed = animationSpeed[state];
      this.sprite.play();
    } else {
      this.sprite.texture = isArray ? texture[0] : texture;
    }
  }
}
