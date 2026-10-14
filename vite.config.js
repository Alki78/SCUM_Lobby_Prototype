import { defineConfig } from "vite";
import { viteSingleFile } from "vite-plugin-singlefile";

export default defineConfig({
  plugins: [viteSingleFile()],
  build: {
    // Leave the legacy markup/styles readable and avoid CSS rule rewrites.
    minify: false,
    cssMinify: false,
    assetsInlineLimit: Infinity,
  },
});
