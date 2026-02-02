import { type Viewport } from "pixi-viewport";
import { type PixiReactElementProps } from "@pixi/react";
import type { CustomViewport } from "../classes/custom-viewport";
import type { PerfectSprite } from "../classes/perfect-sprite";
import type { WorldTile } from "../classes/world-tile";
import type { Server } from "../classes/server";
import type { Game } from "../classes/game";

declare module "pixi.js" {
  interface TextureSource {
    /** Hitmap representing opaque pixels */
    hitmap: Uint32Array | undefined;
  }
}

declare module "*.tmx" {
  const content: string;
  export default content;
}

declare global {
  // var game: Game | undefined;
}
