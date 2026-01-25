import { AnimatedSprite, type AnimatedSpriteOptions } from "pixi.js";
import { parseTileset } from "../functions/parse-tileset";
import animatedTileset from "../../assets/tilesets/animated-tileset.json";
import type { Player } from "./player";

export class MoveIndicator extends AnimatedSprite {
  private constructor(options: AnimatedSpriteOptions) {
    super(options);
  }

  /** Initialize the MoveIndicator */
  static async init(
    options: Partial<AnimatedSpriteOptions> = {
      animationSpeed: 0.05,
      anchor: { x: 0.5, y: 0.75 },
      alpha: 0.8,
      eventMode: "none",
      visible: false,
    },
  ) {
    const { animations } = await parseTileset({ tileset: animatedTileset });
    return new MoveIndicator({ textures: animations[1], ...options });
  }

  /** Initialize ticker */
  ticker({ player }: { player: Player }) {
    if (!!player.desiredPosition) {
      this.position.copyFrom(player.desiredPosition);
      this.visible = true;
      if (!this.playing) this.gotoAndPlay(1);
    } else {
      this.visible = false;
      this.stop();
    }
  }
}
