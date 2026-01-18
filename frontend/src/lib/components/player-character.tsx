import { Assets, Sprite, Texture, type TextureSourceOptions } from "pixi.js";
import { useEffect, useRef, useState } from "react";
import { usePlayerCharacterStore } from "../stores/player-character-store";
import { useShallow } from "zustand/shallow";
import { useTick } from "@pixi/react";
import { round } from "../functions/round";
import { toTilePosition } from "../functions/to-tile-position";
import { useWorldStore } from "../stores/world-store";
import { getTileUnderPlayer } from "../functions/get-tile-under-player";

export function PlayerCharacter() {
  const spriteRef = useRef<Sprite | null>(null);

  const [texture, setTexture] = useState<Texture>(Texture.EMPTY);
  const [isHovered, setIsHovered] = useState(false);
  const [isActive, setIsActive] = useState(false);

  // Get world state
  const tiles = useWorldStore((state) => state.tiles);

  // Get player properties from the store
  const {
    position: { x, y },
    layer,
    desiredPosition,
    update,
  } = usePlayerCharacterStore(useShallow((state) => state));

  // Attach player ticker
  useTick((_) => {
    if (!desiredPosition) return;

    // Get tiles currently under the player's feet
    const tilePosition = toTilePosition({ x, y }, { scale: 3 });
    const tileUnderPlayer = getTileUnderPlayer({
      playerTilePosition: tilePosition,
      playerLayer: layer,
      tiles,
    });

    let newLayer = tileUnderPlayer?.layer || 0;
    console.log("Player layer:", newLayer);
    update({ tilePosition, layer: newLayer });

    // Calculate direction towards desired position
    const dx = desiredPosition.x - x;
    const dy = desiredPosition.y - y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Do nothing if distance is very small
    if (distance <= 1) {
      const roundedPosition = { x: round(x), y: round(y) };
      console.log("Arrived at destination:", roundedPosition);
      update({
        desiredPosition: undefined,
        position: roundedPosition,
      });
      return;
    }

    // Calculate relative movement
    const speed = 2;
    let moveX = (dx / distance) * speed;
    let moveY = (dy / distance) * speed;

    // Normalize the movement vector to prevent diagonal speed boost
    const moveDistance = Math.sqrt(moveX * moveX + moveY * moveY);
    if (moveDistance > speed) {
      const normalizationFactor = speed / moveDistance;
      moveX *= normalizationFactor;
      moveY *= normalizationFactor;
    }

    // Update position in the store
    update({
      position: { x: x + moveX, y: y + moveY },
    });
  });

  // Preload the sprite if it hasn't been loaded yet
  useEffect(() => {
    if (texture !== Texture.EMPTY) return;
    Assets.load({
      src: "https://pixijs.com/assets/bunny.png",
      data: { scaleMode: "nearest" } satisfies TextureSourceOptions,
    }).then((result) => setTexture(result));
  }, [texture]);

  return (
    <pixiSprite
      ref={spriteRef}
      anchor={{ x: 0.5, y: 0.9 }}
      eventMode="static"
      onClick={() => setIsActive(!isActive)}
      onPointerOver={() => setIsHovered(true)}
      onPointerOut={() => setIsHovered(false)}
      scale={3}
      texture={texture}
      tint={isHovered ? "red" : undefined}
      cursor="pointer"
      x={x}
      y={y}
    />
  );
}
