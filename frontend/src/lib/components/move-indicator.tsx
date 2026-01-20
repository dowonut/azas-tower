import { useEffect, useRef, useState } from "react";
import { tilesetToTextures } from "../functions/tileset-to-textures";
import animatedTileset from "../../assets/tilesets/animated-tileset.json";
import { AnimatedSprite, Texture } from "pixi.js";
import { usePlayerCharacterStore } from "../stores/player-character-store";

export function MoveIndicator() {
  const ref = useRef<AnimatedSprite>(null);

  const [textures, setTextures] = useState<Texture[]>([Texture.EMPTY]);

  const desiredPosition = usePlayerCharacterStore((s) => s.desiredPosition);

  useEffect(() => {
    if (textures[0] !== Texture.EMPTY) return;
    tilesetToTextures({ tileset: animatedTileset }).then((textures) => {
      console.log("loaded textures");
      setTextures([textures[2], textures[1]]);
    });
  }, []);

  useEffect(() => {
    ref.current?.play();
  }, [textures]);

  return (
    <>
      <pixiAnimatedSprite
        ref={ref}
        textures={textures}
        animationSpeed={0.05}
        scale={3}
        anchor={{ x: 0.5, y: 0.75 }}
        alpha={0.8}
        visible={!!desiredPosition}
        x={desiredPosition?.x}
        y={desiredPosition?.y}
      />
    </>
  );
}
