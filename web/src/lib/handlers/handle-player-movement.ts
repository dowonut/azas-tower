import type { Ticker } from "pixi.js";
import type { Player } from "../classes/player";
import type { World } from "../classes/world";
import { getTileUnderPlayer } from "../functions/get-tile-under-player";
import { round } from "../functions/round";
import { isometricToCartesian } from "../functions/isometric-to-cartesian";

/**
 * Handle updating player movement
 */
export function handlePlayerMovement({
  player,
  world,
  ticker,
}: {
  player: Player;
  world: World;
  ticker: Ticker;
}) {
  const { desiredPositions, x, y } = player;

  if (desiredPositions.length < 1) return;

  const desiredPosition = desiredPositions[0];

  // Get tiles currently under the player's feet
  const tilePosition = isometricToCartesian({ x, y });
  const tileUnderPlayer = getTileUnderPlayer({
    player,
    world,
  });

  if (!!tileUnderPlayer) {
    player.tile = tileUnderPlayer;

    if (!tileUnderPlayer.hasTileAbove({ tiles: world.tiles })) {
      const newLayer = tileUnderPlayer.layer;
      player.layer = newLayer;
    }
  }

  // Calculate direction towards desired position
  const dx = desiredPosition.x - x;
  const dy = desiredPosition.y - y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Do nothing if distance is very small
  if (distance <= 1) {
    const roundedPosition = { x: round(x), y: round(y) };
    player.desiredPositions.splice(0, 1);
    player.position.set(roundedPosition.x, roundedPosition.y);
    if (player.desiredPositions.length < 1) {
      console.log("Arrived at destination:", roundedPosition, tilePosition);
    }
    return;
  }

  // Calculate relative movement
  const speed = 1;
  let moveX = (dx / distance) * speed;
  let moveY = (dy / distance) * speed;

  // Normalize the movement vector to prevent diagonal speed boost
  const moveDistance = Math.sqrt(moveX * moveX + moveY * moveY);
  if (moveDistance > speed) {
    const normalizationFactor = speed / moveDistance;
    moveX *= normalizationFactor;
    moveY *= normalizationFactor;
  }

  // Normalize according to delta time
  moveX *= ticker.elapsedMS / 8;
  moveY *= ticker.elapsedMS / 8;

  // Update position in the store
  player.position.set(x + moveX, y + moveY);
}
