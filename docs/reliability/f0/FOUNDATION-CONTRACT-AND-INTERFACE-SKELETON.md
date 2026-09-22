# F0 Foundation Contract and Interface Skeleton

**Version:** F0.1

**Status:** Proposed design; eligible only for self-check

**Scope:** Shared conceptual contracts for later, separate S02, S03, S18, and S20 design packages

**Not included:** System implementation, full subsystem design, F1 reconciliation, independent verification, or user/product approval

## 1. Contract boundary

F0 supplies a common language and minimum interface contract. It does not decide how a subsystem stores, computes, displays, or enforces a record. The four later design packages may elaborate fields inside their exclusive boundaries, but they must not transfer ownership, weaken history, silently reinterpret an input, or treat this proposal as approval.

The invariant is: **one owned value, one authoritative owner, immutable historical versions, explicit references across boundaries, and separate evidence, gate, approval, and implementation states.**

## 2. Terminology and data dictionary

| Term | Contract definition | Owner of meaning |
|---|---|---|
| Record | Versioned assertion or decision emitted by one producer through a named interface. | Producing system for the record instance; F0 for envelope semantics. |
| Stable ID | Persistent identity that never changes or gets reused after creation. | Namespace owner named by the record/interface. |
| Version | Monotonic immutable revision identifier for one stable ID. | Record owner. |
| Revision | New record version linked to its predecessor; never an in-place rewrite. | Record owner. |
| Status | State in the status vocabulary owned by the record type; never a substitute for gate, approval, evidence, or implementation state. | Record-type owner. |
| Authority | The actor or source entitled to decide a value within a stated scope. | Authority identity/provenance is controlled by S03; decision entitlement remains with the applicable authority. |
| Provenance | Trace of origin, collection, transformations, actors/tools, versions, and locators. | S03 for provenance semantics and source identities; each producer owns the accuracy of its emitted references. |
| Evidence | Retained observed result or source material that supports, contradicts, narrows, or leaves a claim unresolved. A plan is not an observed result. | Evidence producer owns the record; S20 owns qualification rules; applicable reviewer owns its decision. |
| Gate | Named acceptance condition evaluated against retained evidence. | S20 owns gate-definition and qualification semantics unless direct user/product authority specifies the condition. |
| Gate status | Exactly `Self-check passed`, `Independently verified`, `Failed`, or `Open`. | Qualified evaluator for the evaluation instance; transition constraints are F0/S20 contract. |
| Approval | Explicit decision by the authority entitled to accept a value-bearing product or release choice. | Applicable user/product/release authority; never inferred from a gate pass. |
| Independent verification | Reproduction or audit by a sufficiently independent qualified reviewer with retained evidence and lineage. | Independent reviewer for the decision; S20 specifies qualification criteria but cannot verify itself. |
| Requirement | Normative obligation with stable identity, scope, owner, status, coverage, gates, and completion semantics. | S02. |
| Question | Unresolved decision request with scope, decision owner, due/trigger conditions, and blocked effect. | S02 for identity/state; the named authority owns the answer. |
| Decision | Versioned resolution by an identified authority, including rationale, alternatives, and supersession rule. | S02 for decision-record identity/state; named decision authority owns the resolved value. |
| Source | Identified authority-bearing or evidentiary origin with applicability, freshness, interests, framing, and lineage. | S03. |
| Policy decision | Allowed, denied, or constrained data/tool/provider/action flow with consent, classification, and enforcement scope. | S18. |
| Qualification decision | Evaluation outcome about gate eligibility, exception, release/change state, rollback, or monitoring. | S20, subject to external approval and reviewer-independence rules. |
| Conflict | Two applicable records that cannot simultaneously control the same scope. | Conflict record owner is determined by conflict kind; source conflicts S03, requirement/decision conflicts S02, policy conflicts S18, qualification conflicts S20. |
| Correction | New version fixing an error while retaining the incorrect version and downstream impact. | Original record owner. |
| Supersession | Explicit replacement of an earlier applicable record by a new version or authorized record. | Original record owner plus the applicable decision authority. |
| Exception | Time- and scope-bounded authorization to deviate from a controlling rule, with owner, risk, expiry, and rollback. | Owner of the controlling rule; S20 owns qualification/change exception state; S18 owns security-policy exceptions. |
| Rollback | Explicit restoration to a named prior eligible state while retaining intervening history and cause. | Owner of the state being restored; S20 governs release/change rollback qualification. |
| Unresolved disagreement | Preserved competing positions lacking sufficient evidence or authority to resolve. | Appropriate conflict-record owner; decision remains Open. |
| Retention class | Named preservation/disposal requirement; it does not itself authorize access. | S18 owns security/privacy retention policy; producer binds the applicable class. |
| Security classification | Named sensitivity/handling class for data or action. | S18. |
| Integrity state | Verification of content identity and history linkage, separate from truth or approval. | Producer emits; verifier evaluates. |
| Dependency | Explicit relationship assigned exactly one type: Design prerequisite, Co-design dependency, Runtime input, or Validation dependency. | Dependency-register author; F0 owns type semantics. |
| Reconciliation point | Named future comparison where co-designed seams are accepted, revised, left Open, or Failed. | F1 reconciliation authority; not performed in F0. |

## 3. Universal conceptual record envelope

Every I01–I20 record uses the following conceptual envelope. Fields may be represented differently later, but their meanings and ownership cannot be collapsed.

| Field | Required meaning | Unique owner | Mutation rule |
|---|---|---|---|
| `record_id` | Stable identity in the interface namespace. | Producing system. | Created once; never reused. |
| `record_type` | Named contract/interface type. | F0 contract; producer binds the value. | New type requires versioned F0/F1 change. |
| `record_version` | Monotonic immutable revision. | Producing system. | New version only; no overwrite. |
| `schema_version` | Version of the semantic contract used. | F0, then an accepted F1/change authority. | Explicit migration or compatibility record required. |
| `owner_system` | System accountable for validity of the emitted record. | F0 interface register. | Ownership transfer requires reconciliation and versioned decision. |
| `producer_actor` | Human/system/tool that emitted the version. | Producing system. | Append-only lineage. |
| `authority_refs` | References to the authority records applicable to the contents. | Producer owns binding; S03 owns referenced authority/source identities. | Reference correction creates a new version. |
| `provenance_refs` | Source, actor, tool, transformation, and locator lineage. | Producer owns binding; S03 owns referenced provenance identities. | Preserve all prior lineage. |
| `created_at` | Creation time with declared clock/context. | Producing system. | Immutable. |
| `effective_scope` | Subjects, environments, time, and decisions to which the record applies. | Producing system within its authority boundary. | Scope change creates a new version. |
| `status` | Record-type lifecycle state. | Record-type owner. | Only declared transitions; separate from gate state. |
| `gate_refs` | Applicable gate definitions and evaluations. | Producer owns binding; S20 owns referenced gate semantics. | Cannot imply pass or approval. |
| `security_class_ref` | Applicable classification. | S18 owns classification; producer binds it. | Change requires S18 decision and new record version. |
| `retention_class_ref` | Applicable retention rule. | S18 owns policy; producer binds it. | No silent shortening; new version and authorization required. |
| `integrity` | Content digest/signature method and result, if evaluated. | Producer emits; named verifier evaluates. | Result cannot imply truth, authority, or approval. |
| `predecessor_ref` | Immediate prior version, if any. | Producing system. | Immutable chain link. |
| `change_kind` | `create`, `correct`, `supersede`, `exception`, `rollback`, or `reaffirm`. | Producing system under applicable authority. | Must match change record and rationale. |
| `change_reason_ref` | Decision/evidence/conflict authorizing the change. | Producing system owns binding; referenced authority owns decision. | Required for every post-create version. |
| `conflict_refs` | Known competing records or unresolved disagreements. | Producing system for disclosure; conflict-type owner controls conflict record. | Contrary evidence cannot be deleted. |
| `supersedes_refs` | Versions explicitly displaced for the stated scope. | Producing system under applicable authority. | Displaced records remain addressable. |
| `exception_ref` | Bounded deviation authority, scope, expiry, and obligations. | Rule owner; S18 or S20 where applicable. | Expiry never silently extends. |
| `rollback_ref` | Prior state restored and rollback cause/evidence. | State owner; S20 for release/change qualification. | Intervening history remains visible. |

### 3.1 Envelope invariants

1. A consumer treats received versions as immutable.
2. A consumer may accept, reject, quarantine, or request correction; it may not rewrite the producer's record.
3. Rejection creates a separate consumer decision with reason, rule, evidence, and the rejected version reference.
4. Correction is issued by the owner as a new version. If the owner is unavailable or refuses, the disagreement remains Open.
5. A changed reference is a material record change, not metadata cleanup.
6. Deleting history, masking contrary evidence, reusing an ID, or changing scope without a version is invalid.
7. Record validity, evidentiary support, gate result, approval, implementation, and release are distinct fields/states.

### 3.2 Conceptual envelope families

| Family | Owner | Required payload beyond universal envelope | Must reference, not absorb |
|---|---|---|---|
| Requirement/question/decision/status | S02 | Requirement or question identity, normative text, exclusions, decision owner, coverage, dependencies, completion semantics. | S03 sources, S18 policy, S20 gates/qualification. |
| Source/provenance/interests | S03 | Source identity, authority claim, applicability, version/freshness, locator, chain of custody, interests, framing, sponsorship, conflicts. | S02 requirement meaning, S18 enforcement, S20 qualification. |
| Security/privacy/consent/enforcement | S18 | Data/action/tool/provider class, subject, purpose, consent, allow/deny/constraint, least privilege, retention, isolation, incident/containment. | S02 requirement identity, S03 epistemic truth, S20 independent qualification. |
| Gate/evidence/qualification/change | S20 | Gate definition, evidence eligibility, evaluation method/result, independence lineage, exception/release/change/rollback state, monitoring obligation. | S02 authorship, S03 source authorship, S18 enforcement, user/product approval. |

## 4. Shared-field ownership matrix

Ownership means authority to define and revise the value. Other systems may reference it, constrain its use through their own owned decisions, or reject an incompatible input.

| Shared concept/field | Sole owner | Permitted consumer action | Prohibited transfer |
|---|---|---|---|
| Requirement/question/decision/exclusion IDs and lifecycle | S02 | Reference, report coverage, request revision. | S03/S18/S20 must not create or transition them. |
| Requirement meaning, owner, coverage, completion semantics | S02 | Constrain execution through owned policy/gate records. | A constraint does not rewrite the requirement. |
| Source identity, authority claim, applicability, freshness | S03 | Cite, challenge, reject for stated use. | S02/S18/S20 must not rewrite source truth. |
| Provenance, actor/tool/source lineage, locator | S03 | Append owned execution/evaluation lineage by reference. | Consumers must not replace source lineage. |
| Interests, framing, sponsorship, source conflict | S03 | Use in evaluation or policy decisions. | S20 may qualify evidence but not author source facts. |
| Security/privacy/data/tool/provider classification | S18 | Bind records/actions to classifications. | S02/S03/S20 must not weaken classification. |
| Consent, least privilege, allowed/denied flows | S18 | Obey, reject, or request policy change. | A requirement or release decision cannot override enforcement. |
| Isolation, secrets, retention policy, incident containment | S18 | Supply inputs and evidence; follow decision. | S20 qualification cannot substitute for S18 enforcement. |
| Gate definitions and evidence-eligibility rules | S20 | Supply evidence and evaluate when qualified. | S02/S03/S18 cannot silently redefine the gate. |
| Evaluation assets and qualification/release/change/rollback state | S20 | Reference or challenge. | S20 cannot supply external approval or verify itself. |
| User/product approval | Applicable user/product authority | Systems record the explicit decision by reference. | No system, designer, or gate infers approval. |
| Independent-verification decision | Qualified independent reviewer | Systems record the decision and lineage. | Author, subject, or rule owner cannot self-promote. |
| Interface direction and record owner | F0; later accepted F1/change authority | Propose a versioned change. | A package cannot unilaterally transfer ownership. |
| Envelope field semantics and dependency types | F0; later accepted F1/change authority | Specialize without contradiction. | A package cannot redefine shared semantics locally. |
| Per-record emitted value and version chain | Named producing system | Reject or request correction. | Consumer mutation is forbidden. |

**Owner check:** Every row has exactly one owner rule. Referenced-value ownership and reference-binding ownership are deliberately separate; the producer owns the accuracy of the binding but never acquires the referenced authority.

## 5. Authority matrix and self-approval prohibition

| Decision or claim | Deciding authority | Evidence role | Forbidden substitute |
|---|---|---|---|
| Value-bearing product intent or final product approval | Direct applicable user/product authority | May inform decision; cannot silently decide it. | Designer, system, evaluator, or inferred preference. |
| Evidence-answerable factual claim | Qualified evidence and claim-verification process | Resolves, narrows, contradicts, or leaves unknown. | Asking user to choose a fact because evidence is missing. |
| Requirement identity/state | S02 | Evidence may justify change. | Source, security, or qualification owner. |
| Source authority/applicability/provenance | S03 | Competing sources remain visible. | Requirement or release owner. |
| Security/privacy/consent enforcement | S18 | Threat, consent, and incident evidence informs policy. | Requirement priority or release approval. |
| Gate/evidence qualification and release/change state | S20 | Eligible evidence supports evaluation. | Self-authored evidence, product approval, or S18 enforcement. |
| Independent verification | Qualified reviewer independent of author, subject, and load-bearing lineage | Retained reproduction/audit evidence required. | Self-check, different label on same agent, or S20 verifying S20. |
| Exception | Owner of controlling rule plus any required higher authority | Risk/evidence and expiry required. | Silent deviation or post-hoc approval. |

Prohibited transitions include: author self-check → Independently verified; S20-authored rule → independently verified by S20; gate pass → user approval; user approval → evidence truth; release approval → security allow; requirement priority → source correctness. Shared provider/model/source/prompt/tool/benchmark/assumption lineage must be disclosed; a reviewer with load-bearing common-mode dependence is not sufficiently independent until the applicable qualification rule says otherwise.

## 6. Evidence and gate-state contract

### 6.1 Evidence record minimum

Every evidence record includes: addressed claim/requirement/interface/dependency/decision/gate; evidence type; `planned` or `observed` state; producer and collection time; source/provenance/version/locator; method and oracle/comparison rule; scope/environment/assumptions; actual result; support direction (`supports`, `contradicts`, `narrows`, `inconclusive`); uncertainty/defects/limitations; reviewer and independence lineage; conflicts/corrections/supersession/exceptions; retention, integrity, and availability.

### 6.2 Gate evaluation

| Status | Entry condition | Exit/transition rule |
|---|---|---|
| Open | Required definition, evidence, execution, authority, or review is absent or unresolved. | Move only after the missing condition is actually evaluated. |
| Self-check passed | Author evaluated every acceptance condition and retained supporting observed evidence. | May remain; cannot become independent without a qualified separate review. |
| Independently verified | Qualified independent reviewer reproduced/audited every applicable condition and retained evidence plus lineage. | New contradictory evidence reopens or fails affected scope through a new evaluation version. |
| Failed | An executed evaluation did not meet at least one applicable acceptance condition. | Correction and a new evaluation may produce a new status; failure remains retained. |

Rules: missing evidence is Open; unmet evaluated condition is Failed; planned evidence is never a result; conflicts remain visible; no majority vote erases a valid minority finding; gate, evidence, approval, implementation, and release states never imply one another.

### 6.3 Representative prohibited trace

`EV-7 planned` → `Gate self-check passed` is invalid because there is no observed result. `Author-A self-check passed` → `Author-A independently verified` is invalid because lineage is not independent. The valid path is `EV-7 observed` → `Author-A self-check passed` → `Reviewer-B lineage-qualified reproduction` → `Reviewer-B independently verified`, with all four versions retained.

## 7. Conflict and change state model

### 7.1 States

`Current`, `Challenged`, `Conflict open`, `Correction proposed`, `Superseded`, `Exception active`, `Exception expired`, `Rollback proposed`, `Rolled back`, and `Closed` are record-history states, not gate statuses.

### 7.2 Required transition behavior

| Event | Required record behavior | Invalid shortcut |
|---|---|---|
| Conflict discovered | Create conflict record; preserve both records; name conflict kind, overlap, authority, owner, impact, blocked scope, and status Open. | Pick newest, highest-confidence, or convenient record silently. |
| Correction accepted | Owner emits new version with predecessor, reason, evidence, affected dependents, and correction marker. | Edit old bytes or delete old version. |
| Supersession authorized | Emit successor; name exact displaced versions and effective scope/time; retain dissent and downstream notification. | Global replacement without scope. |
| Exception granted | Record rule owner, approving authority, risk, exact scope, obligations, expiry, renewal rule, and rollback. | Permanent waiver or implicit renewal. |
| Exception expires | Deny continued deviation unless a new authorized version exists; record affected work. | Treat prior exception as continuing. |
| Rollback authorized | Name eligible target version, cause/evidence, affected records, restoration result, and follow-up gate. | Erase intervening state or assume prior version remains eligible. |
| Disagreement unresolved | Preserve positions, evidence, authority claims, decision owner, blocked scope, and Open state. | Force consensus or label approved. |

Precedence is not a universal ranking. Direct applicable user/product authority decides value choices; evidence resolves facts; S02/S03/S18/S20 retain their exclusive domains. A self-declared frozen source is an authority claim, evaluated for applicability, explicit supersession, approval state, and conflict scope.

## 8. Dependency and circular-seam register

Each entry has exactly one dependency type.

| ID | From → to | Type | Required result or reconciliation point |
|---|---|---|---|
| DEP-01 | F0 → S02 package | Design prerequisite | This contract and S02 brief available before S02 design begins. |
| DEP-02 | F0 → S03 package | Design prerequisite | This contract and S03 brief available before S03 design begins. |
| DEP-03 | F0 → S18 package | Design prerequisite | This contract and S18 brief available before S18 design begins. |
| DEP-04 | F0 → S20 package | Design prerequisite | This contract and S20 brief available before S20 design begins. |
| DEP-05 | S02 ↔ S03 shared references | Co-design dependency | RP-01 Requirement–Authority Reference Reconciliation in F1. |
| DEP-06 | S02 ↔ S18 normative constraints | Co-design dependency | RP-02 Requirement–Policy Constraint Reconciliation in F1. |
| DEP-07 | S02 ↔ S20 completion/gate references | Co-design dependency | RP-03 Completion–Qualification Reconciliation in F1. |
| DEP-08 | S03 ↔ S18 provenance/classification seam | Co-design dependency | RP-04 Provenance–Handling Reconciliation in F1. |
| DEP-09 | S03 ↔ S20 evidence eligibility/authority seam | Co-design dependency | RP-05 Source–Qualification Reconciliation in F1. |
| DEP-10 | S18 ↔ S20 enforcement/exception/release seam | Co-design dependency | RP-06 Policy–Release Reconciliation in F1. |
| DEP-11 | I02 Project Contract → consumers | Runtime input | Consumers accept/reject versioned S02 record without mutation. |
| DEP-12 | I03 Authority/Provenance Contract → consumers | Runtime input | Consumers use applicable S03 authority/provenance version. |
| DEP-13 | I18 Policy Decision → consumers | Runtime input | Consumers enforce allow/deny/constraint decision. |
| DEP-14 | I20 Qualification/Change Decision → consumers | Runtime input | Consumers apply qualified release/change/rollback state without inferring approval. |
| DEP-15 | Completed F0 package → independent F0 audit | Validation dependency | Separate reviewer evaluates FCIS-G01–G06 and failure conditions. |
| DEP-16 | Four completed packages → F1 reconciliation | Validation dependency | Cross-package comparison supplies evidence; it is not prior proof of compatibility. |

Only DEP-01–DEP-04 impose design order. DEP-05–DEP-10 are circular seams and do not authorize either package to absorb the other's ownership. Runtime feedback does not retroactively become a prerequisite, and validation evidence cannot be cited before it exists.

## 9. I01–I20 interface skeleton register

All records include the universal envelope in §3. “Correction” always means owner-issued new version; consumers may reject with a separate reasoned decision but never mutate input.

| ID | Producer → consumer | Contract and owner | Minimum payload | Authority, rejection, correction |
|---|---|---|---|---|
| I01 | S01 → S02 | Intent Contract; S01 owns intent record, S02 alone creates requirement IDs. | Objective, subgoals, assumptions, confidence, confirmation, invalidation. | S02 may reject ambiguity/request revision; S01 corrects intent by version. |
| I02 | S02 → all | Project Contract; S02. | Requirements, exclusions, questions, decisions, states, owners, coverage, gate refs, completion semantics. | Consumers reject incompatible version; only S02 changes requirement identity/state. |
| I03 | S03 → all | Authority/Provenance Contract; S03. | Controlling/competing sources, authority claims, applicability, versions, actors/tools, freshness, locators, lineage, interests/framing. | Consumers challenge or reject stated use; only S03 corrects source/provenance record. |
| I04 | S04 → S05/S06/S08/S11/S17/S18 | Task-Risk Contract; S04. | Task type, consequence, reversibility, hard constraints, action tier, control level, resource-envelope ref. | S18 may deny action through I18 without rewriting risk; S04 corrects classification. |
| I05 | S05 → S06/S07 | Eligible Capability Set; S05. | Candidates, eligibility evidence, versions, constraints, expiry, health refs, declared fallback losses. | Consumers reject stale/ineligible set; S05 revises eligibility. |
| I06 | S06 → S07/S08 | Route Contract; S06. | Selected model/tool/connection, tradeoffs, override, fallback ladder, audit refs. | Consumers reject route violating I18/I17; S06 emits corrected route. |
| I07 | S07 → S08/S09/S10/S11 | Compiled Work Package; S07. | Provider-ready instructions, immutable goal/requirements/evidence/tool/output controls, adapter-loss record. | Consumers reject loss/constraint conflict; S07 recompiles as new version. |
| I08 | S08 → S09/S11/S13 | Bounded Work Package; S08. | Scope, inputs, output, owner, authority, typed dependencies, budget, checkpoint, gates, stop condition. | Consumer rejects unbounded/unauthorized work; S08 rebundles by version. |
| I09 | S09 → S10/S13 | Evidence Record Set; S09 owns collection record; S03 source identities remain referenced. | Sources/locators/context/dates, support direction, limitations, search/rejection/missing log, coverage. | Consumers reject provenance/coverage defects; S09 corrects set without erasing omissions. |
| I10 | S10 → S12/S16 | Verified Claim Set; S10. | Accepted/narrowed/rejected/unknown claims, evidence refs, contradictions, claim type, calibrated uncertainty. | Consumers reject unsupported classification; S10 re-evaluates by new version. |
| I11 | S11 → S12 | Execution Result; S11. | Exact target, before/after state, side effects, errors, rollback state, artifacts, execution evidence. | S12 evaluates but cannot rewrite result; S11 corrects factual execution record. |
| I12 | S12 → S08/S14/S20 | Verification Decision; S12. | One permitted gate status, environment, evidence, defects, reviewer/lineage independence, completion eligibility. | Consumers reject unsupported status; only evaluator issues new decision; independent status requires qualified reviewer. |
| I13 | S13 → owners/S20 | Challenge Record; S13. | Counterexamples, assumption failures, correlation/independence findings, minority findings, resolutions, stopping record. | Target owner responds by separate correction/decision; challenge cannot mutate target. |
| I14 | S14 ↔ all | State/Resume Manifest; S14 owns manifest; referenced systems own their records. | Authoritative snapshot refs, checkpoint, exact next task, idempotency, retention, portable import/export state. | Consumers reject stale/incomplete snapshot; S14 reissues while retaining prior checkpoint. |
| I15 | S15 → S06/S07/S16 | Consented Preference Contract; S15, constrained by S18 consent. | Contextual preference, evidence/counterevidence, confidence, scope, override, version, expiry/rollback. | Consumers reject expired/unconsented preference; S15 corrects, S18 governs consent. |
| I16 | S16 → S01/S02/S15/S19 | Correction/Burden Signal; S16 owns signal, targets retain their owned records. | Corrected meaning/requirement/preference proposal, repeated failure, abandonment, density, repair outcome. | Target accepts/rejects by owned record; signal never changes target directly. |
| I17 | S17 → S04/S06/S08/S13 | Resource Contract; S17. | Estimate range, assumptions, authorized cap, actual meter, retry/fan-out limit, variance. | Consumers reject work above cap; S17 revises only with applicable resource authority. |
| I18 | S18 → S04/S05/S06/S07/S11/S14 | Security/Privacy Policy Decision; S18. | Allowed/denied data/tool/provider/action flows, classification, purpose, consent, privilege, retention, secrets, isolation, enforcement/incident controls. | Consumer must deny or request change; cannot override. S18 corrects/version-controls policy. |
| I19 | S19 → S05/S06/S08/S17/S20 | Health/Incident Decision; S19. | Health/drift threshold, disqualification, degradation/fallback, containment, recovery proof, corrective proposal. | Consumers apply or challenge; S19 corrects observed health state; S18 retains containment authority where security-related. |
| I20 | S20 → all | Qualification/Change Decision; S20. | Applicable tests/gates, evidence eligibility/result refs, baseline, qualification/release/exception/change status, version, rollback, post-release monitor. | Consumers reject unsupported decision; S20 revises. “Approved” requires external authority; S20 cannot self-verify. |

## 10. Unresolved-decision register

| ID | Open question | Decision owner | F0 treatment | Blocked scope |
|---|---|---|---|---|
| Q-U01 | Does the current instruction merely prevent the earlier frozen two-system boundary from biasing reliability-system count, or supersede that product-separation decision? | User/product authority | Open. Preserve the separation contract but do not use it to determine reliability-system count; neither merge nor reject it. | Any product decision that changes the earlier separation boundary; not F0 shared-contract work. |
| Q-U02 | Is the provider-neutral approval packet approved whole, to be split, or only proposal evidence? | User/product authority | Open. Treat every packet rule as proposal evidence. | Any claim of approval or downstream reliance on the packet as controlling product authority. |
| Q-U06 | Can the two named frozen visual-authority files be supplied, or should visual authority reopen? | User/product authority | Open and nonblocking for F0. | Later pixel/layout authority; F0 contains no pixel-level design. |

Independent verification of F0 and user/product approval of F0 are also Open, but they are gate/approval states rather than user-question IDs.

## 11. Follow-on package map

The separately usable briefs are:

- `follow-on/S02-REQUIREMENT-DECISION-COMPLETION-BRIEF.md`
- `follow-on/S03-SOURCE-AUTHORITY-PROVENANCE-BRIEF.md`
- `follow-on/S18-SECURITY-PRIVACY-CONSENT-BRIEF.md`
- `follow-on/S20-EVALUATION-RELEASE-CHANGE-BRIEF.md`

Their existence does not activate them. Each must return assumptions, conflicts, and proposed F0 changes rather than changing F0 unilaterally.

## 12. F1 reconciliation contract

### Entry conditions

1. F0 is available with accurate FCIS statuses and has completed the separately authorized independent audit or carries explicitly accepted defects.
2. All four package outputs exist as versioned, independently usable artifacts.
3. Each package declares scope, inputs, outputs, authority, exclusions, gates, evidence needs, unresolved decisions, assumptions/conflicts, and F0 change proposals.
4. Every dependency is typed and every circular seam maps to RP-01–RP-06.
5. The reconciliation authority, independent reviewer, and user-owned decision route are named; no participant may self-approve a load-bearing claim.

### Comparison method

Normalize each proposed shared field against this dictionary and envelope; compare owner, meaning, cardinality, authority, version/change behavior, rejection/correction, security/retention binding, gate/evidence effect, and dependency type. Build a seam-by-seam variance register for RP-01–RP-06. Classify each variance as compatible specialization, conflict, missing contract, or prohibited ownership transfer.

### Decision authority and dissent

The owner of a shared semantic defined by F0 cannot be changed by a package alone. Reconciliation may propose a versioned F0 change; applicable domain owner decides domain values, evidence resolves facts, and user/product authority decides value-bearing product choices. Preserve minority findings, common-mode concerns, rejected alternatives, and user-owned Open questions. No consensus count overrides authority.

### Exit conditions

F1 may be named only when every shared field has one owner; all six seams are reconciled; every accepted change is versioned with impact and migration notes; all conflicts are resolved or explicitly Open with blocked scope; no prerequisite is misclassified; independent-review and user/product approval states are accurate; all four packages still satisfy their boundaries; and applicable reconciliation gates are Self-check passed or Independently verified with retained evidence.

If required design/evidence/authority is missing, issue an **Open reconciliation report**. If an evaluated exit condition fails, issue a **Failed reconciliation report**. Neither report is F1. Roll back only to a named eligible F0/package version and retain the failed attempt.

## 13. Exact five-step follow-on sequence

1. **S02 package:** Design requirements, questions, decisions, exclusions, status, coverage, and completion semantics only. Use F0; do not design S03, S18, or S20. Deliver a standalone S02 package plus assumptions, conflicts, and proposed F0 changes.
2. **S03 package:** Design source authority, provenance, freshness, conflicts, institutional interests, framing, and export only. Use F0; do not treat the S02 package as authority over S03. Deliver a standalone S03 package plus assumptions, conflicts, and proposed F0 changes.
3. **S18 package:** Design security, privacy, consent, data/tool/provider enforcement, isolation, retention, and incident controls only. Use F0; do not transfer S02, S03, or S20 authority into S18. Deliver a standalone S18 package plus assumptions, conflicts, and proposed F0 changes.
4. **S20 package:** Design evaluation assets, gate/evidence qualification, fairness, stochastic/common-mode/evaluation-gaming checks, qualification, exceptions, release/change governance, and rollback requirements only. Use F0; do not claim independent or user/product approval. Deliver a standalone S20 package plus assumptions, conflicts, and proposed F0 changes.
5. **Foundation reconciliation:** Compare all four completed packages against F0. Resolve shared-schema and authority conflicts without merging ownership; retain dissent and user-owned decisions; version every accepted F0 change. Produce **F1 Reconciled Foundation Baseline** only if every exit condition is satisfied. Otherwise produce an Open or Failed reconciliation report.

## 14. FCIS gate assessment

| Gate | F0 evidence | Status | Limitation / remaining gap |
|---|---|---|---|
| FCIS-G01 | §4 complete shared-field ownership matrix and owner check. | Self-check passed | Author self-check only; independent audit Open. |
| FCIS-G02 | §3 envelope, invariants, immutable version chain, and §6.3 mutation/supersession trace. | Self-check passed | Conceptual design only; no implementation test. Independent audit Open. |
| FCIS-G03 | §7 state/transition model, preserved competing records, authority/impact rules, and Q register. | Self-check passed | User-owned questions remain Open by design. Independent audit Open. |
| FCIS-G04 | §§5–6 reviewer separation, lineage, gate transitions, and prohibited trace. | Self-check passed | No independent review performed; qualification design remains for S20. |
| FCIS-G05 | §8 register assigns exactly one of four types to every listed dependency and names RP-01–RP-06. | Self-check passed | Package discoveries may add typed dependencies during later reconciliation. Independent audit Open. |
| FCIS-G06 | §11 and four standalone briefs, each with scope, inputs, outputs, authority, exclusions, gates, evidence, decisions, assumptions/conflicts, and change handling. | Self-check passed | Brief usability has not been independently cold-start tested. |

F0 is a proposed, self-checked design. It is not F1, independently verified, user/product approved, implemented, released, or production validated.
