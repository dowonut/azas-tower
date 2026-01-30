import {
  Assets,
  Graphics,
  Text,
  Texture,
  Ticker,
  type PointData,
} from "pixi.js";
import { Entity, type EntityOptions } from "./entity";
import type { WorldTile } from "./world-tile";
import { parseTileset } from "../functions/parse-tileset";
import tileset from "../../assets/tilesets/character-tileset.json";

export class Player extends Entity {
  debugText: Text;
  isHovered: boolean = false;
  desiredPositions: PointData[] = [];
  tile?: WorldTile;

  constructor(options: EntityOptions) {
    const defaultOptions: Partial<EntityOptions> = {
      sprite: {
        anchor: { x: 0.5, y: 1 },
        animationSpeed: 0.01,
        textures: [Texture.EMPTY],
      },
      eventMode: "static",
      cursor: "pointer",
      position: { x: 16, y: 16 * 8 },
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

    const text = () => this.label ?? "N/A";
    // const text = () => `${this.layer}:${this.depthLayer}`;
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
    // const texture = await Assets.load({
    //   src: "https://pixijs.com/assets/bunny.png",
    // });
    const { animations } = await parseTileset({ tileset });
    console.log(animations);
    this.sprite.textures = animations[21];
    this.sprite.play();

    // const texture = textures[21];
    // this.sprite.texture = texture;

    const shadowSize = 10;
    const shadow = new Graphics()
      .ellipse(0, 0, shadowSize, shadowSize / 2)
      .fill({ h: 0, s: 0, l: 0, a: 0.1 });
    shadow.y = -(shadowSize / 2);
    shadow.x = 2;
    this.addChildAt(shadow, 0);
  }
}
