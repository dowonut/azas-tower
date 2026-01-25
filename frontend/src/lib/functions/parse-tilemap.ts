import type { Map, MapLayer, Tileset } from "../types/tiled";
import { getWorldTilesFromLayers } from "./get-world-tiles-from-layers";
import { parseTileset } from "./parse-tileset";
import walkableTileset from "../../assets/tilesets/walkable-tileset.json";

/**
 * Parse a tilemap and return WorldTiles
 */
export async function parseTilemap({
  map,
  tileset,
}: {
  map: Map;
  tileset: Tileset;
}) {
  const layers = map.layers.filter((x) => x.type === "tilelayer") as MapLayer[];

  const { textures } = await parseTileset({ tileset });
  const { textures: walkableTextures } = await parseTileset({
    tileset: walkableTileset,
  });

  const tiles = getWorldTilesFromLayers({
    layers,
    tileset,
    textures,
    walkableTextures,
  });

  return { tiles };
}
