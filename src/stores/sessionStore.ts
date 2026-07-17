import { create } from "zustand";
import type {
  ContextItem,
  ConversationMessage,
  DirectnessLevel,
  ModelSelection,
  SessionState,
  StatePills,
  TechniqueId,
} from "./types";

/* Session store (CANON "STORES AND PERSISTENCE") — cleared when a session
   closes. Holds the live working state of one conversation: model,
   directness, technique(s), loaded context, conversation history, and the
   current state pills. Autosave (Step 1.8) persists and rehydrates the
   SessionState fields via SESSION_PERSISTED_KEYS + hydrate(). */

/** Fresh default state. A factory (not a shared const) so every store
    init and every resetSession() gets its own arrays/objects — no shared
    references leaking between sessions. Every array literal below (including
    `techniques`) is created fresh in this call, never a module-level const,
    for the same reason. */
export function createInitialSessionState(): SessionState {
  return {
    draftInput: "", // Step 5.0: the composer's not-yet-submitted text
    model: "auto", // CANON: free tier auto-routes; "auto" exercises the router by default
    directness: 2, // CANON Feature 3: Level 2 balanced is the default
    techniques: ["auto-detect"], // CANON Feature 4: Auto-detect is the default mode (Step 4.5)
    context: [],
    conversation: [],
    statePills: { emotion: null, rsd: null, interest: null, cognitive: null },
  };
}

/** The persisted data keys, for the autosave layer (Step 1.8) to read and
    rehydrate without hardcoding field names or touching the actions. */
export const SESSION_PERSISTED_KEYS: (keyof SessionState)[] = [
  "draftInput",
  "model",
  "directness",
  "techniques",
  "context",
  "conversation",
  "statePills",
];

interface SessionActions {
  setDraftInput: (draftInput: string) => void;
  setModel: (model: ModelSelection) => void;
  setDirectness: (directness: DirectnessLevel) => void;
  /** Replaces the whole selection (Step 4.5): ["auto-detect"] for auto mode,
      or the user's exact manual stack (validated by the caller — see
      services/techniques/manualSelection.ts). */
  setTechniques: (techniques: TechniqueId[]) => void;
  addContextItem: (item: ContextItem) => void;
  removeContextItem: (id: string) => void;
  addMessage: (message: ConversationMessage) => void;
  setStatePills: (statePills: StatePills) => void;
  /** Clear to defaults — CANON "cleared when a session closes". */
  resetSession: () => void;
  /** Replace persisted fields wholesale — used by autosave rehydrate (Step 1.8). */
  hydrate: (state: Partial<SessionState>) => void;
}

export type SessionStore = SessionState & SessionActions;

export const useSessionStore = create<SessionStore>((set) => ({
  ...createInitialSessionState(),

  setDraftInput: (draftInput) => set({ draftInput }),
  setModel: (model) => set({ model }),
  setDirectness: (directness) => set({ directness }),
  setTechniques: (techniques) => set({ techniques }),
  addContextItem: (item) => set((s) => ({ context: [...s.context, item] })),
  removeContextItem: (id) =>
    set((s) => ({ context: s.context.filter((c) => c.id !== id) })),
  addMessage: (message) => set((s) => ({ conversation: [...s.conversation, message] })),
  setStatePills: (statePills) => set({ statePills }),
  resetSession: () => set(createInitialSessionState()),
  hydrate: (state) => set(state),
}));
