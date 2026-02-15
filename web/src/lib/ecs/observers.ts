// import { hasComponent, observe, onAdd, onSet } from "bitecs";
// import {
//   AnimationState,
//   DesiredPosition,
//   Heading,
//   Position,
//   Render,
// } from "./components";
// import type { World } from "./world";

// export const registerObservers = (world: World) => {
//   observe(world, onAdd(DesiredPosition), (entity) => {
//     // console.log(
//     //   `Entity ${entity} added DesiredPosition:`,
//     //   DesiredPosition[entity],
//     // );
//   });

//   observe(world, onSet(Position), (entity) => {
//     if (!hasComponent(world, entity, Render)) return;

//     const container = Render[entity];
//     const newPosition = Position[entity];

//     if (
//       container.position.x === newPosition.x &&
//       container.position.y === newPosition.y
//     )
//       return;

//     container.position = newPosition;
//   });

//   observe(world, onSet(Heading, AnimationState), (entity) => {
//     console.log("Change in Heading or AnimationState for entity", entity);
//   });
// };
