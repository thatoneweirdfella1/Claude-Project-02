# Consolidated user-action queue

Items here are deferred until one consolidated owner setup-and-proof session. They do not block safe implementation of later layers.

## Pending

- **Layer 4 live cross-device storage:** The owner reported the Upstash connection repaired, but fresh Preview deployment `dpl_GjAFFxYr3q9NWrTNNCmYyuBurVX9` at `a27701c78af2ee2ca5744bc87d32b9e74d9e9d99` still returned `configured:false` from `/api/account`. In the consolidated proof session, confirm the Redis resource is connected specifically to Vercel **Preview**, redeploy, then verify two browser contexts observe the same durable account/session data. The app accepts either `UPSTASH_REDIS_REST_URL` + `UPSTASH_REDIS_REST_TOKEN` or `KV_REST_API_URL` + `KV_REST_API_TOKEN`.

## Independent/final verification

- **Layer 5 optional interactive inspection:** Automated proof, build, exact READY Preview identity, HTTP 200, and deployed-bundle markers are recorded. Interactive cloud-browser access was declined and is deferred to the independent/final pass under AGENTS.md; it is not an implementation blocker.

## Presentation rule

Do not present this queue after each layer. Continue provisional later-layer work under EXTERNAL-DEPENDENCY-DEFERRAL.md. Present one minimum action list only after all authorized non-dependent work is exhausted.
