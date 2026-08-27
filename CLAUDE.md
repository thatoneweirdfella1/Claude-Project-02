# DIVERGENCE.AI — BINDING CENSUS-FIRST REPAIR LAW

## 1. Identity

- Repository: `thatoneweirdfella1/Claude-Project-02`
- Only writable branch: `claude/whole-site-repair-v1`
- Repair work order: `docs/repair-authority/CLAUDE-WHOLE-SITE-REPAIR-WORK-ORDER.md`
- Progress ledger: `docs/checkpoints/CLAUDE-REPAIR-PROGRESS.md`
- Mounted census: `docs/checkpoints/CLAUDE-MOUNTED-UI-CENSUS.md`
- Audit reference head before this replacement was installed:
  `d7af8b711e1a30d2a4cc989035e3d6773795a8f0`

Always resume from the branch's actual current HEAD. Never reset completed work merely
because the audit reference SHA is older than the current HEAD.

This file controls the repair execution method. Settled product requirements in the
repair work order and approved repository authority still control expected behavior.

## 2. Mission

Complete every safe remaining repair through the actual rendered application while
minimizing user management, repeated repository discovery, model usage, elapsed time,
and duplicated implementation or verification work.

The user provides one initial execution instruction. Claude manages inspection,
agents, tests, browser runs, corrections, commits, checkpoints, context recovery, and
the final handoff.

Do not ask the user to manage branches, worktrees, agents, commits, files, tests,
verification failures, checkpoints, or requirement ordering.

## 3. Safety boundary

Allowed on the repair branch:

- Read and inspect repository files and history
- Run repository preflight
- Run local tests, builds, previews, and browser automation
- Use deterministic local provider simulations and network interception
- Edit safe application code and tests
- Commit coherent repair waves and checkpoints
- Use sequential implementation and verification agents
- Use read-only exploration agents

Forbidden without new explicit user authorization:

- Modify another branch
- Merge, rebase, force-push, or open a pull request
- Deploy or promote to production
- Use credentials, secrets, or real provider accounts
- Call paid or live AI providers
- Spend money
- Configure payments, OAuth applications, production services, or secrets
- Alter real user or production data

A forbidden action is recorded as an exact blocker. It does not stop unrelated safe
work and is never marked complete.

## 4. Model roles

Use these roles when the models are available:

- Coordinator/integrator: Claude Opus 5
- Implementation and correction: Claude Sonnet 5
- Independent group verification: a fresh Claude Sonnet 5 agent
- Final whole-site audit: a fresh Claude Opus 5 agent

Do not use Haiku to implement a repair or certify completion.
Do not use Fable unless the user separately authorizes its additional usage.

If an exact model is unavailable, use the strongest available model in the same role,
record the substitution once, and continue.

## 5. Single-writer law

Only one agent may write application code, tests, checkpoints, or git state at a time.

Do not run concurrent implementation agents in one checkout.

Sequential agents may use the same checkout only after the preceding writer has:

1. Finished
2. Committed or cleanly reverted its work
3. Left `git status` clean
4. Reported the full HEAD SHA

Read-only agents may run concurrently only if they cannot edit files or git state.

If parallel writing ever becomes unavoidable, first verify the installed Claude Code
version supports isolated worktree subagents, use `isolation: worktree`, give every
writer a separate branch/worktree, and let only the coordinator integrate completed
commits. The user must not manage that process. Parallel writing is not the default
for this repair.

Never use a stash as a coordination mechanism between agents.

## 6. Mandatory preflight

Before any new application edit:

1. Verify repository root and remote.
2. Verify the current branch is exactly `claude/whole-site-repair-v1`.
3. Record the full current HEAD.
4. Stop if uncommitted work cannot be attributed safely.
5. Read this file, the repair work order, AGENTS.md, and the progress ledger.
6. Run the repository's read-only preflight.
7. Run baseline unit tests.
8. Run the production build.
9. Run the complete Playwright suite.
10. Record all pre-existing failures separately from new regressions.
11. Verify the local preview and browser can reach the rendered application.

Normalize shared E2E bootstrapping only when direct evidence shows the failure is test
environment setup, such as an unmocked account-bootstrap route. Never weaken an
assertion, skip a failing product workflow, or change application behavior merely to
make the test harness green.

## 7. Mounted application census

Before repairing R08 or beginning another requirement, create or refresh:

`docs/checkpoints/CLAUDE-MOUNTED-UI-CENSUS.md`

Start from the actual application entrypoint and trace the complete live tree:

`src/main.tsx` -> account gate -> `AppShell` -> navigation/router/pipeline -> rendered
screen/control.

For every reachable screen and visible control record:

- Stable census ID
- Visible label or role
- Navigation path from application root
- Static import/render chain
- Production component file
- Store/state dependency
- Service/API dependency
- Persistence dependency
- Browser locator proving it rendered
- Related repair rows
- Same-named or misleading unmounted files
- Current status

A component is eligible for repair only when both conditions are met:

1. A static render chain reaches it from `src/main.tsx`.
2. The built application produces runtime DOM evidence for its screen or control.

The following do not prove a component is live:

- Filename
- Export or barrel export
- Handler name
- Test file
- Store calls
- Similar visual wording
- Code comments
- An unused registry
- An earlier AI claim

If two live controls implement similar concepts, determine whether both are user-facing
workflows. Do not silently choose one because its filename resembles the requirement.

Do not spend a repair wave improving confirmed dead code. Remove a dead decoy only
when its removal is safe, tested, and materially prevents future false repairs.

## 8. Six repair waves

Run these waves sequentially.

### Wave 1 — Local input

- Independently verify the current R08 implementation at the current branch head.
- Repair R08 automatically if verification fails.
- Implement and verify R09 File Attachment.
- Implement and verify R10 URL Context.

### Wave 2 — Provider readiness and errors

- R11 Provider Status Refresh
- R12 Busy-State Cleanup
- R13 Safe Provider Error Categories
- R25 Connected Execution Truth
- R26 Provider Connection Lifecycle
- R29 Honest Readiness and Workflow Wording

### Wave 3 — Pricing, usage, and execution truth

- R14 Unknown Model Pricing
- R15 Partner Usage Collection
- R19 Prepared / Copied / Opened / Sent / Answered Truth
- R27 Multi-AI Cost Estimates
- R28 Remove Placeholder Cost Logging

### Wave 4 — Conversation management

- R16 Messages Screen
- R17 Projects Workflow
- R18 Active Session Lifecycle

### Wave 5 — Multi-AI workflow

- R20 Select Unresolved Conversation
- R21 Persist Multi-AI Results
- R22 Retry Only One Participant
- R23 Use Every Participant in Consensus
- R24 Multi-AI Cancellation

### Wave 6 — Authorization-gated proof

- R30 Exact Preview and Production Gate
- R31 Live Provider Proof Gate

Do not create one implementation/verifier cycle per small requirement. One implementer
handles the complete wave, and one fresh verifier verifies the complete wave.

## 9. Per-wave implementation procedure

For every requirement in the active wave, the implementation agent must first record:

- Exact visible entry point
- Mounted production component
- Source state/store
- Service or external boundary
- Persistence boundary
- Required success result
- Required rejection/failure result
- Required cancellation or rollback result
- Required reload/navigation result
- Appropriate unit, integration, and browser evidence

Then:

1. Reproduce the failure through the live application when locally possible.
2. Implement the smallest complete vertical repair.
3. Preserve approved product behavior.
4. Add outcome-level regression tests.
5. Run focused tests after each coherent repair.
6. Run the affected suite and build before handing the wave back.
7. Commit coherent changes with the full requirement IDs in the commit message.
8. Leave the checkout clean.

A UI-only patch does not complete a stateful workflow.
A store-only or service-only patch does not complete a visible workflow.
Code presence is not behavior evidence.

## 10. Integration review

After the implementation agent completes a wave, the Opus coordinator must:

1. Review the complete combined diff.
2. Check shared stores, persistence, migrations, provider state, and call accounting.
3. Confirm every edited application component is in the mounted census.
4. Confirm no requirement was implemented only in a decoy component.
5. Run focused tests, affected tests, the complete unit suite, and build.
6. Run the wave's committed browser tests.
7. Resolve integration failures before independent verification.
8. Record the candidate full SHA for the verifier.

Do not give a verifier a candidate already known to be broken.

## 11. Independent group verification

Use a fresh verifier that did not implement the wave.

Give the verifier:

- This contract
- The work-order rows in the active wave
- The mounted census
- The candidate full SHA
- Known external blockers
- Baseline test failures

Do not give the verifier the implementer's reasoning or ask it to confirm the
implementer's claims.

The verifier must:

1. Reconfirm each targeted component is mounted.
2. Start from the real application root.
3. Navigate through visible controls.
4. Operate the rendered workflow.
5. Test success and failure.
6. Test cancellation, abort, rollback, or partial failure where applicable.
7. Test reload and navigation persistence where applicable.
8. Inspect exact network call count and payload where applicable.
9. Inspect the diff after attempting the user workflow.
10. Run focused tests, affected tests, the complete unit suite, and build.
11. Return one consolidated PASS/FAIL/BLOCKED matrix.

Allowed statuses:

- `PASSED — RENDERED EVIDENCE RECORDED`
- `PASSED — NONVISUAL CONTRACT EVIDENCE RECORDED`
- `FAILED — RETURNED FOR REPAIR`
- `LOCALLY VERIFIED — LIVE PROOF AUTHORIZATION REQUIRED`
- `BLOCKED — EXACT EXTERNAL REQUIREMENT RECORDED`

A verifier may not mark a user-visible requirement passed through code inspection,
unit tests, component logic, or build success alone.

## 12. Automatic correction loop

When verification fails:

1. Consolidate every failure from the wave.
2. Return the consolidated list to the implementation role automatically.
3. Repair all related failures together.
4. Commit the correction.
5. Give the new full SHA to the same independent verifier.
6. Rerun failed cases and the complete wave matrix.
7. Repeat inside the active correction wave until every locally testable row passes or
   has an exact external blocker.
8. Continue unaffected later work without asking the user to manage the loop.

Never change a failed row to passed merely to exit the loop.

## 13. Test authority

### Rendered-browser evidence is mandatory for

- Screen and control reachability
- Visible labels and truthful wording
- Buttons, menus, dialogs, overlays, file inputs, and URL inputs
- Create, edit, save, cancel, remove, archive, restore, discard, and undo
- Reload and navigation persistence
- Disabled/enabled and busy-state transitions
- Abort, cancellation, timeout, rejection, and partial failure presentation
- Provider readiness and connection lifecycle presentation
- Cost estimates, authorization gates, and reconciled cost display
- Conversation/project/session workflow
- Multi-AI participant, result, retry, and cancellation workflow
- Network call counts caused by visible controls
- Final whole-site screen-and-control census

Browser tests must begin at the application root and use visible navigation. A test may
use Playwright's file chooser or network routing after reaching the corresponding
visible user control.

### Unit or integration evidence may prove

- Pure parsing and validation
- Error categorization
- Pricing lookup and cost arithmetic
- State machines, reducers, and selectors
- Serialization and migration
- Persistence adapters
- Request construction
- Participant ordering
- Call accounting
- Abort propagation
- Retry selection

Unit or integration evidence cannot independently pass a requirement whose acceptance
criterion includes a rendered outcome.

## 14. Anti-fake-test rules

A regression test must test production behavior, not reproduce it.

Forbidden:

- Copying the implementation algorithm into the test
- Computing expected output with the same production helper that generated the result
- Calling a store action directly when the requirement concerns a visible control
- Calling a component handler directly instead of operating its rendered control
- Claiming a mocked internal function proves a browser network request occurred
- Claiming a component test proves that component is mounted in the application
- Calling code inspection browser verification

Required:

- Import production code
- Derive expected outcomes from approved requirements
- Mount the real production component for integration tests
- Begin E2E tests at the built application root
- Intercept external calls at the browser network boundary
- Assert exact request counts where retries or participant calls matter
- Use fixed response fixtures
- Preserve trace and screenshot evidence for browser failures

## 15. External providers and authorization gates

Local simulation may prove local application behavior but cannot prove a live provider,
credential, payment, deployment, preview, or production outcome.

Use these exact classifications:

- `LOCALLY VERIFIED — LIVE PROOF AUTHORIZATION REQUIRED`
- `BLOCKED — CREDENTIAL REQUIRED`
- `BLOCKED — PAYMENT/SPENDING AUTHORIZATION REQUIRED`
- `BLOCKED — DEPLOYMENT AUTHORIZATION REQUIRED`
- `BLOCKED — PRODUCTION ACCESS REQUIRED`
- `BLOCKED — EXTERNAL PROVIDER AVAILABILITY REQUIRED`

For every blocker record:

- Exact requirement
- Exact missing authority or access
- Exact route/provider/environment
- Maximum expected cost if applicable
- Evidence already proven locally
- Evidence that remains unproven
- Exact authorized future action required

Do not ask for credentials or authorization during the repair. Record the blocker and
continue all unaffected work.

## 16. Checkpoints and context recovery

After every wave, update the progress ledger as a compact resume index.

The active table must contain:

| Requirement | Status | Implementation full SHA | Verification evidence | Blocker | Next action |
|---|---|---|---|---|---|

Do not append another long session narrative for routine progress.

Create one focused wave checkpoint containing:

- Wave number and requirements
- Starting full SHA
- Implementation commit SHAs
- Correction commit SHAs
- Final wave full SHA
- Changed files
- Mounted controls affected
- Focused test results
- Complete unit result
- Build result
- Browser verification matrix
- Baseline failures still present
- External blockers
- Exact next wave

At context loss or session restart:

1. Read this file.
2. Read the top progress table.
3. Verify branch and full HEAD.
4. Verify the checkout is clean.
5. Resume the exact recorded next action.
6. Do not make the user reconstruct history.

Working behavior and executable tests are primary. Checkpoint prose cannot override
the mounted census, browser evidence, test results, or git state.

## 17. Final whole-site audit

After all six waves:

1. Use a fresh Opus verifier with no implementation role.
2. Rebuild the mounted screen-and-control census from the application root.
3. Visit every reachable screen.
4. Operate every visible control.
5. Record expected result, actual result, evidence, and status.
6. Test shared state across screens.
7. Test reload and navigation persistence.
8. Test cancellation and failure recovery for stateful workflows.
9. Confirm provider, cost, payment, deployment, and production wording remains honest.
10. Run the complete unit suite.
11. Run the production build.
12. Run the complete E2E suite.
13. Compare final failures with the frozen baseline.
14. Return every locally testable failure automatically for final correction.
15. Rerun the audit after corrections.
16. Leave external-only rows explicitly blocked.
17. Commit `docs/checkpoints/CLAUDE-REPAIR-FINAL.md`.

The final checkpoint must contain:

- Exact candidate branch
- Exact full 40-character HEAD SHA
- All implementation and correction commits
- Every requirement status
- Complete final screen-and-control census
- Complete unit, build, and browser results
- Remaining external blockers
- Production and live-provider actions still forbidden
- Rollback/reference SHA
- Exact independent-adoption handoff

## 18. Completion law

Do not claim the repair complete unless:

- Every R07-R31 row has permissible evidence or an exact external blocker.
- Every locally testable visible outcome passed in the rendered application.
- No targeted repair exists only in dead or unmounted code.
- The mounted census covers every reachable screen and visible control.
- Every failed verification was returned automatically for repair.
- The final unit suite and production build results are recorded honestly.
- The final E2E result is recorded honestly, including any remaining failures.
- The final branch and full HEAD SHA are recorded.
- No merge, deployment, credential use, paid call, spending, or production change
  occurred.

At completion, return a compact summary containing:

- Passed requirements
- Exact blocked requirements
- Final unit/build/E2E results
- Exact branch
- Exact full HEAD SHA
- Exact next authorization, if any

Do not ask the user to perform project management during execution.
