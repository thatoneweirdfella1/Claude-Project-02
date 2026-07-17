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
| `model` | `ModelSelection` = `ModelId \| "auto"` | `"auto"` | Model registry: **Step 1.10**. Ids fixed by CANON/ROUTING. |
| `directness` | `DirectnessLevel` = `1 \| 2 \| 3` | `2` | Directness control: **Step 4.4**. Default L2 per CANON Feature 3. |
| `technique` | `TechniqueId` (12-value union) | `"socratic"` | Technique registry: **Step 4.1**. Union mirrors CANON Feature 4. |
| `context` | `ContextItem[]` | `[]` | Context management: **Steps 7.1–7.5**. Shape provisional. |
| `conversation` | `ConversationMessage[]` | `[]` | Streaming/pipeline: **Steps 5.1–5.2**; rich metadata 8.x. Shape provisional. |
| `statePills` | `StatePills` (emotion/rsd/interest/cognitive, each nullable) | all `null` | State detection: **Steps 6.1–6.3**. Values mirror CANON Feature 5. |

Actions: `setModel`, `setDirectness`, `setTechnique`, `addContextItem`, `removeContextItem`,
`addMessage`, `setStatePills`, `resetSession`, `hydrate`.

Persisted keys for autosave: `SESSION_PERSISTED_KEYS`.

---

## ACCOUNT STORE (`useAccountStore`)

Persists across browser closes. Default produced by `createInitialAccountState()`.

| Field | Type | Default | Owning step for full detail |
|---|---|---|---|
| `plan` | `PlanFlag` = `"free" \| "paid"` | `"free"` | Routing gate: routing.js (wired in a later Phase-3 step). See note below. |
| `archivedPairs` | `ArchivedPair[]` | `[]` | Session lifecycle/archive: **Steps 9.1–9.2**. Shape provisional. |
| `ratings` | `Rating[]` | `[]` | Feedback + learning loop: **Steps 8.1 / 7.2 / 10.x**. Stored shape settled. |
| `savedPrompts` | `SavedPrompt[]` | `[]` | Saved prompts: **Step 9.2**. |
| `variables` | `SavedVariables` = `Record<string,string>` | `{}` | Variables: **Step 7.4**. |
| `visibility` | `VisibilitySettings` (7 booleans) | `DEFAULT_VISIBILITY` | Visibility toggle: **Step 9.4**. Defaults fully specified by CANON Feature 12. |
| `learnedPreferences` | `LearnedPreferences` (`routing` + `technique` records) | `{ routing:{}, technique:{} }` | Pattern analysis / rule refinement: **Steps 10.1–10.2**; correction learning 6.4. Shape provisional. |

Actions: `setPlan`, `archivePair`, `addRating`, `addSavedPrompt`, `removeSavedPrompt`,
`setVariable`, `removeVariable`, `setVisibility`, `setLearnedPreferences`, `hydrate`.

Persisted keys for autosave: `ACCOUNT_PERSISTED_KEYS`.

### The plan flag

`plan` is a **flag, not billing**. ROUTING.md is explicit: there is no payment processing and no
account system yet. `routing.js` already accepts `plan` as an input and gates Opus + extended
thinking on it, but nothing supplies it until it is wired in. It lives in the account store and
defaults to `"free"` so the gated (free) path is what gets exercised by default. **Do not** build
billing, auth, or an upgrade flow against this field — that is a later stage the current build
does not include.

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
- **Serialization:** keep all state plain JSON — no functions, `Map`, `Set`, `Date` (use epoch-ms
  `number` timestamps, as the current types do). Autosave (Step 1.8) relies on this.
- **Rehydration:** both stores expose `hydrate(partial)` for the autosave layer to restore persisted
  state on startup, and expose their `*_PERSISTED_KEYS` so the autosave layer never hardcodes field
  names.
- **Where new state goes:** apply the session-vs-account rule at the top of this file. Add the field
  to `types.ts`, the store, its `*_PERSISTED_KEYS`, and this contract in the same step.
