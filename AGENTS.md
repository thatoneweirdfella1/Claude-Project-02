<!-- CURRENT STATUS BLOCK, added by build run 1 on 2026-10-16. Keep it at the very top of this file. -->
## Current status (2026-10-16): read this first

Divergence.AI is being restarted by its owner, Devan, through build runs. Each build run does one approved slice of work on its own new branch, gets its own Vercel preview link, and is checked by Claude before Devan decides. The owner's decisions and the planned order of runs are in `docs/build-runs/OWNER-DECISIONS.md`. They outrank everything older in this repository.

The site people use today is the Vercel preview of branch `claude/remaining-second-pass-v1` at commit `10894f704a39b6c56a7fadfafb54275b82526c33`. Never push to that branch.

Build run 1 (the foundation) is on branch `build-1`, which starts from that commit. It replaced the Cowork deploy overlay with ordinary source files, made /api/health report only the commit, branch and environment, removed the Developer Mode cost bypass, removed the broken Original/Gold layout picker, and repaired the browser tests.

The next run is run 2 (money: J1 plus the money parts of J9). Do not start it, or any other run, without a run spec and Devan's go ahead. A new run starts from the branch Devan names (normally `build-1` until it is merged) and works on its own new branch.

Rules for any AI working here: never push to a branch that was not created for an approved run; never force-push; never merge, deploy, or change GitHub or Vercel settings; never put API keys anywhere and never call a paid AI API; never delete, skip or weaken a test to make it pass; do not treat `scripts/governance/preflight.mjs` as a gate, because its next action and branch rules are out of date (it stays in the repository until the J8 layer run decides what to do with it).

Everything below this block is the historical record from before 2026-10-16. Its branch names (such as `claude/whole-site-repair-v1`, `codex-verified/layer-3-v2` and `horizontal-layer-completion-v1`), next actions and preflight gates are out of date. Keep it as history; do not follow it.

---

# DIVERGENCE.AI — CLAUDE REPAIR BRANCH

This file applies only to `claude/whole-site-repair-v1`.

Read `CLAUDE.md` first. It is the controlling execution law for this branch.

Claude may inspect, implement, test, run locally, delegate fresh implementation and verification agents, commit, and checkpoint the work-order repairs only on this branch.

Do not modify another branch, merge, deploy, use credentials, call paid providers, spend money, or alter real user data.

If any older file names a different active branch or denies the work expressly authorized by `CLAUDE.md`, this branch-specific file and `CLAUDE.md` control. Product behavior still follows settled user authority; Claude may not invent a redesign.
