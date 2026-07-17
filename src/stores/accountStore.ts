import { create } from "zustand";
import type {
  AccountState,
  ArchivedPair,
  LearnedPreferences,
  PlanFlag,
  Rating,
  SavedPrompt,
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
];

interface AccountActions {
  setPlan: (plan: PlanFlag) => void;
  archivePair: (pair: ArchivedPair) => void;
  addRating: (rating: Rating) => void;
  addSavedPrompt: (prompt: SavedPrompt) => void;
  removeSavedPrompt: (id: string) => void;
  setVariable: (name: string, value: string) => void;
  removeVariable: (name: string) => void;
  /** Merge a partial visibility change (one or more of the seven checkboxes). */
  setVisibility: (patch: Partial<VisibilitySettings>) => void;
  setLearnedPreferences: (prefs: LearnedPreferences) => void;
  /** Replace persisted fields wholesale — used by autosave rehydrate (Step 1.8). */
  hydrate: (state: Partial<AccountState>) => void;
}

export type AccountStore = AccountState & AccountActions;

export const useAccountStore = create<AccountStore>((set) => ({
  ...createInitialAccountState(),

  setPlan: (plan) => set({ plan }),
  archivePair: (pair) => set((s) => ({ archivedPairs: [...s.archivedPairs, pair] })),
  addRating: (rating) => set((s) => ({ ratings: [...s.ratings, rating] })),
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
  hydrate: (state) => set(state),
}));
