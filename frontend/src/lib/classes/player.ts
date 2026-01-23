import { Assets, Text, Ticker, type PointData } from "pixi.js";
import { Entity, type EntityOptions } from "./entity";
import type { WorldTile } from "./world-tile";

export class Player extends Entity {
  debugText: Text;
  isHovered: boolean = false;
  desiredPosition?: PointData;
  tile?: WorldTile;

  constructor(options: EntityOptions) {
    const defaultOptions: Partial<EntityOptions> = {
      sprite: {
        anchor: { x: 0.5, y: 1 },
      },
      eventMode: "static",
      cursor: "pointer",
      position: { x: 16, y: 16 },
    };

    super({
      ...defaultOptions,
      ...options,
    });

    this.onpointerover = () => {
      this.isHovered = true;
      this.tint = "red";
    };

    this.onpointerout = () => {
      this.isHovered = false;
      this.tint = 0xffffff;
    };

    const text = () => `${this.layer}:${this.depthLayer}`;
    // const text = () =>
    //   `${this.tile?.tilePosition.x}, ${this.tile?.tilePosition.y}`;

    const debugText = new Text({
      text: text(),
      style: { fill: "orange" },
      scale: 0.3,
      anchor: 0.5,
      x: 0,
      y: -50,
      alpha: 0.8,
    });
    this.debugText = debugText;
    this.addChild(debugText);

    const debugTicker = new Ticker();
    debugTicker.minFPS = 1;
    debugTicker.maxFPS = 5;
    debugTicker.add((_) => {
      this.debugText.text = text();
    });
    debugTicker.start();
  }

  /** Initialize the Player */
  async init() {
    const texture = await Assets.load({
      src: "https://pixijs.com/assets/bunny.png",
    });

    this.sprite.texture = texture;
  }
}
