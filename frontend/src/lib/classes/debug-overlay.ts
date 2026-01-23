import { Container, Text, Ticker, type ContainerOptions } from "pixi.js";

export class DebugOverlay extends Container {
  fpsCounter: Text;

  constructor({ ticker, ...options }: ContainerOptions & { ticker: Ticker }) {
    super(options);

    this.x = 10;

    const fpsCount = new Text({
      text: "",
    });

    this.fpsCounter = fpsCount;
    this.addChild(fpsCount);

    const debugTicker = new Ticker();
    debugTicker.minFPS = 1;
    debugTicker.maxFPS = 5;
    debugTicker.add((_) => {
      const fpsDisplay = Math.round(ticker.FPS);
      this.fpsCounter.text = `FPS: ${fpsDisplay}`;
    });
    debugTicker.start();
  }
}
