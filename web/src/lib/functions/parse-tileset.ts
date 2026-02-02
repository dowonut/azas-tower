import { Assets, Spritesheet, Texture } from "pixi.js";
import {
  tilesetToSpritesheetData,
  type MinimumTileset,
} from "./tileset-to-spritesheet-data";
import type { Tileset } from "../types/tiled";

export type ParseTilesetOptions =
  | {
      /** Parse from a Tiled JSON file */
      tileset: Tileset;
    }
  | ({
      /** Parse directly from an image using sensible defaults */
      name: string;
    } & Partial<MinimumTileset>);

/**
 * Convert a Tiled tileset to a parsed Spritesheet
 */
export function parseTileset(options: ParseTilesetOptions) {
  let tileset: MinimumTileset;
  let tilesetName;
  if ("tileset" in options) {
    tileset = options.tileset;
    tilesetName = options.tileset.name;
  } else {
    tileset = {
      columns: options.columns ?? 10,
      tilecount: options.tilecount ?? 100,
      tileheight: options.tileheight ?? 32,
      tilewidth: options.tilewidth ?? 32,
    };
    tilesetName = options.name;
  }

  const spritesheetData = tilesetToSpritesheetData({ tileset });
  const sheetTexture = Texture.from(`sheets/${tilesetName}.png`);
  const sheet = new Spritesheet(sheetTexture, spritesheetData);
  sheet.parse();
  return sheet;
}
