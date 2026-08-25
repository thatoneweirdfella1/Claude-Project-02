# Consolidated user-action queue

Do not stop ongoing work merely because an item is listed here. Continue everything that is not genuinely dependent on it.

## Pending

- **Layer 4 live cross-device storage:** Connect the Upstash Redis resource to the Vercel **Preview** environment for project `claude-project-02`, then redeploy `horizontal-layer-4-implementation-v1`. Fresh Preview deployments `dpl_GGszkqtXfJ9DbSUVAFmHdemc2mTq` and `dpl_6gFpAbbHpYTP1Grom8EngCzq5rnw` returned `configured:false`; secret-safe runtime diagnostics found no Upstash, Redis, or KV variable names. The app accepts either `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` or `KV_REST_API_URL` + `KV_REST_API_TOKEN`.

## Presentation rule

At the final dependency boundary, show the user only the minimum consolidated actions that still require account-owner confirmation. Do not interrupt after each layer or external dependency.
