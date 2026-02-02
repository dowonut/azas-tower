import type { PointData } from "pixi.js";
import type { WorldTile } from "../classes/world-tile";
import { isometricToCartesian } from "./isometric-to-cartesian";

/** Get the tiles directly under some world point */
export function getTilesAt({
  tiles,
  point,
}: {
  tiles: WorldTile[];
  point: PointData;
}) {
  // Calculate tile position
  const tilePosition = isometricToCartesian(point);

  const nearbyTiles = tiles.filter(
    (tile) =>
      Math.abs(tilePosition.x - tile.tilePosition.x) < 2 &&
      Math.abs(tilePosition.y - tile.tilePosition.y) < 2,
  );

  // console.log(
  //   `Nearby tiles at point ${toTextPoint(point)}:`,
  //   nearbyTiles.length,
  // );

  const tilesAtPoint = nearbyTiles
    .filter((tile) => {
      // Calculate local point relative to the tile's sprite position
      const localPoint = {
        x: point.x - tile.position.x,
        y: point.y - tile.position.y,
      };
      // console.log(
      //   `Converted from world ${toTextPoint(point)} to local ${toTextPoint(localPoint)}`,
      // );
      return tile.sprite.containsPoint(localPoint);
    })
    .sort((a, b) => b.layer - a.layer || b.depthLayer - a.depthLayer);

  // console.log(`Tiles at point ${toTextPoint(point)}:`, tilesAtPoint.length);

  if (tilesAtPoint.length < 1) return;

  return tilesAtPoint;
}
