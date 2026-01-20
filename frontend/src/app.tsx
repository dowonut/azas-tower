import { Application, extend } from "@pixi/react";
import {
  AnimatedSprite,
  Container,
  Graphics,
  RenderLayer,
  Sprite,
  Text,
} from "pixi.js";

import { useCallback, useRef, useState } from "react";

import { PlayerCharacter } from "./lib/components/player-character";

import styles from "./app.module.css";
import { CustomViewport } from "./lib/classes/custom-viewport";
import { Background } from "./lib/components/background";
import { Viewport } from "./lib/components/viewport";
import { MovementHandler } from "./lib/handlers/movement-handler";
import { MoveIndicator } from "./lib/components/move-indicator";

// Tell @pixi/react which Pixi.js components are available
extend({
  Container,
  Graphics,
  Sprite,
  AnimatedSprite,
  Text,
  CustomViewport,
  RenderLayer,
});

export function Content() {
  return (
    <>
      <Viewport>
        <pixiContainer>
          <Background />
          <MoveIndicator />
          <PlayerCharacter />
          <Background overlay />
        </pixiContainer>
      </Viewport>
    </>
  );
}

export function App() {
  const [isInitialized, setIsInitialized] = useState(false);
  const handleInit = useCallback(() => setIsInitialized(true), []);

  const parentRef = useRef(null);

  return (
    <>
      <MovementHandler />
      {/* Parent div used for resizing the Pixi.js canvas */}
      <div ref={parentRef} className={styles["application-container"]}>
        {/* Main game application */}
        <Application
          autoStart
          resizeTo={parentRef}
          antialias={false}
          onInit={handleInit}
          // preference="webgpu"
        >
          {isInitialized && <Content />}
        </Application>
      </div>
    </>
  );
}
