import { defineConfig } from "tsdown";

export default defineConfig({
  entry: ["src/index.ts", "src/lib.ts"],
  outDir: "dist",
  format: ["esm", "cjs"],
  copy: ["src/styles"],
  exports: false, // Disable auto-generation to manually control types in exports
  dts: {
    resolve: true,
  },
  clean: true,
  treeshake: true,
});
