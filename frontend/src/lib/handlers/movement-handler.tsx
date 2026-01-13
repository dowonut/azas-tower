import { useHotkeys } from "react-hotkeys-hook";
import { usePlayerCharacterStore } from "../stores/player-character-store";
import type { Direction, Entries } from "../types";

const movementKeys: Record<Direction, string[]> = {
  up: ["ArrowUp", "KeyW"],
  down: ["ArrowDown", "KeyS"],
  left: ["ArrowLeft", "KeyA"],
  right: ["ArrowRight", "KeyD"],
};

export function MovementHandler() {
  const move = usePlayerCharacterStore((state) => state.move);

  for (const [direction, keys] of Object.entries(movementKeys) as Entries<
    typeof movementKeys
  >) {
    for (const key of keys) {
      useHotkeys(key, () => move({ direction, distance: 10 }));
    }
  }

  return <></>;
}
