# DIVERGENCE Master System-and-Requirement Blueprint

**Status:** Proposed authoritative control package—pending independent audit and user approval.  
**Purpose:** Tell any AI what the entire DIVERGENCE reliability layer must accomplish, which system owns each responsibility, what each system must contain, how work is sequenced, and what evidence is required before anything may be called complete.  
**This is not:** implementation, proof that any product system works, permission to redesign the existing interface, or permission to enter GitHub.

## How every AI must use this package

1. Read `01-UNIVERSAL-AI-CONSTITUTION.md`.
2. Read `02-MASTER-SYSTEM-AND-REQUIREMENT-BLUEPRINT.md` and `03-CROSS-CUTTING-OWNERSHIP.md`.
3. Read only the active standalone task contract and its direct dependencies.
4. Restate the intended outcome, deliverables, exclusions, and consequential ambiguities before substantial work.
5. Perform one bounded task; maintain continuity records; self-check every requirement; retain failures.
6. Submit important work to an independent adversarial audit. Do not self-declare independent verification.

## Project-control stages outside S01–S20

### G0 — AI Course-Control Gate

**Purpose:** Mechanically keep all authorized AIs on the active task without requiring the user to remember or police the work.  
**Must contain:** repository/branch verification; one active task; allowed-file enforcement; prerequisite locks; no unauthorized branches; protected integration and immutable safety branch; required tests/evidence/records; append-only history; valid statuses; rejection of self-declared verification; failure retention; exact handoff; provider-neutral access for authorized GPT/Claude workers.  
**Exit:** local and repository checks pass; GitHub non-bypass rules are active; another AI completes a cold-start continuity trial; the user explicitly unlocks F0.  
**Current state:** Controller and reusable branch flow are Self-check passed; GitHub rulesets and cold-start independent trial remain Open.

### F0 — Foundation Contract and Interface Skeleton

**Purpose:** Define shared ownership, identifiers, schemas at the conceptual-contract level, authority boundaries, evidence semantics, conflict resolution, and I01–I20 before separate foundation designs.  
**Must contain:** complete I01–I20 definitions; four dependency types; S02/S03/S18/S20 ownership boundaries; permitted gate statuses; evidence meaning; authority rules and unresolved authority questions; FCIS-G01–G06; failure conditions; exact four-package sequence and reconciliation contract.  
**Excludes:** implementation technology, production code, UI pixels, provider selection, and implementation claims.

### F1 — Foundation Reconciliation

**Purpose:** Reconcile the separately designed S02, S03, S18, and S20 packages without allowing any to silently take another's authority.  
**Exit:** interfaces agree; conflicts are resolved or explicitly Open; all foundation gates have adequate evidence; downstream contracts are versioned and independently auditable.

## Mandatory dependency meanings

- **Design prerequisite:** an accepted upstream contract must exist before the dependent design begins.
- **Co-design dependency:** bounded interfaces require iterative alignment; this never erases a design prerequisite.
- **Runtime input:** information consumed during operation after designs exist.
- **Validation dependency:** evidence or an evaluator required to qualify the design or implementation.

## Corrected near-term sequence

1. Finish G0 GitHub enforcement.
2. Conduct the independent cold-start gate trial.
3. Obtain explicit user authorization to activate F0.
4. Execute F0 only.
5. Design S02, S03, S18, and S20 as four separate bounded packages using F0.
6. Execute F1 reconciliation.
7. Continue in dependency-valid waves; design before implementation and verify each implementation through the real user workflow.

## Required system-design waves

Every design prerequisite visibly precedes its dependent design. Later behavioral reconciliation may be co-design, but it cannot retroactively satisfy a prerequisite.

| Wave | Focus | Work | Owners | Exit condition |
|---|---|---|---|---|
| W0 | G0 enforcement | Finish GitHub rules and cold-start audit | G0 | Gate enforced; user unlocks F0 |
| W1 | F0 | Define foundation contracts and interfaces | F0 | FCIS-G01–G06 accurately reported |
| W2A | Four bounded foundation packages | Design S02, S03, S18, S20 separately | Four system owners | Each package self-checks against F0 |
| W2B | F1 reconciliation | Reconcile ownership, interfaces, evidence, authority | F1 | Accepted versioned foundation |
| W3A | Meaning and state | Design S01 and S14 | S01, S14 | Accepted intent/requirement boundary and cold-resume contract |
| W3B | Task policy | Design S04 only after W3A boundary is accepted | S04 | Task-risk-resource-authority contract accepted |
| W4A | Capability and cost foundations | Design S05; align S17 inputs with accepted S04/S05 | S05, S17 | Eligible capability and resource-contract skeletons |
| W4B | Routing | Design and accept S06 route skeleton | S06 | Hard-filter/route/override/fallback contract accepted |
| W4C | Compilation/adapters | Design and accept S07 adapter skeleton using S06 | S07 | Provider-neutral equivalence contract accepted |
| W4D | Orchestration | Design S08 only after accepted S06/S07 skeletons | S08 | Dependency-safe bounded workflow contract |
| W5A | Research and action | Design S09 and S11 | S09, S11 | Evidence and execution-result inputs accepted |
| W5B | Claim control | Design S10 using S09 | S10 | Accepted claim/evidence/uncertainty skeleton |
| W5C | Artifact verification | Design S12 using S10/S11 | S12 | Accepted real-workflow verification skeleton |
| W5D | Independent challenge | Design S13 only after accepted S10/S12 skeletons | S13 | Independence, minority-report, and stopping contract |
| W6A | Accessible core interaction | Design S16 core without assuming personalization | S16 | Low-burden outcome/status/repair contract |
| W6B | Personalization | Design S15 within S16/S18 truth and consent boundaries | S15 | Reversible contextual preference contract |
| W6C | UX reconciliation | Reconcile S15/S16 runtime interfaces | S15, S16 | Personalization cannot weaken truth, safety, or accessibility |
| W7 | Operational resilience | Design S19 across accepted interfaces | S19 | Health, drift, incident, and recovery contracts |
| W8 | Integrated qualification | S20-led end-to-end design qualification | S20 + independent auditor | Scoped implementation planning may be proposed |

## Interface registry

| ID | Route | Contract | Complete definition |
|---|---|---|---|
| I01 | S01 → S02 | Intent Contract | Versioned objective, subgoals, assumptions, confidence, confirmation and invalidation; S02 alone creates requirement IDs. |
| I02 | S02 → all | Project Contract | Requirements, exclusions, questions, decisions, status, owners, gates, and completion semantics; consumers cannot mutate it silently. |
| I03 | S03 → all | Authority/Provenance Contract | Controlling source, conflicts, versions, actors, freshness, locators, and lineage. |
| I04 | S04 → S05/S06/S08/S11/S17/S18 | Task-Risk Contract | Task type, consequence, reversibility, hard constraints, action tier, control level, and resource envelope. |
| I05 | S05 → S06/S07 | Eligible Capability Set | Current eligible candidates, evidence, version, constraints, expiry, health, and declared fallback losses. |
| I06 | S06 → S07/S08 | Route Contract | Selected model/tool/connection, tradeoffs, override, fallback ladder, and audit record. |
| I07 | S07 → S08/S09/S10/S11 | Compiled Work Package | Provider-ready instructions plus immutable goal/requirements/evidence/tool/output controls and adapter-loss record. |
| I08 | S08 → S09/S11/S13 | Bounded Work Package | Scope, inputs, output, owner, authority, dependencies, budget, checkpoint, gates, and stop condition. |
| I09 | S09 → S10/S13 | Evidence Record Set | Source, locator, context, dates, support direction, limitations, search/rejection/missing log, and coverage state. |
| I10 | S10 → S12/S16 | Verified Claim Set | Accepted/narrowed/rejected/unknown claims, evidence, contradictions, type, and calibrated uncertainty. |
| I11 | S11 → S12 | Execution Result | Exact target, before/after, observed side effects, errors, rollback state, artifacts, and execution evidence. |
| I12 | S12 → S08/S14/S20 | Verification Decision | Passed/failed/blocked/Not-assessed gates, environment, evidence, defects, and completion eligibility. |
| I13 | S13 → owners/S20 | Challenge Record | Counterexamples, assumption failures, correlation/independence, minority findings, resolutions, and stopping record. |
| I14 | S14 ↔ all | State/Resume Manifest | Authoritative snapshot, checkpoint, exact next task, idempotency, retention, and portable import/export state. |
| I15 | S15 → S06/S07/S16 | Consented Preference Contract | Contextual preference, evidence, confidence/counterevidence, scope, override, version, and expiry/rollback. |
| I16 | S16 → S01/S02/S15/S19 | Correction/Burden Signal | Corrected meaning/requirement/preference, repeated failure, abandonment, density, and repair outcome. |
| I17 | S17 → S04/S06/S08/S13 | Resource Contract | Estimate range, assumptions, authorized cap, actual meter, retry/fan-out limit, and variance. |
| I18 | S18 → S04/S05/S06/S07/S11/S14 | Security/Privacy Policy Decision | Allowed/denied data/tool/provider flows, consent, retention, secrets, isolation, and action authority. |
| I19 | S19 → S05/S06/S08/S17/S20 | Health/Incident Decision | Health/drift threshold, disqualification, degradation/fallback, containment, recovery proof, and corrective proposal. |
| I20 | S20 → all | Qualification/Change Decision | Applicable tests/gates, approved baseline, release/exception status, version, rollback, and post-release monitor. |

## Normalized problem registry

| ID | Problem | Full definition | Required outcome | Owner |
|---|---|---|---|---|
| N01 | Intent distortion and objective substitution | The system identifies or pursues a different objective from the user's actual intended outcome. | O01 — The intended outcome is restated, preserved, and challengeable before consequential work. | S01 / S01.4–S01.6 |
| N02 | Requirement, scope, exclusion, and success drift | Requirements disappear, change meaning, or are replaced by an easier definition of completion. | O02 — Every active requirement, exclusion, dependency, and success condition remains traceable. | S02 / S02.1–S02.7 |
| N03 | Ambiguity, assumption, and clarification mismanagement | The system guesses consequential details or transfers harmless decisions back to the user. | O01/O07 — Ask only when the answer materially changes risk or outcome; otherwise use a visible reversible default. | S01 / S01.3; S04 / S04.2 |
| N04 | Correction and instruction-replacement failure | Later corrections, replacements, and explicit disconfirmation do not supersede stale interpretations. | O02/O06 — Corrections become versioned controlling changes and downstream work is revalidated. | S02 / S02.5; S03 / S03.3 |
| N05 | Fabricated or unsupported facts, evidence, capability, and inspection claims | The system creates claims that are not supported by an observed source, tool result, or verified capability. | O03/O11 — Every externally checkable claim is grounded, labeled, or withheld. | S10 / S10.1–S10.6 |
| N06 | Confidence and uncertainty miscalibration | Tone or numeric confidence does not match evidence strength, contradiction, or model uncertainty. | O03 — Confidence is evidence-relative, decomposed, and never hidden by fluent prose. | S10 / S10.3–S10.5 |
| N07 | Evidence, citation, and source-claim mismatch | A source is weak, irrelevant, untraceable, or does not entail the claim attached to it. | O03/O11 — Claims link to exact supporting evidence with source quality and limitations visible. | S09 / S09.3–S09.6; S10 / S10.2 |
| N08 | Freshness, source quality, and date-context failure | The system uses stale, secondary, or misdated information without checking whether currency matters. | O03 — Time-sensitive facts are verified against appropriate current primary sources and event dates. | S09 / S09.2–S09.7; S05 / S05.3 |
| N09 | Incomplete, biased, or prematurely stopped research | Search scope, evidence collection, and stopping rules favor the first acceptable narrative. | O04 — Research records coverage, counterevidence, rejected sources, gaps, and a bounded stopping reason. | S09 / S09.1–S09.7; S13 / S13.3 |
| N10 | Inference, causal, and narrative overreach | Valid observations are combined into an unsupported causal or generalized conclusion. | O03 — Fact, inference, causal claim, possibility, and speculation remain separate and testable. | S10 / S10.1–S10.5; S13 / S13.3 |
| N11 | Incomplete, irrelevant, or non-actionable answer | The answer omits requested parts, substitutes explanation for action, or does not enable the user's next step. | O02/O07 — The delivered result covers the request at the requested action level and states the next usable step. | S02 / S02.3; S12 / S12.5 |
| N12 | Planning, prioritization, feasibility, and bottleneck failure | The route ignores constraints, dependencies, tradeoffs, or the actual limiting factor. | O08 — Work is ordered by dependency and risk, with feasibility and bottlenecks tested before commitment. | S08 / S08.1–S08.7; S04 / S04.3 |
| N13 | Implementation, artifact, integration, and runtime mismatch | A plan, mock, code fragment, isolated component, or document is mistaken for a working user-facing result. | O05 — Completion requires a real end-to-end path in the intended environment. | S12 / S12.1–S12.6 |
| N14 | Verification, test, and completion-evidence insufficiency | Inspection, mocks, or narrow tests are presented as proof of the full claim. | O05/O11 — Each completion claim names the test, environment, result, and retained evidence. | S12 / S12.2–S12.6; S20 / S20.2 |
| N15 | Regression, destructive replacement, and maintainability damage | A change breaks working behavior, violates boundaries, or creates brittle duplicate artifacts and debt. | O05/O09 — Changes preserve approved behavior, minimize blast radius, and remain reversible. | S11 / S11.4–S11.6; S20 / S20.4 |
| N16 | Authority, version, provenance, actor, and ownership confusion | The wrong source, version, branch, producer, or owner controls a decision or artifact. | O02/O11 — Authority, lineage, supersession, actor, and ownership are explicit and conflict-resolved. | S03 / S03.1–S03.6; S20 / S20.4 |
| N17 | Status, completeness, and limitation misrepresentation | The system overstates what is done, implemented, inspected, saved, or verified. | O05/O06 — Status is exact: proposed, designed, implemented, verified, blocked, or Not assessed. | S02 / S02.7; S12 / S12.5 |
| N18 | Dependency, access, capability, credential, and environment mismatch | Work assumes resources or abilities that are unavailable, unverified, or outside the authorized environment. | O08/O09 — Required dependencies and access are proven before they become load-bearing. | S04 / S04.3–S04.5; S05 / S05.2 |
| N19 | Context, memory, summary, and cross-session continuity loss | Instructions, decisions, evidence, or current state vanish or mutate across long work and handoffs. | O06/O11 — Authoritative state survives compaction, session, provider, and account boundaries. | S14 / S14.1–S14.7 |
| N20 | Workflow state, checkpoint, resume, repetition, and action-log failure | Completed, active, pending, blocked, and failed work is not reliably recorded or resumed. | O06 — The system can resume exactly without repeating completed work or losing unfinished work. | S14 / S14.2–S14.7; S08 / S08.5 |
| N21 | Communication clarity, directness, and cognitive-overload failure | The response is too long, buried, vague, repetitive, jargon-heavy, or hard to act on. | O07 — The outcome and next action are visible first, with detail progressively disclosed. | S16 / S16.1–S16.7 |
| N22 | Choice overload, decision transfer, and personalization error | The system gives too many options, avoids a recommendation, or applies an unsuitable universal preference. | O07/O09 — Objective defaults are made safely; subjective choices remain with the user; preferences are contextual and reversible. | S15 / S15.1–S15.6; S16 / S16.2 |
| N23 | Frustration, correction, and trust-repair failure | The system responds performatively to frustration without fixing and proving the underlying defect. | O07 — Repair begins with the defect, changed behavior, and verification; acknowledgment stays brief. | S16 / S16.5 |
| N24 | Cost, latency, retry, and resource surprise | The route consumes more money, tokens, calls, or time than expected or useful. | O10 — The user sees the relevant estimate, cap, tradeoff, and actual usage before surprise occurs. | S17 / S17.1–S17.7 |
| N25 | User agency, authorization, and safety-boundary failure | The system acts without permission, over-refuses harmless work, or hides the user's effective control. | O09 — Authority is explicit, least-privileged, reversible where possible, and proportionate to actual risk. | S11 / S11.1–S11.6; S18 / S18.4 |
| N26 | Portability, export, independent audit, and lock-in failure | State, evidence, decisions, or artifacts cannot be moved, reused, or independently checked. | O11 — Work products and provenance are exportable in durable, provider-neutral forms. | S14 / S14.4–S14.7; S03 / S03.6 |
| N27 | Privacy, security, prompt-injection, and data-governance gap | Untrusted content, secrets, personal data, or tools can cross boundaries without consent, isolation, retention, or audit controls. | O09/O12 — Data and tool boundaries are explicit, consented, minimized, and resistant to adversarial instructions. | S18 / S18.1–S18.7 |
| N28 | Provider, model, tool, policy, and service drift gap | Capabilities, behavior, availability, limits, or terms change after a route was designed or validated. | O12 — Eligibility depends on fresh capability proof, health, policy, and regression status. | S05 / S05.1–S05.5; S19 / S19.2–S19.5 |
| N29 | Accessibility, interface, and workflow-fit gap | The control surface, sensory behavior, information density, or interaction sequence blocks the user even when the underlying answer is correct. | O07 — The interface is accessible, low-friction, and adaptable without silently inferring unsupported preferences. | S16 / S16.1–S16.7; S15 / S15.1 |
| N30 | Governance, decision ownership, and change-control gap | No durable mechanism determines who may approve, change, retire, or exception a reliability rule. | O11/O12 — Every rule, gate, exception, and release has an owner, authority, evidence, and rollback path. | S20 / S20.1–S20.7 |
| N31 | Downstream harm: bad decisions, broken work, lost time/evidence/trust | The user experiences practical, cognitive, financial, or trust harm from upstream reliability failures. | O12 — Harm is prevented by upstream controls, detected quickly, contained, and learned from. | S19 / S19.1–S19.6; all upstream systems |
| N32 | Responsibility inversion and dependence without assurance | The user becomes the memory, project manager, verifier, router, and error-correction mechanism for the AI. | O07/O12 — The layer carries workflow and assurance burden while keeping value-sensitive authority with the user. | S08 / S08.1–S08.7; S16 / S16.2 |

# Complete system contracts

## S01 — Request Interpretation and Intent Contract

**Plane:** Control plane  
**Purpose:** Convert messy or ambiguous input into a versioned, user-correctable contract without erasing the raw message or answering prematurely.  
**Required outcome:** A downstream worker receives the same intended objective, scope, and confidence the user accepted or safely allowed.  
**Owned normalized problems:** N01, N03, N04, N23  
**Current source coverage:** Existing translation and Meaning Packet proposals partly cover this; no complete authority/invalidation contract is established.

### Scope

Intent extraction; raw-input preservation; ambiguity classification; confidence; proposed restatement; confirmation and correction; meaning-delta checks.

### Exclusions

Answering the task; choosing models; research; long-term personalization; low-level prompt text.

### Mandatory subsystems

- **S01.1 — Raw Input Vault:** Immutable original message and attachments with actor/time lineage.
- **S01.2 — Goal and Outcome Extractor:** Candidate primary goal, dependent subgoals, exclusions, and requested action level.
- **S01.3 — Ambiguity and Assumption Analyzer:** Separates consequential ambiguity from safe reversible defaults.
- **S01.4 — Intent Contract Builder:** Versioned self-contained restatement linked to raw input.
- **S01.5 — Confirmation and Correction Gate:** Routes only value/risk/irreversible ambiguity to the user; accepts corrections.
- **S01.6 — Meaning Delta and Invalidation Monitor:** Detects drift and invalidates affected downstream state.

### Contracts and authority

- **Inputs:** Raw message; conversation context; explicit preferences; attachments; task/risk hints.
- **Outputs:** Intent Contract ID/version; raw-input link; goal/subgoal set; assumptions; uncertainty; confirmation state; invalidation event.
- **Interfaces:** Feeds S02 and S04; receives contextual authority from S03 and correction events from S16; emits invalidation to S08/S14.
- **Dependencies:** S03 authority/provenance rules; S16 correction experience; S20 evaluation corpus.
- **Exclusive authority:** Owns the meaning of the current request until S02 converts it to requirements. It may not silently change the user's objective.
- **Decisions this design must resolve:** Confidence thresholds; ambiguity severity; reversible-default criteria; when confirmation is mandatory; invalidation radius.

### Design obligations

- **Alternatives to compare:** Single-pass translation; multi-pass interpretation; deterministic wrapper; user-first confirmation; hybrid confidence gate.
- **Research required:** Meaning-preservation evidence; ambiguity taxonomies; accessibility of confirmation; correlated model error; multilingual and figurative-language cases.
- **Deliverables:** Boundary specification; intent-contract schema requirements (conceptual, not database); decision table; interface contracts; test corpus plan; failure/recovery playbook.
- **Evidence required:** Version/delta logs; annotated meaning corpus; ambiguity decision records; downstream invalidation trace; user correction replay.
- **Known risks:** Overconfident paraphrase; user fatigue from review; multiple equally valid goals; cultural/linguistic variation; hidden conflict between message and prior context.

### Acceptance gates

- **G-S01-01:** Every intent contract traces to unaltered raw input and identifies assumptions.
- **G-S01-02:** High-consequence ambiguity cannot proceed without explicit resolution; harmless reversible ambiguity does not create needless questions.
- **G-S01-03:** Corrections create a new version and invalidate all affected downstream work.

### Failure gates

- **FG-S01-01:** Any test changes the user's objective while scoring itself acceptable.
- **FG-S01-02:** A correction leaves stale work eligible for delivery.

### Standalone assignment seed

Design S01 as a provider-neutral control system. Start from N01/N03/N04/N23 and O01. Preserve raw input, build a versioned intent contract, classify ambiguity by consequence and reversibility, and require user review only where it materially changes outcome or risk. Define S01.1–S01.6, interfaces to S02/S03/S04/S08/S14/S16, authority and invalidation rules, alternatives, evidence, and recovery. Do not write final prompts or implementation schemas. Deliver the conceptual specification, test corpus plan, and proof for G-S01-01 through G-S01-03; stop if FG-S01-01 or FG-S01-02 occurs.
## S02 — Requirements, Questions, Decisions, and Completion Ledger

**Plane:** Control plane  
**Purpose:** Maintain one authoritative, versioned record of what must be true, what is excluded, what is decided, what remains unknown, and what completion means.  
**Required outcome:** No requirement, dependency, question, or difficult acceptance condition becomes orphaned or silently disappears.  
**Owned normalized problems:** N02, N04, N11, N16, N17  
**Current source coverage:** Meaning Packet, sessions, and readiness documents cover fragments; a unified requirement/decision/status ledger is missing.

### Scope

Requirements; exclusions; success criteria; decision records; question classification; status; replacements; coverage and orphan checks.

### Exclusions

Task execution; source collection; model routing; UI project management beyond the contract.

### Mandatory subsystems

- **S02.1 — Requirement Registry:** Atomic, stable IDs for requirements, exclusions, constraints, and dependencies.
- **S02.2 — Question Queue:** Separates evidence-answerable, design, product-preference, authority, risk, cost, and UX questions.
- **S02.3 — Success and Deliverable Contract:** Defines artifact, action level, acceptance evidence, and user outcome.
- **S02.4 — Decision Register:** Records choice, authority, rationale, alternatives, date, and affected requirements.
- **S02.5 — Change and Supersession Manager:** Applies explicit replacements and preserves history.
- **S02.6 — Coverage and Orphan Auditor:** Finds uncovered, duplicated, conflicting, or ownerless requirements.
- **S02.7 — Completion State Machine:** Exact proposed/designed/implemented/verified/blocked/Not-assessed states.

### Contracts and authority

- **Inputs:** Intent Contract; authority register; source findings; designer decisions; evidence and test events.
- **Outputs:** Versioned project contract; decision/question registers; coverage matrix; exact status; completion eligibility.
- **Interfaces:** Authoritative input to S04/S08/S12/S20; synchronized checkpoints to S14; conflict escalation to S03.
- **Dependencies:** S01 intent contract; S03 authority; S12 verification evidence.
- **Exclusive authority:** Owns requirement identity, decision history, and completion semantics. It does not own substantive source truth or test execution.
- **Decisions this design must resolve:** Atomicity rules; replacement vs refinement; who may close which question; evidence threshold for status transitions; conflict precedence.

### Design obligations

- **Alternatives to compare:** Single ledger; linked specialized registers; event-sourced contract; document-only matrix; graph-backed requirement network.
- **Research required:** Requirements engineering methods; traceability usability; status ontology; human approval burden; safe automated question closure.
- **Deliverables:** Ledger specification; status model; question-routing rules; traceability contract; orphan/duplication audit; acceptance suite.
- **Evidence required:** Ledger snapshots/diffs; orphan and duplicate reports; decision authority records; status-transition evidence; traceability export.
- **Known risks:** Excessive granularity; duplicate owners; decision churn; unclear human authority; ledger becoming a new cognitive burden.

### Acceptance gates

- **G-S02-01:** Every active requirement has an owner, downstream assignment, acceptance gate, and status.
- **G-S02-02:** Replaced instructions cannot remain controlling, while history remains auditable.
- **G-S02-03:** Completion is impossible while any load-bearing requirement is failed, blocked, unassessed, or orphaned.

### Failure gates

- **FG-S02-01:** A requirement can disappear through summary, merge, or status transition.
- **FG-S02-02:** The system reports complete with a failed or unevidenced gate.

### Standalone assignment seed

Design S02 as the authoritative project contract for N02/N04/N11/N16/N17 and O02/O05/O11. Define the seven subsystems, stable requirement/decision/question/status identities, replacement rules, coverage/orphan audits, and evidence-gated completion. Integrate S01/S03/S04/S08/S12/S14/S20. Keep it conceptual and provider-neutral; do not choose a database. Deliver the ledger and interface specification, governance rules, audit plan, and proof for G-S02-01 through G-S02-03. Any disappearing requirement or unsupported completion triggers the failure gates.
## S03 — Context, Source, Authority, and Provenance Management

**Plane:** Control plane  
**Purpose:** Inventory inputs, resolve which source controls, preserve lineage, and bind every derived claim or artifact to its origin and version.  
**Required outcome:** Contradictions become explicit decisions instead of silent source selection; another person can reconstruct why each requirement exists.  
**Owned normalized problems:** N04, N07, N08, N16, N19, N26, N30  
**Current source coverage:** Prior sources contain competing authority rules. START-HERE resolves some repo conflicts; this task exposes unresolved cross-source conflicts.

### Scope

Source inventory; authority hierarchy; conflict register; version/freshness; actor/tool lineage; provenance and export.

### Exclusions

Research conclusions; model choice; file storage implementation; organization-wide records policy.

### Mandatory subsystems

- **S03.1 — Source Inventory:** Stable IDs, type, location, version/hash, access, review status, and limitations.
- **S03.2 — Authority and Applicability Registry:** Authority level, scope, approval state, and controlling conditions.
- **S03.3 — Conflict and Supersession Resolver:** Explicit competing claims, decision owner, resolution, and downstream impact.
- **S03.4 — Freshness and Version Monitor:** Event/publication dates, expiry, deprecation, and required refresh.
- **S03.5 — Actor and Tool Lineage:** Who or what produced, inspected, transformed, approved, or verified an item.
- **S03.6 — Provenance and Portable Manifest:** Claim/artifact lineage export with stable locators and checksums.

### Contracts and authority

- **Inputs:** Files, links, tool results, conversation instructions, repository state, policy and approval records.
- **Outputs:** Source/authority/conflict registers; provenance graph; freshness alerts; controlling-source decisions; portable manifest.
- **Interfaces:** Provides authority to S01/S02/S09/S10/S11/S20; receives new sources from S09 and artifact events from S11/S12/S14.
- **Dependencies:** S02 decision rights; S18 data classification; S20 change governance.
- **Exclusive authority:** Owns source identity, authority metadata, conflict visibility, and lineage. It must not decide unresolved product preference without the authorized owner.
- **Decisions this design must resolve:** Authority ladder; scope-specific precedence; conflict materiality; source expiry; acceptable locators/hashes; cross-provider identity.

### Design obligations

- **Alternatives to compare:** Flat register; authority matrix; provenance graph; content-addressed manifest; hybrid register plus graph.
- **Research required:** Provenance standards; document/repo identity; conflict resolution methods; source retention/privacy; portable evidence packaging.
- **Deliverables:** Source contract; authority/conflict method; provenance/manifest specification; freshness policy; reconciliation and export tests.
- **Evidence required:** Source inventory export; hash/version records; conflict decision log; freshness tests; lineage reconstruction exercise.
- **Known risks:** Authority disputes; inaccessible sources; mutable web content; privacy in provenance; false precision from hashes without semantic review.

### Acceptance gates

- **G-S03-01:** Every controlling requirement cites an inventoried source and applicable authority decision.
- **G-S03-02:** No material contradiction is silently resolved by recency, file title, model preference, or implementation convenience.
- **G-S03-03:** A portable manifest reconstructs source, actor, transformation, decision, artifact, and verification lineage.

### Failure gates

- **FG-S03-01:** Two sources simultaneously control the same disputed decision without an explicit rule.
- **FG-S03-02:** A claim or artifact lacks reproducible origin/version information.

### Standalone assignment seed

Design S03 for N04/N07/N08/N16/N19/N26/N30 and O02/O03/O11. Define source, authority, conflict, freshness, actor-lineage, and portable-manifest subsystems. Resolve scope-specific precedence without assuming newest automatically wins. Integrate all evidence and artifact systems, preserve unresolved authority questions for the user, and forbid provenance-free completion. Deliver a conceptual contract and reconstruction tests proving G-S03-01 through G-S03-03; trigger failure on dual authority or unreproducible lineage.
## S04 — Task, Risk, Resource, and Authority Policy

**Plane:** Control plane  
**Purpose:** Classify the request by task, consequence, reversibility, evidence need, data sensitivity, and resource envelope before selecting methods or tools.  
**Required outcome:** The system applies proportionate controls and asks the user only for decisions that cannot be safely inferred or reversed.  
**Owned normalized problems:** N03, N12, N18, N24, N25, N32  
**Current source coverage:** Proposed routing and threat documents cover pieces; no single preflight policy unifies consequence, reversibility, access, and budget.

### Scope

Task profile; consequence/risk tier; action authority; data sensitivity; evidence class; budget/latency envelope; escalation policy.

### Exclusions

Provider scoring; detailed threat controls; billing; actual execution; product-specific safety policy content.

### Mandatory subsystems

- **S04.1 — Task Profile Classifier:** Research, build, solve, creative, administrative, mixed, and long-job characteristics.
- **S04.2 — Consequence and Reversibility Assessor:** Harm, uncertainty, affected parties, reversibility, and blast radius.
- **S04.3 — Dependency and Resource Preflight:** Access, tools, environment, time, cost, and evidence availability.
- **S04.4 — Action Authority Policy:** Observe, propose, reversible act, external act, destructive/irreversible act.
- **S04.5 — Data and Provider Constraint Profile:** Privacy, residency, retention, terms, and provider exclusions.
- **S04.6 — Control-Level Selector:** Required verification, human review, model diversity, and rollback strength.
- **S04.7 — Escalation and Exception Gate:** Who decides exceptions and what evidence is required.

### Contracts and authority

- **Inputs:** Intent/requirements; user/account policy; data classification; dependency probes; budget preference; provider capability status.
- **Outputs:** Task-Risk Contract; hard constraints; control level; allowed actions/providers; review/escalation obligations; resource envelope.
- **Interfaces:** Constrains S05/S06/S08/S11/S17/S18; reports unresolved user decisions to S02; receives incident updates from S19.
- **Dependencies:** S01/S02 contracts; S03 authority; S17 budget data; S18 privacy/security policy.
- **Exclusive authority:** Owns preflight classification and control strength. It cannot grant authority the user or policy has not provided.
- **Decisions this design must resolve:** Risk taxonomy; thresholds; reversibility tests; evidence classes; exception authority; default budgets; mixed-task decomposition.

### Design obligations

- **Alternatives to compare:** Single scalar risk score; rule matrix; case-based policy; layered hard filters plus scored controls.
- **Research required:** High-stakes domain standards; human-factors cost of confirmations; reversible-action design; jurisdiction/provider constraints.
- **Deliverables:** Task-Risk Contract specification; policy decision tables; escalation map; preflight test suite; exception governance.
- **Evidence required:** Classification fixtures; constraint-invariance tests; action-tier simulations; escalation records; user-burden study.
- **Known risks:** Risk underclassification; confirmation fatigue; conflicting jurisdictional rules; missing dependency data; false sense of safety from a scalar score.

### Acceptance gates

- **G-S04-01:** Every request has a task/risk/resource/authority contract before routing or action.
- **G-S04-02:** Hard privacy, capability, permission, and cost constraints cannot be traded away by a higher quality score.
- **G-S04-03:** User review occurs for consequential value/authority decisions, not for routine safe defaults.

### Failure gates

- **FG-S04-01:** A destructive/external action is classified as routine without proof.
- **FG-S04-02:** A scoring system overrides a hard constraint.

### Standalone assignment seed

Design S04 for N03/N12/N18/N24/N25/N32 and O08/O09/O10. Produce a provider-neutral preflight policy that classifies task, consequence, reversibility, access, evidence, data, budget, and action authority. Keep hard constraints separate from scored preferences. Define seven subsystems and interfaces to S01/S02/S03/S05/S06/S08/S11/S17/S18/S19. Deliver decision tables and tests proving G-S04-01 through G-S04-03; any unauthorized action or hard-filter override fails the design.
## S05 — Provider, Model, and Tool Capability Registry

**Plane:** Control plane  
**Purpose:** Maintain fresh, evidence-backed capability and eligibility records for every selectable provider, model, tool, and connection mode.  
**Required outcome:** Routing never relies on a model name, marketing claim, stale memory, or unproven feature.  
**Owned normalized problems:** N08, N18, N28  
**Current source coverage:** The approval packet proposes a detailed registry. Current repository routing is provider-specific and its product strings may age.

### Scope

Canonical identities; version/capability evidence; connection modes; constraints; health; evaluation eligibility; expiry and deprecation.

### Exclusions

Selecting the route; buying credits; provider implementation internals; permanent claims about changing products.

### Mandatory subsystems

- **S05.1 — Identity and Version Registry:** Stable provider/model/tool/version aliases and deprecation lineage.
- **S05.2 — Capability and Constraint Evidence:** Context, modality, tools, files, structured output, privacy, limits, and terms.
- **S05.3 — Freshness and Health Monitor:** Source refresh, status, outage, latency, price, and policy change.
- **S05.4 — Capability Test Harness:** Live/fixture proofs for claimed behavior and connection mode.
- **S05.5 — Auto-Eligibility Controller:** Minimum evidence, regression status, expiry, and disqualification.
- **S05.6 — Fallback Compatibility Map:** Substitution limits, lossy capabilities, and data/format compatibility.

### Contracts and authority

- **Inputs:** Official provider data; observed probes; evaluation results; connection configuration; incident and cost data.
- **Outputs:** Versioned registry snapshot; eligible candidate set; capability evidence; expiry/health state; fallback compatibility.
- **Interfaces:** Supplies hard candidates to S06 and adapter constraints to S07; receives evaluations from S20, prices from S17, incidents from S19, policy from S18.
- **Dependencies:** S03 provenance; S18 provider policy; S20 test governance.
- **Exclusive authority:** Owns factual capability/eligibility state, not task preference scoring or user routing choice.
- **Decisions this design must resolve:** Capability ontology; test freshness; minimum proof; unsupported/unknown handling; alias stability; failover compatibility.

### Design obligations

- **Alternatives to compare:** Static catalog; provider-reported registry; probe-derived registry; hybrid official-source plus empirical eligibility.
- **Research required:** Current provider documentation/terms; standardized capability probes; model versioning; outage and deprecation patterns.
- **Deliverables:** Registry contract; evidence hierarchy; refresh/deprecation policy; probe suite; eligibility/fallback rules; audit view.
- **Evidence required:** Registry snapshots; official-source locators; probe transcripts; eligibility decisions; deprecation/fallback simulations.
- **Known risks:** Rapid product churn; expensive probes; provider-reported ambiguity; regional differences; version aliases changing under the same name.

### Acceptance gates

- **G-S05-01:** Every auto-eligible candidate has current, source-linked, task-relevant capability proof.
- **G-S05-02:** Unknown, expired, failed, or policy-incompatible capabilities are ineligible by default.
- **G-S05-03:** Fallback mappings declare every capability or assurance lost in substitution.

### Failure gates

- **FG-S05-01:** A model/tool is routed because of its name or an unverified claim.
- **FG-S05-02:** An expired or failed candidate remains silently eligible.

### Standalone assignment seed

Design S05 for N08/N18/N28 and O03/O08/O12. Define canonical identity, capability evidence, freshness/health, probe, eligibility, and fallback subsystems. Auto eligibility must expire and fail closed on unknown required capability. Integrate S03/S06/S07/S17/S18/S19/S20. Do not hard-code today's model roster as permanent architecture. Deliver registry and evaluation requirements proving G-S05-01 through G-S05-03; model-name routing and silent stale eligibility are failure conditions.
## S06 — Routing, Escalation, and User Override

**Plane:** Control plane  
**Purpose:** Choose an eligible model/tool execution route that balances expected quality, risk, cost, latency, privacy, independence, and recoverability while preserving user control.  
**Required outcome:** The best available route for this task is selected transparently; the user can override preferences without bypassing hard safety/capability constraints.  
**Owned normalized problems:** N12, N18, N22, N24, N25, N28, N32  
**Current source coverage:** Detailed routing proposals and a Claude-specific implemented scorer exist, but the provider-neutral selection policy is proposed/unresolved.

### Scope

Hard filtering; task-fit scoring; task-risk hybrid choice; recommendation/override; diversity; reroute; explanation and fallback.

### Exclusions

Capability truth; provider adapters; execution orchestration; billing implementation; user preference learning.

### Mandatory subsystems

- **S06.1 — Candidate Hard Filter:** Applies capability, privacy, policy, budget, access, and health constraints.
- **S06.2 — Multi-Objective Route Scorer:** Quality, task fit, cost, latency, reliability, and recoverability.
- **S06.3 — Task-Risk Choice Policy:** Auto/recommend/review behavior based on consequence and uncertainty.
- **S06.4 — Recommendation and Override Surface:** Clear recommendation, reason, tradeoffs, and permitted override.
- **S06.5 — Independence and Diversity Selector:** Avoids false confidence from correlated models/sources.
- **S06.6 — Reroute, Escalation, and Fallback:** Retry limits, stronger/different route, provider failure, and downgrade disclosure.
- **S06.7 — Routing Decision Record:** Candidates, exclusions, scores, override, route, and observed outcome.

### Contracts and authority

- **Inputs:** Task-Risk Contract; eligible registry candidates; cost/latency data; user preferences; execution outcome history.
- **Outputs:** Route contract; selected model/tool/connection; required adapter; fallback ladder; explanation; override and routing audit record.
- **Interfaces:** Consumes S04/S05/S15/S17/S18/S19; directs S07/S08; returns route outcomes to S05/S19/S20.
- **Dependencies:** S04 task/risk policy; S05 eligible registry; S17 cost; S18 privacy/policy.
- **Exclusive authority:** Owns route selection among eligible candidates. User owns subjective provider choice; hard constraints remain system/policy authority.
- **Decisions this design must resolve:** Scoring weights; automatic thresholds; diversity definition; when override is blocked; paid escalation; tie-breaking; fallback disclosure.

### Design obligations

- **Alternatives to compare:** Always user; always layer; recommendation+override; task-risk hybrid; single provider; portfolio/ensemble.
- **Research required:** Empirical task-model quality; cognitive load of choice; provider independence; cost/latency distributions; user trust and override behavior.
- **Deliverables:** Routing policy; scorer requirements; override contract; fallback/escalation rules; explanation standard; evaluation matrix.
- **Evidence required:** Candidate/exclusion log; score sensitivity tests; choice-mode usability tests; fallback/outage simulation; override and outcome audit.
- **Known risks:** Bad scoring proxies; model monoculture; price/latency volatility; user distrust of opaque auto choice; expensive over-routing; unsafe override semantics.

### Acceptance gates

- **G-S06-01:** Hard filters run before any preference score and record every excluded candidate.
- **G-S06-02:** Default behavior is the task-risk hybrid: recommendation/auto routing with user override, plus mandatory review only at defined consequential gates.
- **G-S06-03:** Every fallback, downgrade, paid escalation, or diversity choice is visible and recoverable.

### Failure gates

- **FG-S06-01:** A cheaper/faster/higher-scoring route violates capability, privacy, permission, or policy.
- **FG-S06-02:** The layer silently chooses or changes a consequential route without a record or permitted override.

### Standalone assignment seed

Design S06 for N12/N18/N22/N24/N25/N28/N32 and O08/O09/O10/O12. Compare the four mandatory selection modes, then specify the selected task-risk hybrid: hard filters, multi-objective scoring, recommendation and permitted override, independence, reroute/fallback, and audit record. Use S04/S05/S17/S18 constraints and feed S07/S08. Prove G-S06-01 through G-S06-03 with sensitivity, outage, and user-burden evidence. Any hard-filter override or silent consequential route change fails.
## S07 — Instruction Compilation and Provider Adapters

**Plane:** Execution plane  
**Purpose:** Translate the canonical request/task contracts into provider-appropriate instructions and output obligations without changing meaning or weakening controls.  
**Required outcome:** Different providers receive equivalent intent, constraints, evidence rules, and output contracts, with adapter differences visible and tested.  
**Owned normalized problems:** N01, N02, N05, N18, N28  
**Current source coverage:** The proposed Universal Prompt Compiler is detailed; repository pipeline is Claude-specific. Provider-neutral approval remains unresolved.

### Scope

Canonical meaning packet; deterministic local rules; technique/directness/method selection; provider adapters; output contract; injection boundary.

### Exclusions

Provider selection; source truth; final prompts for every task; execution; user-interface pixels.

### Mandatory subsystems

- **S07.1 — Canonical Work Packet:** Provider-neutral goal, requirements, evidence, authority, risk, outputs, and gates.
- **S07.2 — Deterministic Control Compiler:** Non-negotiable local rules and tool boundaries.
- **S07.3 — Method, Technique, and Communication Compiler:** Task-appropriate method and user-fit constraints.
- **S07.4 — Provider/Tool Adapter:** Capability-aware translation into destination controls and roles.
- **S07.5 — Output and Tool Contract Binder:** Required structure, claim evidence, tool permissions, and status fields.
- **S07.6 — Meaning/Control Equivalence Validator:** Detects adapter loss, conflict, injection, and unsupported settings.

### Contracts and authority

- **Inputs:** Intent/requirement/task-risk/route contracts; user communication settings; provider capabilities; security policy.
- **Outputs:** Executable provider instruction package; declared losses/unsupported features; output/tool contract; equivalence record.
- **Interfaces:** Consumes S01/S02/S04/S05/S06/S15/S16/S18; supplies S08/S09/S10/S11; evaluation by S20.
- **Dependencies:** S01/S02 canonical contracts; S05 capability data; S18 trust boundaries.
- **Exclusive authority:** Owns faithful compilation and adapter behavior, never the underlying intent, requirement, route, or provider capability facts.
- **Decisions this design must resolve:** Canonical packet fields; deterministic vs model-generated boundaries; adapter loss policy; prompt-injection isolation; output contract strictness.

### Design obligations

- **Alternatives to compare:** Universal wrapper; native provider adapters; tool-specific planners; retrieval-augmented templates; compiled hybrid.
- **Research required:** Provider instruction semantics; tool-call formats; system/user precedence; prompt-injection research; cross-provider meaning equivalence.
- **Deliverables:** Canonical packet specification; compiler boundary; adapter requirements; equivalence suite; failure/fallback contract.
- **Evidence required:** Cross-adapter golden cases; field coverage/delta; unsupported-feature fixtures; injection suite; provider-version regression record.
- **Known risks:** Prompt semantics change; provider-specific hidden behavior; oversized packets; loss of nuance; adapter sprawl; injection via retrieved content.

### Acceptance gates

- **G-S07-01:** Adapter output preserves every load-bearing goal, requirement, exclusion, authority, and evidence rule.
- **G-S07-02:** Unsupported provider features produce an explicit loss or reroute, never silent omission.
- **G-S07-03:** Untrusted source content cannot rewrite system/tool authority through the compiled package.

### Failure gates

- **FG-S07-01:** Equivalent input produces a materially different objective or weakened gate across adapters.
- **FG-S07-02:** A source instruction crosses the trust boundary and gains tool/system authority.

### Standalone assignment seed

Design S07 for N01/N02/N05/N18/N28 and O01/O02/O03/O12. Define a canonical work packet, deterministic controls, method/communication compilation, provider adapters, output/tool contracts, and equivalence validation. Preserve authority and isolate untrusted content. Integrate upstream contracts and downstream execution/research/verification. Deliver conceptual adapter and test requirements, not a prompt collection or code. Prove G-S07-01 through G-S07-03; semantic drift or authority injection fails.
## S08 — Planning, Decomposition, and Workflow Orchestration

**Plane:** Execution plane  
**Purpose:** Convert the project contract into dependency-aware, resumable work packages and coordinate execution, replanning, and bounded stopping.  
**Required outcome:** Complex work progresses without losing the whole outcome, duplicating work, or making the user manually manage agents and steps.  
**Owned normalized problems:** N02, N09, N11, N12, N18, N20, N32  
**Current source coverage:** Long-job orchestration proposal is detailed for large jobs; a general cross-mode orchestration contract is not approved.

### Scope

Task decomposition; dependency graph; work packages; scheduling; concurrency; checkpoints; progress; replanning; stop/continue decisions.

### Exclusions

Substantive research/build methods; model capability truth; persistent storage implementation; release governance.

### Mandatory subsystems

- **S08.1 — Outcome and Dependency Graph:** Links outcomes, requirements, evidence, tasks, gates, and critical path.
- **S08.2 — Work Package Designer:** Bounded inputs, outputs, authority, budget, gate, and handoff for each unit.
- **S08.3 — Scheduler and Concurrency Controller:** Orders work by dependency/risk and parallelizes only independent units.
- **S08.4 — Worker Contract Manager:** Assigns route, method, evidence, and stop conditions without dual authority.
- **S08.5 — Progress, Checkpoint, and Idempotency Coordinator:** Exact state and replay-safe execution.
- **S08.6 — Replanner and Escalation Manager:** Responds to failed assumptions, blocked dependencies, and new evidence.
- **S08.7 — Bounded Completion Controller:** Stops only after coverage/gates/audit converge; prevents endless polishing.

### Contracts and authority

- **Inputs:** Project contract; task-risk/route contracts; capability/budget state; evidence/work outcomes; checkpoint events.
- **Outputs:** Dependency graph; ordered work packages; execution schedule; progress/status; checkpoints; replan decisions; completion candidate.
- **Interfaces:** Consumes S02/S04/S06/S07/S14/S17/S18; orchestrates S09–S13; completion checked by S12/S20; incidents to S19.
- **Dependencies:** S02 contract; S04 policy; S06 routes; S14 durable state.
- **Exclusive authority:** Owns workflow ordering and coordination, not substantive task conclusions, requirements, or acceptance authority.
- **Decisions this design must resolve:** Granularity; concurrency limits; retry/replan thresholds; worker independence; critical-path changes; bounded stopping definition.

### Design obligations

- **Alternatives to compare:** Single agent loop; DAG workflow; supervisor/worker; event-driven orchestration; human-managed checklist; durable hybrid.
- **Research required:** Long-running workflow reliability; correlated worker errors; idempotency; human interruption; ADHD-friendly progress surfaces.
- **Deliverables:** Orchestration boundary; work-package contract; dependency/status model; retry/replan/stop policy; failure and resume simulations.
- **Evidence required:** Dependency/orphan audit; work-package samples; crash/retry simulations; replan log; bounded-stopping audit; user progress comprehension test.
- **Known risks:** Bad decomposition; over-orchestration; cascading retries; false parallel independence; hidden critical path; supervisor becoming a bottleneck.

### Acceptance gates

- **G-S08-01:** Every work package has bounded scope, inputs, outputs, owner, authority, dependencies, budget, gate, and checkpoint.
- **G-S08-02:** No task starts before hard dependencies and required authority are satisfied; independent work may run concurrently.
- **G-S08-03:** The workflow stops only when no unresolved critical omission, contradiction, broken dependency, or untraceable requirement remains.

### Failure gates

- **FG-S08-01:** A worker silently changes the project contract or duplicates another owner's authority.
- **FG-S08-02:** A crash/retry repeats a consequential action or loses completed evidence.

### Standalone assignment seed

Design S08 for N02/N09/N11/N12/N18/N20/N32 and O02/O04/O06/O08. Specify a dependency-aware durable orchestrator with bounded work packages, safe concurrency, exact progress, idempotent checkpoints, replanning, and bounded stopping. It must reduce user management burden without taking product authority. Integrate S02/S04/S06/S07/S09–S14/S17–S20. Deliver contracts and simulations proving G-S08-01 through G-S08-03; dual authority or non-idempotent recovery fails.
## S09 — Research and Evidence Acquisition

**Plane:** Execution plane  
**Purpose:** Plan and perform complete-enough, source-appropriate, recorded evidence collection for fact-finding and evidence-bearing tasks.  
**Required outcome:** The system can show what it searched, why sources were selected/rejected, what remains missing, and why search stopped.  
**Owned normalized problems:** N07, N08, N09, N10, N14  
**Current source coverage:** Approval research/evaluation documents contain methods, but the product lacks one unified research protocol in approved authority.

### Scope

Research question; query strategy; source hierarchy; acquisition; extraction; source log; recency; missing/rejected evidence; stopping.

### Exclusions

Final truth judgment; model routing; user preference research; private data access without authorization.

### Mandatory subsystems

- **S09.1 — Research Question and Evidence Target:** Claim/question scope and evidence that would resolve uncertainty.
- **S09.2 — Query and Coverage Planner:** Terminology, perspectives, domains, dates, and disconfirming searches.
- **S09.3 — Source Hierarchy and Selection:** Primary/secondary fit, authority, recency, and accessibility.
- **S09.4 — Acquisition and Extraction:** Captures needed evidence rather than link-only handoff.
- **S09.5 — Search, Rejection, and Missing-Evidence Log:** Queries, results, rejections, gaps, and access failures.
- **S09.6 — Evidence Record Builder:** Claim candidate, excerpt/locator, context, date, limitations, and provenance.
- **S09.7 — Coverage and Stopping Auditor:** Breadth, counterevidence, saturation, time/budget, and residual uncertainty.

### Contracts and authority

- **Inputs:** Research questions; source/access policy; task-risk contract; route/budget; existing source inventory.
- **Outputs:** Evidence records; source/search/rejection/missing logs; coverage report; residual uncertainties; stopping decision.
- **Interfaces:** Consumes S02/S03/S04/S06/S07/S17/S18; supplies S10/S13; persists through S14; evaluated by S20.
- **Dependencies:** S03 provenance/authority; S04 evidence/risk; S18 access/data policy.
- **Exclusive authority:** Owns acquisition coverage and source records, not final claim acceptance or product decisions.
- **Decisions this design must resolve:** Source hierarchy per domain; search breadth; primary-source exceptions; excerpt/context needs; stopping thresholds; inaccessible evidence handling.

### Design obligations

- **Alternatives to compare:** Single-search pass; iterative query expansion; systematic review; federated search; human-curated source set; risk-tiered hybrid.
- **Research required:** Domain-specific source standards; search engine bias; paywall/access limits; recency; multilingual sources; reproducible search methods.
- **Deliverables:** Research protocol; evidence record; search log; source hierarchy; coverage/stopping rules; benchmark tasks.
- **Evidence required:** Reproducible query log; source-quality matrix; evidence records; disconfirmation results; coverage/stopping audit; rerun comparison.
- **Known risks:** No finite exhaustiveness proof; inaccessible primary sources; search personalization; changing web; excessive research cost; evidence overload.

### Acceptance gates

- **G-S09-01:** Each research task defines the question and evidence needed to resolve or narrow it before collection.
- **G-S09-02:** Sources are selected by domain authority and relevance; counterevidence and rejected/missing evidence are recorded.
- **G-S09-03:** Stopping cites coverage, saturation, residual uncertainty, risk, and budget—not the first acceptable answer.

### Failure gates

- **FG-S09-01:** The final research answer cannot reproduce its search/source path.
- **FG-S09-02:** A material disconfirming source is ignored without a recorded reason.

### Standalone assignment seed

Design S09 for N07/N08/N09/N10/N14 and O03/O04/O11. Define the question/evidence target, query coverage, source hierarchy, acquisition/extraction, full search/rejection/missing log, evidence records, and bounded stopping. Integrate authority, risk, budget, security, verification, and persistence. Deliver a provider-neutral research method and benchmarks proving G-S09-01 through G-S09-03. Unreproducible search or silently ignored counterevidence fails.
## S10 — Claim, Evidence, Contradiction, and Uncertainty Control

**Plane:** Assurance plane  
**Purpose:** Evaluate every material claim against its evidence, claim type, alternatives, contradictions, freshness, and uncertainty before delivery.  
**Required outcome:** Unsupported certainty is blocked; facts, inferences, possibilities, speculation, and unknowns remain distinguishable.  
**Owned normalized problems:** N05, N06, N07, N08, N10, N14  
**Current source coverage:** Confidence gates and evaluation proposals exist, but no complete claim registry/entailment/contradiction authority is approved.

### Scope

Claim registry; evidence binding; entailment; contradiction; inference-chain challenge; calibration; abstention/correction.

### Exclusions

Evidence acquisition; task execution; source authority decisions; user-facing communication styling.

### Mandatory subsystems

- **S10.1 — Claim Registry and Typing:** Stable claim IDs; fact, inference, causal, prediction, recommendation, possibility, speculation.
- **S10.2 — Evidence Binding and Entailment:** Exact sources, locators, support direction, limitations, and strength.
- **S10.3 — Contradiction and Alternative Detector:** Source conflicts, counterexamples, competing explanations, and minority findings.
- **S10.4 — Inference and Causal-Chain Auditor:** Checks every link and required evidence class.
- **S10.5 — Confidence, Abstention, and Labeling:** Calibrated language and thresholds tied to evidence/risk.
- **S10.6 — Correction and Recovery Controller:** Retracts, narrows, refreshes, or escalates failed claims.

### Contracts and authority

- **Inputs:** Candidate claims; evidence records; source authority/freshness; task risk; adversarial findings; evaluation calibration.
- **Outputs:** Accepted/narrowed/rejected/unknown claim set; evidence links; contradiction record; confidence/labels; correction actions.
- **Interfaces:** Consumes S03/S04/S09/S13/S20; gates outputs from S11/S12; communication through S16; incidents to S19.
- **Dependencies:** S03 authority/provenance; S09 evidence records; S20 calibration.
- **Exclusive authority:** Owns claim acceptance and uncertainty status, not source acquisition or product preference.
- **Decisions this design must resolve:** Materiality threshold; entailment method; contradiction severity; causal evidence; calibration metrics; abstention/research escalation.

### Design obligations

- **Alternatives to compare:** Single-model self-check; deterministic claim graph; independent verifier; multi-model judge; hybrid automated plus sampled human audit.
- **Research required:** Calibration/entailment benchmarks; domain-specific causal standards; correlated verifier errors; citation-context preservation.
- **Deliverables:** Claim/evidence contract; contradiction/inference policy; confidence/abstention rules; correction workflow; evaluation suite.
- **Evidence required:** Claim-evidence graph; entailment tests; contradiction cases; calibration curves; abstention outcomes; correction/retraction record.
- **Known risks:** Verifier hallucination; circular evidence; source consensus without independence; domain disagreement; excessive abstention; hidden uncertainty in synthesis.

### Acceptance gates

- **G-S10-01:** Every material externally checkable claim has supporting evidence or an explicit unknown/inference/speculation label.
- **G-S10-02:** Contradictions and alternative explanations are preserved until resolved by an authorized rule or evidence.
- **G-S10-03:** Confidence language and completion claims satisfy risk-tier calibration and abstention thresholds.

### Failure gates

- **FG-S10-01:** A fabricated, non-entailing, or stale citation survives the claim gate.
- **FG-S10-02:** Fluent wording raises confidence without new evidence.

### Standalone assignment seed

Design S10 for N05/N06/N07/N08/N10/N14 and O03/O11. Specify claim typing, exact evidence binding, contradiction and alternative preservation, inference/causal-chain audit, calibrated confidence/abstention, and correction recovery. Integrate research, provenance, adversarial challenge, completion verification, and communication. Deliver a conceptual claim-control system and benchmarks proving G-S10-01 through G-S10-03. Any unsupported citation or confidence-by-polish fails.
## S11 — Action and Build Execution Control

**Plane:** Execution plane  
**Purpose:** Execute authorized changes and tool actions within exact targets, boundaries, rollback plans, and observable action records.  
**Required outcome:** The system performs the requested work without unauthorized side effects, silent scope expansion, destructive mistakes, or untracked changes.  
**Owned normalized problems:** N13, N15, N18, N25  
**Current source coverage:** Existing repository rules, connector proposal, and threat model cover parts; a provider-neutral action contract spanning tools is not approved.

### Scope

Action proposals; permission; target resolution; least privilege; execution boundary; change records; rollback; side-effect confirmation.

### Exclusions

Task planning; final verification; security policy content; detailed implementation platform; source truth.

### Mandatory subsystems

- **S11.1 — Action Proposal and Target Resolver:** Exact action, target, expected effect, authority, reversibility, and dependencies.
- **S11.2 — Permission and Policy Gate:** User/project/policy authority and least-privilege tool scope.
- **S11.3 — Execution Boundary:** Authorized environment, data/tool isolation, timeout, concurrency, and resource limits.
- **S11.4 — Change and Side-Effect Recorder:** Before/after, actor/tool, affected artifacts, external effects, and errors.
- **S11.5 — Rollback and Compensation Controller:** Reversal, restore point, compensating action, and nonrecoverable disclosure.
- **S11.6 — Execution Result Contract:** Observed result, incomplete state, handoff to verification, and retained evidence.

### Contracts and authority

- **Inputs:** Work package; authority/task-risk contract; compiled tool contract; exact target; baseline; credentials/access proof.
- **Outputs:** Action log; changed artifacts/effects; errors; rollback state; execution evidence; verification candidate.
- **Interfaces:** Consumes S02/S03/S04/S07/S08/S18; sends artifacts to S12, checkpoints to S14, cost to S17, incidents to S19.
- **Dependencies:** S04 action tier; S18 security/consent; S08 work package.
- **Exclusive authority:** Owns execution within granted scope. It cannot interpret new product requirements, approve its own exception, or declare final completion.
- **Decisions this design must resolve:** Action taxonomy; approval reuse; safe defaults; exact-target proof; rollback requirements; external side-effect confirmation; failure containment.

### Design obligations

- **Alternatives to compare:** Direct tool calls; sandboxed executor; transaction/compensation workflow; human-approved stepper; capability-specific adapter.
- **Research required:** Tool safety patterns; recoverability; external API idempotency; filesystem/repository protections; audit immutability.
- **Deliverables:** Action contract; authority matrix; target-resolution rules; rollback/compensation design; action/evidence log; destructive-action tests.
- **Evidence required:** Authority and target logs; before/after artifacts; sandbox/tool traces; idempotency/rollback simulations; side-effect inventory.
- **Known risks:** Irreversible external effects; ambiguous target names; hidden side effects; permission drift; rollback that cannot fully compensate; secret exposure.

### Acceptance gates

- **G-S11-01:** Every side-effecting action resolves an exact target, authority source, expected impact, and rollback/compensation before execution.
- **G-S11-02:** Execution is least-privileged and cannot expand its own tools, data, target, or budget.
- **G-S11-03:** Observed results and all material side effects are recorded before the artifact is offered for verification.

### Failure gates

- **FG-S11-01:** An external, destructive, or hard-to-recover action occurs without the required authority.
- **FG-S11-02:** The system cannot identify what changed or restore/contain a failed action.

### Standalone assignment seed

Design S11 for N13/N15/N18/N25 and O05/O09/O11. Define exact action proposals, authority/policy gates, least-privilege execution boundaries, complete side-effect records, rollback/compensation, and execution-result contracts. Integrate planning, security, checkpoints, cost, verification, and incident handling. Do not choose a specific sandbox vendor. Deliver contracts and destructive-action simulations proving G-S11-01 through G-S11-03. Unauthorized effects or untraceable changes fail.
## S12 — Artifact, Workflow, and Completion Verification

**Plane:** Assurance plane  
**Purpose:** Test the real deliverable and full user journey in the intended environment, then gate every completion claim on retained evidence.  
**Required outcome:** Nothing is called implemented, working, saved, or complete because it merely looks plausible, compiles, or passes an unrelated test.  
**Owned normalized problems:** N11, N13, N14, N15, N17, N18  
**Current source coverage:** The frozen spec and proposed evaluation system contain extensive tests; implementation evidence is mixed and not independently reproduced here.

### Scope

Artifact-state classification; test planning; end-to-end/user-flow; integration; visual/accessibility where relevant; regression; completion claims; handoff.

### Exclusions

Building the artifact; source research; release authorization; provider/model quality evaluation outside the deliverable.

### Mandatory subsystems

- **S12.1 — Artifact State Classifier:** Plan, mock, prototype, code, integrated build, deployed result, and verified result.
- **S12.2 — Claim-Specific Verification Planner:** Maps each acceptance claim to environment, test, oracle, and evidence.
- **S12.3 — End-to-End and Real-Integration Verifier:** User start-to-outcome path using actual dependencies or clearly labeled substitutes.
- **S12.4 — Regression, Visual, Accessibility, and Nonfunctional Verifier:** Existing behavior plus relevant quality budgets.
- **S12.5 — Completion and Status Gate:** Allows exact status only when required evidence exists; otherwise Not assessed/blocked/failed.
- **S12.6 — Verification Evidence and Handoff Packager:** Results, environment, versions, limitations, rerun method, and unresolved failures.

### Contracts and authority

- **Inputs:** Requirement gates; artifacts/action logs; target environment; dependencies; baselines; test data; risk policy.
- **Outputs:** Verified/failed/blocked/Not-assessed results; completion eligibility; defect list; reproducible evidence package.
- **Interfaces:** Consumes S02/S03/S04/S10/S11/S20; feeds S08 completion, S14 handoff, S19 incidents, S20 release.
- **Dependencies:** S02 success contract; S03 provenance; S11 observed artifacts; S20 evaluation standards.
- **Exclusive authority:** Owns verification evidence and completion-state recommendation, not implementation or release exception authority.
- **Decisions this design must resolve:** Test oracle; required environments; mock allowance; evidence retention; regression scope; visual/accessibility applicability; completion threshold.

### Design obligations

- **Alternatives to compare:** Unit-test aggregate; manual QA; browser/e2e automation; formal verification; independent reviewer; risk-tiered combination.
- **Research required:** Test-oracle quality; production-like environments; flaky tests; accessibility/user testing; artifact-type-specific verification.
- **Deliverables:** Verification contract; artifact taxonomy; gate/test/evidence matrix; end-to-end suites; handoff format; defect and status rules.
- **Evidence required:** Environment/version manifest; test logs; screenshots/render pages where relevant; integration traces; regression comparison; completion decision.
- **Known risks:** Weak oracle; inaccessible production dependency; nondeterminism; visual false positives; missing user outcome metric; test maintenance burden.

### Acceptance gates

- **G-S12-01:** Each completion claim maps to a passed test in the stated environment with retained, reproducible evidence.
- **G-S12-02:** The full user path—including integrations, failure/recovery, save/export, and accessibility where applicable—is tested.
- **G-S12-03:** Failed, unavailable, mocked, or unrun verification is labeled exactly and cannot be summarized as complete.

### Failure gates

- **FG-S12-01:** Inspection, unit tests, mocks, screenshots, or documentation alone are used to prove a broader working claim.
- **FG-S12-02:** A test passes while the requested user outcome remains unreachable.

### Standalone assignment seed

Design S12 for N11/N13/N14/N15/N17/N18 and O05/O11. Define artifact states, claim-specific test plans, real end-to-end/integration checks, regression/visual/accessibility/nonfunctional checks, evidence-gated status, and reproducible handoff. Integrate requirements, action logs, claim verification, release governance, and incident recovery. Deliver test/evidence matrices proving G-S12-01 through G-S12-03. Narrow tests proving broad completion are forbidden.
## S13 — Independent Challenge, Multi-Model Synthesis, and Stopping

**Plane:** Assurance plane  
**Purpose:** Use genuinely independent methods or models to challenge assumptions, seek disconfirmation, preserve minority findings, and synthesize only after conflicts are exposed.  
**Required outcome:** The system does not mistake agreement, eloquence, or repeated sampling from correlated systems for truth or completeness.  
**Owned normalized problems:** N06, N09, N10, N12, N14, N28  
**Current source coverage:** Multi-AI debate/synthesis exists in prior designs, but independence, judge authority, and bounded stopping are not sufficiently established.

### Scope

Independent solution paths; adversarial critique; disconfirmation; diversity; conflict preservation; synthesis; stopping.

### Exclusions

Primary evidence collection; route registry; final product authority; routine low-risk tasks where challenge adds no value.

### Mandatory subsystems

- **S13.1 — Independent Solver/Method Selector:** Chooses distinct models, sources, methods, or deterministic checks.
- **S13.2 — Assumption and Failure-Mode Challenger:** Attacks requirements, dependencies, evidence, edge cases, and completion claims.
- **S13.3 — Disconfirming Evidence and Counterexample Search:** Actively tests the favored conclusion.
- **S13.4 — Independence and Correlation Auditor:** Measures shared provider, training, prompt, source, and tool dependencies.
- **S13.5 — Conflict and Minority Report:** Preserves unresolved alternatives and why they survived.
- **S13.6 — Synthesis and Judge Contract:** Defines what may be combined, who decides, and how uncertainty is retained.
- **S13.7 — Bounded Stopping Controller:** Stops when another pass adds no unresolved critical defect under a defined budget.

### Contracts and authority

- **Inputs:** Candidate answer/design/artifact; assumptions; evidence and claim graph; task risk; eligible diverse routes; budget.
- **Outputs:** Challenges; counterexamples; independence report; resolved/unresolved conflicts; minority report; synthesis candidate; stopping record.
- **Interfaces:** Consumes S02/S04/S05/S06/S09/S10/S12/S17; sends findings to relevant owners and decision status to S08/S20.
- **Dependencies:** S05 capability/lineage; S06 diversity route; S10 claim control; S17 budget.
- **Exclusive authority:** Owns challenge and conflict visibility. It may not self-approve a product preference or silently erase a minority finding.
- **Decisions this design must resolve:** When challenge is required; independence threshold; judge authority; conflict resolution; sampling depth; stopping saturation and criticality.

### Design obligations

- **Alternatives to compare:** Same-model self-critique; different prompts; different models/providers; deterministic validators; expert human review; mixed portfolio.
- **Research required:** Error correlation; debate anchoring; evaluator bias; cost-benefit by task risk; adversarial test design; stopping theory.
- **Deliverables:** Challenge protocol; independence rubric; minority-report format; synthesis contract; bounded-stopping rule; adversarial benchmark.
- **Evidence required:** Route/source lineage; adversarial prompts/methods; counterexample results; correlation matrix; minority report; pass-by-pass defect curve.
- **Known risks:** False independence; debate amplifying errors; judge bias; runaway cost; endless refinement; challenge that duplicates rather than tests.

### Acceptance gates

- **G-S13-01:** High-impact work receives at least one challenge path independent in method, source, or provider from the primary path.
- **G-S13-02:** All material conflicts and surviving minority findings remain visible through synthesis.
- **G-S13-03:** Stopping records budget, passes, newly found critical issues, residual uncertainty, and why another pass is unlikely to change release eligibility.

### Failure gates

- **FG-S13-01:** Multiple agreeing outputs share the same load-bearing source/method but are counted as independent confirmation.
- **FG-S13-02:** The synthesizer suppresses an unresolved high-impact contradiction.

### Standalone assignment seed

Design S13 for N06/N09/N10/N12/N14/N28 and O03/O04/O12. Define independent paths, adversarial challenges, disconfirming search, correlation audit, minority reports, synthesis authority, and bounded stopping. Integrate routing, evidence, claim and completion gates, cost, and governance. Deliver a challenge protocol and benchmark proving G-S13-01 through G-S13-03. Correlated agreement or suppressed material conflict fails.
## S14 — Session State, Memory, Checkpoint, Resume, and Portability

**Plane:** User/state plane  
**Purpose:** Externalize authoritative work state so context limits, interruptions, crashes, new sessions, providers, or accounts do not erase decisions or progress.  
**Required outcome:** A user or successor can resume at the exact next valid step without reconstructing history or repeating consequential work.  
**Owned normalized problems:** N16, N19, N20, N26  
**Current source coverage:** Session protection, autosave, checkpoints, and long-job resume are present in prior designs; cross-provider portable authoritative state remains incomplete.

### Scope

Memory tiers; authoritative state snapshot; checkpoints; resume reconciliation; idempotency; status; export/import; retention.

### Exclusions

Personalization learning; raw provider chat retention by default; project planning logic; source truth.

### Mandatory subsystems

- **S14.1 — Authoritative Context Snapshot:** Current objective, requirements, decisions, sources, constraints, and unresolved items.
- **S14.2 — Workflow State and Checkpoint Manager:** Completed/active/pending/blocked/failed state plus restart point.
- **S14.3 — Memory Tier and Retention Policy:** Ephemeral, session, project, profile, and evidence memory with consent/expiry.
- **S14.4 — Resume and Handoff Manifest:** Exact next task, required inputs, authority, gates, and verification state.
- **S14.5 — Reconciliation and Drift Detector:** Compares live context with checkpoint and resolves conflicts.
- **S14.6 — Idempotency and Replay Guard:** Prevents repeated side effects and duplicate work.
- **S14.7 — Portable Export/Import and Recovery:** Provider-neutral archive, restore, round trip, and partial-failure behavior.

### Contracts and authority

- **Inputs:** Intent/project/source/workflow/action/evidence/decision state; retention and privacy policy; provider limits.
- **Outputs:** Versioned snapshots/checkpoints; resume manifest; exact next task; import/export package; recovery and reconciliation record.
- **Interfaces:** Receives from all systems; supplies S01/S02/S08 on resume; constrained by S18; verified by S12/S20; incidents to S19.
- **Dependencies:** S02 authoritative project state; S03 provenance; S18 retention/consent.
- **Exclusive authority:** Owns durable state and resume fidelity, not substantive decisions or indefinite retention.
- **Decisions this design must resolve:** Canonical state set; checkpoint timing; memory tier promotion; retention/erase; conflict resolution; export format; cross-account portability.

### Design obligations

- **Alternatives to compare:** Conversation summary; event log; snapshots; event-sourced state; document bundle; hybrid manifest plus evidence store.
- **Research required:** Long-context failure; durable workflow patterns; privacy/erasure; schema/version migration; cross-provider portability; user comprehension.
- **Deliverables:** State model; checkpoint/resume contract; retention policy requirements; idempotency rules; portable manifest; crash/round-trip tests.
- **Evidence required:** Cold-resume drills; checkpoint checksums/diffs; crash injection; idempotency logs; export/import round trip; deletion/retention tests.
- **Known risks:** Sensitive persistence; migration drift; oversized state; stale snapshots; portability format fragmentation; unclear ownership across accounts.

### Acceptance gates

- **G-S14-01:** A cold resume reconstructs controlling intent, requirements, decisions, evidence, status, and exact next task without chat history.
- **G-S14-02:** Crash/retry cannot repeat a consequential action or lose acknowledged completed work.
- **G-S14-03:** Export/import round trip preserves identifiers, authority, provenance, and unresolved state across providers.

### Failure gates

- **FG-S14-01:** A summary is treated as authoritative while omitting a load-bearing requirement or decision.
- **FG-S14-02:** Recovery depends on the original model/provider conversation being available.

### Standalone assignment seed

Design S14 for N16/N19/N20/N26 and O06/O11. Define authoritative snapshots, workflow checkpoints, memory tiers/retention, resume manifests, reconciliation, idempotency, and provider-neutral export/import recovery. Integrate every system but preserve S02/S03 authority and S18 privacy. Deliver conceptual state and recovery contracts plus cold-resume/crash/round-trip tests proving G-S14-01 through G-S14-03. Context-only recovery fails.
## S15 — Personalization and User-Controlled Adaptation

**Plane:** User/state plane  
**Purpose:** Adapt communication and workflow only from consented, user-specific, evidence-supported preferences that remain contextual, auditable, reversible, and overrideable.  
**Required outcome:** Personalization reduces repeated correction without turning generic ADHD assumptions or weak correlations into silent global rules.  
**Owned normalized problems:** N04, N22, N23, N29  
**Current source coverage:** The UI optimizer boundary/workflow is partly frozen, while its checkbox/dataset list is proposed. Existing correction learning covers a narrow state signal.

### Scope

Consent and selected categories; evidence extraction; contextual preference rules; confidence/counterevidence; versioning; preview; override/rollback/decay.

### Exclusions

Diagnosis; universal ADHD personality; arbitrary general extraction; hidden model/provider selection; nonconsented behavior tracking.

### Mandatory subsystems

- **S15.1 — Consent and Personalization Scope:** Selected categories, eligible data, purpose, retention, and revoke/erase.
- **S15.2 — Evidence Acquisition for Preferences:** Explicit instructions, repeated outcomes, contrasts, sequences, and counterevidence.
- **S15.3 — Contextual Preference Rule Builder:** Applies only by task/state/context; preserves exceptions and conflicts.
- **S15.4 — Confidence and No-Change Gate:** Explicit instructions vs repeated inference thresholds; insufficient evidence changes nothing.
- **S15.5 — Profile Version, Audit, and Rollback:** Source references, before/after, reason, version, and restore.
- **S15.6 — Runtime Override, Feedback, and Decay:** Per-turn override, correction, recency, contextual refinement, and non-destructive decay.

### Contracts and authority

- **Inputs:** User-selected scope; eligible conversation/outcome evidence; explicit settings; corrections; task/context labels; privacy policy.
- **Outputs:** Versioned contextual profile rules; confidence/counterevidence; no-change reasons; audit/rollback; runtime controls.
- **Interfaces:** Supplies S06/S07/S16; consumes S03/S09/S10/S14/S18; evaluation and approval by S20.
- **Dependencies:** S18 consent/data policy; S03 provenance; S10 evidence thresholds; S14 durable profile state.
- **Exclusive authority:** Owns evidence-backed personal preferences within consented categories. User owns consent, subjective preferences, overrides, and deletion.
- **Decisions this design must resolve:** Checkbox/category authority; inference threshold; contextual rule conflicts; recency/decay; audit visibility; rollback; cold-start behavior.

### Design obligations

- **Alternatives to compare:** Manual settings only; implicit learning; proposed checkbox workflow; per-turn adaptation; hybrid explicit-plus-evidence learning.
- **Research required:** Personalization harms; consent comprehension; sparse/biased conversation evidence; preference drift; disability/privacy ethics; evaluation with diverse users.
- **Deliverables:** Consent/boundary contract; preference evidence schema requirements; contextual-rule policy; audit/rollback experience; evaluation dataset and approval gates.
- **Evidence required:** Consent records; source-linked preference evidence; no-change outcomes; conflict/context cases; rollback/override tests; user comprehension studies.
- **Known risks:** Sensitive inference; surveillance feeling; reinforcing temporary distress; false outcome labels; profile complexity; silent adaptation reducing agency.

### Acceptance gates

- **G-S15-01:** No category is analyzed or changed without informed, revocable scope consent; no evidence means no change.
- **G-S15-02:** Inferred preferences require repeated independent outcome evidence, counterevidence, context, and uncertainty.
- **G-S15-03:** Every profile change is versioned, attributable, previewable/inspectable, overrideable, and reversible.

### Failure gates

- **FG-S15-01:** A generic ADHD assumption becomes a personal rule.
- **FG-S15-02:** Contradictory evidence is flattened into a silent global preference.

### Standalone assignment seed

Design S15 for N04/N22/N23/N29 and O07/O09/O12. Preserve the current separation from general-purpose extraction and treat the checkbox/dataset list as proposed until authorized. Specify consent, evidence acquisition, contextual rules, no-change thresholds, versioned audit/rollback, and runtime override/decay. Integrate provenance, claim confidence, memory, security, routing, and communication. Prove G-S15-01 through G-S15-03; generic assumptions or flattened contradictions fail.
## S16 — Cognitive Accessibility, Communication, and Interaction Repair

**Plane:** User/state plane  
**Purpose:** Present decisions, progress, answers, uncertainty, and repairs in a form the user can understand and act on without becoming the system's manager.  
**Required outcome:** The user sees the outcome and one next action first, receives only necessary choices, and can correct the system with low friction.  
**Owned normalized problems:** N03, N11, N21, N22, N23, N29, N32  
**Current source coverage:** ADHD rules, UI specifications, and audits provide substantial evidence, but layout authority and individualized adaptation remain partly unresolved.

### Scope

Outcome-first communication; progressive disclosure; choice policy; status; directness/tone; correction/repair; accessibility; sensory and interruption controls.

### Exclusions

Diagnosis; substantive truth verification; preference inference without consent; detailed visual design or pixel layout.

### Mandatory subsystems

- **S16.1 — Outcome-First Response Contract:** Answer/action/status first; optional depth and provenance after.
- **S16.2 — Choice and Decision-Burden Manager:** One recommendation plus rationale; choices only when meaningful.
- **S16.3 — Progressive Disclosure and Information-Density Controller:** Chunk size, hierarchy, expansion, and continuity cues.
- **S16.4 — Directness, Tone, and Explanation Adapter:** Explicit/user-profile settings bounded by truth and safety.
- **S16.5 — Correction, Frustration, and Repair Protocol:** Fix defect, prove changed behavior, briefly acknowledge, and prevent recurrence.
- **S16.6 — Accessible Interaction and Sensory Baseline:** Keyboard, assistive technology, text, contrast, motion, timing, and alternatives.
- **S16.7 — Exact Status and Next-Action Surface:** Done/active/pending/blocked/Not-assessed and the smallest next step.

### Contracts and authority

- **Inputs:** Verified result/status; open user decisions; personalization settings; uncertainty; progress; errors; accessibility preferences.
- **Outputs:** User-facing response/controls; recommendation and rationale; correction path; progress/status; accessible alternatives.
- **Interfaces:** Consumes S02/S10/S12/S14/S15; returns corrections to S01/S02/S15 and burden/abandonment signals to S19/S20.
- **Dependencies:** S02 exact status; S10 uncertainty; S15 consented preferences; S12 verified completion.
- **Exclusive authority:** Owns presentation and interaction burden, never truth, authority, or the user's subjective choice.
- **Decisions this design must resolve:** Default length/density; choice cap; progressive disclosure; tone boundaries; repair trigger; accessibility baseline; notification/interruption rules.

### Design obligations

- **Alternatives to compare:** Static concise style; adaptive profile; task-based templates; user modes; mixed outcome-first progressive system.
- **Research required:** ADHD and cognitive-accessibility research; screen-reader/keyboard/sensory testing; repair effectiveness; decision burden; cultural tone variation.
- **Deliverables:** Communication contract; choice/repair/accessibility policies; status surface requirements; user-testing plan; failure and recovery cases.
- **Evidence required:** Task-completion/user-burden study; choice counts; readability/actionability checks; correction-repair replay; WCAG/assistive-tech and sensory tests.
- **Known risks:** Over-compression; hidden important detail; patronizing tone; wrong state inference; conflicting accessibility needs; too many modes/controls.

### Acceptance gates

- **G-S16-01:** Primary outcome, exact status, and one next action are understandable without expanding optional detail.
- **G-S16-02:** The system does not present more than the defined simultaneous decision budget without grouping, defaults, or staged disclosure.
- **G-S16-03:** After correction/frustration, the system changes the defective behavior and shows verification before extended apology/explanation.

### Failure gates

- **FG-S16-01:** The user must restate known context or manage the system to make routine progress.
- **FG-S16-02:** Accessibility or density prevents completion of the core workflow.

### Standalone assignment seed

Design S16 for N03/N11/N21/N22/N23/N29/N32 and O07. Define outcome-first responses, choice management, progressive disclosure, bounded tone/directness, defect-first repair, accessible/sensory baselines, and exact status/next action. Use only consented personalization and verified truth/status inputs. Keep visual pixels out of scope. Deliver interaction contracts and diverse-user tests proving G-S16-01 through G-S16-03. Routine user management or an inaccessible core flow fails.
## S17 — Cost, Usage, Latency, and Billing Safeguards

**Plane:** Control plane  
**Purpose:** Estimate, authorize, meter, cap, and reconcile resource use across models, tools, long jobs, retries, and paid options.  
**Required outcome:** No user is surprised by cost or trapped in runaway retries; higher spending occurs only within an explicit envelope and offers measurable value.  
**Owned normalized problems:** N12, N18, N24, N28  
**Current source coverage:** The proposed free-first/cost spec is detailed and the long-job spec adds budgets, but neither is approved as current product authority.

### Scope

Price/credit sources; estimates; free-first optimization; envelopes; caps; actual ledger; retries; latency; anomalies; checkout/refund/credit policy boundaries.

### Exclusions

Provider pricing decisions; payment-vendor design; model quality; task planning; detailed accounting/tax implementation.

### Mandatory subsystems

- **S17.1 — Price, Credit, and Resource Catalog:** Versioned pricing, included allowances, token/tool units, and expiry.
- **S17.2 — Preflight Estimator:** Range, assumptions, uncertainty, model/tool/retry contributions, and latency.
- **S17.3 — Free-First and Value Optimizer:** Cheapest eligible route that still meets task/risk/quality gates.
- **S17.4 — Budget, Cap, and Escalation Gate:** Per request/job/account caps and explicit expansion.
- **S17.5 — Runtime Meter and Immutable Ledger:** Actual usage, retries, providers, credits, and reconciliation.
- **S17.6 — Retry/Concurrency/Anomaly Guard:** Retry budgets, fan-out caps, duplicate-call detection, and stop/pause.
- **S17.7 — User Cost/Latency Explanation and Recovery:** Relevant estimate, actual, variance, downgrade/pause/refund/credit paths.

### Contracts and authority

- **Inputs:** Task-risk/route/work plan; current pricing/credits; account limits; actual provider/tool usage; incidents.
- **Outputs:** Authorized envelope; estimate; cheapest eligible route; live meter; cap events; final ledger; variance/recovery record.
- **Interfaces:** Feeds constraints to S04/S06/S08/S13; receives registry/pricing S05, usage S11, incidents S19; governed by S20.
- **Dependencies:** S05 provider identity; S04 resource policy; S18 billing/privacy policy.
- **Exclusive authority:** Owns resource facts and enforcement, not quality eligibility or user purchase authority.
- **Decisions this design must resolve:** Estimate uncertainty; free vs paid eligibility; cap defaults; retry/concurrency limits; stale-price behavior; credits/refunds; ledger reconciliation.

### Design obligations

- **Alternatives to compare:** Flat quotas; token-only estimates; provider-native billing; unified ledger; prepaid credits; postpaid with hard caps; hybrid.
- **Research required:** Current provider pricing/billing APIs; retry amplification; streaming/tool costs; user comprehension; payment/legal requirements.
- **Deliverables:** Resource catalog contract; estimator; cap/retry policy; ledger/reconciliation; user explanation; cost/latency evaluation suite.
- **Evidence required:** Versioned price fixtures; estimator error distribution; cap/retry/concurrency simulations; usage ledger reconciliation; user comprehension tests.
- **Known risks:** Changing prices; hidden provider units; estimate volatility; billing disputes; excessive caps reducing quality; optimizing price over outcome.

### Acceptance gates

- **G-S17-01:** Preflight states a bounded range, assumptions, uncertainty, cap, and paid/free tradeoff before material spend.
- **G-S17-02:** Runtime cannot exceed the authorized cap through retries, concurrency, fallback, or multi-model fan-out.
- **G-S17-03:** Final ledger reconciles provider/tool usage and explains material variance from estimate.

### Failure gates

- **FG-S17-01:** A retry/fallback loop creates uncapped spend or duplicate billing.
- **FG-S17-02:** A paid escalation occurs without explicit authority or a visible value tradeoff.

### Standalone assignment seed

Design S17 for N12/N18/N24/N28 and O08/O10. Treat current cost documents as proposed evidence. Define price/credit catalog, preflight range, free-first value optimization, caps/escalation, actual ledger, retry/concurrency anomaly guard, and user explanation/recovery. Integrate registry, routing, orchestration, execution, security, incidents, and governance. Prove G-S17-01 through G-S17-03. Uncapped retry spend or unauthorized paid escalation fails.
## S18 — Security, Privacy, Consent, and Tool Authorization

**Plane:** Control plane  
**Purpose:** Protect data, secrets, instructions, tools, external actions, and provider boundaries through explicit consent, least privilege, isolation, and auditable policy.  
**Required outcome:** Untrusted content cannot gain authority; sensitive data is minimized and governed; consequential actions require valid permission.  
**Owned normalized problems:** N18, N25, N27, N28, N30  
**Current source coverage:** The proposed threat model is comprehensive; optimizer boundary adds consent constraints; approval and implementation are not established.

### Scope

Threat boundaries; data classification/minimization; consent/retention/deletion; secrets; injection isolation; action authorization; provider terms; audit; incident controls.

### Exclusions

Substantive task safety advice; organization legal interpretation; specific cloud vendor; product preference decisions.

### Mandatory subsystems

- **S18.1 — Threat, Trust, and Data-Flow Boundaries:** Actors, assets, untrusted inputs, system instructions, providers, tools, and stores.
- **S18.2 — Data Classification, Minimization, and Purpose:** Sensitivity, necessity, destination, transformation, and purpose limitation.
- **S18.3 — Consent, Retention, Export, and Deletion:** User choices, expiry, revoke, legal holds, and verifiable deletion.
- **S18.4 — Secret, Identity, and Tool Authorization:** Credential isolation, scoped identity, least privilege, and action tiers.
- **S18.5 — Prompt-Injection and Untrusted-Content Isolation:** Instruction/data separation, tool-call validation, and exfiltration prevention.
- **S18.6 — Provider Terms, Privacy, and Connection Policy:** BYOK/managed/local/manual modes, retention, training, residency, and policy compatibility.
- **S18.7 — Security Audit, Kill Switch, and Incident Interface:** Tamper-evident events, revocation, containment, rotation, notice, and recovery.

### Contracts and authority

- **Inputs:** Task/data/action contracts; source content; provider/tool capabilities/terms; user consent; identities/secrets; retention requirements.
- **Outputs:** Allowed/denied data flows; scoped permissions; sanitized instruction package; retention/deletion state; security events; containment actions.
- **Interfaces:** Constrains S03–S17/S19; supplies hard filters to S04/S05/S06/S11; governed/evaluated by S20.
- **Dependencies:** User/organization policy; S03 authority; S20 governance; applicable law interpreted by authorized humans.
- **Exclusive authority:** Owns security/privacy control enforcement, not user product preferences or legal determinations beyond approved policy.
- **Decisions this design must resolve:** Data classes; consent granularity; retention defaults; trust boundaries; permission reuse; provider eligibility; incident thresholds; audit access.

### Design obligations

- **Alternatives to compare:** Central policy gateway; per-service controls; zero-trust capability tokens; sandbox isolation; local-only modes; layered defense.
- **Research required:** Threat modeling; prompt-injection defenses; privacy law/terms; secret management; browser/tool security; deletion verification.
- **Deliverables:** Threat/data-flow model; data/consent/retention policy; authorization matrix; injection/tool-boundary suite; provider policy; incident/kill-switch plan.
- **Evidence required:** Threat/data-flow diagrams; consent/retention/deletion tests; secret scans; injection/exfiltration corpus; permission logs; kill-switch drill.
- **Known risks:** Evolving attacks/terms/law; overly broad consent; logging sensitive data; local-mode false safety; complex cross-provider deletion; usability-security tradeoff.

### Acceptance gates

- **G-S18-01:** Every data flow and tool action has a purpose, sensitivity, destination, authority, retention, and audit rule.
- **G-S18-02:** Untrusted source content cannot alter system policy, reveal secrets, or authorize tools/actions.
- **G-S18-03:** Consent revocation, credential compromise, or provider-policy failure triggers containment and verified state change.

### Failure gates

- **FG-S18-01:** Sensitive data reaches an unapproved provider/store or exceeds consented purpose.
- **FG-S18-02:** A prompt-injection fixture causes unauthorized tool use or data disclosure.

### Standalone assignment seed

Design S18 for N18/N25/N27/N28/N30 and O09/O11/O12. Use the threat model as proposed evidence, not approved implementation. Define trust/data flows, minimization, consent/retention/deletion, secrets/tool authorization, injection isolation, provider connection policy, and audit/kill-switch incident interfaces. Constrain all systems by least privilege and hard filters. Deliver policies and attack simulations proving G-S18-01 through G-S18-03. Unauthorized flow/tool use or failed containment blocks the design.
## S19 — Observability, Resilience, Drift, and Incident Recovery

**Plane:** Assurance plane  
**Purpose:** Observe system behavior and outcomes, detect provider/control drift and failures, degrade safely, recover, and feed verified lessons into governance.  
**Required outcome:** Failures are visible, bounded, attributable, and recoverable instead of silently producing plausible wrong results or repeated harm.  
**Owned normalized problems:** N05, N17, N20, N24, N28, N31  
**Current source coverage:** Prior proposals include retries, telemetry, status, kill switches, and audits; no unified outcome/incident control is approved.

### Scope

Telemetry; health; drift; anomalies; circuit breakers; graceful degradation; incidents; user impact; recovery; learning feedback.

### Exclusions

Primary evaluation corpus; substantive task execution; billing decisions; security policy authorship; indefinite user surveillance.

### Mandatory subsystems

- **S19.1 — Outcome and Control Telemetry:** Request/route/gate/action/cost/latency/error/outcome events with privacy limits.
- **S19.2 — Provider, Model, Tool, and Control Health:** Availability, errors, latency, capability and policy status.
- **S19.3 — Quality and Behavior Drift Detector:** Regression, calibration, cost, refusal, format, and outcome shifts.
- **S19.4 — Retry, Circuit Breaker, and Graceful Degradation:** Bounded retry, alternate route, safe partial result, and visible block.
- **S19.5 — Incident Detection, Triage, and Containment:** Severity, blast radius, kill switch, preserve evidence, and notify owners/users.
- **S19.6 — Recovery, Post-Incident Learning, and Recurrence Control:** Restore, verify, explain impact, corrective action, and gate updates.

### Contracts and authority

- **Inputs:** System events; provider/tool health; quality/cost/security metrics; user corrections/abandonment; gate failures; incidents.
- **Outputs:** Health/eligibility updates; alerts; degraded/blocked route; incident record; recovery proof; corrective-action proposal.
- **Interfaces:** Receives all systems; updates S04/S05/S06/S17/S18; sends corrective changes to S20; presents user status via S16.
- **Dependencies:** S03 provenance; S14 durable incident state; S18 privacy/security; S20 governance.
- **Exclusive authority:** Owns detection, containment, and recovery coordination, not silent changes to product rules or evaluation gates.
- **Decisions this design must resolve:** Telemetry minimum; privacy/redaction; SLOs; drift thresholds; circuit behavior; severity/user notice; recovery proof; learning approval.

### Design obligations

- **Alternatives to compare:** Per-service logs; centralized observability; event-sourced audit; synthetic canaries; user-feedback monitoring; layered hybrid.
- **Research required:** AI observability limits; outcome proxy validity; privacy-preserving analytics; drift/change detection; incident communication and rollback.
- **Deliverables:** Event/metric contract; health/drift policy; circuit/degradation design; incident lifecycle; recovery verification; corrective-action feedback.
- **Evidence required:** Distributed trace samples; health/canary results; drift alerts; circuit/fallback simulation; incident timeline; recovery and recurrence evidence.
- **Known risks:** Privacy-invasive telemetry; noisy alerts; weak outcome proxies; correlated outages; silent degradation; automated remediation causing new harm.

### Acceptance gates

- **G-S19-01:** Every material request can be traced across contracts, route, tools, gates, costs, and result without exposing unnecessary sensitive content.
- **G-S19-02:** Provider/control drift or repeated failures automatically remove unsafe eligibility or trigger visible degradation within defined limits.
- **G-S19-03:** Recovery requires impact accounting, restored service verification, and an approved recurrence-control change.

### Failure gates

- **FG-S19-01:** A known failing/drifting route continues serving silently past its threshold.
- **FG-S19-02:** An incident closes without preserved evidence or verified recovery.

### Standalone assignment seed

Design S19 for N05/N17/N20/N24/N28/N31 and O06/O10/O12. Define privacy-limited telemetry, health, quality/behavior drift, bounded retries/circuit breakers, graceful degradation, incident containment, and verified recovery/learning. Integrate every system and route changes through S20 rather than self-modification. Deliver event contracts and incident drills proving G-S19-01 through G-S19-03. Silent known failure or evidence-free closure fails.
## S20 — Evaluation, Release, and Change Governance

**Plane:** Assurance/governance plane  
**Purpose:** Maintain representative evaluation assets, acceptance gates, decision rights, versioning, release criteria, and post-release control for the whole reliability layer.  
**Required outcome:** No system, model, prompt, adapter, policy, or feature becomes authoritative or auto-eligible without applicable evidence and an accountable approval path.  
**Owned normalized problems:** N02, N14, N15, N16, N17, N27, N28, N30  
**Current source coverage:** The proposed evaluation system is comprehensive and repository authority files provide precedents; approvals, layout conflicts, and implementation state remain mixed.

### Scope

Evaluation assets; acceptance/failure gates; release criteria; decision rights; changes/exceptions; baselines; post-release review; evidence retention.

### Exclusions

Daily orchestration; product strategy itself; test implementation details for every subsystem; unilateral resolution of user preference.

### Mandatory subsystems

- **S20.1 — Evaluation Asset and Coverage Registry:** Problems/outcomes/risks, datasets, simulations, environments, owners, and freshness.
- **S20.2 — Acceptance, Failure, and Evidence Gate Engine:** Requirement-specific gates and proof adequacy.
- **S20.3 — System/Provider/Adapter Qualification:** Auto-eligibility, regression, calibration, security, accessibility, cost, and resilience.
- **S20.4 — Decision Rights, Baseline, and Change Control:** Authority, version, proposal, approval, supersession, rollback, and artifact uniqueness.
- **S20.5 — Release Readiness and Exception Board:** Unresolved issues, risk acceptance, expiry, scope, and owner.
- **S20.6 — Post-Release Validation and Gate Refresh:** Canaries, field outcomes, drift, incidents, and benchmark refresh.
- **S20.7 — Audit and Continuous-Improvement Record:** Findings, corrective actions, recurrence, retirement, and evidence retention.

### Contracts and authority

- **Inputs:** Requirements/traceability; system designs; test/evidence results; authority/policy; incidents/drift; user outcomes; proposed changes/exceptions.
- **Outputs:** Qualification/release decision; approved baseline; exceptions; change record; refreshed gates; audit trail and corrective actions.
- **Interfaces:** Consumes all systems; grants qualification to S05/S06/S08/S12; directs changes via owners; persists in S03/S14.
- **Dependencies:** User/organization decision authority; S02 requirements; S03 provenance; S18 policy; independent test evidence.
- **Exclusive authority:** Owns gate definitions, qualification, release/change process, and audit record. It cannot fabricate evidence or override user authority.
- **Decisions this design must resolve:** Representative coverage; gate thresholds; independent evaluation; approval roles; exception limits/expiry; release unit; rollback; benchmark refresh.

### Design obligations

- **Alternatives to compare:** Central board; automated CI gates; subsystem-owned tests; independent assurance; risk-tiered hybrid governance.
- **Research required:** AI evaluation science; benchmark contamination; human-factors testing; statistical power; release engineering; governance usability.
- **Deliverables:** Evaluation strategy; asset registry; gate/evidence catalog; authority/change model; qualification/release/exception process; post-release program.
- **Evidence required:** Coverage/traceability audit; test datasets and run records; approval/change logs; exception register; release manifest; canary/post-release outcomes.
- **Known risks:** Benchmark gaming; excessive bureaucracy; stale gates; unclear approval authority; nonrepresentative users; conflict between shipping pressure and evidence.

### Acceptance gates

- **G-S20-01:** Every normalized problem and required outcome maps to at least one owned prevention/detection/recovery control, test, and evidence artifact.
- **G-S20-02:** No release or auto-eligibility decision passes with an unresolved critical failure, contradiction, broken dependency, untraceable requirement, or expired exception.
- **G-S20-03:** Every approved change identifies authority, baseline, evidence, affected requirements/interfaces, rollback, version, and post-release monitor.

### Failure gates

- **FG-S20-01:** A system qualifies on self-assertion, documentation, or nonrepresentative tests.
- **FG-S20-02:** An exception has no accountable owner, scope, expiry, evidence, or rollback.

### Standalone assignment seed

Design S20 for N02/N14/N15/N16/N17/N27/N28/N30 and O05/O11/O12. Define evaluation assets, acceptance/failure/evidence gates, qualification, decision/change authority, release/exception rules, post-release validation, and audit improvement. Require full problem-to-control-to-test traceability and block self-asserted evidence. Integrate all systems and preserve user authority. Deliver governance and evaluation contracts proving G-S20-01 through G-S20-03. Critical unresolved issues, expired exceptions, or nonrepresentative self-tests fail.


## Universal completion rule

No system is complete merely because a document, prompt, component, test, or AI says so. Completion requires: every assigned requirement traced; prerequisites accepted; failure gates clear; self-check passed; applicable independent audit completed; real mounted workflow verified for implementation claims; evidence retained; regressions checked; continuity records updated; and the exact next action stated. Any missing element remains Open or Failed.
