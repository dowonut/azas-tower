import { AStarFinder, type Grid, Util } from "pathfinding";
import type { PointData } from "pixi.js";

/** Find a path between two points in a grid */
export function findPath({
  from,
  to,
  grid,
}: {
  from: PointData;
  to: PointData;
  grid: Grid;
}): PointData[] | null {
  const finder = new AStarFinder({
    allowDiagonal: true,
    dontCrossCorners: true,
  });
  const rawPath = finder.findPath(from.x, from.y, to.x, to.y, grid.clone());

  if (rawPath.length < 1) return null;

  // const smoothedPath = Util.smoothenPath(grid, rawPath);

  const path = rawPath.map((x) => ({ x: x[0], y: x[1] }));

  return path;
}
