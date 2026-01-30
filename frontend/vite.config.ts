import { AssetPack, type AssetPackConfig } from "@assetpack/core";
import { pixiPipes } from "@assetpack/core/pixi";
import react from "@vitejs/plugin-react";
import { defineConfig, type Plugin, type ResolvedConfig } from "vite";

function assetpackPlugin(): Plugin {
  const apConfig: AssetPackConfig = {
    entry: "./raw-assets",
    pipes: [
      ...pixiPipes({
        compression: { png: false, webp: false },
        resolutions: { default: 1 },
      }),
    ],
  };
  let mode: ResolvedConfig["command"];
  let ap: AssetPack | undefined;

  return {
    name: "vite-plugin-assetpack",
    configResolved(resolvedConfig) {
      mode = resolvedConfig.command;
      if (!resolvedConfig.publicDir) return;
      if (apConfig.output) return;
      const publicDir = resolvedConfig.publicDir.replace(process.cwd(), "");
      apConfig.output = `.${publicDir}/assets/`;
    },
    buildStart: async () => {
      if (mode === "serve") {
        if (ap) return;
        ap = new AssetPack(apConfig);
        void ap.watch();
      } else {
        await new AssetPack(apConfig).run();
      }
    },
    buildEnd: async () => {
      if (ap) {
        await ap.stop();
        ap = undefined;
      }
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    assetpackPlugin(),
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  // build: { rolldownOptions: { output: { advancedChunks: {} } } },
  preview: {
    allowedHosts: ["tower.linusguy.com", "tower-api.linusguy.com", "localhost"],
  },
  assetsInclude: ["**/*.tmx"],
});
