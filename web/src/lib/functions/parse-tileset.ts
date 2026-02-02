import { Assets, Spritesheet } from "pixi.js";
import { tilesetToSpritesheetData } from "./tileset-to-spritesheet-data";
import type { Tileset } from "../types/tiled";

/**
 * Convert a Tiled tileset to a parsed Spritesheet
 */
export async function parseTileset({ tileset }: { tileset: Tileset }) {
  const spritesheetData = await tilesetToSpritesheetData({ tileset });
  const sheetTexture = await Assets.load({
    alias: `sheets/${tileset.name}.png`,
  });
  const sheet = new Spritesheet(sheetTexture, spritesheetData);
  await sheet.parse();
  return sheet;
}
