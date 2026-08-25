# External-dependency deferral protocol

## Purpose

Prevent owner-only external setup from repeatedly stopping implementation or wasting account usage while preserving honest layer claims and safe branch isolation.

## Mandatory behavior

1. If a layer's code/tests are complete but live proof requires a marketplace integration, credential, billing acceptance, provider approval, or owner-only action, mark the layer `IMPLEMENTED_PENDING_EXTERNAL_PROOF`.
2. Keep the affected live path fail-closed. Never fabricate success or promote the layer to complete.
3. Add the owner-only action once to `USER-ACTION-QUEUE.md`; do not repeatedly ask for it.
4. Seal the layer's application checkpoint branch. Create the next numbered layer branch from that exact checkpoint.
5. Continue all later work that can be implemented and tested deterministically without the missing external effect.
6. External-effect permissions remain denied unless explicitly granted. Adapters, simulators, validation, failure handling, and tests may proceed.
7. At the end, perform one consolidated owner setup session, then verify deferred proofs in layer order on matching deployments.
8. If a later task truly depends on missing live data, defer only that task and continue every unrelated obligation.
9. Stop only when no authorized, non-dependent implementation, test, documentation, branch preparation, or verification work remains.

The stable product-depth claim remains the last layer whose full exit gate passed. Provisional later implementation never changes that claim.
