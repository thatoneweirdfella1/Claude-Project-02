# Authenticated GitHub API Work-mode startup gate

Use this path only when the environment has authenticated GitHub repository API access but does not expose an executable authenticated Git checkout. Do not attempt an unauthenticated clone and do not treat the missing clone as a blocker.

## Required read-only checks

Using the connected GitHub repository tools:

1. Resolve repository `thatoneweirdfella1/Claude-Project-02`.
2. Resolve `horizontal-layer-completion-v1`; it must remain the read-only completed Layer 1–2 checkpoint.
3. Resolve `horizontal-layer-3-implementation-v1`; all Layer 3 governance and application writes must target only this branch.
4. Confirm the Layer 3 branch contains commit `df90e4bb8dea73d4ff0c7373fa5f9f7c7aea11d6` in its history.
5. Read `AGENTS.md`, `START-HERE-DIVERGENCE.md`, `CURRENT-LAYER-STATUS.md`, `PERMISSIONS.yml`, `BATCH-SCOPE.json`, and `SOURCE-CHECKPOINT.json` from the Layer 3 branch itself.
6. Confirm the authority hashes using the exact branch contents or the repository's successful structural workflow. If either cannot be confirmed, governance edits may repair the gate but application edits remain blocked.
7. Confirm the requested operation is explicitly allowed in `PERMISSIONS.yml` before performing it.

## Remote Resume Certificate

Return these exact fields before writing:

```text
REMOTE RESUME CERTIFICATE
Repository: thatoneweirdfella1/Claude-Project-02
Read-only source branch: horizontal-layer-completion-v1
Working branch: horizontal-layer-3-implementation-v1
Source head: <exact SHA>
Working head: <exact SHA>
Required ancestor present: df90e4bb8dea73d4ff0c7373fa5f9f7c7aea11d6
Active layer: <value from CURRENT-LAYER-STATUS.md>
Active batch: <value from BATCH-SCOPE.json>
Requested permission: <permission name>
Permission state: <allowed or denied>
Gate: PASS or BLOCKED
```

## Safe remote-write procedure

- Re-read the working-branch head immediately before every commit and use it as the parent/lease. If it changed, stop, reread the changed governance/state, and recompute the patch.
- Create commits only on `horizontal-layer-3-implementation-v1`. Never update, rebase, force-push, or use `horizontal-layer-completion-v1` as a write target.
- Governance authorization and batch activation must be committed before application changes.
- Use repository blob/tree/commit/ref operations or equivalent branch-scoped file updates. An ordinary chat prompt cannot override branch or permission files.
- After each application checkpoint, require the branch deployment/build gate and all relevant tests to pass. A connector write alone is not completion evidence.
- Record completed work, tests, deployment identity, remaining scope, and the exact next action in the governed handoff/state files before yielding.

This protocol replaces only the impossible local-checkout mechanics. It does not weaken scope, evidence, testing, branch isolation, or external-effect restrictions.
