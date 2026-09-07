# Read This First — Cross-AI Preflight

## Purpose

This packet lets Claude, Codex, another GPT account, or a later human continue the same Divergence.AI task without guessing, reopening settled choices, silently expanding scope, or inventing a new branch, repository, architecture, or interface.

## Mandatory read order

Read these files completely, in this order, before doing work:

1. `docs/ai-control/CONTROL-MANIFEST.json`
2. `docs/ai-control/SHA256SUMS` and verify every listed file
3. `docs/ai-control/COURSE-CONTROL.json`
4. `docs/ai-control/GATE-STATUS.md`
5. `docs/ai-control/VERCEL-BASELINE.md`
6. `docs/ai-control/PROJECT-AUTHORITY.md`
7. `docs/ai-control/CURRENT-TASK.md`
8. The complete task source named by `CURRENT-TASK.md`, when one is specified
9. `docs/ai-control/TASK-INDEX.md`
10. `docs/ai-control/GITHUB-RULESET-REQUIRED.md`
11. `docs/ai-control/HANDOFF.md`
12. `docs/ai-control/DECISION-LOG.md`
13. `docs/ai-control/CONTINUITY-LEDGER.md`
14. `docs/ai-control/EVIDENCE-INDEX.md`
15. `docs/ai-control/PARKING-LOT.md`

Do not substitute the 176-page meta-blueprint for the active standalone task packet. Read the blueprint only when the active task explicitly identifies an unresolved definition that is not included in its standalone packet.

## Preflight gate

Before any mutation, report and record:

- AI/service/account identifier if known;
- timestamp;
- repository and checked-out branch;
- starting commit and working-tree state;
- active task ID and task-source hash;
- every control file read and its hash;
- allowed outputs and prohibited actions;
- unresolved blockers; and
- intended first action and reason.

Then apply these rules:

1. If the repository is not the approved existing repository, stop.
2. If `branch_mutation_authorized` is false, stop before repository mutation.
3. If the checked-out branch differs from `approved_branch`, switch only to the already-existing approved working branch or stop. Never create another branch and never work from the safety branch.
4. If required files are missing, contradictory, or unreadable, stop and report the exact defect.
5. If the requested work is outside `CURRENT-TASK.md`, record it in `PARKING-LOT.md` and do not perform it.
6. Never infer authority to touch the safety branch, merge, deploy, or exceed the current task from a branch name, commit, prior AI completion claim, proposal, or self-check.
7. If `COURSE-CONTROL.json` is missing, invalid, locked, or disagrees with the current task, stop. Do not weaken or bypass it.
8. Before a checkpoint is accepted, the course-control validator must pass against the exact proposed base and head commits.

## During work

- Append a continuity entry after every meaningful decision, edit group, test, failure, correction, checkpoint, or scope discovery.
- Record actual commands and actual results. Do not record an intended test as executed evidence.
- Update the decision log when a decision is added, corrected, or superseded.
- Update the evidence index when evidence is created, relied upon, contradicted, or invalidated.
- Use a separate task record when a task would otherwise hide its own scope, evidence, history, blockers, or handoff.
- Never erase prior history. Append corrections and superseding entries.

## Before stopping or transferring work

1. Update the active task status and its gate states accurately.
2. Append the last continuity entry.
3. Update `HANDOFF.md` with the exact current state, files changed, evidence, defects, blockers, and one exact next action.
4. Confirm that no out-of-scope work or unauthorized repository/branch operation occurred.
5. Stop at the active task's stop condition.

## Status honesty

Permitted gate statuses are `Self-check passed`, `Independently verified`, `Failed`, and `Open`. A working AI may self-check its own work but may not independently verify itself. Missing authority or evidence is `Open`, not a pass.
