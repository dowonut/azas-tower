// import { Application, extend } from "@pixi/react";
// import {
//   AnimatedSprite,
//   Container,
//   Graphics,
//   RenderLayer,
//   Sprite,
//   Text,
// } from "pixi.js";

import { useRef } from "react";

// import { PlayerCharacter } from "./lib/components/player-character";
// import { CustomViewport } from "./lib/classes/custom-viewport";
// import { Background } from "./lib/components/background";
// import { Viewport } from "./lib/components/viewport";
// import { MovementHandler } from "./lib/handlers/movement-handler";
// import { MoveIndicator } from "./lib/components/move-indicator";
// import { PerfectSprite } from "./lib/classes/perfect-sprite";

import styles from "./app.module.css";

// // Tell @pixi/react which Pixi.js components are available
// extend({
//   Container,
//   Graphics,
//   Sprite,
//   AnimatedSprite,
//   PerfectSprite,
//   Text,
//   CustomViewport,
//   RenderLayer,
// });

// export function Content() {
//   return (
//     <>
//       <Viewport>
//         <pixiContainer scale={3}>
//           <Background />
//           <MoveIndicator />
//           <PlayerCharacter />
//           <Background overlay />
//         </pixiContainer>
//       </Viewport>
//     </>
//   );
// }

export function App() {
  // const [isInitialized, setIsInitialized] = useState(false);
  // const handleInit = useCallback(() => setIsInitialized(true), []);

  const parentRef = useRef(null);

  return (
    <>
      {/* <MovementHandler /> */}
      {/* Parent div used for resizing the Pixi.js canvas */}
      <div
        id="game"
        ref={parentRef}
        className={styles["application-container"]}
      >
        {/* Main game application */}
        {/* <Application
          autoStart
          resizeTo={parentRef}
          antialias={false}
          onInit={handleInit}
          // preference="webgpu"
        >
          {isInitialized && <Content />}
        </Application> */}
      </div>
    </>
  );
}
