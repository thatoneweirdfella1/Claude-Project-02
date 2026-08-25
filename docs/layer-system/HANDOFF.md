# Governed handoff

## Current state

- Repository: `thatoneweirdfella1/Claude-Project-02`
- Read-only source branch: `horizontal-layer-3-implementation-v1`
- Working branch: `horizontal-layer-4-implementation-v1`
- Exact Layer 4 source: `4db777514e50e011fb0887bf283a416e1a34f477`
- Layer 3 application checkpoint: `94841450b1aedb28f3d144a191ffac2301d03170`
- Last implemented horizontal depth: L3 — implemented, not independently `PROVEN`
- Active layer/batch: L4 / whole-site durability, identity, recovery, synchronization, and resumable work
- Application changes: authorized for the exact 206-row L4 batch on the Layer 4 branch only

## Implemented Layer 4 checkpoint

- Application commit: `b443fc78ca90d972449f83e9b694480963de22c7`
- Matching READY preview: `dpl_5VxnH9ZU2VXQipnW88RbtLq6CgFm`
- Evidence: 77 test files / 668 tests passed; TypeScript and Vite production build passed
- Implemented: durable local workspace, bounded recovery history, resumable large jobs, versioned/checksummed complete export and atomic rollback import, web account/session API, server-side password hashing and HttpOnly session cookies, conditional remote revisions, and explicit no-loss conflict choices
- Honest preview result: `/api/account` returned `{"configured":false,"user":null}`; local durability is active, remote account storage is not provisioned, and Layer 4 is not complete

## Exact next action

Provision approved durable account storage and connect `UPSTASH_REDIS_REST_URL` plus `UPSTASH_REDIS_REST_TOKEN` through the hosting integration without revealing their values. Then prove account creation, login, cross-device sync, stale-revision conflict preservation, deletion, migration, recovery, and the remaining L4 regressions. Keep all earlier checkpoints read-only.

## Closed effects

Payments, authoritative credit/allowance/entitlement mutation, external AI provider calls, BYOK secrets, repository rules, pull requests, merge, stable promotion, and production deployment remain denied.

## Stop conditions

Stop for wrong repository or branch, source-history mismatch, branch-head movement during a write, missing permission, authority conflict that changes the exact batch, silent overwrite risk, unsupported status promotion, or a required external resource that cannot be provisioned safely. Record scoped decisions and continue unrelated work.
