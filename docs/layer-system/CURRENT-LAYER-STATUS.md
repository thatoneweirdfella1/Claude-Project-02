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
