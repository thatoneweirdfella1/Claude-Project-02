# Handoff Record

**SAFE TO SWITCH: YES**

**Last confirmed remote checkpoint:** `0f975d7746a59665ba0a9a8b85de5f054e88490f`

**Active task:** G2 autonomy correction / G3-A trusted controller.

## Current truth

The repository checkout began clean at the exact remote commit above. Integrity passed; existing G3-A tests passed 20/20; course-control tests passed 61/61. The previous recorded lock pointed to `f266842…` with no current heartbeat and was stale relative to the supplied starting commit; no active competing worker was found.

The confirmed remote checkpoint contains a deployable, preview-only controller under `control-plane/g3a-controller/`. Repository test entrypoints import the same transition, GitHub-event, and controller-core bytes packaged for deployment. Durable Redis state/queue/lease/retry/dead-letter behavior, exact host identity/SHA validation, GitHub App authentication, separated worker launchers, correction re-audit, and recovery endpoints are implemented. Focused tests pass 27/27; course controls pass 61/61; the exact course gate accepted the 37-path change. Remote tree `38850ee1aebc6cce450e8116055e0881f2896c17` exactly matches the tested local tree.

An isolated unlinked Vercel project was created from the controller package, but it is not compliant and must not be used: the deploy response said preview while authenticated readback reports `target: production` for deployment `dpl_4NLyjv7qFrTSzwxP6JNxr5euUMXF` in project `prj_2tCUMX2TrV6ZIdKQnGDmOXZDPST3`. The project has `link:null`, no configured secrets or Redis, and `/api/health` returns HTTP 503 with `authoritative_enforcement_active:false`. No GitHub App, installation, private key, worker credential, live Check Run, ruleset change, enforcement activation, merge, or product deployment change occurred.

## Exact next action

Remove the incorrectly production-targeted inert Vercel project/deployment and create a verifiably preview-only replacement from exact tree `38850ee1aebc6cce450e8116055e0881f2896c17`. Do not configure the current deployment, provision credentials, register the App, activate enforcement, or modify rulesets until target isolation is proven.

Routine user acceptance is not required. Only a genuinely unavoidable one-time account/security action or unresolved material product decision may be presented to the user.
