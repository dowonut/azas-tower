import { CustomViewport } from "@classes/custom-viewport";
import { DebugOverlay } from "@classes/debug-overlay";
import type { EntityAnimation } from "@classes/entity";
import { GameConsole } from "@classes/game-console";
import { MoveIndicator } from "@classes/move-indicator";
import { Player } from "@classes/player";
import { Server } from "@classes/server";
import { World } from "@classes/world";
import {
  Application,
  Assets,
  Container,
  TextStyle,
  TextureStyle,
} from "pixi.js";
import { handlePlayerMovement } from "../handlers/handle-player-movement";
import type { PlayerBundle } from "@generated/server";

/**
 * The main Game class that initializes and holds references to all major components of the game
 */
export class Game {
  server: Server;
  app: Application;
  viewport: CustomViewport;
  world: World;
  worldContainer: Container;
  entityContainer: Container;

  private constructor({
    server,
    app,
    viewport,
    world,
    worldContainer,
    entityContainer,
  }: {
    server: Server;
    app: Application;
    viewport: CustomViewport;
    world: World;
    worldContainer: Container;
    entityContainer: Container;
  }) {
    this.server = server;
    this.app = app;
    this.viewport = viewport;
    this.world = world;
    this.worldContainer = worldContainer;
    this.entityContainer = entityContainer;
  }

  /** Initialize the game and all its components */
  public static async init() {
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
      events: app.renderer.events,
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
    app.stage.addChild(viewport);

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

    // Create entity container
    const entityContainer = new Container({
      label: "entityContainer",
    });

    // Add children to world container
    worldContainer.addChild(world);
    worldContainer.addChild(entityContainer);

    return new Game({
      server,
      app,
      viewport,
      world,
      worldContainer,
      entityContainer,
    });
  }

  /** Spawn a new entity or update an existing one */
  public spawnOrUpdateEntity(entity: PlayerBundle) {
    console.log(entity);
  }
}
