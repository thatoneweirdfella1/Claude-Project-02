# Authenticated GitHub API Work-mode startup gate

Use this path when authenticated GitHub repository API access exists without an executable authenticated checkout.

## Required read-only checks

1. Resolve repository `thatoneweirdfella1/Claude-Project-02`.
2. Resolve read-only source branch `horizontal-layer-3-implementation-v1` at source head `4db777514e50e011fb0887bf283a416e1a34f477`.
3. Resolve working branch `horizontal-layer-4-implementation-v1`.
4. Confirm the working branch contains application checkpoint `94841450b1aedb28f3d144a191ffac2301d03170`.
5. Read `AGENTS.md`, `START-HERE-DIVERGENCE.md`, `CURRENT-LAYER-STATUS.md`, `PERMISSIONS.yml`, `BATCH-SCOPE.json`, and `SOURCE-CHECKPOINT.json` from the Layer 4 branch.
6. Confirm the requested operation is explicitly allowed before performing it.

## Remote Resume Certificate

```text
REMOTE RESUME CERTIFICATE
Repository: thatoneweirdfella1/Claude-Project-02
Read-only source branch: horizontal-layer-3-implementation-v1
Working branch: horizontal-layer-4-implementation-v1
Source head: <exact SHA>
Working head: <exact SHA>
Required ancestor present: 94841450b1aedb28f3d144a191ffac2301d03170
Active layer: <value from CURRENT-LAYER-STATUS.md>
Active batch: <value from BATCH-SCOPE.json>
Requested permission: <permission name>
Permission state: <allowed or denied>
Gate: PASS or BLOCKED
```

## Safe remote-write procedure

- Re-read the working-branch head immediately before every commit and use it as the parent/lease.
- Create commits only on `horizontal-layer-4-implementation-v1`. Never update, overwrite, rebase, force-push, or write to an earlier checkpoint branch.
- Governance authorization and batch activation must precede application changes.
- After each application checkpoint, require the full tests/build and matching branch preview.
- Record the exact completed commit, deployment identity, evidence, remaining scope, and next action before yielding.
