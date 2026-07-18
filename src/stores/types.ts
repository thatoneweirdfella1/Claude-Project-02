/* types.ts — the typed schemas for both stores (CANON "STORES AND
   PERSISTENCE"). Step 1.7 owns the TOP-LEVEL shape of each store
   authoritatively. Several nested domain types are minimal and
   provisional: a later step owns their full detail, named inline and in
   STORE-CONTRACT.md. They are structured so those steps can EXTEND them
   (add fields) without breaking the store contract. All types are
   plain, JSON-serializable data (no functions, Maps, or Sets) so the
   whole store state serializes straight into IndexedDB at Step 1.8. */

/* ── Small fixed enums (settled by CANON/ROUTING, won't change) ───────── */

/** The three model ids, fixed by CANON "LOCKED DECISIONS" and ROUTING.md.
    Full model registry (labels, tiers, capabilities) is Step 1.10. */
export type ModelId = "claude-haiku-4-5" | "claude-sonnet-5" | "claude-opus-4-8";

/** What the user picks in the Model dropdown. "auto" hands the choice to
    the routing engine (ROUTING.md); a ModelId is a manual override. */
export type ModelSelection = ModelId | "auto";

/** Directness levels (CANON Feature 3): 1 supportive, 2 balanced, 3 blunt. */
export type DirectnessLevel = 1 | 2 | 3;

/** Technique ids (CANON Feature 4). The authoritative registry — labels,
    conflicts, dependencies, scoring — is Step 4.1; this union mirrors
    CANON's named list so the session store can hold a selection now. */
export type TechniqueId =
  | "socratic"
  | "quote-first"
  | "chain-of-thought"
  | "role-prime"
  | "verify"
  | "examples"
  | "simplify"
  | "detailed"
  | "step-by-step"
  | "comparative"
  | "metaphor"
  | "auto-detect";

/** Free/paid flag. NOT billing — there is no payment or account system
    (ROUTING.md is explicit). It gates Opus + extended thinking in
    routing.js. Lives in the account store, defaults "free". */
export type PlanFlag = "free" | "paid";

/* ── Session-store domain types ───────────────────────────────────────── */

/* State pills (CANON Feature 5). Provisional — detection architecture and
   the authoritative pill model are Steps 6.1–6.3. Values mirror CANON's
   named dimensions; null means "not yet detected this session". */
export type EmotionState = "overwhelmed" | "frustrated" | "calm" | "excited" | "anxious";
export type RsdLevel = "low" | "medium" | "high";
export type InterestLevel = "low" | "medium" | "high";
export type CognitiveMode = "analytical" | "creative" | "processing" | "racing" | "stuck";

export interface StatePills {
  emotion: EmotionState | null;
  rsd: RsdLevel | null;
  interest: InterestLevel | null;
  cognitive: CognitiveMode | null;
}

/* Conversation history. Provisional — the rich message shape (confidence,
   routing decision, applied techniques, transparency data, rating) is
   attached by Steps 5.x/8.x. Kept minimal and open here. */
export type MessageRole = "user" | "assistant";

export interface ConversationMessage {
  id: string;
  role: MessageRole;
  content: string;
  timestamp: number;
  /* Assistant-only fields (Step 5.1 — STORE-CONTRACT.md named this step as
     the owner of this type's full detail). Persisted (not just live-session
     state) so the confidence line and router honesty note still show under a
     historical answer after a reload, matching the screenshot's always-shown
     confidence line. Rating's SAVE/learning behavior is Step 8.1's job; the
     field isn't added here — see BUILD-LOG PARKED. */
  /** Translation confidence 0-100 behind this answer — the "N% confident
      this is what you meant" line. */
  confidence?: number;
  /** True when routing.js downgraded a Deep-tier route to Sonnet on the free
      plan (ROUTING.md's honesty guarantee: never silently). */
  downgraded?: boolean;
  /** routing.js's own notes (escalation, downgrade, override, health floor),
      shown verbatim alongside the confidence line, quiet monochrome. */
  notes?: string[];
  /** Step 8.1 ADD — CANON Feature 7: the 5-star rating + optional "What
      could be better?" comment for THIS answer. Denormalized here (mirroring
      confidence/downgraded/notes above) so the UI can render "you already
      rated this N stars" straight from the message being displayed, with no
      cross-store lookup; the durable, learning-loop-consumable record is
      accountStore.ratings (a Rating per messageId, upserted — see
      accountStore.setRating). Both are written together, never one without
      the other. */
  ratingStars?: number;
  ratingComment?: string;
  /** Step 8.5 ADD — CANON Feature 10: Download and Export needs "transparency"
      and "state pills" as exportable per-message content, but neither is
      stored on the message itself anywhere before this. `telemetryId`
      references the TelemetryEntry (services/telemetry/log.ts) this answer's
      pipeline run recorded — set once, at the same moment confidence/
      downgraded/notes are, in CenterColumn.handleDone. It is only a lookup
      key, not a copy: telemetry's own log is in-memory-only and bounded
      (MAX_TELEMETRY_ENTRIES), so an old enough message's transparency data
      may no longer be resolvable — the export modal disables that checkbox
      when the lookup misses, same "don't fabricate what isn't there" posture
      as everything else in this build. `statePills` is a snapshot of
      session.statePills at the moment this answer finished — best-effort,
      since state detection runs in parallel and may not have resolved THIS
      turn's own reading by the time the answer completes (same known
      tension Step 6.5's DECISIONS already logged for deriveStateFeeds). */
  telemetryId?: string;
  statePills?: StatePills;
}

/* Loaded context. Provisional — upload limits, OCR, URL fetch, and
   variable resolution are Steps 7.1–7.5. Minimal descriptor here. */
export type ContextItemKind = "file" | "text" | "url" | "variable";

export interface ContextItem {
  id: string;
  kind: ContextItemKind;
  label: string;
  content: string;
  bytes: number;
}

/* ── Account-store domain types ───────────────────────────────────────── */

/* Archived question/answer pair. Provisional — archive/session lifecycle
   is Steps 9.1–9.2; minimal here. */
export interface ArchivedPair {
  id: string;
  question: string;
  answer: string;
  timestamp: number;
}

/* Feedback rating (CANON Feature 7). Full rating UI + learning loop is
   Steps 8.1/7.2/10.x; the stored shape is settled here. */
export interface Rating {
  messageId: string;
  stars: number; // 1–5
  comment?: string;
  timestamp: number;
}

/* Saved prompt (CANON Feature 11). */
export interface SavedPrompt {
  id: string;
  title: string;
  text: string;
}

/* Explicitly-saved variables ($name -> value), CANON Feature 6/11.
   Record, not Map, so it serializes straight to IndexedDB. */
export type SavedVariables = Record<string, string>;

/* Visibility settings (CANON Feature 12) — the seven sidebar checkboxes.
   Fully specified by CANON now, including exact defaults below. */
export interface VisibilitySettings {
  recentSessions: boolean;
  contextSnapshot: boolean;
  recentActivity: boolean;
  tokenUsage: boolean;
  modelStatus: boolean;
  quickTools: boolean;
  activeSession: boolean;
}

/* Learned routing and technique preferences. Provisional — the pattern
   analysis and rule refinement engines are Steps 10.1/10.2. Shape kept
   open (Record) until then. (State-DETECTION correction learning is a
   separate concept — see StateCorrection/AccountState.stateCorrections,
   Step 6.4 — not stored here: this Record pair is specifically the
   ratings-driven routing/technique rule refinement PIPELINE.md's LEARNING
   LOOP describes, e.g. "low ratings + 'too verbose' reduce Detailed".) */
export interface LearnedPreferences {
  routing: Record<string, unknown>;
  technique: Record<string, unknown>;
}

/* One state-pill correction (CANON Feature 5 / PIPELINE.md STATE DETECTION,
   Step 6.4 — "Correction learning"). Recorded every time a user picks a
   different value than what was detected for a dimension; the threshold
   logic (services/detection/correctionLearning.ts) counts these per
   (dimension, correctedValue) pair to decide when detection should adapt
   for this user (15+, per CANON/PIPELINE.md). `dimension` mirrors
   components/detection's PillDimension union but is declared independently
   here — the store layer must not import from components/. */
export interface StateCorrection {
  dimension: "emotion" | "rsd" | "interest" | "cognitive";
  /** The value that was actually detected before the user corrected it. */
  from: string;
  /** The value the user picked instead. */
  to: string;
  timestamp: number;
}

/* ── The two store state shapes (top-level: authoritative at Step 1.7) ── */

/** Session store — cleared when a session closes (CANON). */
export interface SessionState {
  /** The composer's in-progress, not-yet-submitted text (Step 5.0). Lives here
      (not local component state) so autosave (Step 1.8) covers it — CANON's
      persistence rule that a crash mid-thought must not cost the user the
      thought. Cleared to "" only on TRANSLATE & ASK submit or session close. */
  draftInput: string;
  model: ModelSelection;
  directness: DirectnessLevel;
  /** Widened from a single TechniqueId to an array at Step 4.5: CANON Feature 4
      allows manually stacking up to MAX_TECHNIQUE_STACK techniques (not just
      one), which a singular field can't represent. `["auto-detect"]` means
      auto mode (hand off to the Step 4.2 scorer); any other array is the
      user's exact manual selection. See STORE-CONTRACT.md. */
  techniques: TechniqueId[];
  context: ContextItem[];
  conversation: ConversationMessage[];
  statePills: StatePills;
  /** Step 7.4 ADD — CANON Feature 6 "create variables ($name)": named values
      the user creates for prompt substitution. Session store by DEFAULT
      (this field); explicitly savable to the account store's own,
      already-existing `variables` field (Step 1.7) for persistence across
      sessions — same `SavedVariables` shape (Record<string,string>, keys are
      the bare name without the "$"), reused rather than redeclared. */
  variables: SavedVariables;
}

/** Account store — persists across browser closes (CANON). */
export interface AccountState {
  plan: PlanFlag;
  archivedPairs: ArchivedPair[];
  ratings: Rating[];
  savedPrompts: SavedPrompt[];
  variables: SavedVariables;
  visibility: VisibilitySettings;
  learnedPreferences: LearnedPreferences;
  /** Step 6.4 ADD: every state-pill correction the user has made, across all
      sessions (this store persists across browser closes — corrections must
      accumulate over time for the 15+ threshold to ever be reachable).
      Bounded (see accountStore.ts) so a very long-lived account can't grow
      this unboundedly. */
  stateCorrections: StateCorrection[];
}
