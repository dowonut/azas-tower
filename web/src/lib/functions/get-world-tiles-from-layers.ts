import type { Texture } from "pixi.js";
import { WorldTile, type TextureType } from "../classes/world-tile";
import type { MapLayer, Tileset } from "../types/tiled";
import { cartesianToIsometric } from "./cartesian-to-isometric";

export function getWorldTilesFromLayers({
  layers,
  tileset,
  textures,
  walkableTextures,
  diffuseTextures,
  normalTextures,
  textureType = "diffuse",
}: {
  layers: MapLayer[];
  tileset: Tileset;
  textures: Record<string | number, Texture>;
  walkableTextures: Record<string | number, Texture>;
  diffuseTextures: Record<string | number, Texture>;
  normalTextures: Record<string | number, Texture>;
  textureType?: TextureType;
}) {
  let tiles: WorldTile[] = [];

  // Iterate through each layer
  for (let i = 0; i < layers.length; i++) {
    const layer = layers[i];
    if (!layer.data || !layer.width || !layer.height) continue;

    // Iterate through each tile in the layer
    for (let j = 0; j < layer.data.length; j++) {
      const id = layer.data[j];

      // Ignore empty tiles
      if (id === 0) continue;

      // Get tile information
      const tile = tileset.tiles?.find((t) => t.id + 1 === id);

      // Calculate sprite position using isometric projection
      const column = j % layer.width;
      const row = Math.floor(j / layer.width);
      const isometricPosition = cartesianToIsometric(
        { x: column, y: row },
        {
          tileWidth: tileset.tilewidth,
          tileHeight: tileset.tileheight,
        },
      );

      const worldTile = new WorldTile({
        texture: textures[id],
        walkableTexture: walkableTextures[id],
        normalTexture: normalTextures[id],
        position: isometricPosition,
        tilePosition: { x: column, y: row },
        spriteId: id,
        tileId: j,
        layer: i,
        properties: tile?.properties,
        textureType,
      });

      tiles.push(worldTile);
    }
  }

  return tiles;
}
