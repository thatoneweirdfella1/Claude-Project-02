# START HERE — DIVERGENCE.AI

This branch contains the durable context for an AI with no prior conversation.

## Identity

- Repository: `thatoneweirdfella1/Claude-Project-02`
- Read-only source branch: `horizontal-layer-3-implementation-v1`
- Required Layer 4 working branch: `horizontal-layer-4-implementation-v1`
- Exact source head: `4db777514e50e011fb0887bf283a416e1a34f477`
- Required application ancestor: `94841450b1aedb28f3d144a191ffac2301d03170`
- Active layer: `L4 — Durable`

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
11. `docs/layer-system/LAYER-OBLIGATION-PROFILES.yml` and the L4-applicable matrix rows.
12. `docs/layer-system/L4-DATA-AND-CONFLICT-CONTRACT.md` and only the task-specific authority/evidence rows needed by the active batch.

## Required first action

Use the authenticated GitHub API gate in `docs/layer-system/API-WORK-MODE.md`. Confirm the exact branch and ancestor identities and return the Remote Resume Certificate before writing. All writes target only `horizontal-layer-4-implementation-v1`.

## Current exact action

Implement and verify the active 206-row Layer 4 durability batch. Do not modify any earlier checkpoint branch.

## Conflict rule

Explicit scoped authority wins. Never silently overwrite user data. Preserve recoverable versions, expose conflicts, and require an explicit resolution. Record unresolved authority conflicts and continue unrelated work.
