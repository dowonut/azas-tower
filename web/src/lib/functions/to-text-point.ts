import type { PointData } from "pixi.js";
import type { WorldPoint } from "../types";

export function toTextPoint(point: PointData | WorldPoint) {
  const z = "z" in point ? `, ${point.z}` : ``;
  return `(${point.x}, ${point.y}${z})`;
}
