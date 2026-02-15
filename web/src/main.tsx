import { Game } from "@classes/game.ts";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";
import "./index.css";
// import { DebugOverlay } from "./lib/classes/debug-overlay.ts";
// import type { EntityAnimation } from "./lib/classes/entity.ts";
// import { GameConsole } from "./lib/classes/game-console.ts";
// import { Player } from "./lib/classes/player.ts";
import {
  AnimationState,
  ConnectionId,
  DesiredPosition,
  Heading,
  IsSelf,
  Name,
  Position,
  Render,
} from "@ecs/components.ts";
import { EntityMoveSystem } from "@ecs/systems.ts";
import {
  addComponent,
  addComponents,
  addEntity,
  entityExists,
  hasComponent,
  removeComponent,
  removeEntity,
  setComponent,
} from "bitecs";
import { AnimatedSprite, UPDATE_PRIORITY } from "pixi.js";
import { parseTileset } from "./lib/functions/parse-tileset.ts";

import tileset from "@assets/tilesets/character-tileset.json";
import { ConnectionStatus } from "@generated/server.ts";
import { getDistance } from "./lib/functions/get-distance.ts";
import { createWorld } from "@ecs/world.ts";
import {
  Heading as HeadingEnum,
  EntityAnimationState,
} from "./lib/types/enums.ts";
import { Core, Scene } from "@esengine/ecs-framework";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

// (async () => {
//   // Initialize the game
//   const game = await Game.init();

//   // // Create player
//   // const player = new Player({ world });
//   // world.attachEntity({ entity: player, isPlayer: true });

//   // // Creat move indicator
//   // const moveIndicator = await MoveIndicator.init({ player });

//   // entityContainer.addChild(player);

//   // Create dummy players
//   const states: EntityAnimation[] = ["idle", "walking"] as const;
//   const headings = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
//   for (let j = 0; j < states.length; j++) {
//     const state = states[j];
//     for (let i = 0; i < headings.length; i++) {
//       const heading = headings[i];
//       const dummyPlayer = new Player({
//         world: game.world,
//         label: `dummy${j}${i}`,
//         heading,
//         state,
//         position: { x: i * 32, y: j * 32 },
//         showDisplayName: false,
//       });
//       game.world.attachEntity({ entity: dummyPlayer });
//       game.entityContainer.addChild(dummyPlayer);
//     }
//   }

//   // Set viewpoint according to world dimensions
//   game.viewport.position.set(500, 0);

//   // Create debug overlay
//   const debugOverlay = new DebugOverlay({
//     game,
//   });
//   game.app.stage.addChild(debugOverlay);

//   // Create console
//   const gameConsole = new GameConsole({ game });
//   game.app.stage.addChild(gameConsole);

//   // Add global tickers
//   game.app.ticker.add((ticker) => {
//     // Handle player movement
//     // handlePlayerMovement({ player, world, ticker });
//   });

//   // Connect to the server once the entire client has initialized
//   game.server.connect();

//   // Handle sync packets from the server
//   game.server.onSync((packet) => {
//     console.log("Received sync packet", packet);

//     // Update messages
//     gameConsole.addMessage(...packet.globalMessages);

//     // Update entities
//     if (packet.entities && packet.entities.length > 0) {
//       for (const entity of packet.entities) {
//         game.spawnOrUpdateEntity(entity);
//       }
//     }
//   });
// })();

(async () => {
  // const world = createWorld();
  // registerObservers(world);

  Core.create({ debug: true });
  const scene = new Scene();
  scene.addSystem(new EntityMoveSystem());
  Core.setScene(scene);

  const game = await Game.init();
  game.viewport.position.set(500, 0);
  game.server.connect();
  // game.world.world = world;

  // Handle sync packets from the server
  game.server.onSync((packet) => {
    // console.log("Received sync packet", packet);

    // Update messages
    // gameConsole.addMessage(...packet.globalMessages);

    // Update entities
    if (packet.entities && packet.entities.length > 0) {
      for (const entity of packet.entities) {
        // Check if the entity already exists in the world by connectionId
        // const existingPlayer = ConnectionId.findIndex(
        //   (x) => x === entity.connectionId,
        // );
        const existingPlayer = scene.findEntity(entity.connectionId);

        if (
          existingPlayer &&
          entity.connectionStatus === ConnectionStatus.Offline
        ) {
          console.log("Removing entity", existingPlayer);
          const render = existingPlayer.getComponent(Render);
          if (render) {
            game.entityContainer.removeChild(render.container);
          }
          existingPlayer.destroy();
          continue;
        }

        // Handle creating a new entity if it doesn't exist and the connection status is online
        if (!existingPlayer) {
          console.log("Spawning new entity", entity.connectionId);

          const { animations } = parseTileset({ tileset });

          const newPlayer = scene.createEntity(entity.connectionId);
          newPlayer.addComponents([
            new Name(`Player ${entity.connectionId}`),
            new Position(),
            new ConnectionId(entity.connectionId),
            new Render(
              new AnimatedSprite({
                textures: animations[9],
                animationSpeed: 0.02,
                autoPlay: true,
                anchor: { x: 0.5, y: 1 },
              }),
            ),
            new Heading(),
            new AnimationState(),
          ]);

          // Attach the current player to the world
          const isSelf = entity.connectionId === game.server.socket.id;
          if (isSelf) {
            newPlayer.addComponent(new IsSelf());
            // game.world.playerId = newPlayer;
          }

          // const newPlayer = addEntity(world);
          // addComponents(world, newPlayer, [
          //   Name,
          //   Position,
          //   ConnectionId,
          //   Render,
          //   Heading,
          //   AnimationState,
          // ]);
          // Name[newPlayer] = entity.name;
          // Position[newPlayer] = entity.position;
          // ConnectionId[newPlayer] = entity.connectionId;
          // Heading[newPlayer] = HeadingEnum.S;
          // AnimationState[newPlayer] = EntityAnimationState.Idle;

          // const { animations } = parseTileset({ tileset });
          // Render[newPlayer] = new AnimatedSprite({
          //   textures: animations[9],
          //   animationSpeed: 0.02,
          //   autoPlay: true,
          //   anchor: { x: 0.5, y: 1 },
          //   position: Position[newPlayer],
          // });

          // game.entityContainer.addChild(Render[newPlayer]);

          // // Attach the current player to the world
          // const isSelf = entity.connectionId === game.server.socket.id;
          // if (isSelf) {
          //   addComponent(world, newPlayer, IsSelf);
          //   game.world.playerId = newPlayer;
          // }
        }
        // Update the existing entity if the connection status is online
        else {
          console.log("Updating existing entity", existingPlayer);

          const pos = existingPlayer.getComponent(Position)!;

          // Only update position if server position deviates significantly
          // from client position to avoid jitter from constant updates
          const deviation = getDistance(pos, entity.position);
          if (deviation > 20) {
            console.log(
              `Updating position from server (deviation: ${deviation})`,
            );
            pos.set(entity.position);
          }

          // If the packet contains a desired position, add that component to trigger movement
          if (!existingPlayer.hasComponent(IsSelf)) {
            if (entity.desiredPosition) {
              console.log(`Setting desiredPosition from server`);
              existingPlayer.createComponent(
                DesiredPosition,
                entity.desiredPosition.x,
                entity.desiredPosition.y,
              );
            } else {
              console.log("Removing desiredPosition from server");
              existingPlayer.removeComponentByType(DesiredPosition);
            }
          }
        }
      }
    }
  });

  game.app.ticker.add(
    (ticker) => {
      // update(world);
      Core.update(ticker.deltaMS / 1000);
    },
    undefined,
    UPDATE_PRIORITY.HIGH,
  );
})();
