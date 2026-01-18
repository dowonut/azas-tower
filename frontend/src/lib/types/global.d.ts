import { type Viewport } from "pixi-viewport";
import { type PixiReactElementProps } from "@pixi/react";
import type { CustomViewport } from "../classes/custom-viewport";

declare module "@pixi/react" {
  interface PixiElements {
    pixiCustomViewport: PixiReactElementProps<typeof CustomViewport>;
  }
}

declare module "*.tmx" {
  const content: string;
  export default content;
}
