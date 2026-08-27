# CLAUDE Repair Progress Ledger

**Branch:** `claude/whole-site-repair-v1`
**Started:** 2026-08-27
**Purpose:** Track completion of requirements R07-R31 per CLAUDE.md binding law

## Progress Status

- **Completed Groups:** 0/5
- **Passed Requirements:** 0/25
- **Current Session:** R07 implementation repaired (visible Edit control added); commit
  history corrected after a working-tree mixup. Both R07 and R08 implementations exist
  and pass automated tests, but neither has passed a fresh verifier's real browser
  workflow test yet. Do not count either as PASSED until that evidence exists.

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

## Requirements Status

### Group 1 — Local input and creation flows
- R07 Create Template — IMPLEMENTED, AWAITING FRESH BROWSER VERIFICATION (commit `4003e49`)
- R08 Session Import Selector — IMPLEMENTED, AWAITING FRESH BROWSER VERIFICATION (commit `0cd7814`)
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

**Next action:** Dispatch a fresh verification agent for R07 that operates the actual
rendered browser UI (not just component/store logic) and records concrete evidence.
Then do the same for R08. Only after both pass real browser verification does Group 1
continue to R09.
