import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AppShell } from "./components/layout/AppShell";
import { MarbleSlab } from "./components/layout/MarbleSlab";
import { loadPersistedState, startAutosave } from "./services/persistence";
import "./styles/tokens.css";
import "./styles/layout.css";
import "./styles/marble.css";
import "./styles/primitives.css";
import "./styles/shell.css";
import "./styles/keyboard.css";
import "./styles/translation.css";
import "./styles/routing.css";
import "./styles/directness.css";
import "./styles/techniques.css";
import "./styles/composer.css";
import "./styles/streaming.css";

/* Restore persisted state before first paint so the user returns exactly
   where they were (no default-then-restored flicker), then mount and
   start the 5-second autosave. The load is wrapped so a failed/blocked
   IndexedDB (e.g. private browsing) never prevents the app from rendering
   — it just starts from defaults. IDB read is milliseconds; if this ever
   costs perceptible startup time, switch to render-then-hydrate with a
   hydrating flag (BUILD-LOG.md PARKED). */
async function bootstrap() {
  try {
    await loadPersistedState();
  } catch (error) {
    console.error("[persistence] restore failed; starting from defaults", error);
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <MarbleSlab />
      <AppShell />
    </StrictMode>,
  );

  startAutosave();
}

void bootstrap();
