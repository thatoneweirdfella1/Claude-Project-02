# AI Course-Control Gate Status

## Purpose

Keep an AI on the single approved task without requiring the user to continually reconstruct scope, detect drift, or police branches and files.

## Current state

| Control | State | Meaning |
|---|---|---|
| One active task | Self-check passed | Machine-readable policy names F0 only; the user explicitly supplied the required activation. |
| Branch-flow restriction | Self-check passed | Validator accepts only reusable staging `divergence/reliability-staging` and protected integration `divergence/reliability-v1`; every other branch is rejected. |
| Safety branch preservation | Self-check passed | Safety branch is named protected and remains unchanged. |
| Allowed-file boundary | Self-check passed | Changes outside the active F0 profile's design-package and required control/continuity paths fail. |
| Required continuity records | Self-check passed | Ledger, evidence, handoff, and hashes must change with every accepted checkpoint. |
| Append-only work history | Self-check passed | Rewriting or truncating the continuity ledger fails. |
| Evidence integrity | Self-check passed | Every listed SHA-256 hash must match. |
| Self-declared independent verification | Self-check passed | New independent-pass states require a separate review artifact. |
| GitHub workflow execution | Self-check passed | Run `34066339481` completed successfully for commit `d417f10cd3ee543fb0facde7bd620b0a029ebd72`. |
| Reusable staging branch | Self-check passed | `divergence/reliability-staging` was explicitly authorized and created from integration commit `7681344918a912f0ac35a2fb15c2b41b85638a3f`; no per-task branches are allowed. |
| GitHub non-bypass enforcement | Independently verified | API readback confirms all four required rulesets are Active with exact targets, rules, empty bypass lists, and no current-user bypass. Invalid checkpoint `4d6755ac14753d8dfa0bd0174b4f162f13c1d2cc` was rejected by run `34143620380`. |
| Cold-start AI continuity trial | Independently verified | A fresh AI used only exact-remote GitHub files at `e1b9f8960825aa9c18b1bc14182862d701f461ab`, followed the mandatory order, and reconstructed the complete state without the blueprint or conversational context. |

G0 is complete by self-check with external enforcement and RCG-04 independently verified. B0 installed the exact supplied canonical master blueprint and is complete by self-check. The user separately and explicitly activated F0 on 2026-09-08. This activation authorizes only the bounded F0 design and its required records; it does not authorize a follow-on system package, F1, application implementation, merge, or deployment.

## F0 FCIS status

| Gate | State | Retained evidence and limitation |
|---|---|---|
| FCIS-G01 | Self-check passed | F0 §4 contains 15 shared-concept rows with exactly one owner rule; duplicate/orphan parser passed. Independent audit Open. |
| FCIS-G02 | Self-check passed | F0 §3 defines versioned immutable envelopes and rejection/correction rules; §6.3 contains representative prohibited/valid traces. Conceptual only; independent audit Open. |
| FCIS-G03 | Self-check passed | F0 §7 preserves competing records, authority, downstream impact, exceptions, rollback, and Open disagreement. User decisions remain Open. |
| FCIS-G04 | Self-check passed | F0 §§5–6 separate author/evaluator/approval authority and prohibit self-promotion, including common-mode lineage. No independent review occurred. |
| FCIS-G05 | Self-check passed | F0 §8 has 16 dependencies, each assigned one of four types, with RP-01–RP-06 for every registered co-design seam. Independent audit Open. |
| FCIS-G06 | Self-check passed | Four standalone briefs contain scope, inputs, outputs, authority, exclusions, gates/evidence, decisions, assumptions/conflicts, and F0 change handling. Cold-start usability audit Open. |

## F0 repository-continuity status

| Gate | State | Meaning |
|---|---|---|
| RCG-01 | Self-check passed | Required entry/control files and complete F0 preflight read receipt are retained in CL-0021. |
| RCG-02 | Self-check passed | Work used only existing staging at base `9323ed157c6739a76a24e8b6a09c11f2f136ca18`; no branch/safety mutation. |
| RCG-03 | Self-check passed | Diff is limited to F0 design and allowed control records; P-002 stayed parked; no app/layout work occurred. |
| RCG-04 | Independently verified | Existing exact-remote repository-only continuity evidence E-018 remains valid for the control system. F0-specific handoff clarity is author self-checked and awaits the independent F0 audit. |

F0 is not F1, independently verified, user/product approved, implemented, released, or production validated.

## G1 control-upgrade status

| Gate | State | Current evidence and limitation |
|---|---|---|
| G1-G01 Authority package | Self-check passed | G1-B retained existing authority/layer sources, recorded the gap audit, and added bounded canonical map, constitution, traceability, assignment, meaning, lifecycle, and status-view contracts. Independent audit Open. |
| G1-G02 Resumable checkpoints | Open | Required behavior is frozen in the G1 assignment; implementation and interruption test are G1-C/D. |
| G1-G03 Audit/dependency blocking | Open | Required behavior is frozen; executable transition and plain-language blocker tests remain. |
| G1-G04 Contamination containment | Open | Required lineage, descendant blocking, and recovery behavior is frozen; implementation/tests remain. |
| G1-G05 Adversarial enforcement | Open | Existing 18-case G0 harness remains valid but does not cover the new G1 cases. |
| G1-G06 Independent cold start | Open | Must be performed by a separate AI after G1-A–G1-D are published. |

G1 is the only active task. F0 artifacts remain frozen at their prior self-check state. Independent F0 audit and all product-system work remain blocked.
