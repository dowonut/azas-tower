export type Tileset = {
  columns: number;
  image: string;
  imageheight: number;
  imagewidth: number;
  margin: number;
  name: string;
  spacing: number;
  tilecount: number;
  tiledversion: string;
  tileheight: number;
  tiles?: Tile[];
  tilewidth: number;
  type: string;
  version: string;
};

export type Tile = {
  id: number;
  animation?: TileAnimation[];
  objectgroup?: ObjectGroup;
  properties?: TileProperties[];
};

export type TileAnimation = {
  duration: number;
  tileid: number;
};

export type ObjectGroup = {
  draworder: string;
  id: number;
  name: string;
  objects: Object[];
  opacity: number;
  type: string;
  visible: boolean;
  x: number;
  y: number;
};

export type TileProperties = {
  name: string;
  type: string;
  value: boolean;
  // type: "bool" | "int" | "float" | "string" | "color" | "object";
  // value: string | number | boolean;
};

export type Object = {
  height: number;
  id: number;
  name: string;
  polygon?: Polygon[];
  rotation: number;
  type: string;
  visible: boolean;
  width: number;
  x: number;
  y: number;
};

export type Polygon = {
  x: number;
  y: number;
};

export type Map = {
  compressionlevel: number;
  height: number;
  infinite: boolean;
  layers: MapLayer[];
  nextlayerid: number;
  nextobjectid: number;
  orientation: string;
  renderorder: string;
  tiledversion: string;
  tileheight: number;
  tilesets: WorldTileset[];
  tilewidth: number;
  type: string;
  version: string;
  width: number;
};

export type MapLayer = {
  data?: number[];
  width?: number;
  height?: number;
  id: number;
  name: string;
  opacity: number;
  type: string;
  visible: boolean;
  x: number;
  y: number;
  draworder?: string;
  objects?: Object[];
};

export type WorldTileset = {
  firstgid: number;
  source: string;
};
