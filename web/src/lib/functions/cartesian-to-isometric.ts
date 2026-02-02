import type { PointData } from "pixi.js";

/**
 * Convert a set of cartesian (tile) coordinates into isometric (world) coordinates.
 *
 * E.g. A tile at (1, 1) with a width/height of 32 will return (-16, 16).
 *
 * Optionally account for different tile size by passing tileWidth and tileHeight.
 */
export function cartesianToIsometric(
  point: PointData,
  options?: {
    tileWidth?: number;
    tileHeight?: number;
    /** Value to multiply tileWidth and tileHeight by */
    tileRatio?: number;
    /**
     * Should the isometric x-position be offset by half of the tile width?
     *
     * Disabling this can be useful when dealing with graphics that are rendered from their center.
     *
     * @default true
     **/
    withTileOffset?: boolean;
  },
): PointData {
  const {
    tileWidth: _tileWidth = 32,
    tileHeight: _tileHeight = _tileWidth,
    tileRatio = 1,
    withTileOffset = true,
  } = options ?? {};
  const tileWidth = _tileWidth * tileRatio;
  const tileHeight = _tileHeight * tileRatio;
  const { x, y } = point;

  // Create unit vectors representing transformation from cartesian to isometric coordinate space
  const iHat = [0.5 * tileWidth, 0.25 * tileHeight];
  const jHat = [-0.5 * tileWidth, 0.25 * tileHeight];

  // Account for isometric tile offset
  const tileOffset = withTileOffset ? tileWidth / 2 : 0;

  // Create new point via vector multiplication
  const isometricPoint: PointData = {
    x: x * iHat[0] + y * jHat[0] - tileOffset,
    y: x * iHat[1] + y * jHat[1],
  };

  return isometricPoint;
}
