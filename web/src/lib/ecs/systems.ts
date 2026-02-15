// import { IsA, query, removeComponent, set, setComponent } from "bitecs";
// import type { World } from "./world";
// import {
//   AnimationState,
//   DesiredPosition,
//   Heading,
//   Position,
//   Render,
// } from "./components";
// import { round } from "../functions/round";
import { vectorToDirection } from "../functions/vector-to-direction";
import { EntityAnimationState } from "../types/enums";

import {
  ECSSystem,
  Entity,
  EntitySystem,
  Matcher,
  Time,
} from "@esengine/ecs-framework";
import {
  AnimationState,
  DesiredPosition,
  Heading,
  Position,
} from "./components";

// function entityMoveSystem(world: World) {
//   // Convert delta from ms to seconds so movement is frame-rate independent.
//   // 32 pixels/second matches the server's fixed tick rate.
//   const DT = world.time.delta / 1000;
//   const SPEED = 64 * DT;

//   for (const entity of query(world, [Position, DesiredPosition])) {
//     const pos = Position[entity];
//     const desiredPos = DesiredPosition[entity];

// // Calculate direction towards desired position
// const dx = desiredPos.x - pos.x;
// const dy = desiredPos.y - pos.y;
// const distance = Math.sqrt(dx * dx + dy * dy);

// // Snap to destination if we're close enough to arrive this frame
// if (distance <= SPEED) {
//   setComponent(world, entity, Position, {
//     x: round(desiredPos.x),
//     y: round(desiredPos.y),
//   });
//   removeComponent(world, entity, DesiredPosition);
//   continue;
// }

// // Normalize direction and scale by speed * dt
// const moveX = (dx / distance) * SPEED;
// const moveY = (dy / distance) * SPEED;

// // Get the player's current heading
// const heading = vectorToDirection({ x: moveX, y: moveY });
// setComponent(world, entity, Heading, heading);
// setComponent(world, entity, AnimationState, EntityAnimationState.Walking);

// // Update position
// setComponent(world, entity, Position, {
//   x: (pos.x += moveX),
//   y: (pos.y += moveY),
// });
//   }
// }

// function timeSystem(world: World) {
//   const { time } = world;
//   const now = performance.now();
//   const delta = now - time.then;
//   time.delta = delta;
//   time.elapsed += delta;
//   time.then = now;
// }

// function renderSystem(world: World) {
//   // Update render positions to match entity positions
//   for (const entity of query(world, [Render, Position])) {
//     const container = Render[entity];
//     const newPosition = Position[entity];

//     if (
//       container.position.x === newPosition.x &&
//       container.position.y === newPosition.y
//     )
//       continue;

//     container.position = newPosition;
//   }
// }

// export function update(world: World) {
//   timeSystem(world);
//   entityMoveSystem(world);
//   //   renderSystem(world);
// }

@ECSSystem("EntityMove")
export class EntityMoveSystem extends EntitySystem {
  constructor() {
    super(Matcher.all(Position, DesiredPosition));
  }

  protected process(entities: readonly Entity[]): void {
    for (const entity of entities) {
      this.updatePosition(entity);
    }
  }

  private updatePosition(entity: Entity) {
    const DELTA_TIME = Time.deltaTime;
    const SPEED = 64 * DELTA_TIME;

    const pos = entity.getComponent(Position)!;
    const desiredPos = entity.getComponent(DesiredPosition)!;
    const heading = entity.getComponent(Heading)!;
    const animationState = entity.getComponent(AnimationState)!;

    // Calculate direction towards desired position
    const dx = desiredPos.x - pos.x;
    const dy = desiredPos.y - pos.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Snap to destination if we're close enough to arrive this frame
    if (distance <= SPEED) {
      pos.x = Math.round(desiredPos.x);
      pos.y = Math.round(desiredPos.y);
      entity.removeComponent(desiredPos);
      return;
    }

    // Normalize direction and scale by speed * dt
    const moveX = (dx / distance) * SPEED;
    const moveY = (dy / distance) * SPEED;

    // Get the player's current heading
    const newHeading = vectorToDirection({ x: moveX, y: moveY });
    heading.value = newHeading;
    animationState.value = EntityAnimationState.Walking;

    // Update position
    pos.x += moveX;
    pos.y += moveY;
  }
}
