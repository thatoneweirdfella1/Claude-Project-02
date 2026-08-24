# DIVERGENCE.AI governed continuation

Stop before editing. Read `START-HERE-DIVERGENCE.md` and follow its read order.

Required first command:

```bash
node scripts/governance/preflight.mjs --action=read-only
```

Return the generated Resume Certificate verbatim. Do not edit application behavior unless the structural preflight passes, the independent governance audit is recorded as `PASS`, and `docs/layer-system/PERMISSIONS.yml` explicitly grants `modify_application_behavior` for this branch.

Never modify `build`, `frozen-implementation-v1`, a backup branch, the verified source checkpoint, or a completed layer checkpoint. Never merge, deploy, access secrets, connect a paid provider, or change repository rules unless that exact capability is granted in `PERMISSIONS.yml`.

One horizontal layer and one declared coherent batch may be active. Missing or conflicting facts are recorded; they are not guessed.
