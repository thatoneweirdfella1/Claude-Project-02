# START HERE — DIVERGENCE.AI

This branch contains the durable context for an AI with no prior conversation.

## Identity

- Repository: `thatoneweirdfella1/Claude-Project-02`
- Read-only completed branch: `horizontal-layer-completion-v1`
- Required Layer 3 working branch: `horizontal-layer-3-implementation-v1`
- Minimum completed checkpoint: `52273d6a5f07fcde0dd4353f2d2b1599a3e332ff`
- Protected comparison branches: `build`, `frozen-implementation-v1`
- Last implemented horizontal depth: `L2`
- App implementation permission: `DENIED` until separately granted on the Layer 3 branch

## Mandatory read order

1. `docs/layer-system/CURRENT-LAYER-STATUS.md`
2. `docs/layer-system/PERMISSIONS.yml`
3. `docs/layer-system/HANDOFF.md`
4. `docs/layer-system/SOURCE-CHECKPOINT.json`
5. `docs/layer-system/AUTHORITY-MANIFEST.yml`
6. `docs/authority/USER-CORRECTIONS.md`
7. `docs/authority/DIVERGENCE-AI-CANONICAL-DECISION-AUTHORITY-v2.md`
8. `docs/authority/DIVERGENCE-AI-CONTROL-BEHAVIOR-MAP-v2.md`
9. `docs/layer-system/HORIZONTAL-LAYER-COMPLETION-SYSTEM.md`
10. `docs/layer-system/HYBRID-INDEPENDENT-AUDIT-PROTOCOL.md` and `AUDIT-RESULTS/2026-08-24-hybrid-reconciled.md`.
11. `docs/layer-system/LAYER-OBLIGATION-PROFILES.yml` and the exact row(s) in `LAYER-OBLIGATION-MATRIX.csv`.
12. Only the repair, decision, workflow, test, evidence, and open-defect rows relevant to the one active batch.

## Required first action

If `horizontal-layer-3-implementation-v1` does not exist, remain on `horizontal-layer-completion-v1`, verify its current local and remote tip match, and run:

```bash
node scripts/governance/preflight.mjs --action=create_continuation_branch
```

Create the exact branch `horizontal-layer-3-implementation-v1` from that verified tip and switch to it. Do not edit or advance `horizontal-layer-completion-v1`. Then run, without changing files:

```bash
node scripts/governance/preflight.mjs --action=read-only
```

Return its Resume Certificate verbatim. A structural `PASS` does not prove product behavior and does not grant permission.

## Current exact next action

Create and switch to the required Layer 3 branch if it does not already exist, then run read-only preflight there. Do not begin Layer 3 until a dated Layer 3 application grant is recorded on that new branch.

## Conflict rule

Use explicit scoped authority and supersession. Current code, tests, live behavior, timestamps, and model confidence cannot override approved intent. Record unresolved conflicts in `UNRESOLVED-FINDINGS.md`; continue unrelated work.
