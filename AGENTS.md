# DIVERGENCE.AI — Codex verified lineage

Read `START-HERE-DIVERGENCE.md` first and follow its complete read order.

The only writable branch for the current audit/recovery phase is `codex-verified/layer-3-v1`. It descends from the Layer 1–2 baseline and must never merge an Account 2 branch.

Before using any Account 2 result, read:

- `docs/layer-system/DUAL-LINEAGE-GOVERNANCE.md`
- `docs/layer-system/ACCOUNT2-WORK-AUDIT-2026-08-25.md`

All `archive/account2-*`, `horizontal-layer-*-implementation-v1`, `horizontal-layer-completion-v1`, `build`, `frozen-implementation-v1`, and backup branches are read-only.

Account 2 code may be inspected only as donor material. It enters this lineage only by independent reimplementation or through a disposable evaluation branch followed by the complete adoption gate. Never merge, rebase, or fast-forward this branch from Account 2 ancestry.

Run the repository preflight when an executable checkout exists. When it does not, use authenticated GitHub API inspection and record that limitation honestly; lack of a local clone does not authorize edits or establish a test pass.

Do not modify application behavior until `PERMISSIONS.yml`, `BATCH-SCOPE.json`, and the governing obligation rows all explicitly authorize the exact Codex batch. Never infer permission from Account 2 records.
