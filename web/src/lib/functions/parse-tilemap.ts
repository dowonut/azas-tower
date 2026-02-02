import type { Map, MapLayer, Tileset } from "../types/tiled";
import { getWorldTilesFromLayers } from "./get-world-tiles-from-layers";
import { parseTileset } from "./parse-tileset";
import walkableTileset from "../../assets/tilesets/walkable-tileset.json";
import type { TextureType } from "../classes/world-tile";

/**
 * Parse a tilemap and return WorldTiles
 */
export function parseTilemap({
  map,
  tileset,
  textureType = "diffuse",
}: {
  map: Map;
  tileset: Tileset;
  textureType?: TextureType;
}) {
  const layers = map.layers.filter((x) => x.type === "tilelayer") as MapLayer[];

  const { textures } = parseTileset({ tileset });
  const { textures: walkableTextures } = parseTileset({
    tileset: walkableTileset,
  });
  const { textures: diffuseTextures } = parseTileset({
    name: `${tileset.name}-diffuse`,
  });
  const { textures: normalTextures } = parseTileset({
    name: `${tileset.name}-normal`,
  });

  const tiles = getWorldTilesFromLayers({
    layers,
    tileset,
    textures,
    walkableTextures,
    normalTextures,
    diffuseTextures,
    textureType,
  });

  return { tiles };
}
