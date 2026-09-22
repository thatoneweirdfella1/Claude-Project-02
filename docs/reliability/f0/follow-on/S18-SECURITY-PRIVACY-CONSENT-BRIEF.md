# Standalone S18 Design Brief — Security, Privacy, Consent, and Tool Authorization

**Status:** Future bounded assignment; Blocked and not authorized by F0 completion

**Purpose:** Design S18 only, using the minimum foundation contract below without consulting the master blueprint.

## Assignment and boundary

Design the complete conceptual S18 contract for data/tool/provider classification and enforcement, consent, purpose, least privilege, secrets, isolation, retention, permitted/denied/constrained flows, action authorization, containment, and incident controls. Do not design requirement identity (S02), epistemic source truth (S03), independent qualification/release governance (S20), another subsystem, implementation, or UI.

## Foundation rules that bind this package

- Every record has a stable ID, immutable monotonic version, schema version, owner, producer, authority/provenance references, scope, separate lifecycle status, gate references, security/retention bindings, predecessor/change reason, conflict/supersession/exception/rollback history, and integrity state.
- Consumers may obey, reject, quarantine, or request correction; they may never weaken or rewrite an S18 decision. Missing permission means Open or denied according to the later explicit policy—not inferred consent.
- Gate status is exactly `Self-check passed`, `Independently verified`, `Failed`, or `Open`, separate from policy, approval, implementation, and release state.
- Direct applicable user authority governs consent/value choices, but recorded consent must meet S18 scope/purpose/version/expiry rules. A release or requirement cannot override enforcement.
- Dependencies are exactly one of Design prerequisite, Co-design dependency, Runtime input, or Validation dependency.

## Required inputs

1. F0.1 foundation contract and this brief.
2. I04 task-risk, I02 requirement, I03 provenance, I05/I06/I07 candidate/route/work instructions, I11 execution, I14 state, and relevant I19 incident records as references.
3. User/product consent or action authority only when explicit and applicable; never inferred from task presence.
4. Open Q-U01, Q-U02, and Q-U06 with their scope effects.

## Required outputs

Produce a standalone S18 package defining:

1. Classification, consent, purpose, privilege, flow/action authorization, secret, isolation, retention, enforcement, exception, incident, containment, recovery, and denial records.
2. I18 Security/Privacy Policy Decision payload and deterministic consumer obligations for allowed, denied, constrained, expired, conflicting, or missing decisions.
3. Policy correction, supersession, bounded exception, expiry, rollback, and downstream revocation/impact behavior.
4. Rules that retain requirement/source/qualification ownership while allowing S18 to deny unsafe handling or action.
5. Provider/tool/data flow boundaries and portable decision semantics without choosing vendors or implementation mechanisms.
6. Typed dependency register and explicit RP-02, RP-04, and RP-06 seam proposals.
7. Acceptance gates, threat/consent evidence requirements, representative traces, unresolved decisions, assumptions/conflicts, and proposed F0 changes.

## Unique authority

S18 owns classification and enforcement for data, tools, providers, actions, consent, least privilege, secrets, isolation, retention, permitted/denied flows, containment, and security/privacy incident controls. S18 can constrain or deny work but cannot create a requirement, declare a source true, or independently qualify/approve a release.

S20 may judge evidence or release eligibility but cannot waive S18 policy. Security-policy exceptions require S18 rule ownership and any applicable higher consent/product authority; S20 owns only the associated qualification/change state.

## Exclusions and rejection conditions

Reject the package if it treats task presence as consent, treats absent policy as allowed without an explicit rule, allows S02 priority or S20 release to override enforcement, silently shortens retention, exposes secrets in evidence, claims a security review occurred, selects a vendor/technology, or resolves Open user questions.

## Gate and evidence requirements

Retain: complete field/owner table; allow/deny/constrain/missing/expired decision traces; consent scope and revocation trace; least-privilege and retention conflict examples; exception→expiry→rollback trace; incident containment/recovery evidence requirements (planned unless observed later); consumer rejection/correction trace; typed dependency register. Designer self-check is not a security audit; independent verification and approval remain Open.

## Unresolved decisions and assumptions

- Q-U01 and Q-U02 remain Open and cannot weaken policy.
- Q-U06 remains Open/nonblocking because this package contains no visual implementation.
- Assumption: no provider, tool, classification taxonomy, or retention duration is selected in this conceptual brief.
- Conflicts with requirements, provenance, or qualification remain versioned and route to RP-02/RP-04/RP-06.

## F0 change-proposal handling and handoff

Do not edit F0 silently. Return each proposed change with current clause, proposed semantics, reason/threat, owner/interface/dependency impact, migration and revocation impact, risks, dissent, and required authority. Deliver the S18 package plus assumptions, conflicts, and proposed F0 changes, then stop. Do not start S02, S03, S20, F1, or implementation.
