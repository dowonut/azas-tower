import { Game } from "@classes/game.ts";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";
import "./index.css";
import { DebugOverlay } from "./lib/classes/debug-overlay.ts";
import type { EntityAnimation } from "./lib/classes/entity.ts";
import { GameConsole } from "./lib/classes/game-console.ts";
import { Player } from "./lib/classes/player.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

(async () => {
  // Initialize the game
  const game = await Game.init();

  // // Create player
  // const player = new Player({ world });
  // world.attachEntity({ entity: player, isPlayer: true });

  // // Creat move indicator
  // const moveIndicator = await MoveIndicator.init({ player });

  // entityContainer.addChild(player);

  // Create dummy players
  const states: EntityAnimation[] = ["idle", "walking"] as const;
  const headings = ["N", "NE", "E", "SE", "S", "SW", "W", "NW"] as const;
  for (let j = 0; j < states.length; j++) {
    const state = states[j];
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const dummyPlayer = new Player({
        world: game.world,
        label: `dummy${j}${i}`,
        heading,
        state,
        position: { x: i * 32, y: j * 32 },
        showDisplayName: false,
      });
      game.world.attachEntity({ entity: dummyPlayer });
      game.entityContainer.addChild(dummyPlayer);
    }
  }

  // Set viewpoint according to world dimensions
  game.viewport.position.set(500, 0);

  // Create debug overlay
  const debugOverlay = new DebugOverlay({
    game,
  });
  game.app.stage.addChild(debugOverlay);

  // Create console
  const gameConsole = new GameConsole({ game });
  game.app.stage.addChild(gameConsole);

  // Add global tickers
  game.app.ticker.add((ticker) => {
    // Handle player movement
    // handlePlayerMovement({ player, world, ticker });
  });

  // Connect to the server once the entire client has initialized
  game.server.connect();

  // Handle sync packets from the server
  game.server.onSync((packet) => {
    console.log("Received sync packet", packet);

    // Update messages
    gameConsole.replaceMessages(packet.globalMessages);

    // Update entities
    for (const entity of packet.entities) {
      game.spawnOrUpdateEntity(entity);
    }
  });
})();
