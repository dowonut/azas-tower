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
  const tileUnderPlayer = tiles
    .filter(
      (tile) =>
        tile.tilePosition.x === playerTilePosition.x &&
        tile.tilePosition.y === playerTilePosition.y &&
        tile.isWalkable &&
        tile.layer - playerLayer <= 1
    )
    .sort((a, b) => b.layer - a.layer)[0];

  if (!tileUnderPlayer) return;

  return tileUnderPlayer;
}
