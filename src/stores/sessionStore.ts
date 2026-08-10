import { create } from "zustand";
import type {
  ContextItem,
  ConversationMessage,
  DirectnessLevel,
  MethodologyPhase,
  MethodologyType,
  ModelSelection,
  ScreenId,
  SessionRecord,
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
    variables: {}, // Step 7.4: session-local variables, default empty
    currentScreen: "translate", // Step 9.7: default to the main composer view
    methodology: "standard", // 3-State Methodology: default to standard
    methodologyPhase: "define", // Current phase when using 3-state
    lockedProblemStatement: "", // Locked problem statement to prevent drift
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
  "variables",
  "currentScreen",
  "methodology",
  "methodologyPhase",
  "lockedProblemStatement",
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
  /** Step 7.4 — create/update one session-local variable. Mirrors the
      account store's existing setVariable (Step 1.7) so "explicitly save
      to the account store" is a plain second call to that action, not a
      different shape. */
  setSessionVariable: (name: string, value: string) => void;
  removeSessionVariable: (name: string) => void;
  /** Step 8.1 — sets/updates the given message's denormalized rating fields
      (ratingStars always; ratingComment only if provided, so re-rating with
      just a star doesn't erase a previously-saved comment). A no-op if no
      message with that id exists (defensive — a stale id should never
      throw, same posture as every other store action taking an id). */
  setMessageRating: (messageId: string, stars: number, comment?: string) => void;
  /** Clear to defaults — CANON "cleared when a session closes". Its first
      real caller is Close Session (Step 9.1): a closed session is done, not
      just refreshed, so it resets model/directness/techniques too, unlike
      newSession() below. */
  resetSession: () => void;
  /** Step 9.1 — CANON Feature 11 "New Session (fresh conversation, keeps
      settings, clears history and context)". Deliberately narrower than
      resetSession(): model/directness/techniques are UNTOUCHED. "Context"
      is read as covering both session.context and session.variables (both
      are Feature 6 "Context Management" concepts); statePills and
      draftInput are cleared too since they belong to the conversation
      being cleared, not to "settings" — a documented reading, not stated
      verbatim in CANON (see BUILD-LOG DECISIONS). */
  newSession: () => void;
  /** Step 9.7 — navigate to a different screen (Home, Dashboard, Messages, etc). */
  setCurrentScreen: (screen: ScreenId) => void;
  /** Step 9.3 — CANON Feature 11's "Import ... previous conversation": loads a
      stored SessionRecord (accountStore.sessions, written by Step 9.1's
      Duplicate/Close Session) back into the live session. This is the action
      Step 9.1's own PARKED note predicted would be needed and deliberately
      did not build ("if resuming turns out to be needed, it's a new
      sessionStore action ... calling hydrate() with the record's fields").

      Sets exactly the six fields a SessionRecord carries. draftInput and
      statePills are CLEARED, not preserved: a record stores neither (an
      unsent draft and a per-turn pill reading both belong to the moment, not
      the archived session), so carrying the CURRENT session's values forward
      would leave the user's half-typed thought and stale pills sitting above
      a conversation they no longer belong to. currentScreen is deliberately
      untouched — navigation is orthogonal to which session is loaded. */
  loadSessionRecord: (record: SessionRecord) => void;
  /** Set which methodology to use (standard or 3-state). */
  setMethodology: (methodology: MethodologyType) => void;
  /** Set the current phase when using 3-state methodology. */
  setMethodologyPhase: (phase: MethodologyPhase) => void;
  /** Lock the problem statement to prevent drift during 3-state execution. */
  setLockedProblemStatement: (statement: string) => void;
  /** Replace persisted fields wholesale — used by autosave rehydrate (Step 1.8). */
  hydrate: (state: Partial<SessionState>) => void;
}

export type SessionStore = SessionState & SessionActions;

const VALID_SCREENS = new Set<ScreenId>([
  "translate", "home", "dashboard", "messages", "archive", "resources",
  "projects", "integrations", "tasks", "customize", "sessions", "templates",
  "saved-prompts", "settings", "trash",
]);

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
  setSessionVariable: (name, value) =>
    set((s) => ({ variables: { ...s.variables, [name]: value } })),
  removeSessionVariable: (name) =>
    set((s) => {
      const { [name]: _removed, ...rest } = s.variables;
      return { variables: rest };
    }),
  setMessageRating: (messageId, stars, comment) =>
    set((s) => ({
      conversation: s.conversation.map((m) =>
        m.id === messageId
          ? { ...m, ratingStars: stars, ...(comment !== undefined ? { ratingComment: comment } : {}) }
          : m,
      ),
    })),
  resetSession: () => set(createInitialSessionState()),
  newSession: () =>
    set({
      draftInput: "",
      conversation: [],
      context: [],
      variables: {},
      statePills: { emotion: null, rsd: null, interest: null, cognitive: null },
    }),
  setCurrentScreen: (currentScreen) => set({ currentScreen }),
  loadSessionRecord: (record) =>
    set({
      model: record.model,
      directness: record.directness,
      techniques: record.techniques,
      context: record.context,
      variables: record.variables,
      conversation: record.conversation,
      draftInput: "",
      statePills: { emotion: null, rsd: null, interest: null, cognitive: null },
    }),
  setMethodology: (methodology) => set({ methodology }),
  setMethodologyPhase: (methodologyPhase) => set({ methodologyPhase }),
  setLockedProblemStatement: (lockedProblemStatement) => set({ lockedProblemStatement }),
  hydrate: (state) => set((current) => ({
    ...state,
    ...(state.context !== undefined ? { context: Array.isArray(state.context) ? state.context : current.context } : {}),
    ...(state.conversation !== undefined ? { conversation: Array.isArray(state.conversation) ? state.conversation : current.conversation } : {}),
    ...(state.techniques !== undefined ? { techniques: Array.isArray(state.techniques) ? state.techniques : current.techniques } : {}),
    ...(state.currentScreen !== undefined
      ? { currentScreen: VALID_SCREENS.has(state.currentScreen) ? state.currentScreen : "translate" }
      : {}),
  })),
}));
