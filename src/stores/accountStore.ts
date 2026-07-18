import { create } from "zustand";
import type {
  AccountState,
  ArchivedPair,
  LearnedPreferences,
  PlanFlag,
  PromptTemplate,
  Rating,
  SavedPrompt,
  SessionRecord,
  StateCorrection,
  VisibilitySettings,
} from "./types";

/* Account store (CANON "STORES AND PERSISTENCE") — persists across browser
   closes. Holds everything that outlives a single session: archived Q/A
   pairs, feedback ratings, saved prompts, explicitly-saved variables,
   visibility settings, learned preferences, and the plan flag.

   Unlike the session store, this store is NEVER cleared by session close —
   only individual mutations remove individual items. Autosave (Step 1.8)
   persists ACCOUNT_PERSISTED_KEYS and rehydrates via hydrate(). */

/** The seven sidebar-visibility defaults, verbatim from CANON Feature 12:
    Recent Sessions ON, Context Snapshot ON, Recent Activity ON, Token
    Usage ON, Model Status ON, Quick Tools OFF, Active Session OFF. */
export const DEFAULT_VISIBILITY: VisibilitySettings = {
  recentSessions: true,
  contextSnapshot: true,
  recentActivity: true,
  tokenUsage: true,
  modelStatus: true,
  quickTools: false,
  activeSession: false,
};

/** Cap on stored corrections (Step 6.4) — bounded so a very long-lived
    account can't grow this unboundedly, same reasoning as telemetry's
    MAX_TELEMETRY_ENTRIES (Step 5.4). Generous relative to the 15-per-
    (dimension,value) threshold: comfortably covers all four dimensions
    crossing threshold on several different values each before anything
    is dropped (oldest first). */
export const MAX_STATE_CORRECTIONS = 1000;

/** Step 9.2 — a few built-in presets so Load Template is immediately usable
    before any user has saved one of their own (CANON names the feature but
    not what should ship in it). Fixed string ids, not generated, so they
    stay stable across reloads/hydration. `model: "auto"` on every one —
    never forcing a paid-tier model regardless of plan (ROUTING.md: free
    auto-routes Haiku/Sonnet only). */
export const DEFAULT_TEMPLATES: PromptTemplate[] = [
  {
    id: "template-quick-question",
    title: "Quick Question",
    model: "auto",
    directness: 3,
    techniques: ["auto-detect"],
  },
  {
    id: "template-deep-analysis",
    title: "Deep Analysis",
    model: "auto",
    directness: 2,
    techniques: ["chain-of-thought", "verify"],
    starterQuestion: "Walk me through your reasoning for...",
  },
  {
    id: "template-learning-mode",
    title: "Learning Mode",
    model: "auto",
    directness: 1,
    techniques: ["socratic", "examples"],
  },
];

/** Fresh default state (factory — see sessionStore for the why). */
export function createInitialAccountState(): AccountState {
  return {
    plan: "free", // CANON/ROUTING: default free so the gated path is exercised by default. NOT billing.
    archivedPairs: [],
    ratings: [],
    savedPrompts: [],
    variables: {},
    visibility: { ...DEFAULT_VISIBILITY },
    learnedPreferences: { routing: {}, technique: {} },
    stateCorrections: [], // Step 6.4
    sessions: [], // Step 9.1
    templates: DEFAULT_TEMPLATES.map((t) => ({ ...t, techniques: [...t.techniques] })), // Step 9.2 — fresh objects/arrays, no shared references
  };
}

/** Persisted data keys, for the autosave layer (Step 1.8). */
export const ACCOUNT_PERSISTED_KEYS: (keyof AccountState)[] = [
  "plan",
  "archivedPairs",
  "ratings",
  "savedPrompts",
  "variables",
  "visibility",
  "learnedPreferences",
  "stateCorrections",
  "sessions",
  "templates",
];

interface AccountActions {
  setPlan: (plan: PlanFlag) => void;
  archivePair: (pair: ArchivedPair) => void;
  addRating: (rating: Rating) => void;
  /** Step 8.1 — upsert: replaces the existing Rating for this messageId (a
      user re-rating or editing their comment), or appends if none exists yet.
      Written together with sessionStore.setMessageRating, never alone — see
      ConversationMessage.ratingStars/ratingComment in types.ts. */
  setRating: (rating: Rating) => void;
  addSavedPrompt: (prompt: SavedPrompt) => void;
  removeSavedPrompt: (id: string) => void;
  setVariable: (name: string, value: string) => void;
  removeVariable: (name: string) => void;
  /** Merge a partial visibility change (one or more of the seven checkboxes). */
  setVisibility: (patch: Partial<VisibilitySettings>) => void;
  setLearnedPreferences: (prefs: LearnedPreferences) => void;
  /** Record one state-pill correction (Step 6.4). Appends, capped at
      MAX_STATE_CORRECTIONS (oldest dropped first). */
  recordStateCorrection: (correction: StateCorrection) => void;
  /** Step 9.1 — files one duplicated or closed-and-archived session. Pure
      append; nothing here ever removes or mutates a past record. */
  addSessionRecord: (record: SessionRecord) => void;
  /** Step 9.2 — save the current settings (+ optional context/starter
      question) as a reusable template. */
  addTemplate: (template: PromptTemplate) => void;
  removeTemplate: (id: string) => void;
  /** Replace persisted fields wholesale — used by autosave rehydrate (Step 1.8). */
  hydrate: (state: Partial<AccountState>) => void;
}

export type AccountStore = AccountState & AccountActions;

export const useAccountStore = create<AccountStore>((set) => ({
  ...createInitialAccountState(),

  setPlan: (plan) => set({ plan }),
  archivePair: (pair) => set((s) => ({ archivedPairs: [...s.archivedPairs, pair] })),
  addRating: (rating) => set((s) => ({ ratings: [...s.ratings, rating] })),
  setRating: (rating) =>
    set((s) => {
      const idx = s.ratings.findIndex((r) => r.messageId === rating.messageId);
      if (idx === -1) return { ratings: [...s.ratings, rating] };
      const next = [...s.ratings];
      next[idx] = rating;
      return { ratings: next };
    }),
  addSavedPrompt: (prompt) => set((s) => ({ savedPrompts: [...s.savedPrompts, prompt] })),
  removeSavedPrompt: (id) =>
    set((s) => ({ savedPrompts: s.savedPrompts.filter((p) => p.id !== id) })),
  setVariable: (name, value) =>
    set((s) => ({ variables: { ...s.variables, [name]: value } })),
  removeVariable: (name) =>
    set((s) => {
      const { [name]: _removed, ...rest } = s.variables;
      return { variables: rest };
    }),
  setVisibility: (patch) => set((s) => ({ visibility: { ...s.visibility, ...patch } })),
  setLearnedPreferences: (learnedPreferences) => set({ learnedPreferences }),
  recordStateCorrection: (correction) =>
    set((s) => {
      const next = [...s.stateCorrections, correction];
      return {
        stateCorrections:
          next.length > MAX_STATE_CORRECTIONS
            ? next.slice(next.length - MAX_STATE_CORRECTIONS)
            : next,
      };
    }),
  addSessionRecord: (record) => set((s) => ({ sessions: [...s.sessions, record] })),
  addTemplate: (template) => set((s) => ({ templates: [...s.templates, template] })),
  removeTemplate: (id) =>
    set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),
  hydrate: (state) => set(state),
}));
