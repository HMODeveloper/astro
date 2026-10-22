import { fileURLToPath } from "node:url"
import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  alias: {
    "@": fileURLToPath(new URL("src", import.meta.url)),
  },
  outDir: "dist",
  platform: "node",
  format: ["esm"],
  target: "node22",
  clean: true,
  dts: false,
  sourcemap: true,
  treeshake: true,
})
