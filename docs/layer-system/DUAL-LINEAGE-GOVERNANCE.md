# Dual-lineage isolation governance

**Status:** Active for all work after the Layer 1–2 baseline.

## Trusted source

- Repository: `thatoneweirdfella1/Claude-Project-02`
- Common trusted source: `horizontal-layer-completion-v1@df90e4bb8dea73d4ff0c7373fa5f9f7c7aea11d6`
- Codex active branch: `codex-verified/layer-3-v2`
- Clean Codex-v2 branch point: `c966953bc0377fe978edc630fbdff43965b16e6e`
- Account 2 work and the quarantined Codex-v1 implementation are donor/evaluation material, not trusted implementation ancestry.

## Frozen Account 2 snapshots

- Layer 3: `archive/account2-layer-3-20260825@4db777514e50e011fb0887bf283a416e1a34f477`
- Layer 4: `archive/account2-layer-4-20260825@a27701c78af2ee2ca5744bc87d32b9e74d9e9d99`
- Layer 5: `archive/account2-layer-5-20260825@92dc92f0ba0f0cf6a8095705f3251995707eca6c`

These refs are read-only evidence. Never update, rebase, merge into, force-push, or delete them.

## Quarantined Codex Layer 3 v1

- Candidate snapshot: `archive/codex-layer-3-v1-contaminated-20260826@320da68fc06944f15488f208e3ccd91dce000740`
- Original branch: `codex-verified/layer-3-v1` is read-only from this point forward.
- Reason: Layer 3 application code entered that branch while application/test edits were still denied and `BATCH-SCOPE.json` had no active IDs or allowed paths. Direct donor-code identity was also confirmed before an adoption gate existed. Under the contamination rule, v1 cannot become a Codex-verified checkpoint.

Preserve the v1 candidate because it contains useful repaired code and tests. Treat it exactly like other donor material: evidence and implementation ideas may be inspected, but its application code is not trusted merely because it passed a build or deployment.

## Required lineages

### Account 2 lineage

Account 2 may continue only on branches named `account2/layer-<N>-candidate-v<revision>`. Its next branch must descend from its own last candidate or frozen snapshot, never from a `codex-verified/*` branch.

### Codex verified lineage

Codex work occurs only on `codex-verified/layer-<N>-v<revision>`. Each accepted Codex layer descends only from the prior clean Codex checkpoint. No Account 2 branch or quarantined Codex candidate may be merged into this lineage.

### Evaluation branches

Potential donor work is tested on `evaluation/<donor>-<scope>-onto-codex-<layer>-v<revision>`, created from the relevant clean Codex checkpoint. Evaluation branches are disposable and can never be called stable or verified.

## Adoption rule

Donor changes enter the clean Codex lineage only through one of these routes:

1. Independent reimplementation from governing requirements, without copying donor source; or
2. A narrowly selected patch that receives line-by-line review, requirement mapping, focused tests, the complete layer regression gate, matching-deployment proof where applicable, and an independent audit record before adoption.

A passing donor test, green build, Preview, screenshot, status file, or model statement is not adoption evidence.

## Contamination rule

If a Codex layer uses donor code before the adoption gate passes, that Codex branch is contaminated and cannot become a Codex-verified checkpoint. Preserve it as a read-only candidate/evaluation snapshot and restart the clean lineage from the last uncontaminated checkpoint. Do not rewrite history to make the violation disappear.

Research findings, official documentation citations, failing tests, reproducible defect cases, and behavior descriptions may be reused without inheriting donor Git ancestry. Their correctness must still be checked.

## Rollback rule

Every Codex layer remains permanently addressable by exact commit. A later failure never rewrites an earlier layer. Recovery selects the most recent independently verified clean Codex checkpoint; it never falls through to donor ancestry.

## Branch router

- Active clean implementation/audit: `codex-verified/layer-3-v2`
- Quarantined Codex candidate: `archive/codex-layer-3-v1-contaminated-20260826@320da68fc06944f15488f208e3ccd91dce000740`
- Read-only trusted predecessor: `horizontal-layer-completion-v1@df90e4bb8dea73d4ff0c7373fa5f9f7c7aea11d6`
- Active Account 2 implementation: none
- Active evaluation branch: none
- Layer 4+ in the clean Codex lineage: not begun
