# Standalone S03 Design Brief — Source Authority, Provenance, and Conflict Control

**Status:** Future bounded assignment; Blocked and not authorized by F0 completion

**Purpose:** Design S03 only, using the minimum foundation contract below without consulting the master blueprint.

## Assignment and boundary

Design the complete conceptual S03 contract for source identity, authority claims, applicability, provenance, freshness, version/actor/tool lineage, conflicts, institutional interests, framing, sponsorship, locators, and portable source manifests. Do not design requirement meaning (S02), security/privacy enforcement (S18), qualification/release/change governance (S20), another subsystem, implementation, or UI.

## Foundation rules that bind this package

- Every record has a stable ID, immutable monotonic version, schema version, owner, producer, authority/provenance references, scope, separate lifecycle status, gate references, security/retention bindings, predecessor/change reason, conflict/supersession/exception/rollback history, and integrity state.
- Consumers may accept, reject, quarantine, or request correction; only the owner emits a corrected version. History, rejected sources, searches, and contrary evidence remain visible.
- Gate status is exactly `Self-check passed`, `Independently verified`, `Failed`, or `Open`, separate from evidence, authority, approval, implementation, and release state.
- Evidence resolves evidence-answerable facts; direct user/product authority decides value choices. A self-declared frozen source is an authority claim, not automatic control.
- Dependencies are exactly one of Design prerequisite, Co-design dependency, Runtime input, or Validation dependency.

## Required inputs

1. F0.1 foundation contract and this brief.
2. Source-bearing inputs and producer lineage needing stable identity; requirement/gate/policy records only as references to intended use.
3. I09 evidence collection records as runtime references without transferring S03 source ownership to S09.
4. Open Q-U01, Q-U02, and Q-U06 with their scope effects.

## Required outputs

Produce a standalone S03 package defining:

1. Source, authority claim, applicability, provenance event, freshness, conflict, interest/framing/sponsorship, locator, and portable-manifest records.
2. Authority/applicability evaluation and conflict/precedence behavior that preserves competing records and decision ownership.
3. I03 Authority/Provenance Contract payload, validation, export/import identity, rejection, and correction behavior.
4. Source/version lineage across humans, systems, tools, transformations, and derived artifacts.
5. Rules that keep source authority distinct from requirement meaning, security handling, evidence qualification, approval, and implementation.
6. Typed dependency register and explicit RP-01, RP-04, and RP-05 seam proposals.
7. Acceptance gates, evidence needs, representative traces, unresolved decisions, assumptions/conflicts, and proposed F0 changes.

## Unique authority

S03 owns source identity, claimed authority, applicability, provenance, freshness, conflicts, source versions, actor/tool lineage, institutional interests, framing, sponsorship, locators, and portable source manifests. It does not decide requirement meaning, allowed data/tool flows, final evidence qualification, user/product approval, or independent verification.

The producer of another interface owns its binding to an S03 reference and must correct a wrong binding; it never acquires the referenced source identity or authority.

## Exclusions and rejection conditions

Reject the package if it turns inclusion into approval, deletes a rejected/contrary source, uses newest-source-wins as universal precedence, transfers factual questions to the user merely because evidence is missing, rewrites S02/S18/S20 records, infers Q-U01/Q-U02/Q-U06, selects technology, or hides common-mode lineage.

## Gate and evidence requirements

Retain: complete field/owner table; source create→derive→correct/supersede trace; competing-authority conflict left Open with scope/owner; stale-source evaluation; portable-manifest round-trip requirements (planned, not executed); consumer rejection/correction trace; duplicate/orphan owner check; typed dependency register. Only Self-check passed may be designer-declared; independent verification and approval remain Open.

## Unresolved decisions and assumptions

- Q-U01: preserve the prior separation authority claim but do not use it to choose reliability-system count.
- Q-U02: approval packet remains proposal evidence.
- Q-U06: visual authority remains Open and outside S03 unless separately activated.
- Assumption: evidence eligibility remains S20-owned even when S03 describes the evidence source.

## F0 change-proposal handling and handoff

Do not edit F0 silently. Return each proposed change with current clause, proposed semantics, reason, affected owner/interface/dependency, migration, risks, dissent, and required authority. Deliver the S03 package plus assumptions, conflicts, and proposed F0 changes, then stop. Do not start S02, S18, S20, F1, or implementation.
