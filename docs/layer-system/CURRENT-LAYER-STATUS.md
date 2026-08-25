# Current horizontal-layer status

**Governance state:** LAYER 4 AUTHORIZED AND ACTIVE  
**Verified through Layer 4 application commit:** `1c17d3cee8757240be1c349774ee8f6ff052eaf7`  
**Last implemented horizontal depth:** `L3 — IMPLEMENTED, NOT INDEPENDENTLY PROVEN`  
**Last completed horizontal layer:** `NONE`  
**Active layer:** `L4 — DURABLE`  
**Active coherent batch:** `whole-site durability, identity, recovery, synchronization, and resumable work`  
**Application edits permitted:** `YES — L4 ONLY`  
**Read-only source branch:** `horizontal-layer-3-implementation-v1`  
**Required working branch:** `horizontal-layer-4-implementation-v1`  

## Source checkpoint

Layer 4 starts from finished Layer 3 head `4db777514e50e011fb0887bf283a416e1a34f477`. Layer 3 application checkpoint `94841450b1aedb28f3d144a191ffac2301d03170` passed 75 test files / 664 tests, TypeScript and Vite build, with matching READY deployment `dpl_3CgDffYmJvBvx5ZNBY3EHJSqkpxy`.

## Active Layer 4 checkpoint

Application checkpoint `1c17d3cee8757240be1c349774ee8f6ff052eaf7` implements versioned local recovery, bounded recovery points, durable workspace state, resumable large jobs and evidence, complete schema-v2 export/import with checksum and rollback, a hardened web-account API, conditional-revision remote sync, explicit keep-local / keep-remote / keep-both conflict recovery, request-size limits, hashed-key account throttling, same-origin mutation enforcement, non-cacheable identity/sync responses, and atomic account-plus-remote-data deletion.

Matching Vercel preview `dpl_AhQknjdcuo1T4G4W6ASMojutwYsH` is READY. The build passed 78 test files / 677 tests plus TypeScript and Vite production build. Focused API regressions prove both supported storage variable pairs, fail-closed behavior, rate limiting, mutation-origin rejection, deletion key coverage, authentication enforcement, and stale-revision preservation.

Fresh Preview deployments still return `{"configured":false,"user":null}`. Secret-safe runtime diagnostics on `dpl_6gFpAbbHpYTP1Grom8EngCzq5rnw` found no Upstash, Redis, or KV variable names, proving the resource is not attached to Preview. Local durability remains active and the app makes no remote-success claim.

## Exact current action

Continue every independent Layer 4 regression only on this branch. At the final dependency boundary, attach the Upstash resource to the Vercel Preview environment, redeploy, then run live account creation/login, two-device sync, stale-revision conflict, deletion, migration, and recovery proof. Payments, authoritative allowance/credit/entitlement mutation, external AI providers, BYOK secrets, merge, and production remain denied.

## Completion boundary

Do not claim Layer 4 complete until the full test/build suite and a matching branch preview pass and the governed checkpoint records the exact commit and deployment identity.
