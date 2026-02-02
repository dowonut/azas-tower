import type { Application } from "pixi.js";
import { Server } from "./server";
import type { World } from "./world";
import type { Viewport } from "pixi-viewport";

export class Game {
  server: Server;
  world!: World;
  app!: Application;
  viewport!: Viewport;

  constructor() {
    this.server = new Server();
  }

  init({
    world,
    app,
    viewport,
  }: {
    world: World;
    app: Application;
    viewport: Viewport;
  }) {
    this.world = world;
    this.app = app;
    this.viewport = viewport;
  }
}
