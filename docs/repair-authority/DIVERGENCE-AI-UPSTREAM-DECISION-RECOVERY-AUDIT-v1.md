# DIVERGENCE.AI — UPSTREAM DECISION RECOVERY AUDIT v1

**Purpose:** Repair the failed completeness premise of the prior Site Contract by auditing the decision universe *before* auditing the Contract.

**Prior Site Contract status:** **SUPERSEDED AS A CLAIM OF COMPLETE DECISION COVERAGE.** It remains useful as a source/code comparison for the items it actually contains, but it is not safe to call a complete implementation authority until the omissions below are incorporated.

## Authority rule used

1. Explicit approved/user-set decisions control only the scope they actually decide.
2. Named frozen/canonical authorities control their stated scope.
3. An older approved decision remains valid until something with authority explicitly supersedes it.
4. Code/commits prove implementation history, not product approval.
5. Unresolved conflicts stay unresolved; timestamps do not choose the winner.
6. OUT_OF_SCOPE for ordinary user-site acceptance does **not** mean OMIT FROM THE DECISION RECORD.

## Evidence base actually checked

- `DIVERGENCE-AI-BRANCH-DECISION-LEDGER.md` — read in full, 721 lines; GitHub archaeology across surviving branches/PRs/commits.
- `DIVERGENCE-AI-COMPREHENSIVE-SPECIFICATION.md` — approved GREEN decision traceability and supersession table.
- `DIVERGENCE-AI-COLORED-DECISION-MAP.docx` — GREEN route source.
- `01-FROZEN-SPEC-v1.1-PROVIDER-NEUTRAL-AMENDMENT.md` — approved as part of Packet v1.
- `05-COST-CREDITS-FREE-FIRST-SPEC.md` — approved cost/free-first packet.
- Approval conversation showing explicit user `approved` for Packet v1 on 2026-08-14.
- `PENDING-INTEGRATIONS.md`, `BUILD-LOG.md`, `CANON.md`, `DECISIONS_LOG.md`, `DECISIONS_INDEX.md` and relevant GitHub history as implementation/decision-history evidence.
- `Claude-Cowork setup-20260823-0424.md` for later Developer/async-testing requirements and implementation history.
- Existing `DIVERGENCE-AI-SITE-CONTRACT.md` for coverage comparison.

## Recovered decision ledger

| ID | Domain | Recovered decision / requirement | Authority class | Provenance | Scope | Prior Contract disposition | Prior mapping | Required correction |
|---|---|---|---|---|---|---|---|---|
| DR-001 | Core workspace | Conversation-first workspace with real thread + persistent composer; controls support rather than replace the conversation. | LOCKED / APPROVED GREEN | DIVERGENCE-AI-COMPREHENSIVE-SPECIFICATION.md §4.1 decision 1, lines 1984-2023 | User site | PRESENT | SPEC-CW-* / SPEC-MC-* | Keep. |
| DR-002 | Directness | Supportive / Balanced / Blunt with one-line previews; Balanced default. | LOCKED / APPROVED GREEN | Comprehensive Spec §4.1 decision 2 | User site | PRESENT | SPEC-MC-04 / SPEC-SE-06 | Keep. |
| DR-003 | Technique | AI recommends one Technique, explains why, allows change/add; Auto recommend on; up to four selections. | LOCKED / APPROVED GREEN | Comprehensive Spec §4.1 decision 3 | User site | PRESENT | SPEC-MC-05 / SPEC-QT-02 | Keep. |
| DR-004 | Methodology | Standard / 3-State belongs in Advanced Controls; contextual suggestion only; may be pinned; never silently applied. | LOCKED / APPROVED GREEN | Comprehensive Spec §4.1 decision 4 | User site | PRESENT | SPEC-MC-09 / SPEC-MC-10 | Keep; later integration-task evidence must be reconciled separately. |
| DR-005 | State Detection | Runs after Translate & Ask; advisory; Accept & Continue / Keep Current & Continue / Correct / Dismiss; never silently changes controls. | LOCKED / APPROVED GREEN | Comprehensive Spec §4.1 decision 5 | User site | PRESENT | SPEC-SD-01..09 | Keep. |
| DR-006 | Add Context | One Add Context control: File, Paste Text, URL, Variable, Manage All; context chips and complete child flows. | LOCKED / APPROVED GREEN | Comprehensive Spec §4.1 decision 6 | User site | PRESENT | SPEC-AC-01..07 | Keep. |
| DR-007 | Primary send | Translate & Ask is single primary action; Review first initial default; remembered Review first / Send automatically preference. | LOCKED / APPROVED GREEN | Comprehensive Spec §4.1 decision 7 | User site | PRESENT | SPEC-MC-08 / SPEC-MC-11 / SPEC-RV-01 | Keep. |
| DR-008 | Quick Actions | 26px Quick Actions bar: New Session, Templates, Saved Prompts, conditional Resume, More; More contains Duplicate, Import, Finish Session; no Clear All. | LOCKED / APPROVED GREEN | Comprehensive Spec §4.1 decision 8 | User site | PRESENT | SPEC-QA-* | Keep. |
| DR-009 | Conversation / review | Branch-preserving conversation; editable AI-ready translation; plain-language Why this worked without private chain-of-thought. | LOCKED / APPROVED GREEN | Comprehensive Spec §4.1 decision 9 | User site | PRESENT | SPEC-CW-* / SPEC-RV-* | Keep. |
| DR-010 | Information architecture | Six outcome destinations: Talk to AI, Sessions, Saved Tools, Projects, Insights, Settings; searchable All Tools; optional pinned tool. | LOCKED / APPROVED GREEN | Comprehensive Spec §4.1 decision 10 | User site | PRESENT | SPEC-LN-* | Keep. |
| DR-011 | Topbar | Permanent global Search, Quick Reference, notifications, profile; contextual page actions only where relevant; Talk to AI uses Templates, Help, Settings. | LOCKED / APPROVED GREEN | Comprehensive Spec §4.1 decision 11 | User site | PRESENT | SPEC-TB-* | Keep. |
| DR-012 | Right rail | Compact 26px card headers; one concise card open; relevant suggestions; Customize controls visibility/order/pinning; Recent Sessions and Quick Tools optional/off initially. | LOCKED / APPROVED GREEN | Comprehensive Spec §4.1 decision 12 | User site | PRESENT | SPEC-RR-* | Keep. |
| DR-013 | Ordinary user complexity | Ordinary user site is one adaptive interface with Show advanced controls; no ordinary-user User/Developer mode choice is required. | LOCKED / APPROVED GREEN | Comprehensive Spec §4.1 decision 13 and §4.2 | Ordinary user site | PARTIAL | SPEC-MC-09..11 + SRC-DEV-01 | Keep this ordinary-user rule, but do NOT use it to erase a separate operator-only Developer Mode domain. |
| DR-014 | Export | Save Result with smart defaults, expandable details, trigger-derived scope, remembered format/details, safe failure recovery. | LOCKED / APPROVED GREEN | Comprehensive Spec §4.1 decision 14 | User site | PRESENT | SPEC-RA-04..06 | Keep. |
| DR-015 | Session lifecycle | Automatic recovery; Finish Session = Keep Active / Save / Archive / confirmed Discard; New Session offers Undo; no Clear All. | LOCKED / APPROVED GREEN | Comprehensive Spec §4.1 decision 15 | User site | PRESENT | SPEC-QA-02/09/10 | Keep. |
| DR-016 | Visual system | Gold/blue identity, muted marble, pale frosted glass, electric-blue active state, black outline icons, Low/Standard/High intensity, Reduced Motion. | LOCKED / APPROVED GREEN | Comprehensive Spec §4.1 decision 16 + frozen visual sources | User site visual | PRESENT | Section 7 + SPEC-SE-02..05 | Keep. |
| DR-017 | Provider-neutral routing | Destination AI and Translator Engine are separate choices and may change independently. | APPROVED PACKET v1 | 01-FROZEN-SPEC-v1.1-PROVIDER-NEUTRAL-AMENDMENT.md; packet explicitly approved 2026-08-14 | User site / backend | PRESENT | SPEC-MC-03 / ADV-01 / WF-19..21 | Keep. |
| DR-018 | Universal route | Any AI — Universal is a first-class no-key copy/open handoff and remains usable when APIs fail. | APPROVED PACKET v1 | Provider-neutral amendment; approval conversation 2026-08-14 | User site / backend | PRESENT | SPEC-MC-03 / WF-19 | Keep. |
| DR-019 | Provider roster | Provider hierarchy explicitly includes OpenAI/ChatGPT, Claude/Anthropic, Gemini, Grok, Copilot, Perplexity, DeepSeek, Mistral, Local AI/Ollama, Custom/Other plus Universal. | APPROVED PACKET v1 | Provider-neutral amendment + implementation checklist | User site / provider registry | NEEDS_ATOMIC_SPLIT | Mostly collapsed into SPEC-MC-03 and prose | Create permanent IDs for each provider family and provider availability/deprecation states. |
| DR-020 | Fable placement | Fable remains supported under Claude when present in the live registry; it is not a top-level provider. | APPROVED PACKET v1 | Provider-neutral amendment §7 | Provider registry | MISSING | none; the final Contract contains zero occurrences of `Fable` | Add an atomic Fable-under-Claude requirement and acceptance test. |
| DR-021 | Refreshable registry | Provider/model choices come from a refreshable registry/cache; stale/deprecated/unavailable states are explicit; deprecated models are never silently substituted. | APPROVED PACKET v1 | Provider-neutral amendment component states + acceptance tests | Provider registry | PARTIAL | SPEC-MC-03 / RR AI Status prose | Split registry refresh, staleness, deprecation, and substitution rules into permanent IDs. |
| DR-022 | Provider adapters | Compile provider-specific requests from the neutral Meaning Packet; adapters are separately testable. | APPROVED PACKET v1 | Approval packet implementation sequence | Backend | MISSING | No permanent Feature ID | Add adapter family + per-provider adapter acceptance tests. |
| DR-023 | Connection methods | Connection method is independently resolved: manual handoff, local runtime, BYOK provider API, licensed official account API, managed route. | APPROVED PACKET v1 | Provider-neutral amendment Translate & Ask terminal routes | User site / backend | PARTIAL | ADV-02 / WF-19/20 | Atomize each connection method and its state machine. |
| DR-024 | BYOK | Optional user-provided API connection; provider billing is separate; BYOK must not consume Divergence credits unless a separately disclosed fee was confirmed. | APPROVED PACKET v1 | Provider-neutral amendment + cost packet | Connections / cost | MISSING | No BYOK Feature ID; `BYOK` absent from Contract | Add BYOK setup/test/remove, payer, secret-storage, and cost acceptance rows. |
| DR-025 | Licensed account API | Official licensed/account API connection is allowed only when officially supported. | APPROVED PACKET v1 | Approval packet implementation sequence | Connections | MISSING | No permanent Feature ID | Add licensed connection state/action rows. |
| DR-026 | Browser companion | Optional browser companion is permitted only where provider rules permit; it is not a blanket automation mechanism. | APPROVED PACKET v1 | Approval packet implementation sequence | Connections | MISSING | `browser companion` absent | Add conditional browser-companion requirement and unsupported-provider behavior. |
| DR-027 | Manual account handoff privacy | Manual handoff never collects provider passwords, cookies, or MFA codes; external login opens in the system browser. | APPROVED PACKET v1 | Provider-neutral amendment acceptance tests | Security / connections | PARTIAL | SRC-SEC-01 is broader | Add explicit credential-prohibition and system-browser-login rows. |
| DR-028 | Response import | Manual handoff supports deliberate response import back into the conversation. | APPROVED PACKET v1 | Provider-neutral amendment terminal route / implementation sequence | User workflow | PRESENT | WF-19 / composer flow | Keep. |
| DR-029 | Translator Engine options | Advanced Controls order includes Methodology, Review before sending, Translator Engine, Connection summary/Manage, Paid fallback, request max-cost, Set as defaults; Translator options resolve Auto/free-first, Local Rules, Local AI if available, Destination one-pass, Managed paid. | APPROVED PACKET v1 | Provider-neutral amendment §2.4 and component states | User site | PARTIAL | ADV-01..05 | Restore exact option/state coverage; do not treat one current dropdown as full compliance. |
| DR-030 | Translate & Ask states | Primary action has explicit states: checking state, preparing, review request, confirm cost, copy/open, sending, waiting, import response, retry plus cancel/error states. | APPROVED PACKET v1 | Provider-neutral amendment §2.3 and §6 | User site | PARTIAL | SPEC-MC-08 and tests | Add atomic state coverage so a coding AI cannot claim one button handler satisfies all states. |
| DR-031 | AI Status truth | AI Status reports configured destinations/connections, health, route, registry freshness and plain-language error; Universal availability survives provider outage. | APPROVED PACKET v1 | Provider-neutral amendment RR-09 | Right rail | PARTIAL | SPEC-RR-09 | Split health, outage, stale-registry, auth/rate/quota states and refresh action. |
| DR-032 | Free-first routing | Every eligible request starts on the best available no-new-charge route; paid routes are not automatic. | APPROVED PACKET v1 / LOCKED COST | 05-COST-CREDITS-FREE-FIRST-SPEC.md + approval conversation | Cost / routing | PRESENT | Section 6 / SRC-COST-01 / WF-21/22 | Keep. |
| DR-033 | Paid fallback | Paid fallback begins OFF and requires explicit authorization within caps. | APPROVED PACKET v1 / LOCKED COST | Cost spec | Cost | PRESENT | ADV-03 / WF-22 | Keep. |
| DR-034 | Automatic top-up | Automatic top-up begins OFF; if enabled it has threshold, exact amount, monthly max, payment-method display, notifications, immediate disable and fail-closed behavior. | APPROVED PACKET v1 / LOCKED COST | Cost spec §§8.3,13 | Cost / settings | MISSING | Only prose mention; no permanent control ID | Add atomic auto-top-up control and state rows. |
| DR-035 | Cost preflight | Any possibly paid request shows payer, route, estimate, hard maximum, affordability/balance/cap, and no-new-charge alternative before explicit consent. | APPROVED PACKET v1 / LOCKED COST | Provider-neutral amendment + cost spec | Cost / send | PRESENT | SRC-COST-01 | Keep, but split constituent states if implementation instructions need atomicity. |
| DR-036 | Cost caps | Request, session, and monthly caps are enforced before execution; reaching a cap leaves no-charge/manual routes usable. | APPROVED PACKET v1 / LOCKED COST | Cost spec + provider-neutral RR-08 | Cost | PARTIAL | ADV-04 / RR-08 | Add session/month cap IDs and enforcement tests; current Contract centers mostly on per-request max. |
| DR-037 | Reservation / reconciliation | Paid authorization uses bounded reservation and reconciliation; unused reservation is released; uncertain usage remains pending rather than invented. | APPROVED PACKET v1 / LOCKED COST | Cost spec error/retry + receipt rules | Backend cost ledger | PARTIAL | reconciliation appears in prose/workflow only | Add reservation lifecycle, pending-usage and release Feature IDs. |
| DR-038 | Receipts | Each paid request produces an intelligible receipt with request/time, provider/model, translator, payer/category, price version, units, estimate/max, actual, released reservation and remaining caps. | APPROVED PACKET v1 / LOCKED COST | Cost spec §10.3 | Cost / UI | MISSING | `receipt` absent from Contract | Add receipt screen/action/storage/acceptance tests. |
| DR-039 | No negative balance | Concurrent paid requests cannot create a negative balance. | APPROVED PACKET v1 / LOCKED COST | Cost spec acceptance gates | Backend cost ledger | MISSING | No atomic requirement | Add concurrency invariant and test. |
| DR-040 | Idempotent paid execution | Duplicate clicks, webhooks and retries cannot duplicate charges or credits; duplicate click uses the same idempotency key. | APPROVED PACKET v1 / LOCKED COST | Cost spec §11/§13 | Backend / payment | MISSING | `idempotency` absent | Add idempotency invariant and retry tests. |
| DR-041 | Unknown cost truth | Unknown/provider-unreported cost must never be displayed as $0.00. | APPROVED PACKET v1 / LOCKED COST | Provider-neutral RR-08 + cost spec | Usage & Cost | PRESENT | SPEC-RR-08 | Keep. |
| DR-042 | Subscription vs credits | Subscription product benefits, included managed credits, and metered overage are separate and disclosed; provider subscriptions are never treated as Divergence API credits. | APPROVED PACKET v1 / LOCKED COST | Cost spec §9 | Plans / billing | PARTIAL | USR-PLAN-01 / USR-CREDIT-01 | Add separation/overage/cancellation semantics as atomic requirements. |
| DR-043 | Developer billing boundary | Developer Mode is unnecessary for production billing and cannot bypass production billing/cost controls. | APPROVED PACKET v1 / LOCKED COST | Cost spec acceptance gate + provider-neutral supersession table | Cross-scope boundary | WRONGLY_EXCLUDED | SRC-DEV-01 says Developer Mode is OUT_OF_SCOPE, losing this required cross-scope invariant | Keep Developer implementation separate, but add this boundary as a required production invariant. |
| DR-044 | Large-job processing | The approved packet requires resumable large-job processing: cheap structured workers, checkpoints, evidence references, stronger-model auditing, final synthesis, cost caps, and safe processing of ~900 conversations. | APPROVED PACKET v1 | Approval packet implementation sequence step 12 | Backend / advanced workflow | MISSING | none; `large-job` and `resumable` absent | Add a separate advanced-workflow family with checkpoint/resume/evidence/cost/quality acceptance tests. |
| DR-045 | Evaluation gates | Approval requires verification of frozen visuals, button/state behavior, meaning preservation, provider adapters, cost/concurrency, security/privacy, prompt injection, accessibility, ADHD-friction, crash recovery and historical-session migration. | APPROVED PACKET v1 | Approval packet implementation sequence step 13 | Verification | PARTIAL | Section 13 covers many feature/workflow tests but not all gate families as first-class registry groups | Add gate registry rows for missing security/prompt-injection/accessibility/ADHD/migration suites. |
| DR-046 | 3-State integration task | Repo history records 3-State Methodology as a real later feature with Define/Test/Stabilize, locked problem statement, self-critique and hallucination audit. | RECOVERED PRODUCT FEATURE + GREEN PLACEMENT | Branch Decision Ledger §§5.4,14; Comprehensive Spec GREEN decision 4 | Advanced user feature | PRESENT | SPEC-MC-10 / methodology workflow references | Keep; verify the full methodology semantics, not only selector existence. |
| DR-047 | Learnable signal integration | Repo task registry explicitly tracks Learnable Signal Patterns verification/integration for the learning loop and preference routing. | RECOVERED PROJECT TASK — NOT ERASED BY CODE | PENDING-INTEGRATIONS.md / commit history | Learning system | MISSING | No permanent Feature ID; `learning signal` absent | Add to decision/task register with authority state and acceptance criteria; do not silently call site complete while unresolved. |
| DR-048 | Fable recommendation/translation task | Repo task registry records Fable 5 model recommendation and prompt-translation work as a specific integration task. | RECOVERED PROJECT TASK — NEEDS AUTHORITY RECONCILIATION | PENDING-INTEGRATIONS.md / BUILD-LOG history | Model recommendation / translation | MISSING | No Fable or model-recommendation Feature ID | Add as tracked task. Fable provider placement is approved; exact special prompting behavior must retain its own provenance/decision status. |
| DR-049 | Session/template bulk operations | Historical mature branches implemented bulk session/template operations, but branch history alone does not make them canonical requirements. | IMPLEMENTATION EVIDENCE ONLY | Branch Decision Ledger feature history / commit history | User site | CORRECTLY_NOT_PROMOTED | none | Keep as implementation-history evidence unless an approved source is recovered; do not promote from code alone. |
| DR-050 | Desktop shell | Electron/Windows shell, local integration and installer work are real later expansions. | RECOVERED PRODUCT/PLATFORM HISTORY | Branch Decision Ledger + approval-packet implementation sequence | Desktop platform | MISSING_FROM_SCOPE_REGISTER | none | Add explicit desktop-platform decision/task register even if excluded from web acceptance. Out-of-scope must not mean invisible. |
| DR-051 | Ordinary user mode rule | Do not make normal users choose User Mode vs Developer Mode; ordinary controls and billing must work without Developer Mode. | LOCKED GREEN + APPROVED PACKET | Comprehensive Spec GREEN #13; cost/provider packet | Ordinary user site | PRESENT | SPEC-MC-09..11 + cost rules | Keep. |
| DR-052 | Operator Developer Mode domain | A separate operator/developer domain may exist without becoming the ordinary-user mode selector. Its behavior must still be documented if the project requires it. | RECOVERED LATER PRODUCT DOMAIN | Branch Decision Ledger §5.6 records genuine later idea; current user requires Developer Mode behavior; code contains WorkspaceModeBar/DevAdminPanel | Developer/admin | WRONGLY_EXCLUDED | SRC-DEV-01 only says OUT_OF_SCOPE | Replace single OUT_OF_SCOPE row with a full developer-domain ledger; retain OUT_OF_SCOPE only as relation to ordinary user-site acceptance. |
| DR-053 | Developer async testing family | Developer/testing workflow must allow rapid iteration without waiting for an AI response: multiple draft slots/queue, preserved draft/context/routing, preview/dry-run, reload recovery and rapid switching. | EXPLICIT USER-REQUESTED FEATURE FAMILY; IMPLEMENTED EXPERIMENT EXISTS | Claude-Cowork setup 2026-08-23: user request + subsequent Async Testing implementation | Developer/admin | MISSING | no `Async Testing`, `Draft Queue`, `Preview Request`, or `Mark Sent` in Contract | Add permanent Developer IDs for the feature family. Exact shortcuts/slot count stay implementation details unless explicitly approved. |
| DR-054 | Developer personal/heavy-use goal | Developer Mode was explicitly requested to support personal heavy-use AI operation in addition to testing, with strong cost minimization and high-capability routing. The request exists even though the final implementation design was not yet locked. | EXPLICIT USER REQUIREMENT — DESIGN NOT FULLY LOCKED | Claude-Cowork setup 2026-08-23 user request | Developer/admin | MISSING | none | Record as an unresolved-but-required Developer goal; do not invent a cost-bypass method or silently call it finished. |
| DR-055 | Developer cost-optimization design | Design work proposed hard cost controls, free-first smart routing, response caching, UI rate limiting and usage transparency for Developer Mode. | PROPOSED DESIGN / PARTLY IMPLEMENTED — NOT AUTOMATIC AUTHORITY | Claude-Cowork setup 2026-08-23 design | Developer/admin | MISSING | none | Track each as PROPOSED/IMPLEMENTED until explicitly approved; do not erase them and do not promote them to locked product behavior without approval. |
| DR-056 | Developer visibility/reachability | If Developer Mode is part of the project, its entry point must be reachable by the intended operator; dead/unmounted developer components cannot count as implemented. | DERIVED ACCEPTANCE REQUIREMENT | Current code/preview discovery: WorkspaceModeBar and DevAdminPanel existed but were not mounted/reachable in the deployed Cowork preview | Developer/admin | MISSING | SRC-DEV-01 excluded evaluation | Add reachability/mounting acceptance tests and operator-auth state behavior. |
| DR-057 | Decision recovery prerequisite | The exhaustive GitHub branch decision audit was explicitly identified as a prerequisite before implementation; the decision map was not to be assumed comprehensive until that audit was complete. | RECOVERED PROCESS REQUIREMENT | 2026-08-14 conversation + Branch Decision Ledger | Documentation governance | MISSING_FROM_FINAL_AUDIT_LOGIC | Final Contract claimed universe completeness from its own inventory | Make upstream decision-universe coverage a mandatory gate before any 100% completeness claim. |
| DR-058 | Authority resolution | Approved decision-ledger entries outrank recovered canonical behavior; mature code fills only unsettled behavior; images govern visuals/placement; unapproved experiments do not become requirements. | RECOVERED AUTHORITY RULE | Branch Decision Ledger §23 | Documentation governance | PARTIAL | Contract had a hierarchy but later text incorrectly simplified it to latest correction wins | Replace any 'latest wins' shortcut with explicit-scope supersession + conflict handling. |
| DR-059 | No circular completeness | 156/156 control coverage does not prove all approved decisions were recovered; completeness denominator must come from audited authority sources, not from the generated Contract inventory itself. | CORRECTION REQUIRED BY THIS AUDIT | Failure exposed by Developer Mode and approval-packet omissions | Documentation governance | MISSING | old Sections 3/15/19 | Invalidate old global completeness claims and recalculate only after decision recovery. |

## Audit totals

- Recovered decision/task domains recorded: **59**
- Rows exposing a Contract coverage defect or required split: **34**
- `CORRECTLY_NOT_PROMOTED`: **1**
- `MISSING`: **17**
- `MISSING_FROM_FINAL_AUDIT_LOGIC`: **1**
- `MISSING_FROM_SCOPE_REGISTER`: **1**
- `NEEDS_ATOMIC_SPLIT`: **1**
- `PARTIAL`: **12**
- `PRESENT`: **24**
- `WRONGLY_EXCLUDED`: **2**

## Concrete proof the old completeness claim failed

- Existing Contract occurrences of `Fable`: **0**.
- Existing Contract occurrences of `BYOK`: **0**.
- Existing Contract occurrences of `browser companion`: **0**.
- Existing Contract occurrences of `receipt`: **0**.
- Existing Contract occurrences of `idempotency`: **0**.
- Existing Contract occurrences of `large-job`: **0**.
- Existing Contract occurrences of `Async Testing`: **0**.
- Existing Contract occurrences of `Draft Queue`: **0**.
- Existing Contract occurrences of `Preview Request`: **0**.
- Existing Contract occurrences of `Mark Sent`: **0**.

Those zero-count checks do not by themselves define authority. They demonstrate that approved/recovered concepts identified by the authority audit were not even represented in the purportedly complete Contract.

## Developer Mode correction

The prior Contract's single `SRC-DEV-01 = OUT_OF_SCOPE` row is not sufficient.

The corrected interpretation is:

- **Ordinary user site:** the approved GREEN design remains one adaptive interface with `Show advanced controls`; ordinary users do not need to choose a User/Developer mode.
- **Billing/provider behavior:** Developer Mode must never be required to use normal billing/provider controls and must never bypass production billing safeguards.
- **Developer/operator domain:** if retained for the project, its requirements must be documented independently even though it is excluded from ordinary user-site acceptance.
- **Async testing:** the later requested/implemented feature family must be tracked: parallel/recoverable drafts, preview/dry-run, recovery, rapid switching. Exact implementation details that were never explicitly approved remain implementation evidence, not automatic product law.
- **Heavy-use personal Developer goal:** this is a recorded user requirement that still needs a final approved design; omission is not an acceptable resolution.

## What this audit invalidates

The following prior claims are withdrawn:

- `156/156` as proof that every approved product decision was recovered.
- `190/190` as proof that every required feature/workflow had an acceptance test.
- the statement that the Site Contract was globally complete/safe as a standalone implementation authority.
- any `FIX ALL` instruction whose universe is limited to the old 26 Repair Queue groups.

Those numbers remain arithmetic facts about the old Contract's own inventory, nothing more.

## Required next production step

Rebuild the canonical Contract denominator from this recovered authority set plus the full approved packet, then regenerate Feature IDs, conflicts, repairs, acceptance tests, evidence, and traceability. The old Contract must be treated as an input to that rebuild, not as the authority that defines what exists.

## Audit verdict

**FAIL — THE PRIOR SITE CONTRACT IS NOT SAFE AS A COMPLETE DECISION/IMPLEMENTATION AUTHORITY.**

**PASS — this upstream audit successfully establishes concrete missing/incorrectly-scoped decision families that the rebuild must include.**