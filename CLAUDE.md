# DIVERGENCE.AI — BINDING CLAUDE REPAIR LAW

## Identity

- Repository: `thatoneweirdfella1/Claude-Project-02`
- Only writable branch: `claude/whole-site-repair-v1`
- Clean starting commit: `e1a4b0cb97572ed023c281efe909f2bd41b880ca`
- Work order: `docs/repair-authority/CLAUDE-WHOLE-SITE-REPAIR-WORK-ORDER.md`
- Progress ledger: `docs/checkpoints/CLAUDE-REPAIR-PROGRESS.md`

This file is binding. Claude must read it at the start of every session and before delegating any work.

## Mission

Complete every remaining user-visible repair in the work order. Do not replace implementation with inspection, planning, documentation, or claims that existing code looks correct.

## Required autonomous loop

Claude is the coordinator. The user does not manage branches, agents, tests, checkpoints, or failed work.

For each requirement, in order:

1. Give a fresh implementation agent the requirement and relevant approved product authority.
2. The implementer reproduces the failure, identifies the actual cause, implements the smallest complete repair, adds outcome-level regression tests, runs affected tests and the build, and commits only that repair.
3. Give the commit to a different fresh verification agent that did not implement it.
4. The verifier must try to break the exact rendered user workflow, inspect the diff, test success and failure paths, and test reload, persistence, cancellation, or partial failure where applicable.
5. Code presence, handler presence, unit tests, build success, plans, checklists, and prior AI claims are not browser proof.
6. If verification fails, automatically return the exact failure for another implementation pass. Repeat without involving the user.
7. If verification passes, update the progress ledger with full commit SHA and evidence, then continue automatically.
8. After every five passed requirements, commit a checkpoint and continue without waiting.

## Completion law

Never mark a requirement complete unless its exact user-visible outcome was performed in the rendered application by a fresh verifier.

Use only:
- `PASSED — EVIDENCE RECORDED`
- `FAILED — RETURNED FOR REPAIR`
- `BLOCKED — EXACT EXTERNAL REQUIREMENT RECORDED`

Never say all tests pass when any test fails. Never use an abbreviated or inconsistent SHA as deployment identity. Never mark an empty verification matrix complete. Never let Claude grade its own implementation pass.

## Final whole-site verification

After individual requirements pass, a fresh verification agent must census every visible screen and control: expected result, actual result, evidence, PASS/FAIL. Every failure returns automatically to repair. Repeat until no locally testable failure remains.

## Donor restriction

The rejected branch `account2/layer-8-candidate-v1` may be inspected only for defect ideas and tests. Do not merge, cherry-pick, copy its application code, or inherit its completion claims.

## Safety

Allowed: inspect, edit, test, build, run locally, use local simulations, commit, and checkpoint on this branch.

Forbidden without new explicit user authorization: modify another branch, merge, open a PR, deploy, use credentials or secrets, call paid/live providers, spend money, change production, or alter real user data.

## Resume rule

At every checkpoint update `docs/checkpoints/CLAUDE-REPAIR-PROGRESS.md` with passed, failed, blocked, current full SHA, current requirement, and exact next action. A new session resumes from that file without asking the user to reconstruct context.
