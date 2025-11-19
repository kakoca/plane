import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts"],
  outDir: "dist",
  format: ["esm", "cjs"],
  exports: false, // Disable auto-generation to manually control types in exports
  dts: {
    resolve: true,
  },
  clean: true,
  sourcemap: true,
  treeshake: true,
});
