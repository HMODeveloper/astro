import { defineConfig } from "tsdown"

export default defineConfig({
  entry: {
    index: "src/index.ts",
  },
  outDir: "dist",
  platform: "node",
  format: ["esm"],
  target: "node22",
  clean: true,
  dts: false,
  treeshake: true,
  minify: true,
  sourcemap: false,
  deps: {
    alwaysBundle: [/.*/],
  },
})
