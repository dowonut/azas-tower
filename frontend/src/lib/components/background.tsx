import { Sprite, type FederatedPointerEvent } from "pixi.js";
import { useRef } from "react";
import { usePlayerCharacterStore } from "../stores/player-character-store";
import { BackgroundSprite } from "./background-sprite";
import { toTilePosition } from "../functions/to-tile-position";

export function Background({ overlay = false }: { overlay?: boolean }) {
  const SCALE = 3;

  const ref = useRef<Sprite | null>(null);

  const update = usePlayerCharacterStore((state) => state.update);

  function handlePointerUp(e: FederatedPointerEvent) {
    if (e.button !== 0) return;

    const globalPoint = { x: e.globalX, y: e.globalY };
    const localPoint = ref.current?.toLocal(globalPoint) || globalPoint;

    const desiredPosition = {
      x: Math.round(localPoint.x * SCALE),
      y: Math.round(localPoint.y * SCALE),
    };

    console.log(
      "Moving to:",
      desiredPosition,
      toTilePosition(desiredPosition, { scale: SCALE })
    );

    update({
      desiredPosition,
    });
  }

  return (
    <BackgroundSprite
      ref={ref}
      scale={SCALE}
      onPointerUp={handlePointerUp}
      overlay={overlay}
    />
  );
}
