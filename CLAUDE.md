<!-- CURRENT STATUS BLOCK, added by build run 1 on 2026-10-16. Keep it at the very top of this file. -->
## Current status (2026-10-16): read this first

Divergence.AI is being restarted by its owner, Devan, through build runs. Each build run does one approved slice of work on its own new branch, gets its own Vercel preview link, and is checked by Claude before Devan decides. The owner's decisions and the planned order of runs are in `docs/build-runs/OWNER-DECISIONS.md`. They outrank everything older in this repository.

The site people use today is the Vercel preview of branch `claude/remaining-second-pass-v1` at commit `10894f704a39b6c56a7fadfafb54275b82526c33`. Never push to that branch.

Build run 1 (the foundation) is on branch `build-1`, which starts from that commit. It replaced the Cowork deploy overlay with ordinary source files, made /api/health report only the commit, branch and environment, removed the Developer Mode cost bypass, removed the broken Original/Gold layout picker, and repaired the browser tests.

The next run is run 2 (money: J1 plus the money parts of J9). Do not start it, or any other run, without a run spec and Devan's go ahead. A new run starts from the branch Devan names (normally `build-1` until it is merged) and works on its own new branch.

Rules for any AI working here: never push to a branch that was not created for an approved run; never force-push; never merge, deploy, or change GitHub or Vercel settings; never put API keys anywhere and never call a paid AI API, except a tiny capped connection test against Devan's own prepaid Anthropic credit, run only when Devan turns it on himself, with the replies saved and replayed in later tests so the call is never repeated (ANTHROPIC_API_KEY must not be added to the site's Vercel settings until the money fixes in this run and run 1's bypass removal are live; auto reload stays off); never delete, skip or weaken a test to make it pass; run `scripts/governance/preflight.mjs` and respect its real FAIL findings; it now checks the approved numbered build branch, previous origin tip and ancestry, but is not a passing authorization gate until the stored permissions, authority hash, protected changes and layer/batch state are reconciled.

Governance now executes correctly on Windows. Current original modules: `derive-registries.mjs`, `derive-obligations.mjs`, `verify-evidence.mjs` and `verify-ledger.mjs`: PASS; `verify-protected-paths.mjs` and `preflight.mjs`: FAIL; `stopping-checkpoint.mjs`: FATAL (inherits structural failures); `lib.mjs`: shared library, N/A as a CLI check. Run `node --test scripts/governance/runAll.test.mjs` to guard against silent entry points. Fresh clones must restore the existing local `governance-baseline-ffc6935` from `origin/governance-baseline-ffc6935` before interpreting a missing protected-ref finding. Do not clear failures by dropping assertions.

Everything below this block is the historical record from before 2026-10-16. Its branch names (such as `claude/whole-site-repair-v1`, `codex-verified/layer-3-v2` and `horizontal-layer-completion-v1`), next actions and preflight gates are out of date. Keep it as history; do not follow it.

---

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
