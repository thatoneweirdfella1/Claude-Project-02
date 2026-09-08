# Current Task — G1 Only

## Task identity

- **ID:** G1
- **Title:** Continuity, Acceptance, and Contamination Controls
- **Phase:** Execution control
- **Status:** Active and safely resumable; G1-A through G1-C are published; partial G1-D is published; full G1-D verification remains
- **Task source:** `DIVERGENCE-G1-CONTROL-UPGRADE-HANDOFF.md`
- **Task-source SHA-256:** `e940049e4dffd0d87a9b303526df82c7a8f61c0a496f6afc1f6f34b9b8f75db8`
- **Canonical master blueprint:** `02-MASTER-SYSTEM-AND-REQUIREMENT-BLUEPRINT.md`, SHA-256 `d9783aa4fff475810170f2217ea2cdca1b30baefe78d21d837980943c509ea47`
- **Activation authority:** User directed the AI to begin building the complete pre-work controls with checkpoints so another AI can finish after a usage interruption; received 2026-09-08
- **Untouched safety/layout branch:** `claude/remaining-second-pass-v1`
- **Only task-writing branch:** `divergence/reliability-staging`
- **Protected integration branch:** `divergence/reliability-v1`

## Exact purpose

Finish and mechanically test the authority, continuous-checkpoint, audit-blocking, dependency, acceptance, and contamination-containment controls described by the complete G1 standalone assignment. Preserve F0 unchanged and keep every product-system task locked.

## Required outputs

1. Completed authority-package gap records without duplicating or redesigning valid existing material.
2. Continuous resumable checkpoint and cross-account takeover contract.
3. Executable task-state, dependency, audit, acceptance, lineage, contamination, and fail-closed enforcement.
4. Plain-language block/safe-switch output that removes audit and handoff memory from the user.
5. Adversarial tests and retained evidence for every required rejection and recovery case.
6. Updated durable records and small confirmed remote checkpoints on the existing staging branch.

## Allowed work

- Perform only G1-A through G1-D from the standalone assignment.
- Update only the assignment's control, governance, evidence, and validator paths.
- Commit and push small accepted checkpoints to the existing staging branch.
- Preserve optional provider-triggered audit as non-authoritative convenience only.

## Prohibited work

- Do not change the canonical blueprint, F0 artifacts, application code/tests, UI, layout, or visual baseline.
- Do not perform the independent F0 audit, S02/S03/S18/S20 design, F1, or product implementation.
- Do not create, rename, merge, rebase, force-update, deploy, or delete a branch; do not touch the safety branch.
- Do not claim independent verification, semantic perfection, product approval, implementation, or production validation.
- Do not fix P-002.

## Gate plan

- **G1-G01:** Authority-package completeness and internal consistency.
- **G1-G02:** Interrupted-task checkpoint and context-free resumption.
- **G1-G03:** Audit/dependency/acceptance blocking and plain-language notification.
- **G1-G04:** Traceable lineage, contamination propagation, and recovery boundary.
- **G1-G05:** Executable adversarial enforcement and non-bypass behavior.
- **G1-G06:** Independent cold-start audit. The author must leave this Open.

## Work history

- 2026-09-08: F0 completed by self-check and was published; independent F0 audit remained Open.
- 2026-09-08: User explicitly authorized the pre-work control upgrade with frequent checkpoints and cross-account resumption.
- 2026-09-08: G1-A began from exact remote staging commit `f6e8a344b414a5e909028fbdf547ae879ade4b58`; a clean detached worktree preserved three unrelated local-only historical G0 commits in the existing checkout.
- 2026-09-08: G1-A passed the existing 18-case controller harness, policy/task alignment, integrity, whitespace, and exact base-to-head course gate; published by non-force fast-forward as remote commit `be9c32aa2f3be93635296091fd20f0c06251c3a2`.
- 2026-09-08: The records-only safe-switch correction was published at `67d8fabaf297b0909c4551467fe56c763391474f`. G1-B then audited existing authority/layer material and added only the seven missing canonical control record types plus G1 traceability; G1-G01 is author Self-check passed pending publication and independent audit.
- 2026-09-08: G1-B was published at `27c187f7db05c4fbd7fc38ad3f25b3c5896c5465`. G1-C added machine task/dependency/acceptance/lineage state, fail-closed transition checks, plain-language status output, stronger independent-review matching, accepted-baseline protection, and 22 new focused cases; the combined harness passes 40/40 locally.
- 2026-09-08: G1-C was published at `049e2b0f7673e0b757131e4877baef77f6fe585c`. G1-D began; unsafe-interruption recovery-only behavior was added and the focused harness passes 41/41. Full repository checks were attempted together but the tool call was cancelled at the network-approval boundary before any result; they remain unfinished.

## Blockers and unresolved decisions

- No blocker prevents G1-A through G1-D.
- Independent G1 verification must remain Open for another AI.
- F0 independent audit, Q-U01/Q-U02/Q-U06, and P-002 remain Open and out of scope.

## Stop condition

Stop after G1-A through G1-D are self-checked, published in recoverable checkpoints, and the independent G1 audit is the only permitted next task. Stop earlier with a recoverable handoff if interrupted.

## Exact next action

Resume G1-D full repository verification from confirmed remote checkpoint `295a98afe05512f6aa17abfbeb06f03cf1033ceb`. Do not begin G1-E, the independent F0 audit, or any system work.
