import type { Player } from "../classes/player";
import type { World } from "../classes/world";
import type { WorldTile } from "../classes/world-tile";
import { getTilesAt } from "./get-tiles-at";

/** Get the tile the player is currently standing on */
export function getTileUnderPlayer({
  world,
  player: { position, tilePosition, layer },
}: {
  world: World;
  player: Player;
}): WorldTile | null {
  const globalPosition = world.toGlobal({ x: position.x, y: position.y });

  const tilesUnderPlayer = getTilesAt({
    point: globalPosition,
    tilePosition,
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
