# CLAUDE Repair Progress Ledger

**Branch:** `claude/whole-site-repair-v1`
**Started:** 2026-08-27
**Purpose:** Track completion of requirements R07-R31 per CLAUDE.md binding law

## Progress Status

- **Completed Groups:** 0/5
- **Passed Requirements:** 1/25 (R07)
- **Current Session:** R07 PASSED with independent real-browser evidence (commit
  `8bbd3ab`). R08's first implementation (commit `0cd7814`) targeted dead code and
  FAILED verification; redirected to the real live import flows.

## Process note — commit history correction (2026-08-27)

Two implementation agents were run without git worktree isolation and shared one
working directory. The R08 agent's `git add`/commit swept in the R07 agent's
uncommitted Edit-control changes, and separately a `git stash` used to clean the
working directory for the R07 retry captured the R08 agent's actual `ImportModal.tsx`
and `import.css` edits, which were not committed at the time. Corrected by:
- Resetting to `b5952ef` (pre-mixup) and recovering the stash
- Splitting into `4003e49` (R07 Edit control only) and `0cd7814` (R08 implementation
  only, content unchanged from original agent output)
- Full suite re-verified at 748/748 passing and build green after the split

**Lesson applied going forward: implementation agents for different requirements run
sequentially, or with `isolation: "worktree"`, never sharing one working directory.**

### Session 7 — R07 re-implemented on the correct (live) component

Followed Session 6's corrected next action exactly: fixed `TemplatesScreen` in
`src/components/layout/ScreenRouter.tsx` (the live Saved Tools -> Templates screen),
not `LoadTemplateMenu.tsx`.

**Changes:**
- `formData` gained a `starterQuestion` field; both the create-form and edit-form JSX
  gained a "Starter Question (optional)" textarea (`form-group__input` pattern).
- `handleCreateTemplate` now passes `starterQuestion` (trimmed, omitted if blank) and
  snapshots the active session's current `context` (via `useSessionStore`'s `context`
  state) into the new template when it's non-empty — same precedent as the removed
  `LoadTemplateMenu.saveCurrentAsTemplate`.
- `handleEditTemplate` now seeds `formData.starterQuestion` from the template being
  edited. `handleSaveEdit` now includes `starterQuestion` in its `updateTemplate` call
  and intentionally omits `context` from the updates object — `updateTemplate` merges
  updates onto the existing template (`{ ...t, ...updates }`), so context captured at
  creation survives an edit untouched (no context-editing UI exists in this form).
- Cleanup: removed `src/components/session/LoadTemplateMenu.tsx` and its two test
  files, and its export from `src/components/session/index.ts` — confirmed dead code
  (grep outside those 3 files found zero consumers; nothing ever rendered
  `<LoadTemplateMenu>`), and it directly caused the two wasted repair cycles in
  Sessions 3-6 by looking like the real component.

**Tests:**
- `src/components/layout/TemplatesScreen.test.tsx` (new, 4 tests) — mounts the real
  `ScreenRouter` (routed to Saved Tools -> Templates) and drives create-with-context,
  create-without-optional-fields, edit+save (starterQuestion updates, context
  preserved), and edit+cancel (no store mutation) against the real store.
  React-dom/client render harness, same pattern as
  `src/components/settings/layer2Interactions.test.tsx`.
- `e2e/templates.spec.ts` (new, 1 Playwright test) — full browser click-through:
  create (title + model + starter question) -> reload -> rediscover -> Use Template
  (starter question populates the composer) -> Edit -> change starter question ->
  Save -> reload -> change persisted -> Edit again -> change -> Cancel -> reload ->
  change NOT persisted. Uses `npm run build && npx vite preview` per
  `playwright.config.ts`, with `/api/verify-access` AND `/api/account` mocked via
  `page.route()` (the latter was the actual cause of the "Loading account" hang noted
  in Session 6 — `vite preview`'s SPA fallback returns 200/HTML for the unmocked
  `/api/account` route, which `durableSync.getAccountStatus` silently treats as an
  ambiguous ok-but-empty body, parking `AccountGate` in `webUser === undefined`
  forever). Full sequence passed: `1 passed`.
- Full unit suite after these changes: 727/727 passing (748 baseline + 4 new -
  25 removed with the deleted dead-code test files). Build: green.

**Status:** IMPLEMENTED AND UNIT/E2E-TESTED BY THIS IMPLEMENTATION AGENT. NOT YET
VERIFIED BY A FRESH, INDEPENDENT VERIFICATION AGENT. Do not mark PASSED until that
happens per the completion law.

**Environment note (out of scope for R07):** the rest of the pre-existing `e2e/`
suite (`core-flow`, `horizontal-layers`, `session-history*`, `theme-toggle`, etc.)
currently fails in this sandbox for the same `/api/account` reason described above —
none of those specs mock that route. This is a pre-existing gap unrelated to this R07
fix (confirmed by reproducing the same failure before touching any R07 code); the fix
for `e2e/templates.spec.ts` isolated in this session does not touch those other spec
files. Whoever picks up general E2E-suite health next should apply the same
`/api/account` mock to the shared `e2e/credit-helpers.ts` / `e2e/mocks.ts` helpers.

### Session 8 — R07 independently verified: PASSED

A different fresh verification agent (no memory of the implementation) confirmed:
- `TemplatesScreen` at `ScreenRouter.tsx:991` is genuinely the live, mounted component
  — traced `AppShell.tsx` → `ScreenRouter` (the app's sole router) → `case "saved-tools"`
  → `TemplatesScreen()`, and nav path `LeftNav.tsx` "Saved Tools" → screen `saved-tools`.
- **Found a second decoy**: `src/screens/TemplatesScreen.tsx`, registered in an unused
  `SCREENS` registry (`src/screens/index.ts`) that nothing imports — same trap shape as
  the original `LoadTemplateMenu.tsx` false lead, one level deeper. Verifier confirmed
  it's dead and did not mistake it for the real component.
- Full lettered sequence (create w/ starter question → card shows it → reload →
  rediscovered → Use Template → composer pre-filled → Edit → pre-populated form →
  change + Save → reload → persisted → Edit again → change + Cancel → reload → NOT
  persisted) passed against a real Chromium browser via `vite preview` + Playwright,
  using both the committed `e2e/templates.spec.ts` and the verifier's own independent
  script (not committed).
- Context-capture round-trip (add context to session → create template → reload →
  Use Template → context restored; edit+save → context still present, not dropped)
  also verified.
- `npm run test`: 727/727 passing. `npm run build`: green.
- `LoadTemplateMenu.tsx` removal confirmed harmless (zero remaining references,
  suite/build green).

**Caveat noted, not a blocker:** a pre-existing, unrelated Playwright actionability
quirk in `AttachContextControls.tsx`'s "Add Context" popover (pointer-event
interception by `<main class="col-center">` at computed click coordinates under this
app's `frozen-canvas` scaled layout) — worked around with `locator.evaluate()` click.
Not touched by the R07 commit; flagged for whoever works R09/R10 (both touch context
attachment) in case it affects real user interaction, not just Playwright's strict
actionability checks.

**R07 STATUS: PASSED — EVIDENCE RECORDED.**

### Session 9 — R08 verification FAILED: also fixed dead code

Same failure mode as R07 Sessions 2-6, one requirement later. Independent verifier's
mandatory first step (confirm the component is actually mounted before touching a
browser) caught it without needing to run Playwright:

- `grep -rn "ImportModal" src/` outside `ImportModal.tsx`/`ImportModal.test.ts` finds
  only comments (a stale doc reference in `ocr.ts`, CSS comments). No file anywhere
  contains `<ImportModal`, an import of it, or a `lazy()` reference.
- `src/components/session/index.ts` never exported it (only `QuickActionsRow` and
  `SavedPromptsMenu` — the barrel's own header already documents `LoadTemplateMenu`
  being removed for the same reason, but `ImportModal` was never wired in at all).
- `ImportModal.test.ts`'s own header states it tests "import logic and data flow"
  only and that "UI rendering is covered separately by visual testing" — no such
  visual testing exists anywhere in the repo.
- **The real, live import UX is split across two components that commit `0cd7814`
  never touched:**
  - `src/components/session/QuickActionsRow.tsx` — mounted at
    `src/components/pipeline/CenterColumn.tsx:687` (`<QuickActionsRow />`, part of the
    real render tree). Has its own inline `dialog === "import"` state and its own
    picker/preview/confirm/cancel UI around lines 220-230.
  - `src/components/layout/ScreenRouter.tsx` — its own `handleImportSession` file-input
    handlers at lines 517 and 1765, a separate import path.

**Corrected next action:** Implement R08 in the real live component(s)
(`QuickActionsRow.tsx`'s inline import dialog, and/or `ScreenRouter.tsx`'s
`handleImportSession`, whichever is the actual user-facing "Session Import Selector"
this requirement describes — investigate both, determine if they're the same
conceptual flow or two distinct ones, and fix whichever is missing preview/validation/
explicit-confirmation/actionable-rejection/atomicity). Consider removing the orphaned
`ImportModal.tsx` + its test file as cleanup (same treatment as `LoadTemplateMenu.tsx`
in R07), but only after confirming zero live references, same as before. Verify with
real Playwright browser testing (vite preview + route mocks, per the now-established
pattern in `e2e/templates.spec.ts`), and dispatch a fresh independent verifier
afterward — same standard, same "confirm it's actually mounted first" check.

Continue running one agent at a time (implementation or verification) to avoid
repeating the Session 5 working-tree race condition.

## Requirements Status

### Group 1 — Local input and creation flows
- R07 Create Template — PASSED — EVIDENCE RECORDED (commit `8bbd3ab`, see Session 8)
- R08 Session Import Selector — FAILED — RETURNED FOR REPAIR (fixed dead `ImportModal.tsx`; see Session 9)
- R09 File Attachment — PENDING
- R10 URL Context — PENDING

### Group 2 — Execution truth, provider state, and cost foundations
- R11 Provider Status Refresh — PENDING
- R12 Busy-State Cleanup — PENDING
- R13 Safe Provider Error Categories — PENDING
- R14 Unknown Model Pricing — PENDING
- R15 Partner Usage Collection — PENDING
- R19 Prepared / Copied / Opened / Sent / Answered Truth — PENDING
- R25 Connected Execution Truth — PENDING
- R26 Provider Connection Lifecycle — PENDING
- R27 Multi-AI Cost Estimates — PENDING
- R28 Remove Placeholder Cost Logging — PENDING
- R29 Honest Readiness and Workflow Wording — PENDING

### Group 3 — Core conversation management
- R16 Messages Screen — PENDING
- R17 Projects Workflow — PENDING
- R18 Active Session Lifecycle — PENDING

### Group 4 — Multi-AI unresolved-conversation workflow
- R20 Select Unresolved Conversation — PENDING
- R21 Persist Multi-AI Results — PENDING
- R23 Use Every Participant in Consensus — PENDING
- R22 Retry Only One Participant — PENDING
- R24 Multi-AI Cancellation — PENDING

### Group 5 — authorization-gated proof
- R30 Exact Preview and Production Gate — PENDING
- R31 Live Provider Proof Gate — PENDING

## Session Logs

### Session 1 — Initialization
**Checkpoint:** Starting commit `e1a4b0cb97572ed023c281efe909f2bd41b880ca`

### Session 2 — R07 first attempt (INSUFFICIENT)
**Commit:** `214de210d5886f8c09c9f6fe32c35657de6adb9c`
**Summary:** Fixed `saveCurrentAsTemplate()` to capture context and starterQuestion.
**Outcome:** Verification agent wrongly marked this PASSED using logic-level integration
tests instead of rendered browser evidence. User caught this: LoadTemplateMenu had no
visible Edit control at all. Marked FAILED — RETURNED FOR REPAIR.

### Session 3 — R07 repair: visible Edit control added
**Commit:** `4003e49` (re-committed after history correction; originally landed
mixed into `cefb38a`)
**Changes:** Added `editingId` state, `view: "list" | "save" | "edit"`, a visible
Edit button (`quick-actions-row__list-edit`) on each custom template, an edit form
with title/Save/Cancel, `startEditTemplate()`, `saveEditedTemplate()` (persists via
`updateTemplate`), `cancelEdit()` (discards without saving).
**Tests:** 7 new regression tests (LoadTemplateMenu.test.ts).
**Status:** IMPLEMENTED. NOT YET VERIFIED IN A REAL BROWSER BY A FRESH AGENT.
**Required before PASS:** A fresh verifier must operate the actual rendered UI:
Create → Save → Reload → Load → click Edit → change title → Save → click Edit again →
Cancel → Reload, and record concrete evidence (DOM/screenshot) that the Edit button
exists and each transition works, not simulated store calls.

### Session 4 — R08 implemented concurrently with R07 repair (process violation)
**Commit:** `0cd7814` (re-committed after history correction; originally split
between `cefb38a`/`9c0f267` with core implementation lost to an uncommitted stash)
**Note:** This work began before the user's explicit "do not begin or continue R08"
instruction arrived, and an attempted interrupt of the running agent failed, so the
work completed anyway. User was informed of the conflict and chose to keep the R08
implementation and fix the commit history rather than discard it.
**Changes:** `json-file-preview` view, `describePreview()`, `confirmImport()`,
`cancelFileImport()`, validation reuse from `parseImportText()`, atomic apply only
after explicit confirm.
**Tests:** 20 new regression tests (ImportModal.test.ts).
**Status:** IMPLEMENTED. NOT YET VERIFIED IN A REAL BROWSER BY A FRESH AGENT.

### Session 5 — History correction
Reset to `b5952ef`, recovered R08's stashed implementation, split the mixed commit
into `4003e49` (R07 only) and `0cd7814` (R08 only). Re-ran full suite: 748/748 passing.
Build: success. Progress ledger rewritten to remove premature PASS claims.

### Session 6 — R07 verification FAILED: wrong component fixed entirely

A fresh verification agent used Playwright against a real browser (working around a
sandbox-specific issue where `npm run dev` never resolves past "Loading account" —
the project's own `playwright.config.ts` already documents this and its e2e specs
use `npm run build && npx vite preview` with `/api/verify-access` and `/api/account`
mocked via `page.route()`; that pattern is confirmed to work and should be reused).

**Finding:** `src/components/session/LoadTemplateMenu.tsx` — the file both R07 attempts
(`214de21`, `4003e49`) edited — is dead code. `grep -rn "LoadTemplateMenu"` outside its
own file finds only a barrel re-export (`src/components/session/index.ts`) and its own
unit test. No component ever renders `<LoadTemplateMenu>`. `git log --follow` confirms
this file already existed unused before this repair branch started (`e35083e`), so both
R07 fixes had zero effect on what a user can see or click.

**The real, live template UI** is `TemplatesScreen` in `src/components/layout/ScreenRouter.tsx`
(reached via Saved Tools → Templates), which:
- Already has a working, visible Edit control (`Pencil` icon button, `title="Edit template"`,
  `handleEditTemplate`/`handleSaveEdit`/`handleCancelEdit`) — verified working in-browser
  by the same verification agent for create/save/reload/load/edit/save/edit/cancel/reload.
- Has the *same underlying defect* originally diagnosed: `formData` (used by both the
  create form and the edit form) has no `context` or `starterQuestion` fields, and neither
  `handleCreateTemplate` nor `handleSaveEdit` capture them. There is also no input field in
  either rendered form for a starter question or context items.
- `handleLoadTemplate` already reads `template.context` and `template.starterQuestion` if
  present — so loading is ready, but nothing ever sets those fields via this screen.

**Corrected next action:** Implement the R07 fix in `TemplatesScreen`
(`src/components/layout/ScreenRouter.tsx`), not `LoadTemplateMenu.tsx`:
1. Add a starter-question field to `formData` and to both the create-form and edit-form JSX.
2. Decide and implement how context items are captured (likely: snapshot the active
   session's current context, matching how `handleLoadTemplate` re-applies it — consult
   `useSessionStore`'s `context` state).
3. Update `handleCreateTemplate` and `handleSaveEdit` to persist these fields via
   `addTemplate`/`updateTemplate`.
4. Consider removing the orphaned `LoadTemplateMenu.tsx`/its test/barrel export as
   cleanup, since it directly caused two wasted repair-and-verify cycles by looking like
   the real component — optional but recommended if it doesn't risk other work.
5. Verify with Playwright against `vite preview` (not `vite dev`), mocking `/api/verify-access`
   and `/api/account` the way the project's own `e2e/` specs already do.
6. A fresh verifier must repeat the full click-through sequence and confirm
   context/starterQuestion actually round-trip through create → save → reload → load.

Only after that passes does Group 1 continue to R09. R08 (`0cd7814`) still needs its own
fresh real-browser verification pass, independent of this R07 rework.
