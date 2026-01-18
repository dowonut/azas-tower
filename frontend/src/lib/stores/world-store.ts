import { create } from "zustand";
import type { MapTile } from "../classes/map-tile";

type WorldState = {
  tiles: MapTile[];
};

type WorldAction = {
  update: (newWorld: Partial<WorldState>) => void;
};

const INITIAL_STATE: WorldState = {
  tiles: [],
};

export const useWorldStore = create<WorldState & WorldAction>()((set) => ({
  ...INITIAL_STATE,
  update: (newWorld) => set(() => newWorld),
}));
