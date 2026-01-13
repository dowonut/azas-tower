import type { PointData } from "pixi.js";
import { create } from "zustand";
import { getNewCharacterPosition } from "../functions/get-new-character-position";
import type { Direction } from "../types";

type PlayerCharacterState = {
  position: PointData;
  desiredPosition?: PointData;
};

type PlayerCharacterAction = {
  update: (newPlayerCharacter: Partial<PlayerCharacterState>) => void;
  move: (obj: { direction: Direction; distance: number }) => void;
};

const INITIAL_STATE: PlayerCharacterState = {
  position: { x: 100, y: 100 },
};

export const usePlayerCharacterStore = create<
  PlayerCharacterState & PlayerCharacterAction
>()((set) => ({
  ...INITIAL_STATE,
  update: (newPlayerCharacter) => set(() => newPlayerCharacter),
  move: ({ direction, distance }) =>
    set((state) => ({
      position: getNewCharacterPosition({
        currentPosition: state.position,
        direction,
        distance,
      }),
    })),
}));
