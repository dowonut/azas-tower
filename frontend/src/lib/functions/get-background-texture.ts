import { parseTilemap } from "./parse-tilemap";

export async function getBackgroundTexture() {
  const sprites = await parseTilemap();
}
