import type { PointData } from "pixi.js";

/** Convert a global pixel position to a tile position */
export function toTilePosition(
  position: PointData,
  {
    tileWidth = 32,
    tileHeight = 32,
    scale = 1,
  }: { tileWidth?: number; tileHeight?: number; scale?: number } = {}
): PointData {
  // Inverse of isometric projection formulas
  // Given: x = ((column - row) * tilewidth) / 2
  //        y = (column + row) * (tileheight / 4)
  // Solving for column and row:
  const halfWidth = tileWidth / 2;
  const quarterHeight = tileHeight / 4;
  const xFactor = position.x / scale / halfWidth;
  const yFactor = position.y / scale / quarterHeight;

  return {
    x: Math.floor((xFactor + yFactor) / 2 - 1),
    y: Math.floor((yFactor - xFactor) / 2),
  };
}
