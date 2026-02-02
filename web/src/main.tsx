import {
  Application,
  Assets,
  Container,
  FederatedPointerEvent,
  Filter,
  FilterSystem,
  Geometry,
  GlProgram,
  Matrix,
  Mesh,
  Shader,
  Sprite,
  TextStyle,
  Texture,
  TextureStyle,
  UniformGroup,
} from "pixi.js";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./app.tsx";
import "./index.css";
import { GameConsole } from "./lib/classes/game-console.ts";
import { CustomViewport } from "./lib/classes/custom-viewport.ts";
import { DebugOverlay } from "./lib/classes/debug-overlay.ts";
import { MoveIndicator } from "./lib/classes/move-indicator.ts";
import { Player } from "./lib/classes/player.ts";
import { World } from "./lib/classes/world.ts";
import { handlePlayerMovement } from "./lib/handlers/handle-player-movement.ts";
import { Server } from "./lib/classes/server.ts";
import { parseTileset } from "./lib/functions/parse-tileset.ts";
import { NormalFilter } from "./lib/classes/normal-filter.ts";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);

(async () => {
  // Create Server
  const server = new Server();

  // Create Application
  const app = new Application();
  await app.init({
    preference: "webgl",
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
      maxWidth: 5000,
      maxHeight: 5000,
    },
  });
  stage.addChild(viewport);

  // Create world container
  const worldScale = 3;
  const worldContainer = new Container({
    label: "worldContainer",
    scale: worldScale,
    eventMode: "static",
  });
  viewport.addChild(worldContainer);

  // Create world
  const world = new World({ server });

  // const normalWorld = new World({ server, renderNormals: true });
  // const normalWorldTexture = renderer.generateTexture(normalWorld);
  // const worldFilter = new NormalFilter({ normalTexture: normalWorldTexture });
  // world.filters = worldFilter;

  // app.stage.eventMode = "static";
  // app.stage.onmousemove = (e: FederatedPointerEvent) => {
  //   const point = world.toLocal(e);
  //   const x = point.x + world.width / 2;
  //   const y = point.y;
  //   const normalX = x / world.width;
  //   const normalY = y / world.height;
  //   worldFilter.uniforms.uLight[0] = normalX;
  //   worldFilter.uniforms.uLight[1] = normalY;
  // };

  // Create player
  const player = new Player({ world });
  world.attachEntity({ entity: player, isPlayer: true });

  // Creat move indicator
  const moveIndicator = await MoveIndicator.init({ player });

  // Create entity container
  const entityContainer = new Container({
    label: "entityContainer",
  });
  entityContainer.addChild(player);

  // Add children to container
  worldContainer.addChild(world);
  worldContainer.addChild(moveIndicator);
  worldContainer.addChild(entityContainer);

  // Set viewpoint according to world dimensions
  viewport.position.set(500, 0);

  // Create debug overlay
  const debugOverlay = new DebugOverlay({
    ticker: app.ticker,
    server,
    world,
    worldContainer,
  });
  stage.addChild(debugOverlay);

  // Create console
  const gameConsole = new GameConsole({ app, server });
  stage.addChild(gameConsole);

  // Add global tickers
  app.ticker.add((ticker) => {
    // Handle player movement
    handlePlayerMovement({ player, world, ticker });
  });

  // Connect to the server once the entire client has initialized
  server.connect();

  // Handle server state changes
  server.onState(async (state) => {
    if (!server.socket.id) return;
    const user = state.users[server.socket.id];
    player.label = user.name;
    // player.x = user.position[0];
    // player.y = user.position[1];

    // Iterate through users
    for (const [id, user] of Object.entries(state.users)) {
      // Ignore self
      if (id === server.socket.id) continue;

      // Create new player
      const player = entityContainer.getChildByLabel(user.name);
      if (player === null) {
        const newPlayer = new Player({
          world,
          label: user.name,
          x: user.position[0],
          y: user.position[1],
        });
        entityContainer.addChild(newPlayer);
      }
      // Update player
      else {
        player.label = user.name;
        // player.x = user.position[0];
        // player.y = user.position[1];
      }
    }

    // Clean up disconnected users
    entityContainer.children.forEach((entity) => {
      if (!Object.values(state.users).some((x) => x.name === entity.label))
        entity.destroy({ children: true });
    });
  });
})();
