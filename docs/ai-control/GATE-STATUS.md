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
| G1-G02 Resumable checkpoints | Self-check passed | Machine state, same-task interrupted/resumable handling, remote-checkpoint identity, status projection, and replacement-AI output are implemented and locally tested. Remote publication and independent audit remain Open. |
| G1-G03 Audit/dependency blocking | Self-check passed | Typed prerequisites, state transitions, separate review evidence, accepted-baseline restrictions, and plain-language blocked-next output are implemented and locally tested. Independent audit remains Open. |
| G1-G04 Contamination containment | Self-check passed | Multi-level lineage propagation, contaminated-acceptance rejection, and verified-baseline recovery boundary are implemented and locally tested. Independent audit remains Open. |
| G1-G05 Adversarial enforcement | Self-check passed | Focused controller harness passes 41/41; unit tests pass 911/911 in 102 files; desktop passes 1/1; lint exits 0 with 17 retained warnings; production build exits 0 with the retained chunk-size warning. Exact checkpoint publication and independent G1-E challenge remain Open. |
| G1-G06 Independent cold start | Failed | Independent G1-E audit found stale checkpoint direction and a same-change common-mode bypass because candidate-controlled workflow, validator, tests, policy, state, and hashes can approve their own weakening. |

G1-E is complete with a retained **Failed** verdict. G1 is not accepted. G2 hardening is the exact authorized correction; F0 artifacts remain frozen and all dependent/product-system work remains blocked.

## G2 hardening status

**Authority correction D-016:** routine human approval and second-account review are rejected as normal-operation dependencies. G2 remains Open until a candidate-independent controller automatically performs validation, independent-AI audit assignment, correction/retry, re-audit, acceptance, and dependency advancement. The G3-A bootstrap contract is a proposed design artifact, not implementation evidence.

| G3-A slice | State | Evidence and limitation |
|---|---|---|
| Schemas and transition engine | Self-check passed | Six JSON schemas, transition table, and eight focused tests cover authenticated actors, distinct audit, automatic acceptance, product-decision blocking, correction, dependency unlock, and lease recovery. Candidate-side only; external authority remains Open. |
| Controller core | Self-check passed | Six controller tests plus eight transition tests pass. Automatic audit, correction, correction re-audit, acceptance, dependency unlock, and recovery are executable through adapters. External live execution remains Open. |
| GitHub App boundary | Self-check passed | Seven App tests plus fourteen controller/transition tests pass. Live preflight proves `build` is immutable and rejects that route. App registration, deployment, and host readback remain Open. |
| Durable external-service source | Self-check passed | Preview-only service source adds Redis state/history/queue/lease/retry/dead-letter records, exact host repository/SHA validation, GitHub App authentication, credential-separated worker launchers, and observe-mode endpoints. Six new hostile tests pass; deployment, resources, credentials, and live hostile proof remain Open. |
| Vercel target isolation | Failed — BLOCKING | The isolated project is unlinked and inert, but authenticated deployment readback reports `target: production` despite the deploy response saying preview. Deployment `dpl_4NLyjv7qFrTSzwxP6JNxr5euUMXF` must be removed/replaced before configuration or use. |

| Gate | State | Meaning |
|---|---|---|
| G2-G01 | Self-check passed | Confirmed-base freshness, ownership lock, audit queue, and exact action are mechanically checked by focused tests. Base commit c4650d473800217e9c8e2e22a5b12d0fd61f5b5c matches last_confirmed_remote_checkpoint. |
| G2-G02 | Awaiting independent audit | Prerequisite changed from G1:Accepted to G2:Accepted; gate deadlock fix allows independent auditor to publish review + synchronized state. Publication preflight passes at c4650d4. Checkpoint lineage: fe37f59 (repairs) → 34ca208 (state sync) → f3b8ecc (records) → 1ec11e1 (sync) → c4650d4 (final validation). Awaiting independent verification at c4650d4. |
| G2-G03 | Self-check passed | Protected control-plane changes require owner, gate, audit requirement, residual risk, and cannot carry their own review/acceptance claim. Audit publication now requires host-authenticated reviewer (not candidate-controlled strings). |
| G2-G04 | Open — BLOCKING | GitHub Actions host authentication remains unresolved. Requires cryptographic proof of reviewer identity or explicit host configuration. This gate blocks until host provides evidence. |
| G2-G05 | Self-check passed | Provider notifications remain optional and non-authoritative; unguaranteed semantic/admin risks are explicit. |
| G2-G06 | Awaiting independent audit | Previous audit at a4f67dad found prerequisite defect. Corrections with contamination/correction distinction published at c4650d4. Independent verification must confirm: prerequisite change (G1→G2) complete, contamination logic distinguishes corrections (non-propagating) from dependents (propagating), correction/contamination hostile tests pass (G2 can be independently verified without rewriting G1:Failed), gate deadlock resolved, all records synchronized, reviewer authentication vulnerability marked Open/blocking, publication preflight passes. |
