import type { SpritesheetData } from "pixi.js";
import type { Tileset } from "../types/tiled";

export async function tilesetToSpritesheet({
  tileset,
}: {
  tileset: Tileset;
}): Promise<SpritesheetData> {
  const { columns, tilewidth, tileheight } = tileset;

  const frames: SpritesheetData["frames"] = Object.fromEntries(
    tileset.tiles.map((tile) => [
      tile.id + 1,
      {
        frame: {
          x: (tile.id % columns) * tilewidth,
          y: Math.floor(tile.id / columns) * tileheight,
          w: tilewidth,
          h: tileheight,
        },
      },
    ])
  );

  const spritesheetData = {
    frames,
    meta: {
      scale: "1",
    },
  };

  return spritesheetData;
}
