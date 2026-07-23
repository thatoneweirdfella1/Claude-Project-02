# DIVERGENCE.AI — STORE CONTRACT

**Written at Step 1.7. Names every field the app persists, which of the two stores owns it, and
which later step owns its full detail. Source of truth for state shape: CANON.md "STORES AND
PERSISTENCE". Where this file and CANON.md disagree, CANON.md wins.**

Two Zustand stores, both plain JSON-serializable state so autosave (Step 1.8) can write them
straight to IndexedDB. Implementations: `src/stores/sessionStore.ts`, `src/stores/accountStore.ts`.
Types: `src/stores/types.ts`.

---

## THE RULE THAT SEPARATES THE TWO STORES

- **Session store** is **cleared when a session closes** (`resetSession()` → fresh defaults).
- **Account store** **persists across browser closes** and is **never** wiped by session close;
  only individual mutations remove individual items.

A field is in the session store if losing it on session-close is correct, and in the account store
if it must survive session-close and browser-close. If a future step is unsure where a new field
goes, that is the test.

---

## SESSION STORE (`useSessionStore`)

Cleared on session close. Default produced by `createInitialSessionState()`.

| Field | Type | Default | Owning step for full detail |
|---|---|---|---|
| `draftInput` | `string` | `""` | Input composer: **Step 5.0**. The not-yet-submitted textarea content; autosaved so a crash mid-thought doesn't cost the user the thought (CANON persistence rule). |
| `model` | `ModelSelection` = `ModelId \| "auto"` | `"auto"` | Model registry: **Step 1.10**. Ids fixed by CANON/ROUTING. |
| `directness` | `DirectnessLevel` = `1 \| 2 \| 3` | `2` | Directness control: **Step 4.4**. Default L2 per CANON Feature 3. |
| `techniques` | `TechniqueId[]` (widened from a single `TechniqueId` at **Step 4.5** — see note below) | `["auto-detect"]` | Technique registry: **Step 4.1**; manual multi-select: **Step 4.5**. |
| `context` | `ContextItem[]` | `[]` | Context management: **Steps 7.1–7.5**. Shape provisional. |
| `conversation` | `ConversationMessage[]` — Step 5.1 added optional `confidence`/`downgraded`/`notes` (assistant-only); Step 8.1 added optional `ratingStars`/`ratingComment` (assistant-only); Step 8.5 added optional `telemetryId`/`statePills` (assistant-only) | `[]` | Streaming/pipeline: **Steps 5.1–5.2**; feedback rating: **Step 8.1** — denormalized copy of the message's rating for display, written together with the durable `accountStore.ratings` entry, never alone; download/export: **Step 8.5** — `telemetryId` is a lookup key into `services/telemetry`'s log (not a copy — the log is in-memory/bounded, so an old message's lookup can miss), `statePills` is a best-effort snapshot of `session.statePills` taken when the answer finished. |
| `statePills` | `StatePills` (emotion/rsd/interest/cognitive, each nullable) | all `null` | State detection: **Steps 6.1–6.3**. Values mirror CANON Feature 5. |
| `variables` | `SavedVariables` = `Record<string,string>` (same type as the account store's own `variables` field) | `{}` | Variables: **Step 7.4**. CANON Feature 6 "create variables ($name)" — session store by DEFAULT; explicitly savable to the account store's pre-existing `variables` field (Step 1.7) via a second `accountStore.setVariable` call, not a different save path. |

Actions: `setDraftInput`, `setModel`, `setDirectness`, `setTechniques`, `addContextItem`,
`removeContextItem`, `addMessage`, `setStatePills`, `setSessionVariable`, `removeSessionVariable`,
`setMessageRating`, `resetSession`, `newSession`, `setCurrentScreen`, `loadSessionRecord`,
`hydrate`.

**`loadSessionRecord` (Step 9.3):** loads a stored `SessionRecord` (`accountStore.sessions`) back
into the live session — CANON Feature 11's "Import ... previous conversation". Sets exactly the six
fields a record carries (`model`/`directness`/`techniques`/`context`/`variables`/`conversation`),
**clears** `draftInput` and `statePills` (a record stores neither, so keeping the current session's
values would strand an unsent draft and stale pills above a conversation they don't belong to), and
leaves `currentScreen` **untouched** (navigation is orthogonal to which session is loaded). This is
the action Step 9.1's PARKED note predicted would eventually be needed; Recent Sessions (Step 9.5)
and the Archive screen can call it to make a row clickable.

**`resetSession` vs `newSession` (Step 9.1):** `resetSession()` (Step 1.7, unused until now) resets
EVERY field to `createInitialSessionState()`, including `model`/`directness`/`techniques` — Close
Session's job, a harder stop. `newSession()` (Step 9.1) is narrower: CANON Feature 11's "New Session
(fresh conversation, keeps settings, clears history and context)" — `model`/`directness`/`techniques`
untouched; `conversation`/`context`/`variables`/`statePills`/`draftInput` cleared. "Context" is read
as covering both `context` and `variables` (both Feature 6 concepts); `statePills`/`draftInput`
cleared as belonging to the conversation being cleared, not to "settings" — documented reading, not
verbatim CANON text.

**`techniques` field-type change (Step 4.5):** Step 1.7 originally typed this field as a single
`TechniqueId` (`"socratic"` default). Step 4.5's own spec explicitly requires manual selection to
support stacking up to `MAX_TECHNIQUE_STACK` (4) techniques at once ("a conflicting pair cannot both
be selected", "enforces the 4-technique stack limit" on manual choice) — a singular field cannot
represent that, so it was widened to `TechniqueId[]`. `["auto-detect"]` (a single-element array
holding the meta id) represents auto mode; any other array is the user's exact manual stack. This
field was unconsumed by any other code at the time of the change (verified by a repo-wide search),
so the rename carried no other blast radius. Persistence is unaffected — the autosave seam
(`SESSION_PERSISTED_KEYS`) is generic over field names, per Step 1.8's design.

Persisted keys for autosave: `SESSION_PERSISTED_KEYS`.

---

## ACCOUNT STORE (`useAccountStore`)

Persists across browser closes. Default produced by `createInitialAccountState()`.

| Field | Type | Default | Owning step for full detail |
|---|---|---|---|
| `plan` | `PlanFlag` = `"free" \| "paid"` | `"free"` | Routing gate: routing.js (wired in a later Phase-3 step). See note below. |
| `archivedPairs` | `ArchivedPair[]` | `[]` | Session lifecycle/archive: **Steps 9.1–9.2**. Shape provisional — Step 9.1 confirmed this per-pair shape doesn't fit Feature 11's session-granularity needs; left unused, see `sessions` below. |
| `sessions` | `SessionRecord[]` (`id`, `createdAt`, `closedAt?`, `archived`, `tag?`, `model`, `directness`, `techniques`, `context`, `variables`, `conversation`) | `[]` | Session lifecycle: **Step 9.1**. Duplicate Session appends one with `archived: false`; Close Session's "save and archive"/"archive tagged" append one with `archived: true` (+`tag` when given); "discard" appends nothing. Feeds Recent Sessions (Step 9.5) and the Archive screen (Step 9.7), both filtering this same list by `archived`. |
| `ratings` | `Rating[]` | `[]` | Feedback + learning loop: **Steps 8.1 / 7.2 / 10.x**. Stored shape settled; Step 8.1 wires the real save path via `setRating` (upsert by `messageId`), leaving `addRating` (Step 1.7, pure-append) unused/untouched. |
| `savedPrompts` | `SavedPrompt[]` | `[]` | Saved prompts: **Step 9.2**. |
| `variables` | `SavedVariables` = `Record<string,string>` | `{}` | Variables: **Step 7.4**. |
| `visibility` | `VisibilitySettings` (7 booleans) | `DEFAULT_VISIBILITY` | Visibility toggle: **Step 9.4**. Defaults fully specified by CANON Feature 12. |
| `learnedPreferences` | `LearnedPreferences` (`routing: Record<string,unknown>` + `technique: Record<string, TechniquePreference>`) | `{ routing:{}, technique:{} }` | Pattern analysis / rule refinement: **Steps 10.1–10.2**. `technique` shape settled at Step 10.2 (`TechniquePreference` = `weight`/`lastAdjustedAt`/`totalAdjustments`); `routing` stays an open `Record<string, unknown>` — the analyzer never emits a routing-targeted proposal, nothing to shape yet. |
| `stateCorrections` | `StateCorrection[]` (`dimension`, `from`, `to`, `timestamp`) | `[]` | State-detection correction learning: **Step 6.4**. See note below — deliberately NOT `learnedPreferences`. |
| `learningAuditLog` | `LearningAuditEntry[]` (`id`, `timestamp`, `proposalType`, `target`, `adjustment`, `previousWeight`, `newWeight`, `confidence`, `reasoning`, `affectedRunCount`) | `[]` | Rule refinement audit trail: **Step 10.2**. PIPELINE.md LEARNING LOOP: "An applier writes accepted refinements to the account store with an audit log." Bounded at `MAX_LEARNING_AUDIT_ENTRIES` (500, oldest dropped first). |

Actions: `setPlan`, `archivePair`, `addRating`, `setRating`, `addSavedPrompt`, `removeSavedPrompt`,
`setVariable`, `removeVariable`, `setVisibility`, `setLearnedPreferences`,
`recordStateCorrection`, `addSessionRecord`, `hydrate`.

**`applyLearningRefinements` (Step 10.2):** a second, more specific write path alongside the
pre-existing `setLearnedPreferences` (wholesale replace, Step 1.7, left untouched). Takes the
already-computed result of `services/learningLoop/applier.ts`'s pure `applyRefinements()` — the
store itself never imports from `services/` (no store action does) — and sets `learnedPreferences`
AND appends to `learningAuditLog` in one atomic `set()` call, so the two fields can never be
observed out of sync with each other.

Persisted keys for autosave: `ACCOUNT_PERSISTED_KEYS`.

### The plan flag

`plan` is a **flag, not billing**. ROUTING.md is explicit: there is no payment processing and no
account system yet. `routing.js` already accepts `plan` as an input and gates Opus + extended
thinking on it, but nothing supplies it until it is wired in. It lives in the account store and
defaults to `"free"` so the gated (free) path is what gets exercised by default. **Do not** build
billing, auth, or an upgrade flow against this field — that is a later stage the current build
does not include.

### stateCorrections is a new field, not a repurposed learnedPreferences (Step 6.4)

This table's `learnedPreferences` row originally noted "correction learning 6.4" as a
candidate owner — that field's `routing`/`technique` `Record<string, unknown>` bags are
earmarked for the Steps 10.1–10.2 RATINGS-driven rule-refinement loop (PIPELINE.md LEARNING
LOOP: "low ratings + 'too verbose' reduce Detailed"), a different concept from raw state-pill
corrections and not naturally shaped for them. Step 6.4 instead ADDs a properly-typed sibling
field, `stateCorrections: StateCorrection[]`, per this contract's own ADD rule (below) — the
prior row's mention was a provisional placeholder in an admittedly-provisional shape, not a
locked decision being reversed.

### VisibilitySettings defaults (CANON Feature 12)

| Checkbox | Default |
|---|---|
| `recentSessions` | ON |
| `contextSnapshot` | ON |
| `recentActivity` | ON |
| `tokenUsage` | ON |
| `modelStatus` | ON |
| `quickTools` | **OFF** |
| `activeSession` | **OFF** |

---

## NOTES FOR LATER STEPS

- **Provisional nested types** (`ContextItem`, `ConversationMessage`, `StatePills`, `ArchivedPair`,
  `LearnedPreferences`) hold the minimum Step 1.7 needed. Their owning steps (above) may ADD fields;
  they should not remove or rename the top-level store fields in this contract without updating it.
- **`StateCorrection`** (Step 6.4) is settled, not provisional — `{ dimension, from, to, timestamp }`,
  four plain fields, unlikely to need extension.
- **Serialization:** keep all state plain JSON — no functions, `Map`, `Set`, `Date` (use epoch-ms
  `number` timestamps, as the current types do). Autosave (Step 1.8) relies on this.
- **Rehydration:** both stores expose `hydrate(partial)` for the autosave layer to restore persisted
  state on startup, and expose their `*_PERSISTED_KEYS` so the autosave layer never hardcodes field
  names.
- **Where new state goes:** apply the session-vs-account rule at the top of this file. Add the field
  to `types.ts`, the store, its `*_PERSISTED_KEYS`, and this contract in the same step.
