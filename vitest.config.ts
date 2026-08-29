import { defineConfig } from "vitest/config";

/* Test runner (added Step 1.8 for the required kill-and-reload persistence
   test; also the runner Step 12.1's unit tests will use). happy-dom gives
   window/document for the autosave close-protection listeners;
   fake-indexeddb (loaded in setup) provides an in-memory IndexedDB. */
export default defineConfig({
  test: {
    environment: "happy-dom",
    setupFiles: ["./src/test/setup.ts"],
    include: ["src/**/*.test.{ts,tsx}"],
  },
});
