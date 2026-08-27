# Divergence.AI Whole-Site Truth Audit

Date: 2026-08-27 UTC

Purpose: determine what actually works on the deployed site, what does not, why earlier audits missed it, and what must be repaired. Prior completion labels are not accepted as evidence.

## Audit law

1. A build, test suite, deployment status, or code presence does not prove a user outcome.
2. Every visible control must be exercised on the deployed application and its resulting state verified.
3. Every required outcome needs positive, negative, persistence, cancellation, failure, and recovery evidence where applicable.
4. Untested, access-blocked, or cost-blocked behavior is `UNPROVEN`, never `PASS`.
5. Each checkpoint records exact scope, evidence, failures, blockers, and the next resumable action.

## Deployment freeze

| Target | Exact location | State |
| --- | --- | --- |
| Public production | https://claude-project-02.vercel.app/ | Reachable and audited |
| Repaired preview | https://claude-project-02-gclmmgjbs-thatoneweirdfella1s-projects.vercel.app/ | Reachable but protected by app password |
| Expected preview commit | `4b1b077f9857c338e30070bde3bd047ec3bf5bb5` | Not independently proven from the browser |

## Checkpoint CP-00 — Target and access freeze

Status: COMPLETE WITH BLOCKER

Evidence:

- Public production loads with title `DIVERGENCE.AI`.
- Repaired preview loads only an `Enter app password` screen with a Password field and disabled Continue button.
- No secure browser sign-in capability is available for that app-level password in the current audit session.

Consequences:

- Public production can be fully audited now.
- Repaired-preview-only behavior remains `UNPROVEN` until secure access is supplied or the preview protection is removed.
- A READY deployment status cannot substitute for the blocked user-flow audit.

Next resumable action: inventory the public deployment's screens and visible controls, then exercise them.

## Checkpoint CP-01 — Primary screen census

Status: COMPLETE FOR PUBLIC PRODUCTION

Screens reached through primary navigation:

| Navigation label | Rendered page | Initial finding |
| --- | --- | --- |
| Talk to AI | Talk to AI composer | No literal Send button; disabled `Translate & Ask` control is present |
| Sessions | Empty Sessions screen | Copy tells users to create a session in a nonexistent/renamed `Translate screen` |
| Saved Tools | Templates | Navigation label and rendered page title disagree |
| Projects | Empty Projects screen | Creation path is indirect and described only in explanatory copy |
| Insights | Dashboard | Summary counters render; data behavior still unproven |
| Settings | Settings | Many controls render; persistence and functional effects still unproven |
| All Tools | Overlay on current screen | Overlay opens; each tool destination still requires testing |
| Trash | Empty Trash screen | Delete/restore flow still unproven |

Confirmed production defect:

- The main message composer does not provide the required clear `Send` button. The only submission control is `Translate & Ask`, initially disabled. This is the exact class of user-visible failure that prior code/build-focused verification missed.

Additional inconsistencies requiring outcome tests:

- `Sessions` refers to a `Translate screen`, while navigation calls the working area `Talk to AI`.
- `Saved Tools` opens a page titled `Templates`, suggesting label/scope mismatch.
- System status says `Local route ready`; this proves neither provider connectivity nor end-to-end sending.

Next resumable action: test top-bar overlays, All Tools destinations, and every composer control without triggering paid provider calls.

## Remaining checkpoints

- CP-02: top-bar, overlays, All Tools, and secondary-route control census
- CP-03: composer and local/free translation workflow
- CP-04: sessions, projects, templates, trash, persistence, and reload behavior
- CP-05: settings, providers, paid boundaries, errors, cancellation, and recovery
- CP-06: requirement reconciliation, root-cause map, and prioritized repair backlog

## Checkpoint CP-02 — Secondary controls and overlays

Status: COMPLETE FOR INITIAL PUBLIC-PRODUCTION CENSUS

| Control area | Result | Verdict |
| --- | --- | --- |
| Quick Reference | Opens and says `Ctrl + Enter translates your message` | Renders, but terminology conflicts with the main action |
| Search | Filters built-in templates and correctly shows `No results` for an unmatched query | Basic behavior passes; full session search awaits saved data |
| Templates top menu | Opens built-in entries | Rendering passes; template application/persistence remains unproven |
| Notifications | Opens empty notification panel | Rendering passes; event generation remains unproven |
| Help | Opens and says `press Translate` | Renders, but there is no button named Translate |
| Profile | Opens a Logout-only menu | Rendering passes; logout was not exercised because it would end audit state |
| All Tools | Opens six tool entries | FAIL: all six entries are inert |

Confirmed failures:

1. `Templates`, `Saved Prompts`, `Techniques`, `Variables`, `Checkpoints`, and `Integrations` inside All Tools accept clicks but do not navigate, change the main screen, or close the dialog.
2. Top-bar panels accumulate simultaneously. Search, Notifications, Help, and Profile remained open together instead of maintaining one active overlay.
3. Action terminology is inconsistent across one workflow: `Translate & Ask`, `Translate`, and `Ctrl + Enter translates`.

Next resumable action: exercise the free/local composer, review, copy/handoff, import, and save paths.

## Checkpoint CP-03 — Composer and free/local translation

Status: PARTIAL; CORE LOCAL PREPARATION PASS, HANDOFF WORKFLOW FAIL

Test input: `Summarize this note in exactly three bullets: apples, bananas, and carrots.`

Results:

| Step | Observed result | Verdict |
| --- | --- | --- |
| Enter text | `Translate & Ask` and `Check this message` become enabled | PASS |
| Translate & Ask on Universal route | Opens `Review AI-ready request`; says no Divergence credits | PASS for local preparation only |
| Generated request | Preserves the request and adds balanced-tone response instructions | PASS for this single fixture only |
| Review editing | Editable request field renders | Editing persistence not yet exercised |
| Copy only | Closes review and creates a conversation event | PARTIAL |
| Copy-only event semantics | Marks item `handed off`, `awaiting response`, and tells user it was handed off | FAIL: copying is represented as a completed handoff without proof |
| Import Response | Button accepts click but no dialog or state change appears | FAIL: visible control is inert |
| Literal Send action | No Send button exists at any step | FAIL |
| Actual destination response | No AI answer is produced; state explicitly says `Handed off — not answered` | FAIL if this flow is intended to send/ask, otherwise mislabeled UX |

Important boundary: this proves only one local Universal translation fixture. It does not validate model-specific translation quality, provider execution, attachment handling, error handling, cancellation, or recovery.

Next resumable action: test session creation, reload persistence, active-session controls, and destination selection.

## Checkpoint CP-04A — Initial session persistence probe

Status: PERSISTENCE PASS AFTER HIDDEN ARCHIVE STEP; DISCOVERABILITY FAIL

- The locally prepared/copied request appears in the current Conversation immediately after `Copy only`.
- Opening Sessions immediately afterward still says `No saved sessions yet`.
- Reloading before ending the active session preserves the conversation in Talk to AI, but Sessions remains empty.
- `Quick Actions → New Session` archives the old active session and then creates a new blank session.
- After that undisclosed archive step, the old two-message session appears in Sessions and survives a full reload.
- The Sessions screen gives no explanation that `New Session` is also the save/archive operation and refers users to a renamed/nonexistent `Translate screen`.

Interpretation: local persistence exists, but the required action is hidden under `Quick Actions → New Session` and is not described as save/archive. The initial empty Sessions state therefore misleads the user into believing the conversation was not retained. This is a discoverability and workflow-contract defect, not a storage failure on the same browser.

Next resumable action: inspect Active Session, Quick Actions, advanced controls, destination selection, and session close/archive paths.

Additional result:

- Destination selection renders 11 families and model-level Claude choices (`Auto`, `Haiku`, `Sonnet`, `Fable`, `Opus`). Selecting `Claude · Haiku` updates the composer and right-rail destination successfully. Provider execution remains unproven.
- Active Session expands to show name, duration, message count, context count, and draft state, but contains no visible save/close/archive action.

## Checkpoint CP-05 — Production versus latest-code reconciliation

Status: COMPLETE FOR CONFIRMED CORE DEFECTS

The public production deployment is not the latest repaired application lineage. Source inspection of `codex-verified/layer-7-v2@ac3edfcbe161408eb2b3b9450a797da3ce0ff858` establishes:

| Production failure | Latest-code state | Required action |
| --- | --- | --- |
| Import Response is inert | Latest `CenterColumn` opens `ImportResponseDialog`, validates the pasted response/source, updates the handoff to imported, adds a linked assistant message, and autosaves | Publish and deployed-test latest lineage |
| All Tools entries are inert | Latest `LeftNav.navigate()` routes every tool entry and closes the overlay | Publish and deployed-test latest lineage |
| Top-bar panels stack | Latest `TopBar` uses mutually exclusive `setOnly*` handlers | Publish and deployed-test latest lineage |
| System status implies readiness too broadly | Latest source says `Local systems ready · providers unconfigured` | Publish latest lineage |
| No clear Send button | Latest source still renders `Translate & Ask` | Requires code repair plus deployed test |

Latest-code Import Response outcome contract:

1. The handoff must exist and be awaiting an imported response.
2. Import Response opens a modal with source and response fields.
3. Empty or missing-source confirmation is blocked.
4. Confirm changes the original handoff to imported.
5. Confirm adds the pasted answer as a linked assistant message.
6. The dialog closes and status reports successful import.
7. Autosave runs; reload and saved-session load must retain the result.

Remaining limitation: the repaired Layer 7 preview is app-password protected, so its live behavior could not be checked directly. Source presence is not counted as deployed proof.

## Checkpoint CP-06 — Frozen repair batch

Status: IMPLEMENTED; DEPLOYED VERIFICATION PENDING

- Isolated branch: `codex-verified/user-outcome-repair-v1`
- Base: `codex-verified/layer-7-v2@ac3edfcbe161408eb2b3b9450a797da3ce0ff858`
- Governance checkpoint records the current user authorization and freezes exact allowed paths.
- Application changes:
  - Primary action now has literal visible label and accessible name `Send`.
  - Help text now tells the user to use Send and explains that Ctrl/Cmd+Enter invokes the same action.
  - Regression test requires the literal Send contract and rejects return of `Translate & Ask`.
- Existing latest-code Import Response, All Tools routing, exclusive top-bar state, session persistence, provider boundaries, and translation behavior were preserved rather than rewritten.

Deployment verification gate:

- Matching commit must build successfully.
- Deployed composer must visibly expose Send.
- Send must enter review/local handoff without a provider charge.
- Import Response must open, validate, confirm, update status, appear in the thread, and survive reload/session load.
- All Tools destinations must navigate.
- Only one top-bar overlay may remain open.
- Anything blocked by app-password protection remains `UNPROVEN`.

## Checkpoint CP-07 — Build and deployment gate

Status: BUILD PASS; LIVE WORKFLOW BLOCKED; PRODUCTION NOT PROMOTED

Evidence for application/test commit `99e99c969e99f849fb871f7d198285399c8e17dd`:

- Matching Vercel deployment: `dpl_FKzL8vwnUttpifgaL19nNMfcmRSi`
- Deployment state: `READY`
- Test files: 81 passed
- Tests: 710 passed
- New visible Send contract test passed
- TypeScript and Vite production build passed

Live verification blocker:

- Vercel deployment protection was bypassed through an authorized temporary access route.
- The application then displayed its separate `Enter app password` gate.
- The audit environment has no approved secure credential-entry capability for that gate and is not authorized to read deployment secrets.
- Therefore Send, Import Response, All Tools, exclusive overlays, and persistence remain `UNPROVEN` on this matching deployment even though their source and automated tests pass.

Production safety decision:

- Production was not promoted because doing so before crossing the app-password gate could replace the currently accessible public site with a site the user cannot enter.
- This is an explicit stop condition, not a completion claim.

Exact continuation point:

1. Provide a safe user-accessible deployment with the app gate already unlocked, or temporarily disable only the preview's app gate through an authorized configuration change.
2. Run the frozen live workflow checklist.
3. Promote only after every required visible outcome passes.
