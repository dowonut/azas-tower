import type { SpritesheetData } from "pixi.js";
import type { Tileset } from "../types/tiled";

/**
 * Convert a Tiled tileset to Spritesheet object data
 */
export async function tilesetToSpritesheetData({
  tileset,
}: {
  tileset: Tileset;
}): Promise<SpritesheetData> {
  const { columns, tilewidth, tileheight } = tileset;

  let frames: SpritesheetData["frames"] = {};
  for (let i = 0; i < tileset.tilecount; i++) {
    frames[i + 1] = {
      frame: {
        x: (i % columns) * tilewidth,
        y: Math.floor(i / columns) * tileheight,
        w: tilewidth,
        h: tileheight,
      },
    };
  }

  const spritesheetData: SpritesheetData = {
    frames,
    meta: {
      scale: "1",
    },
  };

  return spritesheetData;
}
