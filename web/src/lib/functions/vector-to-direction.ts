import type { PointData } from "pixi.js";
import type { CardinalDirection } from "../types";

const directionMap: CardinalDirection[] = [
  "W",
  "NW",
  "N",
  "NE",
  "E",
  "SE",
  "S",
  "SW",
];

/** Convert a movement vector into one of 8 cardinal directions */
export function vectorToDirection(vector: PointData): CardinalDirection {
  const angle = Math.atan2(vector.y, vector.x);
  const rawDirection = (angle + Math.PI) / (Math.PI / 4);
  const directionIndex = Math.floor(rawDirection + 0.5) % 8;
  return directionMap[directionIndex];
}
