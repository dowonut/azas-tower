import { useApplication } from "@pixi/react";

export function Viewport({ children }: { children: React.ReactNode }) {
  const { app } = useApplication();

  return (
    <pixiCustomViewport
      events={app.renderer.events}
      drag={{ mouseButtons: "middle" }}
      pinch
      wheel
      // screenWidth={app.renderer.width}
      // screenHeight={app.renderer.height}
      // worldWidth={2000}
      // worldHeight={2000}
    >
      {children}
    </pixiCustomViewport>
  );
}
