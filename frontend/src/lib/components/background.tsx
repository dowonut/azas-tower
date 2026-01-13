import { Assets, Sprite, Texture, type FederatedPointerEvent } from "pixi.js";
import { useRef, useState } from "react";
import { usePlayerCharacterStore } from "../stores/player-character-store";

export function Background() {
  const SCALE = 3;

  const ref = useRef<Sprite | null>(null);

  const [texture, setTexture] = useState<Texture>(Texture.EMPTY);

  const update = usePlayerCharacterStore((state) => state.update);

  Assets.load({ src: "map-1.png", data: { scaleMode: "nearest" } }).then(
    (loadedTexture) => {
      setTexture(loadedTexture);
    }
  );

  function handlePointerUp(e: FederatedPointerEvent) {
    if (e.button !== 0) return;

    const globalPoint = { x: e.globalX, y: e.globalY };
    const localPoint = ref.current?.toLocal(globalPoint) || globalPoint;

    const desiredPosition = {
      x: Math.round(localPoint.x * SCALE),
      y: Math.round(localPoint.y * SCALE),
    };

    update({
      desiredPosition,
    });
  }

  return (
    <pixiSprite
      ref={ref}
      texture={texture}
      scale={SCALE}
      onPointerUp={handlePointerUp}
      eventMode="static"
    />
  );
}
