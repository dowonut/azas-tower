import type { PointData } from "pixi.js";

/** Convert a local pixel position to a tile position */
export function toTilePosition(
  position: PointData,
  {
    tileWidth = 32,
    tileHeight = 32,
  }: { tileWidth?: number; tileHeight?: number } = {},
): PointData {
  // Inverse of isometric projection formulas
  // Given: x = ((column - row) * tilewidth) / 2
  //        y = (column + row) * (tileheight / 4)
  // Solving for column and row:
  const halfWidth = tileWidth / 2;
  const quarterHeight = tileHeight / 4;
  const xFactor = position.x / halfWidth;
  const yFactor = position.y / quarterHeight;

  return {
    x: Math.round((xFactor + yFactor) / 2 - 1),
    y: Math.round((yFactor - xFactor) / 2),
  };
}
