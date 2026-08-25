# Authenticated GitHub API Work-mode startup gate

Use this path when authenticated GitHub repository API access exists without an executable authenticated checkout.

## Required checks

1. Resolve repository `thatoneweirdfella1/Claude-Project-02`.
2. Resolve read-only source branch `horizontal-layer-4-implementation-v1` containing `cc0a0d541705665d454c1be3968b26af102967d2`.
3. Resolve working branch `horizontal-layer-5-implementation-v1`.
4. Confirm the working branch contains `cc0a0d541705665d454c1be3968b26af102967d2` in its history.
5. Read branch-local `AGENTS.md`, `START-HERE-DIVERGENCE.md`, `CURRENT-LAYER-STATUS.md`, `PERMISSIONS.yml`, `BATCH-SCOPE.json`, and `SOURCE-CHECKPOINT.json`.
6. Confirm the requested operation is allowed. Missing local Git is not a blocker.

## Safe writes

Re-read the working head before every commit and use it as the parent lease. Write only to `horizontal-layer-5-implementation-v1`. Require full tests/build and a matching preview for application checkpoints. Never write an earlier checkpoint branch. Defer external owner actions under `EXTERNAL-DEPENDENCY-DEFERRAL.md` rather than stopping safe work.
