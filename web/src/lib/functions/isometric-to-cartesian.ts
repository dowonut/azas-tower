import type { PointData } from "pixi.js";

/**
 * Convert a set of isometric (world) coordinates into cartesian (tile) coordinates.
 *
 * Optionally account for different tile size by passing tileWidth and tileHeight.
 */
export function isometricToCartesian(
  point: PointData,
  options?: {
    tileWidth?: number;
    tileHeight?: number;
    tileRatio?: number;
  },
): PointData {
  const {
    tileWidth: _tileWidth = 32,
    tileHeight: _tileHeight = _tileWidth,
    tileRatio = 1,
  } = options ?? {};
  const tileWidth = _tileWidth * tileRatio;
  const tileHeight = _tileHeight * tileRatio;

  const { x, y } = point;

  // Create unit vectors representing transformation from isometric to cartesian coordinate space
  const iHat = [1 / tileWidth, -1 / tileWidth];
  const jHat = [2 / tileHeight, 2 / tileHeight];

  // Account for isometric tile offset
  // const tileOffset = Math.floor(tileWidth / 2);
  // const x = _x + tileOffset;

  // Create new point via vector multiplication
  const cartesianPoint: PointData = {
    x: Math.floor(x * iHat[0] + y * jHat[0]),
    y: Math.floor(x * iHat[1] + y * jHat[1]),
  };
  // const cartesianPoint: PointData = {
  //   x: x * iHat[0] + y * jHat[0],
  //   y: x * iHat[1] + y * jHat[1],
  // };

  return cartesianPoint;
}
