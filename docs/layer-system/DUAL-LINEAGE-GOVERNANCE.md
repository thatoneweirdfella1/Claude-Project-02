# Dual-lineage isolation governance

**Status:** Active for all work after the Layer 1–2 baseline.

## Trusted source

- Repository: `thatoneweirdfella1/Claude-Project-02`
- Common trusted source: `horizontal-layer-completion-v1@df90e4bb8dea73d4ff0c7373fa5f9f7c7aea11d6`
- Codex active branch: `codex-verified/layer-3-v1`
- Account 2 work is donor/evaluation material, not trusted ancestry.

## Frozen Account 2 snapshots

- Layer 3: `archive/account2-layer-3-20260825@4db777514e50e011fb0887bf283a416e1a34f477`
- Layer 4: `archive/account2-layer-4-20260825@a27701c78af2ee2ca5744bc87d32b9e74d9e9d99`
- Layer 5: `archive/account2-layer-5-20260825@92dc92f0ba0f0cf6a8095705f3251995707eca6c`

These refs are read-only evidence. Never update, rebase, merge into, force-push, or delete them.

## Required lineages

### Account 2 lineage

Account 2 may continue only on branches named `account2/layer-<N>-candidate-v<revision>`. Its next branch must descend from its own last candidate or frozen snapshot, never from a `codex-verified/*` branch.

### Codex verified lineage

Codex work occurs only on `codex-verified/layer-<N>-v<revision>`. Each Codex layer descends only from the prior Codex-verified checkpoint. No Account 2 branch may be merged into this lineage.

### Evaluation branches

Potential Account 2 work is tested on `evaluation/account2-<scope>-onto-codex-<layer>-v<revision>`, created from the relevant Codex checkpoint. Evaluation branches are disposable and can never be called stable or verified.

## Adoption rule

Account 2 changes enter the Codex lineage only through one of these routes:

1. Independent reimplementation from governing requirements; or
2. A narrowly selected patch that receives line-by-line review, requirement mapping, focused tests, the complete layer regression gate, matching-deployment proof where applicable, and an independent audit record.

A passing Account 2 test, green build, Preview, screenshot, status file, or model statement is not adoption evidence.

## Contamination rule

If a Codex layer uses any Account 2 code before the adoption gate passes, that Codex branch is contaminated and cannot become a Codex-verified checkpoint. Discard it or move the work to an evaluation branch.

Research findings, official documentation citations, failing tests, and reproducible defect cases may be reused without inheriting Account 2 Git ancestry. Their correctness must still be checked.

## Rollback rule

Every Codex layer remains permanently addressable by exact commit. A later failure never rewrites an earlier layer. Recovery selects the most recent independently verified Codex checkpoint; it never falls through to Account 2 ancestry.

## Branch router

- Active trusted implementation: `codex-verified/layer-3-v1`
- Read-only trusted predecessor: `horizontal-layer-completion-v1@df90e4bb8dea73d4ff0c7373fa5f9f7c7aea11d6`
- Active Account 2 implementation: none
- Active evaluation branch: none
- Layer 6: not begun in the Codex lineage
