import type { PointData } from "pixi.js";
import { getTilesAt } from "./get-tiles-at";
import type { WorldTile } from "../classes/world-tile";
import type { Player } from "../classes/player";

/** Check if there's a walkable tile at some world point */
export function getWalkableTileAt({
  player,
  point,
  tiles,
  onlyTopTile = false,
  onlyCurrentLayer = false,
}: {
  player: Player;
  point: PointData;
  tiles: WorldTile[];
  onlyTopTile?: boolean;
  onlyCurrentLayer?: boolean;
}): WorldTile | null {
  // Get tile at exact point
  const tilesAtPoint = getTilesAt({
    point,
    tiles,
  });
  if (!tilesAtPoint || tilesAtPoint.length < 1) return null;

  // Check if point within tile is walkable
  let validTile: WorldTile | undefined;
  const max = onlyTopTile ? 1 : tilesAtPoint.length;
  for (let i = 0; i < max && !validTile; i++) {
    const tile = tilesAtPoint[i];

    // Skip if not current layer when only current layer
    if (onlyCurrentLayer && tile.layer !== player.layer) continue;

    const localTilePoint = {
      x: point.x - tile.position.x,
      y: point.y - tile.position.y,
    };
    const isWalkable = tile.walkable.containsPoint(localTilePoint);
    const isAbovePlayer = tile.parent?.parent?.label === "abovePlayer";

    if (isAbovePlayer) {
      // console.log(`Tile ${i} is above player`);
      continue;
    }

    if (i == 0 && isWalkable) {
      // console.log(`Tile ${i} is walkable`);
      validTile = tile;
      continue;
    }

    if (isWalkable && !tile.hasTileAbove({ tiles })) {
      // console.log(`Tile ${i} is walkable and has nothing above`);
      validTile = tile;
      continue;
    }
  }

  if (!validTile) return null;

  return validTile;
}
