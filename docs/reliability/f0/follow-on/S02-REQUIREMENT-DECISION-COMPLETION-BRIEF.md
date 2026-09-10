# Standalone S02 Design Brief — Requirement, Decision, and Completion Contract

**Status:** Future bounded assignment; Blocked and not authorized by F0 completion

**Purpose:** Design S02 only, using the minimum foundation contract below without consulting the master blueprint.

## Assignment and boundary

Design the complete conceptual S02 contract for requirement, question, decision, exclusion, status, coverage, owner, gate-reference, and completion-semantics identity. S02 alone creates requirement IDs and changes requirement lifecycle state. Do not design source truth/provenance (S03), security/privacy enforcement (S18), evaluation/release/change governance (S20), another subsystem, implementation, or UI.

## Foundation rules that bind this package

- Every record has a stable ID, immutable monotonic version, schema version, owner, producer, authority/provenance references, scope, separate lifecycle status, gate references, security/retention bindings, predecessor/change reason, conflict/supersession/exception/rollback history, and integrity state.
- Consumers may accept, reject, quarantine, or request correction; only the owner emits a corrected version. History and contrary evidence remain addressable.
- Gate status is exactly `Self-check passed`, `Independently verified`, `Failed`, or `Open`. It is separate from evidence, approval, implementation, and release state.
- Direct applicable user/product authority decides value-bearing product choices. Evidence resolves facts. No author/system/evaluator may independently verify or approve its own load-bearing claim.
- Dependencies are exactly one of Design prerequisite, Co-design dependency, Runtime input, or Validation dependency.

## Required inputs

1. F0.1 foundation contract and this brief.
2. I01 Intent Contract from S01: objective, subgoals, assumptions, confidence, confirmation, invalidation.
3. References—not copied authority—to I03 source/provenance, I18 security/privacy policy, and I20 qualification/change decisions.
4. Open Q-U01, Q-U02, and Q-U06 with their recorded scope effects.

## Required outputs

Produce a standalone S02 package defining:

1. Requirement, question, decision, exclusion, status, coverage, ownership, dependency, gate-reference, and completion-semantics records.
2. ID namespaces and lifecycle transitions, including correction, conflict, supersession, exception, rollback, and unresolved states.
3. I02 Project Contract payload and validation rules; S02-facing behavior for I01 and I16.
4. Rules that keep requirement state distinct from source authority, security policy, qualification, approval, and implementation.
5. Rejection/correction behavior and downstream impact notification.
6. Typed dependency register and explicit RP-01, RP-02, and RP-03 seam proposals.
7. Acceptance gates, retained evidence needs, representative traces, unresolved decisions, assumptions/conflicts, and proposed F0 changes.

## Unique authority

S02 owns requirement/question/decision/exclusion identities and their lifecycle, requirement meaning, named responsibility, coverage, and completion semantics. The named user/product authority owns value-bearing answers; S02 records the decision but does not acquire that authority.

S02 must only reference: source identity/applicability/provenance owned by S03; classifications/consent/allow-deny policy owned by S18; gate definitions/evidence qualification/release state owned by S20; independent decisions owned by qualified reviewers.

## Exclusions and rejection conditions

Reject the package if it authors source truth, weakens S18 policy, treats an S20 gate as approval, allows a consumer to mutate I02, infers answers to Open user questions, selects implementation technology, or hides a dependency/conflict. A later behavioral seam does not erase the prerequisite F0 → S02 ordering.

## Gate and evidence requirements

Retain: a complete field/owner table; state-transition table; at least one create→correct→supersede trace; unresolved-conflict trace; completion decision showing distinct gate/approval/implementation states; I02 rejection/correction trace; duplicate/orphan ID and owner checks; typed dependency register. The designer may claim only Self-check passed. Independent verification and user/product approval remain Open unless separately performed by the proper authority.

## Unresolved decisions and assumptions

- Q-U01, Q-U02, and Q-U06 remain Open; S02 may record but not resolve them.
- Assumption: F0 envelope and authority semantics control unless a proposed change is accepted through reconciliation.
- Conflict handling: return every incompatibility as a versioned conflict with affected fields, positions, evidence, authority, and blocked scope.

## F0 change-proposal handling and handoff

Do not edit F0 silently. Return each proposed change with current clause, proposed text/meaning, reason, owner impact, interface/dependency impact, migration need, risks, dissent, and required authority. Deliver the S02 package plus assumptions, conflicts, and proposed F0 changes, then stop. Do not start S03, S18, S20, F1, or implementation.
