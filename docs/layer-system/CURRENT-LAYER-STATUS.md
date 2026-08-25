# Current horizontal-layer status

**Governance state:** LAYER 4 AUTHORIZED AND ACTIVE  
**Verified through app source commit:** `94841450b1aedb28f3d144a191ffac2301d03170`  
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

Application checkpoint `b443fc78ca90d972449f83e9b694480963de22c7` implements versioned local recovery, bounded recovery points, durable workspace state, resumable large jobs and evidence, complete schema-v2 export/import with checksum and rollback, a secure web-account API, conditional-revision remote sync, and explicit keep-local / keep-remote / keep-both conflict recovery.

Matching Vercel preview `dpl_5VxnH9ZU2VXQipnW88RbtLq6CgFm` is READY. The build passed 77 test files / 668 tests plus TypeScript and Vite production build. The preview account endpoint returned `{"configured":false,"user":null}`, so real account storage and cross-device proof remain pending; the UI fails safely to local recovery and makes no remote-success claim.

## Exact current action

Provision approved durable account storage without exposing secrets, connect the two required server-side storage variables, then run authenticated two-device, conflict, deletion, migration, and recovery proof. Continue the remaining L4 regression matrix only on this branch. Payments, authoritative allowance/credit/entitlement mutation, external AI providers, BYOK secrets, merge, and production remain denied.

## Completion boundary

Do not claim Layer 4 complete until the full test/build suite and a matching branch preview pass and the governed checkpoint records the exact commit and deployment identity.
