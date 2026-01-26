import {
  AlphaFilter,
  AnimatedSprite,
  Container,
  Graphics,
  Ticker,
  type AnimatedSpriteOptions,
} from "pixi.js";
import animatedTileset from "../../assets/tilesets/animated-tileset.json";
import { parseTileset } from "../functions/parse-tileset";
import type { Player } from "./player";

export type MoveIndicatorOptions = AnimatedSpriteOptions & { player: Player };

export class MoveIndicator extends Container {
  destination: AnimatedSprite;
  lines: Graphics;

  private constructor({ player, ...options }: MoveIndicatorOptions) {
    super({ eventMode: "none", visible: true });

    const _lines = new Graphics({ filters: new AlphaFilter({ alpha: 0.5 }) });
    this.lines = _lines;
    this.addChild(_lines);

    const _destination = new AnimatedSprite(options);
    this.destination = _destination;
    this.addChild(_destination);

    const ticker = new Ticker();
    ticker.minFPS = 1;
    ticker.maxFPS = 10;
    ticker.add(() => this.ticker({ player }));
    ticker.start();
  }

  /** Initialize the MoveIndicator */
  static async init(options: Omit<MoveIndicatorOptions, "textures">) {
    const defaultOptions: Partial<AnimatedSpriteOptions> = {
      animationSpeed: 0.05,
      anchor: { x: 0.5, y: 0.75 },
      alpha: 0.8,
    };

    const { animations } = await parseTileset({ tileset: animatedTileset });
    return new MoveIndicator({
      textures: animations[1],
      ...defaultOptions,
      ...options,
    });
  }

  /** Initialize ticker */
  private ticker({ player }: { player: Player }) {
    // While player is moving
    if (player.desiredPositions.length > 0) {
      this.destination.position.copyFrom(
        player.desiredPositions[player.desiredPositions.length - 1],
      );
      this.visible = true;
      if (!this.destination.playing) this.destination.gotoAndPlay(1);

      // Handle pathfinding lines
      this.drawLines(player);
    }
    // When player is done moving
    else {
      this.visible = false;
      this.destination.stop();
    }
  }

  private drawLines(player: Player) {
    if (!!this.lines) {
      this.lines.clear();
    }
    for (let i = 0; i < player.desiredPositions.length; i++) {
      const start = i === 0 ? player.position : player.desiredPositions[i - 1];
      const end = player.desiredPositions[i];

      this.lines.moveTo(start.x, start.y).lineTo(end.x, end.y);
    }
    this.lines.stroke({ width: 2, color: "red", alignment: 0.5, cap: "round" });
  }
}
