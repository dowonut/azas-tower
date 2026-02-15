import type { PointData } from "pixi.js";
import { Heading } from "../types/enums";

// const directionMap: Heading[] = ["W", "NW", "N", "NE", "E", "SE", "S", "SW"];
const directionMap: Heading[] = [
  Heading.W,
  Heading.NW,
  Heading.N,
  Heading.NE,
  Heading.E,
  Heading.SE,
  Heading.S,
  Heading.SW,
];

/** Convert a movement vector into one of 8 cardinal directions */
export function vectorToDirection(vector: PointData): Heading {
  const angle = Math.atan2(vector.y, vector.x);
  const rawDirection = (angle + Math.PI) / (Math.PI / 4);
  const directionIndex = Math.floor(rawDirection + 0.5) % 8;
  return directionMap[directionIndex];
}
