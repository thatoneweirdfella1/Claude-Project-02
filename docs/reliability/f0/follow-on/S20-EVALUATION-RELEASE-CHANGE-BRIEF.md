# Standalone S20 Design Brief — Evaluation, Release, and Change Governance

**Status:** Future bounded assignment; Blocked and not authorized by F0 completion

**Purpose:** Design S20 only, using the minimum foundation contract below without consulting the master blueprint.

## Assignment and boundary

Design the complete conceptual S20 contract for evaluation assets, gate/evidence qualification, fairness, stochastic and common-mode risk, evaluation gaming, qualification, exceptions, release/change governance, rollback requirements, and post-release monitoring. Do not author requirements (S02), sources (S03), security enforcement (S18), external approval, independent verification of S20 itself, another subsystem, implementation, or UI.

## Foundation rules that bind this package

- Every record has a stable ID, immutable monotonic version, schema version, owner, producer, authority/provenance references, scope, separate lifecycle status, gate references, security/retention bindings, predecessor/change reason, conflict/supersession/exception/rollback history, and integrity state.
- Consumers may accept, reject, quarantine, or request correction; only the record owner corrects by a new version. Contrary and failed evidence remains visible.
- Gate status is exactly `Self-check passed`, `Independently verified`, `Failed`, or `Open`. Missing evidence is Open; an evaluated unmet condition is Failed; a plan is not a result.
- Gate, evidence, approval, implementation, and release/change states are separate. S20 defines qualification rules but cannot independently verify or approve S20 or the combined foundation.
- Dependencies are exactly one of Design prerequisite, Co-design dependency, Runtime input, or Validation dependency.

## Required inputs

1. F0.1 foundation contract and this brief.
2. I02 requirements/completion semantics, I03 authority/provenance, I09 evidence sets, I10 claims, I11 execution results, I12 verification decisions, I13 challenges, I18 policy, and I19 health/incident decisions by reference.
3. Explicit user/product approval decisions where required; never inferred from evaluation success.
4. Open Q-U01, Q-U02, and Q-U06 with their scope effects.

## Required outputs

Produce a standalone S20 package defining:

1. Evaluation asset, gate, evidence-eligibility, evaluation run/result, reviewer-lineage, fairness, stochastic/common-mode/evaluation-gaming, qualification, release/change, exception, rollback, and monitoring records.
2. I20 Qualification/Change Decision payload; S20-facing rules for I09–I13/I18/I19.
3. Status transitions among Open, Self-check passed, Independently verified, and Failed, with separate approval/release/implementation fields.
4. Reviewer qualification and independence tests, including shared lineage and prohibited self-promotion.
5. Exception/change/rollback/post-release rules that retain failures, dissent, baselines, and affected scope.
6. Typed dependency register and explicit RP-03, RP-05, and RP-06 seam proposals.
7. Acceptance gates, evidence requirements, representative traces, unresolved decisions, assumptions/conflicts, and proposed F0 changes.

## Unique authority

S20 owns evaluation assets; gate and evidence-qualification semantics; fairness/stochastic/common-mode/evaluation-gaming checks; qualification, release/exception/change status; rollback governance; and post-release qualification requirements. It does not author requirements or sources, enforce security policy, supply user/product approval, or independently verify itself.

A qualified external reviewer owns an independent-verification decision. The applicable user/product/release authority owns approval. S18 owns security-policy allow/deny even when S20 evaluates compliance evidence.

## Exclusions and rejection conditions

Reject the package if a planned test is treated as observed, missing evidence passes, self-check becomes independent without qualified lineage, a gate pass implies approval, S20 waives S18 policy, failures/dissent disappear, stochastic/common-mode/evaluation-gaming risks are omitted, technology is selected, or Open user questions are inferred.

## Gate and evidence requirements

Retain: complete field/owner table; Open/Self-check/Independent/Failed transition traces; planned-versus-observed evidence trace; reviewer common-mode accept/reject examples; fairness/stochastic/evaluation-gaming gate requirements; exception→expiry and release→rollback traces; separate gate/approval/implementation/release example; consumer rejection/correction trace; typed dependency register. S20's designer may self-check the package but cannot independently verify it.

## Unresolved decisions and assumptions

- Q-U01, Q-U02, and Q-U06 remain Open; no evaluation result resolves a user-owned value choice.
- Assumption: thresholds, benchmark assets, release authority, and monitoring durations remain for the S20 design/user authority; this brief selects none.
- Conflicts with completion, source authority, or enforcement route to RP-03/RP-05/RP-06 and remain Open until reconciled.

## F0 change-proposal handling and handoff

Do not edit F0 silently. Return each proposed change with current clause, proposed semantics, reason, owner/interface/dependency impact, evaluation/migration impact, risks, dissent, and required authority. Deliver the S20 package plus assumptions, conflicts, and proposed F0 changes, then stop. Do not start S02, S03, S18, F1, or implementation.
