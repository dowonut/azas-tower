import { useHotkeys } from "react-hotkeys-hook";
import type { Direction, Entries } from "../types";

const movementKeys: Record<Direction, string[]> = {
  up: ["ArrowUp", "KeyW"],
  down: ["ArrowDown", "KeyS"],
  left: ["ArrowLeft", "KeyA"],
  right: ["ArrowRight", "KeyD"],
};

export function MovementHandler() {
  for (const [direction, keys] of Object.entries(movementKeys) as Entries<
    typeof movementKeys
  >) {
    for (const key of keys) {
      useHotkeys(key, () => console.log(direction));
    }
  }

  return <></>;
}
