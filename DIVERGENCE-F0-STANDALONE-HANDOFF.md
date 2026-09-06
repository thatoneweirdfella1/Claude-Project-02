# DIVERGENCE F0 Standalone Handoff

**Artifact role:** Self-contained assignment for the F0 Foundation Contract and Interface Skeleton.

**Authority status:** Proposed planning input. It is not approved product authority and does not prove implementation, testing, independent validation, or user approval.

**Execution-control status:** This assignment is paired with the DIVERGENCE cross-AI continuity packet. If work occurs in GitHub, its entry files and control records are mandatory operating authority. They control execution and handoff only; they do not add a product system or alter the reliability architecture.

## 1. Exact assignment

Design **F0 only**: one bounded shared contract and interface skeleton that lets separate future designers of S02, S03, S18, and S20 use the same conceptual language without silently designing those systems for them.

Stop when the F0 deliverables and FCIS-G01–G06 have accurate gate states. Do not perform any of the four system-design packages or the F1 reconciliation during this task.

## 2. Definitions

### F0 — Foundation Contract and Interface Skeleton

A bounded planning contract that establishes:

- shared terminology and stable identifiers;
- conceptual record envelopes and their unique owners;
- version, status, provenance, supersession, retention, and integrity semantics;
- authority boundaries and prohibited self-approval;
- evidence and gate-state semantics;
- conflict, correction, supersession, exception, rollback, and unresolved-disagreement rules;
- the four dependency types and cycle-recording rules; and
- the minimum field and authority skeleton for interfaces I01–I20.

F0 defines shared seams. It does not contain the full design of S02, S03, S18, or S20.

### F1 — Reconciled Foundation Baseline

The versioned result produced only after the four separate S02, S03, S18, and S20 design packages have been compared and reconciled against F0. F1 must have one owner per shared field, retain all conflict decisions and dissent, identify every unresolved issue as Open, and prevent any co-design seam from being misrepresented as a completed prerequisite.

If reconciliation cannot satisfy its conditions, the result is an **Open** or **Failed** reconciliation report—not F1 and never a silent pass.

## 3. F0 scope

F0 must define:

1. A terminology and data dictionary.
2. A unique ownership matrix for shared concepts and fields.
3. Conceptual record envelopes for requirements/questions/decisions/status, sources/provenance/interests, security/privacy/consent/enforcement, and gates/evidence/qualification/change.
4. Stable identifier, version, status, provenance, supersession, retention, and integrity fields shared across records.
5. An authority matrix, including user/product authority and prohibited self-approval.
6. Evidence semantics, reviewer/lineage independence classes, and gate-state transitions.
7. Conflict, precedence, correction, supersession, exception, rollback, and unresolved-disagreement rules.
8. A dependency and circular-seam register using exactly the four dependency types in §8.
9. The minimum semantic and authority skeleton for I01–I20 in §7.
10. An unresolved-decision register.
11. Four separate bounded follow-on briefs: S02, S03, S18, and S20.
12. F1 reconciliation entry conditions, procedure, exit conditions, and failure outcome.
13. An accurate FCIS-G01–G06 gate-status table with retained design evidence or an explicit evidence gap.

## 4. Exclusions

F0 must not:

- design S02, S03, S18, or S20 in full;
- merge or transfer their distinct authorities;
- select implementation technology, vendors, databases, frameworks, deployment details, or code structure;
- produce application code, database schemas, low-level prompts, or implementation work;
- execute or claim system tests, user studies, security reviews, independent audits, or production validation;
- resolve user-owned authority questions without an authorized answer;
- treat a prior proposal as approved because it is referenced;
- choose a downstream implementation slice; or
- claim that F0 is F1.

## 4A. Mandatory repository, layout, and continuity controls

These controls apply to the execution of this assignment. They are not implementation technology and are not part of the product architecture.

1. Use the existing Divergence.AI repository. Do not create a separate repository.
2. Preserve and build from the existing Divergence interface and supplied three-part visual baseline. F0 has no authority to redesign, replace, fork, or implement the interface.
3. Preserve `claude/remaining-second-pass-v1` at commit `10894f704a39b6c56a7fadfafb54275b82526c33` as the untouched safety/layout branch. Perform new reliability work only on `divergence/reliability-v1`, created from that exact commit and verified identical at creation. Do not create any additional branch, and do not modify, merge into, rebase, delete, or force-update the safety branch.
4. Before acting in a repository, read the root entry file for the active AI and then the canonical control files in the exact order stated by `docs/ai-control/00-READ-FIRST.md`.
5. Maintain one active task. Work not required by that task must be recorded in `PARKING-LOT.md`; recording it does not authorize it.
6. Maintain an append-only continuity ledger. Every meaningful action must identify what was done, why it was done, the source or decision authorizing it, affected files, actual command/test result when applicable, failure or correction, and the exact next action.
7. Maintain separate task records whenever combining tasks would obscure scope, evidence, history, or resumption. Every task record must be registered in `TASK-INDEX.md` and contain its own scope, exclusions, inputs, outputs, gates, evidence, decisions, work history, blockers, and handoff state.
8. Update `DECISION-LOG.md` when a decision or rationale changes; update `EVIDENCE-INDEX.md` when evidence is created or relied upon; and update `HANDOFF.md` before stopping or transferring work.
9. Preserve history. Do not rewrite a prior log entry to make later work appear cleaner, omit a failure, or hide a changed decision. Add a correction or superseding entry instead.
10. A future AI must be able to continue from the control packet and active task packet without guessing, reopening settled choices, or reading the full meta-blueprint.

### Required cross-AI control files

| File | Required purpose |
|---|---|
| `AGENTS.md` | Codex/GPT repository entrypoint; requires the canonical read order and scope lock. |
| `CLAUDE.md` | Claude repository entrypoint; points to the same canonical authority rather than duplicating it. |
| `.github/copilot-instructions.md` | GitHub/Copilot entrypoint; points to the same canonical authority. |
| `docs/ai-control/00-READ-FIRST.md` | Mandatory read order and preflight procedure. |
| `docs/ai-control/PROJECT-AUTHORITY.md` | Stable project, layout, authority, scope, and branch rules. |
| `docs/ai-control/CONTROL-MANIFEST.json` | Machine-readable repository, branch, phase, active-task, and mutation authority state. |
| `docs/ai-control/VERCEL-BASELINE.md` | Verified mapping from the user's chosen Vercel site to the complete branch and deployed commit. |
| `docs/ai-control/SHA256SUMS` | Integrity manifest for every other file in the control packet. |
| `docs/ai-control/CURRENT-TASK.md` | The only active bounded assignment and its allowed/prohibited work. |
| `docs/ai-control/TASK-INDEX.md` | Registry and gate state of every task packet. |
| `docs/ai-control/CONTINUITY-LEDGER.md` | Append-only record of work performed and why. |
| `docs/ai-control/DECISION-LOG.md` | Durable decisions, rationale, authority, alternatives, and supersession. |
| `docs/ai-control/EVIDENCE-INDEX.md` | Evidence location, hash/version, supported gate or claim, and limitations. |
| `docs/ai-control/HANDOFF.md` | Current exact state, blockers, and single next action. |
| `docs/ai-control/PARKING-LOT.md` | Out-of-scope discoveries awaiting explicit user promotion. |

### Repository-continuity gates

| Gate | Acceptance condition | Current state before repository installation |
|---|---|---|
| **RCG-01** | Required entry and control files exist, resolve to one canonical authority, and the new AI records a complete read receipt. | Self-check passed for control installation at `58c89578c825a2c445df7408db059d7fb3f1586f`; independent verification remains Open |
| **RCG-02** | Safety and working branches are identified; the working branch begins at the exact safety commit; the safety branch is untouched; checked-out state is rechecked before every write. | Self-check passed for branch creation — both branches were identical at `10894f704a39b6c56a7fadfafb54275b82526c33` |
| **RCG-03** | Current-task boundaries and existing Divergence layout are preserved; all extra ideas are parked rather than implemented. | Open |
| **RCG-04** | Ledger, decisions, evidence, task index, and handoff allow another AI to resume without guessing or consulting the full blueprint. | Open |

RCG-01–RCG-04 are execution-continuity gates, not substitutes for FCIS-G01–G06. They may use only the permitted statuses in §9. An AI may self-check its own records, but independent verification requires another qualified reviewer.

## 5. Required ownership boundaries

| System | Exclusive foundation ownership boundary | Must not silently own |
|---|---|---|
| **S02 — Requirement, Decision, and Completion Contract** | Requirement, question, decision, exclusion, status, coverage, owner, gate reference, and completion-semantics identity. S02 alone creates and controls requirement IDs and requirement-state transitions. | Source truth/provenance, security-policy enforcement, or qualification/approval authority. |
| **S03 — Source Authority, Provenance, and Conflict Control** | Source identity, authority, applicability, provenance, freshness, conflict, version, actor/tool lineage, institutional interests, framing, sponsorship, and portable source manifest. | Requirement meaning, security enforcement, or final qualification/approval. |
| **S18 — Security, Privacy, Consent, and Tool Authorization** | Data/tool/provider classification and enforcement; consent; least privilege; secrets; isolation; retention; permitted or denied flows; action authorization; containment and incident controls. | Requirement identity, epistemic source truth, or independent qualification. |
| **S20 — Evaluation, Release, and Change Governance** | Evaluation assets; gate/evidence qualification rules; fairness, stochastic, common-mode, and evaluation-gaming checks; release/exception/change status; rollback governance; post-release qualification requirements. | Requirement authorship, source authorship, security enforcement, user/product approval, or independent verification of itself. |

Boundary rules:

- Every shared field has one owner.
- A producer owns the validity of the record it emits.
- A consumer may reject a record or request revision but may not silently reinterpret or mutate it.
- S02, S03, S18, and S20 may constrain one another through explicit contracts; constraint does not transfer ownership.
- No general “source of truth” label may collapse these separate authorities.

## 6. Authority and conflict rules

1. Direct, applicable user/product authority controls value-bearing product decisions and final approval.
2. Evidence-answerable facts must be resolved through evidence; they must not be transferred to the user merely because the system lacks the answer.
3. A self-declared “frozen” source is recorded as a claim of authority. Applicability, explicit supersession, approval state, and conflict scope determine whether it controls.
4. Inclusion of a proposal does not approve it.
5. Every correction, conflict, precedence decision, supersession, exception, and rollback is versioned and preserves history.
6. An unresolved authority conflict remains **Open** and identifies the decision owner and blocked scope.
7. No designer, system, gate owner, or evaluator may approve or independently verify its own load-bearing claim.
8. S20 defines qualification rules but cannot independently verify or approve S20 or the combined foundation.
9. User/product approval and independent verification are different authorities and require separate evidence.

### Unresolved authority questions relevant to F0

| ID | Question | F0 treatment |
|---|---|---|
| **Q-U01** | Does the current instruction only prevent the earlier frozen two-system boundary from biasing the reliability architecture, or does it supersede that product-separation decision? | Record as Open. Default planning treatment: preserve the separation contract but do not use it to determine reliability-system count. Do not merge or reject that boundary in F0. |
| **Q-U02** | Should the provider-neutral approval packet be approved as a whole, revised into smaller decisions, or remain proposal evidence? | Record as Open. Treat every packet rule as proposal evidence until authorized. |
| **Q-U06** | Can the two named frozen visual-authority files be supplied, or should visual authority be reopened? | Record as Open but nonblocking for F0. It blocks later pixel/layout authority only; F0 contains no pixel-level design. |

## 7. Complete interface skeleton definitions

Each interface record must carry a stable ID, version, owner, authority, provenance, status, applicable retention/security classification, and conflict/supersession history.

| ID | Direction | Contract | Minimum semantic content and authority rule |
|---|---|---|---|
| **I01** | S01 → S02 | Intent Contract | Versioned objective, subgoals, assumptions, confidence, confirmation, and invalidation. S02 alone creates requirement IDs. |
| **I02** | S02 → all | Project Contract | Requirements, exclusions, questions, decisions, status, owners, gates, and completion semantics. Consumers cannot mutate it silently. |
| **I03** | S03 → all | Authority/Provenance Contract | Controlling source, conflicts, versions, actors, freshness, locators, and lineage. |
| **I04** | S04 → S05/S06/S08/S11/S17/S18 | Task-Risk Contract | Task type, consequence, reversibility, hard constraints, action tier, control level, and resource envelope. |
| **I05** | S05 → S06/S07 | Eligible Capability Set | Current eligible candidates, evidence, version, constraints, expiry, health, and declared fallback losses. |
| **I06** | S06 → S07/S08 | Route Contract | Selected model/tool/connection, tradeoffs, override, fallback ladder, and audit record. |
| **I07** | S07 → S08/S09/S10/S11 | Compiled Work Package | Provider-ready instructions plus immutable goal, requirements, evidence, tool, and output controls and an adapter-loss record. |
| **I08** | S08 → S09/S11/S13 | Bounded Work Package | Scope, inputs, output, owner, authority, dependencies, budget, checkpoint, gates, and stop condition. |
| **I09** | S09 → S10/S13 | Evidence Record Set | Source, locator, context, dates, support direction, limitations, search/rejection/missing log, and coverage state. |
| **I10** | S10 → S12/S16 | Verified Claim Set | Accepted, narrowed, rejected, and unknown claims; evidence; contradictions; claim type; and calibrated uncertainty. |
| **I11** | S11 → S12 | Execution Result | Exact target, before/after state, observed side effects, errors, rollback state, artifacts, and execution evidence. |
| **I12** | S12 → S08/S14/S20 | Verification Decision | Gate state limited to Self-check passed, Independently verified, Failed, or Open; plus environment, evidence, defects, reviewer independence, and completion eligibility. |
| **I13** | S13 → owners/S20 | Challenge Record | Counterexamples, assumption failures, correlation/independence findings, minority findings, resolutions, and stopping record. |
| **I14** | S14 ↔ all | State/Resume Manifest | Authoritative snapshot, checkpoint, exact next task, idempotency, retention, and portable import/export state. |
| **I15** | S15 → S06/S07/S16 | Consented Preference Contract | Contextual preference, evidence, confidence/counterevidence, scope, override, version, and expiry/rollback. |
| **I16** | S16 → S01/S02/S15/S19 | Correction/Burden Signal | Corrected meaning/requirement/preference, repeated failure, abandonment, density, and repair outcome. |
| **I17** | S17 → S04/S06/S08/S13 | Resource Contract | Estimate range, assumptions, authorized cap, actual meter, retry/fan-out limit, and variance. |
| **I18** | S18 → S04/S05/S06/S07/S11/S14 | Security/Privacy Policy Decision | Allowed or denied data/tool/provider flows, consent, retention, secrets, isolation, and action authority. |
| **I19** | S19 → S05/S06/S08/S17/S20 | Health/Incident Decision | Health/drift threshold, disqualification, degradation/fallback, containment, recovery proof, and corrective proposal. |
| **I20** | S20 → all | Qualification/Change Decision | Applicable tests/gates, approved baseline, release/exception status, version, rollback, and post-release monitor. “Approved” requires the applicable external authority; S20 cannot self-approve. |

F0 defines the minimum fields, owner, direction, authority boundary, versioning, and rejection/correction behavior for each interface. It does not define full subsystem behavior.

## 8. Four dependency types

| Type | Definition and ordering rule |
|---|---|
| **Design prerequisite** | A stable definition or contract that must exist before a system’s bounded design can begin. Only this type determines mandatory design order. |
| **Co-design dependency** | Two or more systems must develop a shared seam iteratively. It does not mean either complete design must exist first. The seam requires a later explicit reconciliation decision. |
| **Runtime input** | A record, event, capability, decision, or artifact the designed system consumes during operation. It does not by itself impose design order. |
| **Validation dependency** | A test, evaluator, evidence source, user study, audit, or downstream integration needed to qualify a design or implementation. It occurs after something eligible exists to validate and cannot be cited as prior proof. |

Dependency rules:

- Assign every dependency exactly one of the four types at the point where it is stated.
- Every Design prerequisite must visibly precede the dependent design in the sequence.
- Record every circular seam and give it a named reconciliation point.
- Do not relabel a prerequisite as co-design merely because later behavior requires iterative reconciliation.
- Runtime feedback does not create a retrospective design prerequisite.
- Validation evidence cannot be used as evidence that an earlier design dependency was already satisfied.

## 9. Gate statuses and evidence semantics

### Permitted gate statuses

| Status | Meaning |
|---|---|
| **Self-check passed** | The author or designing party checked the stated gate and retained supporting evidence. No independence is implied. |
| **Independently verified** | A qualified party sufficiently independent of the author/system reproduced or audited the gate with retained evidence. |
| **Failed** | The gate was evaluated and its acceptance condition was not met. |
| **Open** | Required design, evidence, execution, independent review, authority, or decision is missing. Open is not a pass. |

### Evidence semantics

Every evidence record must identify:

- the requirement, claim, interface, dependency, decision, or gate it addresses;
- evidence type and whether it is a future requirement or an observed result;
- source/provenance, producer, version, locator, and collection time;
- method, oracle or comparison rule, scope, environment, and assumptions;
- actual result, support direction, uncertainty, defects, and limitations;
- reviewer identity and independence lineage, including shared provider, model, source, prompt, tool, benchmark, or assumption risks;
- conflict, correction, supersession, and exception history; and
- retention, integrity, and availability state.

Evidence rules:

1. A planned test or evidence requirement is not an executed result.
2. A self-check cannot be promoted to Independently verified without a sufficiently independent reviewer and retained reproduction or audit evidence.
3. Missing required evidence produces Open, not a pass.
4. An executed gate whose acceptance condition is not met is Failed.
5. Conflicting or correlated evidence remains visible and must be resolved or left Open.
6. Gate status, evidence state, approval state, and implementation state are separate fields.
7. No record may silently delete, weaken, or overwrite contrary evidence.

## 10. F0 deliverables

Produce one compact F0 package containing:

1. Terminology and data dictionary.
2. Shared-field ownership matrix.
3. Conceptual record-envelope definitions.
4. Authority matrix and prohibited-self-approval rules.
5. Evidence and gate-state contract.
6. Conflict, correction, supersession, exception, rollback, and unresolved-disagreement state model.
7. Four-type dependency and circular-seam register.
8. I01–I20 interface skeleton register.
9. Unresolved-decision register containing at least Q-U01, Q-U02, and Q-U06 with their scope effects.
10. Separate bounded briefs for the S02, S03, S18, and S20 packages.
11. F1 reconciliation entry conditions, comparison method, decision authority, dissent handling, exit conditions, and Open/Failed outcomes.
12. FCIS-G01–G06 gate table with the evidence used and every remaining gap.

Operational companion deliverable, separate from the F0 product-design package: update the required repository-control records and report RCG-01–RCG-04 accurately. Repository work is allowed only on `divergence/reliability-v1`, only within the active task, and never on the safety branch.

## 11. FCIS acceptance gates

| Gate | Acceptance condition | Required retained design evidence |
|---|---|---|
| **FCIS-G01** | Every shared field has one owner. | Complete shared-field ownership matrix and duplicate/orphan-owner check. |
| **FCIS-G02** | Every record is versionable and traceable and cannot be silently mutated. | Record-envelope definitions, version/change fields, and representative mutation/supersession traces. |
| **FCIS-G03** | Conflicts and supersession preserve history and user authority. | Conflict/precedence state model, preserved competing records, decision owner, resolution or Open state, and downstream-impact rule. |
| **FCIS-G04** | Evidence cannot promote its own self-check to independent verification. | Gate/evidence transition rules, independence-lineage fields, prohibited transition examples, and reviewer-authority separation. |
| **FCIS-G05** | Every dependency uses one of the four types and every co-design cycle has a reconciliation point. | Dependency register, circular-seam register, prerequisite-ordered sequence, and named reconciliation outputs. |
| **FCIS-G06** | Each follow-on brief is independently usable and has no hidden need for the full blueprint. | Four briefs, each containing scope, inputs, outputs, authority, exclusions, gates, evidence needs, unresolved decisions, assumptions/conflicts, and F0 change-proposal handling. |

FCIS-G01–G06 may be marked **Self-check passed** only with the listed retained design evidence. Independent verification and user/product approval remain Open unless they actually occur.

## 12. Failure conditions

The F0 task fails if its output:

- fully designs any of S02, S03, S18, or S20;
- selects implementation technology or starts implementation;
- claims a test, user study, security review, independent audit, or production validation occurred when it did not;
- collapses requirement, source, security/enforcement, qualification, independent-review, or user/product authority;
- permits a record or consumer to silently mutate an owner’s record;
- hides a circular dependency or omits its reconciliation point;
- treats a runtime input or validation dependency as a prior design prerequisite;
- treats later behavioral co-design as permission to ignore an actual prerequisite order;
- assumes approval or resolves an Open authority question without authorization;
- labels F0 as F1;
- omits any I01–I20 definition, dependency type, ownership boundary, FCIS gate, failure condition, or required follow-on brief; or
- leaves a future designer dependent on the full meta-blueprint for a referenced definition;
- creates or changes a repository or branch without explicit user authorization;
- redesigns, replaces, forks, or implements a new interface instead of preserving the existing Divergence layout;
- performs out-of-scope work rather than recording it in the parking lot;
- omits, backfills inaccurately, or silently rewrites required continuity, decision, evidence, task, or handoff records; or
- leaves a future AI unable to determine what was done, why it was done, what evidence exists, what remains blocked, and the single exact next action.

## 13. Exact follow-on sequence

These steps are required after F0 and are not part of the F0 design task:

1. **S02 package:** Design requirements, questions, decisions, exclusions, status, coverage, and completion semantics only. Use F0; do not design S03, S18, or S20. Deliver a standalone S02 package plus assumptions, conflicts, and proposed F0 changes.
2. **S03 package:** Design source authority, provenance, freshness, conflicts, institutional interests, framing, and export only. Use F0; do not treat the S02 package as authority over S03. Deliver a standalone S03 package plus assumptions, conflicts, and proposed F0 changes.
3. **S18 package:** Design security, privacy, consent, data/tool/provider enforcement, isolation, retention, and incident controls only. Use F0; do not transfer S02, S03, or S20 authority into S18. Deliver a standalone S18 package plus assumptions, conflicts, and proposed F0 changes.
4. **S20 package:** Design evaluation assets, gate/evidence qualification, fairness, stochastic/common-mode/evaluation-gaming checks, qualification, exceptions, release/change governance, and rollback requirements only. Use F0; do not claim independent or user/product approval. Deliver a standalone S20 package plus assumptions, conflicts, and proposed F0 changes.
5. **Foundation reconciliation:** Compare all four completed packages against F0. Resolve shared-schema and authority conflicts without merging ownership; retain dissent and user-owned decisions; version every accepted F0 change. Produce **F1 Reconciled Foundation Baseline** only if every exit condition is satisfied. Otherwise produce an Open or Failed reconciliation report.

## 14. Required final response from the F0 designer

Return, in this order:

1. F0 deliverables.
2. Unresolved decisions and blocked scope.
3. FCIS-G01–G06 gate-status table with evidence and limitations.
4. Four standalone follow-on package briefs.
5. Reconciliation entry/exit criteria.
6. The exact five-step follow-on sequence from §13.
7. RCG-01–RCG-04 status, repository/branch state, control-record updates, and the exact resume instruction.

End without selecting implementation technology, beginning a system design, or marking the foundation approved.
