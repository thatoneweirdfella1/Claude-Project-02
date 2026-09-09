# Handoff Record

**SAFE TO SWITCH: NO**

**Last confirmed remote checkpoint:** `4d76dbea0ba872ed4426af2a7c4a242ed1beb467`

**Active task:** G2 autonomy correction / G3-A trusted controller.

## Current truth

The repository checkout began clean at the exact remote commit above. Integrity passed; existing G3-A tests passed 20/20; course-control tests passed 61/61. The previous recorded lock pointed to `f266842…` with no current heartbeat and was stale relative to the supplied starting commit; no active competing worker was found.

The confirmed remote checkpoint contains a deployable, preview-only controller under `control-plane/g3a-controller/`. Repository test entrypoints import the same transition, GitHub-event, and controller-core bytes packaged for deployment. Durable Redis state/queue/lease/retry/dead-letter behavior, exact host identity/SHA validation, GitHub App authentication, separated worker launchers, correction re-audit, and recovery endpoints are implemented. Focused tests pass 27/27; course controls pass 61/61; the exact course gate accepted the 37-path change. Remote tree `38850ee1aebc6cce450e8116055e0881f2896c17` exactly matches the tested local tree.

D-017 retains the isolated unlinked Vercel project as stable non-product controller infrastructure. Authenticated readback reports `target: production` for deployment `dpl_4NLyjv7qFrTSzwxP6JNxr5euUMXF` in project `prj_2tCUMX2TrV6ZIdKQnGDmOXZDPST3`; here that label identifies the permanent environment inside the separate controller project, not the DIVERGENCE.AI product deployment. The project remains `link:null`, controller-only, and inactive pending Redis, App credentials, separated workers, and hostile proof.

## Current live proof

The corrected staging checkpoint is `a968bff2ded4db6f1df0ef501da2d0927fcd248c`, with exact tested tree `6c47fdbd79494015cd3ada8f89c0fc286f375034` and controller-source digest `675a965131519111495e877e7d3b95502d213637`. Only `BOOTSTRAP_SECRET` and `CONTROLLER_RELEASE_DIGEST` were replaced. Deployment `dpl_7igFACJPxHH9K19NrLG5AaR6C4rN` is READY and owns the stable controller alias.

The first authenticated bootstrap returned `created:true`; the second returned `created:false`. Post-bootstrap health returns `ok:true`, `mode:observe`, `durable_state_initialized:true`, and `authoritative_enforcement_active:false`, with the exact configured digest. An unsigned live webhook returns HTTP 400 `Invalid webhook signature`.

`AUTHOR_WORKER_URL` and `AUDITOR_WORKER_URL` are absent and remain blocking. No live autonomous worker execution is claimed from local tests.

Remote staging advanced afterward to `b9af1b0b91afabd850d4c6667ccb2887d9027e0f`, but that publication corrupted the continuity ledger and did not prove a successful genuine signed delivery. The bad commit remains visible in history. Recovery restores the current ledger from the last trusted append-only bytes at `a968bff2ded4db6f1df0ef501da2d0927fcd248c`, appends a correction record, and adds safe webhook outcome logging plus valid/duplicate/invalid hostile tests. It does not rewrite history, log payloads, or expose secrets.

Recovery commit `4d76dbea0ba872ed4426af2a7c4a242ed1beb467` is remotely confirmed at exact tree `a33332e934eff1476181b45f79feea0cf17f5e83`. Controller digest `b8a044d14415d97cfe41853548d3ef50d61e00d9` is configured and exact source deployment `dpl_8N5fdgtDovjrrjyHf8e6BubmqALM` is READY. Stable health reports that exact digest with `ok:true`, `mode:observe`, `durable_state_initialized:true`, and `authoritative_enforcement_active:false`.

## Exact next action

Publish this synchronized records-only checkpoint to generate a genuine Hookshot request against the new deployment. Use only safe delivery metadata to diagnose any rejection; then prove a successful genuine delivery and authenticated duplicate redelivery before publishing the final exact hash. Do not begin the independent audit, activate enforcement, merge, change rulesets, or modify product files.

Routine user acceptance is not required. Only a genuinely unavoidable one-time account/security action or unresolved material product decision may be presented to the user.
