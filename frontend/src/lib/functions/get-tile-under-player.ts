import type { PointData } from "pixi.js";
import type { MapTile } from "../classes/map-tile";

/** Get the tile the player is currently standing on */
export function getTileUnderPlayer({
  tiles,
  playerTilePosition,
  playerLayer,
}: {
  tiles: MapTile[];
  playerTilePosition: PointData;
  playerLayer: number;
}) {
  const tilesAtSameTilePosition = tiles.filter(
    (tile) =>
      tile.tilePosition.x === playerTilePosition.x &&
      tile.tilePosition.y === playerTilePosition.y
  );
  const tileUnderPlayer = tilesAtSameTilePosition
    .filter(
      (tile) =>
        // Allow tiles marked as walkable
        tile.isWalkable &&
        // Only tiles that are not more than 1 layer above the player
        tile.layer - playerLayer <= 1
    )
    .sort((a, b) => b.layer - a.layer)[0];

  if (!tileUnderPlayer) return;

  if (tileUnderPlayer.hasTileAbove({ tiles })) {
    const realTileUnderPlayer = tileUnderPlayer.getTileAbove({ tiles });
    return realTileUnderPlayer;
  }

  return tileUnderPlayer;
}
