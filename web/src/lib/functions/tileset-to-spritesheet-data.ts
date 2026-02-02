import type { SpritesheetData } from "pixi.js";
import type { Tileset } from "../types/tiled";

export type MinimumTileset = {
  columns: number;
  tilewidth: number;
  tileheight: number;
  tilecount: number;
  tiles?: Tileset["tiles"];
};

/**
 * Convert a Tiled tileset to Spritesheet object data
 */
export function tilesetToSpritesheetData({
  tileset,
}: {
  tileset: MinimumTileset;
}): SpritesheetData {
  const { columns, tilewidth, tileheight } = tileset;

  let frames: SpritesheetData["frames"] = {};
  let animations: SpritesheetData["animations"] = {};
  for (let i = 0; i < tileset.tilecount; i++) {
    frames[i + 1] = {
      frame: {
        x: (i % columns) * tilewidth,
        y: Math.floor(i / columns) * tileheight,
        w: tilewidth,
        h: tileheight,
      },
    };

    const animation = tileset?.tiles?.find((x) => x.id === i)?.animation;
    if (!!animation) {
      animations[i + 1] = animation.map((x) => `${x.tileid + 1}`);
    }
  }

  const spritesheetData: SpritesheetData = {
    frames,
    animations,
    meta: {
      scale: "1",
    },
  };

  return spritesheetData;
}
