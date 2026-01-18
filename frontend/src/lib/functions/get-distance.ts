import type { PointData } from "pixi.js";

/** Calculate the Euclidean distance between two points */
export function getDistance(from: PointData, to: PointData): number {
  const dx = from.x - to.x;
  const dy = from.y - to.y;
  return Math.sqrt(dx * dx + dy * dy);
}
