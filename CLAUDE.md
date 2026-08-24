# DIVERGENCE.AI governed continuation

This file replaces the obsolete root instruction to work directly on `build`. The preserved old file is identified by hash in `docs/layer-system/PATH-RECONCILIATION.md`.

Before doing anything else:

1. Read `START-HERE-DIVERGENCE.md`.
2. Treat `horizontal-layer-completion-v1` as read-only. If `horizontal-layer-3-implementation-v1` does not exist, run `node scripts/governance/preflight.mjs --action=create_continuation_branch`, create it from the current remote tip of the completed branch, and switch to it.
3. Run `node scripts/governance/preflight.mjs --action=read-only` on `horizontal-layer-3-implementation-v1`.
4. Return the generated Resume Certificate verbatim.

Do not edit until the gate and the exact permission both allow it. Never edit the completed Layer 1–2 branch. Do not invent decisions, select a different branch, weaken tests, alter frozen visuals, merge, deploy, or touch backups.
