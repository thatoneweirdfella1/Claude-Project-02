# Current Task — F0 Only

## Task identity

- **ID:** F0
- **Title:** Foundation Contract and Interface Skeleton
- **Phase:** Design
- **Status:** Open; not started
- **Authoritative assignment:** `DIVERGENCE-F0-STANDALONE-HANDOFF.md`
- **Untouched safety/layout branch:** `claude/remaining-second-pass-v1`
- **Only working branch:** `divergence/reliability-v1`
- **Baseline commit:** `10894f704a39b6c56a7fadfafb54275b82526c33`
- **Repository mutation:** Authorized only on `divergence/reliability-v1` and only for F0/control records

## Exact purpose

Produce only the bounded F0 shared contract and interface skeleton that allows later separate S02, S03, S18, and S20 designers to use the same terms, record envelopes, ownership boundaries, authority rules, evidence semantics, dependency types, and interface skeletons.

## Allowed work

- Read the standalone F0 assignment and the control packet.
- Produce the twelve F0 deliverables it requires.
- Produce separate bounded follow-on briefs for S02, S03, S18, and S20.
- Record unresolved decisions without resolving user-owned authority.
- Self-check FCIS-G01–G06 and RCG-01–RCG-04 with retained evidence.
- Update the continuity, decision, evidence, task-index, and handoff records.

## Prohibited work

- Do not design S02, S03, S18, or S20 in full.
- Do not perform F1 reconciliation.
- Do not implement code, select technology, modify the interface, or alter the existing layout.
- Do not create another repository or branch. Do not modify the safety branch.
- Do not add systems, tasks, requirements, or “helpful” work beyond the assignment.
- Do not mark any work independently verified or user-approved without the required authority and evidence.

## Required stop condition

Stop after returning the complete F0 package, unresolved decisions, FCIS and repository-continuity gate tables, four follow-on briefs, reconciliation criteria, exact follow-on sequence, and updated handoff. Do not begin F1 or any system package.

## Exact next action

Execute `DIVERGENCE-F0-STANDALONE-HANDOFF.md` on `divergence/reliability-v1`, maintain this packet's records, and stop at the F0 gate report. A different qualified AI must independently audit the result before any follow-on package is unblocked.
