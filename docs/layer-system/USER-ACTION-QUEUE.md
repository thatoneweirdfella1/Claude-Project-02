# Consolidated user-action queue

Items here are deferred until one consolidated owner setup-and-proof session. They do not block safe implementation of later layers.

## Pending

- **Layer 4 live cross-device storage:** Connect the Upstash Redis resource to the Vercel **Preview** environment for project `claude-project-02`, then redeploy `horizontal-layer-4-implementation-v1`. Fresh Preview deployments `dpl_GGszkqtXfJ9DbSUVAFmHdemc2mTq` and `dpl_6gFpAbbHpYTP1Grom8EngCzq5rnw` returned `configured:false`; secret-safe runtime diagnostics found no Upstash, Redis, or KV variable names. The app accepts either `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` or `KV_REST_API_URL` + `KV_REST_API_TOKEN`.

## Presentation rule

Do not present this queue after each layer. Continue provisional later-layer work under EXTERNAL-DEPENDENCY-DEFERRAL.md. Present one minimum action list only after all authorized non-dependent work is exhausted.
