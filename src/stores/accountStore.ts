import { create } from "zustand";
import type {
  AccountState,
  ArchivedPair,
  LayoutId,
  LearnedPreferences,
  LearningAuditEntry,
  MethodologyEntry,
  PlanFlag,
  PromptTemplate,
  Rating,
  SavedPrompt,
  SessionRecord,
  StateCorrection,
  ThemePreference,
  VisibilitySettings,
} from "./types";

/* Account store (CANON "STORES AND PERSISTENCE") — persists across browser
   closes. Holds everything that outlives a single session: archived Q/A
   pairs, feedback ratings, saved prompts, explicitly-saved variables,
   visibility settings, learned preferences, and the plan flag.

   Unlike the session store, this store is NEVER cleared by session close —
   only individual mutations remove individual items. Autosave (Step 1.8)
   persists ACCOUNT_PERSISTED_KEYS and rehydrates via hydrate(). */

/** The seven sidebar-visibility defaults. Quick Tools REVISED, operator-
    directed override, this session: CANON's own rule #1 ("Visual truth is
    the V3 screenshot... if a file disagrees with the image, the image
    wins") already outranked CANON rule #9's "Quick Tools defaults to
    hidden (OFF)" — Divergence_AI_App_Screenshot_V3.png clearly shows the
    six-tile grid always visible above the accordion stack, not hidden. The
    operator's direct instruction ("stays up always") settles the
    contradiction explicitly rather than leaving it silently resolved one
    way. Still user-togglable via the Settings gear (Feature 12's 7
    checkboxes, unchanged) — only the DEFAULT changed. See BUILD-LOG.md
    DECISIONS and CANON.md (rule #9, Feature 12, LAYOUT all updated). */
export const DEFAULT_VISIBILITY: VisibilitySettings = {
  recentSessions: true,
  contextSnapshot: true,
  recentActivity: true,
  tokenUsage: true,
  modelStatus: true,
  quickTools: true,
  activeSession: false,
};

/** Cap on stored corrections (Step 6.4) — bounded so a very long-lived
    account can't grow this unboundedly, same reasoning as telemetry's
    MAX_TELEMETRY_ENTRIES (Step 5.4). Generous relative to the 15-per-
    (dimension,value) threshold: comfortably covers all four dimensions
    crossing threshold on several different values each before anything
    is dropped (oldest first). */
export const MAX_STATE_CORRECTIONS = 1000;

/** Cap on stored learning-loop audit entries (Step 10.2) — bounded so a
    very long-lived account can't grow this unboundedly, same reasoning as
    MAX_STATE_CORRECTIONS/telemetry's MAX_TELEMETRY_ENTRIES. */
export const MAX_LEARNING_AUDIT_ENTRIES = 500;

/** Cap on stored methodology entries — bounded to prevent unbounded growth. */
export const MAX_METHODOLOGY_ENTRIES = 200;

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
    theme: "dark", // CANON Feature 12 — default unchanged from every prior session's only theme
    layout: "original", // CLAUDE.md "Design layouts" — default unchanged from every prior session's only layout
    learnedPreferences: { routing: {}, technique: {} },
    stateCorrections: [], // Step 6.4
    sessions: [], // Step 9.1
    trashed: [], // Deleted sessions (can be restored or permanently deleted)
    templates: DEFAULT_TEMPLATES.map((t) => ({ ...t, techniques: [...t.techniques] })), // Step 9.2 — fresh objects/arrays, no shared references
    learningAuditLog: [], // Step 10.2
    methodologyLog: [], // 3-State Methodology tracking
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
  "theme",
  "layout",
  "learnedPreferences",
  "stateCorrections",
  "sessions",
  "trashed",
  "templates",
  "learningAuditLog",
  "methodologyLog",
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
  /** Toggle a saved prompt's starred/favorite status. */
  toggleSavedPromptStar: (id: string) => void;
  setVariable: (name: string, value: string) => void;
  removeVariable: (name: string) => void;
  /** Merge a partial visibility change (one or more of the seven checkboxes). */
  setVisibility: (patch: Partial<VisibilitySettings>) => void;
  /** CANON Feature 12's theme toggle — the user's raw preference, not the
      resolved light/dark value ("auto" is resolved at render time, see
      useThemeEffect.ts, not here). */
  setTheme: (theme: ThemePreference) => void;
  /** CLAUDE.md "Design layouts" — which complete visual re-skin is active.
      Orthogonal to theme; every layout works in both light and dark. */
  setLayout: (layout: LayoutId) => void;
  setLearnedPreferences: (prefs: LearnedPreferences) => void;
  /** Step 10.2 — atomic write for the learning-loop applier
      (services/learningLoop/applier.ts): sets the updated
      LearnedPreferences AND appends the batch's audit entries together, so
      learnedPreferences and learningAuditLog can never observe one updated
      without the other (same "written together, never one without the
      other" reasoning as Step 8.1's rating pair). Bounded, oldest dropped
      first, same as recordStateCorrection. Takes the already-computed
      result of applyRefinements() — the store stays dumb/pure-data, same
      convention as every other store action (no store ever imports from
      services/). */
  applyLearningRefinements: (
    updated: LearnedPreferences,
    newAuditEntries: LearningAuditEntry[],
  ) => void;
  /** Record one state-pill correction (Step 6.4). Appends, capped at
      MAX_STATE_CORRECTIONS (oldest dropped first). */
  recordStateCorrection: (correction: StateCorrection) => void;
  /** Step 9.1 — files one duplicated or closed-and-archived session. Pure
      append; nothing here ever removes or mutates a past record. */
  addSessionRecord: (record: SessionRecord) => void;
  /** Move a session from active history to trash (soft delete). */
  moveSessionToTrash: (id: string) => void;
  /** Permanently delete a session from trash. */
  deleteSessionFromTrash: (id: string) => void;
  /** Restore a trashed session back to active history. */
  restoreSessionFromTrash: (id: string) => void;
  /** Step 9.2 — save the current settings (+ optional context/starter
      question) as a reusable template. */
  addTemplate: (template: PromptTemplate) => void;
  removeTemplate: (id: string) => void;
  /** Update an existing template's properties. */
  updateTemplate: (id: string, updates: Partial<PromptTemplate>) => void;
  /** Update a session's tag (rename it). */
  updateSessionTag: (id: string, newTag: string) => void;
  /** Toggle a session's starred/favorite status. */
  toggleSessionStar: (id: string) => void;
  /** Toggle a template's starred/favorite status. */
  toggleTemplateStar: (id: string) => void;
  /** Duplicate a session (copy all data and create a new session). */
  duplicateSession: (id: string) => void;
  /** Record methodology usage and audit results from a session. */
  recordMethodology: (entry: MethodologyEntry) => void;
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
  toggleSavedPromptStar: (id) =>
    set((s) => ({
      savedPrompts: s.savedPrompts.map((prompt) =>
        prompt.id === id ? { ...prompt, starred: !prompt.starred } : prompt,
      ),
    })),
  setVariable: (name, value) =>
    set((s) => ({ variables: { ...s.variables, [name]: value } })),
  removeVariable: (name) =>
    set((s) => {
      const { [name]: _removed, ...rest } = s.variables;
      return { variables: rest };
    }),
  setVisibility: (patch) => set((s) => ({ visibility: { ...s.visibility, ...patch } })),
  setTheme: (theme) => set({ theme }),
  setLayout: (layout) => set({ layout }),
  setLearnedPreferences: (learnedPreferences) => set({ learnedPreferences }),
  applyLearningRefinements: (updated, newAuditEntries) =>
    set((s) => {
      const nextLog = [...s.learningAuditLog, ...newAuditEntries];
      return {
        learnedPreferences: updated,
        learningAuditLog:
          nextLog.length > MAX_LEARNING_AUDIT_ENTRIES
            ? nextLog.slice(nextLog.length - MAX_LEARNING_AUDIT_ENTRIES)
            : nextLog,
      };
    }),
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
  moveSessionToTrash: (id) =>
    set((s) => ({
      sessions: s.sessions.filter((rec) => rec.id !== id),
      trashed: [...s.trashed, ...s.sessions.filter((rec) => rec.id === id)],
    })),
  deleteSessionFromTrash: (id) =>
    set((s) => ({ trashed: s.trashed.filter((rec) => rec.id !== id) })),
  restoreSessionFromTrash: (id) =>
    set((s) => ({
      trashed: s.trashed.filter((rec) => rec.id !== id),
      sessions: [...s.sessions, ...s.trashed.filter((rec) => rec.id === id)],
    })),
  addTemplate: (template) => set((s) => ({ templates: [...s.templates, template] })),
  removeTemplate: (id) =>
    set((s) => ({ templates: s.templates.filter((t) => t.id !== id) })),
  updateTemplate: (id, updates) =>
    set((s) => ({
      templates: s.templates.map((t) => (t.id === id ? { ...t, ...updates } : t)),
    })),
  updateSessionTag: (id, newTag) =>
    set((s) => ({
      sessions: s.sessions.map((rec) => (rec.id === id ? { ...rec, tag: newTag } : rec)),
      trashed: s.trashed.map((rec) => (rec.id === id ? { ...rec, tag: newTag } : rec)),
    })),
  toggleSessionStar: (id) =>
    set((s) => ({
      sessions: s.sessions.map((rec) =>
        rec.id === id ? { ...rec, starred: !rec.starred } : rec,
      ),
      trashed: s.trashed.map((rec) =>
        rec.id === id ? { ...rec, starred: !rec.starred } : rec,
      ),
    })),
  toggleTemplateStar: (id) =>
    set((s) => ({
      templates: s.templates.map((tmpl) =>
        tmpl.id === id ? { ...tmpl, starred: !tmpl.starred } : tmpl,
      ),
    })),
  duplicateSession: (id) =>
    set((s) => {
      const original = s.sessions.find((rec) => rec.id === id);
      if (!original) return {};
      const duplicate: SessionRecord = {
        ...original,
        id: `session-${Date.now()}`,
        createdAt: Date.now(),
        archived: false,
        closedAt: undefined,
        tag: `Copy of ${original.tag || `Session ${original.id.slice(0, 6)}`}`,
        conversation: original.conversation.map((msg) => ({ ...msg })),
        context: original.context.map((ctx) => ({ ...ctx })),
        variables: { ...original.variables },
      };
      return { sessions: [...s.sessions, duplicate] };
    }),
  recordMethodology: (entry) =>
    set((s) => {
      const next = [...s.methodologyLog, entry];
      return {
        methodologyLog:
          next.length > MAX_METHODOLOGY_ENTRIES
            ? next.slice(next.length - MAX_METHODOLOGY_ENTRIES)
            : next,
      };
    }),
  hydrate: (state) => set(state),
}));
