import type { PointData } from "pixi.js";
import type { WorldPoint } from "../types";

/** Convert a 2D local point to a 3D world point */
export function toWorldPoint(point: PointData): WorldPoint {
  const x = Math.floor(point.x + point.y * 2);
  const y = Math.floor(point.x - point.y * 2);

  return { x, y, z: 0 };
}
