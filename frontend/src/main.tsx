import {
  Application,
  Assets,
  Container,
  TextStyle,
  TextureStyle,
} from "pixi.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";
import "./index.css";
import { CustomViewport } from "./lib/classes/custom-viewport.ts";
import { DebugOverlay } from "./lib/classes/debug-overlay.ts";
import { MoveIndicator } from "./lib/classes/move-indicator.ts";
import { Player } from "./lib/classes/player.ts";
import { server } from "./lib/classes/socket.ts";
import { World } from "./lib/classes/world.ts";
import { handlePlayerMovement } from "./lib/handlers/handle-player-movement.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

(async () => {
  // Create Application
  const app = new Application();
  await app.init({
    preference: "webgpu",
    antialias: false,
    // autoDensity: true,
    // resolution: devicePixelRatio || 1,
  });

  server.socket.emit("message", "hi server!");
  server.socket.on("message-back", (message) => {
    console.log(`Received response:`, message);
  });

  // Attach to game div
  const parentDiv = document.getElementById("game");
  if (!parentDiv) throw new Error("Failed to get game div");
  parentDiv.appendChild(app.canvas);
  app.resizeTo = parentDiv;

  const { renderer, stage } = app;

  // Initialize assets
  await Assets.init({
    manifest: "manifest.json",
    basePath: "assets/",
  });

  // Set default texture styles
  TextureStyle.defaultOptions.scaleMode = "nearest";

  // Set default text styles
  TextStyle.defaultTextStyle = {
    ...TextStyle.defaultTextStyle,
    fontFamily: "monogram",
    fill: "white",
    fontSize: 32,
    stroke: { width: 4, color: "black" },
  };

  // Load bundles
  await Assets.loadBundle("default");

  // Create viewport
  const viewport = new CustomViewport({
    events: renderer.events,
    drag: { mouseButtons: "middle" },
    pinch: true,
    wheel: true,
    // clamp: { direction: "all" },
    clampZoom: {
      minWidth: 200,
      minHeight: 200,
      maxWidth: 3000,
      maxHeight: 3000,
    },
  });
  stage.addChild(viewport);

  // Create world container
  const worldScale = 3;
  const worldContainer = new Container({
    scale: worldScale,
    eventMode: "static",
  });
  viewport.addChild(worldContainer);

  // Create world
  const world = new World();

  // Create player
  const player = new Player({ world });
  await player.init();

  const player2 = new Player({ world, x: 64, y: 16 * 6 });
  await player2.init();

  // Initialize world after player
  await world.init({ player });

  // Creat move indicator
  const moveIndicator = await MoveIndicator.init({ player });

  // Add children to container
  worldContainer.addChild(world);
  worldContainer.addChild(moveIndicator);
  worldContainer.addChild(player);
  worldContainer.addChild(player2);

  // Set viewpoint according to world dimensions
  viewport.position.set(500, 0);

  // Create debug overlay
  const debugOverlay = new DebugOverlay({
    ticker: app.ticker,
    world,
    worldContainer,
  });
  stage.addChild(debugOverlay);

  // Add global tickers
  app.ticker.add((ticker) => {
    // Handle player movement
    handlePlayerMovement({ player, world, ticker });
  });
})();
