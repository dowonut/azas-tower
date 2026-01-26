import type { PointData } from "pixi.js";

/** Convert a tile position into a global (map) position */
export function toGlobalPosition(
  tilePosition: PointData,
  {
    tileWidth = 32,
    tileHeight = 32,
    offset,
  }: {
    tileWidth?: number;
    tileHeight?: number;
    offset?: { x?: number; y?: number };
  } = {},
): PointData {
  const column = tilePosition.x;
  const row = tilePosition.y;
  const x = ((column - row) * tileWidth) / 2 + (offset?.x || 0);
  const y = (column + row) * (tileHeight / 4) + (offset?.y || 0);

  return { x, y };
}
