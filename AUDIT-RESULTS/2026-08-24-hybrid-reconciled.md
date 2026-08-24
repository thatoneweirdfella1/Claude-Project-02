# DIVERGENCE.AI Hybrid Reconciled Governance Audit

**Date:** 2026-08-24  
**Source audits:** GPT-5.6 Sol and Claude Sonnet 4.6 post-correction audits  
**Reconciliation method:** `docs/layer-system/HYBRID-INDEPENDENT-AUDIT-PROTOCOL.md`  
**Implementation performed by source auditors:** NO

## Verdict

`FAIL — 23 UNIQUE REQUIRED DEFECTS AT AUDITED CHECKPOINT 7c2a123b7622e00638285d67d0ccb6121dd805df`

Claude's baseline and packet findings overlap GPT findings 9 and 1. The union therefore remains 23, and the stricter supported verdict controls.

## Canonical defect set

1. Audit packet omits mandatory governance components.
2. L0 Coverage Lock is not machine-enforced.
3. No accurate per-ID, per-layer obligation matrix exists.
4. L6 treats a credential blocker as required completion evidence.
5. `verify-evidence.mjs` permits fabricated `PROVEN` records.
6. Acceptance handles lack frozen layer-specific assertions.
7. Independent audit status can be self-declared.
8. Preflight does not implement its claimed contract.
9. Governance baseline can be rewritten to bless governance changes.
10. Secret-file detection does not evaluate configured wildcard patterns.
11. Protected-path policy omits safety-critical code and ignores exceptions.
12. Permissions are not granular enough for later external effects.
13. Active implementation branch is contradicted by governing documents.
14. Existing user-correction provenance violates the required format.
15. L3-to-L4 data transition lacks a migration contract.
16. Cross-device conflict behavior is undefined.
17. Managed-free allowance enforcement begins before its safety layer.
18. Stable preview protection is descriptive, not operational.
19. Usage-cutoff and unsafe-patch recovery remain under-specified.
20. Desktop/Windows remains a prose-only, non-executable track.
21. Fable and Learnable Signal task specifications remain unavailable.
22. `refund` remains an invented payment obligation.
23. Repair coverage contains an impossible denominator.

## Current closure state

The second hybrid reconciliation changes validator architecture, layer obligations, evidence/permission semantics, protected paths, and audit-packet scope. Under the hybrid protocol this requires a clean full independent audit of the new checkpoint. This historical `FAIL` is not rewritten; closure is recorded in a new audit result.

`SAFE FOR A CONTEXTLESS AI AT 7c2a123: NO`
