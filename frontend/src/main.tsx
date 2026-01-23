import {
  Application,
  Assets,
  Container,
  RenderLayer,
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
  viewport.position.set(500, 0);
  stage.addChild(viewport);

  // Create world container
  const worldContainer = new Container({ scale: 3 });
  viewport.addChild(worldContainer);

  // Create world
  const world = new World();

  // Create player
  const player = new Player({ world });
  await player.init();

  // Initialize world after player
  await world.init({ player });

  // Creat move indicator
  const moveIndicator = await MoveIndicator.init();

  // Create render layers
  const renderLayers = {
    behindPlayer: new RenderLayer(),
    abovePlayer: new RenderLayer(),
  } as const;

  // Add children to container
  worldContainer.addChild(world);
  worldContainer.addChild(renderLayers.behindPlayer);
  worldContainer.addChild(moveIndicator);
  worldContainer.addChild(player);
  worldContainer.addChild(renderLayers.abovePlayer);

  // Create debug overlay
  const debugOverlay = new DebugOverlay({ ticker: app.ticker });
  stage.addChild(debugOverlay);

  // Add global tickers
  app.ticker.add((ticker) => {
    // Attach tickers
    world.ticker({ player });
    moveIndicator.ticker({ player });

    // Handle player movement
    handlePlayerMovement({ player, world, ticker });
  });
})();
