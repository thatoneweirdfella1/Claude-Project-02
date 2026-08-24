# DIVERGENCE.AI — FIX ALL IMPLEMENTATION AUTHORITY v2

**This supersedes the old FIX ALL file.** The old file was derived from an incomplete decision denominator.

## Controlling sources

1. `DIVERGENCE-AI-CANONICAL-DECISION-AUTHORITY-v2.md` — what is authoritative.
2. `DIVERGENCE-AI-CONTROL-BEHAVIOR-MAP-v2.md` — exact requirement/control behavior.
3. `DIVERGENCE-AI-REPAIR-QUEUE-v2.md` — what must be repaired.
4. `DIVERGENCE-AI-DECISION-QUEUE-v2.md` — only the genuinely unresolved choices.
5. `DIVERGENCE-AI-ACCEPTANCE-TESTS-v2-ADDITIONS.md` plus the original acceptance registry for carried-forward controls.

## Implementation target

- Work on the isolated `cowork-complete-preview-20260823` branch unless the user explicitly names another non-production branch.
- **Never modify `build`.**
- Do not merge/deploy to production unless separately authorized.

## FIX ALL command semantics

When the user says `FIX ALL`, execute every v2 repair group in order.

- Do not answer with a plan instead of changing code.
- Re-read the current target branch before each repair group; Cowork's prior completion claims are not evidence that a v2 requirement is satisfied.
- `BLOCKED`, `UNTESTED`, unavailable live URL, missing provider credentials, or unavailable production deployment do **not** block source implementation.
- Missing credentials block only the credential-dependent final integration check after all source architecture, validation, mocks/adapters and tests that do not require the secret are complete.
- A Decision Queue item blocks only its exact affected design choice.
- Preserve correct behavior; remove behavior that contradicts the approved v2 authority.
- Do not use Cowork's `RQ-001..RQ-026` meanings. The only repair identifiers controlling this run are `V2-RQ-*` below.

## Repairs

| Repair ID | Issue | Affected IDs | Severity | Dependencies | Completion evidence |
|---|---|---|---|---|---|
| V2-RQ-001 | Restore the normal app-access credential flow for protected APIs. | SRC-SEC-01 | Critical | None | A matching deployment shows the normal user gate obtaining/retaining authorization; protected endpoints succeed with the header; wrong/missing credentials fail closed; no secret is exposed. |
| V2-RQ-002 | Enforce paid-fallback consent, cost confirmation, and maximum-per-request before any paid call. | SRC-COST-01; ADV-03; ADV-04 | Critical | RQ-001 | Below-limit, above-limit, fallback-disabled, cancel, insufficient-balance, and failure cases pass on the matching deployment with server/provider evidence and no unauthorized spend. |
| V2-RQ-003 | Make recovery and session lifecycle preserve work before resume/finish/destructive transitions. | SPEC-QA-05; SPEC-QA-09; SPEC-QA-10; USR-SC-03 | Critical | Persistence services already present | Crash/reload/resume/finish tests preserve the complete approved state; Save/Archive/Discard land in the correct recoverable state; Undo/recovery evidence is recorded. |
| V2-RQ-004 | Complete the approved main composer and translation/send pipeline. | SPEC-MC-01; SPEC-MC-02; SPEC-MC-03; SPEC-MC-04; SPEC-MC-05; SPEC-MC-06; SPEC-MC-07; SPEC-MC-08; SPEC-MC-09; SPEC-MC-10; SPEC-MC-11; SPEC-MC-12; SPEC-MC-13 | Critical | RQ-001; RQ-002; final managed-free acceptance also depends on RQ-010/RQ-011 | All ACC-SPEC-MC-* tests pass on the matching deployment, including disabled/loading/clarification/review/handoff/failure states, destination separation, persistence, and no silent paid spend. |
| V2-RQ-005 | Complete context ingestion, preview, inclusion, removal, and delivery. | SPEC-AC-01; SPEC-AC-02; SPEC-AC-03; SPEC-AC-04; SPEC-AC-05; SPEC-AC-06; SPEC-AC-07 | Critical | RQ-001 for protected URL fetching; RQ-004 for translation consumption | File/Paste Text/URL/Variable/Manage All/Preview/Context Snapshot acceptance tests pass; unique attached content demonstrably changes the prepared request or protected structured context. |
| V2-RQ-006 | Align State Detection values, recommendation choices, failure behavior, and continuation flow with approval. | SPEC-SD-02; SPEC-SD-03; SPEC-SD-04; SPEC-SD-05; SPEC-SD-06; SPEC-SD-07; SPEC-SD-08; SPEC-SD-09 | High | RQ-004; paid detection paths also depend on RQ-001/RQ-002 | Every detectable value and no-change/change/accept/keep/correct/dismiss/failure path passes; no recommendation is silently applied. |
| V2-RQ-007 | Complete AI-ready review, transparency, and explanation behavior. | SPEC-RV-01; SPEC-RV-02; SPEC-RV-03 | High | RQ-004; RQ-006 | Review is editable where approved; original/prepared/settings/route/changes are preserved; Why this worked uses real evidence rather than generic text. |
| V2-RQ-008 | Complete conversation-thread editing, branching, new-response signaling, and response continuity. | SPEC-CW-01; SPEC-CW-02; SPEC-CW-03; SPEC-CW-04; SPEC-CW-05; SPEC-CW-06 | High | RQ-004; RQ-007 | Edit/refine/branch-switch/new-response tests preserve originals, branch metadata, focus/scroll state, and recovery across reload. |
| V2-RQ-009 | Complete Debate, Consensus, and Synthesis as approved Multi-AI workflows. | SPEC-MA-01; SPEC-MA-02; SPEC-MA-03; SPEC-MA-04 | High | RQ-001; RQ-002; RQ-004 | Each Multi-AI action passes provider-selection, estimate/confirmation, progress/cancel, preserved-source, result-labeling, export, and failure tests. |
| V2-RQ-010 | Implement real web account identity and approved data-location behavior. | USR-ACCOUNT-01; SPEC-SE-09 | Critical | Server-side account/session service | Signup/login/session/signout and two-device continuity pass; data location is accurately disclosed; local work is not destroyed on signout. |
| V2-RQ-011 | Implement the server-enforced managed free translation allowance and reset ledger. | USR-ALLOW-01 | Critical | RQ-010; RQ-004 | Allowance decrements once per eligible managed translation, shares across devices, survives browser-data clearing, resets on the approved schedule, and fails closed at limit. |
| V2-RQ-012 | Replace manual plan/credit requests with real payment and entitlement flows. | USR-PLAN-01; USR-CREDIT-01 | Critical | RQ-010; RQ-002 | Test checkout/top-up success, cancel, failure, duplicate callback, entitlement update, balance reconciliation, and persistence across devices. |
| V2-RQ-013 | Consolidate approved screen routes and remove/retire obsolete duplicate destinations. | ROUTE-02; ROUTE-03; ROUTE-04; ROUTE-05; ROUTE-06; ROUTE-07; ROUTE-08; ROUTE-09; ROUTE-10; ROUTE-11; ROUTE-12; ROUTE-13; ROUTE-14; ROUTE-15 | High | Core destination definitions from locked Sections 3–9 | Every approved navigation/control lands on the exact approved screen; obsolete Home/Messages/Archive/duplicate Dashboard destinations are unreachable unless explicitly approved later. |
| V2-RQ-014 | Finish Sessions tabs, compact rows, archive action, active listing, and file import. | USR-SC-01; USR-SC-02; USR-SC-07; USR-SC-09 | High | RQ-003; RQ-013 | Mixed-state session dataset passes tab isolation, compact expansion, archive/load/rename/favorite/trash, search/filter, and JSON/TXT/MD import validation tests. |
| V2-RQ-015 | Correct remaining Quick Actions for Templates, Saved Prompts, Import, and session transitions. | SPEC-QA-03; SPEC-QA-04; SPEC-QA-08 | High | RQ-003; RQ-019 for Saved Tools semantics | Template and prompt actions preview/insert unsent; Import validates/previews supported files and preserves the active session on invalid input. |
| V2-RQ-016 | Correct top-bar controls and destinations. | SPEC-TB-01; SPEC-TB-02; SPEC-TB-03; SPEC-TB-04; SPEC-TB-05; SPEC-TB-06; SPEC-TB-07; SPEC-TB-08 | High | RQ-013; RQ-019 for Templates; RQ-022 for Settings/Profile portions | Logo/Quick Reference/Search/Templates/Notifications/Help/Settings/Profile each pass their permanent acceptance test with focus/back/persistence behavior. |
| V2-RQ-017 | Correct left navigation, All Tools, pinned tool, Trash, and real System Status. | SPEC-LN-02; SPEC-LN-03; SPEC-LN-04; SPEC-LN-05; SPEC-LN-06; SPEC-LN-07; SPEC-LN-08; SPEC-LN-09; SPEC-LN-10 | High | RQ-013; RQ-019/RQ-020/RQ-021/RQ-022 as relevant | Every left-nav and All Tools item opens the exact approved destination; pin/unpin persists; Trash is recoverable by type; health reflects real dependencies. |
| V2-RQ-018 | Fix approved keyboard shortcuts and prevent shortcuts from stealing normal typing. | KB-02; KB-03; KB-06; KB-08; KB-09 | High | RQ-013; Section 11 decisions must remain unresolved for KB-01/04/05/07 | All approved shortcut tests pass with typing-target protection; no hidden obsolete route is reachable. Undecided browser-reserved shortcuts remain outside this repair until the user decides. |
| V2-RQ-019 | Replace current Saved Tools model with approved Templates/Saved Prompts behavior and recoverable actions. | SPEC-ST-01; SPEC-ST-02; SPEC-ST-03; SPEC-ST-04; SPEC-ST-05 | High | RQ-003 for recoverability; RQ-013 | Create/edit/preview/use-or-insert/duplicate/favorite/delete/restore tests pass for both Templates and Saved Prompts; inserted content never auto-sends. |
| V2-RQ-020 | Correct right-rail card meanings, customization, real data, and fixed-budget behavior. | SPEC-RR-01; SPEC-RR-02; SPEC-RR-04; SPEC-RR-05; SPEC-RR-06; SPEC-RR-07; SPEC-RR-08; SPEC-RR-09; SPEC-RR-10; SPEC-RR-11 | Medium | RQ-004/RQ-005/RQ-010/RQ-011 supply truthful underlying data | Customize/order/pin/apply/cancel/reset, recent sessions/context/activity/usage/status/active-session/Quick Tools tests pass without document scroll. |
| V2-RQ-021 | Correct all six Quick Tools so each invokes the approved tool/route. | SPEC-QT-01; SPEC-QT-02; SPEC-QT-03; SPEC-QT-04; SPEC-QT-05; SPEC-QT-06 | Medium | RQ-013; RQ-019; RQ-020 | Each Quick Tool opens or performs the exact approved behavior and records any route override/transparency state required. |
| V2-RQ-022 | Rebuild Settings structure and wire missing/default controls, AI Connections, and Advanced-Control handoffs. | SPEC-SE-01; SPEC-SE-03; SPEC-SE-04; SPEC-SE-05; SPEC-SE-06; SPEC-SE-07; SPEC-SE-08; SPEC-SE-10; ADV-02; ADV-05 | High | RQ-010/RQ-011/RQ-012 for account/cost data; RQ-020 for rail defaults | Approved Settings sections open independently, remember last section, protect unsaved changes, expose all approved controls, manage connections, restore defaults, and persist defaults correctly. |
| V2-RQ-023 | Complete response Refine and Export workflows, including real save/failure behavior. | SPEC-RA-02; SPEC-RA-04; SPEC-RA-05; SPEC-RA-06 | Medium | RQ-008; export services | Refine presets/Custom create preserved branches; export scope/format/details/save/copy/failure behaviors pass without losing selections or source content. |
| V2-RQ-024 | Complete Personal Optimization background/validation/rollback behavior. | USR-OPT-01 | Medium | RQ-001; RQ-010; eligible conversation data | Opt-in/goal selection/eligible-data analysis/review/apply/persistence/rollback tests pass and ineligible data is excluded. |
| V2-RQ-025 | Export the complete restorable user dataset. | USR-DATA-01 | High | RQ-010; completed data models from sessions/Saved Tools/projects/settings | Export contains sessions/messages/templates/prompts/projects/settings/account metadata needed for restoration; round-trip restore/audit succeeds. |
| V2-RQ-026 | Remove the unapproved alternate layout selector and enforce the frozen visual authority. | SRC-VIS-01 | Medium | Section 7 visual contract | No user-facing alternate/original layout switch remains; light/dark retain the frozen shell; visual acceptance evidence matches Section 7 truth sources. |
| V2-RQ-027 | Provider registry, roster, Local-AI correction, and provider adapters | SPEC-PN-01; SPEC-PN-02; SPEC-PN-03; SPEC-PN-04; SPEC-PN-05; SPEC-PN-06; SPEC-PN-07; SPEC-PN-08; SPEC-PN-09; SPEC-PN-10; SPEC-PN-11; SPEC-PN-12; SPEC-PN-13; SPEC-PN-14 | Critical | Provider-neutral Meaning Packet/route architecture | Every SPEC-PN-* acceptance test passes; provider/model registry is refreshable, Fable remains under Claude, supported providers have valid adapter/fallback behavior, and Local AI/Ollama is removed from normal suggestions. |
| V2-RQ-028 | AI Connections: BYOK, licensed OAuth, companion, privacy, removal | SPEC-CN-01; SPEC-CN-02; SPEC-CN-03; SPEC-CN-04; SPEC-CN-05 | Critical | Provider registry; secure secret storage; connection manager | Every SPEC-CN-* acceptance test passes, including secret handling, external OAuth, optional companion policy, manual handoff privacy, and removal/revoke. |
| V2-RQ-029 | Translator option set and full Translate & Ask state machine | SPEC-TR-01; SPEC-TS-01; SPEC-TS-02; SPEC-TS-03; SPEC-TS-04; SPEC-TS-05; SPEC-TS-06; SPEC-TS-07; SPEC-TS-08; SPEC-TS-09 | Critical | Provider registry/connections; state detection; cost preflight; recovery save | Every SPEC-TR-* and SPEC-TS-* state is reachable under its precondition, preserves the draft, and never silently routes/spends. |
| V2-RQ-030 | Authoritative cost ledger, caps, top-up, receipts and idempotency | SPEC-CC-01; SPEC-CC-02; SPEC-CC-03; SPEC-CC-04; SPEC-CC-05; SPEC-CC-06; SPEC-CC-07; SPEC-CC-08; SPEC-CC-09 | Critical | Account/auth service; payment provider; provider execution authorization | Every SPEC-CC-* test passes with server-authoritative balance/reservations, no negative balance, idempotent execution/crediting, readable receipts, and fail-closed caps/top-up. |
| V2-RQ-031 | Resumable large-job orchestration | SPEC-LJ-01; SPEC-LJ-02; SPEC-LJ-03; SPEC-LJ-04 | High | Provider/cost infrastructure; persistence/checkpoint storage | Every SPEC-LJ-* test passes on a synthetic multi-batch corpus with interruption/resume, evidence preservation, bounded cost, quality audit, and final synthesis. |
| V2-RQ-032 | Explicit completion/evaluation gates | SPEC-EG-01; SPEC-EG-02; SPEC-EG-03; SPEC-EG-04; SPEC-EG-05 | High | Relevant feature families implemented | Every SPEC-EG-* gate has an executable registry entry and recorded result; unavailable live-only evidence is reported without erasing source defects. |
| V2-RQ-033 | Learnable Signal Patterns integration | SPEC-LS-01 | High | Learning store/engine and documented task specification | The task's documented signal hierarchy, degradation handling, learning loop and preference-routing acceptance criteria are resolved and tested. |
| V2-RQ-034 | Fable recommendation / prompt-translation integration | SPEC-FB-01 | High | Provider registry; Fable-under-Claude mapping | Fable placement and the tracked recommendation/translation task are separately resolved/tested according to their approved/task provenance. |
| V2-RQ-035 | Desktop/Windows scope accounting | SPEC-DS-01 | Medium | Web behavior stable first | Desktop platform requirements remain in the scope register and applicable Windows/Electron tests are run before desktop completion is claimed. |
| V2-RQ-036 | Mount and authorize the operator Developer domain | SPEC-DV-01; SPEC-DV-02 | High | Operator authentication/role boundary; V2-DQ-007 determines permanent placement | An authenticated operator can enter Developer Mode from the approved location; ordinary users cannot; normal user features do not depend on it. |
| V2-RQ-037 | Complete Developer async-testing workflow | SPEC-DV-03; SPEC-DV-04; SPEC-DV-05; SPEC-DV-06; SPEC-DV-07 | High | Operator Developer domain | Enable/disable, recoverable scenario switching, Preview Request, simulated completion, and reload recovery all pass without external AI calls where dry-run is intended. |
| V2-RQ-038 | Developer personal heavy-use goal | SPEC-DV-08 | High | Operator Developer domain; V2-DQ-006 for exact permanent strategy | Implement all noncontroversial infrastructure supporting the goal; only the strategy-dependent final routing/economic choice may remain decision-pending. |
| V2-RQ-039 | Documentation-governance completeness controls | SPEC-GV-01; SPEC-GV-02; SPEC-GV-03 | Critical | None | Future completeness audits independently enumerate authority sources first, apply scoped supersession, and reconcile denominator counts without circular proofs. |

## End condition

FIX ALL is not complete until:

- all **39** v2 repair groups were processed;
- every decided affected requirement conforms to the v2 Approved behavior;
- all available tests were run and implementation-caused failures were fixed;
- unresolved items are limited to the Decision Queue or narrowly identified external integration checks;
- no requirement was skipped because an old Contract called the area OUT_OF_SCOPE/BLOCKED/UNTESTED;
- `build` remains untouched;
- the final report names every changed file and separates implemented, tested, live-pending, external-pending and decision-pending states.

## Copy-paste command

```text
Use DIVERGENCE-AI-FIX-ALL-IMPLEMENTATION-AUTHORITY-v2.md as the controlling implementation instruction.
Implement every V2-RQ repair on the isolated cowork-complete-preview-20260823 branch.
Do not use Cowork's old RQ numbering and do not use the superseded v1 Contract/FIX ALL denominator.
Do not modify build.
Do not stop because live verification, CI, provider credentials, or a different decision item is unavailable.
Only an exact Decision Queue dependency may pause its own affected design choice; continue every unrelated repair.
After each repair group run all available relevant tests and fix regressions.
At the end report: Repair ID | implemented | files changed | tests run | pass/fail | live pending | external pending | decision pending.
```