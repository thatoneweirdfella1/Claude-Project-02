# DIVERGENCE.AI governed continuation

Stop before editing. Read `START-HERE-DIVERGENCE.md` and follow its read order.

`horizontal-layer-completion-v1` is a completed Layer 1–2 checkpoint and is read-only. Layer 3 work must occur only on `horizontal-layer-3-implementation-v1`, created from the current remote tip of the completed checkpoint branch before any application edit.

If the required Layer 3 branch does not exist, the only permitted command on the completed branch is:

```bash
node scripts/governance/preflight.mjs --action=create_continuation_branch
```

After creating and switching to the exact required branch, use one of the two supported startup gates:

```bash
node scripts/governance/preflight.mjs --action=read-only
```

If the workspace has repository API access but no executable authenticated checkout, do not demand or attempt a clone. Follow `docs/layer-system/API-WORK-MODE.md` and return its Remote Resume Certificate instead. This is the required Work-mode path, not a gate bypass.

Return the applicable Resume Certificate verbatim. Do not edit application behavior unless the startup gate passes, the independent governance audit is recorded as `PASS`, and `docs/layer-system/PERMISSIONS.yml` explicitly grants `modify_application_behavior` for this branch.

Never modify `build`, `frozen-implementation-v1`, a backup branch, `horizontal-layer-completion-v1`, the verified source checkpoint, or another completed layer checkpoint. Never merge, deploy, access secrets, connect a paid provider, or change repository rules unless that exact capability is granted in `PERMISSIONS.yml`.

One horizontal layer and one declared coherent batch may be active. Missing or conflicting facts are recorded; they are not guessed.
