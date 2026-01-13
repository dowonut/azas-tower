import type { PointData } from "pixi.js";
import type { Direction } from "../types";

export function getNewCharacterPosition({
  currentPosition,
  direction,
  distance,
}: {
  currentPosition: PointData;
  direction: Direction;
  distance: number;
}) {
  const newPosition = { ...currentPosition };

  switch (direction) {
    case "up":
      newPosition.y -= distance;
      break;
    case "down":
      newPosition.y += distance;
      break;
    case "left":
      newPosition.x -= distance;
      break;
    case "right":
      newPosition.x += distance;
      break;
  }

  return newPosition;
}
