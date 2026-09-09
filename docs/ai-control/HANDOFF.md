# Handoff Record

**SAFE TO SWITCH: NO**

**Last confirmed remote checkpoint:** `83b2fc21c10113df1a8f2c21ab8a7c6daf837944`

**Active task:** G2 autonomy correction / G3-A trusted controller.

## Current truth

The repository checkout began clean at the exact remote commit above. Integrity passed; existing G3-A tests passed 20/20; course-control tests passed 61/61. The previous recorded lock pointed to `f266842…` with no current heartbeat and was stale relative to the supplied starting commit; no active competing worker was found.

The confirmed remote checkpoint contains a deployable, preview-only controller under `control-plane/g3a-controller/`. Repository test entrypoints import the same transition, GitHub-event, and controller-core bytes packaged for deployment. Durable Redis state/queue/lease/retry/dead-letter behavior, exact host identity/SHA validation, GitHub App authentication, separated worker launchers, correction re-audit, and recovery endpoints are implemented. Focused tests pass 27/27; course controls pass 61/61; the exact course gate accepted the 37-path change. Remote tree `38850ee1aebc6cce450e8116055e0881f2896c17` exactly matches the tested local tree.

D-017 retains the isolated unlinked Vercel project as stable non-product controller infrastructure. Authenticated readback reports `target: production` for deployment `dpl_4NLyjv7qFrTSzwxP6JNxr5euUMXF` in project `prj_2tCUMX2TrV6ZIdKQnGDmOXZDPST3`; here that label identifies the permanent environment inside the separate controller project, not the DIVERGENCE.AI product deployment. The project remains `link:null`, controller-only, and inactive pending Redis, App credentials, separated workers, and hostile proof.

## Exact next action

Finish and publish the create-only bootstrap migration checkpoint, deploy those exact bytes to the retained controller project in observe mode, initialize the existing Redis resource exactly once, then execute honest live/local G3A-01 through G3A-10 proof. Keep enforcement inactive and do not modify rulesets.

Routine user acceptance is not required. Only a genuinely unavoidable one-time account/security action or unresolved material product decision may be presented to the user.
