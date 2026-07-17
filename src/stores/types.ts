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
   analysis and rule refinement engines are Steps 10.1/10.2, and
   correction learning is Step 6.4. Shape kept open (Record) until then. */
export interface LearnedPreferences {
  routing: Record<string, unknown>;
  technique: Record<string, unknown>;
}

/* ── The two store state shapes (top-level: authoritative at Step 1.7) ── */

/** Session store — cleared when a session closes (CANON). */
export interface SessionState {
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
}
