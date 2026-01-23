import type { PointData } from "pixi.js";
import type { WorldTile } from "../classes/world-tile";

/** Get the tiles directly under some global (screen) point */
export function getTilesAt({
  tiles,
  point,
  tilePosition,
}: {
  tiles: WorldTile[];
  point: PointData;
  tilePosition: PointData;
}) {
  const nearbyTiles = tiles.filter(
    (tile) =>
      Math.abs(tilePosition.x - tile.tilePosition.x) < 2 &&
      Math.abs(tilePosition.y - tile.tilePosition.y) < 2,
  );

  const tilesAtPoint = nearbyTiles
    .filter((tile) => {
      const localPoint = tile.sprite.toLocal(point);
      return tile.sprite.containsPoint(localPoint);
    })
    .sort((a, b) => b.layer - a.layer || b.depthLayer - a.depthLayer);

  if (tilesAtPoint.length < 1) return;

  return tilesAtPoint;
}
