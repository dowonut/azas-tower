import type { PixiReactElementProps } from "@pixi/react";
import { Sprite } from "pixi.js";
import { useEffect, type ReactElement } from "react";
import { useShallow } from "zustand/shallow";
import type { MapTile } from "../classes/map-tile";
import { parseTilemap } from "../functions/parse-tilemap";
import { usePlayerCharacterStore } from "../stores/player-character-store";
import { useWorldStore } from "../stores/world-store";
import { getTileUnderPlayer } from "../functions/get-tile-under-player";
import map from "../../assets/maps/map-1.json";
import tileset from "../../assets/tilesets/background-tileset.json";

export function BackgroundSprite({
  ref,
  scale = 1,
  overlay = false,
  ...props
}: { scale: number; overlay?: boolean } & PixiReactElementProps<
  typeof Sprite
>) {
  const { tiles, update } = useWorldStore(useShallow((state) => state));
  const {
    position: playerPosition,
    layer: playerLayer,
    tilePosition: playerTilePosition,
  } = usePlayerCharacterStore(useShallow((state) => state));

  useEffect(() => {
    parseTilemap({ map, tileset }).then((parsedTiles) => {
      update({ tiles: parsedTiles });
      console.log("Parsed tiles:", parsedTiles.length);
    });
  }, []);

  // Filter tiles based on whether they're behind or in front of the player
  const filteredTiles = tiles.filter((x) =>
    overlay
      ? !x.isBehindPlayer({ playerPosition, playerLayer, scale })
      : x.isBehindPlayer({ playerPosition, playerLayer, scale })
  );

  const tileUnderPlayer = getTileUnderPlayer({
    playerTilePosition,
    playerLayer,
    tiles,
  });

  /** Map tile objects to React elements */
  function mapTiles(tiles: MapTile[]): ReactElement[] {
    return tiles.map((tile) => tile?.toSprite());
  }

  return (
    <>
      <pixiContainer
        ref={ref}
        // tint={overlay ? undefined : "red"}
        alpha={overlay ? 0.8 : 1}
        eventMode="static"
        scale={scale}
        {...props}
      >
        {mapTiles(filteredTiles)}
      </pixiContainer>

      {!!tileUnderPlayer && (
        <pixiContainer
          ref={ref}
          tint="blue"
          alpha={0.5}
          visible={!overlay}
          eventMode="static"
          scale={scale}
          {...props}
        >
          {mapTiles([tileUnderPlayer])}
        </pixiContainer>
      )}
    </>
  );
}
