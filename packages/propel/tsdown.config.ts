import { cp, mkdir, open, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { defineConfig } from "tsdown";

const PACKAGE_ROOT = path.dirname(fileURLToPath(import.meta.url));
const STYLES_SOURCE = path.join(PACKAGE_ROOT, "src/styles");
const STYLES_DESTINATION = path.join(PACKAGE_ROOT, "dist/styles");
const LOCK_SAFE_SUFFIX = PACKAGE_ROOT.replace(/[^a-zA-Z0-9]/g, "-");
const STYLES_LOCK = path.join(
  os.tmpdir(),
  `plane-propel-styles-${LOCK_SAFE_SUFFIX}.lock`,
);

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function withStylesCopyLock(task: () => Promise<void>) {
  let handle: import("node:fs/promises").FileHandle | undefined;

  while (!handle) {
    try {
      handle = await open(STYLES_LOCK, "wx");
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "EEXIST") {
        await sleep(25);
        continue;
      }
      throw error;
    }
  }

  try {
    await task();
  } finally {
    await handle.close();
    await rm(STYLES_LOCK, { force: true });
  }
}

async function copyStylesDirectory() {
  await withStylesCopyLock(async () => {
    await rm(STYLES_DESTINATION, { recursive: true, force: true });
    await mkdir(path.dirname(STYLES_DESTINATION), { recursive: true });
    await cp(STYLES_SOURCE, STYLES_DESTINATION, { recursive: true });
  });
}

// Ensures both `tsdown` build and dev tasks share the same styles copy without clashing.
function stylesCopyPlugin() {
  let copiedForRun = false;

  return {
    name: "propel-styles-copy",
    async buildStart() {
      copiedForRun = false;
      this.addWatchFile?.(STYLES_SOURCE);
    },
    async writeBundle() {
      if (copiedForRun) return;
      copiedForRun = true;
      await copyStylesDirectory();
    },
  };
}

function normalizeExportKeys(raw: Record<string, unknown>) {
  const normalizeValue = (value: unknown): unknown => {
    if (typeof value === "string") {
      return value.replace(/\\/g, "/");
    }
    if (Array.isArray(value)) {
      return value.map((item) => normalizeValue(item));
    }
    if (value && typeof value === "object") {
      return Object.fromEntries(
        Object.entries(value).map(([entryKey, entryValue]) => [
          entryKey,
          normalizeValue(entryValue),
        ]),
      );
    }
    return value;
  };

  const normalized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(raw)) {
    const forwardKey = key.replace(/\\/g, "/");
    const normalizedValue = normalizeValue(value);
    normalized[forwardKey] = normalizedValue;

    if (forwardKey.endsWith("/index")) {
      const withoutIndex = forwardKey.replace(/\/index$/, "");
      if (!normalized[withoutIndex]) {
        normalized[withoutIndex] = normalizedValue;
      }
    }
  }

  return normalized;
}

export default defineConfig({
  entry: [
    "src/accordion/index.ts",
    "src/animated-counter/index.ts",
    "src/avatar/index.ts",
    "src/banner/index.ts",
    "src/button/index.ts",
    "src/calendar/index.ts",
    "src/card/index.ts",
    "src/charts/*/index.ts",
    "src/collapsible/index.ts",
    "src/combobox/index.ts",
    "src/command/index.ts",
    "src/context-menu/index.ts",
    "src/dialog/index.ts",
    "src/empty-state/index.ts",
    "src/emoji-icon-picker/index.ts",
    "src/emoji-reaction/index.ts",
    "src/emoji-reaction-picker/index.ts",
    "src/icons/index.ts",
    "src/input/index.ts",
    "src/menu/index.ts",
    "src/pill/index.ts",
    "src/popover/index.ts",
    "src/portal/index.ts",
    "src/scrollarea/index.ts",
    "src/skeleton/index.ts",
    "src/switch/index.ts",
    "src/table/index.ts",
    "src/tabs/index.ts",
    "src/toast/index.ts",
    "src/toolbar/index.ts",
    "src/tooltip/index.ts",
    "src/utils/index.ts",
  ],
  outDir: "dist",
  format: ["esm", "cjs"],
  exports: {
    customExports: (exports) => ({
      ...normalizeExportKeys(exports),
      "./styles/fonts.css": "./dist/styles/fonts/index.css",
      "./styles/fonts": "./dist/styles/fonts/index.css",
      "./styles/react-day-picker.css": "./dist/styles/react-day-picker.css",
      "./styles/react-day-picker": "./dist/styles/react-day-picker.css",
    }),
  },
  plugins: [stylesCopyPlugin()],
  dts: true,
  clean: true,
  sourcemap: false,
});
