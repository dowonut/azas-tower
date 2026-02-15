import { createWorld as _createWorld } from "bitecs";

export const createWorld = () =>
  _createWorld({
    time: {
      delta: 0,
      elapsed: 0,
      then: performance.now(),
    },
  });
export type World = ReturnType<typeof createWorld>;

// export const world = _createWorld({
//   time: {
//     delta: 0,
//     elapsed: 0,
//     then: performance.now(),
//   },
// });
// export type World = typeof world;
