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
import { AnimatedEntity, type AnimatedEntityOptions } from "./animated-entity";
import type { CardinalDirection, Direction } from "../types";

type PlayerEntityOptions = EntityOptions;

export type PlayerOptions = Omit<PlayerEntityOptions, "sprite">;

export class Player extends Entity {
  debugText: Text;
  isHovered: boolean = false;
  desiredPositions: PointData[] = [];
  tile?: WorldTile;

  public headingTextures: { [key in CardinalDirection]: Texture };

  constructor(options: PlayerOptions) {
    const { animations, textures } = parseTileset({ tileset });

    const defaultOptions: EntityOptions = {
      eventMode: "static",
      cursor: "pointer",
      sprite: {
        // textures: animations[21],
        // animationSpeed: 0.02,
        texture: textures[1],
        anchor: { x: 0.5, y: 1 },
      },
      ...options,
    };

    super(defaultOptions);

    // Set heading textures
    this.headingTextures = {
      N: textures[2],
      NE: textures[1],
      E: textures[8],
      SE: textures[7],
      S: textures[6],
      SW: textures[5],
      W: textures[4],
      NW: textures[3],
    };

    // Start playing animation
    // this.sprite.play();

    // Render shadow
    const shadowSize = 10;
    const shadow = new Graphics()
      .ellipse(0, 0, shadowSize, shadowSize / 2)
      .fill({ h: 0, s: 0, l: 0, a: 0.1 });
    shadow.y = -(shadowSize / 2);
    shadow.x = 2;
    this.addChildAt(shadow, 0);

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

    this.onpointerover = () => {
      this.isHovered = true;
      this.tint = "red";
    };

    this.onpointerout = () => {
      this.isHovered = false;
      this.tint = 0xffffff;
    };

    const debugTicker = new Ticker();
    debugTicker.minFPS = 1;
    debugTicker.maxFPS = 5;
    debugTicker.add((_) => {
      this.debugText.text = text();
    });
    debugTicker.start();
  }
}
