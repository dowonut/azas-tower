import { WorldTile } from "../classes/world-tile";
import type { Map, MapLayer, Tileset } from "../types/tiled";
import { parseTileset } from "./parse-tileset";

/**
 * Parse a tilemap and return an array of WorldTiles
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
      const x = ((column - row) * tileset.tilewidth) / 2;
      const y = (column + row) * (tileset.tileheight / 4);

      const worldTile = new WorldTile({
        texture: textures[id],
        position: { x, y },
        tilePosition: { x: column, y: row },
        spriteId: id,
        tileId: j,
        layer: i,
        properties: tile?.properties,
      });

      tiles.push(worldTile);
    }
  }

  return tiles;
}
