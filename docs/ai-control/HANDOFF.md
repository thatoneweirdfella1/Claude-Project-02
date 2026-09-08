# Handoff Record

**SAFE TO SWITCH: NO**

**Last confirmed remote checkpoint:** `716a16367d7207a7ce87fb3482336ce39bc529f3`

**Active task:** G2 autonomy correction / G3-A trusted controller.

## Current truth

The repository checkout began clean at the exact remote commit above. Integrity passed; existing G3-A tests passed 20/20; course-control tests passed 61/61. The previous recorded lock pointed to `f266842…` with no current heartbeat and was stale relative to the supplied starting commit; no active competing worker was found.

The working tree now contains a deployable, preview-only controller under `control-plane/g3a-controller/`. Repository test entrypoints import the same transition, GitHub-event, and controller-core bytes packaged for deployment. Durable Redis state/queue/lease/retry/dead-letter behavior, exact host identity/SHA validation, GitHub App authentication, separated worker launchers, correction re-audit, and recovery endpoints are implemented. Focused tests pass 27/27.

No Vercel project, deployment, Redis resource, GitHub App, installation, private key, worker credential, live Check Run, ruleset change, enforcement activation, merge, or production change is claimed yet.

## Exact next action

Finish this atomic checkpoint: update hashes and evidence, run focused/integrity/61-control/exact-course checks, commit and push only to `divergence/reliability-staging`, confirm exact remote SHA, then provision the isolated Vercel preview service in `observe` mode. If interrupted before publication, discard no files; resume from this working tree and do not advance to provisioning.

Routine user acceptance is not required. Only a genuinely unavoidable one-time account/security action or unresolved material product decision may be presented to the user.
