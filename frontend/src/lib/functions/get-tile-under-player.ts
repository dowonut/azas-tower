import type { Player } from "../classes/player";
import type { World } from "../classes/world";
import type { WorldTile } from "../classes/world-tile";
import { getTilesAt } from "./get-tiles-at";

/** Get the tile the player is currently standing on */
export function getTileUnderPlayer({
  world,
  player: { position, layer },
}: {
  world: World;
  player: Player;
}): WorldTile | null {
  const tilesUnderPlayer = getTilesAt({
    point: position,
    tiles: world.tiles,
  });

  if (!tilesUnderPlayer) return null;

  const validTiles = tilesUnderPlayer.filter(
    (tile) =>
      tile.isWalkable &&
      // !tile.hasTileAbove({ tiles: world.tiles }) &&
      tile.layer - layer <= 1,
  );

  if (validTiles.length < 1) return null;

  return validTiles[0];
}
