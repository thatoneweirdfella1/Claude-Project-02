# START HERE — DIVERGENCE.AI

This branch contains the durable context for an AI with no prior conversation.

## Identity

- Repository: `thatoneweirdfella1/Claude-Project-02`
- Required branch: `horizontal-layer-completion-v1`
- Verified source checkpoint: `16beca26c305bd9bdae088eb8e977ca1e9730747`
- Protected comparison branches: `build`, `frozen-implementation-v1`
- Last completed horizontal layer: `NONE`
- App implementation permission: `DENIED` until separately granted

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
10. `docs/layer-system/HYBRID-INDEPENDENT-AUDIT-PROTOCOL.md`
11. `AUDIT-RESULTS/2026-08-24-hybrid-reconciled.md`
12. Only the repair, decision, workflow, test, evidence, and defect rows relevant to the one active batch.

## Required first action

Run, without changing files:

```bash
node scripts/governance/preflight.mjs --mode=read-only
```

Return its Resume Certificate verbatim. A structural `PASS` does not prove product behavior and does not grant permission.

## Current exact next action

Continue governance defect closure against the 23 canonical required defects in `AUDIT-RESULTS/2026-08-24-hybrid-reconciled.md`. Preserve the completed GPT-5.6 Sol and Claude Sonnet 4.6 source audits; do not replace them with another mandatory full audit of the unchanged original packet. After corrections, perform delta verification under `HYBRID-INDEPENDENT-AUDIT-PROTOCOL.md`.

Do not change application behavior while governance-only defect closure is active.

## Conflict rule

Use explicit scoped authority and supersession. Current code, tests, live behavior, timestamps, and model confidence cannot override approved intent. Record unresolved conflicts in `UNRESOLVED-FINDINGS.md`; continue unrelated work.
