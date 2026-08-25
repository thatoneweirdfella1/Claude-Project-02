# DIVERGENCE.AI governed continuation

Read `START-HERE-DIVERGENCE.md` first.

`horizontal-layer-4-implementation-v1` is the sealed Layer 4 checkpoint and is read-only for application code. Layer 5 work occurs only on `horizontal-layer-5-implementation-v1`, created from exact Layer 4 governance checkpoint `cc0a0d541705665d454c1be3968b26af102967d2`.

Use `docs/layer-system/API-WORK-MODE.md` when no executable authenticated checkout exists. A missing local clone is never a blocker.

Obey `docs/layer-system/EXTERNAL-DEPENDENCY-DEFERRAL.md`: Layer 4's queued Upstash proof does not block deterministic Layer 5 implementation. Preserve honest labels and keep unavailable live effects fail-closed.

Layer 5 may implement and test only deterministic/sandbox allowance, entitlement, checkout, ledger, reservation, reconciliation, release, cap, receipt, and cost-safety behavior. Real charges, payment-provider configuration, production billing, external AI execution, secrets, merge, and production deployment remain forbidden.

Never modify an earlier checkpoint branch. Record checkpoints, tests, preview identity, deferred proof, and the exact next action before yielding.
