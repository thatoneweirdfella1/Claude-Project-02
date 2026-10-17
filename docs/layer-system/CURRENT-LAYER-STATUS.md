<!-- CURRENT STATUS BLOCK, added by build run 1 on 2026-10-16. Keep it at the very top of this file. -->
## Current status (2026-10-16): read this first

Divergence.AI is being restarted by its owner, Devan, through build runs. Each build run does one approved slice of work on its own new branch, gets its own Vercel preview link, and is checked by Claude before Devan decides. The owner's decisions and the planned order of runs are in `docs/build-runs/OWNER-DECISIONS.md`. They outrank everything older in this repository.

The site people use today is the Vercel preview of branch `claude/remaining-second-pass-v1` at commit `10894f704a39b6c56a7fadfafb54275b82526c33`. This is the intended live site for Run 1. Never push to that branch. Check live and preview health only as the controlling `DIVERGENCE_BUILD_RUN.md` directs.

Build run 1 (the foundation) is on branch `build-1`, which starts from exact base commit `10894f704a39b6c56a7fadfafb54275b82526c33`. To resume Run 1, use the current tip of `build-1`. It replaced the Cowork deploy overlay with ordinary source files, made /api/health report the commit, branch, and environment, removed the Developer Mode cost bypass, removed the broken Original/Gold layout picker, and repaired the browser tests while recording the hidden Developer Lab controls as a known issue.

After Run 1 is complete, the next run is run 2 (money: J1 plus the money parts of J9). Its exact scope is defined only by that run's controlling `DIVERGENCE_BUILD_RUN.md`; do not infer scope from older notes. Do not start it, or any other run, without that run spec and Devan's go ahead. Start from the current tip of the branch Devan names (normally `build-1` until it is merged), then work on the new branch approved for that run.

Rules for any AI working here: push only to the branch created for an approved run, and only at the checkpoints allowed by that run's controlling spec; never push to `claude/remaining-second-pass-v1`; never force-push; never merge, deploy, or change GitHub or Vercel settings. Do not call a paid AI API unless that run's controlling spec explicitly authorizes it and Devan gives the go ahead for that run. The prepaid testing note in `OWNER-DECISIONS.md` is not authorization by itself, and Run 1 authorizes no paid calls. Never put API keys anywhere; never delete, skip or weaken a test to make it pass. Do not treat `scripts/governance/preflight.mjs` as a gate, because its next action and branch rules are out of date (it stays in the repository until the J8 layer run decides what to do with it).

Everything below this block is the historical record from before 2026-10-16. Its branch names (such as `claude/whole-site-repair-v1`, `codex-verified/layer-3-v2` and `horizontal-layer-completion-v1`), next actions and preflight gates are out of date. Keep it as history; do not follow it.

---

# Current horizontal-layer status

**Governance state:** ACCOUNT 2 FROZEN; CODEX L3 V1 QUARANTINED; CLEAN CODEX V2 AUDIT ACTIVE  
**Active branch:** `codex-verified/layer-3-v2`  
**Trusted source:** `horizontal-layer-completion-v1@df90e4bb8dea73d4ff0c7373fa5f9f7c7aea11d6`  
**Clean branch point:** `c966953bc0377fe978edc630fbdff43965b16e6e`  
**Inherited application depth:** `L2 — IMPLEMENTED, NOT INDEPENDENTLY PROVEN`  
**Formally completed layer:** `NONE`  
**Active layer:** `L3 AUDIT/RECOVERY PREPARATION`  
**Application edits permitted:** `NO — exact Codex-v2 corrective/adoption batch not yet frozen`

## Account 2 preservation

- L3 snapshot: `archive/account2-layer-3-20260825@4db777514e50e011fb0887bf283a416e1a34f477`
- L4 snapshot: `archive/account2-layer-4-20260825@a27701c78af2ee2ca5744bc87d32b9e74d9e9d99`
- L5 snapshot: `archive/account2-layer-5-20260825@92dc92f0ba0f0cf6a8095705f3251995707eca6c`
- Account 2 L6 branch is identical to L5; no L6 implementation exists.

## Quarantined Codex-v1 candidate

- Snapshot: `archive/codex-layer-3-v1-contaminated-20260826@320da68fc06944f15488f208e3ccd91dce000740`
- `codex-verified/layer-3-v1` must be treated as read-only.
- Its Vercel check succeeded, but that does not cure the governance/adoption violation.
- Direct donor-code identity was found in Layer 3 files before an adoption gate, while application/test edits were denied and the batch scope was empty.

See `CODEX-L3-V1-CONTAMINATION-AUDIT-2026-08-26.md`.

## Current audit verdict

Account 2 and Codex-v1 both contain useful donor implementations, tests, defect cases, and fixes. Neither may supply trusted application code to v2 without the defined adoption route. No Layer 3 product-depth claim is promoted yet.

## Exact next action

Complete the per-obligation Layer 3 comparison against the trusted baseline, using donor branches only as evidence/reference. Freeze the smallest honest Codex-v2 implementation/adoption batch, explicitly grant only that batch, then implement and verify it on `codex-verified/layer-3-v2`.
