import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { AccountGate } from "./components/layout/AccountGate";
import { AppShell } from "./components/layout/AppShell";
import { MarbleSlab } from "./components/layout/MarbleSlab";
import { AppErrorBoundary } from "./components/layout/AppErrorBoundary";
import { CustomBackgroundController } from "./services/customBackground";
import { loadPersistedState, saveNow, startAutosave } from "./services/persistence";
import { buildSessionRecord, sessionHasRecoverableWork } from "./services/sessionLifecycle";
import { loadDurableWorkspace, startDurableWorkspacePersistence } from "./services/durableLayer4";
import { useAccountStore } from "./stores/accountStore";
import { useSessionStore } from "./stores/sessionStore";
import type { SessionRecord } from "./stores/types";
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
import "./styles/detection.css";
import "./styles/context-snapshot.css";
import "./styles/transparency.css";
import "./styles/multi-ai.css";
import "./styles/export.css";
import "./styles/import.css";
import "./styles/session.css";
import "./styles/visibility.css";
import "./styles/quicktools.css";
import "./styles/accordion.css";
import "./styles/access-gate.css";
import "./styles/desktop-product.css";
import "./styles/frozen-reference.css";
import "./styles/restore-dialog.css";

/* RQ-003 FIX: Show restore choice dialog on startup if we have a saved session */
async function showRestoreDialog(): Promise<"restore" | "fresh"> {
  return new Promise((resolve) => {
    const dialog = document.createElement("div");
    dialog.className = "restore-choice-dialog";
    dialog.innerHTML = `
      <div class="restore-choice-card" role="dialog" aria-modal="true" aria-labelledby="restore-choice-title">
        <h2 id="restore-choice-title">Welcome back</h2>
        <p>We found your last session. What would you like to do?</p>
        <div class="restore-choice-buttons">
          <button class="restore-btn primary" data-choice="restore">
            Restore last work
          </button>
          <button class="restore-btn" data-choice="fresh">
            Start fresh
          </button>
        </div>
      </div>
    `;

    const restoreButton = dialog.querySelector<HTMLButtonElement>(".restore-btn.primary");
    const finish = (choice: "restore" | "fresh") => {
      window.removeEventListener("keydown", onKeyDown);
      dialog.remove();
      resolve(choice);
    };
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") finish("restore");
    };
    restoreButton?.addEventListener("click", () => finish("restore"));

    dialog.querySelector(".restore-btn:last-child")?.addEventListener("click", () => {
      finish("fresh");
    });

    document.body.appendChild(dialog);
    window.addEventListener("keydown", onKeyDown);
    restoreButton?.focus();
  });
}

function showStartFreshUndo(record: SessionRecord): void {
  const toast = document.createElement("div");
  toast.className = "undo-toast";
  toast.setAttribute("role", "status");
  const label = document.createElement("span");
  label.textContent = "Last work moved to Trash";
  const undo = document.createElement("button");
  undo.type = "button";
  undo.textContent = "Undo";
  const timerLabel = document.createElement("small");
  timerLabel.textContent = "10 seconds";
  toast.append(label, undo, timerLabel);
  document.body.appendChild(toast);

  const timer = window.setTimeout(() => toast.remove(), 10_000);
  undo.addEventListener("click", () => {
    window.clearTimeout(timer);
    useAccountStore.getState().restoreSessionFromTrash(record.id);
    useSessionStore.getState().loadSessionRecord(record);
    useSessionStore.getState().setCurrentScreen("translate");
    toast.remove();
    void saveNow();
  });
}

/* Restore persisted state before first paint so the user returns exactly
   where they were (no default-then-restored flicker), then mount and
   start the 500 ms debounced autosave. The load is wrapped so a failed/blocked
   IndexedDB (e.g. private browsing) never prevents the app from rendering
   — it just starts from defaults. IDB read is milliseconds; if this ever
   costs perceptible startup time, switch to render-then-hydrate with a
   hydrating flag (BUILD-LOG.md PARKED). */
async function bootstrap() {
  let startFreshRecord: SessionRecord | null = null;
  if (window.divergenceDesktop) document.documentElement.dataset.desktopApp = "true";
  try {
    await loadDurableWorkspace();
    const { hadSession } = await loadPersistedState();

    if (hadSession && sessionHasRecoverableWork(useSessionStore.getState())) {
      const choice = await showRestoreDialog();
      if (choice === "fresh") {
        const state = useSessionStore.getState();
        startFreshRecord = buildSessionRecord(state, {
          status: "active",
          recoveryReason: "start-fresh",
        });
        useAccountStore.getState().addSessionRecord(startFreshRecord);
        useAccountStore.getState().moveSessionToTrash(startFreshRecord.id);
        await saveNow({ snapshotActiveSession: false });
        useSessionStore.getState().resetSession();
        try {
          await saveNow({ snapshotActiveSession: false });
        } catch (error) {
          useAccountStore.getState().restoreSessionFromTrash(startFreshRecord.id);
          useSessionStore.getState().loadSessionRecord(startFreshRecord);
          startFreshRecord = null;
          throw error;
        }
      } else {
        await saveNow({ reason: "autosave" });
      }
    }
  } catch (error) {
    console.error("[persistence] restore failed; starting from defaults", error);
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <MarbleSlab />
      <CustomBackgroundController />
      <AppErrorBoundary resetKey="application">
        <AccountGate>
          <AppShell />
        </AccountGate>
      </AppErrorBoundary>
    </StrictMode>,
  );

  startAutosave();
  startDurableWorkspacePersistence();
  if (startFreshRecord) showStartFreshUndo(startFreshRecord);
}

void bootstrap();
