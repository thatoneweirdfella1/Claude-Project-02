# Governed handoff — clean Codex lineage

## Resume point

- Work only on `codex-verified/layer-3-v2`.
- Trusted source is `horizontal-layer-completion-v1@df90e4bb8dea73d4ff0c7373fa5f9f7c7aea11d6`.
- Clean v2 branch point is `c966953bc0377fe978edc630fbdff43965b16e6e`, immediately before the quarantined Layer 3 application commit.
- Read `DUAL-LINEAGE-GOVERNANCE.md`, `CODEX-L3-V1-CONTAMINATION-AUDIT-2026-08-26.md`, and `ACCOUNT2-WORK-AUDIT-2026-08-25.md` first.
- Do not merge, cherry-pick broadly from, rebase onto, or advance any Account 2 branch or the quarantined Codex-v1 candidate.
- Application edits remain closed until the exact Codex-v2 Layer 3 batch is frozen and permissions explicitly grant it.

## Preserved candidates

Account 2 Layer 3, 4, and 5 heads are frozen under `archive/account2-*` refs. Account 2 Layer 6 contains no changes beyond Layer 5.

The previous Codex Layer 3 candidate is frozen at `archive/codex-layer-3-v1-contaminated-20260826@320da68fc06944f15488f208e3ccd91dce000740`. It passed a Vercel status check but cannot be treated as a verified checkpoint because application/test edits were not authorized and donor code was used before the adoption gate.

## Current finding

No layer is formally complete. The trusted source still supplies the inherited Layer 2 implementation state. Account 2 and quarantined Codex-v1 contain useful behavior, tests, fixes, and defect cases, but they are donor evidence only for the clean v2 lineage.

## Exact next action

Map every L3-applicable permanent obligation to: trusted-baseline behavior, donor evidence, genuinely missing/unproved behavior, required evidence, and proposed implementation/adoption route. Freeze only the resulting bounded batch in `BATCH-SCOPE.json`; then and only then grant application/test edits for that batch.
