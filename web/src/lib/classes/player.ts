import { Graphics, Text, Texture, Ticker, type PointData } from "pixi.js";
import tileset from "../../assets/tilesets/character-tileset.json";
import { parseTileset } from "../functions/parse-tileset";
import type { Heading } from "../types";
import { AnimatedEntity, type AnimatedEntityOptions } from "./animated-entity";
import { type EntityOptions } from "./entity";
import type { WorldTile } from "./world-tile";
import { AdjustmentFilter } from "pixi-filters";

type PlayerEntityOptions = AnimatedEntityOptions;

export type PlayerOptions = Omit<PlayerEntityOptions, "sprite">;

export class Player extends AnimatedEntity {
  isHovered: boolean = false;
  desiredPositions: PointData[] = [];
  tile?: WorldTile;

  constructor(options: PlayerOptions) {
    const { animations } = parseTileset({ tileset });

    const defaultOptions: PlayerEntityOptions = {
      eventMode: "static",
      cursor: "pointer",
      position: { x: 0, y: 16 * 8 },
      sprite: {
        textures: animations[1],
        animationSpeed: 0.02,
        autoPlay: true,
        // texture: textures[1],
        anchor: { x: 0.5, y: 1 },
        // filters: new AdjustmentFilter({
        //   brightness: 1.2,
        //   red: 1.3,
        //   green: 0.9,
        //   blue: 0.7,
        // }),
      },
      ...options,
    };

    super(defaultOptions);

    // Set animations
    this.setStateTextures({
      idle: {
        N: animations[1],
        NE: animations[3],
        E: animations[5],
        SE: animations[7],
        S: animations[9],
        SW: animations[11],
        W: animations[13],
        NW: animations[15],
      },
      walking: {
        N: animations[21],
        NE: animations[23],
        E: animations[25],
        SE: animations[27],
        S: animations[29],
        SW: animations[31],
        W: animations[33],
        NW: animations[35],
      },
    });

    // Set texture
    this.updateState();

    // Render shadow
    const shadowSize = 10;
    const shadow = new Graphics()
      .ellipse(0, 0, shadowSize, shadowSize / 2)
      .fill({ h: 0, s: 0, l: 0, a: 0.1 });
    shadow.y = -(shadowSize / 2);
    shadow.x = 2;
    this.addChildAt(shadow, 0);

    this.onpointerover = () => {
      this.isHovered = true;
      this.tint = "red";
    };

    this.onpointerout = () => {
      this.isHovered = false;
      this.tint = 0xffffff;
    };
  }
}
