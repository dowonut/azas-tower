import { Assets, Spritesheet } from "pixi.js";
import { tilesetToSpritesheetData } from "./tileset-to-spritesheet-data";
import type { Tileset } from "../types/tiled";

/**
 * Convert a Tiled tileset to a texture array
 */
export async function tilesetToTextures({ tileset }: { tileset: Tileset }) {
  const spritesheetData = await tilesetToSpritesheetData({ tileset });
  const sheetTexture = await Assets.load({
    src: `sheets/${tileset.name}.png`,
    data: { scaleMode: "nearest" },
  });
  const sheet = new Spritesheet(sheetTexture, spritesheetData);
  const textures = await sheet.parse();
  return textures;
}
