# DIVERGENCE.AI — BINDING SINGLE-PROBLEM R08 TRIAL

## Scope

- Repository: `thatoneweirdfella1/Claude-Project-02`
- Only writable branch: `claude/whole-site-repair-v1`
- Only authorized repair: `R08 Session Import Selector`
- Model: Sonnet
- One writing session only
- No subagents
- Stop after R08

Do not begin R09 or any later requirement.

## Required outcome

The actual rendered application must provide a live session-import workflow where the user can:

1. Open the import control through visible navigation.
2. Choose a supported session-export file.
3. See a preview before anything is imported.
4. Receive clear validation and actionable rejection for invalid or unsupported input.
5. Explicitly confirm before importing.
6. Cancel without changing session data.
7. Import successfully after confirmation.
8. Experience no partial import if validation or application fails.
9. See the imported session persist after reload when persistence applies.

## Mandatory mounted-target check

Before editing:

1. Start from `src/main.tsx`.
2. Trace the real render chain to every visible session-import control.
3. Prove each target renders in the built application through a browser locator.
4. Inspect both known live candidates:
   - `QuickActionsRow.tsx` inline import flow
   - `ScreenRouter.tsx` session import handlers
5. Determine whether both are live distinct user workflows.
6. Do not edit `ImportModal.tsx` unless the render chain and browser both prove it is mounted. Prior evidence indicates it is dead code.

Record the mounted paths briefly before editing. Do not build a whole-site census.

## Implementation

Use one Sonnet session directly. Do not delegate.

Reproduce R08 in the rendered application, repair every live R08 path necessary for one coherent truthful workflow, and remove confirmed dead R08 decoys only if their removal is safe and tested.

The repair must include the UI, validation, state application, persistence boundary, cancellation, rejection, and atomic failure behavior required above.

## Verification

Verification is performed in this same trial to measure speed. It must still use real evidence:

- Focused production-code tests
- Production build
- Playwright starting at the built application root
- Visible navigation and controls
- Valid supported fixture
- Invalid JSON fixture
- Unsupported/wrong-shape fixture
- Preview and explicit confirmation
- Cancel with no mutation
- Failed import with no partial mutation
- Successful import and reload persistence

Tests may not recreate production logic or call stores directly to prove a visible workflow.

## Completion

Commit the coherent R08 repair and evidence. Report:

- Actual mounted import paths
- Root cause
- Files changed
- Focused tests
- Full test result
- Build result
- Browser result for every required outcome
- Exact full commit SHA
- Any exact blocker

Use only:

- `R08 PASSED — RENDERED EVIDENCE RECORDED`
- `R08 FAILED — EXACT FAILURE RECORDED`
- `R08 BLOCKED — EXACT EXTERNAL REQUIREMENT RECORDED`

Then stop. Do not continue to R09.

## Safety

Do not modify another branch, merge, open a pull request, deploy, use credentials, call providers, spend money, or alter real user/production data.
