import type { RenderLayer } from "pixi.js";

export type Direction = "up" | "down" | "left" | "right";

export type Entries<T> = {
  [K in keyof T]: [K, T[K]];
}[keyof T][];

export type RenderLayerName = "behindPlayer" | "abovePlayer";

export type RenderLayers = {
  [key in RenderLayerName]: RenderLayer;
};
